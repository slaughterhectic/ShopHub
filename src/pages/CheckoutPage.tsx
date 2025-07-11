import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Lock, ArrowLeft, Edit } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShippingAddress } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Schemas remain the same
const shippingSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  address_line_1: yup.string().required('Address is required'),
  address_line_2: yup.string(),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  postal_code: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
  phone: yup.string().required('Phone number is required'),
});

const paymentSchema = yup.object({
  card_number: yup
    .string()
    .required('Card number is required')
    .matches(/^[0-9]{16}$/, 'Card number must be 16 digits'),
  expiry_date: yup
    .string()
    .required('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Expiry date must be in MM/YY format'),
  cvv: yup
    .string()
    .required('CVV is required')
    .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
  cardholder_name: yup.string().required('Cardholder name is required'),
});

type ShippingFormData = yup.InferType<typeof shippingSchema>;
type PaymentFormData = yup.InferType<typeof paymentSchema>;

export const CheckoutPage: React.FC = () => {
  // FIX: Added 'review' to the step state and state for paymentData
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [shippingData, setShippingData] = useState<ShippingAddress | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null); // Added state for payment data
  const [loading, setLoading] = useState(false);
  
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Corrected code
  const shippingForm = useForm<ShippingFormData>({ // <--- Add this generic type
    resolver: yupResolver(shippingSchema),
    defaultValues: {
      country: 'United States',
    },
  });

  const paymentForm = useForm<PaymentFormData>({ // <--- And add this one too
    resolver: yupResolver(paymentSchema),
  });

  const subtotal = total;
  const shipping = total >= 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const finalTotal = subtotal + shipping + tax;

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep('payment');
  };
  
  // FIX: This function now just validates payment and moves to the review step
  const handlePaymentSubmit = (data: PaymentFormData) => {
    setPaymentData(data);
    setStep('review');
  };
  
  // FIX: All order placement logic is moved into this new handler
  const handlePlaceOrder = async () => {
    if (!user || !shippingData || !paymentData) {
      toast.error('Something went wrong. Please start the checkout process again.');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          status: 'pending',
          payment_status: 'pending',
          shipping_address: shippingData,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      await supabase
        .from('orders')
        .update({ 
          status: 'processing',
          payment_status: 'paid' 
        })
        .eq('id', order.id);

      await clearCart();

      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const steps = ['shipping', 'payment', 'review'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Cart
        </button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step === stepName || (index < steps.indexOf(step))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }
                `}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium capitalize ${
                  step === stepName ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepName}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-8 w-16 h-0.5 ${
                    index < steps.indexOf(step)
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {step === 'shipping' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Shipping Information
                  </h2>
                  <form onSubmit={shippingForm.handleSubmit(handleShippingSubmit)} className="space-y-6">
                    {/* Shipping Inputs remain the same... */}
                    <Input label="Full Name" error={shippingForm.formState.errors.full_name?.message} {...shippingForm.register('full_name')} />
                    <Input label="Address Line 1" error={shippingForm.formState.errors.address_line_1?.message} {...shippingForm.register('address_line_1')} />
                    <Input label="Address Line 2 (Optional)" error={shippingForm.formState.errors.address_line_2?.message} {...shippingForm.register('address_line_2')} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="City" error={shippingForm.formState.errors.city?.message} {...shippingForm.register('city')} />
                      <Input label="State" error={shippingForm.formState.errors.state?.message} {...shippingForm.register('state')} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Postal Code" error={shippingForm.formState.errors.postal_code?.message} {...shippingForm.register('postal_code')} />
                      <Input label="Country" error={shippingForm.formState.errors.country?.message} {...shippingForm.register('country')} />
                    </div>
                    <Input label="Phone Number" type="tel" error={shippingForm.formState.errors.phone?.message} {...shippingForm.register('phone')} />
                    <Button type="submit" className="w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </div>
              )}

              {step === 'payment' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Payment Information
                  </h2>
                  {/* FIX: Form now calls handlePaymentSubmit */}
                  <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-6">
                    {/* Payment Inputs remain the same... */}
                    <Input label="Cardholder Name" error={paymentForm.formState.errors.cardholder_name?.message} {...paymentForm.register('cardholder_name')} />
                    <Input label="Card Number" placeholder="1234567890123456" icon={<CreditCard className="w-5 h-5 text-gray-400" />} error={paymentForm.formState.errors.card_number?.message} {...paymentForm.register('card_number')} />
                    <div className="grid grid-cols-2 gap-6">
                      <Input label="Expiry Date" placeholder="MM/YY" error={paymentForm.formState.errors.expiry_date?.message} {...paymentForm.register('expiry_date')} />
                      <Input label="CVV" placeholder="123" error={paymentForm.formState.errors.cvv?.message} {...paymentForm.register('cvv')} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-2 text-sm text-gray-600">
                        <Lock className="w-4 h-4" />
                        <span>Your payment information is secure and encrypted.</span>
                    </div>
                    <div className="flex space-x-4">
                      <Button type="button" variant="outline" onClick={() => setStep('shipping')} className="flex-1">
                        Back to Shipping
                      </Button>
                       {/* FIX: Button text and purpose changed */}
                      <Button type="submit" className="flex-1">
                        Continue to Review
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* FIX: Added the entire review step UI */}
              {step === 'review' && shippingData && paymentData && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Review Your Order
                  </h2>
                  <div className="space-y-6">
                    {/* Shipping Details Review */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">Shipping To:</h3>
                        <button onClick={() => setStep('shipping')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                          <Edit className="w-4 h-4 mr-1" /> Change
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <p>{shippingData.full_name}</p>
                        <p>{shippingData.address_line_1}</p>
                        {shippingData.address_line_2 && <p>{shippingData.address_line_2}</p>}
                        <p>{shippingData.city}, {shippingData.state} {shippingData.postal_code}</p>
                      </div>
                    </div>
                    
                    {/* Payment Details Review */}
                    <div className="border border-gray-200 rounded-lg p-4">
                       <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">Payment Method:</h3>
                        <button onClick={() => setStep('payment')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                          <Edit className="w-4 h-4 mr-1" /> Change
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 flex items-center space-x-3">
                         <CreditCard className="w-6 h-6 text-gray-500" />
                         <div>
                            <p>Card ending in **** {paymentData.card_number.slice(-4)}</p>
                            <p>Expires {paymentData.expiry_date}</p>
                         </div>
                      </div>
                    </div>

                    {/* Final Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep('payment')} className="flex-1">
                        Back to Payment
                      </Button>
                      <Button onClick={handlePlaceOrder} loading={loading} className="flex-1">
                        {loading ? 'Placing Order...' : `Place Order & Pay $${finalTotal.toFixed(2)}`}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
             <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
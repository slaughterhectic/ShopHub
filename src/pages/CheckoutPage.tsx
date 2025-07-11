/* src/pages/CheckoutPage.tsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShippingAddress } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/* -------------------------------------------------------------------------- */
/*  Validation Schemas                                                        */
/* -------------------------------------------------------------------------- */

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
  card_number: yup.string().required('Card number is required'),
  expiry_date: yup.string().required('Expiry date is required'),
  cvv: yup.string().required('CVV is required'),
  cardholder_name: yup.string().required('Cardholder name is required'),
});

type ShippingFormData = yup.InferType<typeof shippingSchema>;
type PaymentFormData = yup.InferType<typeof paymentSchema>;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export const CheckoutPage: React.FC = () => {
  /* ------------------------------ Local State ----------------------------- */
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingData, setShippingData] = useState<ShippingAddress | null>(null);
  const [loading, setLoading] = useState(false);

  /* -------------------------------- Stores -------------------------------- */
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  /* ---------------------------- React‑Hook‑Form --------------------------- */
  const shippingForm = useForm<ShippingFormData>({
    resolver: yupResolver(shippingSchema),
    defaultValues: { country: 'United States' },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: yupResolver(paymentSchema),
  });

  /* ---------------------------- Order Totals ------------------------------ */
  const subtotal = total;
  const shipping = total >= 50 ? 0 : 9.99;
  const tax = Number((total * 0.08).toFixed(2));
  const finalTotal = Number((subtotal + shipping + tax).toFixed(2));

  /* ------------------------------------------------------------------------ */
  /*  Handlers                                                                */
  /* ------------------------------------------------------------------------ */

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep('payment');
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!user || !shippingData) return;

    setLoading(true);

    try {
      /* ---------------------------- Create Order --------------------------- */
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          status: 'processing',
          payment_status: 'paid',
          shipping_address: shippingData,        // column type JSONB
        })
        .select()
        .single();

      if (orderError) throw orderError;

      /* -------------------------- Create Order Items ----------------------- */
      const orderItems = items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        quantity,
        price: product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      /* ----------------------- Simulate Payment Delay ---------------------- */
      await new Promise((res) => setTimeout(res, 2000));

      /* --------------------------- Clear & Navigate ------------------------ */
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------- Route Guards ----------------------------- */
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /*  Render                                                                  */
  /* ------------------------------------------------------------------------ */

  const steps = ['shipping', 'payment'] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate('/cart')}
          className="mb-6 flex items-center text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Cart
        </button>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center space-x-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s || i < steps.indexOf(step)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`ml-2 text-sm font-medium capitalize ${
                  step === s ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`ml-8 h-0.5 w-16 ${
                    i < steps.indexOf(step) ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* ------------------------------ Left ------------------------------ */}
          <div className="lg:col-span-8">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              {/* -------------------------- Shipping -------------------------- */}
              {step === 'shipping' && (
                <>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Shipping Information
                  </h2>

                  <form
                    onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}
                    className="space-y-6"
                  >
                    <Input
                      label="Full Name"
                      error={shippingForm.formState.errors.full_name?.message}
                      {...shippingForm.register('full_name')}
                    />

                    <Input
                      label="Address Line 1"
                      error={
                        shippingForm.formState.errors.address_line_1?.message
                      }
                      {...shippingForm.register('address_line_1')}
                    />

                    <Input
                      label="Address Line 2 (Optional)"
                      error={
                        shippingForm.formState.errors.address_line_2?.message
                      }
                      {...shippingForm.register('address_line_2')}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Input
                        label="City"
                        error={shippingForm.formState.errors.city?.message}
                        {...shippingForm.register('city')}
                      />

                      <Input
                        label="State"
                        error={shippingForm.formState.errors.state?.message}
                        {...shippingForm.register('state')}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Input
                        label="Postal Code"
                        error={
                          shippingForm.formState.errors.postal_code?.message
                        }
                        {...shippingForm.register('postal_code')}
                      />

                      <Input
                        label="Country"
                        error={shippingForm.formState.errors.country?.message}
                        {...shippingForm.register('country')}
                      />
                    </div>

                    <Input
                      label="Phone Number"
                      type="tel"
                      error={shippingForm.formState.errors.phone?.message}
                      {...shippingForm.register('phone')}
                    />

                    <Button type="submit" className="w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </>
              )}

              {/* --------------------------- Payment -------------------------- */}
              {step === 'payment' && (
                <>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Payment Information
                  </h2>

                  <form
                    onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)}
                    className="space-y-6"
                  >
                    <Input
                      label="Cardholder Name"
                      error={
                        paymentForm.formState.errors.cardholder_name?.message
                      }
                      {...paymentForm.register('cardholder_name')}
                    />

                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      icon={<CreditCard className="h-5 w-5 text-gray-400" />}
                      error={paymentForm.formState.errors.card_number?.message}
                      {...paymentForm.register('card_number')}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="Expiry Date"
                        placeholder="MM/YY"
                        error={paymentForm.formState.errors.expiry_date?.message}
                        {...paymentForm.register('expiry_date')}
                      />

                      <Input
                        label="CVV"
                        placeholder="123"
                        error={paymentForm.formState.errors.cvv?.message}
                        {...paymentForm.register('cvv')}
                      />
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Lock className="h-4 w-4" />
                        <span>Your payment information is secure</span>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('shipping')}
                        className="flex-1"
                      >
                        Back to Shipping
                      </Button>
                      <Button
                        type="submit"
                        loading={loading}
                        className="flex-1"
                      >
                        Place Order
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* ----------------------------- Right ----------------------------- */}
          <div className="mt-8 lg:col-span-4 lg:mt-0">
            <div className="sticky top-8 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Order Summary
              </h2>

              {/* ----------------------- Item List ----------------------- */}
              <div className="mb-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty:&nbsp;{item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* --------------------- Totals --------------------- */}
              <div className="mb-6 space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ------------- Display Shipping Preview ------------- */}
              {shippingData && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="mb-2 font-medium text-gray-900">Shipping To:</h3>
                  <div className="text-sm text-gray-600">
                    <p>{shippingData.full_name}</p>
                    <p>{shippingData.address_line_1}</p>
                    {shippingData.address_line_2 && (
                      <p>{shippingData.address_line_2}</p>
                    )}
                    <p>
                      {shippingData.city}, {shippingData.state}{' '}
                      {shippingData.postal_code}
                    </p>
                    <p>{shippingData.country}</p>
                    <p>Phone: {shippingData.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

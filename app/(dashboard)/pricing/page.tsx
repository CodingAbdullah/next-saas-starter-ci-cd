import { Check } from 'lucide-react';
import { checkoutAction } from '@/lib/payments/actions';
import { SubmitButton } from './submit-button';

// Replace these with your actual Polar.sh product IDs from your dashboard
const POLAR_PRODUCT_IDS = {
  base: 'product_base_plan', // Replace with actual Polar.sh product ID
  plus: 'product_plus_plan', // Replace with actual Polar.sh product ID
};

export default function PricingPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600">
          Simple pricing for teams of all sizes
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
        <PricingCard
          name="Base"
          price={8}
          interval="month"
          trialDays={14}
          features={[
            'Unlimited Usage',
            'Unlimited Workspace Members',
            'Email Support',
          ]}
          productId={POLAR_PRODUCT_IDS.base}
        />
        <PricingCard
          name="Plus"
          price={12}
          interval="month"
          trialDays={14}
          features={[
            'Everything in Base, and:',
            'Early Access to New Features',
            '24/7 Support + Slack Access',
          ]}
          productId={POLAR_PRODUCT_IDS.plus}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  productId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  productId: string;
}) {
  return (
    <div className="pt-6 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        ${price}{' '}
        <span className="text-xl font-normal text-gray-600">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="productId" value={productId} />
        <SubmitButton />
      </form>
    </div>
  );
}
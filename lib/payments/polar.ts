import { Polar } from '@polar-sh/sdk';

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

// Checkout link for Polar.sh
export const createCheckoutLink = async (productId: string) => {
  try {
    const checkout = await polar.checkouts.create({
      products: [productId], // Polar expects an array of product IDs
      successUrl: `${process.env.BASE_URL}/dashboard`
      // Polar handles the checkout flow and redirects back
    });
    
    return checkout.url;
  } catch (error) {
    console.error('Failed to create Polar checkout:', error);
    throw error;
  }
};
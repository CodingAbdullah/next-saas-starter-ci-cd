'use server';

import { redirect } from 'next/navigation';
import { createCheckoutLink } from './polar';

export async function checkoutAction(formData: FormData) {
  const productId = formData.get('productId') as string;
  
  if (!productId) {
    throw new Error('Product ID is required');
  }

  try {
    const checkoutUrl = await createCheckoutLink(productId);
    redirect(checkoutUrl);
  } catch (error) {
    console.error('Checkout failed:', error);
    throw error;
  }
}
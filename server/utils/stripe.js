import Stripe from 'stripe';
import { payments } from 'getconfig';

const stripe = Stripe(payments.secretKey);

export async function createPayment({
  token,
  email,
  address,
  name,
  amount,
  description
}) {
  try {
    const customer = await stripe.customers.create({
      source: token.id,
      email,
      shipping: {
        address,
        name
      }
    });
    debugger;
    const charge = await stripe.charges.create({
      amount,
      description,
      currency: 'usd',
      customer: customer.id
    });

    return charge;
  } catch (err) {
    throw err;
  }
}

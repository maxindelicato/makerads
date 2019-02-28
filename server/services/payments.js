import { createPayment } from '../utils/stripe';

export function createPaymentForAdDesign({
  token,
  email,
  address,
  name,
  amount = 500,
  description = 'Ad design'
}) {
  return createPayment({
    token,
    email: token.email,
    address,
    name,
    amount,
    description
  });
}

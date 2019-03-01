var config = require('getconfig');
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function doIt() {
  const { id } = await createCustomer({
    email: '',
    currency: 'usd'
  });
  const payment = await createPayment({ customerId: id, productPrice: 5000 });
}

export async function createCustomer({ email }) {
  try {
    const customer = await stripe.customers.create({
      email
    });
    const { id } = customer;
    console.log('stripe: created customer', id);
    return { id };
  } catch (err) {
    console.error('stripe: failed to create customer');
    console.error(err);
    throw err;
  }
}

export async function createPayment({
  productPrice,
  quantity = 3,
  customerId
}) {
  try {
    // create invoice line item
    await stripe.invoiceItems.create({
      customer: customerId,
      quantity,
      unit_amount: productPrice,
      currency: 'usd',
      description: '1 month Promoted Ad'
    });
    // invoice line item will automatically be
    // applied to this invoice
    const payment = await stripe.invoices.create({
      customer: customerId,
      billing: 'send_invoice',
      auto_advance: true,
      days_until_due: 7
    });
    console.log('stripe: created charge');
    return payment;
  } catch (err) {
    console.error('stripe: failed to create charge');
    console.error(err);
    throw err;
  }
}

doIt();

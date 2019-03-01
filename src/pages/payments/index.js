import './payments.css';

import React, { useEffect, useState } from 'react';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import logo from '../../images/logo.png';

const PAYMENT_CONFIG_OPTS = {
  key: process.env.STRIPE_KEY,
  image: logo,
  locale: 'auto'
};

const PAYMENT_CHECKOUT_OPTS = {
  name: 'MakerAds',
  zipCode: true,
  billingAddress: true,
  currency: 'usd',
  description: 'Ad Design',
  amount: 500
};

let callback;
let onClose;
let onToken = (t, args) => callback(t, args);
let handler;
if (typeof window !== 'undefined' && window.StripeCheckout) {
  handler = window.StripeCheckout.configure({
    ...PAYMENT_CONFIG_OPTS,
    closed: () => onClose(),
    token: onToken
  });
}

function doCheckout() {
  handler.open(PAYMENT_CHECKOUT_OPTS);
}

const PaymentForm = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  useEffect(() => {
    onClose = () => {};
  });

  callback = (token, args) => {
    const address = {
      city: args.billing_address_city,
      country: args.billing_address_country,
      line1: args.billing_address_line1,
      line2: args.billing_address_line2,
      state: args.billing_address_state,
      postal_code: args.billing_address_zip
    };
    sendPayment({
      token,
      address,
      name: args.billing_name
    })
      .then(() => setPaymentStatus(true))
      .catch(err => setPaymentStatus(err));
  };

  let paymentResult = null;

  if (paymentStatus === true) {
    paymentResult = (
      <p>
        Thank you for your purchase! We will let you know when your ad is ready.
      </p>
    );
  } else if (paymentStatus) {
    paymentResult = <pre>{paymentStatus}</pre>;
  }

  return (
    <Layout footer={false} title="Ad Design Payments">
      <SEO />
      <main>
        <div className="payments">
          <div className="payments-header">
            <p>Don't have enough time to make your advert?</p>
            <p>Our designers will make you one for $5!</p>
          </div>
          <form className="payments-form">
            <button
              type="button"
              className="pay-btn button button-primary button-block button-shadow"
              onClick={() => {
                doCheckout();
              }}
            >
              Pay $5
            </button>
            <p className="payments-footnote">
              Secured by{' '}
              <a href="https://stripe.com/docs/security/stripe">Stripe</a>
            </p>
          </form>
          {paymentResult}
        </div>
      </main>
    </Layout>
  );
};

export default PaymentForm;

function sendPayment({ token, address, name }) {
  const url = `/api/payments`;
  return fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ token, address, name })
  })
    .then(resp => resp.json())
    .catch(err => {
      console.log('payment err');
      throw err;
    });
}

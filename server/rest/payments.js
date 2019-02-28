import { Router } from 'express';
import { createPaymentForAdDesign } from '../services/payments';

const payments = new Router();
payments.post('/payments', async (req, res) => {
  try {
    const { token, email, address, name } = req.body;
    const payment = await createPaymentForAdDesign({
      token,
      address,
      name
    });
    res.send(payment);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

export default payments;

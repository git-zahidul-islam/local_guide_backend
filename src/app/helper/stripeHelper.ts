import Stripe from 'stripe';
import config from '../../config';

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2023-10-16',
});

export default stripe;
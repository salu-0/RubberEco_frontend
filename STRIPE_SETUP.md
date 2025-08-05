# Stripe Payment Integration Setup

## Current Status
The application is currently running in **Demo Mode** with payment simulation. To enable real Stripe payments, follow the setup instructions below.

## Setting Up Stripe Payment Links

### 1. Create a Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a Stripe account
3. Complete the account verification process

### 2. Create Payment Links
1. Log into your Stripe Dashboard
2. Navigate to **Products** → **Payment Links**
3. Click **Create Payment Link**
4. Configure your payment link:
   - **Product Name**: Training Course Enrollment
   - **Price**: Set as variable (customers can enter amount)
   - **Currency**: INR (Indian Rupees)
   - **Payment Methods**: Enable Card payments
   - **Collect Customer Information**: Enable email collection

### 3. Configure Success/Cancel URLs
In your payment link settings:
- **Success URL**: `https://yourdomain.com/training-payment-success?moduleId={CHECKOUT_SESSION_ID}`
- **Cancel URL**: `https://yourdomain.com/training?cancelled=true`

### 4. Get Your Payment Link ID
After creating the payment link, you'll get a URL like:
`https://buy.stripe.com/test_XXXXXXXXXXXXXXXXXX`

The part after `test_` is your payment link ID.

### 5. Update the Code
In `src/components/Farmer/TrainingRegistration.jsx`, replace the demo code:

```javascript
// Replace this line:
const stripeBaseUrl = 'https://buy.stripe.com/test_YOUR_PAYMENT_LINK_ID';

// With your actual payment link ID:
const stripeBaseUrl = 'https://buy.stripe.com/test_cNi3cu0tf3Erc5k260'; // Your actual ID
```

Then uncomment the actual Stripe integration code and comment out the demo simulation.

### 6. Environment Variables (Recommended)
Create a `.env` file in your project root:

```env
REACT_APP_STRIPE_PAYMENT_LINK=test_YOUR_PAYMENT_LINK_ID
```

Then update the code to use:
```javascript
const stripeBaseUrl = `https://buy.stripe.com/${process.env.REACT_APP_STRIPE_PAYMENT_LINK}`;
```

### 7. Test Mode vs Live Mode
- **Test Mode**: Use `test_` prefixed payment links for development
- **Live Mode**: Use live payment links for production (requires business verification)

### 8. Webhook Setup (Optional but Recommended)
For production, set up webhooks to handle payment confirmations:
1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`

## Current Demo Mode Features
- ✅ Payment simulation with user confirmation
- ✅ Success/cancel flow testing
- ✅ Enrollment data persistence
- ✅ Course access after "payment"
- ✅ User registration tracking

## Production Checklist
- [ ] Create Stripe account
- [ ] Set up payment links
- [ ] Update payment link ID in code
- [ ] Test with Stripe test cards
- [ ] Set up webhooks (recommended)
- [ ] Switch to live mode for production
- [ ] Update success/cancel URLs to production domain

## Support
For Stripe integration issues, refer to:
- [Stripe Payment Links Documentation](https://stripe.com/docs/payment-links)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)

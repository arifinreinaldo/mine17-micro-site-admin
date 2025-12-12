# Stripe Integration Quick Reference

## Installation

```bash
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
```

## Environment Variables

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_123...
STRIPE_SECRET_KEY=sk_test_456...
STRIPE_WEBHOOK_SECRET=whsec_789...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_123...
```

## File Structure

```
src/lib/stripe.ts                    ✅ Client SDK
src/lib/stripe-server.ts             ✅ Server SDK
src/types/stripe.ts                  ✅ Types
src/assets/PricingCard.tsx           ✅ Component
src/assets/SubscriptionManagement.tsx ✅ Component
src/app/api/stripe/route.ts          ⏳ TODO
src/app/api/stripe-webhook/route.ts  ⏳ TODO
src/app/api/cancel-subscription/route.ts ⏳ TODO
src/app/dashboard/pricing/page.tsx   ⏳ TODO
```

## API Endpoints

### POST /api/stripe
Create checkout session

**Request:**
```json
{
  "priceId": "price_...",
  "planName": "pro"
}
```

**Response:**
```json
{
  "sessionId": "cs_..."
}
```

### POST /api/stripe-webhook
Stripe webhook handler (automatic)

**Events Handled:**
- `checkout.session.completed` - Payment successful
- `customer.subscription.updated` - Plan changed
- `customer.subscription.deleted` - Cancelled
- `invoice.payment_succeeded` - Renewal payment
- `invoice.payment_failed` - Payment failed

### POST /api/cancel-subscription
Cancel user's subscription

**Response:**
```json
{
  "message": "Subscription will be cancelled...",
  "subscription": {...}
}
```

## Common Tasks

### Check if User is Pro
```typescript
if (user.prefs?.membership === 'pro') {
  // Show pro features
}
```

### Trigger Upgrade
```typescript
const { sessionId } = await fetch('/api/stripe', {
  method: 'POST',
  body: JSON.stringify({
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    planName: 'pro'
  })
}).then(r => r.json());

const stripe = await stripePromise;
stripe.redirectToCheckout({ sessionId });
```

### Cancel Subscription
```typescript
await fetch('/api/cancel-subscription', {
  method: 'POST'
});
```

## Test Cards

| Card Type | Number |
|-----------|--------|
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |
| Auth Required | 4000 0025 0000 3155 |

Use any future date and 3-digit CVC.

## Stripe Dashboard Links

- **API Keys**: https://dashboard.stripe.com/apikeys
- **Products**: https://dashboard.stripe.com/products
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Customers**: https://dashboard.stripe.com/customers

## Important: Webhook Setup

1. Go to Webhooks in Stripe Dashboard
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/stripe-webhook`
4. Select events (see above)
5. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

## Important: Update Membership

When webhook receives `checkout.session.completed`, update user:

```typescript
const user = await account.get();
await account.updatePrefs({
  ...user.prefs,
  membership: 'pro',
  stripeCustomerId: session.customer,
  stripeSubscriptionId: session.subscription,
});
```

## Debugging

### Check if API route exists
```bash
curl -X POST http://localhost:3000/api/stripe \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_test"}'
```

### Test webhook locally
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger checkout.session.completed
```

### Check Stripe logs
https://dashboard.stripe.com/logs

## Common Errors

| Error | Solution |
|-------|----------|
| "Invalid API key" | Check STRIPE_SECRET_KEY in .env |
| "No such price" | Verify price ID exists in Stripe Dashboard |
| "Signature verification failed" | Check STRIPE_WEBHOOK_SECRET |
| "Unauthorized" | User session is invalid or expired |
| "Customer not found" | Ensure stripeCustomerId is stored |

## Production Checklist

- [ ] Switch from test keys to live keys
- [ ] Update webhook endpoint to production URL
- [ ] Test full payment flow
- [ ] Enable email notifications
- [ ] Setup monitoring/alerts
- [ ] Review security settings
- [ ] Backup subscription data
- [ ] Document process with team

## Documentation Files

- **STRIPE_SETUP.md** - Detailed setup guide
- **STRIPE_IMPLEMENTATION.md** - Complete implementation guide
- **STRIPE_SUMMARY.md** - Project overview
- **STRIPE_QUICK_REFERENCE.md** - This file

## Next Steps

1. Run `npm install stripe @stripe/react-stripe-js @stripe/stripe-js`
2. Get Stripe credentials from https://dashboard.stripe.com
3. Create the 3 API routes (code in STRIPE_IMPLEMENTATION.md)
4. Create pricing page (code in STRIPE_IMPLEMENTATION.md)
5. Update .env.local with credentials
6. Configure webhook endpoint
7. Update AuthContext with membership logic
8. Test with test cards
9. Deploy to production
10. Switch to live keys

---

**Last Updated**: 2024  
**For detailed info, see STRIPE_IMPLEMENTATION.md**

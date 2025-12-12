# Stripe Integration Architecture Diagram

## Payment Flow

```
┌─────────────────┐
│   User Views    │
│  Pricing Page   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│        PricingCard Component            │
│ (src/assets/PricingCard.tsx)           │
│                                         │
│  • Shows Pro Plan: $9.99/month         │
│  • Features list                        │
│  • "Upgrade to Pro" button             │
└────────┬────────────────────────────────┘
         │ Click Upgrade
         ▼
┌─────────────────────────────────────────┐
│  POST /api/stripe                       │
│  (Create Checkout Session)              │
│                                         │
│  Request: {                             │
│    priceId: "price_...",               │
│    planName: "pro"                      │
│  }                                      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Stripe Backend                         │
│                                         │
│  1. Create Checkout Session            │
│  2. Return sessionId                    │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Client: Redirect to Checkout           │
│                                         │
│  stripe.redirectToCheckout({           │
│    sessionId: "cs_..."                 │
│  })                                     │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Stripe Hosted Checkout Page            │
│                                         │
│  • User enters card details             │
│  • Confirms billing information         │
│  • Completes payment                    │
└────────┬────────────────────────────────┘
         │ Payment Successful
         ▼
┌─────────────────────────────────────────┐
│  Stripe Webhook Event                   │
│  checkout.session.completed             │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  POST /api/stripe-webhook               │
│  (Webhook Handler)                      │
│                                         │
│  1. Verify signature                    │
│  2. Parse event                         │
│  3. Update user membership              │
│  4. Log subscription details            │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Appwrite (User Preferences)            │
│                                         │
│  Update user.prefs:                     │
│  {                                      │
│    membership: "pro",                   │
│    stripeCustomerId: "cus_...",         │
│    stripeSubscriptionId: "sub_..."      │
│  }                                      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  User Redirected to Dashboard           │
│  /dashboard/pets?session_id={...}      │
│                                         │
│  Dashboard now shows:                   │
│  ✓ PRO badge in header                 │
│  ✓ Unlimited pet feature               │
│  ✓ Cancel subscription button           │
└─────────────────────────────────────────┘
```

## System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                                  │
│                    (Next.js + React)                               │
│                                                                    │
│  ┌──────────────────────┐      ┌──────────────────────┐          │
│  │  PricingCard.tsx     │      │ SubscriptionMgmt.tsx │          │
│  │  - Display pricing   │      │ - Cancel button      │          │
│  │  - Upgrade button    │      │ - Status display     │          │
│  └──────────┬───────────┘      └──────────┬───────────┘          │
│             │                             │                      │
│             └─────────────┬───────────────┘                      │
│                           │                                       │
│  ┌────────────────────────▼──────────────────────┐               │
│  │      stripe.ts (Utilities)                   │               │
│  │  - stripePromise                            │               │
│  │  - PRICING_PLANS config                     │               │
│  │  - Types                                     │               │
│  └─────────────────────────────────────────────┘               │
│                                                                 │
└────────────────────┬───────────────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
        ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│  /api/stripe    │      │ /api/stripe-     │
│  (Checkout)     │      │  webhook         │
│                 │      │  (Events)        │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         └────────┬───────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                    SERVER SIDE                                  │
│                  (Next.js API Routes)                           │
│                                                                 │
│  ┌────────────────────────────────────┐                        │
│  │  stripe-server.ts                  │                        │
│  │  - Stripe SDK instance             │                        │
│  │  - Secret key (secure)             │                        │
│  └────────────────────────────────────┘                        │
│                                                                 │
└────────────────────┬──────────────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
        ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│ Stripe Backend  │      │  Appwrite        │
│                 │      │  (Database)      │
│ - Payment       │      │                  │
│ - Sessions      │      │ - User Prefs     │
│ - Subscriptions │      │ - Membership     │
│ - Webhooks      │      │ - Stripe IDs     │
└─────────────────┘      └──────────────────┘
```

## File Structure

```
mine17-micro-site-admin/
├── src/
│   ├── lib/
│   │   ├── stripe.ts .......................... ✅ Client SDK config
│   │   ├── stripe-server.ts .................. ✅ Server SDK config
│   │   ├── appwrite.ts
│   │   └── appwrite-server.ts
│   │
│   ├── types/
│   │   ├── stripe.ts ......................... ✅ Stripe types
│   │   ├── pet.ts
│   │   └── auth.ts
│   │
│   ├── assets/
│   │   ├── PricingCard.tsx ................... ✅ Pricing display
│   │   └── SubscriptionManagement.tsx ........ ✅ Subscription UI
│   │
│   ├── context/
│   │   └── AuthContext.tsx (needs update)
│   │
│   └── app/
│       ├── api/
│       │   ├── stripe/
│       │   │   └── route.ts ................. ⏳ TODO
│       │   │
│       │   ├── stripe-webhook/
│       │   │   └── route.ts ................. ⏳ TODO
│       │   │
│       │   └── cancel-subscription/
│       │       └── route.ts ................. ⏳ TODO
│       │
│       └── dashboard/
│           ├── pricing/
│           │   └── page.tsx ................. ⏳ TODO
│           ├── pets/
│           │   └── page.tsx (show PRO badge when membership='pro')
│           └── layout.tsx (add pricing link)
│
├── package.json ........................... ✅ Updated
├── .env.example ........................... ✅ Updated
└── STRIPE_*.md files ...................... ✅ Documentation
```

## Data Flow Diagram

```
User Request
    │
    ▼
┌──────────────────────┐
│ Authentication Check │
│ (useAuth hook)       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Is User Logged In?                  │
└──────┬──────────────────────┬────────┘
       │                      │
      YES                     NO
       │                      │
       ▼                      ▼
┌──────────────────┐   ┌─────────────┐
│ Show Dashboard   │   │ Redirect    │
│ with Upgrade BTN │   │ to /login   │
└──────┬───────────┘   └─────────────┘
       │
       │ Click Upgrade
       ▼
┌──────────────────────────────────────┐
│ Validate Authentication              │
│ (session check in /api/stripe)       │
└──────┬──────────────────────┬────────┘
       │                      │
    VALID                   INVALID
       │                      │
       ▼                      ▼
┌──────────────────┐   ┌──────────────┐
│ Create Session   │   │ Return 401   │
│ at Stripe        │   │ Unauthorized │
└──────┬───────────┘   └──────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Redirect to Stripe Checkout          │
│ (stripe.redirectToCheckout)          │
└──────┬──────────────────────┬────────┘
       │                      │
    SUCCESS                 FAILED
       │                      │
       ▼                      ▼
┌──────────────────┐   ┌──────────────┐
│ User Pays        │   │ Show Error   │
│ (Stripe hosted)  │   │ Message      │
└──────┬───────────┘   └──────────────┘
       │
       │ Payment Completed
       ▼
┌──────────────────────────────────────┐
│ Stripe Webhook                       │
│ checkout.session.completed           │
└──────┬──────────────────────┬────────┘
       │                      │
    VERIFIED               INVALID
       │                      │
       ▼                      ▼
┌──────────────────┐   ┌──────────────┐
│ Update User      │   │ Log Error    │
│ membership='pro' │   │ Ignore event │
└──────┬───────────┘   └──────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Appwrite Update User Prefs           │
│ {                                    │
│   membership: 'pro',                 │
│   stripeCustomerId: 'cus_...',       │
│   stripeSubscriptionId: 'sub_...'    │
│ }                                    │
└──────┬──────────────────────┬────────┘
       │                      │
    SUCCESS                 FAILED
       │                      │
       ▼                      ▼
┌──────────────────┐   ┌──────────────┐
│ User Redirected  │   │ Log Error    │
│ to Dashboard     │   │ Manual fix   │
│ Shows PRO badge  │   │ required     │
└──────────────────┘   └──────────────┘
```

## Webhook Event Processing

```
Stripe Webhook Received
        │
        ▼
┌───────────────────────────────────────────┐
│  Verify Signature                        │
│  stripe.webhooks.constructEvent()        │
└───────┬─────────────────────┬────────────┘
        │                     │
      VALID                 INVALID
        │                     │
        ▼                     ▼
┌──────────────────┐   ┌──────────────┐
│ Parse Event      │   │ Return 400   │
│ Check Type       │   │ Invalid Sig  │
└───────┬──────────┘   └──────────────┘
        │
        │
    ┌───┴───┬────────────┬──────────────┬──────────────┐
    │       │            │              │              │
    ▼       ▼            ▼              ▼              ▼
┌─────┐┌────────┐┌──────────┐┌────────────┐┌────────────┐
│sess ││payment ││subscription│payment    │subscription│
│comp ││success ││updated    │failed     │deleted     │
└──┬──┘└───┬────┘└─────┬─────┘└─────┬─────┘└─────┬─────┘
   │       │           │            │            │
   │       │           │            │            │
   └───┬───┴───┬───────┴─┬──────────┴────────┬───┘
       │       │        │                   │
       ▼       ▼        ▼                   ▼
    Update  Log      Log              Downgrade
    User   Success  Update           User to
    to Pro                           Free Tier
```

## Component Interaction

```
Dashboard Layout
    │
    ├─ Navigation
    │   └─ "Pricing" link
    │
    ├─ If membership != 'pro':
    │   └─ PricingCard component
    │       ├─ Display Pro plan details
    │       ├─ Show features
    │       └─ Upgrade button
    │           └─ Calls /api/stripe
    │               └─ Redirects to Stripe Checkout
    │
    └─ If membership == 'pro':
        └─ SubscriptionManagement component
            ├─ Show PRO status
            ├─ Display current plan
            └─ Cancel button
                └─ Calls /api/cancel-subscription
                    └─ Marks for cancellation at period end
```

## Security Layers

```
Client (Browser)
    │
    ├─ Public Key ........................... SAFE (pk_test_...)
    │   └─ Used for Stripe.js
    │
    └─ Never sees Secret Key
        └─ Only on server
        
Server (Next.js)
    │
    ├─ Secret Key ......................... SECURE (sk_test_...)
    │   └─ Used for payment processing
    │
    ├─ Webhook Secret ..................... SECURE (whsec_...)
    │   └─ Verify webhook authenticity
    │
    └─ User Authentication Required
        ├─ Check session exists
        ├─ Verify user ID
        └─ Validate Appwrite token

External (Stripe)
    │
    ├─ Secure Payment Processing
    ├─ PCI Compliance
    └─ Webhook Delivery (HTTPS only)
```

---

**All diagrams represent the Stripe integration architecture prepared for Mine17 application.**

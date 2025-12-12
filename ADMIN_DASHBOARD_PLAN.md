# Admin Dashboard - User Location Analytics Plan

## Overview
Create an admin-only dashboard to view and analyze user registration locations across the platform.

---

## 1. Admin Role Management

### Option A: Simple Role-Based (Recommended for MVP)
Store admin role in user preferences:
```typescript
user.prefs = {
  role: 'admin' | 'user',  // Default: 'user'
  // ... other prefs
}
```

**Pros:**
- ✅ Quick to implement
- ✅ No additional database setup
- ✅ Works with existing Appwrite setup

**Cons:**
- ❌ Manual admin assignment via Appwrite Console
- ❌ No built-in audit trail

### Option B: Admin Collection (Advanced)
Create separate Appwrite collection for admins:
```typescript
Collection: 'admins'
{
  userId: string,
  email: string,
  addedBy: string,
  addedAt: timestamp,
  permissions: string[]
}
```

**Pros:**
- ✅ Better audit trail
- ✅ Scalable permission system
- ✅ Can add/remove admins from UI

**Cons:**
- ❌ More complex setup
- ❌ Requires additional Appwrite collection

### **Recommendation:** Start with Option A (Simple Role-Based)

---

## 2. Admin Route Protection

### Implementation Strategy

**Create Admin Guard Hook:**
```typescript
// src/hooks/useAdminGuard.ts
export function useAdminGuard() {
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.prefs?.role !== 'admin') {
      router.push('/dashboard/pets'); // Redirect non-admins
    }
  }, [user, router]);
  
  return { isAdmin: user?.prefs?.role === 'admin' };
}
```

**Protected Admin Layout:**
```typescript
// src/app/admin/layout.tsx
export default function AdminLayout({ children }) {
  const { isAdmin } = useAdminGuard();
  
  if (!isAdmin) return null; // Or loading spinner
  
  return <div>{children}</div>;
}
```

---

## 3. Dashboard Features

### Phase 1: Basic Analytics (MVP)

#### A. User Registration Map
**Display:**
- Interactive map showing user registration locations
- Pins/markers for each country/city
- Hover to see user count

**Tech Stack:**
- **Leaflet.js** (free, open-source) or **Google Maps API**
- React map component: `react-leaflet`

**Data Display:**
```typescript
interface LocationStats {
  country: string;
  countryCode: string;
  city: string;
  userCount: number;
  latitude: number;
  longitude: number;
  users: {
    id: string;
    name: string;
    email: string;
    registeredAt: string;
  }[];
}
```

#### B. Statistics Cards
1. **Total Users**
   - Total registered users count
   - Growth trend (optional)

2. **Top Countries**
   - Bar chart showing top 5 countries
   - User count per country

3. **Top Cities**
   - List of top 10 cities
   - User count per city

4. **Recent Registrations**
   - Table of last 10 users
   - Name, email, location, date

#### C. User Location Table
**Columns:**
- User Name
- Email
- Registration Country
- Registration City
- Registration Date
- IP Address (optional, for admin only)

**Features:**
- Search by name/email
- Filter by country
- Sort by date
- Export to CSV

---

### Phase 2: Advanced Analytics (Future)

1. **Time-based Analysis**
   - Registration trends over time
   - Peak registration hours/days
   - Growth charts

2. **Geographic Insights**
   - Heatmap of user density
   - Regional distribution pie chart
   - Country comparison

3. **User Details Modal**
   - Click on user → show full details
   - Registration info
   - Pet count
   - Last activity

4. **Filtering & Search**
   - Date range picker
   - Multi-country filter
   - Advanced search

---

## 4. Route Structure

```
/admin                          → Admin dashboard home
  /analytics                    → Location analytics page
    - Map view
    - Statistics cards
    - User location table
  /users                        → User management (future)
  /settings                     → Admin settings (future)
```

---

## 5. Data Fetching Strategy

### Option A: Server-Side API Route (Recommended)
```typescript
// src/app/api/admin/users/route.ts
export async function GET(request: NextRequest) {
  // 1. Verify admin role from session
  const session = await getSession(request);
  if (session.prefs?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // 2. Fetch all users with location data
  const { users } = createAdminClient();
  const allUsers = await users.list([Query.limit(5000)]);
  
  // 3. Extract and aggregate location data
  const locationData = aggregateUserLocations(allUsers);
  
  return NextResponse.json(locationData);
}
```

**Pros:**
- ✅ Secure (uses server-side API key)
- ✅ Can fetch all users
- ✅ Processes data server-side

### Option B: Client-Side with Pagination
**Pros:**
- ✅ Real-time updates
- ✅ Better UX with loading states

**Cons:**
- ❌ Limited by Appwrite client permissions
- ❌ May hit rate limits

### **Recommendation:** Use Server-Side API Route (Option A)

---

## 6. UI/UX Design

### Admin Dashboard Layout
```
┌─────────────────────────────────────────────┐
│ [Logo] Mine17 Admin    [Notifications] [👤] │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Dashboard   👥 Users   📍 Analytics     │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 1,234    │  │ 45       │  │ 89       │ │
│  │ Users    │  │ Countries│  │ Cities   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │                                     │  │
│  │        Interactive Map              │  │
│  │   (User registration locations)     │  │
│  │                                     │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Top Countries                              │
│  🇸🇬 Singapore     ████████████ 450        │
│  🇲🇾 Malaysia      ██████ 230              │
│  🇮🇩 Indonesia     ████ 120                │
│                                             │
│  Recent Registrations                       │
│  ┌─────────────────────────────────────┐  │
│  │ Name    Email        Location  Date │  │
│  │ John    john@...     SG         ... │  │
│  │ Mary    mary@...     MY         ... │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 7. Technology Stack

### Required Libraries
```json
{
  "dependencies": {
    "react-leaflet": "^4.2.1",        // Map component
    "leaflet": "^1.9.4",               // Map library
    "recharts": "^2.10.3",             // Charts/graphs
    "date-fns": "^3.0.0",              // Date formatting
    "lucide-react": "^0.300.0"         // Icons (optional)
  }
}
```

### Alternative Map Libraries
- **Google Maps**: More features, requires API key, paid
- **Mapbox**: Modern, customizable, free tier available
- **Leaflet**: Free, open-source, good for basic needs ✅

---

## 8. Security Considerations

### Access Control Checklist
- ✅ Verify admin role on every API request
- ✅ Use server-side API routes for data fetching
- ✅ Never expose admin API key to client
- ✅ Log admin actions (who accessed what, when)
- ✅ Implement rate limiting for admin routes
- ✅ Add CSRF protection

### Data Privacy
- ⚠️ **IP addresses**: Consider masking or not displaying
- ⚠️ **User emails**: Truncate or mask for privacy
- ⚠️ **Location data**: City-level only (no precise coordinates)
- ✅ Add "Admin Access Log" for transparency

---

## 9. Implementation Steps

### Step 1: Setup Admin Role (1-2 hours)
1. ✅ Add role checking utility function
2. ✅ Create admin guard hook
3. ✅ Test role verification
4. ✅ Manually assign admin role via Appwrite Console

### Step 2: Create Admin Layout (1 hour)
1. ✅ Create `/admin` route structure
2. ✅ Implement protected layout
3. ✅ Add admin navigation
4. ✅ Style admin header/sidebar

### Step 3: Fetch User Data (2-3 hours)
1. ✅ Create server-side API route
2. ✅ Implement admin authentication check
3. ✅ Fetch all users with preferences
4. ✅ Aggregate location data
5. ✅ Format response for frontend

### Step 4: Build Analytics Dashboard (4-6 hours)
1. ✅ Install map library (Leaflet)
2. ✅ Create statistics cards component
3. ✅ Implement interactive map
4. ✅ Build user location table
5. ✅ Add search/filter functionality

### Step 5: Add Charts (2-3 hours)
1. ✅ Install chart library (Recharts)
2. ✅ Create country distribution chart
3. ✅ Create registration timeline chart
4. ✅ Add responsive design

### Step 6: Testing & Polish (2-3 hours)
1. ✅ Test admin access control
2. ✅ Test with large datasets
3. ✅ Mobile responsive design
4. ✅ Error handling
5. ✅ Loading states

**Total Estimated Time: 12-18 hours**

---

## 10. Quick Start Implementation

### Minimal MVP (4-5 hours)
Focus on essentials only:

1. ✅ **Admin role check** - 30 min
2. ✅ **Protected route** - 30 min
3. ✅ **API to fetch users** - 1 hour
4. ✅ **Simple table view** - 1 hour
5. ✅ **Basic statistics cards** - 1 hour
6. ✅ **Country filter** - 30 min

**Skip for MVP:**
- ❌ Interactive map (add later)
- ❌ Charts/graphs (add later)
- ❌ Advanced filters (add later)
- ❌ Export functionality (add later)

---

## 11. Sample API Response

```json
{
  "summary": {
    "totalUsers": 1234,
    "totalCountries": 45,
    "totalCities": 89,
    "recentSignups": 23
  },
  "countries": [
    {
      "country": "Singapore",
      "countryCode": "SG",
      "userCount": 450,
      "percentage": 36.5
    },
    {
      "country": "Malaysia", 
      "countryCode": "MY",
      "userCount": 230,
      "percentage": 18.6
    }
  ],
  "cities": [
    {
      "city": "Singapore",
      "country": "Singapore",
      "userCount": 450
    }
  ],
  "recentUsers": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "location": {
        "city": "Singapore",
        "country": "Singapore"
      },
      "registeredAt": "2024-12-11T05:00:00Z"
    }
  ]
}
```

---

## 12. Future Enhancements

### Phase 3: Advanced Features
1. **Real-time Updates**
   - WebSocket connection for live user registrations
   - Auto-refresh dashboard

2. **Email Notifications**
   - Daily/weekly admin digest
   - Alert for unusual registration patterns

3. **Data Export**
   - CSV export of user data
   - PDF reports generation

4. **Comparison Tools**
   - Compare time periods
   - Growth rate calculations
   - Regional performance metrics

5. **User Management**
   - Ban/suspend users
   - Delete accounts
   - Reset passwords
   - Send bulk emails

---

## 13. Cost Considerations

### Free Options:
- ✅ Leaflet (maps) - Free
- ✅ Recharts (charts) - Free
- ✅ Appwrite (hosting data) - Free tier sufficient

### Paid Options (Optional):
- 💰 Google Maps - $200/month for heavy use
- 💰 Mapbox - $50/month for heavy use
- 💰 Advanced analytics tools

**Recommendation:** Start with free options (Leaflet + Recharts)

---

## 14. Security Best Practices

```typescript
// Example: Admin API Route with Security
export async function GET(request: NextRequest) {
  // 1. Check authentication
  const session = await account.get();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Check admin role
  if (session.prefs?.role !== 'admin') {
    // Log unauthorized access attempt
    console.warn(`Unauthorized admin access attempt by: ${session.email}`);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 3. Rate limiting (implement with Redis or simple counter)
  const rateLimitOk = await checkRateLimit(session.$id);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  // 4. Log admin action
  await logAdminAction({
    adminId: session.$id,
    action: 'VIEW_USER_ANALYTICS',
    timestamp: new Date(),
    ip: request.headers.get('x-forwarded-for')
  });
  
  // 5. Fetch and return data
  const data = await fetchUserAnalytics();
  return NextResponse.json(data);
}
```

---

## Questions to Decide

1. **Who should be admin?**
   - [ ] Manually assigned via Appwrite Console
   - [ ] First user is auto-admin
   - [ ] Admin invite system

2. **What data to show?**
   - [ ] Registration location only ✅
   - [ ] Last login location (currently removed)
   - [ ] IP addresses (privacy concern)

3. **Access level:**
   - [ ] View only ✅ (Recommended for MVP)
   - [ ] Edit users
   - [ ] Delete users

4. **Map provider:**
   - [ ] Leaflet (free) ✅
   - [ ] Google Maps (paid)
   - [ ] Mapbox (freemium)

---

## Next Steps

1. **Approve this plan** and decide on:
   - Admin role management approach (Option A or B)
   - MVP scope (minimal or full featured)
   - Map library choice

2. **Set up admin role:**
   - Assign your account as admin in Appwrite Console
   - Test role checking

3. **Start implementation:**
   - Begin with Step 1 (Admin Role Setup)
   - Progress through steps sequentially

---

**Would you like me to proceed with implementation? If yes, please confirm:**
- ✅ Use simple role-based admin (Option A)
- ✅ Start with MVP features only
- ✅ Use Leaflet for maps
- ✅ Skip last login tracking (only registration location)

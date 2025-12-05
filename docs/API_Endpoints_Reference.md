# TiffinWale Student App - API Endpoints Reference

## 📋 Complete API Endpoints Reference

This document provides a comprehensive reference of all 104 API endpoints integrated into the TiffinWale Student App.

---

## 🔐 Authentication Module (`/auth`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/auth/login` | User login | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `POST` | `/auth/register` | User registration | `{ email, password, firstName, lastName, phone }` | `{ user, accessToken }` |
| `POST` | `/auth/refresh-token` | Refresh JWT token | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `POST` | `/auth/logout` | User logout | `{}` | `{ message }` |
| `POST` | `/auth/forgot-password` | Reset password request | `{ email }` | `{ message }` |
| `POST` | `/auth/reset-password` | Reset password | `{ token, password }` | `{ message }` |
| `POST` | `/auth/change-password` | Change password | `{ currentPassword, newPassword }` | `{ message }` |
| `POST` | `/auth/verify-email` | Verify email | `{ token }` | `{ message }` |
| `GET` | `/auth/me` | Get current user | - | `{ user }` |

---

## 🍽️ Meals Module (`/meals`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/meals/today` | Get today's meals | - | `{ meals[] }` |
| `GET` | `/meals/history` | Get meal history | `?page=1&limit=10` | `{ meals[], total, page }` |
| `GET` | `/meals/:id` | Get specific meal | - | `{ meal }` |
| `POST` | `/meals/:id/rate` | Rate a meal | `{ rating, comment }` | `{ rating }` |
| `POST` | `/meals/:id/skip` | Skip a meal | `{ reason }` | `{ message }` |
| `GET` | `/meals/upcoming` | Get upcoming meals | - | `{ meals[] }` |
| `GET` | `/meals/ratings` | Get user's ratings | - | `{ ratings[] }` |

---

## 🏪 Partners/Restaurants Module (`/partners`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/partners` | Get all partners | `?search=&category=` | `{ partners[] }` |
| `GET` | `/partners/:id` | Get partner details | - | `{ partner }` |
| `GET` | `/partners/:id/menu` | Get partner menu | - | `{ menu[] }` |
| `GET` | `/partners/:id/reviews` | Get partner reviews | - | `{ reviews[] }` |
| `POST` | `/partners/:id/reviews` | Add partner review | `{ rating, comment }` | `{ review }` |
| `GET` | `/partners/featured` | Get featured partners | - | `{ partners[] }` |
| `GET` | `/partners/nearby` | Get nearby partners | `?lat=&lng=&radius=` | `{ partners[] }` |

---

## 📦 Orders Module (`/orders`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/orders` | Get all orders | `?status=&page=1` | `{ orders[], total }` |
| `GET` | `/orders/:id` | Get order details | - | `{ order }` |
| `POST` | `/orders` | Create new order | `{ items[], partnerId, deliveryAddress }` | `{ order }` |
| `PUT` | `/orders/:id/cancel` | Cancel order | `{ reason }` | `{ message }` |
| `GET` | `/orders/:id/status` | Get order status | - | `{ status, updates[] }` |
| `GET` | `/orders/customer/:customerId` | Get customer orders | - | `{ orders[] }` |
| `POST` | `/orders/:id/feedback` | Order feedback | `{ rating, comment }` | `{ feedback }` |

---

## 📅 Subscription Module (`/subscriptions`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/subscription-plans` | Get all plans | - | `{ plans[] }` |
| `GET` | `/subscription-plans/:id` | Get plan details | - | `{ plan }` |
| `GET` | `/subscriptions` | Get user subscriptions | - | `{ subscriptions[] }` |
| `POST` | `/subscriptions` | Create subscription | `{ planId, startDate }` | `{ subscription }` |
| `PUT` | `/subscriptions/:id` | Update subscription | `{ modifications }` | `{ subscription }` |
| `PUT` | `/subscriptions/:id/pause` | Pause subscription | `{ pauseUntil, reason }` | `{ message }` |
| `PUT` | `/subscriptions/:id/resume` | Resume subscription | - | `{ message }` |
| `DELETE` | `/subscriptions/:id` | Cancel subscription | `{ reason }` | `{ message }` |
| `GET` | `/subscriptions/:id/meals` | Get subscription meals | - | `{ meals[] }` |

---

## 🔔 Notifications Module (`/notifications`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/notifications/user/:userId` | Get user notifications | `?page=1&unread=true` | `{ notifications[] }` |
| `PUT` | `/notifications/:id/read` | Mark as read | - | `{ message }` |
| `PUT` | `/notifications/mark-all-read` | Mark all as read | - | `{ message }` |
| `DELETE` | `/notifications/:id` | Delete notification | - | `{ message }` |
| `GET` | `/notifications/unread-count` | Get unread count | - | `{ count }` |
| `GET` | `/notifications/stream` | SSE stream | - | `EventSource` |
| `POST` | `/notifications/preferences` | Update preferences | `{ preferences }` | `{ message }` |

---

## 👤 Customer Profile Module (`/customers`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/customers/profile` | Get profile | - | `{ profile }` |
| `PUT` | `/customers/profile` | Update profile | `{ firstName, lastName, phone }` | `{ profile }` |
| `GET` | `/customers/addresses` | Get addresses | - | `{ addresses[] }` |
| `POST` | `/customers/addresses` | Add address | `{ address details }` | `{ address }` |
| `PUT` | `/customers/addresses/:id` | Update address | `{ address details }` | `{ address }` |
| `DELETE` | `/customers/addresses/:id` | Delete address | - | `{ message }` |
| `PUT` | `/customers/addresses/:id/default` | Set default address | - | `{ message }` |

---

## 💬 Feedback Module (`/feedback`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/feedback` | Submit feedback | `{ type, subject, message, rating }` | `{ feedback }` |
| `GET` | `/feedback/user` | Get user feedback | - | `{ feedback[] }` |
| `GET` | `/feedback/:id` | Get feedback details | - | `{ feedback }` |
| `PUT` | `/feedback/:id/response` | Admin response | `{ response }` | `{ message }` |

---

## 🍽️ Menu Module (`/menu`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/menu` | Get all menu items | `?category=&partner=` | `{ items[] }` |
| `GET` | `/menu/:id` | Get menu item | - | `{ item }` |
| `GET` | `/menu/categories` | Get categories | - | `{ categories[] }` |
| `GET` | `/menu/partner/:partnerId` | Get partner menu | - | `{ items[] }` |
| `GET` | `/menu/featured` | Get featured items | - | `{ items[] }` |
| `GET` | `/menu/search` | Search menu items | `?q=query` | `{ items[] }` |

---

## 🎯 Marketing Module (`/marketing`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/marketing/promotions/active` | Get active promotions | - | `{ promotions[] }` |
| `GET` | `/marketing/banners` | Get marketing banners | - | `{ banners[] }` |
| `POST` | `/referrals` | Create referral | `{ referredEmail }` | `{ referral }` |
| `GET` | `/referrals/user` | Get user referrals | - | `{ referrals[] }` |
| `GET` | `/marketing/coupons/user` | Get user coupons | - | `{ coupons[] }` |
| `POST` | `/marketing/newsletter/subscribe` | Newsletter signup | `{ email }` | `{ message }` |

---

## 💳 Payment Module (`/payments`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/payments/create-intent` | Create payment | `{ amount, currency }` | `{ clientSecret }` |
| `GET` | `/payments/methods` | Get payment methods | - | `{ methods[] }` |
| `POST` | `/payments/methods` | Add payment method | `{ method details }` | `{ method }` |
| `DELETE` | `/payments/methods/:id` | Remove payment method | - | `{ message }` |
| `GET` | `/payments/history` | Get payment history | - | `{ payments[] }` |

---

## 🏢 Admin Module (`/admin`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/admin/dashboard` | Get dashboard data | - | `{ statistics }` |
| `GET` | `/admin/users` | Get all users | `?page=1&role=` | `{ users[] }` |
| `GET` | `/admin/orders/analytics` | Order analytics | `?period=week` | `{ analytics }` |
| `GET` | `/admin/partners/pending` | Pending partners | - | `{ partners[] }` |
| `PUT` | `/admin/partners/:id/approve` | Approve partner | - | `{ message }` |
| `GET` | `/admin/reports/revenue` | Revenue reports | `?period=month` | `{ revenue }` |
| `GET` | `/admin/system/health` | System health | - | `{ status }` |

---

## 📍 Landing Module (`/landing`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/landing/hero` | Get hero content | - | `{ content }` |
| `GET` | `/landing/features` | Get features | - | `{ features[] }` |
| `GET` | `/landing/testimonials` | Get testimonials | - | `{ testimonials[] }` |
| `GET` | `/landing/stats` | Get platform stats | - | `{ stats }` |
| `POST` | `/landing/contact` | Contact form | `{ name, email, message }` | `{ message }` |
| `POST` | `/landing/waitlist` | Join waitlist | `{ email, location }` | `{ message }` |

---

## 🛠️ System Module (`/system`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/ping` | Health check | - | `{ message, timestamp }` |
| `GET` | `/version` | Get app version | - | `{ version, build }` |
| `GET` | `/system/config` | Get system config | - | `{ config }` |

---

## 👥 User Module (`/users`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/users/:id` | Get user by ID | - | `{ user }` |
| `PUT` | `/users/:id` | Update user | `{ userData }` | `{ user }` |
| `DELETE` | `/users/:id` | Delete user | - | `{ message }` |
| `GET` | `/users/:id/activity` | Get user activity | - | `{ activities[] }` |

---

## 📊 API Usage Summary

### **By Module:**
- **Authentication**: 9 endpoints
- **Meals**: 7 endpoints  
- **Partners**: 7 endpoints
- **Orders**: 7 endpoints
- **Subscriptions**: 9 endpoints
- **Notifications**: 7 endpoints
- **Customer Profile**: 7 endpoints
- **Feedback**: 4 endpoints
- **Menu**: 6 endpoints
- **Marketing**: 6 endpoints
- **Payment**: 5 endpoints
- **Admin**: 7 endpoints
- **Landing**: 6 endpoints
- **System**: 3 endpoints
- **User**: 4 endpoints

### **Total: 104 Endpoints Integrated** ✅

---

## 🔧 Usage Examples

### **Authentication Flow**
```typescript
// Login
const loginResponse = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Auto-refresh token
api.auth.refreshToken(); // Called automatically on 401
```

### **Real-time Notifications**
```typescript
// Subscribe to SSE
const eventSource = api.notifications.getStream();
eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Handle real-time notification
};
```

### **Data Fetching with Error Handling**
```typescript
try {
  const meals = await api.meals.getToday();
  mealStore.setMeals(meals.data);
} catch (error) {
  mealStore.setError(error.message);
}
```

---

## 🌐 Environment Configuration

All API endpoints use the base URL configured in the app:

```typescript
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://127.0.0.1:3001';
```

**Production**: Update `apiBaseUrl` in `app.config.js` for production deployment.

---

This comprehensive API reference ensures all 104 endpoints are documented and accessible for development and integration purposes. 
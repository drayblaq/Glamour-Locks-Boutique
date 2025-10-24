# Glamour Locks Boutique

A modern e-commerce platform for natural hair care products, built with Next.js 15, TypeScript, Stripe, and a local file-based order system. This README explains the core algorithm, folder structure, and how the site works.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Algorithm & Data Flow](#core-algorithm--data-flow)
- [Folder Structure](#folder-structure)
- [Key Features](#key-features)
- [Order Processing Algorithm](#order-processing-algorithm)
- [Admin Panel](#admin-panel)
- [Environment Variables](#environment-variables)
- [Setup & Development](#setup--development)
- [Deployment](#deployment)
- [Security & Best Practices](#security--best-practices)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Overview

Glamour Locks Boutique is a full-stack e-commerce web application. It allows customers to browse products, add to cart, checkout with Stripe, and receive order confirmations. Admins can manage products and orders via a secure dashboard.

---

## Architecture

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Zustand for state management.
- **Backend:** Next.js API routes for order management, email sending, Stripe integration.
- **Database:** File-based storage (`/data/orders.json`) for orders with database service abstraction for easy migration.
- **Authentication:** NextAuth.js for admin panel.
- **Payments:** Stripe for secure checkout.
- **Email:** Unified email service supporting Resend, SendGrid, and Formspree fallback.

---

## Core Algorithm & Data Flow

1. **Product Browsing:** Products are managed in a Zustand store and displayed via dynamic routes.
2. **Cart Management:** Cart state is managed client-side (context/Zustand).
3. **Checkout:**
   - Customer fills in shipping and contact info.
   - Stripe payment is initiated via `/api/create-payment-intent`.
   - On payment success, a webhook (`/api/webhooks/stripe`) triggers order confirmation emails.
   - Order details are saved to database via unified database service.
4. **Order Confirmation:**
   - Emails sent to both customer and admin using unified email service.
   - Multiple email providers supported with automatic fallback.
5. **Admin Panel:**
   - Protected by NextAuth and middleware.
   - Admin can view, update, and manage orders and products.

---

## Folder Structure

```
/src
  /app
    /products           # Product pages
    /cart               # Cart and checkout
    /admin              # Admin dashboard (protected)
    /api                # API routes (orders, email, Stripe)
  /components           # UI and functional components
  /lib                  # Utilities, types, Zustand stores, database service
  /data                 # Static data and file-based order storage
/scripts                # Setup scripts (e.g., admin setup)
```

---

## Key Features

- Product catalog with images, reviews, and details.
- Cart with quantity management and order summary.
- Stripe-powered checkout with payment intent API.
- Order confirmation and admin notification emails.
- Unified database service for order management.
- Admin dashboard for product and order management.
- Secure admin authentication and route protection.
- Multiple email provider support with fallback.
- Enhanced security headers and configuration.

---

## Order Processing Algorithm

1. **Cart Submission:**
   - Validate customer info.
   - Generate unique order number.
2. **Payment:**
   - Create Stripe PaymentIntent.
   - On success, Stripe webhook triggers:
     - Save order via database service.
     - Send confirmation emails via unified email service.
3. **Email Sending:**
   - Try Resend first, then SendGrid, then Formspree.
   - Both customer and admin receive order details.
4. **Order Management:**
   - Admin dashboard fetches orders via database service.
   - Status can be updated (pending, processing, shipped, completed, cancelled).
   - Order stats and details are displayed.

---

## Admin Panel

- **Login:** `/admin/login` (protected by NextAuth).
- **Dashboard:** `/admin/dashboard` (orders, stats, quick actions).
- **Products:** Add, edit, delete products.
- **Orders:** View, update status, email customers.
- **Email:** Send custom emails to customers.

Use `/src/scripts/setup-admin.js` to generate admin credentials.

---

## Setup & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp env.example .env.local
   node src/scripts/setup-admin.js
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access site:**
   - Storefront: [http://localhost:9002](http://localhost:9002)
   - Admin: [http://localhost:9003/admin/login](http://localhost:9003/admin/login)

---

## Deployment

- Deploy to Vercel or any Node.js-compatible host.
- Ensure environment variables are set in production.
- Consider migrating to a real database for production scale.

---

## Security & Best Practices

### ✅ Implemented
- Secure admin authentication with NextAuth.js
- Environment variable protection
- Input validation and sanitization
- CSRF protection via Stripe webhook verification
- Security headers in Next.js config
- Proper error handling without sensitive data exposure
- File-based storage with size limits (100 orders max)

### 🔒 Security Features
- Admin credentials hashed with bcrypt
- Secure session management
- Protected admin routes with middleware
- Email service fallback for reliability
- Comprehensive .gitignore for sensitive files

---

## Known Limitations

### Current Limitations
- **File-based Storage:** Orders stored in JSON file (not suitable for high-volume production)
- **No Real Database:** Limited scalability for concurrent operations
- **No User Accounts:** Customer accounts not implemented
- **Limited Product Management:** Products managed in Zustand store (not persisted)

### Production Considerations
- **Database Migration:** Implement real database (PostgreSQL, MongoDB, etc.)
- **User Authentication:** Add customer account system
- **Product Management:** Implement admin product CRUD operations
- **Image Storage:** Use CDN for product images
- **Caching:** Implement Redis or similar for performance
- **Monitoring:** Add logging and monitoring solutions
- **Backup Strategy:** Implement automated backups

### Recommended Next Steps
1. Migrate to PostgreSQL or MongoDB for order storage
2. Implement customer user accounts
3. Add product management in admin panel
4. Implement image upload and CDN integration
5. Add comprehensive logging and monitoring
6. Set up automated testing
7. Implement rate limiting and DDoS protection

---

## Recent Fixes & Improvements

### ✅ Fixed Issues
1. **Duplicate Config Files:** Removed conflicting `next.config.js`, kept TypeScript version
2. **Email Service:** Unified email service with multiple provider support
3. **Database Layer:** Created abstraction layer for easy database migration
4. **Security:** Enhanced .gitignore and admin setup security
5. **Error Handling:** Improved error handling across all API routes
6. **Dependencies:** Added missing email service dependencies
7. **Configuration:** Consolidated image domains and security headers
8. **Code Cleanup:** Removed commented code and unused variables

### 🔧 Technical Improvements
- Unified email service with Resend, SendGrid, and Formspree support
- Database service abstraction for future migrations
- Enhanced error handling and logging
- Improved security configuration
- Better environment variable management
- Cleaner API route implementations

---

## License

See `LICENSE` file or contact the author for details.
# Updated Tue 19 Aug 04:49:40 WAT 2025

# 🎯 Glamour Locks Boutique - Complete Handover Documentation

## 📋 Table of Contents
1. [Quick Start Guide](#quick-start-guide)
2. [Admin Access](#admin-access)
3. [Technical Setup](#technical-setup)
4. [Business Operations](#business-operations)
5. [Payment Processing](#payment-processing)
6. [Email Configuration](#email-configuration)
7. [Product Management](#product-management)
8. [Order Management](#order-management)
9. [Troubleshooting](#troubleshooting)
10. [Security & Maintenance](#security--maintenance)
11. [Emergency Procedures](#emergency-procedures)

---

## 🚀 Quick Start Guide

### Immediate Access
- **Website URL:** http://localhost:3000 (development) / [Your Production URL]
- **Admin Panel:** http://localhost:3000/admin
- **Admin Email:** admin@glamourlocks.com
- **Admin Password:** password123

### First Steps
1. **Change the default admin password immediately**
2. **Set up production environment variables**
3. **Configure Stripe for live payments**
4. **Set up email notifications**

---

## 🔐 Admin Access

### Current Admin Credentials
```
Email: admin@glamourlocks.com
Password: password123
```

### How to Change Admin Password
1. Go to `/admin/login`
2. Log in with current credentials
3. Navigate to `/admin/settings`
4. Update your password
5. Or run: `node src/scripts/setup-admin.js`

### Admin Panel Features
- **Dashboard:** Overview of orders, revenue, and stats
- **Products:** Add, edit, delete products
- **Orders:** View and manage customer orders
- **Settings:** Update admin credentials and site settings

---

## ⚙️ Technical Setup

### Environment Variables Required

Create a `.env.local` file with these variables:

```bash
# Admin Authentication
ADMIN_EMAIL=your-admin@glamourlocks.com
ADMIN_PASSWORD_HASH=your-hashed-password
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Stripe Configuration (TESTING)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration (Choose one)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Firebase Configuration (Already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA6FJR-AWNgjnsW2_oNCzsmku_L-SPJfjg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=glamourlocks-boutique.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=glamourlocks-boutique
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=glamourlocks-boutique.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=421069906534
NEXT_PUBLIC_FIREBASE_APP_ID=1:421069906534:web:368a0b7f7131e3c7fbc3a7
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6V06JT1EJT
```

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access the site
# Frontend: http://localhost:3000
# Admin: http://localhost:3000/admin
```

### Production Deployment
1. **Vercel (Recommended):**
   - Connect your GitHub repository
   - Set environment variables in Vercel dashboard
   - Deploy automatically

2. **Other Platforms:**
   - Set environment variables
   - Build: `npm run build`
   - Start: `npm start`

---

## 💼 Business Operations

### Product Management
1. **Adding Products:**
   - Go to `/admin/products`
   - Click "Add New Product"
   - Fill in: Name, Description, Price, Images, Stock
   - Save product

2. **Editing Products:**
   - Find product in admin panel
   - Click "Edit"
   - Update details
   - Save changes

3. **Product Images:**
   - Upload to `/public/` folder
   - Reference as `/image-name.jpg`
   - Recommended size: 800x600px

### Order Processing
1. **New Orders:**
   - Automatically appear in admin dashboard
   - Email notifications sent to admin
   - Order status: Pending → Processing → Shipped → Completed

2. **Order Management:**
   - View order details
   - Update status
   - Contact customer
   - Process refunds (via Stripe)

### Customer Service
1. **Order Inquiries:**
   - Check order status in admin panel
   - Contact customer via email
   - Update order status

2. **Returns/Refunds:**
   - Process via Stripe dashboard
   - Update order status
   - Notify customer

---

## 💳 Payment Processing

### Stripe Setup
1. **Create Stripe Account:**
   - Go to stripe.com
   - Sign up for business account
   - Complete verification

2. **Get API Keys:**
   - Dashboard → Developers → API Keys
   - Copy Publishable Key and Secret Key
   - Set in environment variables

3. **Webhook Setup:**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://yoursite.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`
   - Copy webhook secret to environment

### Testing Payments
- Use Stripe test cards:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

### Live Payments
- Switch to live keys in production
- Update webhook URL to production domain
- Test with small amounts first

---

## 📧 Email Configuration

### Free Email Options

#### Option 1: Gmail (Recommended)
1. Enable 2-Factor Authentication
2. Generate App Password
3. Set environment variables:
```bash
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
FROM_EMAIL=your_gmail@gmail.com
```

#### Option 2: Outlook
```bash
EMAIL_USER=your_outlook@outlook.com
EMAIL_PASSWORD=your_outlook_app_password
FROM_EMAIL=your_outlook@outlook.com
```

#### Option 3: Yahoo
```bash
EMAIL_USER=your_yahoo@yahoo.com
EMAIL_PASSWORD=your_yahoo_app_password
FROM_EMAIL=your_yahoo@yahoo.com
```

### Email Types Sent
1. **Order Confirmation:** Sent to customer
2. **Order Notification:** Sent to admin
3. **Status Updates:** When order status changes

---

## 🛍️ Product Management

### Adding New Products
1. **Basic Information:**
   - Product name
   - Description
   - Price (in NGN)
   - Stock quantity
   - Category

2. **Images:**
   - Upload to `/public/` folder
   - Multiple images supported
   - Recommended format: JPG/PNG

3. **SEO:**
   - Product title
   - Meta description
   - Keywords

### Inventory Management
- **Stock Tracking:** Automatic updates
- **Low Stock Alerts:** Configure in admin
- **Out of Stock:** Products hidden from store

---

## 📦 Order Management

### Order Status Flow
1. **Pending:** Order received, payment processing
2. **Processing:** Payment confirmed, preparing order
3. **Shipped:** Order dispatched to customer
4. **Completed:** Order delivered successfully
5. **Cancelled:** Order cancelled/refunded

### Order Details
- Customer information
- Shipping address
- Product details
- Payment information
- Order timeline

### Customer Communication
- Order confirmation emails
- Status update notifications
- Shipping tracking information

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Can't Access Admin Panel
**Problem:** Login not working
**Solution:**
```bash
# Reset admin credentials
node src/scripts/verify-password.js
# Restart server
npm run dev
```

#### 2. Payment Not Processing
**Problem:** Stripe errors
**Solution:**
- Check Stripe API keys
- Verify webhook configuration
- Test with Stripe test cards

#### 3. Emails Not Sending
**Problem:** Email configuration issues
**Solution:**
- Check email credentials
- Verify app passwords
- Test email service

#### 4. Products Not Loading
**Problem:** Firebase connection issues
**Solution:**
- Check Firebase configuration
- Verify internet connection
- Check browser console for errors

### Debug Commands
```bash
# Check environment variables
node src/scripts/debug-env.js

# Test Firebase connection
node src/scripts/test-firestore.js

# Reset admin access
node src/scripts/verify-password.js
```

---

## 🔒 Security & Maintenance

### Security Checklist
- [ ] Change default admin password
- [ ] Use HTTPS in production
- [ ] Set up SSL certificate
- [ ] Regular security updates
- [ ] Backup customer data
- [ ] Monitor for suspicious activity

### Regular Maintenance
1. **Weekly:**
   - Check order status
   - Update product inventory
   - Review customer inquiries

2. **Monthly:**
   - Backup data
   - Update dependencies
   - Review analytics

3. **Quarterly:**
   - Security audit
   - Performance review
   - Feature updates

### Backup Strategy
- **Database:** Firebase automatic backups
- **Code:** Git repository
- **Images:** Cloud storage backup
- **Configuration:** Environment variables backup

---

## 🚨 Emergency Procedures

### Site Down
1. **Check hosting status**
2. **Restart application**
3. **Check error logs**
4. **Contact hosting support**

### Payment Issues
1. **Check Stripe dashboard**
2. **Verify webhook configuration**
3. **Test payment flow**
4. **Contact Stripe support**

### Data Loss
1. **Check Firebase backups**
2. **Restore from backup**
3. **Verify data integrity**
4. **Update affected customers**

### Security Breach
1. **Change all passwords**
2. **Review access logs**
3. **Update security settings**
4. **Notify customers if necessary**

---

## 📞 Support Contacts

### Technical Support
- **Developer:** [Your Contact Information]
- **Hosting:** [Hosting Provider Support]
- **Stripe:** support.stripe.com
- **Firebase:** firebase.google.com/support

### Business Support
- **Customer Service:** [Your Business Email]
- **Phone:** [Your Business Phone]
- **WhatsApp:** [Your WhatsApp Number]

---

## 📊 Analytics & Monitoring

### Key Metrics to Track
- **Sales:** Daily/weekly/monthly revenue
- **Orders:** Order volume and trends
- **Products:** Best-selling items
- **Customers:** New vs returning customers
- **Performance:** Site speed and uptime

### Tools to Set Up
- **Google Analytics:** Track website traffic
- **Google Search Console:** Monitor SEO
- **Stripe Dashboard:** Payment analytics
- **Firebase Analytics:** User behavior

---

## 🎯 Next Steps

### Immediate (Week 1)
1. [ ] Change admin password
2. [ ] Set up production environment
3. [ ] Configure live Stripe payments
4. [ ] Test complete order flow
5. [ ] Set up email notifications

### Short Term (Month 1)
1. [ ] Set up analytics tracking
2. [ ] Configure backup systems
3. [ ] Optimize for mobile
4. [ ] Set up customer service procedures

### Long Term (3-6 months)
1. [ ] Implement advanced features
2. [ ] Add customer accounts
3. [ ] Integrate with inventory systems
4. [ ] Add marketing automation

---

## 📝 Important Notes

### Development vs Production
- **Development:** Uses test Stripe keys, local database
- **Production:** Uses live Stripe keys, Firebase database
- **Environment Variables:** Must be set correctly for each environment

### File Structure
- **Products:** Stored in Firebase Firestore
- **Orders:** Stored in Firebase Firestore
- **Images:** Stored in `/public/` folder
- **Configuration:** Stored in `.env.local`

### Security Best Practices
- Never commit `.env.local` to git
- Use strong passwords
- Enable 2FA on all accounts
- Regular security updates
- Monitor for suspicious activity

---

**🎉 Congratulations! Your Glamour Locks Boutique is ready for business!**

For additional support or questions, refer to the troubleshooting section or contact the development team. 
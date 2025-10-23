# Vercel Deployment Guide for Monorepo

## Overview
This guide will help you deploy both the main site and admin panel to Vercel with separate subdomains.

## Prerequisites
- Vercel account connected to your GitHub repository
- Domain `glamourlocksboutique.com` configured in Vercel
- DNS access to configure subdomains

## Step 1: Deploy Main Site

### 1.1 Create Main Site Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Project Name**: `glamour-locks-main-site`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/main-site`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 1.2 Configure Environment Variables
Add these environment variables to the main site project:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://glamourlocksboutique.com
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EMAIL_SERVER_HOST=your_email_server_host
EMAIL_SERVER_PORT=your_email_server_port
EMAIL_SERVER_USER=your_email_server_user
EMAIL_SERVER_PASSWORD=your_email_server_password
EMAIL_FROM=your_email_from
```

### 1.3 Deploy Main Site
1. Click "Deploy"
2. Wait for deployment to complete
3. Your main site will be available at: `https://glamourlocksboutique.com`

## Step 2: Deploy Admin Panel

### 2.1 Create Admin Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import the same GitHub repository
4. Configure the project:
   - **Project Name**: `glamour-locks-admin`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2.2 Configure Environment Variables for Admin
Add the same environment variables as the main site, but update the NEXTAUTH_URL:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://admin.glamourlocksboutique.com
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EMAIL_SERVER_HOST=your_email_server_host
EMAIL_SERVER_PORT=your_email_server_port
EMAIL_SERVER_USER=your_email_server_user
EMAIL_SERVER_PASSWORD=your_email_server_password
EMAIL_FROM=your_email_from
```

### 2.3 Deploy Admin Panel
1. Click "Deploy"
2. Wait for deployment to complete
3. Your admin panel will be available at: `https://admin.glamourlocksboutique.com`

## Step 3: Configure Custom Domain

### 3.1 Configure Main Site Domain
1. In the main site Vercel project, go to "Settings" → "Domains"
2. Add your domain: `glamourlocksboutique.com`
3. Follow Vercel's DNS configuration instructions
4. Update your Namecheap DNS settings as instructed

### 3.2 Configure Admin Subdomain
1. In the admin Vercel project, go to "Settings" → "Domains"
2. Add your subdomain: `admin.glamourlocksboutique.com`
3. Follow Vercel's DNS configuration instructions
4. Add the CNAME record in Namecheap:
   - **Type**: CNAME
   - **Name**: admin
   - **Value**: cname.vercel-dns.com
   - **TTL**: 600

## Step 4: Verify Deployments

### 4.1 Test Main Site
- Visit: `https://glamourlocksboutique.com`
- Verify all functionality works
- Test product browsing, cart, checkout

### 4.2 Test Admin Panel
- Visit: `https://admin.glamourlocksboutique.com`
- Should redirect to `/dashboard`
- Test admin login
- Verify admin functionality

## Step 5: Update DNS Settings in Namecheap

### 5.1 Main Domain Configuration
In your Namecheap DNS settings for `glamourlocksboutique.com`:

**A Records:**
- `@` → `76.76.19.67` (Vercel's IP)

**CNAME Records:**
- `www` → `cname.vercel-dns.com`

### 5.2 Admin Subdomain Configuration
**CNAME Records:**
- `admin` → `cname.vercel-dns.com`

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check that all dependencies are properly installed
2. **Environment Variables**: Ensure all required variables are set
3. **DNS Issues**: Wait up to 48 hours for DNS propagation
4. **Authentication Issues**: Verify NEXTAUTH_URL is correct for each domain

### Verification Commands:
```bash
# Check main site
curl -I https://glamourlocksboutique.com

# Check admin site
curl -I https://admin.glamourlocksboutique.com

# Check DNS propagation
nslookup admin.glamourlocksboutique.com
```

## Next Steps
After successful deployment:
1. Test all functionality on both sites
2. Update any hardcoded URLs in your code
3. Set up monitoring and analytics
4. Configure backups and security settings




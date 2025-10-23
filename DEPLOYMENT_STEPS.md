# Deployment Steps for Separated Apps

## Overview
Your apps are now properly separated:
- **Main Site**: `glamourlocksboutique.com` (customer-facing)
- **Admin Panel**: `admin.glamourlocksboutique.com` (admin dashboard)

## Step 1: Deploy Main Site

### Option A: Deploy via Vercel CLI
```bash
# Navigate to main site
cd apps/main-site

# Deploy to Vercel
vercel --prod
```

### Option B: Deploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project
3. Connect your GitHub repository
4. Set the following configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/main-site`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

## Step 2: Deploy Admin Panel

### Option A: Deploy via Vercel CLI
```bash
# Navigate to admin app
cd apps/admin

# Deploy to Vercel
vercel --prod
```

### Option B: Deploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project
3. Connect your GitHub repository
4. Set the following configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

## Step 3: Configure Domains

### Main Site Domain
1. In your main site Vercel project settings
2. Go to "Domains" section
3. Add your domain: `glamourlocksboutique.com`
4. Update DNS records as instructed by Vercel

### Admin Panel Subdomain
1. In your admin panel Vercel project settings
2. Go to "Domains" section
3. Add your subdomain: `admin.glamourlocksboutique.com`
4. Update DNS records as instructed by Vercel

## Step 4: DNS Configuration

Add these DNS records in your domain provider (Namecheap, GoDaddy, etc.):

### For Main Site
```
Type: A
Name: @
Value: 76.76.19.76
```

### For Admin Subdomain
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

## Step 5: Environment Variables

### Both deployments need the same environment variables:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

## Step 6: Test Your Deployments

1. **Test Main Site**: Visit `glamourlocksboutique.com`
   - Verify all pages load correctly
   - Test product browsing
   - Test cart functionality
   - Verify no admin routes exist

2. **Test Admin Panel**: Visit `admin.glamourlocksboutique.com`
   - Verify login page loads
   - Test admin authentication
   - Test dashboard functionality
   - Test product management

## Step 7: Update Any Internal Links

If you have any hardcoded links to `/admin` in your main site, update them to point to `admin.glamourlocksboutique.com`.

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Check that both apps build locally: `npm run build`
- Verify environment variables are set correctly

### Domain Issues
- DNS changes can take up to 48 hours to propagate
- Check Vercel domain settings
- Verify SSL certificates are provisioned

### Authentication Issues
- Ensure `NEXTAUTH_URL` is set correctly for each deployment
- Verify admin credentials are set in environment variables

## Benefits of This Setup

1. **Security**: Admin panel is completely isolated
2. **Performance**: Main site not affected by admin operations
3. **Scalability**: Each app can be optimized independently
4. **Maintenance**: Easier to update admin without affecting main site
5. **SEO**: Main site remains focused on customers

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally first
4. Check DNS propagation





# Monorepo Deployment Guide

## Overview
This project is now structured as a monorepo with two separate applications:
- **Main Site**: `glamourlocksboutique.com` (customer-facing)
- **Admin Panel**: `admin.glamourlocksboutique.com` (admin dashboard)

## Project Structure
```
Glamour_locks_site/
├── apps/
│   ├── main-site/          # Customer-facing website
│   └── admin/              # Admin dashboard
├── packages/
│   └── shared/             # Shared utilities and types
├── package.json            # Root package.json with workspaces
└── turbo.json             # Monorepo build configuration
```

## Development

### Running Both Apps Locally
```bash
# Install dependencies
npm install

# Run both apps in development
npm run dev

# Or run specific apps
cd apps/main-site && npm run dev    # Port 9002
cd apps/admin && npm run dev        # Port 9003
```

### Building
```bash
# Build all apps
npm run build

# Build specific app
cd apps/main-site && npm run build
cd apps/admin && npm run build
```

## Deployment Setup

### 1. Vercel Project Configuration

You'll need to set up two deployments in your Vercel project:

#### Main Site Deployment
- **Framework Preset**: Next.js
- **Root Directory**: `apps/main-site`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Admin Site Deployment
- **Framework Preset**: Next.js
- **Root Directory**: `apps/admin`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2. Domain Configuration

#### Main Site
- **Production Domain**: `glamourlocksboutique.com`
- **Environment Variables**: Copy from your current setup

#### Admin Site
- **Production Domain**: `admin.glamourlocksboutique.com`
- **Environment Variables**: Same as main site (shared Firestore)

### 3. DNS Configuration

Add these DNS records in Namecheap:

```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

### 4. Environment Variables

Both deployments need the same environment variables:
- All Firebase configuration
- Stripe keys
- Email configuration
- Any other API keys

## Migration Steps

### Phase 1: Setup (Current)
- ✅ Monorepo structure created
- ✅ Admin app extracted
- ✅ Shared utilities created

### Phase 2: Testing
- [ ] Test admin app locally
- [ ] Verify all functionality works
- [ ] Test shared utilities

### Phase 3: Deployment
- [ ] Deploy admin to Vercel
- [ ] Configure subdomain
- [ ] Test admin on subdomain

### Phase 4: Cutover
- [ ] Remove `/admin` from main site
- [ ] Update any internal links
- [ ] Test complete separation

### Phase 5: Cleanup
- [ ] Remove old admin code from main site
- [ ] Update documentation
- [ ] Monitor for issues

## Benefits of This Setup

1. **Security**: Admin panel completely isolated
2. **Performance**: Main site not affected by admin operations
3. **Scalability**: Each app can be optimized independently
4. **Maintenance**: Easier to update admin without affecting main site
5. **SEO**: Main site remains focused on customers

## Troubleshooting

### Common Issues

1. **Build Failures**: Ensure all dependencies are installed
2. **Import Errors**: Check that shared package is properly linked
3. **Environment Variables**: Verify both deployments have the same env vars
4. **Domain Issues**: Check DNS propagation and Vercel domain settings

### Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally first
4. Check shared package imports





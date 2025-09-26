# 🔐 Admin Access Guide - Glamour Locks Boutique

## 🚀 Quick Access

### Current Admin Credentials
```
Email: admin@glamourlocks.com
Password: password123
```

### How to Access Admin Panel
1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:3000/admin
   ```

3. **Login with the credentials above**

4. **You should now see the admin dashboard!**

---

## 🔧 If You Can't Access Admin Panel

### Step 1: Reset Admin Credentials
```bash
# Run this command in your project directory
node src/scripts/verify-password.js
```

### Step 2: Restart the Server
```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 3: Clear Browser Cache
- Clear cookies for localhost:3000
- Try incognito/private browsing mode
- Or use a different browser

### Step 4: Check Environment Variables
Make sure your `.env.local` file contains:
```bash
ADMIN_EMAIL=admin@glamourlocks.com
ADMIN_PASSWORD_HASH=$2b$10$31jgfi7jSNew48Wsw6sgB.w...
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

---

## 🛠️ Troubleshooting

### Problem: "Invalid credentials" error
**Solution:**
1. Run the reset script above
2. Restart the server
3. Clear browser cache

### Problem: "Page not found" error
**Solution:**
1. Make sure server is running on port 3000
2. Check the URL: `http://localhost:3000/admin`
3. Verify the route exists

### Problem: "Server error" on login
**Solution:**
1. Check browser console for errors
2. Verify environment variables are set
3. Restart the development server

---

## 📱 Admin Panel Features

Once you're logged in, you can:

### Dashboard
- View order statistics
- See recent orders
- Check revenue data

### Products
- Add new products
- Edit existing products
- Delete products
- Manage inventory

### Orders
- View all customer orders
- Update order status
- Contact customers
- Process refunds

### Settings
- Change admin password
- Update site settings
- Configure notifications

---

## 🔒 Security First Steps

### 1. Change Default Password
1. Go to `/admin/settings`
2. Update your password
3. Use a strong password

### 2. Set Up Production Environment
1. Create production `.env.local`
2. Use live Stripe keys
3. Set up production email

### 3. Enable HTTPS
1. Set up SSL certificate
2. Update `NEXTAUTH_URL` to HTTPS
3. Configure secure cookies

---

## 📞 Need Help?

If you're still having trouble:

1. **Check the console** for error messages
2. **Verify the server is running** on port 3000
3. **Try the reset script** above
4. **Contact support** with specific error messages

---

## 🎯 Next Steps After Access

1. **Change the default password**
2. **Add your first products**
3. **Test the order flow**
4. **Set up payment processing**
5. **Configure email notifications**

**Good luck with your Glamour Locks Boutique! 🎉** 
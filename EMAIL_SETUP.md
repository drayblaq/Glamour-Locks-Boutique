# Free Email Setup Guide

## Overview
This guide shows you how to set up **FREE** email sending for your Glamour Locks Boutique website without paying for any email services.

## Option 1: Gmail SMTP (Recommended - Free)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an "App Password" for your application

### Step 2: Get App Password
1. Go to Google Account → Security
2. Under "2-Step Verification" → "App passwords"
3. Generate a new app password for "Mail"
4. Copy the 16-character password

### Step 3: Configure Environment Variables
Add these to your `.env.local` file:

```bash
# Gmail SMTP Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
FROM_EMAIL=your_gmail@gmail.com
```

## Option 2: Outlook SMTP (Free)

### Step 1: Enable App Passwords
1. Go to Outlook.com → Settings → Security
2. Enable 2-Factor Authentication
3. Generate an app password

### Step 2: Configure Environment Variables
```bash
# Outlook SMTP Configuration
EMAIL_USER=your_outlook@outlook.com
EMAIL_PASSWORD=your_outlook_app_password
FROM_EMAIL=your_outlook@outlook.com
```

## Option 3: Yahoo SMTP (Free)

### Step 1: Enable App Passwords
1. Go to Yahoo Account → Security
2. Enable 2-Factor Authentication
3. Generate an app password

### Step 2: Configure Environment Variables
```bash
# Yahoo SMTP Configuration
EMAIL_USER=your_yahoo@yahoo.com
EMAIL_PASSWORD=your_yahoo_app_password
FROM_EMAIL=your_yahoo@yahoo.com
```

## Option 4: Development Mode (No Setup Required)

If you don't want to set up email right now, the app will work in "mock mode":

- Emails will be logged to the console instead of being sent
- Perfect for development and testing
- No configuration required

## Testing Your Email Setup

1. Start your development server: `npm run dev`
2. Go to your admin panel: `/admin`
3. Try sending a test email
4. Check the console for email logs

## Troubleshooting

### "Invalid credentials" error
- Make sure you're using an **App Password**, not your regular password
- For Gmail: Use the 16-character app password, not your account password

### "Less secure app access" error
- Enable 2-Factor Authentication first
- Then generate an App Password

### "Connection timeout" error
- Check your internet connection
- Try a different email provider

## Security Notes

- Never commit your `.env.local` file to git
- Use App Passwords, not regular passwords
- The email service is only for order confirmations and admin notifications

## Production Deployment

When you deploy to production:
1. Set up the same environment variables on your hosting platform
2. Use a dedicated email account for your business
3. Consider using a business email domain for better branding

---

**That's it!** Your email system will now work for free using any of these SMTP providers. 
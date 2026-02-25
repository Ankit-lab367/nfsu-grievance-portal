# 🚀 Quick Start Guide - NFSU Grievance Portal

## Prerequisites Checklist

Before running the portal, ensure you have:

- ✅ Node.js 18 or higher installed
- ✅ Git installed (for version control)
- ✅ MongoDB Atlas account (free tier works)
- ✅ Anthropic API key (for AI chatbot)
- ✅ Gmail account (for email notifications)

---

## Step 1: Install Dependencies

```bash
cd d:\grievance
npm install
```

This will install all required packages:
- Next.js 14
- React & React DOM
- Tailwind CSS
- MongoDB & Mongoose
- JWT & bcrypt
- Anthropic SDK (Claude AI)
- Nodemailer
- And more...

---

## Step 2: Set Up MongoDB Atlas

### Create Free Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Start Free"** and create an account
3. Create a **FREE** cluster (M0 Sandbox)
4. Choose your closest region
5. Click **"Create Cluster"**

### Create Database User

1. Security → Database Access
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `nfsu_admin` (or your choice)
5. Password: Generate a strong password (save it!)
6. User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Configure Network Access

1. Security → Network Access
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Confirm: `0.0.0.0/0`
5. Click **"Confirm"**

### Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string
5. It looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`

**Important:** Replace `<password>` with your actual database password!

---

## Step 3: Get Anthropic API Key

### Sign Up for Anthropic

1. Go to https://console.anthropic.com/
2. Click **"Sign Up"** (or Login)
3. Complete registration
4. Navigate to **API Keys**
5. Click **"Create Key"**
6. Give it a name: "NFSU Grievance Portal"
7. Copy the API key (starts with `sk-ant-api03-...`)

**Important:** Keep this key secret and never commit it to git!

---

## Step 4: Configure Gmail for Emails

### Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Security → 2-Step Verification
3. Turn it ON if not already enabled

### Generate App Password

1. Google Account → Security
2. 2-Step Verification → App Passwords
3. Select App: **Mail**
4. Select Device: **Other (Custom name)**
5. Type: "NFSU Portal"
6. Click **"Generate"**
7. Copy the 16-character password

---

## Step 5: Create .env.local File

Create a file named `.env.local` in `d:\grievance\` with this content:

```env
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://your-username:YOUR-PASSWORD@cluster.mongodb.net/nfsu-grievance?retryWrites=true&w=majority

# JWT Secret (REQUIRED - Generate a random 32+ character string)
JWT_SECRET=change-this-to-a-super-secret-random-string-minimum-32-characters-long

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Anthropic AI (REQUIRED for chatbot)
ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=NFSU Grievance Portal <noreply@nfsu.ac.in>

# SLA Configuration (hours)
SLA_CRITICAL=24
SLA_HIGH=72
SLA_MEDIUM=168
SLA_LOW=336

# File Upload Limits
MAX_FILE_SIZE=5242880
MAX_FILES=5
```

### Replace These Values:

1. **MONGODB_URI**: Your MongoDB connection string with actual password
2. **JWT_SECRET**: Generate random string (use: https://generate-random.org/api-token-generator)
3. **ANTHROPIC_API_KEY**: Your Anthropic API key
4. **EMAIL_USER**: Your Gmail address
5. **EMAIL_PASSWORD**: Your Gmail app password

---

## Step 6: Run the Development Server

```bash
npm run dev
```

You should see:
```
> grievance@0.1.0 dev
> next dev

   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in 2.5s
```

---

## Step 7: Access the Portal

Open your browser and go to:
👉 **http://localhost:3000**

You should see the beautiful landing page!

---

## Step 8: Create Your First User

### Register as Student

1. Click **"Get Started"** or **"Register"**
2. Fill in the form:
   - Name: Your Name
   - Email: student@nfsu.ac.in
   - Enrollment Number: NFSU2024001
   - Mobile: Your number
   - Department: Select any
   - Year: Select year
   - Password: Strong password
3. Click **"Register"**
4. You'll be redirected to login

### Login

1. Enter your email and password
2. Click **"Login"**
3. You'll be redirected to the Student Dashboard

---

## Step 9: Test the Features

### File a Complaint

1. Click **"New Complaint"** from dashboard
2. Fill in:
   - Department: Choose one
   - Title: "Test Complaint - Wi-Fi Issue"
   - Description: "Internet not working in hostel"
   - Priority: Medium
3. Optionally upload a screenshot
4. Click **"Submit Complaint"**
5. Note the Complaint ID (e.g., NFSU-20240205-1234)

### Track Complaint

1. Go to **"Track Complaint"**
2. Enter your Complaint ID
3. Click **"Search"**
4. View the timeline and details

### Test AI Chatbot

1. Click the **floating chat button** (bottom-right)
2. Ask: "How do I file a complaint?"
3. The AI will respond with helpful information
4. Try: "What's my complaint status?"

---

## Step 10: Create Admin User (Optional)

To test admin features:

### Using API (Postman or curl)

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@nfsu.ac.in",
  "password": "admin123",
  "role": "admin",
  "department": "IT"
}
```

Or modify the registration API temporarily to accept role parameter.

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**
- Check if MONGODB_URI is correct in .env.local
- Ensure MongoDB Atlas allows your IP (0.0.0.0/0)
- Verify password doesn't have special characters (URL encode if needed)

### Issue: "Chatbot not responding"

**Solution:**
- Check ANTHROPIC_API_KEY in .env.local
- Ensure you have API credits remaining
- Check browser console for errors

### Issue: "Emails not sending"

**Solution:**
- Verify EMAIL_PASSWORD is the app password, not your regular Gmail password
- Check EMAIL_USER is correct
- Ensure 2FA is enabled on Gmail

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

---

## Production Build (Optional)

To create a production build:

```bash
npm run build
npm start
```

---

## Deploy to Vercel

### Quick Deploy

1. Push code to GitHub
2. Go to https://vercel.com
3. Click **"Import Project"**
4. Select your repository
5. Add all environment variables from .env.local
6. Click **"Deploy"**

Your portal will be live in 2-3 minutes!

---

## What's Next?

✅ Customize colors in tailwind.config.js
✅ Add NFSU logo and images
✅ Create more admin/super-admin users
✅ Test all features thoroughly
✅ Add more departments in database
✅ Prepare for demo/presentation

---

## Need Help?

- 📚 Check README.md for detailed documentation
- 💬 Use the AI chatbot in the app
- 🐛 Check browser console for errors
- 📧 Email: support@nfsu.ac.in (if deployed)

---

<div align="center">

**🎉 Congratulations! Your portal is running! 🎉**

**You're ready to win that hackathon! 🏆**

</div>

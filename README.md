🎓 NFSU Grievance Redressal Portal
A modern, production-ready grievance management system for National Forensic Sciences University built with Next.js, MongoDB, and AI-powered assistance.

NFSU Portal Next.js MongoDB Claude AI

🌟 Features
For Students
✅ Easy Complaint Registration with department routing
📊 Real-time Tracking with detailed timeline
🕵️ Anonymous Complaints for sensitive issues
📁 File Attachments (images, PDFs)
🔔 Email & In-app Notifications
⭐ Feedback System after resolution
📱 Responsive Design (mobile, tablet, desktop)
For Admins
📈 Department Dashboard with analytics
🎯 Complaint Assignment to staff members
✏️ Status Updates with remarks
📋 SLA Monitoring & breach alerts
📤 Export Data (CSV/PDF)
🔍 Advanced Filters & search
For Super Admin
🌐 University-wide Analytics
👥 User Management (create/manage admins)
🏢 Department Management
📊 Performance Metrics
🚨 Escalation Queue
📝 Audit Logs
AI Features
🤖 24/7 AI Chatbot (Claude Sonnet 4.5)
💬 Context-aware Responses
🔍 Complaint Status Lookup
🌐 Guest & Authenticated Modes
💾 Chat History storage
🛠️ Tech Stack
Layer	Technology
Frontend	Next.js 14 (App Router), React, Tailwind CSS
Backend	Next.js API Routes (Serverless)
Database	MongoDB Atlas (Mongoose ODM)
Authentication	JWT + bcrypt
AI	Anthropic Claude Sonnet 4.5
Email	Nodemailer (SMTP)
Deployment	Vercel
Animations	Framer Motion
Icons	React Icons
Charts	Recharts
📁 Project Structure
grievance-portal/
├── app/
│   ├── api/
│   │   ├── auth/                # Authentication endpoints
│   │   ├── complaints/          # Complaint CRUD operations
│   │   ├── departments/         # Department management
│   │   ├── chatbot/             # AI chatbot API
│   │   └── admin/               # Admin operations
│   ├── dashboard/
│   │   ├── student/             # Student dashboard
│   │   ├── admin/               # Admin dashboard
│   │   └── super-admin/         # Super admin dashboard
│   ├── complaint/
│   │   ├── create/              # New complaint form
│   │   ├── track/               # Track complaint by ID
│   │   └── [id]/                # Complaint details
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── layout.js                # Root layout
│   ├── page.js                  # Landing page
│   └── globals.css              # Global styles
├── components/
│   ├── Navbar.jsx               # Navigation bar
│   ├── ChatbotWidget.jsx        # AI chatbot
│   ├── StatusBadge.jsx          # Status indicator
│   └── ...
├── models/
│   ├── User.js                  # User schema
│   ├── Complaint.js             # Complaint schema
│   ├── Department.js            # Department schema
│   ├── Notification.js          # Notification schema
│   └── ChatLog.js               # Chat history schema
├── lib/
│   ├── dbConnect.js             # MongoDB connection
│   ├── auth.js                  # JWT utilities
│   └── mailer.js                # Email service
├── middleware.js                # Route protection
├── .env.local                   # Environment variables
└── package.json                 # Dependencies
🚀 Getting Started
Prerequisites
Node.js 18+ and npm/yarn
MongoDB Atlas account
Anthropic API key (for AI chatbot)
SMTP credentials (Gmail recommended)
Installation
Clone the repository

git clone https://github.com/yourusername/nfsu-grievance-portal.git
cd nfsu-grievance-portal
Install dependencies

npm install
Set up environment variables

Create a .env.local file in the root directory:

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nfsu-grievance

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Anthropic AI (Claude)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=NFSU Grievance Portal <noreply@nfsu.ac.in>

# SLA (in hours)
SLA_CRITICAL=24
SLA_HIGH=72
SLA_MEDIUM=168
SLA_LOW=336
Run the development server

npm run dev
Open your browser Navigate to http://localhost:3000

🗄️ Database Setup
MongoDB Atlas
Create a free cluster at MongoDB Atlas
Create a database user with read/write permissions
Whitelist your IP (or use 0.0.0.0/0 for development)
Get your connection string and add it to .env.local
Initial Data
The application will automatically create collections on first use. To seed departments:

// Run this in MongoDB Shell or create a seed script
db.departments.insertMany([
  { name: "Academics", email: "academics@nfsu.ac.in", isActive: true },
  { name: "Hostel", email: "hostel@nfsu.ac.in", isActive: true },
  { name: "IT", email: "it@nfsu.ac.in", isActive: true },
  // ... add all departments
]);
🔐 User Roles & Access
Role	Access
Student	Register complaints, track status, view history
Admin	Manage department complaints, assign tasks, update status
Super Admin	Full system access, analytics, user management
Creating Admin Users
Super admins can create admin users through the dashboard. For the initial super admin:

// Use this registration endpoint with role parameter
POST /api/auth/register
{
  "name": "Super Admin",
  "email": "admin@nfsu.ac.in",
  "password": "securepassword",
  "role": "super-admin"
}
📧 Email Configuration
Gmail Setup
Enable 2-Factor Authentication on your Gmail account
Generate an App Password:
Go to Google Account → Security
2-Step Verification → App Passwords
Select "Mail" and "Other (Custom name)"
Copy the generated password
Use this password in EMAIL_PASSWORD env variable
Email Templates
Email notifications are sent for:

✅ Complaint registration
🔄 Status updates
✔️ Resolution confirmation
⚠️ SLA breach alerts
🤖 AI Chatbot Configuration
Get Anthropic API Key
Sign up at Anthropic
Create an API key
Add to .env.local as ANTHROPIC_API_KEY
Chatbot Capabilities
Explains complaint filing process
Suggests appropriate departments
Tracks complaint status by ID
Provides general assistance
Works for both guests and authenticated users
🎨 Customization
Branding
Logo: Replace the "N" placeholder in components with your logo
Background: Add NFSU background image to /public/assets/
Colors: Edit tailwind.config.js to update color scheme
Departments
Edit the department list in:

app/complaint/create/page.js
models/Department.js
Database seed data
🚀 Deployment
Vercel (Recommended)
Push to GitHub

git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
Deploy to Vercel

Go to Vercel
Import your GitHub repository
Add environment variables
Deploy!
Configure MongoDB Atlas

Add Vercel's IP ranges to whitelist
Or use 0.0.0.0/0 (less secure)
Environment Variables in Vercel
Add all variables from .env.local to: Project Settings → Environment Variables

📊 Features Breakdown
Status Types
🟡 Pending - Just registered
🔵 In Progress - Being worked on
🟢 Resolved - Completed
🔴 Escalated - SLA breach or manual escalation
⚫ Rejected - Invalid or duplicate
Priority Levels
🔴 Critical - 24h SLA
🟠 High - 72h SLA
🟡 Medium - 168h SLA (7 days)
🔵 Low - 336h SLA (14 days)
🔒 Security Features
✅ JWT authentication with secure tokens
✅ Password hashing with bcrypt
✅ Role-based access control (RBAC)
✅ Input sanitization
✅ Secure file uploads
✅ CORS configuration
✅ Environment variable protection
📱 Responsive Design
The portal is fully responsive and works on:

📱 Mobile devices (320px+)
📱 Tablets (768px+)
💻 Laptops (1024px+)
🖥️ Desktops (1440px+)
🤝 Contributing
This project was built for National Forensic Sciences University. For hackathons or educational purposes:

Fork the repository
Create a feature branch
Commit your changes
Push and create a Pull Request
📄 License
This project is created for educational and hackathon purposes.

🏆 Hackathon Impact
Innovation
✅ AI-powered assistance
✅ Real-time tracking
✅ Glassmorphism UI
✅ SLA automation
Social Good
✅ Improves student-university communication
✅ Transparent complaint resolution
✅ Reduces manual workload
✅ Data-driven decision making
Technical Excellence
✅ Production-ready architecture
✅ Scalable serverless design
✅ Secure authentication
✅ Comprehensive error handling
📞 Support
For issues or questions:

📧 Email: support@nfsu.ac.in
💬 Use the in-app AI chatbot
🐛 File an issue on GitHub
🙏 Acknowledgments
National Forensic Sciences University for the opportunity
Anthropic for Claude AI
Vercel for hosting platform
MongoDB for database services
Built with ❤️ for NFSU Students

⭐ Star this repo if you find it helpful!

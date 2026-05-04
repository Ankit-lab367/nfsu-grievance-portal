import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});
export const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
            attachments,
        });
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
};
export const emailTemplates = {
    complaintRegistered: (complaintId, department, description) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .complaint-id { background: #fff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 NFSU Grievance Portal</h1>
          </div>
          <div class="content">
            <h2>Complaint Registered Successfully</h2>
            <p>Your complaint has been registered and assigned to the <strong>${department}</strong> department.</p>
            <div class="complaint-id">
              <strong>Complaint ID:</strong> ${complaintId}<br>
              <strong>Description:</strong> ${description.substring(0, 100)}...
            </div>
            <p>You can track your complaint status using the Complaint ID above.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaint/track" class="btn">Track Complaint</a>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              We aim to resolve your complaint within the stipulated SLA timeframe. You will receive updates via email and in-app notifications.
            </p>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `,
    statusUpdate: (complaintId, status, remarks) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .status { background: #fff; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 NFSU Grievance Portal</h1>
          </div>
          <div class="content">
            <h2>Complaint Status Updated</h2>
            <p>Your complaint <strong>${complaintId}</strong> has been updated.</p>
            <div class="status">
              <strong>New Status:</strong> ${status}<br>
              ${remarks ? `<strong>Remarks:</strong> ${remarks}` : ''}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaint/${complaintId}" class="btn">View Details</a>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `,
    complaintResolved: (complaintId, resolutionDetails) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .resolution { background: #fff; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Complaint Resolved</h1>
          </div>
          <div class="content">
            <h2>Your Complaint Has Been Resolved!</h2>
            <p>We're pleased to inform you that your complaint <strong>${complaintId}</strong> has been successfully resolved.</p>
            <div class="resolution">
              <strong>Resolution Details:</strong><br>
              ${resolutionDetails}
            </div>
            <p>We value your feedback! Please take a moment to rate our service.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaint/${complaintId}" class="btn">Provide Feedback</a>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `,
    escalationAlert: (complaintId, slaHours) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert { background: #fff; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ SLA Breach Alert</h1>
          </div>
          <div class="content">
            <h2>Complaint Escalation Notice</h2>
            <p>Complaint <strong>${complaintId}</strong> has exceeded the SLA timeframe of ${slaHours} hours.</p>
            <div class="alert">
              <strong>Action Required:</strong> This complaint has been escalated for immediate attention.
            </div>
            <p>Our team is working on priority to resolve this matter.</p>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `,
    staffApprovalRequest: (staffDetails, approvalLink) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; }
          .details { background: #fff; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
          .avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #dc2626; margin-bottom: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Staff Verification Required</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <img src="cid:staffAvatar" alt="Staff Photo" class="avatar" />
            </div>
            <h2 style="text-align: center;">New Staff Registration</h2>
            <p>A new staff member has registered and is waiting for your approval:</p>
            <div class="details">
              <strong>Name:</strong> ${staffDetails.name}<br>
              <strong>Email:</strong> ${staffDetails.email}<br>
              <strong>Phone:</strong> ${staffDetails.phone}<br>
              <strong>Role:</strong> ${staffDetails.role}
            </div>
            <p>Please review their details and photo. If valid, click the button below to activate their account.</p>
            <div style="text-align: center;">
              <a href="${approvalLink}" class="btn">Approve Staff Member</a>
            </div>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University
          </div>
        </div>
      </body>
    </html>
  `,
    studentIdVerification: (studentDetails, verifyLink, banLink) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
          .container { max-width: 650px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .header { background: #1e293b; color: white; padding: 30px; text-align: center; }
          .content { padding: 40px; }
          .details { background: #f8fafc; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
          .details-row { display: flex; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
          .details-label { font-weight: bold; width: 150px; color: #64748b; }
          .details-value { flex: 1; color: #1e293b; font-weight: 500; }
          .id-image-container { text-align: center; margin: 30px 0; background: #000; padding: 10px; border-radius: 8px; }
          .id-image { max-width: 100%; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
          .actions { display: flex; gap: 20px; justify-content: center; margin-top: 40px; }
          .btn { flex: 1; text-align: center; padding: 15px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; transition: all 0.3s; }
          .btn-verify { background: #059669; color: white; }
          .btn-verify:hover { background: #047857; }
          .btn-ban { background: #dc2626; color: white; }
          .btn-ban:hover { background: #b91c1c; }
          .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">Student ID Verification Required</h1>
            <p style="margin:10px 0 0 0; opacity: 0.8;">Action Needed: Review registration credentials</p>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-top: 0;">New Registration Request</h2>
            <p>The following student has submitted their ID for verification:</p>
            
            <div class="details">
              <div class="details-row">
                <div class="details-label">Full Name:</div>
                <div class="details-value">${studentDetails.name}</div>
              </div>
              <div class="details-row">
                <div class="details-label">Email:</div>
                <div class="details-value">${studentDetails.email}</div>
              </div>
              <div class="details-row">
                <div class="details-label">Enrollment:</div>
                <div class="details-value">${studentDetails.enrollmentNumber}</div>
              </div>
              <div class="details-row">
                <div class="details-label">Phone:</div>
                <div class="details-value">${studentDetails.phone}</div>
              </div>
              <div class="details-row">
                <div class="details-label">Course:</div>
                <div class="details-value">${studentDetails.course}</div>
              </div>
              <div class="details-row">
                <div class="details-label">Year:</div>
                <div class="details-value">${studentDetails.year} Year</div>
              </div>
            </div>

            <h3 style="color: #1e293b;">Captured ID Photo</h3>
            <div class="id-image-container">
              <img src="cid:studentIdPhoto" alt="Student ID" class="id-image" />
            </div>

            <p style="color: #64748b; font-style: italic; margin-top: 30px;">
              Please compare the details with the captured ID photo. Choose an action below:
            </p>

            <div class="actions">
              <a href="${verifyLink}" class="btn btn-verify">1. VERIFIED</a>
              <a href="${banLink}" class="btn btn-ban">2. BAN</a>
            </div>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University • Grievance Portal Security System
          </div>
        </div>
      </body>
    </html>
  `,
    studentBanNotification: (reason, adminName) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #fef2f2; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #fee2e2; }
          .header { background: #991b1b; color: white; padding: 30px; text-align: center; }
          .content { padding: 40px; }
          .reason-box { background: #fff1f2; padding: 25px; border-radius: 10px; border-left: 5px solid #ef4444; margin: 25px 0; color: #991b1b; }
          .evidence-text { font-size: 14px; color: #64748b; margin-top: 30px; }
          .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">🚫 Account Banned</h1>
            <p style="margin:10px 0 0 0; opacity: 0.8;">NFSU Grievance Portal Security Update</p>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-top: 0;">Notice of Account Termination</h2>
            <p>Your account on the NFSU Grievance Portal has been terminated and your email has been blacklisted by the administration.</p>
            
            <div class="reason-box">
              <strong style="display:block; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; tracking-widest;">Reason from Administrator:</strong>
              ${reason}
            </div>

            <p>Any future registration attempts with this email will be automatically rejected. If you believe this is an error, please contact the University IT department.</p>
            
            <p class="evidence-text">Attachments/Evidence are included in this email if provided by the administrator.</p>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University • Grievance Portal Security System
          </div>
        </div>
      </body>
    </html>
  `,
    unbanNotification: () => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f0fdf4; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #dcfce7; }
          .header { background: #059669; color: white; padding: 30px; text-align: center; }
          .content { padding: 40px; }
          .success-box { background: #f0fdf4; padding: 25px; border-radius: 10px; border-left: 5px solid #10b981; margin: 25px 0; color: #065f46; }
          .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
          .btn { display: inline-block; padding: 12px 25px; background: #059669; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">🔓 Access Restored</h1>
            <p style="margin:10px 0 0 0; opacity: 0.8;">NFSU Grievance Portal Account Update</p>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-top: 0;">Good News!</h2>
            <p>Your email has been removed from our blacklist. You are now permitted to register and use the NFSU Grievance Portal again.</p>
            
            <div class="success-box">
              Your account privileges have been restored by the administration.
            </div>

            <p>You can now head over to the registration page to create a new account using your email address.</p>
            
            <center>
                <a href="${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()}/register-selection" class="btn">Register Now</a>
            </center>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University • Grievance Portal Security System
          </div>
        </div>
      </body>
    </html>
  `,
    studentVerifiedNotification: (studentName) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: #1e293b; color: white; padding: 30px; text-align: center; }
          .content { padding: 40px; }
          .success-badge { display: inline-block; padding: 8px 16px; background: #dcfce7; color: #166534; border-radius: 20px; font-weight: bold; font-size: 12px; margin-bottom: 20px; text-transform: uppercase; }
          .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
          .btn { display: inline-block; padding: 12px 30px; background: #1e293b; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">🛡️ Verification Approved</h1>
            <p style="margin:10px 0 0 0; opacity: 0.8;">Your NFSU Portal access is now active</p>
          </div>
          <div class="content">
            <div class="success-badge">Identity Confirmed</div>
            <h2 style="color: #1e293b; margin-top: 0;">Congratulations, ${studentName}!</h2>
            <p>Your student ID verification has been successfully reviewed and approved by the administration.</p>
            <p>You now have full access to all features of the NFSU Grievance Portal, including:</p>
            <ul style="color: #475569; padding-left: 20px;">
              <li>Registering new grievances</li>
              <li>Tracking resolution history</li>
              <li>Participating in student discussions</li>
              <li>Accessing academic resources</li>
            </ul>
            
            <center>
                <a href="${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()}/dashboard/student" class="btn">Go to Dashboard</a>
            </center>
          </div>
          <div class="footer">
            © 2024 National Forensic Sciences University • Security Infrastructure
          </div>
        </div>
      </body>
    </html>
  `
};

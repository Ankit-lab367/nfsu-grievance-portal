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

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Send email utility
export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
};

// Email templates
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
};

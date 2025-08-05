const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

// Configure email transporter with OAuth2
const createEmailTransporter = () => {
  // Try OAuth2 first if refresh token is available
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    try {
      const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });

      const accessToken = oauth2Client.getAccessToken();

      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: accessToken
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } catch (error) {
      console.log('⚠️ OAuth2 failed, falling back to basic auth:', error.message);
    }
  }

  // Fallback to basic authentication
  console.log('📧 Using basic authentication for email');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send welcome email to new staff member with login credentials
const sendStaffWelcomeEmail = async (staffData, adminData, generatedPassword) => {
  try {
    console.log('🔍 Email function called with:');
    console.log('- Staff email:', staffData.email);
    console.log('- Generated password:', generatedPassword);
    console.log('- Password exists:', !!generatedPassword);
    console.log('- Password length:', generatedPassword ? generatedPassword.length : 0);
    console.log('- Password type:', typeof generatedPassword);
    console.log('- Password JSON:', JSON.stringify(generatedPassword));

    // Test the template interpolation
    console.log('🔍 Testing template interpolation:');
    console.log('- Template test:', 'Password: ' + generatedPassword);
    console.log('- Fallback test:', generatedPassword || 'FALLBACK_PASSWORD');

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email configuration not found, skipping welcome email');
      return { success: false, message: 'Email configuration not available' };
    }

    const transporter = createEmailTransporter();
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified for staff welcome email');

    // Create ATTRACTIVE email content with professional styling
    const welcomeMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RubberEco</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; line-height: 1.6;">

        <!-- Main Container -->
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 20px; text-align: center; color: white;">
            <div style="font-size: 32px; margin-bottom: 10px;">🌱</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">RubberEco</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Sustainable Rubber Management System</p>
          </div>

          <!-- Password Alert Section -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px 20px; text-align: center; color: white; border-bottom: 3px solid #047857;">
            <div style="font-size: 24px; margin-bottom: 10px;">🔑</div>
            <h2 style="margin: 0; font-size: 22px; font-weight: bold;">YOUR LOGIN PASSWORD</h2>
            <div style="background: rgba(255,255,255,0.2); margin: 15px auto; padding: 15px 25px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; letter-spacing: 3px; max-width: 300px; border: 2px solid rgba(255,255,255,0.3);">
              ${generatedPassword}
            </div>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Save this password securely!</p>
          </div>

          <!-- Welcome Section -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
              Welcome to the Team, <span style="color: #2563eb;">${staffData.name}</span>! 🎉
            </h2>

            <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 30px;">
              You have been successfully added to our RubberEco staff management system. We're excited to have you on board!
            </p>

            <!-- Login Details Card -->
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 25px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin: 0 0 20px 0; font-size: 20px; text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                🔐 Login Credentials
              </h3>

              <div style="margin-bottom: 15px;">
                <strong style="color: #374151; display: inline-block; width: 80px;">Email:</strong>
                <span style="color: #1f2937; font-family: 'Courier New', monospace; background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${staffData.email}</span>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #374151; display: inline-block; width: 80px;">Password:</strong>
                <span style="color: #dc2626; font-family: 'Courier New', monospace; background: #fef2f2; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${generatedPassword}</span>
              </div>

              <div style="margin-bottom: 20px;">
                <strong style="color: #374151; display: inline-block; width: 80px;">Login URL:</strong>
                <a href="http://localhost:5175/login" style="color: #2563eb; text-decoration: none; font-weight: 500;">http://localhost:5175/login</a>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⚠️ Security Note:</strong> Please keep your password secure and consider changing it after your first login.
                </p>
              </div>
            </div>

            <!-- Staff Information Card -->
            <div style="background: #f0f9ff; border: 2px solid #bae6fd; border-radius: 10px; padding: 25px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin: 0 0 20px 0; font-size: 20px; text-align: center; border-bottom: 2px solid #bae6fd; padding-bottom: 10px;">
                👤 Your Staff Information
              </h3>

              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe;">
                  <strong style="color: #0f172a;">Name:</strong>
                  <span style="color: #1e293b;">${staffData.name}</span>
                </div>

                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe;">
                  <strong style="color: #0f172a;">Email:</strong>
                  <span style="color: #1e293b;">${staffData.email}</span>
                </div>

                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe;">
                  <strong style="color: #0f172a;">Phone:</strong>
                  <span style="color: #1e293b;">${staffData.phone}</span>
                </div>

                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe;">
                  <strong style="color: #0f172a;">Role:</strong>
                  <span style="color: #1e293b; text-transform: capitalize;">${staffData.role.replace('_', ' ')}</span>
                </div>

                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe;">
                  <strong style="color: #0f172a;">Department:</strong>
                  <span style="color: #1e293b;">${staffData.department}</span>
                </div>

                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <strong style="color: #0f172a;">Location:</strong>
                  <span style="color: #1e293b;">${staffData.location}</span>
                </div>
              </div>
            </div>

            <!-- Next Steps Section -->
            <div style="background: #fefce8; border: 2px solid #fde047; border-radius: 10px; padding: 25px; margin: 20px 0;">
              <h3 style="color: #a16207; margin: 0 0 20px 0; font-size: 20px; text-align: center; border-bottom: 2px solid #fde047; padding-bottom: 10px;">
                🚀 Next Steps
              </h3>

              <div style="counter-reset: step-counter;">
                <div style="counter-increment: step-counter; display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #eab308;">
                  <div style="background: #eab308; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; font-size: 12px;">1</div>
                  <span style="color: #374151;">Use the credentials above to login to your account</span>
                </div>

                <div style="counter-increment: step-counter; display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #eab308;">
                  <div style="background: #eab308; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; font-size: 12px;">2</div>
                  <span style="color: #374151;">Access your personalized staff dashboard</span>
                </div>

                <div style="counter-increment: step-counter; display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #eab308;">
                  <div style="background: #eab308; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; font-size: 12px;">3</div>
                  <span style="color: #374151;">Complete your profile setup and preferences</span>
                </div>

                <div style="counter-increment: step-counter; display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #eab308;">
                  <div style="background: #eab308; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; font-size: 12px;">4</div>
                  <span style="color: #374151;">Start managing your tasks and responsibilities</span>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5175/login" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: all 0.3s ease;">
                🚀 Login to Your Dashboard
              </a>
            </div>

            <!-- Support Section -->
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin-top: 30px;">
              <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
                Need help? Have questions? We're here to support you!
              </p>
              <p style="color: #475569; margin: 0; font-size: 14px;">
                Contact your administrator or reach out to our support team.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #1f2937; color: #9ca3af; padding: 25px 20px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <div style="font-size: 24px; margin-bottom: 8px;">🌱</div>
              <h4 style="margin: 0; color: #f9fafb; font-size: 18px;">RubberEco Team</h4>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Sustainable Rubber Management System</p>
            </div>

            <div style="border-top: 1px solid #374151; padding-top: 15px; font-size: 12px;">
              <p style="margin: 0;">© 2025 RubberEco. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create ATTRACTIVE plain text version with PASSWORD FIRST
    const plainTextMessage = `
═══════════════════════════════════════════════════════════════
🌱 RUBBERECO - SUSTAINABLE RUBBER MANAGEMENT SYSTEM 🌱
═══════════════════════════════════════════════════════════════

🔑 YOUR LOGIN PASSWORD: ${generatedPassword}
═══════════════════════════════════════════════════════════════

Welcome to the team, ${staffData.name}! 🎉

You have been successfully added to our RubberEco staff management
system. We're excited to have you on board!

🔐 LOGIN CREDENTIALS:
───────────────────────────────────────────────────────────────
Email:    ${staffData.email}
Password: ${generatedPassword}
Login:    http://localhost:5175/login

⚠️  SECURITY NOTE: Please keep your password secure and consider
    changing it after your first login.

👤 YOUR STAFF INFORMATION:
───────────────────────────────────────────────────────────────
Name:       ${staffData.name}
Email:      ${staffData.email}
Phone:      ${staffData.phone}
Role:       ${staffData.role.replace('_', ' ').toUpperCase()}
Department: ${staffData.department}
Location:   ${staffData.location}

🚀 NEXT STEPS:
───────────────────────────────────────────────────────────────
1. Use the credentials above to login to your account
2. Access your personalized staff dashboard
3. Complete your profile setup and preferences
4. Start managing your tasks and responsibilities

💡 NEED HELP?
───────────────────────────────────────────────────────────────
Have questions? We're here to support you!
Contact your administrator or reach out to our support team.

═══════════════════════════════════════════════════════════════
🌱 RubberEco Team
Sustainable Rubber Management System

© 2025 RubberEco. All rights reserved.
This is an automated message. Please do not reply to this email.
═══════════════════════════════════════════════════════════════
    `;

    // Log email content for debugging
    console.log('🔍 Email content preview:');
    console.log('- HTML contains password:', welcomeMessage.includes(generatedPassword));
    console.log('- Plain text contains password:', plainTextMessage.includes(generatedPassword));
    console.log('- HTML snippet around password:', welcomeMessage.substring(welcomeMessage.indexOf('Password:'), welcomeMessage.indexOf('Password:') + 100));
    console.log('- Plain text snippet:', plainTextMessage.substring(plainTextMessage.indexOf('Password:'), plainTextMessage.indexOf('Password:') + 50));

    // Send the email with both HTML and plain text
    const result = await transporter.sendMail({
      from: `"RubberEco Team" <${process.env.EMAIL_USER}>`,
      to: staffData.email,
      subject: `🔑 RubberEco Login Password: ${generatedPassword} - Welcome ${staffData.name}`,
      html: welcomeMessage,
      text: plainTextMessage
    });

    console.log(`✅ Welcome email sent successfully to: ${staffData.email}`);
    console.log('Email message ID:', result.messageId);

    return {
      success: true,
      message: 'Welcome email sent successfully',
      messageId: result.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send staff welcome email:', error);
    return {
      success: false,
      message: 'Failed to send welcome email',
      error: error.message
    };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = createEmailTransporter();
      await transporter.verify();
      console.log('✅ Email configuration is valid and ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error.message);
      console.log('💡 To fix this issue:');
      console.log('   1. Use a personal Gmail account with App Password');
      console.log('   2. Or set up OAuth2 authentication');
      console.log('   3. Or disable email functionality temporarily');
      console.log('🔄 System will continue without email functionality');
      return false;
    }
  } else {
    console.log('⚠️ Email configuration not found in environment variables');
    return false;
  }
};

// Send admin notification email for farmer requests
const sendAdminNotificationEmail = async (notificationData) => {
  try {
    console.log('🔔 Sending admin notification email for:', notificationData.type);

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email configuration not found, skipping admin notification email');
      return { success: false, message: 'Email configuration not available' };
    }

    const transporter = createEmailTransporter();

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified for admin notification email');

    // Get admin email (in production, this would come from database)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    // Create notification email content based on type
    let emailContent = '';
    let subject = '';

    switch (notificationData.type) {
      case 'tapper_request':
        subject = `🌱 New Tapper Request from ${notificationData.data.farmerName}`;
        emailContent = createTapperRequestEmailContent(notificationData);
        break;
      case 'land_lease':
        subject = `🏡 New Land Lease Application from ${notificationData.data.farmerName}`;
        emailContent = createLandLeaseEmailContent(notificationData);
        break;
      case 'service_request':
        const serviceType = notificationData.data.serviceType === 'fertilizer' ? 'Fertilizer' : 'Rain Guard';
        subject = `🔧 New ${serviceType} Service Request from ${notificationData.data.farmerName}`;
        emailContent = createServiceRequestEmailContent(notificationData);
        break;
      default:
        subject = `🔔 New Notification: ${notificationData.title}`;
        emailContent = createGenericNotificationEmailContent(notificationData);
    }

    // Send the email
    const result = await transporter.sendMail({
      from: `"RubberEco System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: subject,
      html: emailContent,
      text: convertHtmlToText(emailContent)
    });

    console.log(`✅ Admin notification email sent successfully to: ${adminEmail}`);
    console.log('Email message ID:', result.messageId);

    return {
      success: true,
      message: 'Admin notification email sent successfully',
      messageId: result.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error);
    return {
      success: false,
      message: 'Failed to send admin notification email',
      error: error.message
    };
  }
};

// Create tapper request email content
const createTapperRequestEmailContent = (notificationData) => {
  const data = notificationData.data;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Tapper Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px 20px; text-align: center; color: white;">
          <div style="font-size: 32px; margin-bottom: 10px;">🌱</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Tapper Request</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Immediate Action Required</p>
        </div>

        <!-- Alert Section -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">⚡ ${data.urgency.toUpperCase()} PRIORITY REQUEST</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Request ID: ${data.requestId}</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
            Request from <span style="color: #3b82f6;">${data.farmerName}</span>
          </h2>

          <!-- Farmer Details -->
          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #3b82f6; margin: 0 0 15px 0; font-size: 18px;">👤 Farmer Information</h3>
            <div style="display: grid; gap: 10px;">
              <div><strong>Name:</strong> ${data.farmerName}</div>
              <div><strong>Email:</strong> <a href="mailto:${data.farmerEmail}">${data.farmerEmail}</a></div>
              <div><strong>Phone:</strong> <a href="tel:${data.farmerPhone}">${data.farmerPhone}</a></div>
              <div><strong>Contact Preference:</strong> ${data.contactPreference}</div>
            </div>
          </div>

          <!-- Farm Details -->
          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">🌾 Farm Details</h3>
            <div style="display: grid; gap: 10px;">
              <div><strong>Location:</strong> ${data.farmLocation}</div>
              <div><strong>Farm Size:</strong> ${data.farmSize}</div>
              <div><strong>Number of Trees:</strong> ${data.numberOfTrees}</div>
              <div><strong>Tapping Type:</strong> ${data.tappingType}</div>
            </div>
          </div>

          <!-- Service Details -->
          <div style="background: #fef3c7; border: 2px solid #fde047; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #a16207; margin: 0 0 15px 0; font-size: 18px;">📋 Service Requirements</h3>
            <div style="display: grid; gap: 10px;">
              <div><strong>Start Date:</strong> ${data.startDate}</div>
              <div><strong>Duration:</strong> ${data.duration}</div>
              <div><strong>Preferred Time:</strong> ${data.preferredTime}</div>
              <div><strong>Budget Range:</strong> ${data.budgetRange || 'Not specified'}</div>
              ${data.specialRequirements ? `<div><strong>Special Requirements:</strong> ${data.specialRequirements}</div>` : ''}
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5175/admin/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              🚀 View in Dashboard
            </a>
            <a href="tel:${data.farmerPhone}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
              📞 Call Farmer
            </a>
          </div>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #dc2626; font-size: 14px;">
              <strong>⏰ Action Required:</strong> This request requires immediate attention. Please assign a tapper or contact the farmer as soon as possible.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2025 RubberEco. This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create land lease email content
const createLandLeaseEmailContent = (notificationData) => {
  const data = notificationData.data;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Land Lease Application</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 20px; text-align: center; color: white;">
          <div style="font-size: 32px; margin-bottom: 10px;">🏡</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Land Lease Application</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Review Required</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
            Application from <span style="color: #059669;">${data.farmerName}</span>
          </h2>

          <!-- Applicant Details -->
          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">👤 Applicant Information</h3>
            <div style="display: grid; gap: 10px;">
              <div><strong>Name:</strong> ${data.farmerName}</div>
              <div><strong>Email:</strong> <a href="mailto:${data.farmerEmail}">${data.farmerEmail}</a></div>
              <div><strong>Phone:</strong> <a href="tel:${data.farmerPhone}">${data.farmerPhone}</a></div>
            </div>
          </div>

          <!-- Land Requirements -->
          <div style="background: #fef3c7; border: 2px solid #fde047; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #a16207; margin: 0 0 15px 0; font-size: 18px;">🌾 Land Requirements</h3>
            <div style="display: grid; gap: 10px;">
              <div><strong>Desired Location:</strong> ${data.desiredLocation}</div>
              <div><strong>Land Size:</strong> ${data.landSize}</div>
              <div><strong>Lease Duration:</strong> ${data.leaseDuration}</div>
              <div><strong>Proposed Rent:</strong> ${data.proposedRent}</div>
              <div><strong>Intended Use:</strong> ${data.intendedUse}</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5175/admin/dashboard" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
              🚀 Review Application
            </a>
            <a href="tel:${data.farmerPhone}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              📞 Contact Applicant
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2025 RubberEco. This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create service request email content
const createServiceRequestEmailContent = (notificationData) => {
  const data = notificationData.data;
  const serviceType = data.serviceType === 'fertilizer' ? 'Fertilizer Application' : 'Rain Guard Installation';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Service Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px 20px; text-align: center; color: white;">
          <div style="font-size: 32px; margin-bottom: 10px;">🔧</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New ${serviceType} Request</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Service Assignment Required</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
            Request from <span style="color: #f97316;">${data.farmerName}</span>
          </h2>

          <!-- Farmer Details -->
          <div style="background: #fff7ed; border: 2px solid #fed7aa; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">👤 Farmer Information</h3>
            <div style="display: grid; gap: 10px;">
              <div><strong>Name:</strong> ${data.farmerName}</div>
              <div><strong>Email:</strong> <a href="mailto:${data.farmerEmail}">${data.farmerEmail}</a></div>
              <div><strong>Phone:</strong> <a href="tel:${data.farmerPhone}">${data.farmerPhone}</a></div>
            </div>
          </div>

          <!-- Service Details -->
          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">🌾 Service Requirements</h3>
            <div style="display: grid; gap: 10px;">
              <div><strong>Service Type:</strong> ${serviceType}</div>
              <div><strong>Farm Location:</strong> ${data.farmLocation}</div>
              <div><strong>Farm Size:</strong> ${data.farmSize}</div>
              <div><strong>Number of Trees:</strong> ${data.numberOfTrees}</div>
              <div><strong>Preferred Date:</strong> ${data.preferredDate}</div>
              <div><strong>Urgency:</strong> ${data.urgency.toUpperCase()}</div>
              <div><strong>Budget Range:</strong> ${data.budgetRange || 'Not specified'}</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5175/admin/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
              🚀 Assign Provider
            </a>
            <a href="tel:${data.farmerPhone}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              📞 Contact Farmer
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2025 RubberEco. This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create generic notification email content
const createGenericNotificationEmailContent = (notificationData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${notificationData.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px 20px; text-align: center; color: white;">
          <div style="font-size: 32px; margin-bottom: 10px;">🔔</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${notificationData.title}</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">New Notification</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">${notificationData.message}</p>

          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5175/admin/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
              🚀 View Dashboard
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2025 RubberEco. This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Convert HTML to plain text (basic implementation)
const convertHtmlToText = (html) => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

module.exports = {
  sendStaffWelcomeEmail,
  sendAdminNotificationEmail,
  testEmailConfig,
  createEmailTransporter
};

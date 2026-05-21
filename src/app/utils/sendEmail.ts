import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "mobinulislammahi@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "cnwydelplaqrqoln",
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"EASN Alumni Platform" <${process.env.GMAIL_USER || "mobinulislammahi@gmail.com"}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

// Email HTML Templates
export const getWelcomeTemplate = (name: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #1e3a8a;">Welcome to EASN Alumni Platform!</h2>
    <p>Dear ${name},</p>
    <p>Thank you for registering. Your profile is currently **Pending Approval** by the batch or school administrator.</p>
    <p>We will verify your details and notify you once your registration is approved. This usually takes 24-48 hours.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>Eidgah Adarsha Shiksha Niketon (EASN)</strong></p>
  </div>
`;

export const getApprovalTemplate = (name: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #10b981;">Account Approved!</h2>
    <p>Dear ${name},</p>
    <p>We are pleased to inform you that your registration on the **EASN Alumni Platform** has been approved!</p>
    <p>You can now log in, explore the alumni directory, join upcoming events, and participate in discussions.</p>
    <a href="${process.env.FRONTEND_URL || "https://easn-alumni.vercel.app"}/login" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login Now</a>
    <br/><br/>
    <p>Best Regards,</p>
    <p><strong>Eidgah Adarsha Shiksha Niketon (EASN)</strong></p>
  </div>
`;

export const getRejectionTemplate = (name: string, reason: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #ef4444;">Registration Update</h2>
    <p>Dear ${name},</p>
    <p>Thank you for your interest in the **EASN Alumni Platform**.</p>
    <p>Unfortunately, your registration could not be approved at this time for the following reason:</p>
    <blockquote style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 10px; margin: 15px 0;">${reason || "Information verification failed."}</blockquote>
    <p>If you believe this is a mistake, you can sign up again with the correct details or contact school support.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>Eidgah Adarsha Shiksha Niketon (EASN)</strong></p>
  </div>
`;

export const getResetPasswordTemplate = (resetUrl: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #1e3a8a;">Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    <a href="${resetUrl}" style="display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
    <p>This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>Eidgah Adarsha Shiksha Niketon (EASN)</strong></p>
  </div>
`;

export const getEventReminderTemplate = (eventTitle: string, date: string, venue: string, organizerPhone: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #1e3a8a;">Event Reminder: ${eventTitle}</h2>
    <p>Hello,</p>
    <p>This is a reminder for the upcoming event on the <strong>EASN Alumni Platform</strong>:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; width: 120px;">Event Name:</td>
        <td style="padding: 8px 0;">${eventTitle}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Date & Time:</td>
        <td style="padding: 8px 0;">${date}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Venue:</td>
        <td style="padding: 8px 0;">${venue}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Contact Phone:</td>
        <td style="padding: 8px 0;">${organizerPhone || "N/A"}</td>
      </tr>
    </table>
    <p>We look forward to seeing you there! Click the button below to confirm your RSVP or view event details:</p>
    <a href="${process.env.FRONTEND_URL || "https://easn-alumni.vercel.app"}/dashboard/student" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: bold; font-size: 15px;">Join Event</a>
    <br/><br/>
    <p>Best Regards,</p>
    <p><strong>Eidgah Adarsha Shiksha Niketon (EASN)</strong></p>
  </div>
`;

export const getNoticeTemplate = (title: string, content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #1e3a8a;">New School Notice: ${title}</h2>
    <p>Hello,</p>
    <p>A new important notice has been posted on the EASN Alumni Platform:</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px; margin: 15px 0; white-space: pre-line;">
      ${content}
    </div>
    <a href="${process.env.FRONTEND_URL || "https://easn-alumni.vercel.app"}/notices" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Board</a>
    <br/><br/>
    <p>Best Regards,</p>
    <p><strong>Eidgah Adarsha Shiksha Niketon (EASN)</strong></p>
  </div>
`;

export const getAdminNotificationTemplate = (studentName: string, batch: string, email: string, phone: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #1e3a8a;">New Student Registration Pending</h2>
    <p>Hello Admin,</p>
    <p>A new student has registered on the **EASN Alumni Platform** and is pending approval:</p>
    <ul>
      <li><strong>Name:</strong> ${studentName}</li>
      <li><strong>Batch:</strong> ${batch}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone}</li>
    </ul>
    <p>Please log in to the Admin Dashboard to review and approve/reject this registration.</p>
    <a href="${process.env.FRONTEND_URL || "https://easn-alumni.vercel.app"}/admin/dashboard" style="display: inline-block; background-color: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
    <br/><br/>
    <p>EASN Automation System</p>
  </div>
`;

import axios from "axios";

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("Skipping email delivery: RESEND_API_KEY is not defined.");
      return;
    }

    await axios.post(
      "https://api.resend.com/emails",
      {
        from: process.env.EMAIL_FROM || "EnjoyReads <noreply@enjoyreads.com>", 
        to: [to],
        subject: subject,
        html: htmlContent,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Email dispatched successfully via Resend REST API to: ${to}`);
  } catch (error) {
    console.error("Resend API Email Delivery Failure:", error.response?.data || error.message);
  }
};


export const sendOtpEmail = async (to, otp) => {
  const subject = "Your Verification Code";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-radius: 10px;">
      <h2 style="color: #005F7A; text-align: center;">Verify Your Account</h2>
      <p>Thank you for signing up! Please use the following 6-digit OTP code to complete your verification:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #005F7A; background: #f0f9ff; padding: 10px 20px; border-radius: 8px; border: 1px dashed #005F7A;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 12px; color: #666; text-align: center;">This code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
    </div>
  `;

  await sendEmail(to, subject, htmlContent);
};
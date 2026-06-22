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
        from: "EnjoyReads <noreply@enjoyreads.com>", 
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

    console.log(`Fulfillment email dispatched successfully via Resend REST API to: ${to}`);
  } catch (error) {
    console.error("Resend API Email Delivery Failure:", error.response?.data || error.message);
  }
};
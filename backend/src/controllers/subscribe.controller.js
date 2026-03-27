import Subscription from "../models/Subscription.js";
import nodemailer from "nodemailer";

export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide an email address." });
  }

  try {
    const existingSubscription = await Subscription.findOne({ email });

    if (existingSubscription) {
      return res.status(400).json({ message: "You're already part of our community ✨" });
    }

    const newSub = await Subscription.create({ email });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const unsubscribeLink = `${process.env.BACKEND_URL}/api/subscribe/unsubscribe/${newSub._id}`;

    const mailOptions = {
      from: `"EnjoyReads" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to EnjoyReads! 📚",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0ea5e9; text-align: center;">Welcome to the Library!</h2>
          <p>Thanks for joining us. You'll be the first to hear about new arrivals and deals.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/book-store" style="background: #0ea5e9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Browse Books</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Changed your mind? <a href="${unsubscribeLink}" style="color: #999;">Unsubscribe here</a>.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ success: true, message: "Subscribed! Check your inbox. ✨" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Subscription failed." });
  }
};

export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    await Subscription.findByIdAndDelete(id);
    // Redirecting to a frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/unsubscribe/success`);
  } catch (error) {
    res.status(500).redirect(`${process.env.FRONTEND_URL}/unsubscribe/error`);
  }
};

// Admin Broadcast Function
export const broadcastNewsletter = async (req, res) => {
  const { subject, title, message, imageUrl } = req.body;

  try {
    const subscribers = await Subscription.find({}, "email _id");
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const emailPromises = subscribers.map((sub) => {
      const unsubscribeLink = `${process.env.BACKEND_URL}/api/subscribe/unsubscribe/${sub._id}`;
      return transporter.sendMail({
        from: `"EnjoyReads Updates" <${process.env.EMAIL_USER}>`,
        to: sub.email,
        subject: subject || "New Updates from EnjoyReads",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
            <h1 style="color: #0ea5e9; text-align: center;">${title}</h1>
            ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; border-radius: 10px; margin: 20px 0;" />` : ""}
            <p style="font-size: 16px; line-height: 1.6; color: #334155;">${message}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/book-store" style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 99px; font-weight: bold;">Shop Now</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">
              Sent by EnjoyReads. <a href="${unsubscribeLink}" style="color: #94a3b8;">Unsubscribe</a>
            </p>
          </div>
        `,
      });
    });

    await Promise.all(emailPromises);
    res.status(200).json({ success: true, message: "Newsletter sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to broadcast newsletter." });
  }
};
import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  return await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export const sendWelcomeEmail =
  async ({
    email,
    firstName,
  }) => {
    try {
      const result =
        await sendEmail({
          to: email,
          subject:
            "Welcome to PaintMarket 🎨",
          html: `
            <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
              <h2>Hello ${firstName},</h2>

              <p>
                Welcome to PaintMarket.
              </p>

              <p>
                Your account has been created successfully and you can now:
              </p>

              <ul>
                <li>Browse products</li>
                <li>Place orders</li>
                <li>Track your orders</li>
                <li>Manage your account</li>
              </ul>

              <p>
                Thank you for choosing PaintMarket.
              </p>

              <br/>

              <p>
                Regards,<br/>
                PaintMarket Team
              </p>
            </div>
          `,
        });

      console.log(
        "Welcome email sent:",
        result
      );
    } catch (error) {
      console.error(
        "Welcome email error:",
        error
      );
    }
  };
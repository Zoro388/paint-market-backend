import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendPainterPendingEmail = async ({
  email,
  firstName,
}) => {
  const html = emailLayout({
    title: "Painter Application Submitted",

    subtitle: `Hello ${firstName}, thank you for applying to become a verified Paint Domain painter.`,

    content: `
      <div
        style="
          background:#F8F9FC;
          border-left:4px solid #D4A017;
          padding:20px;
          border-radius:8px;
          margin-top:20px;
        "
      >
        <h3 style="color:#0A2E63;margin-top:0;">
          Application Received
        </h3>

        <p style="line-height:1.8;color:#444;">
          Your painter application has been received successfully.
        </p>

        <p style="line-height:1.8;color:#444;">
          Our verification team will review:
        </p>

        <ul style="line-height:2;color:#444;">
          <li>Your profile information</li>
          <li>Your portfolio images</li>
          <li>Your verification video</li>
          <li>Your painting experience</li>
        </ul>
      </div>

      <div
        style="
          background:#FFF8E8;
          padding:20px;
          border-radius:8px;
          margin-top:20px;
        "
      >
        <strong style="color:#0A2E63;">
          Current Status
        </strong>

        <p style="line-height:1.8;color:#555;">
          Pending Review
        </p>

        <p style="line-height:1.8;color:#555;">
          You'll receive another email once your application has been reviewed.
        </p>
      </div>
    `,

    buttonText: "Login",

    buttonLink: `${process.env.FRONTEND_URL}/login`,
  });

  await sendEmail({
    to: email,
    subject: "🛠️ Painter Application Received",
    html,
  });
};
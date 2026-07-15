import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendPainterRejectedEmail = async ({
  email,
  firstName,
  reason,
}) => {
  const html = emailLayout({
    title: "Application Update",

    subtitle: `Hello ${firstName}, we've completed the review of your painter application.`,

    content: `
      <div
        style="
          background:#F8F9FC;
          border-left:4px solid #DC3545;
          padding:20px;
          border-radius:8px;
          margin-top:20px;
        "
      >
        <h3 style="color:#0A2E63;margin-top:0;">
          Application Not Approved
        </h3>

        <p style="line-height:1.8;color:#444;">
          Unfortunately, your application wasn't approved at this time.
        </p>

        <p style="line-height:1.8;color:#444;">
          <strong>Reason:</strong>
        </p>

        <p style="line-height:1.8;color:#555;">
          ${reason}
        </p>

        <p style="line-height:1.8;color:#555;">
          Please update your application and submit it again.
        </p>
      </div>
    `,

    buttonText: "Login",

    buttonLink: `${process.env.FRONTEND_URL}/login`,
  });

  await sendEmail({
    to: email,
    subject: "⚠ Painter Application Update",
    html,
  });
};
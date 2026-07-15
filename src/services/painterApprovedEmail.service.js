import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendPainterApprovedEmail = async ({
  email,
  firstName,
}) => {
  const html = emailLayout({
    title: "Application Approved",

    subtitle: `Congratulations ${firstName}! Your painter application has been approved.`,

    content: `
      <div
        style="
          background:#F8F9FC;
          border-left:4px solid #28A745;
          padding:20px;
          border-radius:8px;
          margin-top:20px;
        "
      >
        <h3 style="color:#0A2E63;margin-top:0;">
          Welcome to Paint Domain
        </h3>

        <p style="line-height:1.8;color:#444;">
          You are now a verified painter on our platform.
        </p>

        <ul style="line-height:2;color:#444;">
          <li>Receive customer requests</li>
          <li>Manage your painter dashboard</li>
          <li>Update your availability</li>
          <li>Grow your reputation</li>
        </ul>
      </div>
    `,

    buttonText: "Go To Dashboard",

    buttonLink: `${process.env.FRONTEND_URL}/login`,
  });

  await sendEmail({
    to: email,
    subject: "🎉 Your Painter Application Has Been Approved",
    html,
  });
};
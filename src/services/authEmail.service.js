import { sendEmail }
from "./email.service.js";

export const sendPasswordResetEmail =
async ({
  email,
  firstName,
  resetUrl,
}) => {

  await sendEmail({
    to: email,

    subject:
      "Reset Your Password",

    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>Hello ${firstName},</h2>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Click the button below to reset it.
        </p>

        <a
          href="${resetUrl}"
          style="
            background:#2563eb;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Reset Password
        </a>

        <p>
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request this, ignore this email.
        </p>

        <br/>

        <strong>
          Paint Market Team
        </strong>
      </div>
    `,
  });
};
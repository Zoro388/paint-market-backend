import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendResetPasswordSuccessEmail =
  async ({
    email,
    firstName,
  }) => {
    const html = emailLayout({
      title: "Password Updated Successfully",

      subtitle: `Hello ${firstName}, your Paint Domain account password has been successfully updated.`,

      content: `
        <div
          style="
            background:#ECFDF3;
            border-left:4px solid #16A34A;
            padding:20px;
            border-radius:8px;
            margin-top:20px;
          "
        >
          <h3
            style="
              margin-top:0;
              color:#15803D;
            "
          >
            Security Confirmation
          </h3>

          <p
            style="
              color:#444;
              line-height:1.8;
            "
          >
            Your account password was successfully changed.
          </p>

          <p
            style="
              color:#444;
              line-height:1.8;
            "
          >
            You can now sign in using your new password.
          </p>
        </div>

        <div
          style="
            background:#FFF8E8;
            padding:20px;
            border-radius:8px;
            margin-top:20px;
          "
        >
          <strong
            style="
              color:#0A2E63;
            "
          >
            Didn't make this change?
          </strong>

          <p
            style="
              color:#555;
              line-height:1.7;
            "
          >
            If you did not change your password,
            please contact our support team immediately
            and secure your account.
          </p>
        </div>
      `,
    });

    await sendEmail({
      to: email,

      subject:
        "✅ Password Changed Successfully",

      html,
    });
  };
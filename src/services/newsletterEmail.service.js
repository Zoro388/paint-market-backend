import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendNewsletterEmail =
  async ({
    email,
    firstName,
    title,
    message,
    image,
    buttonText,
    buttonLink,
  }) => {

    const html =
      emailLayout({
        title,

        subtitle: `Hello ${firstName},`,

        content: `
          ${
            image
              ? `
                <img
                  src="${image}"
                  alt="${title}"
                  style="
                    width:100%;
                    border-radius:12px;
                    margin-bottom:20px;
                  "
                />
              `
              : ""
          }

          <div
            style="
              background:#F8F9FC;
              padding:20px;
              border-radius:8px;
            "
          >
            <p
              style="
                color:#444;
                line-height:1.8;
              "
            >
              ${message}
            </p>
          </div>
        `,

        buttonText,

        buttonLink,
      });

    await sendEmail({
      to: email,
      subject: title,
      html,
    });
  };
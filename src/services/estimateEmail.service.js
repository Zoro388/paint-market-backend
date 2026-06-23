import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendEstimateResponseEmail =
  async ({
    customerName,
    email,
    estimatedAmount,
    adminResponse,
  }) => {
    try {

      const html = emailLayout({
        title:
          "Your Project Estimate Is Ready",

        subtitle: `Hello ${customerName}, our team has completed the review of your project and prepared an estimate for you.`,

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
            <h3
              style="
                margin-top:0;
                color:#0A2E63;
              "
            >
              Estimate Summary
            </h3>

            <p
              style="
                color:#444;
                line-height:1.8;
              "
            >
              Thank you for choosing Paint Domain.
            </p>

            <p
              style="
                color:#444;
                line-height:1.8;
              "
            >
              Based on the information provided,
              our team has prepared the following
              estimated project cost.
            </p>
          </div>

          <div
            style="
              background:#FFF8E8;
              padding:25px;
              border-radius:8px;
              margin-top:20px;
              text-align:center;
            "
          >
            <div
              style="
                color:#777;
                font-size:14px;
              "
            >
              Estimated Project Cost
            </div>

            <div
              style="
                font-size:32px;
                font-weight:bold;
                color:#0A2E63;
                margin-top:10px;
              "
            >
              ₦${Number(
                estimatedAmount || 0
              ).toLocaleString()}
            </div>
          </div>

          <div
            style="
              margin-top:20px;
              background:#F8F9FC;
              padding:20px;
              border-radius:8px;
            "
          >
            <strong
              style="
                color:#0A2E63;
              "
            >
              Message From Our Team
            </strong>

            <p
              style="
                margin-top:10px;
                color:#555;
                line-height:1.8;
              "
            >
              ${
                adminResponse ||
                "Our team will contact you shortly with further information."
              }
            </p>
          </div>

          <div
            style="
              margin-top:20px;
              background:#FFF8E8;
              padding:20px;
              border-radius:8px;
            "
          >
            <strong
              style="
                color:#0A2E63;
              "
            >
              Next Step
            </strong>

            <p
              style="
                margin-top:10px;
                color:#555;
                line-height:1.8;
              "
            >
              If you are satisfied with this estimate,
              you can proceed with the project and our
              team will guide you through the next phase.
            </p>
          </div>
        `,

        buttonText:
          "Visit Paint Domain",

        buttonLink:
          process.env.FRONTEND_URL ||
          "https://paintdomain.com",
      });

      await sendEmail({
        to: email,

        subject:
          "📋 Your Paint Domain Estimate Is Ready",

        html,
      });

      console.log(
        `Estimate email sent to ${email}`
      );

    } catch (error) {
      console.error(
        "Estimate email error:",
        error
      );
    }
  };
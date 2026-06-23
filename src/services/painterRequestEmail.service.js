import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendPainterResponseEmail =
  async ({
    customerName,
    email,
    estimatedCost,
    inspectionDate,
    adminResponse,
  }) => {
    try {
      const html = emailLayout({
        title:
          "Painter Request Update",

        subtitle: `Hello ${customerName}, our team has reviewed your painter request and provided an update below.`,

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
              Project Summary
            </h3>

            <p
              style="
                color:#444;
                line-height:1.8;
              "
            >
              Thank you for choosing Paint Domain
              for your painting project.
            </p>

            <p
              style="
                color:#444;
                line-height:1.8;
              "
            >
              Our team has carefully reviewed your
              request and prepared the following
              preliminary estimate.
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
              Estimated Cost
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
                estimatedCost || 0
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
              Inspection Date
            </strong>

            <p
              style="
                margin-top:10px;
                color:#555;
              "
            >
              ${
                inspectionDate
                  ? new Date(
                      inspectionDate
                    ).toDateString()
                  : "To Be Communicated"
              }
            </p>
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
                "Our team will contact you shortly with further details."
              }
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
          "🎨 Update On Your Painter Request",

        html,
      });

      console.log(
        `Painter response email sent to ${email}`
      );
    } catch (error) {
      console.error(
        "Painter response email error:",
        error
      );
    }
  };
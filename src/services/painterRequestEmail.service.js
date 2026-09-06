import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendPainterRequestEmail = async ({
  painterName,
  email,
  customerName,
  customerPhone,
  customerEmail,
  propertyLocation,
  projectType,
  propertyType,
  preferredStartDate,
  additionalNotes,
}) => {
  try {
    const html = emailLayout({
      title: "New Painting Request",

      subtitle: `Hello ${painterName}, you have received a new painting request from a customer.`,

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
            Customer Details
          </h3>

          <table
            style="
              width:100%;
              border-collapse:collapse;
              margin-top:15px;
            "
          >

            <tr>
              <td style="padding:8px 0;"><strong>Name</strong></td>
              <td>${customerName}</td>
            </tr>

            <tr>
              <td style="padding:8px 0;"><strong>Phone</strong></td>
              <td>${customerPhone}</td>
            </tr>

            <tr>
              <td style="padding:8px 0;"><strong>Email</strong></td>
              <td>${customerEmail}</td>
            </tr>

            <tr>
              <td style="padding:8px 0;"><strong>Location</strong></td>
              <td>${propertyLocation}</td>
            </tr>

            <tr>
              <td style="padding:8px 0;"><strong>Project Type</strong></td>
              <td>${projectType}</td>
            </tr>

            <tr>
              <td style="padding:8px 0;"><strong>Property Type</strong></td>
              <td>${propertyType || "Not specified"}</td>
            </tr>

            <tr>
              <td style="padding:8px 0;"><strong>Preferred Start Date</strong></td>
              <td>
                ${
                  preferredStartDate
                    ? new Date(preferredStartDate).toDateString()
                    : "Not specified"
                }
              </td>
            </tr>

          </table>

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
            Additional Notes
          </strong>

          <p
            style="
              margin-top:10px;
              color:#555;
              line-height:1.8;
            "
          >
            ${
              additionalNotes ||
              "The customer did not provide any additional notes."
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
            Next Step
          </strong>

          <p
            style="
              margin-top:10px;
              color:#555;
              line-height:1.8;
            "
          >
            Please log into your Paint Domain painter dashboard
            to either <strong>Accept</strong> or
            <strong>Decline</strong> this request.
          </p>

        </div>
      `,

      buttonText: "Open Painter Dashboard",

      buttonLink: `${process.env.FRONTEND_URL}/login`,
    });

    await sendEmail({
      to: email,
      subject: "🎨 New Customer Painting Request",
      html,
    });

    console.log(
      `Painter request notification email sent to ${email}`
    );

  } catch (error) {

    console.error(
      "Painter request notification email error:",
      error
    );

  }
};
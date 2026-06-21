import resend from "../config/resend.js";
export const sendPainterResponseEmail =
async ({
  customerName,
  email,
  estimatedCost,
  inspectionDate,
  adminResponse,
}) => {

  await resend.emails.send({
    from: process.env.EMAIL_FROM,

    to: email,

    subject:
      "Update On Your Painter Request",

    html: `
      <div style="font-family: Arial, sans-serif;">

        <h2>
          Paint Market Painter Request Update
        </h2>

        <p>
          Hello ${customerName},
        </p>

        <p>
          Thank you for requesting our painting services.
        </p>

        <h3>
          Estimated Cost:
          ₦${Number(
            estimatedCost
          ).toLocaleString()}
        </h3>

        <p>
          Inspection Date:
          ${
            inspectionDate
              ? new Date(
                  inspectionDate
                ).toDateString()
              : "To Be Communicated"
          }
        </p>

        <h4>
          Message From Our Team
        </h4>

        <p>
          ${adminResponse}
        </p>

        <br>

        <p>
          Regards,
          <br>
          Paint Market Team
        </p>

      </div>
    `,
  });
};
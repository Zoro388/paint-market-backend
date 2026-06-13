import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export const sendEstimateResponseEmail =
async ({
  customerName,
  email,
  estimatedAmount,
  adminResponse,
}) => {

  await resend.emails.send({
    from:
      process.env.EMAIL_FROM,

    to: email,

    subject:
      "Paint Market Estimate Response",

    html: `
      <div style="font-family: Arial, sans-serif">

        <h2>Paint Market Estimate Response</h2>

        <p>Hello ${customerName},</p>

        <p>
          Thank you for requesting a site estimate.
        </p>

        <h3>
          Estimated Amount:
          ₦${estimatedAmount.toLocaleString()}
        </h3>

        <p>
          ${adminResponse}
        </p>

        <br/>

        <p>
          Regards,
          <br/>
          Paint Market Team
        </p>

      </div>
    `,
  });
};
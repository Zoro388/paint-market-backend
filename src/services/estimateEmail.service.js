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
      "Your Paint Market Estimate Is Ready",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 20px;
      ">

        <h2 style="color:#0f172a;">
          Paint Market Estimate Response
        </h2>

        <p>
          Hello ${customerName},
        </p>

        <p>
          Thank you for requesting
          a painting estimate from
          Paint Market.
        </p>

        <div style="
          background:#f8fafc;
          padding:15px;
          border-radius:8px;
          margin:20px 0;
        ">
          <h3>
            Estimated Amount:
            ₦${Number(
              estimatedAmount
            ).toLocaleString()}
          </h3>
        </div>

        <h4>
          Message From Our Team
        </h4>

        <p>
          ${adminResponse}
        </p>

        <br>

        <p>
          If you would like to
          proceed with the project,
          kindly contact our team.
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
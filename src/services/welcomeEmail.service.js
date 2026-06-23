import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendWelcomeEmail = async ({
  email,
  firstName,
}) => {
  try {
    const html = emailLayout({
      title: "Welcome To Paint Domain",

      subtitle: `Hello ${firstName}, welcome to Paint Domain — your trusted destination for paints, painters, paint estimation and professional painting services.`,

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
              color:#0A2E63;
              margin-top:0;
            "
          >
            🎉 Your account is ready
          </h3>

          <p
            style="
              color:#444;
              line-height:1.8;
            "
          >
            Thank you for joining Paint Domain.
          </p>

          <p
            style="
              color:#444;
              line-height:1.8;
            "
          >
            You now have access to our growing ecosystem of
            paint products, professional painters and
            project estimation services.
          </p>

          <ul
            style="
              color:#444;
              line-height:2;
            "
          >
            <li>Browse premium paint products</li>
            <li>Request verified painters</li>
            <li>Get professional project estimates</li>
            <li>Track your orders</li>
            <li>Manage your account dashboard</li>
          </ul>
        </div>

        <div
          style="
            background:#FFF8E8;
            padding:20px;
            border-radius:8px;
            margin-top:20px;
          "
        >
          <h3
            style="
              color:#0A2E63;
              margin-top:0;
            "
          >
            Why Paint Domain?
          </h3>

          <p
            style="
              color:#555;
              line-height:1.8;
            "
          >
            We are building Nigeria's most trusted platform
            for paint products and painting services,
            connecting customers with quality materials
            and experienced professionals.
          </p>
        </div>

        <div
          style="
            margin-top:20px;
            padding:20px;
            background:#F8F9FC;
            border-radius:8px;
          "
        >
          <p
            style="
              margin:0;
              color:#555;
              line-height:1.8;
            "
          >
            Need assistance?
            Our support team is always ready to help.
          </p>
        </div>
      `,

      buttonText: "Explore Paint Domain",

      buttonLink:
        process.env.FRONTEND_URL ||
        "https://paintdomain.com",
    });

    const result = await sendEmail({
      to: email,
      subject: "🎨 Welcome To Paint Domain",
      html,
    });

    console.log(
      "Welcome email sent:",
      result
    );
  } catch (error) {
    console.error(
      "Welcome email error:",
      error
    );
  }
};
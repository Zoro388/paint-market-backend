import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendPainterRequestReceivedEmail =
async ({
    customerName,
    email,
}) => {

    try {

        const html = emailLayout({

            title:
            "Painter Request Received",

            subtitle:
            `Hello ${customerName}, we have successfully received your painter request.`,

            content:`

            <div
            style="
            background:#F8F9FC;
            border-left:4px solid #D4A017;
            padding:20px;
            border-radius:8px;
            margin-top:20px;
            ">

                <h3
                style="
                margin-top:0;
                color:#0A2E63;
                ">
                Request Received Successfully
                </h3>

                <p
                style="
                color:#444;
                line-height:1.8;
                ">
                Thank you for choosing Paint Domain.
                </p>

                <p
                style="
                color:#444;
                line-height:1.8;
                ">
                Your request has been forwarded to the selected painter.
                </p>

                <p
                style="
                color:#444;
                line-height:1.8;
                ">
                Once the painter accepts or declines your request,
                we will notify you immediately by email.
                </p>

            </div>

            <div
            style="
            background:#FFF8E8;
            padding:20px;
            border-radius:8px;
            margin-top:20px;
            ">

                <strong
                style="
                color:#0A2E63;
                ">
                What's Next?
                </strong>

                <ul
                style="
                margin-top:15px;
                color:#555;
                line-height:2;
                ">

                    <li>Your selected painter will review your request.</li>

                    <li>The painter will either accept or decline.</li>

                    <li>You will receive another email with the outcome.</li>

                </ul>

            </div>

            `,

            buttonText:
            "Visit Paint Domain",

            buttonLink:
            process.env.FRONTEND_URL,

        });

        await sendEmail({

            to: email,

            subject:
            "🎨 We Received Your Painter Request",

            html,

        });

        console.log(
            `Painter request confirmation email sent to ${email}`
        );

    } catch (error) {

        console.error(
            "Painter request confirmation email error:",
            error
        );

    }

};
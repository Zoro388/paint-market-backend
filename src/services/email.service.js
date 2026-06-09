import resend from "../config/mail.js";

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  return await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
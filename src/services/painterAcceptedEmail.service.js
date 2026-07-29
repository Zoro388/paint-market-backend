import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendPainterAcceptedEmail = async ({
customerName,
email,
painterName,
painterPhone,
painterEmail,
}) => {
try {

const html = emailLayout({

title: "Painter Request Accepted",

subtitle: `Hello ${customerName}, great news! Your selected painter has accepted your request.`,

content: `
<div
style="
background:#F8F9FC;
border-left:4px solid #28A745;
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
Your Painter Has Accepted
</h3>

<p
style="
color:#444;
line-height:1.8;
"
>
Congratulations! Your selected painter has accepted your painting request.
</p>

<p
style="
color:#444;
line-height:1.8;
"
>
The painter will contact you shortly using the information you provided.
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
Painter Contact Details
</strong>

<table
style="
width:100%;
margin-top:15px;
border-collapse:collapse;
"
>

<tr>
<td style="padding:8px 0;"><strong>Name</strong></td>
<td>${painterName}</td>
</tr>

<tr>
<td style="padding:8px 0;"><strong>Phone</strong></td>
<td>${painterPhone}</td>
</tr>

<tr>
<td style="padding:8px 0;"><strong>Email</strong></td>
<td>${painterEmail}</td>
</tr>

</table>

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
What's Next?
</strong>

<p
style="
margin-top:10px;
color:#555;
line-height:1.8;
"
>
Kindly communicate directly with your painter to agree on the project commencement date and every other project detail.
</p>

</div>
`,

buttonText: "Visit Paint Domain",

buttonLink:
process.env.FRONTEND_URL,

});

await sendEmail({

to: email,

subject:
"🎉 Your Painter Accepted Your Request",

html,

});

console.log(
`Painter accepted email sent to ${email}`
);

} catch (error) {

console.error(
"Painter accepted email error:",
error
);

}
};
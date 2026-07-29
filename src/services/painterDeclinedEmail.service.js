import { sendEmail } from "./email.service.js";
import { emailLayout } from "../templates/emailTemplate.js";

export const sendPainterDeclinedEmail = async ({
customerName,
email,
painterName,
reason,
}) => {
try {

const html = emailLayout({

title: "Painter Request Declined",

subtitle: `Hello ${customerName}, unfortunately your selected painter is unable to take on your project at this time.`,

content: `
<div
style="
background:#F8F9FC;
border-left:4px solid #DC3545;
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
Request Declined
</h3>

<p
style="
color:#444;
line-height:1.8;
"
>
We regret to inform you that
<strong>${painterName}</strong>
has declined your painting request.
</p>

<p
style="
color:#444;
line-height:1.8;
"
>
This may be due to availability,
scheduling conflicts, or other
personal reasons.
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
Reason Provided
</strong>

<p
style="
margin-top:10px;
color:#555;
line-height:1.8;
"
>
${
reason ||
"No specific reason was provided."
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
What's Next?
</strong>

<p
style="
margin-top:10px;
color:#555;
line-height:1.8;
"
>
Don't worry.
You can return to Paint Domain
and select another verified painter
for your project at any time.
</p>

</div>
`,

buttonText:
"Find Another Painter",

buttonLink:
`${process.env.FRONTEND_URL}/painters`,

});

await sendEmail({

to: email,

subject:
"❌ Your Painter Request Was Declined",

html,

});

console.log(
`Painter declined email sent to ${email}`
);

} catch (error) {

console.error(
"Painter declined email error:",
error
);

}
};
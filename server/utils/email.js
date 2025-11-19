import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const message = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: `<p>${options.message.replace(/\n/g, "<br />")}</p>`,
  };

  const { data, error } = await resend.emails.send(message);

  if (error) {
    console.error({ error });
    return;
  }
  console.log({ data });
};

export default sendEmail;

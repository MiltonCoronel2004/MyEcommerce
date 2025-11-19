import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const { data, error } = await resend.emails.send(message);

  if (error) {
    console.error({ error });
    return;
  }
  console.log({ data });
};

export default sendEmail;

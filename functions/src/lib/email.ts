import { Resend } from "resend";

export interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
  resendApiKey: string;
}

export async function sendEmail({
  to,
  from,
  subject,
  html,
  resendApiKey,
}: SendEmailParams): Promise<void> {
  const resend = new Resend(resendApiKey);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      throw error;
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Failed to send email", error);
    throw error;
  }
}

import { ENV } from "../lib/env.js";
import { resendClient } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, name, ClientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${ENV.EMAIL_FROM_NAME} <${ENV.EMAIL_FROM}>`,
    to: email,
    subject: "Welcome to chatSIP!",
    html: createWelcomeEmailTemplate(name, ClientURL),
  });
  if (error) {
    console.log("Error Occurred in Email", error);
  }
  console.log("EMAIL SUCCESS", data);
};

import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, link: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email - Kiddo News",
    html: `<p>Thank you for registering at Kiddo News!</p>
           <p>Please click the link below to verify your email:</p>
           <a href="${link}">Verify Email</a>`,
  };

  await transporter.sendMail(mailOptions);
}

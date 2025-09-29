import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInviteEmail(email: string, gameTitle: string, joinUrl: string): Promise<void> {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Business Bingo: Einladung zu "${gameTitle}"`,
    text: `Hallo, du wurdest zu "${gameTitle}" eingeladen. Klicke auf diesen Link: ${joinUrl}`,
    html: `
      <h2>Business Bingo Einladung</h2>
      <p>Hallo,</p>
      <p>du wurdest zu "<strong>${gameTitle}</strong>" eingeladen.</p>
      <p><a href="${joinUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Jetzt beitreten</a></p>
      <p>Oder kopiere diesen Link in deinen Browser: ${joinUrl}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendAdminEmail(email: string, gameTitle: string, adminUrl: string): Promise<void> {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Dein Admin-Zugang zu "${gameTitle}"`,
    text: `Hier ist dein Zugriff: ${adminUrl}`,
    html: `
      <h2>Business Bingo Admin-Zugang</h2>
      <p>Hallo,</p>
      <p>hier ist dein Admin-Zugang zu "<strong>${gameTitle}</strong>":</p>
      <p><a href="${adminUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Admin-Panel öffnen</a></p>
      <p>Oder kopiere diesen Link in deinen Browser: ${adminUrl}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
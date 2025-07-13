const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,      // smtp.sendgrid.net
  port: process.env.EMAIL_PORT,      // 587
  auth: {
    user: process.env.EMAIL_USER,    // 'apikey'
    pass: process.env.EMAIL_PASS     // your SendGrid API key
  }
});

function sendLoginNotification(to, name) {
  return transporter.sendMail({
    from: 'financetrackerteam5@gmail.com', // use your verified sender from SendGrid
    to,
    subject: 'New Login Notification',
    text: `Hi ${name || ''},\n\nA new login to your account was detected.\n\nIf this was not you, please secure your account immediately.\n\nBest,\nYour App Team`
  });
}

module.exports = { sendLoginNotification }; 
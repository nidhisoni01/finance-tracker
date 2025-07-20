const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey', // this is literally the string 'apikey'
    pass: process.env.SENDGRID_API_KEY
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
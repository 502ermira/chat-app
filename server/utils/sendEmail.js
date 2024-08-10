const sgMail = require('@sendgrid/mail');
require('dotenv').config();


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text,
    });
    console.log('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};

module.exports = sendEmail;

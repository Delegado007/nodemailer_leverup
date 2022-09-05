require('dotenv').config();

const config = {
  passwordCorreo: process.env.PASS_MAIL,
  mail: process.env.MAIL,
  receiver_mail: process.env.RECEIVER_MAIL,
  port: process.env.PORT
}

module.exports = { config };
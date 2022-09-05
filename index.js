const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const nodemailer = require("nodemailer")
const { config } = require('./config/index')
const port = config.port || 3000

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors())

app.get('/', (req, res) => {
  res.send('Server nodemailer listo');
})

app.post("/send_mail", cors(), async (req, res) => {
  let { name, mail, message } = req.body

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    tls: {
      rejectUnauthorized: false
    },
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.mail,
      pass: config.passwordCorreo
    }
  })

  await transport.sendMail({
    from: config.mail,
    to: config.receiver_mail,
    subject: "Contact for job",
    html: `<div className="email" style="
    border: 1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px; 
    ">
    <h2>Contact for job</h2>
    <p>Name: ${name}</p>
    
    <p>Mail: ${mail}</p>
    <b>${message}</b>
    </div>
    `
  })
  res.status(201).json("mail enviado");
})

app.listen(port, () => {
  console.log("Server is listening on port 3000")
})
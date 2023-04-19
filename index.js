const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const nodemailer = require("nodemailer")
const { config } = require('./config/index')
const port = config.port || 3000

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const whitelist = [
  'http://localhost:3000',
  'http://127.0.0.1:5600',
  'http://localhost:3006',
  'https://shimmering-gelato-9d8ded.netlify.app/',
];
const options = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido'));
    }
  },
};
app.use(cors(options));
app.get('/', (req, res) => {
  res.send('Server nodemailer listo');
})

app.post("/send_mail", cors(), async (req, res) => {
  const objForm = JSON.parse(req.body.json)
  let { nombre, apellido, empresa, cargo, email, cel, pais, message, token } = objForm
  const urlVerificacion = `https://www.google.com/recaptcha/api/siteverify?secret=${config.recapchaSecret}&response=${token}`;
  let resRecaptchaJson = {}
  try {
    const resRecaptcha = await fetch(urlVerificacion, { method: 'post' })
    resRecaptchaJson = await resRecaptcha.json();
    console.log(resRecaptchaJson)
  } catch (error) {
    console.log(error)
    return res.status(500).json("Hubo un error al comprobar el captcha");
  }
  if (resRecaptchaJson?.success === false) {
    return res.status(500).json("Hubo un error en la integridad del captcha");
  }
  if (resRecaptchaJson?.score < 0.7) {
    return res.status(500).json("No se admiten robots en este formulario");
  }

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
  try {
    console.log("[SMTP] enviando mail")
    await transport.sendMail({
      from: config.mail,
      to: config.receiver_mail,
      subject: "Contact for job",
      html: `
        <div className="email" style="
          border: 1px solid black;
          padding: 20px;
          font-family: sans-serif;
          line-height: 2;
          font-size: 20px; 
        ">
          <h2>Contacto LeverUp</h2>
          <p>Name: ${nombre} ${apellido}</p>
          <p>Email: ${email}</p>
          <p>Empresa: ${empresa}</p>
          <p>Cargo: ${cargo}</p>
          <p>Telefono: ${cel}</p>
          <p>Pais/Region: ${pais}</p>
          <br />
          <b>${message}</b>
        </div>
      `
    })
    console.log("[SMTP] mail enviado")
    return res.status(201).json("Mensaje enviado!");
  } catch (error) {
    res.status(500).json("Hubo un error")
  }
})

app.listen(port, () => {
  console.log("Server is listening on port 3000")
})
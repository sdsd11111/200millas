import nodemailer from 'nodemailer';

// Handler para Vercel Serverless Function /api/contacto
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { nombre, email, telefono, mensaje } = req.body || {};

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({
      success: false,
      message: 'Por favor completa todos los campos requeridos',
    });
  }

  // Configuración SMTP desde variables de entorno
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Correo al administrador (restaurante)
  const mailOptionsAdmin = {
    from: '"200 Millas - Contacto" <' + process.env.SMTP_USER + '>',
    to: process.env.SMTP_USER,
    replyTo: email,
    subject: `Nuevo mensaje de contacto de ${nombre}`,
    text: `Has recibido un nuevo mensaje de contacto:\n\nNombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono || 'No proporcionado'}\n\nMensaje:\n${mensaje}`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
      <h3>Mensaje:</h3>
      <p>${(mensaje || '').replace(/\n/g, '<br>')}</p>
    `,
  };

  // Correo de confirmación al usuario
  const mailOptionsUser = {
    from: '"200 Millas - Contacto" <' + process.env.SMTP_USER + '>',
    to: email,
    subject: 'Gracias por contactar a 200 Millas',
    text: `Hola ${nombre},\n\nGracias por contactar a 200 Millas. Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad posible.\n\nEste es un mensaje automático, por favor no responder a este correo.\n\nAtentamente,\nEl equipo de 200 Millas`,
    html: `
      <h2>¡Gracias por contactar a 200 Millas!</h2>
      <p>Hola ${nombre},</p>
      <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad posible.</p>
      <p>Este es un mensaje automático, por favor no responder a este correo.</p>
      <p>Atentamente,<br>El equipo de 200 Millas</p>
    `,
  };

  try {
    // 1. Enviar correo al administrador
    await transporter.sendMail(mailOptionsAdmin);

    // 2. Enviar correo de confirmación al usuario
    await transporter.sendMail(mailOptionsUser);

    return res.status(200).json({
      success: true,
      message: '¡Mensaje recibido! Nos pondremos en contacto contigo pronto.',
    });
  } catch (error) {
    console.error('Error al procesar la solicitud en /api/contacto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.',
    });
  }
}

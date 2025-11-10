export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { nombre, email, telefono, mensaje } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '200millas <onboarding@resend.dev>',  // Usando dominio verificado por Resend
        to: ['cristhopheryeach113@gmail.com', 'cliente@empresa.com'],
        subject: 'Nuevo mensaje desde 200millas',
        text: `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono || 'No proporcionado'}\n\nMensaje:\n${mensaje}`,
      }),
    });

    const responseData = await response.json();  // Para capturar errores detallados

    if (response.ok) {
      res.status(200).json({ success: true, message: 'Enviado!' });
    } else {
      console.error('Error de Resend:', responseData);
      res.status(500).json({ error: responseData.message || 'Error al enviar' });
    }
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

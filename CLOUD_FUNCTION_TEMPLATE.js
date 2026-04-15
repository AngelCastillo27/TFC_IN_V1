// ARCHIVO: functions/index.js
// Cloud Function para enviar emails de bienvenida

const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

// Obtener la API key de SendGrid desde las variables de entorno
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendWelcomeEmail = functions.https.onRequest(async (req, res) => {
  // Permitir CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Manejar preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const { email, displayName } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email es requerido" });
    }

    const userName = displayName || email.split("@")[0];

    const msg = {
      to: email,
      from: "noreply@turestaurant.com", // Cambia esto a tu email verificado en SendGrid
      subject: "¡Bienvenido a Tu Lugar Favorito de Comida China! 🥡",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F5F5DC; padding: 20px; border-radius: 8px; border: 3px solid #DC143C;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #DC143C; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
              ☯️ ¡BIENVENIDO! ☯️
            </h1>
            <p style="color: #8B0000; font-size: 20px; margin: 10px 0; font-weight: bold;">
              A Tu Lugar Favorito de Comida China
            </p>
          </div>

          <div style="background-color: white; padding: 25px; border-radius: 8px; border-left: 5px solid #DC143C; margin-bottom: 20px;">
            <p style="color: #1A1A1A; font-size: 16px; line-height: 1.6;">
              ¡Hola <strong>${userName}</strong>!
            </p>
            
            <p style="color: #1A1A1A; font-size: 16px; line-height: 1.6;">
              Nos complace enormemente que te unas a nuestra familia de clientes. En nuestro restaurante, 
              queremos ofrecerte la mejor experiencia gastronómica con la auténtica cocina china.
            </p>

            <p style="color: #1A1A1A; font-size: 16px; line-height: 1.6;">
              <strong>Te esperamos pronto para disfrutar de:</strong>
            </p>

            <ul style="color: #1A1A1A; font-size: 15px; line-height: 1.8;">
              <li>🥢 Platillos tradicionales chinos preparados con ingredientes frescos</li>
              <li>🍜 Sopas aromáticas y caldos caseros</li>
              <li>🥟 Dumplings y dim sum exquisitos</li>
              <li>🍚 Arroces y fideos hechos con maestría</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 20px; border-radius: 8px; border: 2px solid #DC143C; text-align: center; margin-bottom: 20px;">
            <p style="color: #8B0000; font-size: 18px; font-weight: bold; margin: 0; margin-bottom: 10px;">
              🎁 REGALO ESPECIAL PARA TI 🎁
            </p>
            <p style="color: #1A1A1A; font-size: 16px; font-weight: bold; margin: 0;">
              Por ser tu registro este mes, ¡tienes un POSTRE GRATIS 
              <br/>
              en tu primera compra!
            </p>
            <p style="color: #8B0000; font-size: 14px; margin-top: 10px; font-style: italic;">
              Válido para cualquier postre de nuestro menú
            </p>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 5px solid #FFD700;">
            <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">
              Puedes reservar una mesa en nuestro sistema o simplemente visitarnos. 
              Nuestro equipo está listo para brindarte la mejor atención.
            </p>
            <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">
              <strong>¡Esperamos verte pronto!</strong>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #DC143C;">
            <p style="color: #8B0000; font-size: 14px; margin: 0;">
              <strong>Tu Lugar Favorito de Comida China</strong>
            </p>
            <p style="color: #696969; font-size: 12px; margin: 5px 0;">
              📍 Dirección | 📞 Teléfono | 🌐 www.turestaurant.com
            </p>
          </div>

        </div>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({
      success: true,
      message: "Email de bienvenida enviado exitosamente",
    });
  } catch (error) {
    console.error("Error enviando email:", error);
    res.status(500).json({
      error: "Error al enviar el email",
      details: error.message,
    });
  }
});

// Exportar también como función HTTPS más simple
exports.sendWelcomeEmailHTTPS = functions.https.onCall(
  async (data, context) => {
    try {
      const { email, displayName } = data;

      if (!email) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Email es requerido",
        );
      }

      const userName = displayName || email.split("@")[0];

      const msg = {
        to: email,
        from: "noreply@turestaurant.com", // Cambia esto a tu email verificado en SendGrid
        subject: "¡Bienvenido a Tu Lugar Favorito de Comida China! 🥡",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F5F5DC; padding: 20px; border-radius: 8px; border: 3px solid #DC143C;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #DC143C; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
              ¡BIENVENIDO!
            </h1>
            <p style="color: #8B0000; font-size: 20px; margin: 10px 0; font-weight: bold;">
              A Tu Lugar Favorito de Comida China
            </p>
          </div>
          <div style="background-color: white; padding: 25px; border-radius: 8px; border-left: 5px solid #DC143C; margin-bottom: 20px;">
            <p style="color: #1A1A1A; font-size: 16px; line-height: 1.6;">
              ¡Hola <strong>${userName}</strong>!
            </p>
            <p style="color: #1A1A1A; font-size: 16px; line-height: 1.6;">
              Nos complace enormemente que te unas a nuestra familia. Te esperamos pronto.
            </p>
          </div>
          <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 20px; border-radius: 8px; border: 2px solid #DC143C; text-align: center;">
            <p style="color: #8B0000; font-size: 18px; font-weight: bold; margin: 0;">
              ¡POSTRE GRATIS en tu primera compra!
            </p>
          </div>
        </div>
      `,
      };

      await sgMail.send(msg);

      return {
        success: true,
        message: "Email enviado",
      };
    } catch (error) {
      console.error("Error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

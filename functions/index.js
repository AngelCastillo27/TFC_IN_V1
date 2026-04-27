/**
 * Tsinghe Cocina Fusión - Cloud Functions
 * Funciones del servidor para el restaurante.
 *
 * FUNCIONES:
 * 1. onUserCreated      - Trigger: al registrar usuario, crea su doc en Firestore
 * 2. sendWelcomeEmail   - HTTP: enviar email de bienvenida (llamado desde el cliente)
 * 3. onReservationWrite - Trigger: cuando se crea/cancela una reserva, actualiza la mesa
 * 4. initTables         - HTTP: inicializa las 20 mesas en Firestore (llamar UNA sola vez)
 *
 * DEPLOY: firebase deploy --only functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const {
  onDocumentCreated,
  onDocumentWritten,
} = require("firebase-functions/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

// ════════════════════════════════════════════════════════════════════════════
// 1. TRIGGER: nuevo usuario en Auth → crear documento en Firestore
//    Garantiza que SIEMPRE exista el documento aunque el cliente falle.
// ════════════════════════════════════════════════════════════════════════════
exports.onUserCreated = onDocumentCreated("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const data = event.data?.data();

  if (!data) {
    logger.warn("onUserCreated: documento vacio para uid", uid);
    return;
  }

  logger.info("Nuevo usuario registrado:", {
    uid,
    email: data.email,
    role: data.role,
  });

  // Si el documento no tiene rol, forzar "comensal" como fallback
  if (!data.role) {
    await db.collection("users").doc(uid).update({ role: "comensal" });
    logger.info("Rol asignado por defecto: comensal a", uid);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 2. HTTP: enviar email de bienvenida con Gmail/Nodemailer
// ════════════════════════════════════════════════════════════════════════════
const nodemailer = require("nodemailer");

// Configurar transporter de Gmail con opciones adicionales
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tsinghecocinafusion@gmail.com",
    pass: "rjpz pcrj zlvu spku",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.sendWelcomeEmail = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    // Habilitar CORS para llamadas desde el navegador
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Metodo no permitido" });
      return;
    }

    try {
      const { email, displayName } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email es obligatorio" });
        return;
      }

      const name = displayName || email.split("@")[0];

      // Enviar email real con Gmail/Nodemailer
      const info = await transporter.sendMail({
        from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
        to: email,
        subject: "¡Bienvenido a Tsinghe Cocina Fusión! 🍜",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5dc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .content h2 { color: #dc143c; margin-top: 0; }
            .content p { color: #333; line-height: 1.6; }
            .button { display: inline-block; background: #dc143c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍜 Tsinghe Cocina Fusión</h1>
            </div>
            <div class="content">
              <h2>¡Hola ${name}!</h2>
              <p>Gracias por registrarte en <strong>Tsinghe Cocina Fusión</strong>.</p>
              <p>Estamos muy felices de tenerte con nosotros. Ahora puedes:</p>
              <ul>
                <li>Explorar nuestro menú</li>
                <li>Hacer reservas de mesa</li>
                <li>Ver tus reservas anteriores</li>
              </ul>
              <p>¡Te esperamos para vivir una experiencia culinaria única!</p>
              <a href="https://digitalizacion-tsinge-fusion.web.app/" class="button">Visitar nuestro restaurante</a>
            </div>
            <div class="footer">
              <p>© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      });

      logger.info("EMAIL DE BIENVENIDA (real) enviado:", {
        to: email,
        name: name,
        messageId: info.messageId,
      });

      res.status(200).json({
        success: true,
        message: "Email enviado a " + email,
        messageId: info.messageId,
      });
    } catch (error) {
      logger.error("Error enviando email:", error);
      res
        .status(500)
        .json({ error: "Error interno al enviar el email: " + error.message });
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 3. TRIGGER: cuando se escribe una reserva → actualizar campo
//    "reservationCount" en el documento de la mesa correspondiente.
//    Esto permite saber en tiempo real cuantas reservas tiene cada mesa.
// ════════════════════════════════════════════════════════════════════════════
exports.onReservationWrite = onDocumentWritten(
  "reservations/{reservationId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    // Determinar que mesa(s) afectar
    const tableIdBefore = before?.tableId || null;
    const tableIdAfter = after?.tableId || null;

    // Funcion para recalcular el numero de reservas activas de una mesa
    const updateTableCount = async (tableId) => {
      if (!tableId) return;
      try {
        const snap = await db
          .collection("reservations")
          .where("tableId", "==", tableId)
          .where("status", "!=", "cancelada")
          .get();

        await db.collection("tables").doc(tableId).update({
          reservationCount: snap.size,
        });

        logger.info("Mesa actualizada:", {
          tableId,
          reservationCount: snap.size,
        });
      } catch (err) {
        logger.error("Error actualizando mesa:", { tableId, err: err.message });
      }
    };

    // Actualizar la mesa anterior (si cambio de mesa)
    if (tableIdBefore && tableIdBefore !== tableIdAfter) {
      await updateTableCount(tableIdBefore);
    }
    // Actualizar la mesa nueva/actual
    if (tableIdAfter) {
      await updateTableCount(tableIdAfter);
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 4. HTTP: inicializar las 20 mesas en Firestore
//    Llamar UNA SOLA VEZ desde el navegador o con curl:
//    curl -X POST https://us-central1-<proyecto>.cloudfunctions.net/initTables
//    Una vez ejecutada, las mesas quedan en Firestore y esta funcion
//    ya no hace falta volver a llamarla.
// ════════════════════════════════════════════════════════════════════════════
exports.initTables = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    if (req.method !== "POST") {
      res.status(405).json({ error: "Solo POST" });
      return;
    }

    try {
      // Capacidades de las 20 mesas (ajusta a tu gusto)
      const capacities = [
        2,
        2,
        4,
        4,
        4, // Mesas 1-5
        4,
        4,
        6,
        6,
        6, // Mesas 6-10
        6,
        4,
        4,
        4,
        4, // Mesas 11-15
        8,
        8,
        2,
        2,
        10, // Mesas 16-20
      ];

      const batch = db.batch();

      for (let i = 1; i <= 20; i++) {
        const tableRef = db.collection("tables").doc("mesa-" + i);

        // Si ya existe, no sobreescribir (merge: false evita borrar datos)
        const existing = await tableRef.get();
        if (existing.exists) {
          logger.info("Mesa ya existe, saltando:", i);
          continue;
        }

        batch.set(tableRef, {
          tableNumber: i,
          number: i,
          capacity: capacities[i - 1] || 4,
          active: true,
          available: true,
          reservationCount: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      logger.info("20 mesas inicializadas correctamente.");

      res.status(200).json({
        success: true,
        message: "Mesas inicializadas. Revisa Firestore > coleccion 'tables'.",
      });
    } catch (error) {
      logger.error("Error inicializando mesas:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 5. HTTP: enviar email con token para reset de contraseña
// ════════════════════════════════════════════════════════════════════════════
exports.sendPasswordResetEmail = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Metodo no permitido" });
      return;
    }

    try {
      const { email, token } = req.body;

      if (!email || !token) {
        res.status(400).json({ error: "Email y token son obligatorios" });
        return;
      }

      // Enviar email con el token
      const info = await transporter.sendMail({
        from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
        to: email,
        subject: "Recuperar tu contraseña - Tsinghe Cocina Fusión 🔐",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5dc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .content h2 { color: #dc143c; margin-top: 0; }
            .content p { color: #333; line-height: 1.6; }
            .token-box { background: #f0f0f0; border: 2px solid #dc143c; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .token-box .label { font-size: 12px; color: #666; text-transform: uppercase; }
            .token-box .token { font-size: 32px; font-weight: bold; color: #dc143c; letter-spacing: 5px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; color: #856404; font-size: 12px; }
            .footer { background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperar Contraseña</h1>
            </div>
            <div class="content">
              <h2>Hemos recibido tu solicitud de recuperación</h2>
              <p>Para recuperar tu contraseña, usa el siguiente token en nuestro sitio web:</p>
              
              <div class="token-box">
                <div class="label">Tu Token:</div>
                <div class="token">${token}</div>
              </div>

              <p><strong>Instrucciones:</strong></p>
              <ol>
                <li>Accede a la página de recuperación de contraseña</li>
                <li>Ingresa este token: <strong>${token}</strong></li>
                <li>Establece tu nueva contraseña</li>
                <li>¡Listo! Ya podrás acceder con tu nueva contraseña</li>
              </ol>

              <div class="warning">
                ⚠️ <strong>Este token expira en 15 minutos.</strong> Si no lo usas, tendrás que solicitar uno nuevo.
              </div>

              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Si no solicitaste esta recuperación, ignora este email.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      });

      logger.info("Email de reset de contraseña enviado:", {
        to: email,
        token: token,
        messageId: info.messageId,
      });

      res.status(200).json({
        success: true,
        message: "Email de recuperación enviado a " + email,
      });
    } catch (error) {
      logger.error("Error enviando email de reset:", error);
      res.status(500).json({
        error: "Error al enviar el email: " + error.message,
      });
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 6. HTTP: validar token y resetear contraseña
// ════════════════════════════════════════════════════════════════════════════
exports.resetPasswordWithToken = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Metodo no permitido" });
      return;
    }

    try {
      const { email, newPassword, token } = req.body;

      if (!email || !newPassword || !token) {
        res.status(400).json({
          error: "Email, token y newPassword son obligatorios",
        });
        return;
      }

      // Validar token en Firestore
      const resetDoc = await db.collection("passwordResets").doc(email).get();

      if (!resetDoc.exists) {
        res.status(400).json({
          error: "No hay solicitud de reset activa para este email",
        });
        return;
      }

      const resetData = resetDoc.data();

      // Validar token
      if (resetData.token !== token.toUpperCase()) {
        res.status(400).json({ error: "Token incorrecto" });
        return;
      }

      // Validar que no haya expirado
      if (new Date() > new Date(resetData.expiresAt.toDate())) {
        await db.collection("passwordResets").doc(email).delete();
        res.status(400).json({ error: "El token ha expirado" });
        return;
      }

      // Obtener usuario por email desde Firestore
      const userQuery = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (userQuery.empty) {
        res.status(400).json({ error: "Usuario no encontrado" });
        return;
      }

      const userId = userQuery.docs[0].id;

      // Cambiar contraseña en Firebase Auth
      try {
        await admin.auth().updateUser(userId, {
          password: newPassword,
        });

        logger.info("Contraseña actualizada para usuario:", { email, userId });
      } catch (authError) {
        logger.error("Error actualizando contraseña en Auth:", authError);
        res.status(500).json({
          error: "Error al actualizar la contraseña: " + authError.message,
        });
        return;
      }

      // Eliminar token de reset después de usarlo
      await db.collection("passwordResets").doc(email).delete();

      // Enviar email de confirmación
      try {
        await transporter.sendMail({
          from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
          to: email,
          subject: "Tu contraseña ha sido actualizada - Tsinghe Cocina Fusión",
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5dc; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { padding: 30px; }
              .footer { background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Contraseña Actualizada</h1>
              </div>
              <div class="content">
                <p>Tu contraseña ha sido actualizada exitosamente.</p>
                <p>Ya puedes iniciar sesión con tu nueva contraseña en Tsinghe Cocina Fusión.</p>
                <p style="color: #666; font-size: 12px;">Si no realizaste este cambio, contacta a soporte inmediatamente.</p>
              </div>
              <div class="footer">
                <p>© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        });
      } catch (emailError) {
        logger.warn("Email de confirmación no enviado:", emailError);
        // No fallar si el email de confirmación no se envía
      }

      res.status(200).json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      logger.error("Error en resetPasswordWithToken:", error);
      res.status(500).json({
        error: "Error interno: " + error.message,
      });
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 7. HTTP: inicializar menú básico con platos
//    Llamar UNA SOLA VEZ desde el navegador o con curl
// ════════════════════════════════════════════════════════════════════════════
exports.initMenuBasic = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    if (req.method !== "POST") {
      res.status(405).json({ error: "Solo POST" });
      return;
    }

    try {
      const menuItems = [
        // ENTRANTES
        {
          name: "Rollitos de Primavera",
          description: "Crujientes rollitos rellenos de verduras y camarones",
          category: "Entrantes",
          price: 6.50,
          available: true,
          active: true,
        },
        {
          name: "Tabla de Embutidos",
          description: "Selección de embutidos ibéricos y quesos variados",
          category: "Entrantes",
          price: 12.00,
          available: true,
          active: true,
        },
        {
          name: "Bruschettas Variadas",
          description: "Pan tostado con tomate, queso y hierbas aromáticas",
          category: "Entrantes",
          price: 8.00,
          available: true,
          active: true,
        },
        {
          name: "Tabla de Quesos",
          description: "Selección de quesos nacionales e internacionales",
          category: "Entrantes",
          price: 14.00,
          available: true,
          active: true,
        },

        // PRINCIPALES - CARNES
        {
          name: "Filete Mignon a la Pimienta",
          description: "Filete de carne con salsa de pimienta negra y hierbas",
          category: "Principales - Carnes",
          price: 22.00,
          available: true,
          active: true,
        },
        {
          name: "Carne Asada al Carbón",
          description: "Trozos de carne premium a la parrilla con chimichurri",
          category: "Principales - Carnes",
          price: 24.00,
          available: true,
          active: true,
        },
        {
          name: "Pollo a la Naranja",
          description: "Pechuga de pollo glaseada con salsa de naranja y jengibre",
          category: "Principales - Carnes",
          price: 18.00,
          available: true,
          active: true,
        },

        // PRINCIPALES - PESCADOS
        {
          name: "Salmón a la Mantequilla",
          description: "Filete de salmón fresco con salsa de mantequilla y limón",
          category: "Principales - Pescados",
          price: 20.00,
          available: true,
          active: true,
        },
        {
          name: "Lubina al Horno",
          description: "Lubina entera con verduras asadas y aceite de oliva",
          category: "Principales - Pescados",
          price: 21.00,
          available: true,
          active: true,
        },
        {
          name: "Camarones al Ajillo",
          description: "Camarones frescos salteados con ajo, limón y perejil",
          category: "Principales - Pescados",
          price: 19.00,
          available: true,
          active: true,
        },

        // PRINCIPALES - VEGETARIANOS
        {
          name: "Risotto de Champiñones",
          description: "Arroz cremoso con champiñones variados y parmesano",
          category: "Principales - Vegetarianos",
          price: 15.00,
          available: true,
          active: true,
        },
        {
          name: "Pasta a la Trufa",
          description: "Pasta fresca con salsa de trufa negra y hongos silvestres",
          category: "Principales - Vegetarianos",
          price: 16.00,
          available: true,
          active: true,
        },
        {
          name: "Berenjena a la Parmesana",
          description: "Capas de berenjena, tomate y queso mozzarella gratinado",
          category: "Principales - Vegetarianos",
          price: 14.00,
          available: true,
          active: true,
        },

        // BEBIDAS
        {
          name: "Vino Tinto Reserva",
          description: "Vino tinto español de excelente calidad",
          category: "Bebidas",
          price: 10.00,
          available: true,
          active: true,
        },
        {
          name: "Vino Blanco Sauvignon",
          description: "Vino blanco fresco con notas cítricas",
          category: "Bebidas",
          price: 9.50,
          available: true,
          active: true,
        },
        {
          name: "Cerveza Artesanal",
          description: "Cerveza artesanal local de 330ml",
          category: "Bebidas",
          price: 4.50,
          available: true,
          active: true,
        },
        {
          name: "Jugo Natural de Frutas",
          description: "Jugo fresco de frutas variadas",
          category: "Bebidas",
          price: 5.00,
          available: true,
          active: true,
        },

        // POSTRES
        {
          name: "Tiramisú Clásico",
          description: "Postre italiano con capas de bizcochos, café y mascarpone",
          category: "Postres",
          price: 7.00,
          available: true,
          active: true,
        },
        {
          name: "Flan de Caramelo",
          description: "Flan casero con salsa de caramelo",
          category: "Postres",
          price: 6.00,
          available: true,
          active: true,
        },
        {
          name: "Mousse de Chocolate",
          description: "Mousse de chocolate belga con galleta de canela",
          category: "Postres",
          price: 7.50,
          available: true,
          active: true,
        },
        {
          name: "Fresas con Crema",
          description: "Fresas frescas con crema batida y merengue",
          category: "Postres",
          price: 8.00,
          available: true,
          active: true,
        },
      ];

      const batch = db.batch();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      for (const item of menuItems) {
        const docRef = db.collection("menus").doc();
        batch.set(docRef, {
          ...item,
          createdAt: timestamp,
        });
      }

      await batch.commit();
      logger.info("Menú básico inicializado con", menuItems.length, "platos");

      res.status(200).json({
        success: true,
        message: `Menú inicializado con ${menuItems.length} platos`,
      });
    } catch (error) {
      logger.error("Error inicializando menú:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

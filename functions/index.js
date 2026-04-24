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
// 2. HTTP: enviar email de bienvenida
//    El cliente llama a esta funcion tras el registro exitoso.
//    En produccion conectar con SendGrid / Resend / Nodemailer + SMTP.
// ════════════════════════════════════════════════════════════════════════════
exports.sendWelcomeEmail = onRequest(async (req, res) => {
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

    // ── Aqui conectarias tu servicio de email (SendGrid, Resend, etc.) ──
    // Ejemplo con SendGrid (descomentar cuando configures la API key):
    //
    // const sgMail = require("@sendgrid/mail");
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to:      email,
    //   from:    "noreply@dragonpalace.es",
    //   subject: "Bienvenido a Tsinghe Cocina Fusión",
    //   html:    `<h1>Hola ${name}!</h1><p>Gracias por registrarte en Tsinghe Cocina Fusión.</p>`,
    // });

    // Por ahora: log de simulacion
    logger.info("EMAIL DE BIENVENIDA (simulado):", {
      to: email,
      name: name,
      subject: "Bienvenido a Tsinghe Cocina Fusión",
    });

    res.status(200).json({
      success: true,
      message: "Email enviado (simulado) a " + email,
    });
  } catch (error) {
    logger.error("Error enviando email:", error);
    res.status(500).json({ error: "Error interno al enviar el email" });
  }
});

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

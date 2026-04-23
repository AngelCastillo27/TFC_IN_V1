#!/usr/bin/env node

/**
 * Script para inicializar las 20 mesas en Firestore
 * Ejecutar con: node init-tables.js
 */

const admin = require('firebase-admin');

// Usar las credenciales del proyecto local
const serviceAccount = {
  type: "service_account",
  project_id: "digitalizacion-tsinge-fusion",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

// Si no hay credenciales de servicio, usar configuración por defecto
if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.log('⚠️ No hay credenciales de servicio configuradas. Usando configuración por defecto.');
  console.log('Para inicializar mesas en producción, configura las variables de entorno FIREBASE_PRIVATE_KEY, etc.');
  console.log('Por ahora, las mesas se inicializarán cuando se despliegue la función initTables.');
  process.exit(0);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://digitalizacion-tsinge-fusion-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function initTables() {
  console.log('🍽️ Inicializando 20 mesas en Firestore...\n');

  try {
    // Capacidades de las 20 mesas
    const capacities = [
      2, 2, 4, 4, 4,   // Mesas 1-5
      4, 4, 6, 6, 6,   // Mesas 6-10
      6, 4, 4, 4, 4,   // Mesas 11-15
      8, 8, 2, 2, 10,  // Mesas 16-20
    ];

    const batch = db.batch();
    let created = 0;

    for (let i = 1; i <= 20; i++) {
      const tableRef = db.collection("tables").doc("mesa-" + i);

      // Verificar si ya existe
      const existing = await tableRef.get();
      if (existing.exists) {
        console.log(`⏭️ Mesa ${i} ya existe, saltando...`);
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

      created++;
      console.log(`✅ Mesa ${i} preparada (capacidad: ${capacities[i - 1] || 4})`);
    }

    if (created > 0) {
      await batch.commit();
      console.log(`\n🎉 ¡${created} mesas creadas exitosamente!`);
    } else {
      console.log('\nℹ️ Todas las mesas ya existen.');
    }

    console.log('\n📋 Resumen de mesas:');
    for (let i = 1; i <= 20; i++) {
      console.log(`  Mesa ${i}: ${capacities[i - 1] || 4} personas`);
    }

  } catch (error) {
    console.error('❌ Error inicializando mesas:', error.message);
    process.exit(1);
  }
}

initTables();
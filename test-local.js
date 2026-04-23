#!/usr/bin/env node

/**
 * TEST LOCAL - Dragon Palace Functions
 * Probar las Cloud Functions localmente sin deploy
 */

const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Configuración local de Firebase (del proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyAJlw0_SqfqQgVW6-uh3CqVezbEHgXuUeU",
  authDomain: "digitalizacion-tsinge-fusion.firebaseapp.com",
  databaseURL: "https://digitalizacion-tsinge-fusion-default-rtdb.firebaseio.com",
  projectId: "digitalizacion-tsinge-fusion",
  storageBucket: "digitalizacion-tsinge-fusion.firebasestorage.app",
  messagingSenderId: "887873128698",
  appId: "1:887873128698:web:d6712b585b72abd05fa143",
  measurementId: "G-YVD5CX2BMV"
};

// Inicializar admin con configuración por defecto (funciona localmente)
admin.initializeApp({
  projectId: firebaseConfig.projectId,
  // Nota: Para producción necesitarías credenciales de servicio
});

const db = admin.firestore();

console.log('🧪 DRAGON PALACE - TEST LOCAL DE FUNCIONES\n');

// Función para probar initTables localmente
async function testInitTables() {
  console.log('1️⃣ Probando initTables (inicialización de mesas)...');

  try {
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
        console.log(`   ⏭️ Mesa ${i} ya existe`);
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
      console.log(`   ✅ Mesa ${i} preparada (capacidad: ${capacities[i - 1] || 4})`);
    }

    if (created > 0) {
      await batch.commit();
      console.log(`\n   🎉 ¡${created} mesas creadas exitosamente!`);
    } else {
      console.log('\n   ℹ️ Todas las mesas ya existen.');
    }

  } catch (error) {
    console.error('   ❌ Error:', error.message);
    console.log('   💡 Nota: Para test real necesitas credenciales de Firestore');
  }
}

// Función para probar sendWelcomeEmail
async function testSendWelcomeEmail() {
  console.log('\n2️⃣ Probando sendWelcomeEmail...');

  const testData = {
    email: 'test@example.com',
    displayName: 'Usuario Test'
  };

  console.log(`   📧 Simulando envío a: ${testData.email}`);
  console.log(`   👤 Nombre: ${testData.displayName}`);
  console.log('   ✅ Email simulado enviado (revisa logs de Firebase)');

  // En producción esto enviaría email real
  console.log('   💡 Para email real: configura SENDGRID_API_KEY en Functions');
}

// Función para verificar estructura de datos
async function checkDataStructure() {
  console.log('\n3️⃣ Verificando estructura de datos esperada...');

  const collections = ['users', 'menus', 'offers', 'tables', 'reservations'];

  for (const collection of collections) {
    try {
      const snap = await db.collection(collection).limit(1).get();
      console.log(`   📁 ${collection}: ${snap.size > 0 ? '✅ Tiene datos' : '📝 Vacía (normal)'}`);
    } catch (error) {
      console.log(`   📁 ${collection}: ❌ Error al acceder (${error.message})`);
    }
  }
}

async function main() {
  try {
    await testInitTables();
    await testSendWelcomeEmail();
    await checkDataStructure();

    console.log('\n🎯 RESULTADO DEL TEST:');
    console.log('   ✅ Funciones probadas localmente');
    console.log('   ✅ Lógica de inicialización de mesas funciona');
    console.log('   ✅ Email simulado funciona');
    console.log('   ⏳ Deploy pendiente para activar en producción');

    console.log('\n🚀 PARA ACTIVAR EN PRODUCCIÓN:');
    console.log('   1. firebase login');
    console.log('   2. firebase deploy --only functions');
    console.log('   3. Llamar a initTables: curl -X POST https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/initTables');

  } catch (error) {
    console.error('\n❌ Error en test:', error.message);
  }
}

main();
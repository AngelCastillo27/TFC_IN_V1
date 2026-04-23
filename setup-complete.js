#!/usr/bin/env node

/**
 * SETUP COMPLETO - Dragon Palace Restaurant
 * Script para configurar todo el backend de Firebase
 */

const fs = require('fs');
const path = require('path');

console.log('🍽️ DRAGON PALACE - SETUP COMPLETO\n');

// Verificar archivos necesarios
const requiredFiles = [
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  'functions/index.js',
  'functions/package.json'
];

console.log('📋 Verificando archivos de configuración...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos de configuración. Revisa el proyecto.');
  process.exit(1);
}

console.log('\n🚀 INSTRUCCIONES PARA DEPLOY COMPLETO:\n');

// Paso 1: Login
console.log('1️⃣ AUTENTICACIÓN FIREBASE:');
console.log('   firebase login');
console.log('   (Ve a la URL que te muestre y autoriza)\n');

// Paso 2: Configurar proyecto
console.log('2️⃣ CONFIGURAR PROYECTO:');
console.log('   firebase use --add digitalizacion-tsinge-fusion\n');

// Paso 3: Deploy por partes
console.log('3️⃣ DEPLOY FIRESTORE RULES:');
console.log('   firebase deploy --only firestore:rules\n');

console.log('4️⃣ DEPLOY FIRESTORE INDEXES:');
console.log('   firebase deploy --only firestore:indexes\n');

console.log('5️⃣ DEPLOY CLOUD FUNCTIONS:');
console.log('   firebase deploy --only functions\n');

// Paso 4: Inicializar mesas
console.log('6️⃣ INICIALIZAR 20 MESAS:');
console.log('   curl -X POST https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/initTables');
console.log('   (O desde el navegador: POST a esa URL)\n');

// Paso 5: Verificar
console.log('7️⃣ VERIFICAR INSTALACIÓN:');
console.log('   - Ve a Firebase Console > Firestore Database');
console.log('   - Deberías ver las colecciones: users, menus, offers, tables, reservations');
console.log('   - En Functions deberías ver: onUserCreated, sendWelcomeEmail, onReservationWrite, initTables\n');

// Scripts alternativos
console.log('📝 SCRIPTS DISPONIBLES:');
console.log('   npm run deploy        # Deploy completo');
console.log('   npm run init:tables   # Inicializar mesas (local)');
console.log('   npm run emulators     # Ejecutar emuladores locales\n');

console.log('🎯 ESTADO ACTUAL:');
console.log('   ✅ Frontend completo y funcional');
console.log('   ✅ Firebase configurado (esperando deploy)');
console.log('   ⏳ Deploy pendiente (requiere login Firebase)\n');

console.log('💡 PRÓXIMOS PASOS:');
console.log('   1. Ejecuta "firebase login"');
console.log('   2. Ejecuta "npm run deploy"');
console.log('   3. Tu app estará 100% funcional! 🚀\n');
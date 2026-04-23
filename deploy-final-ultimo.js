#!/usr/bin/env node

/**
 * DEPLOY FINAL - Último intento automático
 * Si falla, proporciona instrucciones manuales claras
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏮 DRAGON PALACE - DEPLOY FINAL 🏮\n');

// Función para ejecutar comandos con mejor manejo de errores
const runCommand = (command, description) => {
  try {
    console.log(`🔄 ${description}...`);
    const result = execSync(command, { encoding: 'utf8', timeout: 60000 });
    console.log(`✅ ${description} completado!\n`);
    return result;
  } catch (error) {
    console.log(`❌ Error en ${description}: ${error.message}\n`);
    return null;
  }
};

// Verificar si Firebase CLI está disponible
const checkFirebase = () => {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

// Verificar login
const checkLogin = () => {
  try {
    const result = execSync('firebase projects:list --json', { encoding: 'utf8' });
    const data = JSON.parse(result);
    return data.status === 'success';
  } catch {
    return false;
  }
};

// Función principal
const main = async () => {
  console.log('🔍 Verificando entorno...\n');

  // Verificar Firebase CLI
  if (!checkFirebase()) {
    console.log('❌ Firebase CLI no está instalado.');
    console.log('Instálalo con: npm install -g firebase-tools\n');
    process.exit(1);
  }

  console.log('✅ Firebase CLI disponible\n');

  // Verificar login
  if (!checkLogin()) {
    console.log('❌ No estás logueado en Firebase.');
    console.log('Ejecuta: firebase login\n');
    console.log('Luego vuelve a ejecutar este script.\n');
    process.exit(1);
  }

  console.log('✅ Login verificado\n');

  // Cambiar al directorio correcto
  process.chdir(path.dirname(__filename));

  console.log('🚀 Iniciando deploy completo...\n');

  // Deploy de Firestore rules
  const rulesResult = runCommand('firebase deploy --only firestore:rules', 'Desplegando reglas de Firestore');

  // Deploy de Firestore indexes
  const indexesResult = runCommand('firebase deploy --only firestore:indexes', 'Desplegando índices de Firestore');

  // Deploy de functions
  const functionsResult = runCommand('firebase deploy --only functions', 'Desplegando Cloud Functions');

  // Verificar resultados
  if (rulesResult && indexesResult && functionsResult) {
    console.log('🎊 ¡DEPLOY COMPLETADO EXITOSAMENTE! 🎊\n');

    console.log('📋 Próximos pasos:');
    console.log('1️⃣ Inicializar mesas:');
    console.log('   curl -X POST https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/initTables\n');

    console.log('2️⃣ Verificar en Firebase Console:');
    console.log('   https://console.firebase.google.com/project/digitalizacion-tsinge-fusion/functions\n');

    console.log('3️⃣ Tu restaurante está listo:');
    console.log('   https://digitalizacion-tsinge-fusion.web.app/\n');

    console.log('🏆 ¡FELICITACIONES! Tu aplicación está al 100% operativa.\n');

  } else {
    console.log('⚠️ Algunos deploys fallaron. Aquí están las instrucciones manuales:\n');

    console.log('🔧 INSTRUCCIONES MANUALES PARA COMPLETAR EL DEPLOY:\n');

    console.log('1️⃣ Deploy de Firestore:');
    console.log('   firebase deploy --only firestore:rules');
    console.log('   firebase deploy --only firestore:indexes\n');

    console.log('2️⃣ Deploy de Functions:');
    console.log('   firebase deploy --only functions\n');

    console.log('3️⃣ Inicializar mesas:');
    console.log('   curl -X POST https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/initTables\n');

    console.log('4️⃣ Verificar:');
    console.log('   Ve a Firebase Console > Functions y verifica que aparezcan 4 funciones');
    console.log('   Ve a Firestore Database y verifica las colecciones\n');

    console.log('📖 También puedes revisar el README-FINAL.md para más detalles.\n');
  }
};

main().catch(console.error);
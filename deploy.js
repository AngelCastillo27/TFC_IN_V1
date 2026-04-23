#!/usr/bin/env node

/**
 * Deploy script para Firebase
 * Despliega: Firestore rules, indexes y Cloud Functions
 */

const { exec } = require('child_process');
const path = require('path');

const projectRoot = __dirname;

const commands = [
  {
    name: '📋 Desplegando Firestore Rules',
    cmd: 'npx -y firebase-tools@latest deploy --only firestore:rules',
  },
  {
    name: '📑 Desplegando Firestore Indexes',
    cmd: 'npx -y firebase-tools@latest deploy --only firestore:indexes',
  },
  {
    name: '☁️ Desplegando Cloud Functions',
    cmd: 'npx -y firebase-tools@latest deploy --only functions',
  },
];

const runCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${cmd}\n`);
    exec(cmd, { cwd: projectRoot, shell: true }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(stderr);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
};

const main = async () => {
  console.log('🍽️ DRAGON PALACE - DEPLOY FIREBASE\n');
  console.log('Iniciando despliegue...\n');

  try {
    for (const { name, cmd } of commands) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(name);
      console.log('='.repeat(60));
      await runCommand(cmd);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ¡DESPLIEGUE COMPLETADO!');
    console.log('='.repeat(60));
    console.log('\n✨ Siguiente paso: Inicializar las 20 mesas en Firestore');
    console.log('Usa: npm run init:tables\n');
  } catch (error) {
    console.error('\n❌ Error en el despliegue:', error.message);
    process.exit(1);
  }
};

main();

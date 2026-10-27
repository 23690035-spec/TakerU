const { execSync } = require('child_process');

const mensaje = process.argv.slice(2).join(' ').trim() || 'Actualización de TecSolv';
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

run('git add -A');
try {
  run(`git commit -m ${JSON.stringify(mensaje)}`);
} catch (e) {
  console.log('No hay cambios para confirmar.');
  process.exit(0);
}
run('git push');
console.log('\nListo. GitHub compilará el nuevo APK y los usuarios recibirán el aviso de actualización.');

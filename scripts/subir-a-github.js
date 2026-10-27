const { execSync } = require('child_process');
const fs = require('fs');

const url = process.argv[2];
if (!url) {
  console.error('Uso: node scripts/subir-a-github.js https://github.com/USUARIO/tecsolv.git');
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

if (!fs.existsSync('.git')) {
  run('git init -b main');
}
run('git add -A');
try {
  run('git commit -m "Versión inicial de TecSolv"');
} catch (e) {
  console.log('Nada nuevo que confirmar.');
}
try {
  execSync('git remote remove origin', { stdio: 'ignore' });
} catch (e) {}
run(`git remote add origin ${url}`);
run('git push -u origin main');
console.log('\nListo. En GitHub ve a Actions: se compilará el APK y aparecerá en Releases.');

const fs = require('fs');
const cp = require('child_process');

function listZip(zipFile) {
  console.log('Inspecting:', zipFile);
  const out = cp.execSync(`tar -tf "${zipFile}"`, { encoding: 'utf8' });
  const lines = out.trim().split('\n');
  console.log(`Total entries: ${lines.length}`);
  console.log('Sample entries:');
  lines.slice(0, 15).forEach(l => console.log('  ' + l));
}

listZip('C:/instructify/instructify-brand-update.zip');
listZip('C:/instructify/instructify-cpanel-deploy.zip');

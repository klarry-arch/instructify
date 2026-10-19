import fs from 'fs';
import path from 'path';

const apiFiles = fs.readdirSync('api').filter(f => f.endsWith('.js'));
for (const f of apiFiles) {
  const content = fs.readFileSync(path.join('api', f), 'utf8');
  const lines = content.split('\n');
  const importLines = lines.filter(l => l.includes('import ') || l.includes('require('));
  console.log('===', f, '===');
  importLines.forEach(l => console.log('  ', l.trim()));
}

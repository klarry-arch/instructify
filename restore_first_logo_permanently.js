const fs = require('fs');
const path = require('path');

const srcLogo = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\37ba8ac0-a719-439a-a5ef-475a727da396\\logo_new_1786385786879.png';
const destDir = 'c:\\instructify\\assets\\images';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(srcLogo, path.join(destDir, 'logo.png'));
fs.copyFileSync(srcLogo, path.join(destDir, 'logo_new.png'));

console.log('Restored the very first logo (logo_new_1786385786879.png) to assets/images/logo.png');

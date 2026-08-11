const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\37ba8ac0-a719-439a-a5ef-475a727da396\\edtech_logo_concept_1786387835221.png';
const destDir = 'c:\\instructify\\assets\\images';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, path.join(destDir, 'logo.png'));
fs.copyFileSync(src, path.join(destDir, 'edtech_logo.png'));

console.log('EdTech logo copied to assets/images/logo.png and assets/images/edtech_logo.png');

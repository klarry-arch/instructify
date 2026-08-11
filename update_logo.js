const fs = require('fs');
const path = require('path');

// 1. Copy the image
const src = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\2f103423-e0e1-4076-88a3-f5d089f63290\\instructify_logo_1786085058897.png';
const dest = 'c:\\instructify\\assets\\images\\logo.png';
fs.copyFileSync(src, dest);

// 2. Update all HTML files
const dir = 'c:\\instructify';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newBrand = `
  <img src="assets/images/logo.png" alt="Instructify Kenya Logo" style="height: 44px; width: auto; object-fit: contain; margin-right: 12px; border-radius: 8px;">
  <div class="nav-brand-text" style="display: flex; flex-direction: column; justify-content: center; line-height: 1.1;"><span class="nav-brand-name" style="font-weight: 800; font-size: 1.25rem; color: #111827; letter-spacing: -0.5px;">Instructify</span><span class="nav-brand-tagline" style="font-size: 0.75rem; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1.5px;">Kenya</span></div>
`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Try to replace existing logo structure inside nav-brand
  // Specifically look for <div class="nav-logo">...</div> and <div class="nav-brand-text">...</div>
  // Or just replace everything between <a class="nav-brand"> and </a>
  // Let's use a regex that matches the opening tag, then any content until the closing </a>
  content = content.replace(/(<a[^>]*class="nav-brand"[^>]*>)[\s\S]*?(<\/a>)/g, `$1\n${newBrand}\n$2`);
  
  fs.writeFileSync(filePath, content);
});

console.log('Successfully updated logo across all pages.');

const fs = require('fs');
const path = require('path');

// 1. Copy the image
const src = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\2f103423-e0e1-4076-88a3-f5d089f63290\\instructify_logo_exact_orange_1786085575087.png';
const dest = 'c:\\instructify\\assets\\images\\logo.png';
fs.copyFileSync(src, dest);

// 2. Update the color of "Kenya" in all HTML files
const dir = 'c:\\instructify';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the color for the word "Kenya" (it was #1d4ed8, we want #ea580c)
  // `<span class="nav-brand-tagline" style="font-size: 0.75rem; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1.5px;">Kenya</span>`
  content = content.replace(/(class="nav-brand-tagline"[^>]*color:\s*)#1d4ed8/g, '$1#ea580c');
  
  // Just in case it was written without inline styles, although my previous script added it inline.
  fs.writeFileSync(filePath, content);
});

// 3. Update global.css to force nav links to be black
const cssPath = path.join('c:\\instructify', 'css', 'global.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Append the new rules if they aren't already there
if (!cssContent.includes('.nav-link { color: #000000 !important; }')) {
  cssContent += `
/* Requested custom colors for navigation */
.nav-link, .dropdown-link { 
    color: #000000 !important; 
    font-weight: 600 !important;
}
.nav-link:hover, .dropdown-link:hover { 
    color: #ea580c !important; 
}
`;
  fs.writeFileSync(cssPath, cssContent);
}

console.log('Successfully updated logo, Kenya text color, and nav menu colors.');

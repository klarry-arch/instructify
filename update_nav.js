const fs = require('fs');
const path = require('path');

const dir = 'c:\\instructify';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const cssPath = path.join(dir, 'css', 'components.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('.nav-dropdown')) {
  cssContent += `
/* ── Nav Dropdown ────────────────────────────────────────────── */
.nav-dropdown-container {
  position: relative;
}

.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  min-width: 200px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 8px 0;
  list-style: none;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.2s ease;
  z-index: 100;
}

.nav-dropdown-container:hover .nav-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.nav-dropdown li a {
  display: block;
  padding: 8px 16px;
  color: var(--color-text);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: background 0.2s;
}

.nav-dropdown li a:hover {
  background: #eff6ff;
  color: var(--color-primary);
}
`;
  fs.writeFileSync(cssPath, cssContent);
}

const dropdownHtml = `<li class="nav-dropdown-container">
        <a href="courses.html" class="nav-link">Courses ▾</a>
        <ul class="nav-dropdown">
          <li><a href="courses.html?cat=ict">ICT Integration</a></li>
          <li><a href="courses.html?cat=cbe">CBE Curriculum</a></li>
          <li><a href="courses.html?cat=ai">AI in Education</a></li>
          <li><a href="courses.html?cat=digital">Digital Literacy</a></li>
          <li><a href="courses.html?cat=leadership">Leadership</a></li>
        </ul>
      </li>`;

const activeDropdownHtml = `<li class="nav-dropdown-container">
        <a href="courses.html" class="nav-link active">Courses ▾</a>
        <ul class="nav-dropdown">
          <li><a href="courses.html?cat=ict">ICT Integration</a></li>
          <li><a href="courses.html?cat=cbe">CBE Curriculum</a></li>
          <li><a href="courses.html?cat=ai">AI in Education</a></li>
          <li><a href="courses.html?cat=digital">Digital Literacy</a></li>
          <li><a href="courses.html?cat=leadership">Leadership</a></li>
        </ul>
      </li>`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Using split/join in case of slight whitespace variations
  content = content.replace(/<li>\s*<a href="courses\.html" class="nav-link">Courses<\/a>\s*<\/li>/g, dropdownHtml);
  content = content.replace(/<li>\s*<a href="courses\.html" class="nav-link active">Courses<\/a>\s*<\/li>/g, activeDropdownHtml);
  
  fs.writeFileSync(filePath, content);
}

console.log("Updated navigation in all HTML files.");

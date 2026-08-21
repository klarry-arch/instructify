const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Desktop nav swap
  // Search for the Courses block followed by About Us block
  const coursesDropdownRegex = /<li class="nav-dropdown-container">[\s\S]*?<\/li>\s*<li><a href="about\.html" class="nav-link([^"]*)">About Us<\/a><\/li>/;

  if (coursesDropdownRegex.test(content)) {
    content = content.replace(coursesDropdownRegex, (match, p1) => {
      const activeClass = p1.trim();
      const aboutLink = `<li><a href="about.html" class="nav-link${activeClass ? ' ' + activeClass : ''}">About Us</a></li>\n      `;
      // Extract the dropdown block
      const dropdownMatch = match.match(/<li class="nav-dropdown-container">[\s\S]*?<\/li>/)[0];
      return aboutLink + dropdownMatch;
    });
    updated = true;
  }

  // Mobile nav swap
  const mobileRegex = /<a href="courses\.html" class="nav-mobile-link">📚 Courses<\/a>\s*<a href="about\.html" class="nav-mobile-link">ℹ️ About Us<\/a>/;
  if (mobileRegex.test(content)) {
    content = content.replace(mobileRegex, '<a href="about.html" class="nav-mobile-link">ℹ️ About Us</a>\n    <a href="courses.html" class="nav-mobile-link">📚 Courses</a>');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Reordered nav in ${file}`);
  }
});

console.log('Nav reorder finished.');

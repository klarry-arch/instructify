const fs = require('fs');
const path = require('path');

const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

if (!jsContent.includes('document.addEventListener(\'DOMContentLoaded\'')) {
  jsContent += `
// Initialize courses on page load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderCourses === 'function') {
    renderCourses();
  }
});
`;
  fs.writeFileSync(jsPath, jsContent);
  console.log('Successfully added initialization call to courses.js');
} else {
  console.log('Initialization call already exists.');
}

const fs = require('fs');
const path = require('path');

const htmlPath = path.join('c:\\instructify', 'courses.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 1. Change the heading
htmlContent = htmlContent.replace(
  /<h2 style="[^"]*">Course Directory<\/h2>/,
  '<h2 style="font-family: var(--font-heading); color: #111827; font-size: 1.75rem;">Courses offered at Instructify Kenya</h2>'
);

// 2. Make card contents always visible
// Replace the CSS block for the hidden state
htmlContent = htmlContent.replace(
  /\.pro-card-expanded-content \{[\s\S]*?opacity:\s*0;[\s\S]*?\}/,
  `.pro-card-expanded-content {
    max-height: none;
    opacity: 1;
    overflow: visible;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
  }`
);

// Remove the hover specific rule for the expanded content
htmlContent = htmlContent.replace(
  /\.pro-card:hover \.pro-card-expanded-content \{[\s\S]*?\}/,
  ''
);

fs.writeFileSync(htmlPath, htmlContent);
console.log('Successfully updated heading and made course details visible by default.');

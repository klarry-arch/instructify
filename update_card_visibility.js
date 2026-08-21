const fs = require('fs');
const path = require('path');

const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const newRenderCourseCard = `window.renderCourseCard = function(course) {
  let btnText = 'Enroll Now';
  if (course.price.toLowerCase().includes('custom') || course.audience.toLowerCase().includes('school')) {
    btnText = course.audience.toLowerCase().includes('school') ? 'Book School Training' : 'Request Quote';
  }
  
  // Format price display if it doesn't already start with "Price:"
  let displayPrice = course.price;
  if (!displayPrice.toLowerCase().startsWith('price')) {
    displayPrice = 'Price: ' + displayPrice;
  }
  
  return \`
    <div class="pro-card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
      <div style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <span style="background: #fff3ed; color: #FF4D00; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">\${course.category}</span>
          <span style="font-size: 1.2rem;">\${course.format.toLowerCase().includes('online') ? '🌐' : '🏫'}</span>
        </div>
        
        <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: #111827; line-height: 1.3; margin-bottom: 0.75rem;">
          \${course.title}
        </h3>
        
        <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.5; margin-bottom: 1rem;">
          \${course.intro}
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: #6b7280; margin-bottom: 1.25rem;">
          <div><strong style="color: #374151;">👥 Audience:</strong> \${course.audience}</div>
          <div><strong style="color: #374151;">⏱️ Duration:</strong> \${course.duration}</div>
          <div><strong style="color: #374151;">💻 Format:</strong> \${course.format}</div>
        </div>
      </div>
      
      <div style="padding: 1.25rem; background: #f9fafb; border-top: 1px solid #e5e7eb; margin-top: auto;">
        <div style="color: #1d4ed8; font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem; text-align: center;">
          \${displayPrice}
        </div>
        <a href="checkout.html?id=\${course.id}" class="btn" style="background: #FF4D00; color: white; width: 100%; border-radius: 8px; padding: 0.75rem; font-weight: 700; display: inline-block; text-align: center; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#c2410a'" onmouseout="this.style.background='#FF4D00'">
          \${btnText}
        </a>
      </div>
    </div>
  \`;
};`;

jsContent = jsContent.replace(/window\.renderCourseCard = function[^]*?};/, newRenderCourseCard);
fs.writeFileSync(jsPath, jsContent);
console.log('Successfully updated renderCourseCard visibility and button logic.');

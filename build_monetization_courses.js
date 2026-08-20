const fs = require('fs');
const path = require('path');

// 1. UPDATE COURSES.JS
const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

// We need to update renderCourseCard to use dynamic button text and point to checkout
const newRenderCourseCard = `window.renderCourseCard = function(course) {
  const isCustom = course.price.toLowerCase().includes('custom');
  const btnText = isCustom ? 'Request Quote' : 'Enroll Now';
  
  return \`
    <div class="pro-card">
      <div style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <span style="background: #fff3ed; color: #FF4D00; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">\${course.category}</span>
          <span style="font-size: 1.2rem;">\${course.format.toLowerCase().includes('online') ? '🌐' : '🏫'}</span>
        </div>
        
        <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: #111827; line-height: 1.3; margin-bottom: 0.5rem;">
          \${course.title}
        </h3>
        <p style="color: #1d4ed8; font-size: 1rem; font-weight: 800;">\${course.price}</p>
        
        <div class="pro-card-expanded-content" style="max-height: none; opacity: 1; overflow: visible; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f3f4f6;">
          <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.5; margin-bottom: 1rem;">
            \${course.intro}
          </p>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: #6b7280; margin-bottom: 1.25rem;">
            <div><strong style="color: #374151;">👥 Audience:</strong> \${course.audience}</div>
            <div><strong style="color: #374151;">⏱️ Duration:</strong> \${course.duration}</div>
            <div><strong style="color: #374151;">💻 Format:</strong> \${course.format}</div>
          </div>
          <a href="checkout.html?id=\${course.id}" class="btn" style="background: #FF4D00; color: white; width: 100%; border-radius: 8px; padding: 0.75rem; font-weight: 700; display: inline-block; text-align: center; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#c2410a'" onmouseout="this.style.background='#FF4D00'">
            \${btnText}
          </a>
        </div>
      </div>
    </div>
  \`;
};`;

jsContent = jsContent.replace(/window\.renderCourseCard = function[^]*?};/, newRenderCourseCard);
fs.writeFileSync(jsPath, jsContent);


// 2. UPDATE COURSES.HTML
const htmlPath = path.join('c:\\instructify', 'courses.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const newSections = `
<!-- Flexible Payment Options Section -->
<section style="background: #f9fafb; padding: 5rem 0; border-top: 1px solid #e5e7eb;">
  <div class="container">
    <div style="text-align: center; max-width: 800px; margin: 0 auto 3.5rem;">
      <h2 style="font-family: var(--font-heading); color: #111827; font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem;">
        Flexible Payment Options
      </h2>
      <p style="color: #4b5563; font-size: 1.1rem; line-height: 1.6;">
        Instructify Kenya makes it easy for individuals, parents, teachers, and schools to enroll in our courses. You can pay securely through M-Pesa, cheque, or cash depending on your preference.
      </p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <div style="width: 64px; height: 64px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem;">📱</div>
        <h3 style="color: #111827; font-weight: 800; margin-bottom: 1rem; font-size: 1.25rem;">M-Pesa</h3>
        <p style="color: #6b7280; font-size: 0.95rem; line-height: 1.5;">Pay quickly and conveniently using M-Pesa. Recommended for individual learners, parents, and teachers.</p>
      </div>
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <div style="width: 64px; height: 64px; background: #fff3ed; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem;">🏦</div>
        <h3 style="color: #111827; font-weight: 800; margin-bottom: 1rem; font-size: 1.25rem;">Cheque</h3>
        <p style="color: #6b7280; font-size: 0.95rem; line-height: 1.5;">Available for schools, organizations, and institutional training bookings.</p>
      </div>
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <div style="width: 64px; height: 64px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem;">💵</div>
        <h3 style="color: #111827; font-weight: 800; margin-bottom: 1rem; font-size: 1.25rem;">Cash</h3>
        <p style="color: #6b7280; font-size: 0.95rem; line-height: 1.5;">Available for approved in-person registrations and direct payments.</p>
      </div>
    </div>
  </div>
</section>

<!-- Final CTA Section -->
<section style="background: #1d4ed8; padding: 5rem 0; text-align: center;">
  <div class="container" style="max-width: 800px;">
    <h2 style="font-family: var(--font-heading); color: white; font-size: 2.5rem; font-weight: 800; margin-bottom: 1.25rem;">
      Ready to Start Learning with Instructify?
    </h2>
    <p style="color: rgba(255,255,255,0.9); font-size: 1.15rem; margin-bottom: 2.5rem; line-height: 1.6;">
      Choose your course, enroll online, and complete payment using M-Pesa, cheque, or cash. Schools can also request customized training packages and quotations.
    </p>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <a href="#catalog" class="btn" style="background: white; color: #1d4ed8; padding: 0.9rem 2rem; border-radius: 8px; font-weight: 700; text-decoration: none;">Explore Courses</a>
      <a href="#catalog" class="btn" style="background: #FF4D00; color: white; padding: 0.9rem 2rem; border-radius: 8px; font-weight: 700; text-decoration: none;">Enroll Now</a>
      <a href="contact.html" class="btn" style="background: transparent; color: white; border: 2px solid white; padding: 0.9rem 2rem; border-radius: 8px; font-weight: 700; text-decoration: none;">Request School Quote</a>
      <a href="contact.html" class="btn" style="background: transparent; color: white; border: 2px solid white; padding: 0.9rem 2rem; border-radius: 8px; font-weight: 700; text-decoration: none;">Contact Us</a>
    </div>
  </div>
</section>
`;

// Replace the old "Need a customized training package" section with these two new sections
htmlContent = htmlContent.replace(/<!-- Page Ending Section -->[\s\S]*?(?=<footer)/, newSections + '\n');
fs.writeFileSync(htmlPath, htmlContent);

console.log('Successfully updated courses.js and courses.html with monetization sections.');

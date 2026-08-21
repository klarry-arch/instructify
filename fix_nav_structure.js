const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const pageActiveMap = {
  'index.html': 'home',
  'about.html': 'about',
  'courses.html': 'courses',
  'consultancy.html': 'consultancy',
  'resources.html': 'resources',
  'events.html': 'events',
  'news.html': 'news',
  'contact.html': 'contact'
};

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const activePage = pageActiveMap[file] || '';

  const navLinksBlock = `    <ul class="nav-links">
      <li><a href="index.html" class="nav-link${activePage === 'home' ? ' active' : ''}">Home</a></li>
      <li><a href="about.html" class="nav-link${activePage === 'about' ? ' active' : ''}">About Us</a></li>
      <li class="nav-dropdown-container">
        <a href="courses.html" class="nav-link${activePage === 'courses' ? ' active' : ''}">Courses ▾</a>
        <ul class="nav-dropdown">
          <li><a href="courses.html?cat=ict">ICT Integration</a></li>
          <li><a href="courses.html?cat=cbe">CBE Curriculum</a></li>
          <li><a href="courses.html?cat=ai">AI in Education</a></li>
          <li><a href="courses.html?cat=digital">Digital Literacy</a></li>
          <li><a href="courses.html?cat=leadership">Leadership</a></li>
        </ul>
      </li>
      <li><a href="consultancy.html" class="nav-link${activePage === 'consultancy' ? ' active' : ''}">Consultancy</a></li>
      <li><a href="resources.html" class="nav-link${activePage === 'resources' ? ' active' : ''}">Resources</a></li>
      <li><a href="events.html" class="nav-link${activePage === 'events' ? ' active' : ''}">Events</a></li>
      <li><a href="news.html" class="nav-link${activePage === 'news' ? ' active' : ''}">Blog</a></li>
      <li><a href="contact.html" class="nav-link${activePage === 'contact' ? ' active' : ''}">Contact</a></li>
    </ul>`;

  const mobileNavBlock = `  <div class="nav-mobile-links">
    <a href="index.html" class="nav-mobile-link">🏠 Home</a>
    <a href="about.html" class="nav-mobile-link">ℹ️ About Us</a>
    <a href="courses.html" class="nav-mobile-link">📚 Courses</a>
    <a href="consultancy.html" class="nav-mobile-link">💼 Consultancy</a>
    <a href="resources.html" class="nav-mobile-link">📂 Resource Center</a>
    <a href="events.html" class="nav-mobile-link">📅 Events &amp; Webinars</a>
    <a href="news.html" class="nav-mobile-link">📰 Blog &amp; Insights</a>
    <a href="contact.html" class="nav-mobile-link">📞 Contact</a>
  </div>`;

  // Replace <ul class="nav-links">...</ul>
  if (content.includes('<ul class="nav-links">')) {
    content = content.replace(/<ul class="nav-links">[\s\S]*?<\/ul>/, navLinksBlock);
  }

  // Replace <div class="nav-mobile-links">...</div>
  if (content.includes('<div class="nav-mobile-links">')) {
    content = content.replace(/<div class="nav-mobile-links">[\s\S]*?<\/div>/, mobileNavBlock);
  }

  fs.writeFileSync(filePath, content);
  console.log(`Cleaned nav in ${file}`);
});

console.log('All navigation blocks successfully updated.');

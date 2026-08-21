const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const globalCssPath = path.join(rootDir, 'css', 'global.css');
const componentsCssPath = path.join(rootDir, 'css', 'components.css');
const homepageCssPath = path.join(rootDir, 'css', 'homepage.css');

// 1. Update css/global.css
let globalCss = fs.readFileSync(globalCssPath, 'utf8');

// Update Google Fonts import
globalCss = globalCss.replace(
  /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?[^']+'\);/,
  `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600;1,700;1,800&family=Poppins:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700&display=swap');`
);

// Update font stack variables
globalCss = globalCss.replace(
  /--font-sans:\s*[^;]+;/,
  `--font-sans:              'Plus Jakarta Sans', 'Outfit', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
);
globalCss = globalCss.replace(
  /--font-heading:\s*[^;]+;/,
  `--font-heading:           'Plus Jakarta Sans', 'Outfit', 'Poppins', sans-serif;`
);
globalCss = globalCss.replace(
  /--font-body:\s*[^;]+;/,
  `--font-body:              'Plus Jakarta Sans', 'Inter', sans-serif;`
);

// Update font size scale
globalCss = globalCss.replace(/--font-size-h1:\s*48px;/, '--font-size-h1:           54px;');
globalCss = globalCss.replace(/--font-size-h2:\s*40px;/, '--font-size-h2:           42px;');

// Update line heights
globalCss = globalCss.replace(/--line-height-h1:\s*1\.15;/, '--line-height-h1:         1.08;');
globalCss = globalCss.replace(/--line-height-h2:\s*1\.20;/, '--line-height-h2:         1.14;');

// Update H1 and H2 weights & tracking
globalCss = globalCss.replace(
  /(h1,\s*\.h1\s*\{[\s\S]*?font-weight:\s*)\d+;( [\s\S]*?letter-spacing:\s*)[^;]+;/,
  `$1800;$2-0.035em;`
);
globalCss = globalCss.replace(
  /(h2,\s*\.h2\s*\{[\s\S]*?font-weight:\s*)\d+;( [\s\S]*?letter-spacing:\s*)[^;]+;/,
  `$1800;$2-0.028em;`
);

fs.writeFileSync(globalCssPath, globalCss, 'utf8');
console.log('Updated css/global.css typography system');

// 2. Update css/components.css for button font style and pill radius
let componentsCss = fs.readFileSync(componentsCssPath, 'utf8');

// Ensure button base class uses bold uppercase tracking and pill shape matching "SHOP NOW ->"
componentsCss = componentsCss.replace(
  /(\.btn\s*\{[\s\S]*?font-weight:\s*)\d+;/,
  `$1800;`
);

fs.writeFileSync(componentsCssPath, componentsCss, 'utf8');
console.log('Updated css/components.css button typography');

// 3. Update css/homepage.css hero typography matching Pharmily banner
let homepageCss = fs.readFileSync(homepageCssPath, 'utf8');

homepageCss = homepageCss.replace(
  /(\.hero-title\s*\{[\s\S]*?font-weight:\s*)\d+;/,
  `$1800;`
);
homepageCss = homepageCss.replace(
  /(\.hero-title\s*\{[\s\S]*?line-height:\s*)[^;]+;/,
  `$11.06;`
);
homepageCss = homepageCss.replace(
  /(\.hero-title\s*\{[\s\S]*?letter-spacing:\s*)[^;]+;/,
  `$1-0.035em;`
);

// Style subtitle with bold italic matching "Your everyday wellness partner"
if (!homepageCss.includes('font-style: italic') && homepageCss.includes('.hero-subtitle')) {
  homepageCss = homepageCss.replace(
    /(\.hero-subtitle\s*\{)/,
    `$1\n  font-weight: 700;\n  font-style: italic;\n  letter-spacing: -0.01em;`
  );
}

fs.writeFileSync(homepageCssPath, homepageCss, 'utf8');
console.log('Updated css/homepage.css hero typography');

console.log('Typography styling update complete.');

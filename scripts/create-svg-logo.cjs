const fs = require('fs');
const path = require('path');

// Precision SVG for Instructify Kenya official logo
function generateLogoSvg(isDark = false) {
  const kenyaColor = isDark ? '#E2E8F0' : '#44484F';
  const blueColor = '#064FC1';
  const greenColor = '#12B84E';
  const yellowColor = '#FFD21A';
  const redColor = '#F20D20';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" width="100%" height="100%" fill="none" role="img" aria-label="Instructify Kenya">
  <defs>
    <style>
      .ik-brand-title {
        font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 32px;
        font-weight: 850;
        fill: ${blueColor};
        letter-spacing: 0.02em;
      }
      .ik-brand-sub {
        font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 19px;
        font-weight: 600;
        fill: ${kenyaColor};
        letter-spacing: 0.28em;
      }
    </style>
  </defs>

  <!-- MARK: 'ik' Symbol -->
  <g id="logo-mark" transform="translate(4, 6)">
    <!-- 'i' Dot -->
    <circle cx="21" cy="15" r="11" fill="${blueColor}" />

    <!-- 'i' Vertical Stem -->
    <rect x="9" y="34" width="24" height="64" rx="1.5" fill="${blueColor}" />

    <!-- 'k' Top Arm (Green) -->
    <polygon points="49,14 74,14 43,60 33,48" fill="${greenColor}" />

    <!-- 'k' Center Facet (Yellow) -->
    <polygon points="33,43 55,68 33,83" fill="${yellowColor}" />

    <!-- 'k' Bottom Arm (Red) -->
    <polygon points="41,74 54,63 74,98 56,98" fill="${redColor}" />
  </g>

  <!-- TYPOGRAPHY: 'INSTRUCTIFY KENYA' -->
  <text x="96" y="52" class="ik-brand-title">INSTRUCTIFY</text>
  <text x="98" y="85" class="ik-brand-sub">KENYA</text>
</svg>`;
}

// Icon only SVG for Favicon & Small Screens
function generateIconSvg() {
  const blueColor = '#064FC1';
  const greenColor = '#12B84E';
  const yellowColor = '#FFD21A';
  const redColor = '#F20D20';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 106" width="100%" height="100%" fill="none" role="img" aria-label="Instructify Kenya">
  <!-- 'i' Dot -->
  <circle cx="21" cy="15" r="12" fill="${blueColor}" />

  <!-- 'i' Vertical Stem -->
  <rect x="9" y="34" width="24" height="64" rx="1.5" fill="${blueColor}" />

  <!-- 'k' Top Arm (Green) -->
  <polygon points="49,14 74,14 43,60 33,48" fill="${greenColor}" />

  <!-- 'k' Center Facet (Yellow) -->
  <polygon points="33,43 55,68 33,83" fill="${yellowColor}" />

  <!-- 'k' Bottom Arm (Red) -->
  <polygon points="41,74 54,63 74,98 56,98" fill="${redColor}" />
</svg>`;
}

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

fs.writeFileSync(path.join(assetsDir, 'instructify-kenya-logo.svg'), generateLogoSvg(false));
fs.writeFileSync(path.join(assetsDir, 'instructify-kenya-logo-dark.svg'), generateLogoSvg(true));
fs.writeFileSync(path.join(assetsDir, 'instructify-logo.svg'), generateIconSvg());
fs.writeFileSync(path.join(assetsDir, 'instructify-icon.svg'), generateIconSvg());

console.log('✅ Generated official SVG logo and icon files in assets/images/');

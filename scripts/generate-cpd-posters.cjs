/**
 * Instructify Kenya - Teacher CPD Programme Promotional Poster Generator
 * Generates:
 * 1. cpd_teacher_training_poster_social_1080x1350.png (Social media feed post)
 * 2. cpd_teacher_training_poster_status_1080x1920.png (WhatsApp Status / Story)
 * 3. cpd_teacher_training_poster_whatsapp.jpg (Compressed JPEG for WhatsApp)
 * 4. cpd_teacher_training_poster_a4.pdf (Print-ready A4 PDF with bleed & margins)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

const ROOT_DIR = path.resolve(__dirname, '..');
const POSTERS_DIR = path.join(ROOT_DIR, 'assets', 'posters');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates', 'posters');
const REGISTRATION_URL = 'https://www.instructify.co.ke/cpd-registration.html';

// Ensure directories exist
if (!fs.existsSync(POSTERS_DIR)) fs.mkdirSync(POSTERS_DIR, { recursive: true });
if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR, { recursive: true });

async function main() {
  console.log('🎨 Starting Instructify Kenya CPD Promotional Poster Generation...\n');

  // 1. Generate High-Res Scannable QR Code
  const qrPngPath = path.join(POSTERS_DIR, 'cpd_registration_qr.png');
  await QRCode.toFile(qrPngPath, REGISTRATION_URL, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 1,
    width: 600,
    color: {
      dark: '#0B192C',
      light: '#FFFFFF'
    }
  });
  console.log('✅ Generated high-resolution QR code pointing to:', REGISTRATION_URL);

  const qrDataUrl = await QRCode.toDataURL(REGISTRATION_URL, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 500,
    color: { dark: '#0B192C', light: '#FFFFFF' }
  });

  // Load logo and photo as base64 for self-contained rendering
  const logoPath = path.join(ROOT_DIR, 'assets', 'images', 'logo.png');
  const photoPath = path.join(ROOT_DIR, 'assets', 'images', 'about_educator_workshop.jpg');

  const logoBase64 = fs.existsSync(logoPath) ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}` : '';
  const photoBase64 = fs.existsSync(photoPath) ? `data:image/jpeg;base64,${fs.readFileSync(photoPath).toString('base64')}` : '';

  // 2. Generate HTML Template for Social Media (1080 x 1350)
  const socialHtmlPath = path.join(TEMPLATES_DIR, 'poster-social.html');
  const socialHtml = createPosterHtml({
    width: 1080,
    height: 1350,
    aspect: 'social',
    qrDataUrl,
    logoBase64,
    photoBase64
  });
  fs.writeFileSync(socialHtmlPath, socialHtml, 'utf8');

  // 3. Generate HTML Template for WhatsApp Status / Stories (1080 x 1920)
  const statusHtmlPath = path.join(TEMPLATES_DIR, 'poster-status.html');
  const statusHtml = createPosterHtml({
    width: 1080,
    height: 1920,
    aspect: 'status',
    qrDataUrl,
    logoBase64,
    photoBase64
  });
  fs.writeFileSync(statusHtmlPath, statusHtml, 'utf8');

  // 4. Generate HTML Template for A4 (1240 x 1754 at 150dpi or print styling)
  const a4HtmlPath = path.join(TEMPLATES_DIR, 'poster-a4.html');
  const a4Html = createPosterHtml({
    width: 1240,
    height: 1754,
    aspect: 'a4',
    qrDataUrl,
    logoBase64,
    photoBase64
  });
  fs.writeFileSync(a4HtmlPath, a4Html, 'utf8');

  // Find Chrome or Edge executable
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log(`🌐 Using browser rendering engine: ${browserExe}`);

  // 5. Render 1080 x 1350 PNG (Social Media)
  const socialPngPath = path.join(POSTERS_DIR, 'cpd_teacher_training_poster_social_1080x1350.png');
  renderScreenshot(browserExe, socialHtmlPath, socialPngPath, 1080, 1350);
  console.log('✅ Generated 1080 x 1350 Social Media Poster:', socialPngPath);

  // 6. Render 1080 x 1920 PNG (WhatsApp Status & Stories)
  const statusPngPath = path.join(POSTERS_DIR, 'cpd_teacher_training_poster_status_1080x1920.png');
  renderScreenshot(browserExe, statusHtmlPath, statusPngPath, 1080, 1920);
  console.log('✅ Generated 1080 x 1920 WhatsApp Status Poster:', statusPngPath);

  // 7. Generate Compressed JPEG for WhatsApp sharing
  const whatsappJpgPath = path.join(POSTERS_DIR, 'cpd_teacher_training_poster_whatsapp.jpg');
  convertPngToCompressedJpg(socialPngPath, whatsappJpgPath, 85);
  console.log('✅ Generated Compressed WhatsApp JPG:', whatsappJpgPath);

  // 8. Generate Print-Ready A4 PDF
  const a4PdfPath = path.join(POSTERS_DIR, 'cpd_teacher_training_poster_a4.pdf');
  await generatePrintReadyA4Pdf({
    outputPath: a4PdfPath,
    qrPngPath,
    logoPath,
    photoPath
  });
  console.log('✅ Generated Print-Ready A4 PDF:', a4PdfPath);

  console.log('\n🎉 ALL 4 PROMOTIONAL POSTER FORMATS GENERATED SUCCESSFULLY!');
}

function renderScreenshot(browserExe, htmlFilePath, outPngPath, width, height) {
  const fileUrl = 'file:///' + htmlFilePath.replace(/\\/g, '/');
  execFileSync(browserExe, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${width},${height}`,
    `--screenshot=${outPngPath}`,
    fileUrl
  ]);
}

function convertPngToCompressedJpg(pngPath, jpgPath, quality = 85) {
  const psScript = `
    Add-Type -AssemblyName System.Drawing;
    $bmp = [System.Drawing.Bitmap]::FromFile('${pngPath.replace(/'/g, "''")}');
    $encoder = [System.Drawing.Imaging.Encoder]::Quality;
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1);
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]${quality});
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' };
    $bmp.Save('${jpgPath.replace(/'/g, "''")}', $codec, $encoderParams);
    $bmp.Dispose();
  `;
  execFileSync('powershell', ['-NoProfile', '-Command', psScript]);
}

function createPosterHtml({ width, height, aspect, qrDataUrl, logoBase64, photoBase64 }) {
  const isStatus = aspect === 'status'; // 1080x1920
  const isA4 = aspect === 'a4';

  const containerPadding = isStatus ? '48px 44px' : '40px 44px';
  const highlightsGap = isStatus ? '14px' : '10px';
  const highlightPadding = isStatus ? '14px 18px' : '10px 14px';
  const photoHeight = isStatus ? '320px' : '230px';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CPD Training Poster - Instructify Kenya</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0B192C;
      color: #FFFFFF;
      position: relative;
    }
    .poster-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: ${containerPadding};
      position: relative;
      z-index: 2;
      background: radial-gradient(circle at 85% 15%, rgba(33, 69, 230, 0.35) 0%, transparent 55%),
                  radial-gradient(circle at 10% 85%, rgba(22, 163, 74, 0.25) 0%, transparent 50%),
                  linear-gradient(180deg, #091422 0%, #0B192C 40%, #081220 100%);
    }

    /* Decorative top badge */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${isStatus ? '20px' : '14px'};
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      height: 52px;
      width: auto;
      object-fit: contain;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      line-height: 1;
    }
    .brand-title span { color: #F5812D; }
    .brand-sub {
      font-size: 11px;
      font-weight: 800;
      color: #FF4D00;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 3px;
    }

    .accreditation-pill {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(10px);
      padding: 8px 18px;
      border-radius: 99px;
      font-size: 13px;
      font-weight: 700;
      color: #60A5FA;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .accreditation-pill .dot {
      width: 8px;
      height: 8px;
      background: #22C55E;
      border-radius: 50%;
      box-shadow: 0 0 10px #22C55E;
    }

    /* Main Headings */
    .hero-heading-box {
      margin-bottom: ${isStatus ? '18px' : '12px'};
    }
    .subheading-badge {
      display: inline-block;
      background: linear-gradient(135deg, #FF4D00 0%, #F5812D 100%);
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      box-shadow: 0 4px 15px rgba(255, 77, 0, 0.35);
    }
    .poster-title {
      font-family: 'Outfit', sans-serif;
      font-size: ${isStatus ? '46px' : '40px'};
      font-weight: 900;
      line-height: 1.12;
      color: #FFFFFF;
      letter-spacing: -1px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .poster-title .highlight {
      background: linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #4ADE80 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .poster-supporting {
      font-size: ${isStatus ? '16.5px' : '15px'};
      line-height: 1.5;
      color: #CBD5E1;
      max-width: 960px;
    }

    /* Visual Banner with Teachers */
    .visual-banner {
      width: 100%;
      height: ${photoHeight};
      border-radius: 18px;
      overflow: hidden;
      position: relative;
      margin-bottom: ${isStatus ? '20px' : '14px'};
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .visual-banner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.88) contrast(1.05);
    }
    .banner-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, rgba(11, 25, 44, 0.85) 0%, rgba(11, 25, 44, 0.2) 60%, rgba(11, 25, 44, 0.7) 100%);
      display: flex;
      align-items: flex-end;
      padding: 20px 24px;
    }
    .banner-quote {
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      padding: 10px 18px;
      border-radius: 10px;
      border-left: 4px solid #F5812D;
    }

    /* 8 Programme Highlights Grid */
    .highlights-section {
      margin-bottom: ${isStatus ? '20px' : '14px'};
    }
    .highlights-header {
      font-size: 13px;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .highlights-header::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.12);
    }
    .highlights-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: ${highlightsGap};
    }
    .highlight-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: ${highlightPadding};
      display: flex;
      align-items: center;
      gap: 14px;
      backdrop-filter: blur(6px);
    }
    .highlight-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(33, 69, 230, 0.3) 0%, rgba(22, 163, 74, 0.3) 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .highlight-title {
      font-size: ${isStatus ? '15.5px' : '14px'};
      font-weight: 700;
      color: #F8FAFC;
      line-height: 1.3;
    }

    /* Bottom Promotional Info & CTA Strip */
    .promo-card {
      background: linear-gradient(135deg, rgba(33, 69, 230, 0.18) 0%, rgba(15, 23, 42, 0.7) 100%);
      border: 1.5px solid rgba(96, 165, 250, 0.35);
      border-radius: 20px;
      padding: ${isStatus ? '24px 28px' : '20px 24px'};
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 20px;
      align-items: center;
      margin-bottom: ${isStatus ? '18px' : '12px'};
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    }
    .promo-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .promo-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .promo-label {
      font-size: 12px;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 1px;
      min-width: 140px;
    }
    .promo-val-fee {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 900;
      color: #22C55E;
      letter-spacing: -0.5px;
    }
    .promo-val-period {
      font-size: 18px;
      font-weight: 800;
      color: #FCD34D;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cta-btn-box {
      margin-top: 6px;
    }
    .cta-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(135deg, #FF4D00 0%, #F5812D 100%);
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 14px 28px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(255, 77, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* QR Code Box */
    .qr-box {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    }
    .qr-img {
      width: ${isStatus ? '140px' : '125px'};
      height: ${isStatus ? '140px' : '125px'};
      object-fit: contain;
    }
    .qr-instruction {
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 900;
      color: #0B192C;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .qr-url-sub {
      font-size: 10.5px;
      font-weight: 700;
      color: #2145E6;
      margin-top: 2px;
      text-decoration: none;
    }

    /* Footer & Tagline */
    .poster-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: ${isStatus ? '18px' : '12px'};
    }
    .tagline-box {
      display: flex;
      flex-direction: column;
    }
    .tagline-text {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #F8FAFC;
    }
    .tagline-sub {
      font-size: 12px;
      color: #94A3B8;
      margin-top: 2px;
    }
    .contact-items {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      font-weight: 700;
      color: #E2E8F0;
    }
    .contact-icon {
      color: #60A5FA;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    
    <!-- Top Bar: Logo & Accreditation -->
    <div class="top-bar">
      <div class="brand-group">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Instructify Kenya Logo" class="brand-logo">` : ''}
        <div class="brand-text">
          <div class="brand-title">Instruct<span>ify</span></div>
          <div class="brand-sub">KENYA</div>
        </div>
      </div>
      <div class="accreditation-pill">
        <span class="dot"></span>
        Continuing Professional Development (CPD)
      </div>
    </div>

    <!-- Main Title & Supporting Text -->
    <div class="hero-heading-box">
      <div class="subheading-badge">CPD Training for CBC Teachers</div>
      <h1 class="poster-title">
        Foundations of <span class="highlight">Digital Literacy</span> &amp; ICT Integration
      </h1>
      <p class="poster-supporting">
        Build the digital knowledge, confidence, and practical skills required to create engaging, inclusive, safe, and future-ready CBC learning experiences.
      </p>
    </div>

    <!-- Visual Banner representing Teachers using Technology -->
    <div class="visual-banner">
      ${photoBase64 ? `<img src="${photoBase64}" alt="Kenyan Teachers in Technology Workshop">` : ''}
      <div class="banner-overlay">
        <div class="banner-quote">
          Empowering CBC Teachers across all 47 Counties with Practical EdTech Skills
        </div>
      </div>
    </div>

    <!-- 8 Programme Highlights -->
    <div class="highlights-section">
      <div class="highlights-header">Practical Competencies Developed</div>
      <div class="highlights-grid">
        <div class="highlight-card">
          <div class="highlight-icon">💻</div>
          <div class="highlight-title">Basic digital skills</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🎨</div>
          <div class="highlight-title">Digital content creation</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🔗</div>
          <div class="highlight-title">Meaningful ICT integration</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">📊</div>
          <div class="highlight-title">Digital assessment</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🛡️</div>
          <div class="highlight-title">Online safety &amp; digital citizenship</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">♿</div>
          <div class="highlight-title">Accessibility &amp; inclusive learning</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">💬</div>
          <div class="highlight-title">Digital communication &amp; collaboration</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🤖</div>
          <div class="highlight-title">Responsible use of AI in education</div>
        </div>
      </div>
    </div>

    <!-- Promotional Information, Fee, Period & QR Code -->
    <div class="promo-card">
      <div class="promo-details">
        <div class="promo-row">
          <div class="promo-label">Workshop Fee:</div>
          <div class="promo-val-fee">KES 2,500</div>
        </div>
        <div class="promo-row">
          <div class="promo-label">Training Period:</div>
          <div class="promo-val-period">November to December 2026</div>
        </div>
        <div class="cta-btn-box">
          <div class="cta-button">
            REGISTER NOW ➔
          </div>
        </div>
      </div>

      <div class="qr-box">
        <img src="${qrDataUrl}" alt="QR Code to Register" class="qr-img">
        <div class="qr-instruction">SCAN TO REGISTER</div>
        <a href="${REGISTRATION_URL}" class="qr-url-sub" target="_blank">instructify.co.ke/cpd-registration.html</a>
      </div>
    </div>

    <!-- Footer: Contact & Brand Tagline -->
    <div class="poster-footer">
      <div class="tagline-box">
        <div class="tagline-text">Digital Skills Today. Greater Opportunities Tomorrow.</div>
        <div class="tagline-sub">Instructify Kenya &bull; Empower Teachers &bull; Inspire Learners &bull; Transform Education</div>
      </div>
      <div class="contact-items">
        <div class="contact-item">
          <span class="contact-icon">✉️</span> info@instructify.co.ke
        </div>
        <div class="contact-item">
          <span class="contact-icon">🌐</span> www.instructify.co.ke
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

async function generatePrintReadyA4Pdf({ outputPath, qrPngPath, logoPath, photoPath }) {
  // A4 dimensions in points: 595.28 x 841.89
  const doc = new PDFDocument({
    size: 'A4',
    margin: 36, // 0.5 inch margins / print bleed safe
    info: {
      Title: 'CPD Training: Foundations of Digital Literacy and ICT Integration for CBC Teachers',
      Author: 'Instructify Kenya',
      Subject: 'Teacher Continuing Professional Development Programme',
      Keywords: 'CPD, CBC, ICT Integration, Digital Literacy, Kenya'
    }
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  // Background Gradient Simulation
  doc.rect(0, 0, pageWidth, pageHeight).fill('#0B192C');

  // Top header box
  doc.rect(margin, margin, contentWidth, 54).fillColor('#10223A').fill();

  // Logo if exists
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, margin + 12, margin + 9, { height: 36 });
    } catch {}
  }

  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
     .text('Instructify KENYA', margin + 65, margin + 12);
  doc.fillColor('#60A5FA').fontSize(9).font('Helvetica')
     .text('CONTINUING PROFESSIONAL DEVELOPMENT (CPD)', margin + 65, margin + 33);

  doc.fillColor('#22C55E').fontSize(10).font('Helvetica-Bold')
     .text('KICD-ALIGNED & CERTIFIED', pageWidth - margin - 170, margin + 22, { align: 'right', width: 155 });

  // Subtitle badge
  const topY = margin + 70;
  doc.roundedRect(margin, topY, 210, 20, 4).fillColor('#FF4D00').fill();
  doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
     .text('CPD TRAINING FOR CBC TEACHERS', margin + 10, topY + 5);

  // Main Heading
  doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold')
     .text('FOUNDATIONS OF DIGITAL LITERACY AND ICT INTEGRATION', margin, topY + 30, { width: contentWidth, lineGap: 3 });

  // Supporting Text
  doc.fillColor('#CBD5E1').fontSize(10.5).font('Helvetica')
     .text('Build the digital knowledge, confidence, and practical skills required to create engaging, inclusive, safe, and future-ready CBC learning experiences.', margin, topY + 92, { width: contentWidth, lineGap: 2 });

  // Visual Photo Banner
  const photoY = topY + 135;
  const photoH = 150;
  if (fs.existsSync(photoPath)) {
    try {
      doc.save();
      doc.roundedRect(margin, photoY, contentWidth, photoH, 8).clip();
      doc.image(photoPath, margin, photoY, { width: contentWidth, height: photoH, fit: [contentWidth, photoH], align: 'center', valign: 'center' });
      doc.restore();
    } catch {}
  }

  // 8 Highlights Section
  const hlY = photoY + photoH + 18;
  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica-Bold')
     .text('PARTICIPANTS WILL DEVELOP PRACTICAL COMPETENCE IN:', margin, hlY);

  const highlights = [
    '• Basic digital skills',
    '• Digital content creation',
    '• Meaningful ICT integration',
    '• Digital assessment',
    '• Online safety and digital citizenship',
    '• Accessibility and inclusive learning',
    '• Digital communication and collaboration',
    '• Responsible use of AI in education'
  ];

  const colWidth = (contentWidth - 16) / 2;
  highlights.forEach((h, i) => {
    const isCol2 = i >= 4;
    const colX = isCol2 ? (margin + colWidth + 16) : margin;
    const rowY = hlY + 16 + (i % 4) * 22;

    doc.roundedRect(colX, rowY, colWidth, 19, 4).fillColor('#132742').fill();
    doc.fillColor('#F8FAFC').fontSize(9.5).font('Helvetica-Bold')
       .text(h, colX + 8, rowY + 5);
  });

  // Promotional Box: Fee, Period, QR Code, CTA
  const promoY = hlY + 115;
  const promoH = 155;
  doc.roundedRect(margin, promoY, contentWidth, promoH, 10).fillColor('#0E233F').strokeColor('#2145E6').lineWidth(1.5).fillAndStroke();

  // Fee & Period
  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica-Bold')
     .text('WORKSHOP FEE:', margin + 20, promoY + 20);
  doc.fillColor('#22C55E').fontSize(24).font('Helvetica-Bold')
     .text('KES 2,500', margin + 20, promoY + 34);

  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica-Bold')
     .text('TRAINING PERIOD:', margin + 20, promoY + 70);
  doc.fillColor('#FCD34D').fontSize(13).font('Helvetica-Bold')
     .text('NOVEMBER TO DECEMBER 2026', margin + 20, promoY + 84);

  // Call to action button
  doc.roundedRect(margin + 20, promoY + 110, 160, 28, 6).fillColor('#FF4D00').fill();
  doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold')
     .text('REGISTER NOW  >', margin + 35, promoY + 118);

  // QR Code Box on right
  const qrBoxX = pageWidth - margin - 150;
  const qrBoxY = promoY + 12;
  doc.roundedRect(qrBoxX, qrBoxY, 134, 132, 8).fillColor('#FFFFFF').fill();

  if (fs.existsSync(qrPngPath)) {
    try {
      doc.image(qrPngPath, qrBoxX + 17, qrBoxY + 8, { width: 100, height: 100 });
    } catch {}
  }

  doc.fillColor('#0B192C').fontSize(9).font('Helvetica-Bold')
     .text('SCAN TO REGISTER', qrBoxX, qrBoxY + 112, { align: 'center', width: 134 });

  // Registration URL below promo box
  doc.fillColor('#60A5FA').fontSize(8.5).font('Helvetica')
     .text(`Official Registration Link: ${REGISTRATION_URL}`, margin, promoY + promoH + 12, { align: 'center', width: contentWidth });

  // Tagline & Contact Footer
  const footerY = pageHeight - margin - 32;
  doc.rect(margin, footerY, contentWidth, 1).fillColor('#1E3A5F').fill();

  doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
     .text('Digital Skills Today. Greater Opportunities Tomorrow.', margin, footerY + 8);
  doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
     .text('Instructify Kenya • Empower Teachers • Inspire Learners • Transform Education', margin, footerY + 22);

  doc.fillColor('#CBD5E1').fontSize(8.5).font('Helvetica-Bold')
     .text('Email: info@instructify.co.ke   |   Website: www.instructify.co.ke', pageWidth - margin - 260, footerY + 12, { align: 'right', width: 260 });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

main().catch(err => {
  console.error('Fatal poster generation error:', err);
  process.exit(1);
});

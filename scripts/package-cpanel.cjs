/* ============================================================
   INSTRUCTIFY KENYA — cPanel / DirectAdmin Deployment Packager
   Packages all production-ready files into:
   1. dist/public_html/ (Unpacked directory for FTP / direct file upload)
   2. instructify-cpanel-deploy.zip (Ready to upload & extract via File Manager)
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_HTML_DIR = path.join(DIST_DIR, 'public_html');
const ZIP_PATH = path.join(ROOT_DIR, 'instructify-cpanel-deploy.zip');

console.log('📦 Starting Instructify Kenya cPanel / DirectAdmin packaging...\n');

// 1. Clean & create build folders
if (fs.existsSync(PUBLIC_HTML_DIR)) {
  fs.rmSync(PUBLIC_HTML_DIR, { recursive: true, force: true });
}
fs.mkdirSync(PUBLIC_HTML_DIR, { recursive: true });

// 2. Helper to copy files
let copiedFileCount = 0;
let totalBytes = 0;

function copyFileSafe(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  const stats = fs.statSync(src);
  copiedFileCount++;
  totalBytes += stats.size;
}

function copyDirectorySafe(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectorySafe(srcPath, destPath);
    } else {
      copyFileSafe(srcPath, destPath);
    }
  }
}

// 3. Copy all root HTML files
console.log('📄 Copying HTML pages...');
const rootFiles = fs.readdirSync(ROOT_DIR);
for (const file of rootFiles) {
  if (file.endsWith('.html')) {
    copyFileSafe(path.join(ROOT_DIR, file), path.join(PUBLIC_HTML_DIR, file));
    console.log(`   + ${file}`);
  }
}

// 4. Copy required directories
const directoriesToCopy = ['css', 'js', 'assets', 'courses', 'lib', 'api'];
for (const dir of directoriesToCopy) {
  console.log(`📁 Copying ${dir}/...`);
  copyDirectorySafe(path.join(ROOT_DIR, dir), path.join(PUBLIC_HTML_DIR, dir));
}

// 5. Copy server & config files
console.log('⚙️  Copying configuration & server files...');
const configFiles = [
  '.htaccess',
  'robots.txt',
  'sitemap.xml',
  'server.js',
  '.env.example'
];

for (const file of configFiles) {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    copyFileSafe(src, path.join(PUBLIC_HTML_DIR, file));
    console.log(`   + ${file}`);
  }
}

// 6. Generate Clean Production package.json
console.log('📦 Generating production package.json...');
const prodPackageJson = {
  name: "instructify-ke",
  version: "1.0.0",
  description: "Instructify Kenya — LMS Production Deployment",
  type: "module",
  main: "server.js",
  scripts: {
    start: "node server.js"
  },
  engines: {
    node: ">=18.0.0"
  },
  dependencies: {
    "@vercel/kv": "^2.0.0"
  }
};

fs.writeFileSync(
  path.join(PUBLIC_HTML_DIR, 'package.json'),
  JSON.stringify(prodPackageJson, null, 2),
  'utf-8'
);
copiedFileCount++;

// 7. Compress into ZIP archive (using standard POSIX forward slashes for Linux/cPanel compatibility)
console.log('\n🗜️  Compressing into instructify-cpanel-deploy.zip with POSIX forward slashes...');
if (fs.existsSync(ZIP_PATH)) {
  fs.unlinkSync(ZIP_PATH);
}

try {
  const psScript = path.join(__dirname, 'create-zip.ps1');
  execSync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${psScript}" -SourceDir "${PUBLIC_HTML_DIR}" -ZipFile "${ZIP_PATH}"`, { stdio: 'inherit' });
  const zipStats = fs.statSync(ZIP_PATH);
  const zipSizeMb = (zipStats.size / (1024 * 1024)).toFixed(2);
  const uncompressedMb = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log('\n✅ Packaged successfully for Linux / cPanel / DirectAdmin!');
  console.log(`   - Total Files: ${copiedFileCount}`);
  console.log(`   - Uncompressed Size: ${uncompressedMb} MB`);
  console.log(`   - Compressed ZIP Size: ${zipSizeMb} MB`);
  console.log(`   - Output ZIP: ${ZIP_PATH}`);
  console.log(`   - Output Unpacked: ${PUBLIC_HTML_DIR}`);
} catch (err) {
  console.error('❌ Compression failed:', err);
  process.exit(1);
}

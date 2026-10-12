# 🚀 Instructify Kenya — HostAfrica (cPanel / DirectAdmin) Deployment Guide

This guide walks you through deploying the repackaged Instructify Kenya website to your **HostAfrica** control panel (`instructify.co.ke`) as seen in your dashboard.

---

## 📦 What Has Been Packaged

We have created an automated packager that strips all development scripts and bundles only the production-ready assets into:
- **Zip Archive**: `instructify-cpanel-deploy.zip` *(Located in the root of the project)*
- **Unpacked Folder**: `dist/public_html/` *(Contains all uncompressed production files)*

### Package Contents:
- **All 25 HTML Pages**: Homepage, Courses, School/Institutions, Podcast, Dashboards (Learner, Trainer, Admin), Checkout, Consultancy, About, Contact, Resources, Blog, etc.
- **Assets & Styles**: `css/`, `js/`, `assets/`, `courses/`, `lib/`
- **Backend & APIs**: `api/`, `server.js`, and `package.json`
- **Apache / LiteSpeed Optimization**:
  - `.htaccess`: Enforces HTTPS, removes `.html` extensions (clean URLs like `/courses`), enables Gzip compression, browser caching, and security headers.
  - `robots.txt`: Search engine crawling rules.
  - `sitemap.xml`: Complete search engine sitemap for `instructify.co.ke`.

---

## Method 1: Upload via File Manager (Recommended — Takes 2 Minutes)

### Step 1: Open File Manager
In your HostAfrica dashboard:
1. Scroll down to **SYSTEM INFO & FILES**.
2. Click on **File Manager** (the orange folder icon).

### Step 2: Navigate to `public_html`
1. Go into `domains` ➔ `instructify.co.ke` ➔ `public_html` (or click the `public_html` shortcut).
2. *(Optional)* If you have old test files or default index files inside `public_html`, select and delete them or move them to a backup folder.

### Step 3: Upload the Zip File
1. Click the **Upload Files** button in the top bar.
2. Drag and drop `instructify-cpanel-deploy.zip` from your computer (`C:\instructify\instructify-cpanel-deploy.zip`).
3. Wait for the upload progress to reach 100%.

### Step 4: Extract the Files
1. In File Manager, right-click on `instructify-cpanel-deploy.zip`.
2. Select **Extract**.
3. Ensure the destination directory is set to `public_html/` and click **Extract**.
4. Once extracted, you can delete `instructify-cpanel-deploy.zip` from `public_html` to save disk space.

🎉 **Your website is now LIVE at [https://instructify.co.ke](https://instructify.co.ke)!**

---

## Method 2: Enabling the Node.js Backend API for Real M-Pesa STK Push

To make real M-Pesa STK push prompts fire onto students' phones:

### Step 1: Open Node.js App Manager
1. In your HostAfrica cPanel dashboard, scroll down to **SOFTWARE** or **EXTRA FEATURES**.
2. Click **Setup Node.js App** (green hexagon icon).
3. Click **Create Application**.

### Step 2: Configure the Node.js Application
* **Node.js version**: Choose `20.x` (or `18.x`)
* **Application mode**: `Production`
* **Application root**: `public_html`
* **Application startup file**: `server.js`
* **Application URL**: `instructify.co.ke` (leave path blank for root domain)
* Click **Create**.

### Step 3: Add Safaricom Daraja Environment Variables
In the application details page, scroll down to **Environment Variables** and click **Add Variable** for each:

| Variable Name | Value (Sandbox) | Value (Live / Production) |
|---|---|---|
| `APP_BASE_URL` | `https://instructify.co.ke` | `https://instructify.co.ke` |
| `MPESA_ENVIRONMENT` | `sandbox` | `production` |
| `MPESA_CONSUMER_KEY` | *(Your Consumer Key from Daraja `instructify` App)* | *(Your Live Consumer Key)* |
| `MPESA_CONSUMER_SECRET` | *(Your Consumer Secret from Daraja `instructify` App)* | *(Your Live Consumer Secret)* |
| `MPESA_SHORTCODE` | `174379` | *(Your Real Paybill or Till Number)* |
| `MPESA_PASSKEY` | `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919` | *(Your Live Lipa Na M-Pesa Passkey)* |
| `MPESA_SHORTCODE_TYPE` | `CustomerPayBillOnline` | `CustomerPayBillOnline` (or `CustomerBuyGoodsOnline`) |
| `MPESA_CALLBACK_URL` | `https://instructify.co.ke/api/webhook/mpesa` | `https://instructify.co.ke/api/webhook/mpesa` |

### Step 4: Run NPM Install & Restart
1. Click **Run NPM Install** button in the Node.js app dashboard.
2. Click **Restart**.

> **Important cPanel Note**: Whenever you extract a new zip into `public_html`, always go back to **Setup Node.js App** and click **Restart** to ensure Passenger connects cleanly to the updated files.

---

## 🔄 How to Re-Package Anytime in the Future

Whenever you make updates to the code and want a fresh zip package, simply run:

```bash
npm run package:cpanel
```

Or:

```bash
node scripts/package-cpanel.cjs
```

This will automatically rebuild `dist/public_html` and create an updated `instructify-cpanel-deploy.zip`.

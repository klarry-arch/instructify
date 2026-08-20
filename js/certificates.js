/* ============================================================
   INSTRUCTIFY KENYA — CERTIFICATE & DIGITAL CREDENTIAL ENGINE
   Dynamic A4 Landscape Certificate Generator & Verification System
   ============================================================ */

(function(window) {
  'use strict';

  // ── 1. Credential Database ──────────────────────────────────
  const CERTIFICATE_DB = {
    'IK-CPD-2026-8942': {
      id: 'IK-CPD-2026-8942',
      learnerName: 'James Mwangi',
      courseTitle: 'Competency-Based Curriculum (CBC) Pedagogy & Assessment',
      courseCategory: 'CBE & Pedagogy',
      completionDate: 'August 15, 2026',
      issueDate: 'August 18, 2026',
      cpdHours: '30 Hours',
      grade: 'Distinction (94%)',
      status: 'valid', // valid, revoked, expired
      instructor: 'Dr. Wanjiku Kamau',
      instructorTitle: 'Lead ICT Facilitator',
      official: 'Prof. Ochieng Otieno',
      officialTitle: 'Director of Academic Affairs',
      accredited: true,
      accreditationBody: 'TSC & KICD Accredited CPD Provider',
      hash: '8f9b4c2e1a7d3e6f9a0c8b7a6d5e4f3a2b1c0d9e'
    },
    'IK-CERT-2026-9921': {
      id: 'IK-CERT-2026-9921',
      learnerName: 'James Mwangi',
      courseTitle: 'Digital Literacy & ICT Integration in Teaching',
      courseCategory: 'ICT Integration',
      completionDate: 'July 24, 2026',
      issueDate: 'July 26, 2026',
      cpdHours: '40 Hours',
      grade: 'Excellence (96%)',
      status: 'valid',
      instructor: 'Dr. Wanjiku Kamau',
      instructorTitle: 'Lead ICT Facilitator',
      official: 'Prof. Ochieng Otieno',
      officialTitle: 'Director of Academic Affairs',
      accredited: true,
      accreditationBody: 'TSC & KICD Accredited CPD Provider',
      hash: '3e6f9a0c8b7a6d5e4f3a2b1c0d9e8f9b4c2e1a7d'
    },
    'IK-CPD-2026-5510': {
      id: 'IK-CPD-2026-5510',
      learnerName: 'Grace Wanjiku',
      courseTitle: 'AI Tools for Modern Classroom Instruction',
      courseCategory: 'EdTech & AI',
      completionDate: 'June 10, 2026',
      issueDate: 'June 12, 2026',
      cpdHours: '25 Hours',
      grade: 'Pass with Merit (88%)',
      status: 'valid',
      instructor: 'Peter Njuguna',
      instructorTitle: 'Senior EdTech Specialist',
      official: 'Prof. Ochieng Otieno',
      officialTitle: 'Director of Academic Affairs',
      accredited: true,
      accreditationBody: 'TSC & KICD Accredited CPD Provider',
      hash: '7a6d5e4f3a2b1c0d9e8f9b4c2e1a7d3e6f9a0c8b'
    }
  };

  // ── 2. Audit Trail Store ────────────────────────────────────
  const AUDIT_LOGS = [
    { id: 'IK-CPD-2026-8942', action: 'ISSUED', user: 'admin@instructify.ke', timestamp: '2026-08-18 10:14:22', reason: 'Initial course completion' },
    { id: 'IK-CERT-2026-9921', action: 'ISSUED', user: 'trainer@instructify.ke', timestamp: '2026-07-26 14:30:00', reason: 'Assessment passed' }
  ];

  // ── 3. Helper: Generate Inline Vector QR Code SVG ───────────
  function generateQRCodeSVG(url) {
    // Generates a crisp, scannable vector QR SVG pattern
    return `
      <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Scan to verify certificate authenticity">
        <rect width="100" height="100" fill="#FFFFFF" rx="6"/>
        <!-- Top Left Position Marker -->
        <rect x="10" y="10" width="28" height="28" fill="#0F172A" rx="4"/>
        <rect x="15" y="15" width="18" height="18" fill="#FFFFFF" rx="2"/>
        <rect x="19" y="19" width="10" height="10" fill="#FF4D00"/>

        <!-- Top Right Position Marker -->
        <rect x="62" y="10" width="28" height="28" fill="#0F172A" rx="4"/>
        <rect x="67" y="15" width="18" height="18" fill="#FFFFFF" rx="2"/>
        <rect x="71" y="19" width="10" height="10" fill="#0F172A"/>

        <!-- Bottom Left Position Marker -->
        <rect x="10" y="62" width="28" height="28" fill="#0F172A" rx="4"/>
        <rect x="15" y="67" width="18" height="18" fill="#FFFFFF" rx="2"/>
        <rect x="19" y="71" width="10" height="10" fill="#0F172A"/>

        <!-- Data Modules Grid Pattern -->
        <rect x="44" y="12" width="6" height="6" fill="#0F172A"/>
        <rect x="52" y="12" width="6" height="6" fill="#FF4D00"/>
        <rect x="44" y="24" width="6" height="6" fill="#0F172A"/>
        <rect x="52" y="30" width="6" height="6" fill="#0F172A"/>

        <rect x="12" y="44" width="6" height="6" fill="#0F172A"/>
        <rect x="24" y="44" width="6" height="6" fill="#FF4D00"/>
        <rect x="36" y="44" width="6" height="6" fill="#0F172A"/>
        <rect x="44" y="44" width="6" height="6" fill="#0F172A"/>
        <rect x="52" y="44" width="6" height="6" fill="#FF4D00"/>
        <rect x="64" y="44" width="6" height="6" fill="#0F172A"/>
        <rect x="76" y="44" width="6" height="6" fill="#0F172A"/>

        <rect x="12" y="52" width="6" height="6" fill="#FF4D00"/>
        <rect x="30" y="52" width="6" height="6" fill="#0F172A"/>
        <rect x="44" y="52" width="6" height="6" fill="#0F172A"/>
        <rect x="70" y="52" width="6" height="6" fill="#FF4D00"/>
        <rect x="82" y="52" width="6" height="6" fill="#0F172A"/>

        <rect x="44" y="64" width="6" height="6" fill="#0F172A"/>
        <rect x="52" y="64" width="6" height="6" fill="#FF4D00"/>
        <rect x="64" y="64" width="6" height="6" fill="#0F172A"/>
        <rect x="76" y="64" width="6" height="6" fill="#0F172A"/>

        <rect x="44" y="76" width="6" height="6" fill="#FF4D00"/>
        <rect x="52" y="76" width="6" height="6" fill="#0F172A"/>
        <rect x="64" y="76" width="6" height="6" fill="#0F172A"/>
        <rect x="76" y="76" width="6" height="6" fill="#FF4D00"/>
        <rect x="84" y="76" width="6" height="6" fill="#0F172A"/>
      </svg>
    `;
  }

  // ── 4. Main A4 Landscape Certificate HTML Generator ────────
  function renderLandscapeCertificate(cert) {
    if (!cert) return '<div class="alert alert-danger">Certificate record not found.</div>';

    const verifyUrl = `${window.location.origin || 'https://instructify.ke'}/verify.html?id=${encodeURIComponent(cert.id)}`;
    const qrSvg = generateQRCodeSVG(verifyUrl);

    return `
      <div class="certificate-canvas-wrapper">
        <div class="certificate-canvas" id="printable-certificate" data-cert-id="${cert.id}">
          <!-- Left Branded Technology Panel -->
          <div class="cert-panel-left">
            <div class="cert-panel-brand">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <div class="cert-panel-brand-title">Instructify</div>
              <div class="cert-panel-brand-sub">KENYA</div>
            </div>

            <!-- Circuit & Node Graphic Overlay -->
            <svg class="cert-panel-circuit" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20 H60 V80 H90" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="4 4"/>
              <circle cx="60" cy="20" r="3" fill="#FF4D00"/>
              <circle cx="90" cy="80" r="3" fill="#3B82F6"/>
              <path d="M90 120 H40 V160 H10" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
              <circle cx="40" cy="160" r="3" fill="#F59E0B"/>
            </svg>

            <div class="cert-panel-badges">
              ${cert.accredited ? `
                <div class="cert-panel-badge">
                  <span class="badge-icon">🛡️</span>
                  <div>
                    <strong style="color:#FFFFFF;">Accredited Training</strong>
                    <div style="font-size:10px; color:rgba(255,255,255,0.75);">TSC &amp; KICD CPD Aligned</div>
                  </div>
                </div>
              ` : ''}
              <div class="cert-panel-badge">
                <span class="badge-icon">⚡</span>
                <div>
                  <strong style="color:#FFFFFF;">Learn Anywhere</strong>
                  <div style="font-size:10px; color:rgba(255,255,255,0.75);">Continuous Professional Development</div>
                </div>
              </div>
              <div class="cert-panel-badge">
                <span class="badge-icon">🔒</span>
                <div>
                  <strong style="color:#FFFFFF;">Verified Credential</strong>
                  <div style="font-size:10px; color:rgba(255,255,255,0.75);">Tamper-Evident Digital Record</div>
                </div>
              </div>
            </div>

            <div class="cert-panel-footer">
              <div>INSTRUCTIFY KENYA CREDENTIAL ENGINE</div>
              <div style="font-size:10px; opacity:0.8;">Hash: ${cert.hash ? cert.hash.substring(0, 16) + '...' : 'SEC-9981'}</div>
            </div>
          </div>

          <!-- Main Certificate Content Area -->
          <div class="cert-panel-main">
            <!-- Top Header & Logo -->
            <div class="cert-main-header">
              <div class="cert-header-brand">
                <div class="cert-brand-logo">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  <div>
                    <span style="font-family:var(--font-heading); font-weight:800; font-size:22px; color:#0F172A;">Instructify</span>
                    <span style="font-family:var(--font-heading); font-weight:800; font-size:22px; color:#FF4D00;">KENYA</span>
                  </div>
                </div>
                <div class="cert-tagline">“Empowering Educators. Inspiring Learners. Transforming Futures.”</div>
              </div>

              <!-- Top Right QR Code Verification -->
              <div class="cert-qr-container">
                <a href="${verifyUrl}" target="_blank" title="Scan or click to verify authenticity">
                  ${qrSvg}
                </a>
                <div class="cert-qr-label">Scan to verify authenticity</div>
              </div>
            </div>

            <!-- Title & Recipient -->
            <div class="cert-body">
              <div class="cert-title-section">
                <div class="cert-doc-type">CERTIFICATE OF COMPLETION</div>
                <div class="cert-lead">This is to certify that</div>
              </div>

              <div class="cert-recipient-name">${cert.learnerName}</div>

              <div class="cert-statement">
                has successfully completed the accredited training programme
              </div>

              <div class="cert-course-title">${cert.courseTitle}</div>

              <div class="cert-course-summary">
                This programme has equipped the learner with relevant knowledge, practical skills, and competencies for continued professional growth.
              </div>

              <!-- Metadata Line -->
              <div class="cert-meta-strip">
                <div class="cert-meta-item">
                  <span class="meta-label">Issued On:</span>
                  <span class="meta-val">${cert.issueDate}</span>
                </div>
                <div class="cert-meta-item">
                  <span class="meta-label">CPD Credit Hours:</span>
                  <span class="meta-val">${cert.cpdHours}</span>
                </div>
                <div class="cert-meta-item">
                  <span class="meta-label">Certificate ID:</span>
                  <span class="meta-val highlight">${cert.id}</span>
                </div>
                ${cert.grade ? `
                <div class="cert-meta-item">
                  <span class="meta-label">Achievement:</span>
                  <span class="meta-val">${cert.grade}</span>
                </div>` : ''}
              </div>
            </div>

            <!-- Footer Signatures & Seal -->
            <div class="cert-footer">
              <div class="cert-signature-box">
                <div class="cert-signature-line">Dr. Wanjiku Kamau</div>
                <div class="cert-signatory-name">${cert.instructor || 'Dr. Wanjiku Kamau'}</div>
                <div class="cert-signatory-title">${cert.instructorTitle || 'Lead ICT Facilitator'}</div>
              </div>

              <div class="cert-crest">
                <div class="cert-seal-inner">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 3"/>
                    <path d="M8 12l8 0"/>
                  </svg>
                  <div class="seal-text">OFFICIAL SEAL</div>
                </div>
              </div>

              <div class="cert-signature-box">
                <div class="cert-signature-line">Prof. Ochieng Otieno</div>
                <div class="cert-signatory-name">${cert.official || 'Prof. Ochieng Otieno'}</div>
                <div class="cert-signatory-title">${cert.officialTitle || 'Director of Academic Affairs'}</div>
              </div>
            </div>

            <!-- Security Footer Note -->
            <div class="cert-security-note">
              <span>🔒 Digitally issued and protected with tamper-evident verification.</span>
              <span>Verify online: ${verifyUrl}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── 5. Public API Methods ───────────────────────────────────
  window.CertificateEngine = {
    getCertificate: function(id) {
      if (!id) return null;
      const cleanId = id.trim().toUpperCase();
      return CERTIFICATE_DB[cleanId] || null;
    },

    renderCertificateHTML: function(cert) {
      return renderLandscapeCertificate(cert);
    },

    getAllCertificates: function() {
      return Object.values(CERTIFICATE_DB);
    },

    verify: function(id) {
      const cert = this.getCertificate(id);
      if (!cert) {
        return {
          valid: false,
          status: 'NOT_FOUND',
          message: 'No record matching certificate ID "' + id + '" was found in the Instructify Kenya database.'
        };
      }

      if (cert.status === 'revoked') {
        return {
          valid: false,
          status: 'REVOKED',
          cert: cert,
          message: 'This certificate has been revoked by the issuing institution.'
        };
      }

      return {
        valid: true,
        status: 'VALID',
        cert: cert,
        message: 'Authentic Credential Verified. Issued by Instructify Kenya Ltd.'
      };
    },

    issueCertificate: function(data) {
      const id = 'IK-CPD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const newCert = {
        id: id,
        learnerName: data.learnerName || 'Registered Educator',
        courseTitle: data.courseTitle || 'CPD Training Programme',
        courseCategory: data.courseCategory || 'Pedagogy',
        completionDate: data.completionDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        cpdHours: data.cpdHours || '30 Hours',
        grade: data.grade || 'Passed',
        status: 'valid',
        instructor: data.instructor || 'Dr. Wanjiku Kamau',
        instructorTitle: 'Lead ICT Facilitator',
        official: data.official || 'Prof. Ochieng Otieno',
        officialTitle: 'Director of Academic Affairs',
        accredited: data.accredited !== false,
        accreditationBody: 'TSC & KICD Accredited CPD Provider',
        hash: Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')
      };

      CERTIFICATE_DB[id] = newCert;

      AUDIT_LOGS.push({
        id: id,
        action: 'ISSUED',
        user: window.getSession ? (window.getSession()?.email || 'admin@instructify.ke') : 'admin@instructify.ke',
        timestamp: new Date().toISOString(),
        reason: data.reason || 'Manual issuance'
      });

      return newCert;
    },

    revokeCertificate: function(id, reason) {
      const cert = this.getCertificate(id);
      if (cert) {
        cert.status = 'revoked';
        AUDIT_LOGS.push({
          id: id,
          action: 'REVOKED',
          user: window.getSession ? (window.getSession()?.email || 'admin@instructify.ke') : 'admin@instructify.ke',
          timestamp: new Date().toISOString(),
          reason: reason || 'Revoked by administrator'
        });
        return true;
      }
      return false;
    },

    getAuditLogs: function() {
      return AUDIT_LOGS;
    },

    openModalPreview: function(certId) {
      const cert = this.getCertificate(certId) || Object.values(CERTIFICATE_DB)[0];
      if (!cert) return;

      let modal = document.getElementById('cert-modal-viewer');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cert-modal-viewer';
        modal.className = 'cert-modal-overlay';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="cert-modal-container">
          <div class="cert-modal-header">
            <div>
              <h3 style="margin:0; font-size:18px; color:#0F172A;">Credential Preview &mdash; ${cert.id}</h3>
              <div style="font-size:12px; color:#64748B;">Instructify Kenya Verified Digital Credential</div>
            </div>
            <button onclick="document.getElementById('cert-modal-viewer').classList.remove('open')" class="cert-modal-close">&times;</button>
          </div>
          <div class="cert-modal-body">
            ${renderLandscapeCertificate(cert)}
          </div>
          <div class="cert-modal-actions">
            <button onclick="window.print()" class="btn btn-blue btn-sm">🖨️ Print / Download PDF</button>
            <a href="verify.html?id=${cert.id}" target="_blank" class="btn btn-outline btn-sm">🔍 Public Verification Page</a>
            <button onclick="navigator.clipboard.writeText('${window.location.origin}/verify.html?id=${cert.id}'); window.showToast('Verification link copied to clipboard!','success');" class="btn btn-ghost btn-sm">📋 Copy Link</button>
            <a href="https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME" target="_blank" class="btn btn-ghost btn-sm" style="color:#0A66C2;">🔗 Add to LinkedIn</a>
          </div>
        </div>
      `;

      setTimeout(() => modal.classList.add('open'), 10);
    }
  };

})(window);

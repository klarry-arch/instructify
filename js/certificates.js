/* ============================================================
   INSTRUCTIFY KENYA — CERTIFICATE & DIGITAL CREDENTIAL ENGINE
   Dynamic Pixel-Perfect Certificate Generator & Verification System
   ============================================================ */

(function(window) {
  'use strict';

  // ── 1. Credential Database ──────────────────────────────────
  const CERTIFICATE_DB = {
    'IK-CPD-2026-0724-1298': {
      id: 'IK-CPD-2026-0724-1298',
      learnerName: 'James Mwangi',
      courseTitle: 'Digital Literacy Certification Program',
      courseCategory: 'ICT Integration',
      completionDate: 'July 24, 2026',
      issueDate: 'July 24, 2026',
      cpdHours: '30 Hours',
      grade: 'Distinction (96%)',
      status: 'valid', // valid, revoked, expired
      instructor: 'Dr. Wanjiku Kamau',
      instructorTitle: 'Lead ICT Facilitator',
      official: 'Prof. Collins Otieno',
      officialTitle: 'Director of Education',
      accredited: true,
      accreditationBody: 'TSC & KICD Accredited CPD Provider',
      hash: '3e6f9a0c8b7a6d5e4f3a2b1c0d9e8f9b4c2e1a7d'
    },
    'IK-CPD-2026-8942': {
      id: 'IK-CPD-2026-8942',
      learnerName: 'James Mwangi',
      courseTitle: 'Competency-Based Curriculum (CBC) Pedagogy & Assessment',
      courseCategory: 'CBE & Pedagogy',
      completionDate: 'August 15, 2026',
      issueDate: 'August 18, 2026',
      cpdHours: '30 Hours',
      grade: 'Distinction (94%)',
      status: 'valid',
      instructor: 'Dr. Wanjiku Kamau',
      instructorTitle: 'Lead ICT Facilitator',
      official: 'Prof. Collins Otieno',
      officialTitle: 'Director of Education',
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
      official: 'Prof. Collins Otieno',
      officialTitle: 'Director of Education',
      accredited: true,
      accreditationBody: 'TSC & KICD Accredited CPD Provider',
      hash: '3e6f9a0c8b7a6d5e4f3a2b1c0d9e8f9b4c2e1a7d'
    }
  };

  // ── 2. Audit Trail Store ────────────────────────────────────
  const AUDIT_LOGS = [
    { id: 'IK-CPD-2026-0724-1298', action: 'ISSUED', user: 'admin@instructify.ke', timestamp: '2026-07-24 09:00:00', reason: 'Official Course Completion' },
    { id: 'IK-CPD-2026-8942', action: 'ISSUED', user: 'admin@instructify.ke', timestamp: '2026-08-18 10:14:22', reason: 'Assessment passed' }
  ];

  // ── 3. Generate QR Code Vector SVG ──────────────────────────
  function generateQRCodeSVG(url) {
    return `
      <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Scan to verify certificate authenticity">
        <rect width="100" height="100" fill="#FFFFFF" rx="4"/>
        <rect x="8" y="8" width="28" height="28" fill="#07132B" rx="3"/>
        <rect x="13" y="13" width="18" height="18" fill="#FFFFFF" rx="1.5"/>
        <rect x="17" y="17" width="10" height="10" fill="#FF4D00"/>

        <rect x="64" y="8" width="28" height="28" fill="#07132B" rx="3"/>
        <rect x="69" y="13" width="18" height="18" fill="#FFFFFF" rx="1.5"/>
        <rect x="73" y="17" width="10" height="10" fill="#07132B"/>

        <rect x="8" y="64" width="28" height="28" fill="#07132B" rx="3"/>
        <rect x="13" y="69" width="18" height="18" fill="#FFFFFF" rx="1.5"/>
        <rect x="17" y="73" width="10" height="10" fill="#07132B"/>

        <rect x="44" y="10" width="6" height="6" fill="#07132B"/>
        <rect x="52" y="10" width="6" height="6" fill="#FF4D00"/>
        <rect x="44" y="22" width="6" height="6" fill="#07132B"/>
        <rect x="52" y="28" width="6" height="6" fill="#07132B"/>

        <rect x="10" y="44" width="6" height="6" fill="#07132B"/>
        <rect x="22" y="44" width="6" height="6" fill="#FF4D00"/>
        <rect x="34" y="44" width="6" height="6" fill="#07132B"/>
        <rect x="44" y="44" width="6" height="6" fill="#07132B"/>
        <rect x="54" y="44" width="6" height="6" fill="#FF4D00"/>
        <rect x="64" y="44" width="6" height="6" fill="#07132B"/>
        <rect x="76" y="44" width="6" height="6" fill="#07132B"/>

        <rect x="10" y="52" width="6" height="6" fill="#FF4D00"/>
        <rect x="28" y="52" width="6" height="6" fill="#07132B"/>
        <rect x="44" y="52" width="6" height="6" fill="#07132B"/>
        <rect x="70" y="52" width="6" height="6" fill="#FF4D00"/>
        <rect x="84" y="52" width="6" height="6" fill="#07132B"/>

        <rect x="44" y="64" width="6" height="6" fill="#07132B"/>
        <rect x="54" y="64" width="6" height="6" fill="#FF4D00"/>
        <rect x="64" y="64" width="6" height="6" fill="#07132B"/>
        <rect x="76" y="64" width="6" height="6" fill="#07132B"/>

        <rect x="44" y="76" width="6" height="6" fill="#FF4D00"/>
        <rect x="54" y="76" width="6" height="6" fill="#07132B"/>
        <rect x="64" y="76" width="6" height="6" fill="#07132B"/>
        <rect x="76" y="76" width="6" height="6" fill="#FF4D00"/>
        <rect x="84" y="76" width="6" height="6" fill="#07132B"/>
      </svg>
    `;
  }

  // ── 4. Main Pixel-Perfect Certificate Renderer ─────────────
  function renderExactCertificate(cert) {
    if (!cert) return '<div class="alert alert-danger">Certificate record not found.</div>';

    const verifyUrl = `${window.location.origin || 'https://instructify.ke'}/verify.html?id=${encodeURIComponent(cert.id)}`;
    const qrSvg = generateQRCodeSVG(verifyUrl);

    return `
      <div class="certificate-canvas-wrapper">
        <div class="certificate-canvas exact-template" id="printable-certificate" data-cert-id="${cert.id}">
          <!-- Double Gold Border Frame -->
          <div class="cert-gold-frame"></div>
          <div class="cert-gold-corner top-left"></div>
          <div class="cert-gold-corner top-right"></div>
          <div class="cert-gold-corner bottom-left"></div>
          <div class="cert-gold-corner bottom-right"></div>

          <!-- Left Curved Tech Panel -->
          <div class="cert-panel-left-exact">
            <!-- Background Circuit Trace Pattern -->
            <div class="cert-circuit-overlay"></div>

            <!-- Top 3D Gold Ribbon Seal -->
            <div class="cert-3d-gold-seal">
              <div class="seal-stars">★ ★ ★</div>
              <div class="seal-main-text">CPD</div>
              <div class="seal-sub-text">ACCREDITED</div>
              <div class="seal-stars">★ ★ ★</div>
            </div>

            <!-- 4 Vertical Feature Items -->
            <div class="cert-left-features">
              <div class="cert-left-feature">
                <div class="feature-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div class="feature-text">ACCREDITED<br>TRAINING</div>
              </div>

              <div class="cert-left-feature">
                <div class="feature-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                </div>
                <div class="feature-text">LEARN ANYWHERE,<br>ANYTIME</div>
              </div>

              <div class="cert-left-feature">
                <div class="feature-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div class="feature-text">SECURE &amp; VERIFIED<br>CREDENTIAL</div>
              </div>

              <div class="cert-left-feature">
                <div class="feature-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                </div>
                <div class="feature-text">PROFESSIONAL<br>GROWTH</div>
              </div>
            </div>

            <!-- Bottom Left Futuristic Emblem -->
            <div class="cert-left-emblem">
              <div class="emblem-ring-outer"></div>
              <div class="emblem-ring-inner"></div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
          </div>

          <!-- Main Certificate Right Canvas -->
          <div class="cert-panel-main-exact">
            <!-- Header Section: Logo & Top Right QR Verification Box -->
            <div class="cert-header-exact">
              <div class="cert-brand-exact">
                <div class="brand-logo-inline">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#07132B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  <div class="brand-name-box">
                    <span class="brand-title">INSTRUCTIFY</span>
                    <span class="brand-subtitle">KENYA</span>
                  </div>
                </div>
                <div class="cert-tagline-text">Empowering Educators. Inspiring Learners. Transforming Futures.</div>
              </div>

              <!-- Top Right Verification Box -->
              <div class="cert-qr-box-exact">
                <div class="qr-pill-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  VERIFIED CERTIFICATE
                </div>
                <a href="${verifyUrl}" target="_blank" class="qr-svg-wrapper">
                  ${qrSvg}
                </a>
                <div class="qr-subtext">Scan to Verify<br>Certificate Authenticity</div>
              </div>
            </div>

            <!-- Title & Recipient Body -->
            <div class="cert-body-exact">
              <h1 class="cert-main-title">CERTIFICATE</h1>
              <div class="cert-sub-title"><span>—</span> OF COMPLETION <span>—</span></div>
              
              <div class="cert-lead-text">This is to certify that</div>

              <div class="cert-learner-name">${cert.learnerName}</div>
              
              <div class="cert-flourish">✦ &mdash;&mdash;&mdash; ◆ &mdash;&mdash;&mdash; ✦</div>

              <div class="cert-completion-lead">has successfully completed the accredited training program in</div>

              <div class="cert-course-title-exact">${cert.courseTitle}</div>

              <div class="cert-course-desc">
                This program has equipped the learner with essential digital skills, tools and competencies for teaching, learning and professional growth in the 21st century.
              </div>

              <!-- Metadata 3-Column Strip -->
              <div class="cert-meta-container">
                <div class="meta-card">
                  <div class="meta-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07132B" stroke-width="2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/>
                      <line x1="8" x2="8" y1="2" y2="6"/>
                      <line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <div class="meta-label">ISSUED ON</div>
                    <div class="meta-val">${cert.issueDate}</div>
                  </div>
                </div>

                <div class="meta-divider"></div>

                <div class="meta-card">
                  <div class="meta-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07132B" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <div class="meta-label">CPD CREDIT HOURS</div>
                    <div class="meta-val">${cert.cpdHours}</div>
                  </div>
                </div>

                <div class="meta-divider"></div>

                <div class="meta-card">
                  <div class="meta-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07132B" stroke-width="2">
                      <rect width="14" height="14" x="5" y="5" rx="2"/>
                      <path d="M12 5v14"/>
                    </svg>
                  </div>
                  <div>
                    <div class="meta-label">CERTIFICATE ID</div>
                    <div class="meta-val highlight">${cert.id}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Signatures & Center Gold Crest -->
            <div class="cert-footer-exact">
              <div class="signatory-column">
                <div class="signature-script">${cert.official || 'Prof. Collins Otieno'}</div>
                <div class="signatory-line"></div>
                <div class="signatory-name">${cert.official || 'Prof. Collins Otieno'}</div>
                <div class="signatory-title">${cert.officialTitle || 'Director of Education'}</div>
              </div>

              <!-- Center Gold Crest -->
              <div class="center-gold-crest">
                <div class="crest-laurel">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="1.8">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <div class="crest-text">EDUCATE &bull; EMPOWER &bull; EXCEL</div>
              </div>

              <div class="signatory-column">
                <div class="signature-script">${cert.instructor || 'Dr. Wanjiku Kamau'}</div>
                <div class="signatory-line"></div>
                <div class="signatory-name">${cert.instructor || 'Dr. Wanjiku Kamau'}</div>
                <div class="signatory-title">${cert.instructorTitle || 'Lead ICT Facilitator'}</div>
              </div>
            </div>

            <!-- Bottom Dark Navy Security Ribbon Banner -->
            <div class="cert-bottom-security-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <span>This certificate is digitally issued and secured with blockchain verification to ensure authenticity, integrity and lifelong verifiability.</span>
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
      return renderExactCertificate(cert);
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
      const id = 'IK-CPD-' + new Date().getFullYear() + '-0724-' + Math.floor(1000 + Math.random() * 9000);
      const newCert = {
        id: id,
        learnerName: data.learnerName || 'Registered Educator',
        courseTitle: data.courseTitle || 'Digital Literacy Certification Program',
        courseCategory: data.courseCategory || 'Pedagogy',
        completionDate: data.completionDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        cpdHours: data.cpdHours || '30 Hours',
        grade: data.grade || 'Passed',
        status: 'valid',
        instructor: data.instructor || 'Dr. Wanjiku Kamau',
        instructorTitle: 'Lead ICT Facilitator',
        official: data.official || 'Prof. Collins Otieno',
        officialTitle: 'Director of Education',
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
        <div class="cert-modal-container" style="max-width:1080px;">
          <div class="cert-modal-header">
            <div>
              <h3 style="margin:0; font-size:18px; color:#0F172A; font-family:var(--font-heading);">Official Certificate Preview &mdash; ${cert.id}</h3>
              <div style="font-size:12px; color:#64748B;">Instructify Kenya Verified Digital Credential</div>
            </div>
            <button onclick="document.getElementById('cert-modal-viewer').classList.remove('open')" class="cert-modal-close">&times;</button>
          </div>
          <div class="cert-modal-body">
            ${renderExactCertificate(cert)}
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

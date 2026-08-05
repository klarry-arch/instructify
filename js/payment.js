/* ============================================================
   INSTRUCTIFY KENYA — PAYMENT MODULE (M-Pesa Simulation)
   ============================================================ */

'use strict';

// ── Payment Flow ────────────────────────────────────────────────
window.initPaymentFlow = function(courseId, amount) {
  const course = window.COURSES ? window.COURSES.find(c => c.id === courseId) : null;
  const courseName = course ? course.title : 'Selected Course';
  
  const modal = document.getElementById('payment-modal');
  if (!modal) {
    showPaymentModal(courseId, amount, courseName);
  } else {
    document.getElementById('pay-course-name').textContent = courseName;
    document.getElementById('pay-amount').textContent = `KES ${parseInt(amount).toLocaleString()}`;
    window.openModal('payment-modal');
  }
};

function showPaymentModal(courseId, amount, courseName) {
  // Remove existing modal if any
  const existing = document.getElementById('payment-modal-dynamic');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'payment-modal-dynamic';
  
  overlay.innerHTML = `
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <h3 class="modal-title">💳 Complete Enrollment</h3>
        <button class="modal-close" onclick="document.getElementById('payment-modal-dynamic').remove()">✕</button>
      </div>
      
      <!-- Order Summary -->
      <div style="background:var(--bg-surface);border-radius:var(--border-radius-md);padding:var(--space-lg);margin-bottom:var(--space-xl);border:1px solid var(--border-subtle)">
        <div style="font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">Order Summary</div>
        <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">${courseName}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-subtle)">
          <span style="color:var(--text-secondary);font-size:var(--text-sm)">Total Amount</span>
          <span style="font-family:var(--font-heading);font-size:var(--text-xl);font-weight:800;color:var(--color-primary-light)">KES ${parseInt(amount).toLocaleString()}</span>
        </div>
      </div>
      
      <!-- Payment Methods -->
      <div style="margin-bottom:var(--space-xl)">
        <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-md)">Select Payment Method</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-sm)">
          <button class="pay-method-btn active" onclick="selectPayMethod(this,'mpesa')" id="pm-mpesa" style="border:2px solid var(--color-primary-light);border-radius:var(--border-radius-md);padding:12px 8px;background:var(--color-primary-glow);cursor:pointer;transition:all 0.2s">
            <div style="font-size:1.3rem">📱</div>
            <div style="font-size:0.7rem;font-weight:700;color:var(--color-primary-light);margin-top:4px">M-PESA</div>
          </button>
          <button class="pay-method-btn" onclick="selectPayMethod(this,'card')" id="pm-card" style="border:2px solid var(--border-subtle);border-radius:var(--border-radius-md);padding:12px 8px;background:var(--bg-input);cursor:pointer;transition:all 0.2s">
            <div style="font-size:1.3rem">💳</div>
            <div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);margin-top:4px">CARD</div>
          </button>
          <button class="pay-method-btn" onclick="selectPayMethod(this,'bank')" id="pm-bank" style="border:2px solid var(--border-subtle);border-radius:var(--border-radius-md);padding:12px 8px;background:var(--bg-input);cursor:pointer;transition:all 0.2s">
            <div style="font-size:1.3rem">🏦</div>
            <div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);margin-top:4px">BANK</div>
          </button>
        </div>
      </div>
      
      <!-- M-Pesa Panel (default) -->
      <div id="panel-mpesa">
        <div class="form-group" style="margin-bottom:var(--space-lg)">
          <label class="form-label">M-Pesa Phone Number (Safaricom)</label>
          <div class="form-input-icon">
            <span class="input-icon">📞</span>
            <input type="tel" id="mpesa-phone" class="form-input" placeholder="07XX XXX XXX" maxlength="12">
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">An STK Push prompt will be sent to this number</div>
        </div>
        <button onclick="processMpesaPayment('${courseId}','${amount}')" class="btn btn-primary btn-lg w-full" style="width:100%">
          📱 Pay with M-Pesa — KES ${parseInt(amount).toLocaleString()}
        </button>
      </div>
      
      <!-- Card Panel -->
      <div id="panel-card" style="display:none">
        <div class="form-group" style="margin-bottom:var(--space-md)">
          <label class="form-label">Card Number</label>
          <div class="form-input-icon">
            <span class="input-icon">💳</span>
            <input type="text" class="form-input" placeholder="1234 5678 9012 3456" maxlength="19">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-lg)">
          <div class="form-group">
            <label class="form-label">Expiry</label>
            <input type="text" class="form-input" placeholder="MM/YY" maxlength="5">
          </div>
          <div class="form-group">
            <label class="form-label">CVV</label>
            <input type="text" class="form-input" placeholder="•••" maxlength="4" type="password">
          </div>
        </div>
        <button onclick="processCardPayment('${courseId}','${amount}')" class="btn btn-secondary btn-lg" style="width:100%">
          💳 Pay KES ${parseInt(amount).toLocaleString()}
        </button>
      </div>
      
      <!-- Bank Panel -->
      <div id="panel-bank" style="display:none">
        <div style="background:var(--bg-surface);border-radius:var(--border-radius-md);padding:var(--space-lg);border:1px solid var(--border-subtle);margin-bottom:var(--space-lg)">
          <div style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-sm)">Bank Transfer Details</div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:var(--text-sm)">
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Bank:</span><span style="color:var(--text-primary);font-weight:600">KCB Bank Kenya</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Account Name:</span><span style="color:var(--text-primary);font-weight:600">Instructify Kenya Ltd</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Account No:</span><span style="color:var(--text-primary);font-weight:600">1234567890</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Branch:</span><span style="color:var(--text-primary);font-weight:600">Nairobi GPO</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Amount:</span><span style="color:var(--color-primary-light);font-weight:800">KES ${parseInt(amount).toLocaleString()}</span></div>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-lg)">
          <label class="form-label">Upload Payment Receipt</label>
          <input type="file" class="form-input" accept="image/*,.pdf">
        </div>
        <button onclick="processBankPayment('${courseId}')" class="btn btn-teal btn-lg" style="width:100%">
          🏦 Submit Transfer Confirmation
        </button>
      </div>
      
      <div style="text-align:center;margin-top:var(--space-lg)">
        <div style="font-size:var(--text-xs);color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:6px">
          🔒 Secured by 256-bit SSL Encryption · PCI DSS Compliant
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

window.selectPayMethod = function(btn, method) {
  document.querySelectorAll('.pay-method-btn').forEach(b => {
    b.style.border = '2px solid var(--border-subtle)';
    b.style.background = 'var(--bg-input)';
    b.querySelector('div:last-child').style.color = 'var(--text-muted)';
  });
  btn.style.border = '2px solid var(--color-primary-light)';
  btn.style.background = 'var(--color-primary-glow)';
  btn.querySelector('div:last-child').style.color = 'var(--color-primary-light)';
  
  ['mpesa','card','bank'].forEach(m => {
    const panel = document.getElementById(`panel-${m}`);
    if (panel) panel.style.display = m === method ? 'block' : 'none';
  });
};

window.processMpesaPayment = function(courseId, amount) {
  const phone = document.getElementById('mpesa-phone')?.value?.replace(/\s/g,'');
  if (!phone || phone.length < 9) {
    window.showToast('Please enter a valid Safaricom phone number.', 'error');
    return;
  }
  
  showPaymentProcessing('M-Pesa STK Push sent to ' + phone + '...', () => {
    finalizePayment(courseId, 'M-Pesa', amount);
  });
};

window.processCardPayment = function(courseId, amount) {
  showPaymentProcessing('Processing card payment...', () => {
    finalizePayment(courseId, 'Card', amount);
  });
};

window.processBankPayment = function(courseId) {
  document.getElementById('payment-modal-dynamic')?.remove();
  window.showToast('Bank transfer submitted! You will receive confirmation within 24 hours.', 'success');
};

function showPaymentProcessing(message, onComplete) {
  const modal = document.querySelector('#payment-modal-dynamic .modal');
  if (!modal) return;
  
  modal.innerHTML = `
    <div style="text-align:center;padding:var(--space-3xl) var(--space-xl)">
      <div style="width:80px;height:80px;border-radius:50%;background:var(--color-primary-glow);border:3px solid var(--color-primary-light);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto var(--space-xl);animation:spin 1s linear infinite">⏳</div>
      <h3 style="font-family:var(--font-heading);font-size:var(--text-xl);margin-bottom:var(--space-md)">${message}</h3>
      <p style="color:var(--text-muted);font-size:var(--text-sm)">Please complete the payment on your device. Do not close this window.</p>
      <div class="progress" style="margin-top:var(--space-xl);height:4px">
        <div class="progress-bar" id="pay-progress" style="width:0%;transition:width 3s linear"></div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    const bar = document.getElementById('pay-progress');
    if (bar) bar.style.width = '100%';
  }, 100);
  
  setTimeout(onComplete, 3200);
}

function finalizePayment(courseId, method, amount) {
  // Save to payment history
  const payments = JSON.parse(localStorage.getItem('ik_payments') || '[]');
  const session = window.getSession ? window.getSession() : null;
  if (session) {
    payments.push({
      id: 'pay_' + Date.now(),
      userId: session.id,
      courseId,
      method,
      amount: parseInt(amount),
      reference: 'IK' + Date.now().toString().slice(-8).toUpperCase(),
      status: 'completed',
      date: new Date().toISOString()
    });
    localStorage.setItem('ik_payments', JSON.stringify(payments));
  }
  
  // Enroll user
  if (window.enrollCourse) {
    const enrollments = JSON.parse(localStorage.getItem('ik_enrollments') || '[]');
    if (session && !enrollments.find(e => e.courseId === courseId && e.userId === session.id)) {
      enrollments.push({
        id: 'enr_' + Date.now(),
        userId: session.id,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completed: false,
        lastAccessed: new Date().toISOString()
      });
      localStorage.setItem('ik_enrollments', JSON.stringify(enrollments));
    }
  }
  
  // Show success
  const modal = document.querySelector('#payment-modal-dynamic .modal');
  if (modal) {
    const ref = 'IK' + Date.now().toString().slice(-8).toUpperCase();
    modal.innerHTML = `
      <div style="text-align:center;padding:var(--space-3xl) var(--space-xl)">
        <div style="width:90px;height:90px;border-radius:50%;background:rgba(16,185,129,0.15);border:3px solid #10B981;display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin:0 auto var(--space-xl)">✅</div>
        <h3 style="font-family:var(--font-heading);font-size:var(--text-2xl);font-weight:800;margin-bottom:var(--space-md)">Payment Successful!</h3>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-lg)">Your enrollment has been confirmed. A receipt has been sent to your email.</p>
        <div style="background:var(--bg-surface);border-radius:var(--border-radius-md);padding:var(--space-md);margin-bottom:var(--space-xl);font-size:var(--text-xs);color:var(--text-muted)">
          Reference: <strong style="color:var(--color-primary-light)">${ref}</strong>
        </div>
        <button onclick="window.location.href='dashboard-learner.html'" class="btn btn-primary btn-lg" style="width:100%">
          🚀 Go to My Dashboard
        </button>
      </div>
    `;
  }
}

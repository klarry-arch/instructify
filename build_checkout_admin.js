const fs = require('fs');
const path = require('path');

const dir = 'c:\\instructify';

// Function to extract standard head and nav from courses.html
const coursesHtml = fs.readFileSync(path.join(dir, 'courses.html'), 'utf8');
const headEnd = coursesHtml.indexOf('</head>') + 7;
const headHtml = coursesHtml.substring(0, headEnd).replace('<title>Courses - Instructify Kenya</title>', '<title>Checkout - Instructify Kenya</title>');
const navEnd = coursesHtml.indexOf('</nav>') + 6;
const navHtml = coursesHtml.substring(headEnd, navEnd);
const footerStart = coursesHtml.indexOf('<footer');
const footerHtml = coursesHtml.substring(footerStart);

// --- 1. CHECKOUT.HTML ---
const checkoutHtml = `
${headHtml.replace('<title>Checkout', '<title>Enroll & Checkout')}
<body>
${navHtml}

<div class="container" style="padding: calc(var(--nav-height) + 3rem) 0 5rem;">
  <div style="text-align: center; margin-bottom: 3rem;">
    <h1 style="font-family: var(--font-heading); color: #111827; font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">Enroll & Checkout</h1>
    <p style="color: #6b7280; font-size: 1.1rem;">Securely complete your enrollment below.</p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 380px; gap: 3rem; align-items: start;" id="checkout-grid">
    
    <!-- Left: Form -->
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      <h2 style="font-family: var(--font-heading); color: #111827; font-size: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 1rem;">Student Details</h2>
      
      <form id="enrollment-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div>
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Full Name *</label>
            <input type="text" id="fullname" required style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none;">
          </div>
          <div>
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Phone Number *</label>
            <input type="tel" id="phone" required placeholder="07XX XXX XXX" style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none;">
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Email Address *</label>
          <input type="email" id="email" required style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div>
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Learner Type *</label>
            <select id="learner-type" required style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none; background: white;">
              <option value="">Select...</option>
              <option value="Teacher">Teacher</option>
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
              <option value="School">School/Organization</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Preferred Format *</label>
            <select id="format" required style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none; background: white;">
              <option value="">Select...</option>
              <option value="Online">Online</option>
              <option value="In-Person">In-Person</option>
              <option value="Blended">Blended</option>
              <option value="School-Based">School-Based</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Additional Notes</label>
          <textarea id="notes" rows="3" style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none; resize: vertical;"></textarea>
        </div>
      </form>
    </div>

    <!-- Right: Summary & Payment -->
    <div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
        <h3 style="font-family: var(--font-heading); color: #111827; font-size: 1.25rem; margin-bottom: 1rem;">Order Summary</h3>
        <div id="course-summary-box">
          <p style="color: #6b7280; font-style: italic;">Loading course details...</p>
        </div>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem;">
        <h3 style="font-family: var(--font-heading); color: #111827; font-size: 1.25rem; margin-bottom: 1rem;">Payment Method</h3>
        
        <!-- Payment Tabs -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem;">
          <button class="pay-tab active" data-method="mpesa" style="flex: 1; padding: 0.5rem; border: none; background: #dbeafe; color: #1d4ed8; font-weight: 700; border-radius: 6px; cursor: pointer;">M-Pesa</button>
          <button class="pay-tab" data-method="cheque" style="flex: 1; padding: 0.5rem; border: none; background: transparent; color: #6b7280; font-weight: 600; cursor: pointer;">Cheque</button>
          <button class="pay-tab" data-method="cash" style="flex: 1; padding: 0.5rem; border: none; background: transparent; color: #6b7280; font-weight: 600; cursor: pointer;">Cash</button>
        </div>

        <!-- Payment Contents -->
        <div id="pay-mpesa" class="pay-content">
          <p style="font-size: 0.9rem; color: #4b5563; margin-bottom: 1rem;"><strong>Recommended:</strong> Enter your M-Pesa registered phone number below. You will receive an STK prompt on your phone to enter your PIN.</p>
          <input type="tel" id="mpesa-phone" placeholder="07XX XXX XXX" style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none; margin-bottom: 1rem;">
        </div>

        <div id="pay-cheque" class="pay-content" style="display: none;">
          <p style="font-size: 0.9rem; color: #4b5563; margin-bottom: 1rem;">Make cheques payable to <strong>Instructify Kenya Ltd</strong>. Your enrollment will remain pending until the cheque clears.</p>
          <input type="text" id="cheque-ref" placeholder="Organization / Reference Name" style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none; margin-bottom: 1rem;">
        </div>

        <div id="pay-cash" class="pay-content" style="display: none;">
          <p style="font-size: 0.9rem; color: #4b5563; margin-bottom: 1rem;">Cash payments must be made in person at our Nairobi training center prior to course commencement.</p>
        </div>

        <button id="submit-btn" style="width: 100%; padding: 1rem; background: #ea580c; color: white; border: none; border-radius: 8px; font-weight: 800; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2); transition: 0.2s;">
          Complete Enrollment
        </button>
      </div>
    </div>
  </div>
</div>

<script src="js/courses.js"></script>
<script>
  // Setup tabs
  let selectedMethod = 'mpesa';
  document.querySelectorAll('.pay-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.pay-tab').forEach(t => {
        t.style.background = 'transparent';
        t.style.color = '#6b7280';
        t.classList.remove('active');
      });
      document.querySelectorAll('.pay-content').forEach(c => c.style.display = 'none');
      
      e.target.style.background = '#dbeafe';
      e.target.style.color = '#1d4ed8';
      e.target.classList.add('active');
      
      selectedMethod = e.target.getAttribute('data-method');
      document.getElementById('pay-' + selectedMethod).style.display = 'block';
    });
  });

  // Load Course Details
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  let selectedCourse = null;

  if (courseId && window.COURSES) {
    selectedCourse = window.COURSES.find(c => c.id === courseId);
  }

  const summaryBox = document.getElementById('course-summary-box');
  if (selectedCourse) {
    summaryBox.innerHTML = \`
      <div style="font-weight: 800; color: #111827; margin-bottom: 0.5rem; line-height: 1.4;">\${selectedCourse.title}</div>
      <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 1rem; margin-top: 1rem;">
        <span style="font-weight: 600; color: #4b5563;">Total</span>
        <span style="font-weight: 800; color: #1d4ed8; font-size: 1.2rem;">\${selectedCourse.price}</span>
      </div>
    \`;
  } else {
    summaryBox.innerHTML = '<p style="color: red;">Error: No course selected. Please return to the courses page.</p>';
    document.getElementById('submit-btn').disabled = true;
  }

  // Handle Submission (Simulated Backend)
  document.getElementById('submit-btn').addEventListener('click', () => {
    if (!selectedCourse) return;
    
    // Basic validation
    const name = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    if (!name || !email) {
      alert('Please fill in your Name and Email address.');
      return;
    }

    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    // Simulate STK Push delay if mpesa
    setTimeout(() => {
      const enrollment = {
        id: 'ENR' + Math.floor(Math.random() * 100000),
        date: new Date().toISOString(),
        name,
        email,
        phone: document.getElementById('phone').value,
        learnerType: document.getElementById('learner-type').value,
        format: document.getElementById('format').value,
        notes: document.getElementById('notes').value,
        courseTitle: selectedCourse.title,
        price: selectedCourse.price,
        paymentMethod: selectedMethod,
        status: 'Pending Payment'
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('instructify_enrollments') || '[]');
      existing.unshift(enrollment);
      localStorage.setItem('instructify_enrollments', JSON.stringify(existing));

      // Success
      document.getElementById('checkout-grid').innerHTML = \`
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; background: #dbeafe; border-radius: 12px; border: 1px solid #1d4ed8;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
          <h2 style="font-family: var(--font-heading); color: #1d4ed8; font-size: 2rem; margin-bottom: 1rem;">Enrollment Received!</h2>
          <p style="font-size: 1.1rem; color: #374151; max-width: 500px; margin: 0 auto 2rem;">
            Thank you for enrolling in <strong>\${selectedCourse.title}</strong>. Your enrollment ID is <strong>\${enrollment.id}</strong>.
            \${selectedMethod === 'mpesa' ? 'If you did not receive the M-Pesa prompt, our team will contact you shortly.' : 'Please follow the instructions provided to complete your payment.'}
          </p>
          <a href="courses.html" class="btn" style="background: #1d4ed8; color: white; padding: 0.8rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700;">Return to Courses</a>
        </div>
      \`;
      
      window.scrollTo(0,0);
    }, 1500); // 1.5s simulated delay
  });
</script>
${footerHtml}
`;

fs.writeFileSync(path.join(dir, 'checkout.html'), checkoutHtml);


// --- 2. ADMIN.HTML ---
const adminHtml = `
${headHtml.replace('<title>Checkout', '<title>Admin Dashboard')}
<style>
  .admin-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .admin-table th, .admin-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
  .admin-table th { background: #f9fafb; font-weight: 700; color: #374151; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
  .status-select { padding: 4px 8px; border-radius: 4px; border: 1px solid #d1d5db; font-size: 0.85rem; font-weight: 600; outline: none; }
  .status-Pending { background: #fef3c7; color: #92400e; }
  .status-Received { background: #d1fae5; color: #065f46; }
  .status-Confirmed { background: #e0e7ff; color: #3730a3; }
  .status-Cancelled { background: #fee2e2; color: #991b1b; }
  .status-Quote { background: #f3f4f6; color: #374151; }
</style>
<body>
${navHtml}

<div class="container" style="padding: calc(var(--nav-height) + 2rem) 0 5rem;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
    <div>
      <h1 style="font-family: var(--font-heading); color: #111827; font-size: 2rem; font-weight: 800;">Admin Dashboard</h1>
      <p style="color: #6b7280;">Manage course enrollments and payment statuses.</p>
    </div>
    <button id="export-btn" style="background: #111827; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;">
      ⬇️ Export CSV
    </button>
  </div>

  <div style="overflow-x: auto;">
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID / Date</th>
          <th>Student Details</th>
          <th>Course & Format</th>
          <th>Payment Method</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="enrollments-tbody">
        <!-- Rendered by JS -->
      </tbody>
    </table>
  </div>
</div>

<script>
  function loadEnrollments() {
    const data = JSON.parse(localStorage.getItem('instructify_enrollments') || '[]');
    const tbody = document.getElementById('enrollments-tbody');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: #6b7280;">No enrollments found.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map((enr, i) => {
      const statusClass = enr.status.includes('Pending') ? 'status-Pending' :
                          enr.status.includes('Received') ? 'status-Received' :
                          enr.status.includes('Confirmed') ? 'status-Confirmed' :
                          enr.status.includes('Cancelled') ? 'status-Cancelled' : 'status-Quote';
                          
      return \`
        <tr>
          <td>
            <strong>\${enr.id}</strong><br>
            <span style="color: #6b7280; font-size: 0.8rem;">\${new Date(enr.date).toLocaleDateString()}</span>
          </td>
          <td>
            <strong>\${enr.name}</strong> (\${enr.learnerType})<br>
            <span style="color: #6b7280; font-size: 0.8rem;">\${enr.email} | \${enr.phone}</span>
          </td>
          <td>
            <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="\${enr.courseTitle}">
              <strong>\${enr.courseTitle}</strong>
            </div>
            <span style="color: #6b7280; font-size: 0.8rem;">\${enr.format}</span>
          </td>
          <td>
            <span style="text-transform: capitalize; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">\${enr.paymentMethod}</span>
          </td>
          <td><strong>\${enr.price}</strong></td>
          <td>
            <select class="status-select \${statusClass}" data-index="\${i}" onchange="updateStatus(\${i}, this.value)">
              <option value="Pending Payment" \${enr.status === 'Pending Payment' ? 'selected' : ''}>Pending Payment</option>
              <option value="Payment Received" \${enr.status === 'Payment Received' ? 'selected' : ''}>Payment Received</option>
              <option value="Confirmed Enrollment" \${enr.status === 'Confirmed Enrollment' ? 'selected' : ''}>Confirmed Enrollment</option>
              <option value="Awaiting Custom Quote" \${enr.status === 'Awaiting Custom Quote' ? 'selected' : ''}>Awaiting Custom Quote</option>
              <option value="Cancelled" \${enr.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <button onclick="alert('Notes: ' + (\`\${enr.notes}\` || 'None'))" style="background: transparent; border: 1px solid #d1d5db; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">View Notes</button>
          </td>
        </tr>
      \`;
    }).join('');
  }

  window.updateStatus = function(index, newStatus) {
    const data = JSON.parse(localStorage.getItem('instructify_enrollments') || '[]');
    data[index].status = newStatus;
    localStorage.setItem('instructify_enrollments', JSON.stringify(data));
    loadEnrollments(); // Re-render to update colors
  };

  document.getElementById('export-btn').addEventListener('click', () => {
    const data = JSON.parse(localStorage.getItem('instructify_enrollments') || '[]');
    if (data.length === 0) return alert('No data to export.');
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => \`"\${v}"\`).join(',')).join('\\n');
    const csv = headers + '\\n' + rows;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instructify_enrollments.csv';
    a.click();
  });

  // Init
  loadEnrollments();
</script>
${footerHtml}
`;

fs.writeFileSync(path.join(dir, 'admin.html'), adminHtml);

console.log('Successfully created checkout.html and admin.html');

$filePath = "about.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Find the start and end markers
$startMarker = "<!-- 7. Core Values -->"
$endMarker = "<!-- 8. Founder's Note from Alex -->"

$startIdx = $content.IndexOf($startMarker)
$endIdx   = $content.IndexOf($endMarker)

if ($startIdx -lt 0 -or $endIdx -lt 0) {
    Write-Host "ERROR: markers not found. start=$startIdx end=$endIdx"
    exit 1
}

$newSection = @"

<!-- 7. Core Values -->
<section class="section cv-section">
  <div class="container text-center">
    <span class="section-tag" style="background:#FFF3E8; color:#CC3E00; font-weight:700; border:1px solid rgba(204,62,0,0.18);">OUR GUIDING PRINCIPLES</span>
    <h2 class="cv-main-title">Core <span class="cv-title-accent">Values</span></h2>
    <p class="cv-subtitle">The eight principles that shape everything we build, teach, and stand for.</p>

    <div class="cv-grid">

      <!-- 1 Curiosity -->
      <div class="cv-card">
        <div class="cv-icon-ring" style="background:linear-gradient(135deg,#6366F1,#4F46E5);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Curiosity" role="img"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        </div>
        <h4 class="cv-card-title" style="color:#4F46E5;">Curiosity</h4>
        <p class="cv-card-desc">Celebrating questions, discovery, and the joy of lifelong learning.</p>
        <div class="cv-card-bar" style="background:linear-gradient(90deg,#6366F1,#818CF8);"></div>
      </div>

      <!-- 2 Creativity -->
      <div class="cv-card">
        <div class="cv-icon-ring" style="background:linear-gradient(135deg,#F5812D,#FF4D00);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Creativity" role="img"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>
        </div>
        <h4 class="cv-card-title" style="color:#E05D00;">Creativity</h4>
        <p class="cv-card-desc">Designing imaginative, practical, and engaging learning experiences.</p>
        <div class="cv-card-bar" style="background:linear-gradient(90deg,#F5812D,#FF4D00);"></div>
      </div>

      <!-- 3 Relevance -->
      <div class="cv-card">
        <div class="cv-icon-ring" style="background:linear-gradient(135deg,#14B8A6,#0D9488);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Relevance" role="img"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <h4 class="cv-card-title" style="color:#0D9488;">Relevance</h4>
        <p class="cv-card-desc">Rooting solutions in local cultures, materials, and community needs.</p>
        <div class="cv-card-bar" style="background:linear-gradient(90deg,#14B8A6,#0D9488);"></div>
      </div>

      <!-- 4 Collaboration -->
      <div class="cv-card">
        <div class="cv-icon-ring" style="background:linear-gradient(135deg,#3B82F6,#2145E6);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Collaboration" role="img"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h4 class="cv-card-title" style="color:#2145E6;">Collaboration</h4>
        <p class="cv-card-desc">Co-creating meaningful outcomes alongside educators and leaders.</p>
        <div class="cv-card-bar" style="background:linear-gradient(90deg,#3B82F6,#2145E6);"></div>
      </div>

      <!-- 5 Clarity -->
      <div class="cv-card">
        <div class="cv-icon-ring" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Clarity" role="img"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <h4 class="cv-card-title" style="color:#7C3AED;">Clarity</h4>
        <p class="cv-card-desc">Simplifying complex concepts into clear, learner-friendly formats.</p>
        <div class="cv-card-bar" style="background:linear-gradient(90deg,#8B5CF6,#7C3AED);"></div>
      </div>

      <!-- 6 Renewal -->
      <div class="cv-card">
        <div class="cv-icon-ring" style="background:linear-gradient(135deg,#10B981,#059669);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Renewal" role="img"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
        </div>
        <h4 class="cv-card-title" style="color:#059669;">Renewal</h4>
        <p class="cv-card-desc">Believing every learning milestone creates room for growth.</p>
        <div class="cv-card-bar" style="background:linear-gradient(90deg,#10B981,#059669);"></div>
      </div>

      <!-- 7 Integrity -->
      <div class="cv-card">
        <div class="cv-icon-ring" style="background:linear-gradient(135deg,#F43F5E,#E11D48);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Integrity" role="img"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h4 class="cv-card-title" style="color:#E11D48;">Integrity</h4>
        <p class="cv-card-desc">Leading with honesty, humility, and professional commitment.</p>
        <div class="cv-card-bar" style="background:linear-gradient(90deg,#F43F5E,#E11D48);"></div>
      </div>

      <!-- 8 Excellence -->
      <div class="cv-card">
        <div class="cv-icon-ring" style="background:linear-gradient(135deg,#F59E0B,#D97706);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Excellence" role="img"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
        </div>
        <h4 class="cv-card-title" style="color:#B45309;">Excellence</h4>
        <p class="cv-card-desc">Upholding high standards of educational quality across all services.</p>
        <div class="cv-card-bar" style="background:linear-gradient(90deg,#F59E0B,#D97706);"></div>
      </div>

    </div>
  </div>
</section>

"@

$before = $content.Substring(0, $startIdx)
$after  = $content.Substring($endIdx)
$newContent = $before + $newSection + $after

[System.IO.File]::WriteAllText((Resolve-Path $filePath).Path, $newContent, [System.Text.Encoding]::UTF8)
Write-Host "SUCCESS: Core Values section replaced."

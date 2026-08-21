const fs = require('fs');
const path = require('path');

const coursesJsPath = path.join(__dirname, 'js', 'courses.js');
let coursesJs = fs.readFileSync(coursesJsPath, 'utf8');

if (!coursesJs.includes('window.toggleWishlist')) {
  const wishlistFn = [
    '',
    '// \u2500\u2500 Wishlist Toggle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
    'window.toggleWishlist = function(btn) {',
    '  var card = btn.closest && (btn.closest("[data-course-id]") || btn.closest(".course-card"));',
    '  var courseId = card ? card.getAttribute("data-course-id") : null;',
    '  var wishlist = JSON.parse(localStorage.getItem("ik_wishlist") || "[]");',
    '  var isWishlisted = btn.classList.contains("wishlisted");',
    '  if (isWishlisted) {',
    '    btn.classList.remove("wishlisted");',
    '    btn.innerHTML = "\ud83e\udd0d";',
    '    btn.title = "Add to wishlist";',
    '    if (courseId) { var idx = wishlist.indexOf(courseId); if (idx > -1) wishlist.splice(idx, 1); }',
    '  } else {',
    '    btn.classList.add("wishlisted");',
    '    btn.innerHTML = "\u2764\ufe0f";',
    '    btn.title = "Remove from wishlist";',
    '    if (courseId && !wishlist.includes(courseId)) wishlist.push(courseId);',
    '  }',
    '  localStorage.setItem("ik_wishlist", JSON.stringify(wishlist));',
    '  if (window.showToast) { window.showToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist! \u2764\ufe0f", "info", 2000); }',
    '};',
    ''
  ].join('\r\n');

  coursesJs = coursesJs.trimEnd() + '\r\n' + wishlistFn;
  fs.writeFileSync(coursesJsPath, coursesJs);
  console.log('[OK] Added window.toggleWishlist to js/courses.js');
} else {
  console.log('[SKIP] window.toggleWishlist already defined');
}

console.log('Done.');

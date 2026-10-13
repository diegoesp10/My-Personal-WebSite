// Runs before React: applies a theme chosen earlier so the page never flashes the wrong colours, and marks
// the first page of the visit (entrance animations; removed after the first navigation).
document.documentElement.classList.add('first-visit');
try {
  var theme = localStorage.getItem('theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch (e) {
  // Storage unavailable: the system preference applies.
}

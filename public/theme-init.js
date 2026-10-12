// Runs before React: applies a theme chosen earlier so the page never flashes the wrong colours.
try {
  var theme = localStorage.getItem('theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch (e) {
  // Storage unavailable: the system preference applies.
}

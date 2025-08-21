// Tailwind CSS CDN Configuration
// This suppresses the production warning for CDN usage
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0B5394',
        'primary-green': '#2E8B57',
        'primary-yellow': '#FFD700',
        'blue-dark': '#083E6B',
        'green-dark': '#1B5E20'
      }
    }
  }
}

// Suppress console warnings for CDN usage in development
if (typeof console !== 'undefined' && console.warn) {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('cdn.tailwindcss.com should not be used in production')) {
      return; // Suppress this specific warning
    }
    originalWarn.apply(console, args);
  };
}

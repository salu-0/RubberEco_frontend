// Clear existing console output and disable further console messages in the browser
(function () {
  if (typeof window === 'undefined' || typeof console === 'undefined') return;

  const noop = function () {};

  try {
    if (typeof console.clear === 'function') {
      console.clear();
    }
  } catch (_) {}

  const methods = [
    'log',
    'info',
    'warn',
    'error',
    'debug',
    'trace',
    'group',
    'groupCollapsed',
    'groupEnd',
    'table',
    'time',
    'timeEnd',
    'timeLog',
    'dir',
    'dirxml',
    'assert',
    'count',
    'countReset',
    'profile',
    'profileEnd'
  ];

  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    try {
      if (typeof console[method] === 'function') {
        console[method] = noop;
      }
    } catch (_) {}
  }
})();






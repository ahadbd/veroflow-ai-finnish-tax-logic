'use client';

// Run mitigation immediately when module is loaded to catch early polyfill attempts
if (typeof window !== 'undefined') {
  try {
    // 1. Global error handler to suppress the specific TypeError
    window.addEventListener('error', function(event) {
      if (event.error && event.error.message && 
          (event.error.message.indexOf("Cannot set property fetch of #<Window>") !== -1 ||
           event.error.message.indexOf("fetch of #<Window> which has only a getter") !== -1)) {
        event.preventDefault();
        console.warn('Suppressed fetch overwrite error:', event.error.message);
      }
    });

    // 2. Proactive mitigation: try to add a dummy setter to window.fetch
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && !descriptor.set && descriptor.configurable) {
      const originalFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get: function() { return originalFetch; },
        set: function(v) { 
          console.warn('Blocked attempt to overwrite window.fetch', v);
        }
      });
    }
  } catch (e) {
    // Silently ignore mitigation errors
  }
}

export default function FetchMitigation() {
  return null;
}

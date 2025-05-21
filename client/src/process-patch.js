// Created as part of build error fix task on 2025-05-08, 4:22:27 AM
// This file patches the process object for browser environments.

window.process = window.process || { env: {} };

if (typeof process === 'undefined') {
  global.process = { env: {} };
}

// Export the process object
export default window.process;

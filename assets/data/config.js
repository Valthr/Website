// Valthr site configuration template
// Copy this file to config.js and fill in your values.
// config.js is excluded from the repository (see .gitignore) to keep secrets out of version control.
//
// IMPORTANT: Never commit config.js to git — rotate any key that was
// accidentally committed and create a new one in Google AI Studio.

window.VALTHR_CONFIG = {
  // Obtain a key at https://aistudio.google.com/apikey
  // Restrict it to the HTTP referrer of this site in the Google Cloud Console.
  // ⚠️  Replace the placeholder below — NEVER commit a real key to the repository.
  geminiKey: 'YOUR_GEMINI_API_KEY_HERE',

  // Optional: Cloudflare Worker that logs each chat send for internal analytics.
  // Deploy the Worker in worker/ (see worker/README.md) and paste the resulting URL.
  // If this field is missing or empty, no logging happens — the chatbot works as normal.
  // Example: 'https://valthr-chat-logger.your-subdomain.workers.dev/log'
  logEndpoint: 'https://valthr-chat-logger.aquavbr.workers.dev/log'
};

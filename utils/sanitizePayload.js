const sanitizeHtml = require("sanitize-html");

const defaultSanitizeOptions = {
  allowedTags: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "pre", "b", "i", "s", "u", "em", "strong", "mark", "code", "ul", "ol", "li", "span", "a", "br", "hr", "table", "thead", "tbody", "tr", "th", "td"],
  allowedAttributes: {
    a: ["href", "target"],
    "*": ["style"],
  },
};

/**
 * Sanitize an HTML payload with default options, allowing custom overrides.
 *
 * @param {string} payload - The HTML string to sanitize.
 * @param {Object} [options={}] - Optional sanitize-html config overrides.
 * @returns {string} - The sanitized HTML.
 */
function sanitizePayload(payload, options = {}) {
  const mergedOptions = {
    ...defaultSanitizeOptions,
    ...options,
    allowedTags: Array.from(new Set([...(defaultSanitizeOptions.allowedTags || []), ...(options.allowedTags || [])])),
    allowedAttributes: {
      ...(defaultSanitizeOptions.allowedAttributes || {}),
      ...(options.allowedAttributes || {}),
    },
  };

  return sanitizeHtml(payload, mergedOptions);
}

module.exports = sanitizePayload;

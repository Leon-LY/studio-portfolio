import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content before rendering with v-html.
 * Strips XSS vectors while preserving legitimate formatting tags.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''
  if (import.meta.server) {
    // On server, DOMPurify needs a JSDOM window. Use a simple regex fallback for SSR.
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript\s*:/gi, '')
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'hr', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'width', 'height',
      'loading', 'target', 'rel'],
  })
}

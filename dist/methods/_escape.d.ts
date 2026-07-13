/**
 * Escapes HTML special characters: & < > " '
 *
 * @param {any} value - Value to escape. Non-strings are converted first.
 * @returns {string} Escaped string
 */
declare function escapeHtml(value: any): string;
/**
 * Built-in helper 'escape'. Available in every template without declaring it.
 * Escapes the data (or its 'text' property) for safe use inside HTML.
 * A user helper with the same name takes precedence.
 */
declare function escapeHelper({ data }: {
    data: any;
}): string;
/**
 * Replaces placeholder tags inside a rendered value with inert stand-ins.
 * Used during a 'curry' render to stop data from injecting placeholders.
 *
 * @param {any} value - Rendered value
 * @returns {string} Value with neutralized placeholder tags
 */
declare function neutralizeTags(value: any): string;
/**
 * Restores neutralized placeholder tags as literal text.
 * Runs on template parts after parsing, so the restored tags are never
 * read as placeholders again - they render as plain '{{' and '}}'.
 *
 * @param {any} part - Template part
 * @returns {any} Part with the literal tags back in place
 */
declare function restoreTags(part: any): any;
export { escapeHtml, escapeHelper, neutralizeTags, restoreTags };

export default _renderHolder;
/**
 * Renders a simple template by replacing placeholders with data values.
 *
 * Processes templates with basic placeholder substitution without actions or helpers.
 * Only supports direct field replacement from the data object.
 *
 * @param {string} template - Template string with placeholders
 * @param {object} data - Data object containing values for placeholder replacement
 *
 * @returns {string|null} Rendered template string or null if data is null
 *
 * @example
 * const result = _renderHolder('Hello {{name}}!', { name: 'World' });
 * // Returns: 'Hello World!'
 */
declare function _renderHolder(template: string, data: object): string | null;

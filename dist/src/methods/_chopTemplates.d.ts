export default _chopTemplate;
/**
 * Creates a template chopping function that splits text into parts and placeholders.
 *
 * @param {object} settings - Configuration object containing template delimiters
 * @param {string} settings.TG_PRX - Opening delimiter (e.g., '{{')
 * @param {string} settings.TG_SFX - Closing delimiter (e.g., '}}')
 * @param {number} settings.TG_SIZE_P - Length of opening delimiter
 * @param {number} settings.TG_SIZE_S - Length of closing delimiter
 *
 * @returns {Function} Function that chops template text into array parts
 *
 * @example
 * const chop = _chopTemplate(settings);
 * const result = chop('Hello {{name}}!');
 */
declare function _chopTemplate(settings: {
    TG_PRX: string;
    TG_SFX: string;
    TG_SIZE_P: number;
    TG_SIZE_S: number;
}): Function;

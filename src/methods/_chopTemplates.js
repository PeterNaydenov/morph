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
 * // Returns: ['Hello ', '{{name}}', '!']
 */
function _chopTemplate ( settings ) {
    return function chop ( text ) {
        const { TG_PRX, TG_SFX, TG_SIZE_P, TG_SIZE_S } = settings;

        if ( typeof text != 'string' )   return showError ( 'notAString' )
        if ( text.length == 0        )   return []

        const start = text.indexOf ( TG_PRX )
        if ( start == -1 )   return [ text ]   // No placeholders left

        const res = []
        if ( start > 0 )   res.push ( text.slice ( 0, start ))

        let end = text.indexOf ( TG_SFX )
        const nextStart = text.indexOf ( TG_PRX, start + TG_SIZE_P )

        if ( end == -1     )   return showError ( 'missingClosing' )
        if ( end < start   )   return showError ( 'closedBeforeOpened' )
        end += TG_SIZE_S

        if ( nextStart != -1  &&  nextStart < end )   return showError ( 'newBeforeClosed' )

        res.push ( text.slice ( start, end ))

        const rest = chop ( text.slice ( end ))   // Continue with the rest of the text
        if ( typeof rest === 'string' )   return rest   // Parse error found deeper in the template. Propagate it.
        return res.concat ( rest )
    }
} // _chopTemplate func.



/**
 * Returns error messages for template parsing failures.
 *
 * @param {string} type - Error type identifier
 * @returns {string} Human-readable error message
 */
function showError ( type ) {
    switch ( type ) {
        case 'notAString':
                return `Error: Template is not a string.`
        case 'missingClosing':
                return `Error: Placeholder with missing closing tag.`
        case 'closedBeforeOpened':
                return `Error: Placeholder closing tag without starting one.`
        case 'newBeforeClosed':
                return `Error: Nested placeholders. Close placeholder before open new one.`
        default:
                return `Error: Unknown template error.`
    }
} // showError func.



export default _chopTemplate



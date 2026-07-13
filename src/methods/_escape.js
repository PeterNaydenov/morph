import settings from "./settings.js"

const
      ESCAPE_MAP = {
                      '&'  : '&amp;'
                    , '<'  : '&lt;'
                    , '>'  : '&gt;'
                    , '"'  : '&quot;'
                    , "'"  : '&#39;'
            }
    // Inert stand-ins for placeholder tags. Values written during a 'curry' render
    // carry these instead of real tags, so data can not introduce new placeholders.
    , NEUTRAL_PRX = '\u0000{'
    , NEUTRAL_SFX = '\u0000}'
    ;



/**
 * Escapes HTML special characters: & < > " '
 *
 * @param {any} value - Value to escape. Non-strings are converted first.
 * @returns {string} Escaped string
 */
function escapeHtml ( value ) {
    return String ( value ).replace ( /[&<>"']/g, ch => ESCAPE_MAP[ch] )
} // escapeHtml func.



/**
 * Built-in helper 'escape'. Available in every template without declaring it.
 * Escapes the data (or its 'text' property) for safe use inside HTML.
 * A user helper with the same name takes precedence.
 */
function escapeHelper ({ data }) {
    if ( data == null )   return ''
    const value = ( typeof data === 'object'  &&  'text' in data )  ?  data.text  :  data
    return escapeHtml ( value )
} // escapeHelper func.



/**
 * Replaces placeholder tags inside a rendered value with inert stand-ins.
 * Used during a 'curry' render to stop data from injecting placeholders.
 *
 * @param {any} value - Rendered value
 * @returns {string} Value with neutralized placeholder tags
 */
function neutralizeTags ( value ) {
    const { TG_PRX, TG_SFX } = settings
    return String ( value ).split ( TG_PRX ).join ( NEUTRAL_PRX ).split ( TG_SFX ).join ( NEUTRAL_SFX )
} // neutralizeTags func.



/**
 * Restores neutralized placeholder tags as literal text.
 * Runs on template parts after parsing, so the restored tags are never
 * read as placeholders again - they render as plain '{{' and '}}'.
 *
 * @param {any} part - Template part
 * @returns {any} Part with the literal tags back in place
 */
function restoreTags ( part ) {
    if ( typeof part !== 'string' )   return part
    const { TG_PRX, TG_SFX } = settings
    return part.split ( NEUTRAL_PRX ).join ( TG_PRX ).split ( NEUTRAL_SFX ).join ( TG_SFX )
} // restoreTags func.



export { escapeHtml, escapeHelper, neutralizeTags, restoreTags }



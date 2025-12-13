import _chopTemplate from './_chopTemplates.js'
import settings from './settings.js'



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
function _renderHolder ( template, data ) {
    // Data should be an object. No array, no string.
    if ( data == null )   return null  

    const
          chop = _chopTemplate (settings)( template )
        , set  = settings
        ;
    if ( typeof chop === 'string' )   return chop
    chop.forEach ( ( item, i ) => {
            const isPlaceholder = item.includes ( set.TG_PRX )
            if ( isPlaceholder ) {
                        const field = item.replace(set.TG_PRX, '').replace(set.TG_SFX, '').trim();
                        if (data.hasOwnProperty(field) && data[field] != null) {
                                let val = data [ field ]
                                if ( typeof val === 'object' && val.text )   val = val.text
                                chop[i] = val
                            }
                } // if isPlaceholder
        }) // forEach chop
    return chop.join ( '' )
} // _renderHolder func.



export default _renderHolder



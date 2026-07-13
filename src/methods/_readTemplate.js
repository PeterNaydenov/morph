import settings from "./settings.js";
import _chopTemplate from "./_chopTemplates.js"
import { escapeHelper, restoreTags } from "./_escape.js"



/**
 * Normalizes field data by returning null for falsy values.
 * 
 * @param {any} field - Field value to normalize
 * @returns {any|null} Returns the field if truthy, null otherwise
 */
function readData ( field ) {
    return   field ? field : null
} // readData func.



/**
 * Parses and validates a template description object.
 * 
 * Extracts placeholders, validates helpers, and prepares template for building.
 * 
 * @param {object} tpl - Template description object
 * @param {string} tpl.template - Template string with placeholders
 * @param {object} [tpl.helpers={}] - Optional helper functions
 * @param {object} [tpl.handshake] - Optional example data
 * @param {boolean} [tpl.escape=false] - Optional. HTML-escape the output of data-only placeholders
 *
 * @returns {object} Template parsing result containing:
 *   - hasError: Error message or null
 *   - placeholders: Array of placeholder objects
 *   - chop: Array of template parts
 *   - helpers: Helper functions object (includes the built-in 'escape' helper)
 *   - handshake: Example data object
 *   - snippets: Object mapping snippet names to placeholders
 *   - escape: Escape flag of the template
 */
function _readTemplate ( tpl ) {
    const
             { template, helpers={}, handshake, escape=false } = tpl
            ,{ TG_PRX, TG_SFX, TG_SIZE_P, TG_SIZE_S } = settings
            , placeholders = []
            , snippets = {}
            ;

    // Remove from template all html comments and multiple spaces
    const Thetemplate = (typeof template === 'string')  ? template
                                                                .replace(/<!--[\s\S]*?-->/g, '')
                                                                .replace ( /\s{2,}/g, ' ' ) 
                                                        : template

    let hasError = null;
    const chop = _chopTemplate (settings)( Thetemplate );

    if ( typeof chop  === 'string' )   hasError = chop
    else {
              chop.forEach ( (item,i) => {
                              const 
                                      // Placeholder contains: Opening tag(TG_PRX), dataName, delimiter(:), list of operations, placeholder's name, closing tag(TG_SFX)
                                        finding = RegExp ( TG_PRX + '\\s*(.*?)\\s*(?::\\s*(.*?)\\s*)?(?::\\s*(.*?)\\s*)?' + TG_SFX, 'g' )
                                      , isPlaceholder = item.includes( TG_PRX )
                                      ;
                                      
                              if ( isPlaceholder ) {
                                              const x = finding.exec ( item )
                                              if ( !x ) return
                                              let holder = {
                                                                index: i
                                                              , data   : readData    ( x[1] )
                                                              , action : x[2] ? x[2].split(',').map ( x => x.trim()) : null
                                                              , name   : x[3] ? x[3].trim() : null
                                                      }
                                              // With template escaping on, action 'raw' is a marker, not a helper
                                              if ( escape  &&  holder.action  &&  holder.action.includes ( 'raw' )) {
                                                              holder.raw = true
                                                              const rest = holder.action.filter ( a => a !== 'raw' )
                                                              holder.action = rest.length ? rest : null
                                                      }
                                              placeholders.push ( holder )
                                              snippets[placeholders.length-1] = holder
                                              if ( holder.name )   snippets[holder.name] = holder
                                      } // if isPlaceholder
                      }) // forEach chop

              // Restore placeholder tags neutralized by a 'curry' render. They come
              // back as plain text - the scan above is already done, so they can
              // never be read as placeholders again.
              for ( let i = 0; i < chop.length; i++ )   chop[i] = restoreTags ( chop[i] )
      } // else error

    return {
              hasError
            , placeholders
            , chop
            , helpers : { escape: escapeHelper, ...helpers }   // Built-in helpers first. User helpers can override them.
            , handshake
            , snippets
            , escape
            }
} // _readTemplate func.



export default _readTemplate



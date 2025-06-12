import settings from "./settings.js";
import _chopTemplate from "./_chopTemplates.js"



function readData ( field ) {
    return   field ? field : null
} // readData func.



function _readTemplate ( tpl ) {
    const 
             { template, helpers={}, handshake } = tpl
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
                                                    placeholders.push ( holder )
                                                    snippets[placeholders.length-1] = holder
                                                    if ( holder.name )   snippets[holder.name] = holder
                                            } // if isPlaceholder
                            }) // forEach chop
            } // else error



    // Check helpers - sanity check
    placeholders.forEach ( holder => {
                if ( !holder.action ) return
                holder.action.every ( act => {
                                        if ( act === '#'  )   return true
                                        if ( act === '^^' )   return true
                                        if ( act.startsWith('^') && act !== '^^' )   return true
                                        if ( act.startsWith ( '?' )) act = act.replace ( '?', '' )
                                        if ( act.startsWith ( '+' )) act = act.replace ( '+', '' )
                                        if ( act.startsWith ( '[]' )) act = act.replace ( '[]', '' )
                                        if ( act.startsWith ( '>' )) act = act.replace ( '>', '' )
                                        if ( act === ''   )   return true
                                        if ( helpers[act] )   return true 
                                        else {
                                                hasError = `Error: Missing helper: ${act}`
                                                return false
                                                }
                        }) // every action
            }) // forEach placeholders



    return {
              hasError 
            , placeholders
            , chop
            , helpers
            , handshake
            , snippets
            }
} // _readTemplate func.



export default _readTemplate



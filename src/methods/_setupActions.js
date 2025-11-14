/**
 * Parses and organizes template actions into a structured setup by processing level.
 * 
 * Converts action strings into structured objects with types and levels. Validates that
 * there are enough level markers (#) for the data depth.
 * 
 * @param {string[]} actions - Array of action strings to process
 * @param {number} [dataDeepLevel=10] - Maximum depth level for nested data processing
 * 
 * @returns {Object} Object with numeric keys containing arrays of action objects by level
 * 
 * @example
 * const setup = _setupActions(['render', '#', 'save:var'], 2);
 * // Returns: { 0: [{type: 'render', name: 'render', level: 0}], 
 * //            1: [{type: 'save', name: 'var', level: 1}], 
 * //            2: [] }
 */
function _setupActions ( actions, dataDeepLevel=10 ) {
    let 
      actSetup = {}
    , actionList = [...actions]
    , actLevel = 0
    , i = 0
    , countHashes = 0
    ;
    
    actionList.forEach ( action => {   if ( action === '#' )  countHashes++   })
    if ( countHashes < dataDeepLevel )   console.error ( `Error: Not enough level markers (#) for data with depth level ${dataDeepLevel}. Found ${countHashes} level markers in actions: ${actions.join(', ')}` )

    do {
            actSetup[i] = []
            i++
    } while ( i <= dataDeepLevel )



    actionList.every ( act => {
                    if ( act === '#' ) {   // it's a change level action
                                    actLevel++
                                    if ( actLevel > dataDeepLevel )  return false
                                    return true
                            }
                    if ( act.startsWith ( '?' ) ) {   // it's a condition render action
                                    actSetup[actLevel].push ({
                                                      type: 'route'
                                                    , name: act.replace ( '?', '' )
                                                    , level: actLevel
                                                    })
                                    return true
                            }
                    if ( act.startsWith ('^')  && act !== '^^'  ) {
                                   actSetup[actLevel].push ({
                                                          type: 'save'
                                                        , name: act.replace ( '^', '' )
                                                        , level: actLevel
                                        })
                                        return true
                            }
                    if ( act === '^^') {
                                   actSetup[actLevel].push ({
                                                          type: 'overwrite'
                                                        , name : 'none'
                                                        , level: actLevel       
                                                })
                                        return true
                            }
                    if ( act.startsWith ( '+' ) ) {   // it's a extended render action
                                    actSetup[actLevel].push ({
                                                      type: 'extendedRender'
                                                    , name: act.replace ( '+', '' )
                                                    , level: actLevel
                                                    })
                                    return true
                            }
                    if ( act.startsWith ( '[]' )) {   // it's a mixing action
                                    actSetup[actLevel].push ({
                                                      type: 'mix'
                                                    , name: act.replace ( '[]', '' )
                                                    , level: actLevel
                                                    })
                                    return true
                            }
                    if ( act.startsWith ( '>' ) ) {   // it's a data action. Result will be merged to existing data
                                    actSetup[actLevel].push ({
                                                      type: 'data'
                                                    , name: act.replace ( '>', '' )
                                                    , level: actLevel
                                                    })
                                    return true
                            }
                    if ( act === '' ) {  
                                    return true
                            }
                            
            actSetup[actLevel].push ({
                                              type: 'render'
                                            , name: act
                                            , level: actLevel
                                            })
            return true
            }) // actionList every
    return actSetup
} // _setupActions func.



export default _setupActions



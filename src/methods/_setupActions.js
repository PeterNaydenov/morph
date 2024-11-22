function _setupActions ( actions, dataDeepLevel=10 ) {
    let 
      actSetup = {}
    , actLevel = 0
    , actionList = [...actions]
    , i = 0
    ;
    
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
                    if ( act.startsWith ( '!' ) ) {   // it's a route action
                                    actSetup[actLevel].push ({
                                                      type: 'route'
                                                    , name: act.replace ( '!', '' )
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



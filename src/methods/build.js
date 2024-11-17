import _chopTemplate     from "./_chopTemplates.js"
import _defineData       from "./_defineData.js"
import _actionSupply     from "./_actionSupply.js"
import _setupActions     from "./_setupActions.js"
import _readTemplate     from "./_readTemplate.js"
import _renderHolder     from './_renderHolder.js'
import _defineDataType   from "./_defineType.js"





 function build  ( tpl ) {
        
        const { hasError, placeholders, chop, helpers } = _readTemplate ( tpl );
       
        if ( hasError ) {
                        return function fail () {
                                        return hasError
                                }
                }
        else {  // If no errors:
                        let cuts = structuredClone ( chop );
                        // *** Template recognition complete. Start building the rendering function -->                        
                        return function success ( d={} ) {
                                        
                                        const 
                                             topLevelType = _defineDataType ( d )
                                           , endData = []
                                           ;

                                        if ( typeof d === 'string' ) {
                                                // 'd' is a string when we want to debug the template
                                                   switch ( d ) {
                                                        case 'raw':
                                                                // return a template with placeholders
                                                                return cuts.join('')
                                                        case 'demo':
                                                                // render with handshake object
                                                                break
                                                        case 'handshake':
                                                                // return handshake object
                                                                break
                                                        case 'helpers':
                                                                // return helpers object
                                                        }
                                                   return
                                                } // if 'd' is string
                                        
                                        if ( topLevelType !== 'array' )   d = [ d ]
                                        
                                        // TODO: If 'd' is null -> then no data for all the placeholders        
                                        d.forEach ( d => {
                                        placeholders.forEach ( holder => {   // Placeholders
                                                        const 
                                                             { index, data, action } = holder
                                                           , dataOnly   = !action && data
                                                           , actionOnly = !data && action
                                                           ;
                                                        let initialRound = true   // Take data from source? False - take it from buffer       

                                                        if ( dataOnly ) {
                                                                        const 
                                                                             info = d[data]
                                                                           , type = _defineDataType ( info )
                                                                           ;
                                                                        switch ( type ) {
                                                                                case 'primitive':
                                                                                        cuts[index] = info
                                                                                        return
                                                                                case 'array':
                                                                                        if ( _defineDataType(info[0]) === 'primitive' )   cuts[index] = info[0]
                                                                                        return
                                                                                case 'object':
                                                                                        if ( info.text )   cuts[index] = info.text
                                                                                        return
                                                                                default:
                                                                                        // TODO: Error in data...
                                                                                } // switch
                                                                } // dataOnly
                                                        else {   // Data and Actions
                                                                        const 
                                                                           { dataDeepLevel, nestedData } = (data==='@all' || data===null) ? _defineData ( d ) : _defineData ( d[data] )
                                                                           , actSetup = _actionSupply ( _setupActions ( action, dataDeepLevel ), dataDeepLevel )
                                                                           , buffer = {}
                                                                           ;

                                                                        for ( let step of actSetup ) {
                                                                                        let { type, name, level } = step;
                                                                                        function setRenderData ( d={} ) {
                                                                                                        if ( typeof d === 'string' )  return { text: d }
                                                                                                        else return d
                                                                                                } // setRenderData func.
                                                                                        
                                                                                        switch ( type ) {   // Action type 'data', 'render', or mix -> different operations
                                                                                                case 'data':
                                                                                                        let
                                                                                                            theData = initialRound ? nestedData[dataDeepLevel] : buffer[data]
                                                                                                          , dataType = _defineDataType ( theData )
                                                                                                          ;
                                                                                                        switch ( dataType ) {
                                                                                                                case 'array':
                                                                                                                        buffer[data] = theData.map ( d => helpers[name]( d ) )
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        buffer[data] = helpers[name]( theData )
                                                                                                                        break
                                                                                                                case 'function':
                                                                                                                        break
                                                                                                                case 'primitive':
                                                                                                                        buffer[data] = helpers[name]( theData )
                                                                                                                        break
                                                                                                                } // switch dataType
                                                                                                        initialRound = false
                                                                                                        break;
                                                                                                case 'render':
                                                                                                        // TODO: render could be a function and template.
                                                                                                        const 
                                                                                                             renderData = initialRound ? nestedData[dataDeepLevel] : buffer[data]
                                                                                                           , renderDataType = _defineDataType ( renderData )
                                                                                                           , isRenderFunction = typeof helpers[name] === 'function'
                                                                                                           ;
                                                                                                        switch ( renderDataType ) {
                                                                                                                case 'array':
                                                                                                                        if ( isRenderFunction )  buffer[data] = helpers[name](renderData)
                                                                                                                        else                     buffer[data] = renderData.map ( d => _renderHolder ( helpers[name], setRenderData(d) ))
                                                                                                                        break
                                                                                                                case 'primitive':
                                                                                                                        if ( isRenderFunction )  buffer[data] = helpers[name]( setRenderData(renderData) )
                                                                                                                        else                     buffer[data] = _renderHolder ( helpers[name], setRenderData(renderData)   ) 
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        buffer[data] = renderData
                                                                                                                        if ( isRenderFunction )  buffer[data]['text'] = helpers[name]( renderData )
                                                                                                                        else                     buffer[data]['text'] = _renderHolder ( helpers[name], renderData   )
                                                                                                                        break
                                                                                                                } // switch renderDataType 
                                                                                                        initialRound = false
                                                                                                        break;
                                                                                                case 'mix':
                                                                                                        const 
                                                                                                              mixData     = initialRound ? nestedData[level] : buffer[data]
                                                                                                            , mixDataType = _defineDataType ( mixData )
                                                                                                            ;
                                                                                                            
                                                                                                        if ( name === '' ) {
                                                                                                                switch ( mixDataType ) {
                                                                                                                                case 'primitive':
                                                                                                                                        buffer[data] = mixData
                                                                                                                                        break
                                                                                                                                case 'array':
                                                                                                                                        buffer[data] = mixData.join ( '' )
                                                                                                                                        break
                                                                                                                                case 'object':
                                                                                                                                        buffer[data] = mixData.text
                                                                                                                                        break
                                                                                                                }}
                                                                                                        
                                                                                                        else                 buffer[data] = helpers[name]( mixData )
                                                                                                        initialRound = false
                                                                                                        break
                                                                                                        // buffer[name] = helpers[name]( mixed )
                                                                                                default:
                                                                                                        break
                                                                                                }
                                                                                } // for step of actSetup
                                                                                let accType = _defineDataType ( buffer[data] )
                                                                                if ( buffer[data] == null )   return
                                                                                switch ( accType ) {
                                                                                                case 'primitive':
                                                                                                        cuts[index] = buffer[data]
                                                                                                        break
                                                                                                case 'object': 
                                                                                                        cuts[index] = buffer[data]['text']
                                                                                                        break
                                                                                                case 'array':
                                                                                                        cuts[index] = buffer[data].join ( '' )
                                                                                                        break
                                                                                        } // switch accType
                                                                } // else other                
                                                }) // forEach placeholders
                                        endData.push ( cuts.join ( '' ))
                                        }) // forEach d
                                        if ( topLevelType === 'array' )  return endData
                                        return                           endData.join ('')
                                } // success func.
                }
} // build func.









export default build



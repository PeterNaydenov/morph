import _chopTemplate     from "./_chopTemplates.js"
import _defineData       from "./_defineData.js"
import _actionSupply     from "./_actionSupply.js"
import _setupActions     from "./_setupActions.js"
import _readTemplate     from "./_readTemplate.js"
import _renderHolder     from './_renderHolder.js'
import _defineDataType   from "./_defineType.js"





 function build  ( tpl ) {
        
        const { hasError, placeholders, chop, helpers, handshake } = _readTemplate ( tpl );
       
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
                                                                d = handshake // render with handshake object
                                                                break
                                                        case 'handshake':
                                                                return structuredClone (handshake)   // return a copy of handshake object
                                                        case 'placeholders':
                                                                return placeholders.map ( h => cuts[h.index] ).join ( ', ')
                                                        default:
                                                                return `Error: Wrong command "${d}".`
                                                        }
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


                                                                        function renderLn ( theData, name, helpers ) {
                                                                                // *** Executes rendering and return the results 
                                                                                function setRenderData ( d={} ) {
                                                                                                if ( typeof d === 'string' )  return { text: d }
                                                                                                else return d
                                                                                        } // setRenderData func.
                                                                                const isRenderFunction = typeof helpers[name] === 'function';   // Render could be a function and template.
                                                                                const dataType  = _defineDataType ( theData );

                                                                                switch ( dataType ) {
                                                                                        case 'primitive':
                                                                                                theData = setRenderData ( theData )
                                                                                        default :
                                                                                                if ( isRenderFunction )  return helpers[name]( theData )
                                                                                                else                     return _renderHolder ( helpers[name], theData   )
                                                                                        } // switch renderDataType 
                                                                                }  // renderLn func.




                                                                        for ( let step of actSetup ) {
                                                                                        let 
                                                                                                  theData = initialRound ? nestedData[dataDeepLevel] : buffer[data]
                                                                                                , dataType = _defineDataType ( theData )
                                                                                                ;
                                                                                        let { type, name, level } = step
                                                                                        
                                                                                        switch ( type ) {   // Action type 'data', 'render', or mix -> different operations
                                                                                                case 'route':
                                                                                                        switch ( dataType ) {
                                                                                                                        case 'array': 
                                                                                                                                buffer[data] = theData.map ( d => {
                                                                                                                                                        if ( d == null ) return null
                                                                                                                                                        const dType = _defineDataType ( d )
                                                                                                                                                        const routeName = helpers[name]( d );
                                                                                                                                                        if ( routeName == null )  return d
                                                                                                                                                        if ( dType === 'object' ) d.text = renderLn ( d, routeName, helpers )
                                                                                                                                                        else                      d = renderLn ( d, routeName, helpers )
                                                                                                                                                        return d
                                                                                                                                                })
                                                                                                                                break
                                                                                                                        case 'object':
                                                                                                                                buffer[data]['text'] = renderLn ( theData, routeName, helpers )
                                                                                                                                break
                                                                                                                        case 'primitive':
                                                                                                                                buffer[data] = renderLn ( theData, routeName, helpers )
                                                                                                                                break
                                                                                                                }
                                                                                                        break        
                                                                                                case 'data':
                                                                                                        switch ( dataType ) {
                                                                                                                case 'array':
                                                                                                                        buffer[data] = theData.map ( d => helpers[name]( d ) )                                                                                                                        
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        buffer[data] = helpers[name]( theData )
                                                                                                                        break
                                                                                                                case 'function':
                                                                                                                        // TODO: ....?
                                                                                                                        break
                                                                                                                case 'primitive':
                                                                                                                        buffer[data] = helpers[name]( theData )
                                                                                                                        break
                                                                                                                } // switch dataType
                                                                                                        initialRound = false
                                                                                                        break
                                                                                                case 'render':
                                                                                                        const isRenderFunction = typeof helpers[name] === 'function';   // Render could be a function and template.
                                                                                                        switch ( dataType ) {
                                                                                                                case 'array':
                                                                                                                        if ( isRenderFunction  )  buffer[data] = theData.map ( d => {
                                                                                                                                                                                const dType = _defineDataType ( d );
                                                                                                                                                                                const text = helpers[name]( d );
                                                                                                                                                                                if ( text == null ) return null
                                                                                                                                                                                if ( dType === 'object' ) d.text = text
                                                                                                                                                                                else                      d      = text
                                                                                                                                                                                return d
                                                                                                                                                                        }) 
                                                                                                                        else                      buffer[data] = theData.map ( d => {
                                                                                                                                                                d.text = renderLn ( d, name, helpers )
                                                                                                                                                                return d 
                                                                                                                                                        }) 
                                                                                                                        // console.log ( buffer[data] )
                                                                                                                        break
                                                                                                                case 'primitive':
                                                                                                                        buffer[data] = renderLn ( theData, name, helpers )
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        buffer[data] = theData
                                                                                                                        buffer[data]['text'] = renderLn ( theData, name, helpers )
                                                                                                                        break
                                                                                                                } // switch renderDataType 
                                                                                                        initialRound = false
                                                                                                        break;
                                                                                                case 'mix':  
                                                                                                        if ( name === '' ) { // when is anonymous mixing helper
                                                                                                                switch ( dataType ) {
                                                                                                                                case 'primitive':
                                                                                                                                        buffer[data] = theData
                                                                                                                                        break
                                                                                                                                case 'array':
                                                                                                                                        buffer[data] = theData.filter ( x => x != null ).join ( '' )
                                                                                                                                        break
                                                                                                                                case 'object':
                                                                                                                                        buffer[data] = theData.text
                                                                                                                                        break
                                                                                                                }}
                                                                                                        
                                                                                                        else                 buffer[data] = helpers[name]( theData )
                                                                                                        initialRound = false
                                                                                                        break
                                                                                                        // buffer[name] = helpers[name]( mixed )
                                                                                                default:
                                                                                                        break
                                                                                                }
                                                                                } // for step of actSetup
                                                                                let accType = _defineDataType ( buffer[data] )
                                                                                switch ( accType ) {
                                                                                                case 'primitive':
                                                                                                        if ( buffer[data] == null )   return
                                                                                                        cuts[index] = buffer[data]
                                                                                                        break
                                                                                                case 'object': 
                                                                                                        if (buffer[data]['text'] == null )   return
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



import _chopTemplate     from "./_chopTemplates.js"
import _defineData       from "./_defineData.js"
import _actionSupply     from "./_actionSupply.js"
import _setupActions     from "./_setupActions.js"
import _readTemplate     from "./_readTemplate.js"
import _renderHolder     from './_renderHolder.js'
import _defineDataType   from "./_defineType.js"
import render from './render.js'





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

                                        if ( typeof d === 'string' ) {   // 'd' is a string when we want to debug the template
                                                   switch ( d ) {
                                                        case 'raw':
                                                                return cuts.join('')   // Original template with placeholders
                                                        case 'demo':
                                                                if ( !handshake ) return `Error: No handshake data.`
                                                                d = handshake // Render with handshake object
                                                                break
                                                        case 'handshake':
                                                                if ( !handshake ) return `Error: No handshake data.`
                                                                return structuredClone (handshake)   // return a copy of handshake object
                                                        case 'placeholders':
                                                                return placeholders.map ( h => cuts[h.index] ).join ( ', ')
                                                        default:
                                                                return `Error: Wrong command "${d}". Available commands: raw, demo, handshake, placeholders.`
                                                        }
                                                } // if 'd' is string
                                        
                                        if ( topLevelType !== 'array' )   d = [ d ]
                                        
                                        // TODO: If 'd' is null -> then no data for all the placeholders        
                                        d.forEach ( d => {
                                        placeholders.forEach ( holder => {   // Placeholders
                                                        const 
                                                             { index, data, action } = holder
                                                           , dataOnly   = !action && data
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
                                                                                } // switch
                                                                } // dataOnly
                                                        else {   // Data and Actions
                                                                        const 
                                                                             { dataDeepLevel, nestedData } = (data==='@all' || data===null) ? _defineData ( d ) : _defineData ( d[data] )
                                                                           , actSetup = _actionSupply ( _setupActions ( action, dataDeepLevel ), dataDeepLevel )
                                                                           , buffer = {}
                                                                           ;
                                                                        
                                                                        for ( let step of actSetup ) {
                                                                                        let 
                                                                                                  theData = initialRound ? nestedData[dataDeepLevel] : buffer[data]
                                                                                                , dataType = _defineDataType ( theData )
                                                                                                ;
                                                                                        let { type, name } = step   // {level} is not in use
                                                                                        
                                                                                        switch ( type ) {   // Action type 'route','data', 'render', or mix -> different operations
                                                                                                case 'route':
                                                                                                        switch ( dataType ) {
                                                                                                                        case 'array': 
                                                                                                                                buffer[data] = theData.map ( d => {
                                                                                                                                                        if ( d == null ) return null
                                                                                                                                                        const dType = _defineDataType ( d )
                                                                                                                                                        const routeName = helpers[name]( d );
                                                                                                                                                        if ( routeName == null )  return d
                                                                                                                                                        if ( dType === 'object' ) d.text = render ( d, routeName, helpers )
                                                                                                                                                        else                      d = render ( d, routeName, helpers )
                                                                                                                                                        return d
                                                                                                                                                })
                                                                                                                                break
                                                                                                                        case 'object':
                                                                                                                                buffer[data]['text'] = render ( theData, routeName, helpers )
                                                                                                                                break
                                                                                                                        case 'primitive':
                                                                                                                                buffer[data] = render ( theData, routeName, helpers )
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
                                                                                                                                                                                if ( d == null ) return null
                                                                                                                                                                                const dType = _defineDataType ( d );
                                                                                                                                                                                const text = helpers[name]( d );
                                                                                                                                                                                if ( text == null ) return null
                                                                                                                                                                                if ( dType === 'object' ) d.text = text
                                                                                                                                                                                else                      d      = text
                                                                                                                                                                                return d
                                                                                                                                                                        }) 
                                                                                                                        else                      buffer[data] = theData.map ( d => {
                                                                                                                                                                if ( d == null ) return null
                                                                                                                                                                const dType = _defineDataType ( d );
                                                                                                                                                                const text = render ( d, name, helpers )
                                                                                                                                                                if ( dType === 'object' ) d.text = text
                                                                                                                                                                else                      d      = text
                                                                                                                                                                return d 
                                                                                                                                                        }) 
                                                                                                                        break
                                                                                                                case 'primitive':
                                                                                                                        buffer[data] = render ( theData, name, helpers )
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        buffer[data] = theData
                                                                                                                        buffer[data]['text'] = render ( theData, name, helpers )
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
                                                                                                                                        buffer[data] = theData.map ( x => {
                                                                                                                                                                        let xType = _defineDataType ( x );
                                                                                                                                                                        if ( xType === 'object' )   return x.text
                                                                                                                                                                        return x 
                                                                                                                                                                })
                                                                                                                                                               .filter ( x => x != null )
                                                                                                                                                               .join ( '' )
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



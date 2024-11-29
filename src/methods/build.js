import _chopTemplate     from "./_chopTemplates.js"
import _defineData       from "./_defineData.js"
import _actionSupply     from "./_actionSupply.js"
import _setupActions     from "./_setupActions.js"
import _readTemplate     from "./_readTemplate.js"
import _renderHolder     from './_renderHolder.js'
import _defineDataType   from "./_defineType.js"
import render            from './render.js'


import walk from '@peter.naydenov/walk'



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
                                        if ( topLevelType === 'null' )   return cuts.join ( '' )
                                        // Commands : raw, demo, handshake, placeholders
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
                                                                             { dataDeepLevel, nestedData } = (data==='@all' || data===null || data==='@root' ) ? _defineData ( d ) : _defineData ( d[data] )
                                                                           , actSetup = _actionSupply ( _setupActions ( action, dataDeepLevel ), dataDeepLevel )
                                                                           ;

                                                                        for ( let step of actSetup ) {
                                                                                        let { type, name, level } = step
                                                                                        let 
                                                                                                  theData = nestedData[level]
                                                                                                , dataType = _defineDataType ( theData )
                                                                                                ;
                                                                                        
                                                                                        switch ( type ) {   // Action type 'route','data', 'render', or mix -> different operations
                                                                                                case 'route':
                                                                                                        switch ( dataType ) {
                                                                                                                        case 'array': 
                                                                                                                                theData.forEach ( (d,i) => {
                                                                                                                                                if ( d == null ) return
                                                                                                                                                const dType = _defineDataType ( d )
                                                                                                                                                const routeName = helpers[name]( d );
                                                                                                                                                if ( routeName == null )  return
                                                                                                                                                if ( dType === 'object' ) theData[i]['text'] = render ( d, routeName, helpers )
                                                                                                                                                else                      theData[i]         = render ( d, routeName, helpers )
                                                                                                                                        })
                                                                                                                                break
                                                                                                                        case 'object':
                                                                                                                                theData['text'] = render ( theData, routeName, helpers )
                                                                                                                                break
                                                                                                                        case 'primitive':
                                                                                                                                nestedData[level] = render ( theData, routeName, helpers )
                                                                                                                                break
                                                                                                                }
                                                                                                        break        
                                                                                                case 'data':                                                                                                        
                                                                                                        switch ( dataType ) {
                                                                                                                case 'array':
                                                                                                                        theData.forEach ( (d,i) => theData[i] = helpers[name]( d ) )                                                                                                                        
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        nestedData[level] = helpers[name]( theData )
                                                                                                                        break
                                                                                                                case 'function':
                                                                                                                        nestedData[level] = theData ()
                                                                                                                        break
                                                                                                                case 'primitive':
                                                                                                                        nestedData[level] = helpers[name]( theData )
                                                                                                                        break
                                                                                                                } // switch dataType
                                                                                                        
                                                                                                        break
                                                                                                case 'render':    
                                                                                                // console.log ( name )                                                                                                    
                                                                                                        const isRenderFunction = typeof helpers[name] === 'function';   // Render could be a function and template.
                                                                                                        switch ( dataType ) {
                                                                                                                case 'array':
                                                                                                                        if ( isRenderFunction  )  theData.forEach ( (d,i) => {
                                                                                                                                                                if ( d == null ) return
                                                                                                                                                                const dType = _defineDataType ( d );
                                                                                                                                                                const text = helpers[name]( d );
                                                                                                                                                                if ( text == null ) theData[i] = null
                                                                                                                                                                if ( dType === 'object' )  d['text'] = text
                                                                                                                                                                else                      theData[i] = text                                                                                                                                                                
                                                                                                                                                        }) 
                                                                                                                        else                      theData.forEach ( (d,i) => {
                                                                                                                                                                if ( d == null ) return
                                                                                                                                                                const 
                                                                                                                                                                       dType = _defineDataType ( d )
                                                                                                                                                                     , text = render ( d, name, helpers )
                                                                                                                                                                     ;
                                                                                                                                                                if ( text == null ) theData[i] = null
                                                                                                                                                                if ( dType === 'object' ) d['text']  = text
                                                                                                                                                                else                      theData[i] = text
                                                                                                                                                        }) 
                                                                                                                        break
                                                                                                                case 'primitive':
                                                                                                                        nestedData[level] = render ( theData, name, helpers )
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        let kTest = Object.keys ( theData ).find ( k => k.includes ( '/' )   );   // Check if keys are breadcrumbs
                                                                                                                        if ( kTest )   Object.entries( theData ).forEach( ([k,v]) => v['text'] = render ( v, name, helpers )  )
                                                                                                                        else           theData['text'] = render ( theData, name, helpers )
                                                                                                                        break
                                                                                                                } // switch renderDataType 
                                                                                                        break;
                                                                                                case 'extendedRender':
                                                                                                        // TODO: Test extendedRender
                                                                                                        const isValid = typeof helpers[name] === 'function';   // Render could be a function and template.
                                                                                                        if ( isValid ) {
                                                                                                                        nestedData[level] = helpers[name]( nestedData[0] )
                                                                                                                }
                                                                                                        else {
                                                                                                                        // TODO: Error...
                                                                                                                }
                                                                                                        break
                                                                                                case 'mix':  
                                                                                                        if ( name === '' ) {   // when is anonymous mixing helper
                                                                                                                switch ( dataType ) {
                                                                                                                                case 'object':
                                                                                                                                        let kTest = Object.keys ( theData ).find ( k => k.includes ( '/' )   );   // Check if keys are breadcrumbs
                                                                                                                                        if ( kTest ) Object.entries( theData ).forEach( ([k,v]) =>  nestedData[level][k] = v['text'] )
                                                                                                                                        else         nestedData[level] = theData['text']
                                                                                                                                        for ( let i=level-1; i >= 0; i-- ) {
                                                                                                                                                    nestedData[i] = walk ({data:nestedData[i], objectCallback:check})
                                                                                                                                                }
                                                                                                                                        function check ({ value, breadcrumbs }) {
                                                                                                                                                        if ( nestedData[level][breadcrumbs] )    return nestedData[level][breadcrumbs]
                                                                                                                                                        return value
                                                                                                                                                } // check
                                                                                                                                        break
                                                                                                                                case 'array':
                                                                                                                                        nestedData[level] = theData.map ( x => {
                                                                                                                                                                        let xType = _defineDataType ( x );
                                                                                                                                                                        if ( xType === 'object' )   return x.text
                                                                                                                                                                        return x 
                                                                                                                                                                })
                                                                                                                                                               .filter ( x => x != null )
                                                                                                                                                               .join ( '' )
                                                                                                                                        break
                                                                                                                        } // switch dataType
                                                                                                            } // if name === ''
                                                                                                        else                 nestedData[level] = helpers[name]( theData )
                                                                                                        break
                                                                                                default:
                                                                                                        break
                                                                                                }
                                                                                } // for step of actSetup
                                                                                let accType = _defineDataType ( nestedData[0] )
                                                                                let fineData = nestedData[0]
                                                                                
                                                                                switch ( accType ) {
                                                                                                case 'primitive':
                                                                                                        if ( fineData == null )   return
                                                                                                        cuts[index] = fineData
                                                                                                        break
                                                                                                case 'object': 
                                                                                                        if (fineData['text'] == null )   return
                                                                                                        cuts[index] = fineData['text']
                                                                                                        break
                                                                                                case 'array':
                                                                                                        cuts[index] = fineData.join ( '' )
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



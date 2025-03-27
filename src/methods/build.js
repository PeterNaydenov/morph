import _chopTemplate     from "./_chopTemplates.js"
import _defineData       from "./_defineData.js"
import _actionSupply     from "./_actionSupply.js"
import _setupActions     from "./_setupActions.js"
import _readTemplate     from "./_readTemplate.js"
import _renderHolder     from './_renderHolder.js'
import _defineDataType   from "./_defineType.js"
import render            from './render.js'


import walk from '@peter.naydenov/walk'

/**
 * @typedef {Object} Template
 * @property {string} template - Data to be rendered;
 * @property {object} [helpers] - Optional. Object with helper functions or simple templates for this template; 
 * @property {object} [handshake] - Optional. Example for data to be rendered with;
 */

/**
 * @typedef {Array}  tupleResult
 * @property {boolean} 0 - Indicates success (true) or failure (false).
 * @property {function} 1 - The rendering function or an error function.
 */



/**
 * 
 * @param {Template} tpl - template definition;
 * @param {boolean} [extra] - Optional. How to receive the answer - false:as a string(answer) or tuple[success, answer];
 * @param {object} [buildDependencies] - Optional. External dependencies injected;
 * @returns {function|tupleResult} - rendering function
 */
function build  ( tpl, extra=false, buildDependencies={} ) {
        const { hasError, placeholders, chop, helpers, handshake } = _readTemplate ( tpl );
        if ( hasError ) {
                        function fail () { return hasError }
                        return extra ? [ false, fail ] : fail
                }
        else {  // If NO Error:
                        let cuts = structuredClone ( chop );
                        // *** Template recognition complete. Start building the rendering function -->

                        /**
                         * Function to render a template with data. 
                         * @param {Object} [d={}] - The data to render with. If string, it's a command. 
                         * @param {Object} [dependencies={}] - The dependencies to use for the rendering.
                         * @param  {...any} args - The postprocessing functions to apply to the result.
                         * @returns {string|string[]} The rendered template.
                         * @description
                         *      If 'd' is a string, it's a command. The available commands are:
                         *      - 'raw' - returns the original template with placeholders
                         *      - 'demo' - renders the template with the handshake data
                         *      - 'handshake' - returns a copy of the handshake data
                         *      - 'placeholders' - returns the placeholders as a comma separated string
                         *      If 'd' is an object, it's the data to render with. If it's an array, it's an array of objects to render with.
                         *      The function returns the rendered template.
                         *      If 'args' are provided, they are applied to the result in order.
                         */
                        function success ( d={}, dependencies={}, ...args ) {
                                        const endData = [];
                                        const memory = {};
                                        let topLevelType = _defineDataType ( d );
                                        let deps = { ...buildDependencies, ...dependencies }
                                        d = walk ({data:d})  // Creates copy of data to avoid mutation of the original
                       
                                        if ( topLevelType === 'null' )   return cuts.join ( '' )
                                        // Commands : raw, demo, handshake, placeholders
                                        if ( typeof d === 'string' ) {   // 'd' is a string when we want to debug the template
                                                   switch ( d ) {
                                                        case 'raw':
                                                                return cuts.join ( '' )   // Original template with placeholders
                                                        case 'demo':
                                                                if ( !handshake ) return `Error: No handshake data.`
                                                                d = handshake   // Render with handshake object
                                                                topLevelType = _defineDataType ( d )
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
                                        
                                        // Handle null data case - just return the template without placeholders
                                        if ( topLevelType === 'null' )   return cuts.join ( '' )
                      
                                        d.forEach ( dElement => {
                                        placeholders.forEach ( holder => {   // Placeholders
                                                        const 
                                                             { index, data, action } = holder   // index - placeholder index, data - key of data, action - list of operations
                                                           , dataOnly = !action && data
                                                           , mem = structuredClone ( memory )
                                                           , extendArguments = { dependencies: deps, memory:mem }
                                                           ;                                                           

                                                        if ( dataOnly ) {
                                                                        const 
                                                                             info = dElement[data]
                                                                           , type = _defineDataType ( info )
                                                                           ;
                                                                        switch ( type ) {
                                                                                case 'function' : 
                                                                                        cuts[index] = info ()
                                                                                        return
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
                                                        else {   // Data and Actions or only Actions
                                                                        let 
                                                                             { dataDeepLevel, nestedData } = (data==='@all' || data===null || data==='@root' ) ? _defineData ( dElement, action ) : _defineData ( dElement[data], action )
                                                                           , actSetup = _actionSupply ( _setupActions ( action, dataDeepLevel ), dataDeepLevel )
                                                                           ;

                                                                        for ( let step of actSetup ) {
                                                                                        let 
                                                                                                  { type, name, level } = step
                                                                                                , levelData = nestedData[level] || []
                                                                                                ;

                                                                                        levelData.forEach ( theData => {
                                                                                        let dataType = _defineDataType ( theData )
                                                                                        
                                                                                        
                                                                                        switch ( type ) {   // Action type 'route','data', 'render', or mix -> different operations
                                                                                                case 'route':
                                                                                                        switch ( dataType ) {
                                                                                                                        case 'array': 
                                                                                                                                theData.forEach ( (d,i) => {
                                                                                                                                                if ( d == null ) return
                                                                                                                                                const dType = _defineDataType ( d )
                                                                                                                                                const routeName = helpers[name]( {data:d, ...extendArguments});
                                                                                                                                                if ( routeName == null )  return
                                                                                                                                                if ( dType === 'object' ) theData[i]['text'] = render ( d, routeName, helpers, deps )
                                                                                                                                                else                      theData[i]         = render ( d, routeName, helpers, deps )
                                                                                                                                        })
                                                                                                                                break
                                                                                                                        case 'object':
                                                                                                                                theData['text'] = render ( theData, name, helpers, deps )
                                                                                                                                break
                                                                                                                }
                                                                                                        break      
                                                                                                case 'save' :
                                                                                                        memory[name] = structuredClone ( theData )
                                                                                                        break  
                                                                                                case 'overwrite':
                                                                                                        dElement = structuredClone ( theData )
                                                                                                        break
                                                                                                case 'data': 
                                                                                                        switch ( dataType ) {
                                                                                                                case 'array':
                                                                                                                        theData.forEach ( (d,i) => theData[i] = ( d instanceof Function ) ? helpers[name]({ data:d(), ...extendArguments }) : helpers[name]( {data:d, ...extendArguments} ) )
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        nestedData[level] = [helpers[name]( {data:theData,...extendArguments} )]
                                                                                                                        break
                                                                                                                case 'function':
                                                                                                                        nestedData[level] = [helpers[name]( {data:theData(),...extendArguments} )]
                                                                                                                        break
                                                                                                                case 'primitive':
                                                                                                                        nestedData[level] = helpers[name]( {data:theData,...extendArguments} )
                                                                                                                        break
                                                                                                                } // switch dataType
                                                                                                        
                                                                                                        break
                                                                                                case 'render':
                                                                                                        const isRenderFunction = typeof helpers[name] === 'function';   // Render could be a function and template.
                                                                                                        switch ( dataType ) {
                                                                                                                case 'array':
                                                                                                                        if ( isRenderFunction  )  theData.forEach ( (d,i) => {
                                                                                                                                                                if ( d == null ) return
                                                                                                                                                                const dType = _defineDataType ( d );
                                                                                                                                                                const text = helpers[name]( {data:d, ...extendArguments} );
                                                                                                                                                             
                                                                                                                                                                if ( text == null ) theData[i] = null
                                                                                                                                                                if ( dType === 'object' )  d['text'] = text
                                                                                                                                                                else                      theData[i] = text 
                                                                                                                                                        }) 
                                                                                                                        else                      theData.forEach ( (d,i) => {
                                                                                                                                                                if ( d == null ) return
                                                                                                                                                                const 
                                                                                                                                                                          dType = _defineDataType ( d )
                                                                                                                                                                        , text = render ( d, name, helpers, deps )
                                                                                                                                                                        ;
                                                                                                                                                                if ( text == null       )   theData[i] = null
                                                                                                                                                                else if ( dType === 'object' )   d['text']  = text
                                                                                                                                                                else                             theData[i] = text
                                                                                                                                                        })
                                                                                                                        break     
                                                                                                                case 'function':
                                                                                                                        nestedData[level] = helpers[name]( {data:theData(), ...extendArguments} ) 
                                                                                                                        break                                                                                                   
                                                                                                                case 'primitive':
                                                                                                                        nestedData[level] = render ( theData, name, helpers, deps )
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        if ( isRenderFunction ) nestedData[level][0]['text'] = helpers[name]({ data:theData, ...extendArguments} )
                                                                                                                        else {
                                                                                                                             theData [ 'text' ] = render ( theData, name, helpers, deps )
                                                                                                                           }
                                                                                                                        break
                                                                                                                } // switch renderDataType 
                                                                                                        break;
                                                                                                case 'extendedRender':
                                                                                                        // TODO: Test extendedRender
                                                                                                        const isValid = typeof helpers[name] === 'function';   // Render could be a function and template.
                                                                                                        if ( isValid ) {
                                                                                                                        nestedData[0].forEach ( (d,i) =>  nestedData[0][i] = helpers[name]( {data:d, ...extendArguments} )   ) 
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
                                                                                                                                        theData.forEach ( (x,i) => {
                                                                                                                                                                if ( i > 0 ) {
                                                                                                                                                                        let xType = _defineDataType ( x );
                                                                                                                                                                        if ( x == null )   return
                                                                                                                                                                        if ( xType === 'object' )   theData[0] += `${x.text}`
                                                                                                                                                                        else                        theData[0] += `${x}`
                                                                                                                                                                        theData.toSpliced(i,1)
                                                                                                                                                                   }
                                                                                                                                                                else {
                                                                                                                                                                        let xxType = _defineDataType ( x );
                                                                                                                                                                        theData[0] = ''
                                                                                                                                                                        if ( xxType === null )   return
                                                                                                                                                                        else if ( xxType === 'object' )   theData[0] = `${x.text}`
                                                                                                                                                                        else                              theData[0] = `${x}`
                                                                                                                                                                   }
                                                                                                                                                        })
                                                                                                                                        theData.length = 1
                                                                                                                                        break
                                                                                                                        } // switch dataType
                                                                                                            } // if name === ''
                                                                                                        else {              
                                                                                                                let 
                                                                                                                     val = helpers[name]({ data:theData, ...extendArguments })
                                                                                                                   , valType = _defineDataType ( val )
                                                                                                                   ;
                                                                                                                
                                                                                                                   theData.forEach ( ( x, i ) => theData.splice ( i, 1)   )
                                                                                                                   theData.length = 0
                                                                                                                switch ( valType ) {
                                                                                                                        case 'primitive':
                                                                                                                                theData[0] = val                                                                                                                                
                                                                                                                                break
                                                                                                                        case 'array':
                                                                                                                                theData.push ( ...val )
                                                                                                                                break
                                                                                                                } // switch valType
                                                                                                            }
                                                                                                        break
                                                                                                default:
                                                                                                        break
                                                                                                }
                                                                                        }) // levelData
                                                                                } // for step of actSetup

                                                                                if ( nestedData instanceof Array && 
                                                                                     nestedData.length === 1 &&
                                                                                     nestedData[0] instanceof Array
                                                                                                )   nestedData = nestedData[0]
                                                                                if ( nestedData[0] == null )   return

                                                                                let 
                                                                                      accType = _defineDataType ( nestedData[0] )
                                                                                    , fineData = nestedData[0]
                                                                                    ;

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
                                                                                                        const aType = _defineDataType ( fineData[0] )
                                                                                                        if ( aType === 'object' )   cuts[index] = fineData.map ( x => x.text ).join ( '')
                                                                                                        else                        cuts[index] = fineData.join ( '' )
                                                                                                        break
                                                                                        } // switch accType
                                                                } // else other                
                                                }) // forEach placeholders                                        
                                        endData.push ( cuts.join ( '' ))
                                        }) // forEach d

                                        if ( topLevelType === 'array' )  return endData
                                        // Execute postprocess functions
                                        if (args)   return args.reduce ( (acc, fn) => {
                                                                                if ( typeof fn !== 'function' )  return acc
                                                                                return fn ( acc, deps )
                                                                        }, endData.join ( '' )  )
                                        else        return endData.join ( '' )

                                } // success func.
                        return extra ? [ true, success ] : success
                }
} // build func.



export default build



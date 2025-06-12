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
 * @param {boolean} [extra] - Optional. How to receive the answer - false:as a string(answer) or true: as tuple[success, answer];
 * @param {object} [buildDependencies] - Optional. External dependencies injected;
 * @returns {function|tupleResult} - rendering function
 */
function build  ( tpl, extra=false, buildDependencies={} ) {
        let { hasError, placeholders, chop, helpers, handshake, snippets } = _readTemplate ( tpl );
        
        if ( hasError ) {
                        function fail () { return hasError }
                        return extra ? [ false, fail ] : fail
                }
        else {  // If NO Error:
                        let cuts = structuredClone ( chop );
                        // *** Template recognition complete. Start building the rendering function -->
                        /**
                         * Processes template rendering commands with provided data, dependencies, and optional post-processing functions.
                         *
                         * @function success
                         * @typedef { 'render' | 'debug' | 'snippets' } Command
                         * @param {Command} [command='render'] - The command to execute. Supported commands: 'render', 'debug', 'snippets', or 'snippets:<names>'.
                         * @param {Object|string} [d={}] - The data object to render, or a string instruction ('raw', 'demo', 'handshake', 'placeholders').
                         * @param {Object} [dependencies={}] - Additional dependencies to be merged with internal dependencies.
                         * @param {...any} args - Optional post-processing functions to apply to the rendered output.
                         * @returns {string|Array[]} The rendered template, snippets, or data depending on the command and input.
                         *
                         * @throws {Error} If an unsupported command or instruction is provided.
                         *
                         * @example
                         * // Render a template with data
                         * success('render', { name: 'Alice' }, { helperFn });
                         *
                         * @example
                         * // Get raw template
                         * success('debug', 'raw');
                         *
                         * @example
                         * // Render only specific snippets
                         * success('snippets:header,footer', { ... });
                         */
                        function success ( command='render', d={}, dependencies={}, ...args ) {
                                        let onlySnippets = false;
                                        if ( ![ 'render', 'debug', 'snippets'].includes ( command )  && !command.startsWith('snippets') )   return `Error: Wrong command "${command}". Available commands: render, debug, snippets.`

                                        if ( command.startsWith ( 'snippets') && command.includes ( ':' ) ) {
                                                        onlySnippets = true
                                                        let snippetNames = command.split ( ':' )
                                                                                  .slice ( 1 )[0]
                                                                                  .trim()
                                                                                  .split ( ',' )
                                                                                  .map ( t => t.trim() )
                                                        placeholders = snippetNames.map ( item => snippets [ item ])
                                                }
                                        else if ( command === 'snippets' ) {
                                                        onlySnippets = true
                                                }

                                        if ( typeof d === 'string' ) {
                                                        switch ( d ) {
                                                                case 'raw':
                                                                        return cuts.join ( '' )   // Original template with placeholders
                                                                case 'demo':
                                                                        if ( !handshake ) return `Error: No handshake data.`
                                                                        d = handshake   // Render with handshake object
                                                                        break
                                                                case 'handshake':
                                                                        if ( !handshake ) return `Error: No handshake data.`
                                                                        return structuredClone (handshake)   // return a copy of handshake object
                                                                case 'placeholders':
                                                                        return placeholders.map ( h => cuts[h.index] ).join ( ', ')
                                                                default:
                                                                        return `Error: Wrong instruction "${d}". Available instructions: raw, demo, handshake, placeholders.`
                                                        }
                                                } // if d is string
                                        
                                        const endData = [];
                                        const memory = {};

                                        let topLevelType = _defineDataType ( d );
                                        let deps = { ...buildDependencies, ...dependencies }
                                        d = walk ({data:d})  // Creates copy of data to avoid mutation of the original
                                        if ( topLevelType === 'null' )   return cuts.join ( '' )
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
                                                        let info = dElement;
                                                           

                                                        if ( data && data.includes('/') ) {
                                                                        if ( info.hasOwnProperty ( data )) {  
                                                                                info = info[data]
                                                                           }
                                                                        else {
                                                                                data.split('/').forEach ( d => {
                                                                                        if ( info.hasOwnProperty(d) )   info = info[d]
                                                                                        else info = []
                                                                                })
                                                                           }
                                                            } // If data contains '/'
                                                        else if ( data==='@all' || data===null || data==='@root' )   info = dElement
                                                        else if ( data )   info = info[data]

                                                        
                                                        
                                                        if ( dataOnly ) {
                                                                        const type = _defineDataType ( info );                                                                           
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
                                                                             { dataDeepLevel, nestedData } = _defineData ( info, action )
                                                                           , actSetup = _actionSupply ( _setupActions ( action, dataDeepLevel ), dataDeepLevel )
                                                                           ;

                                                                        for ( let step of actSetup ) {
                                                                                        let 
                                                                                                  { type, name, level } = step
                                                                                                , levelData = nestedData[level] || []
                                                                                                ;

                                                                                        levelData.forEach ( (theData, iData ) => {
                                                                                        
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
                                                                                                                                                                const text = helpers[name]( {data:d, ...extendArguments });
                                                                                                                                                             
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
                                                                                                                        if ( isRenderFunction ) nestedData[level] = helpers[name]({ data:theData, ...extendArguments} )
                                                                                                                        else                    nestedData[level] = render ( theData, name, helpers, deps )
                                                                                                                        break
                                                                                                                case 'object':
                                                                                                                        if ( isRenderFunction ) nestedData[level][iData]['text'] = helpers[name]({ data:theData, ...extendArguments} )
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
                                                
                                                if ( onlySnippets )  endData.push ( placeholders.map ( x => cuts[x.index] ).join ( '<~>' ) )
                                                else                 endData.push ( cuts.join ( '' ))
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



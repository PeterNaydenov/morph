import _defineDataType from "./_defineType.js"
import walk from '@peter.naydenov/walk'



/**
 * Action 'mix' ('[]'). Merges the level data into a single value.
 *
 * Anonymous mix ('[]', no helper name):
 *   - array  : joins all items (or their 'text' property) into one string;
 *   - object : publishes the 'text' results to the upper data levels,
 *              matching values by their breadcrumb keys.
 *
 * Named mix ('[]helperName'): the helper receives the data and produces
 * the merged value itself.
 *
 * @param {object} step - Action step: { name } is the helper name ('' for anonymous mix)
 * @param {any} theData - Current data item from the level slice
 * @param {object} context - Execution context (see executeActions.js)
 */
function actionMix ({ name }, theData, { helpers, extendArguments, nestedData, level, useHelper }) {

    if ( name === '' ) {   // Anonymous mixing action
            switch ( _defineDataType ( theData )) {
                case 'object': {
                        const hasBreadcrumbKeys = Object.keys ( theData ).some ( k => k.includes ( '/' ))
                        if ( hasBreadcrumbKeys )   Object.entries ( theData ).forEach ( ([ k, v ]) => nestedData[level][k] = v['text'] )
                        else                       nestedData[level] = theData['text']

                        // Publish up: replace matching breadcrumb values on every level above
                        const check = ({ value, breadcrumbs }) => nestedData[level][breadcrumbs]  ?  nestedData[level][breadcrumbs]  :  value
                        for ( let i = level - 1; i >= 0; i-- ) {
                                nestedData[i] = walk ({ data: nestedData[i], objectCallback: check })
                            }
                        break
                    }
                case 'array': {
                        const asText = ( x ) => ( _defineDataType ( x ) === 'object' )  ?  `${x.text}`  :  `${x}`
                        theData[0] = theData.map ( x => ( x == null ) ? '' : asText ( x )).join ( '' )
                        theData.length = 1
                        break
                    }
                } // switch dataType
        }
    else {   // Named mixing action - the helper produces the merged value
            const val = helpers[name] ({ data: theData, ...extendArguments, full: theData, useHelper: useHelper ( theData ) })

            theData.length = 0
            switch ( _defineDataType ( val )) {
                case 'primitive':
                        theData[0] = val
                        break
                case 'array':
                        theData.push ( ...val )
                        break
                } // switch valType
        }
} // actionMix func.



export default actionMix



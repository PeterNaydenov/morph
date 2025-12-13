
import _renderHolder from './_renderHolder.js'



/**
 * Renders a helper or template with the provided data and context.
 *
 * @param {any} theData - The data to process.
 * @param {string} name - The name of the helper or template to render.
 * @param {object} helpers - Dictionary of available helpers.
 * @param {any} original - The full original data context.
 * @param {object} dependencies - injected dependencies.
 * @param {...any} args - Additional arguments.
 * 
 * @returns {any} The result of the rendering process.
 */
function render ( theData, name, helpers, original, dependencies, ...args) {
                const useHelper = ( targetName, targetData ) => render ( targetData || theData, targetName, helpers, original, dependencies, ...args )
                if (!helpers[name]) return `( Error: Helper '${name}' is not available )`

                const isRenderFunction = typeof helpers[name] === 'function';

                if ( isRenderFunction )   return helpers[name]({ data: theData, dependencies, full: original, useHelper }, ...args)
                else {
                        let dataForHolder = theData
                        if ( typeof theData !== 'object' || theData === null )   dataForHolder = { text: theData }
                        return _renderHolder ( helpers[name], dataForHolder )
                }
        }  // render func.



export default render

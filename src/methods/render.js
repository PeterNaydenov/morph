import _renderHolder from "./_renderHolder.js"



/**
 * 
 *  Execute rendering and return the results
 * 
 * @param {object|string} theData - Data to be rendered. If it's a string, it's the value of 'text' property.
 * @param {string} name - Name of the render to be executed.
 * @param {object} helpers - Object with helper functions or templates.
 * @param {...any} args - Extra arguments to be passed to the render function.
 * 
 * @returns {string} - Rendered string.
 */
function render ( theData, name, helpers, ...args ) {
// *** Executes rendering and return the results
                if ( theData instanceof Object ) {   // Make sure all properties are not objects
                        Object.entries ( theData ).forEach ( ([key, value]) => {
                                        if ( value instanceof Object   ) theData[key] = value['text']
                                        if ( value instanceof Array    ) theData[key] = value[0]
                                })
                    }
                function setRenderData ( d={} ) {
                                if ( typeof d === 'string' )  return { text: d }
                                else return d
                        } // setRenderData func.
                const isRenderFunction = typeof helpers[name] === 'function';   // Render could be a function or template.
                theData = setRenderData ( theData )
                if ( isRenderFunction )  return helpers[name]( theData, ...args )
                else                     return _renderHolder ( helpers[name], theData   )
        }  // render func.



export default render



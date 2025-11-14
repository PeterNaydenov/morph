import _renderHolder from "./_renderHolder.js"



/**
 * Executes rendering and returns the rendered result.
 * 
 * Handles both function-based and template-based rendering. Normalizes data objects
 * by converting nested objects to their 'text' properties and arrays to their first elements.
 * 
 * @param {object|string} theData - Data to be rendered. If string, becomes the 'text' property value.
 * @param {string} name - Name of the render helper/template to execute
 * @param {object} helpers - Object containing helper functions and templates
 * @param {object} original - Original data context for full data access
 * @param {object} dependencies - External dependencies available to helpers
 * @param {...any} args - Additional arguments passed to the render function
 * 
 * @returns {string} Rendered string result
 * 
 * @example
 * // Render with function helper
 * const result = render(data, 'myHelper', helpers, originalData, deps);
 * 
 * @example
 * // Render with template
 * const result = render(data, 'myTemplate', helpers, originalData, deps);
 */
function render ( theData, name, helpers, original, dependencies, ...args ) {
// *** Executes rendering and return the results
                if ( theData instanceof Object ) {   // Make sure all properties are not objects
                        Object.entries ( theData ).forEach ( ([key, value]) => {
                                        if ( value instanceof Object   ) theData[key] = value['text']
                                        if ( value instanceof Array    ) theData[key] = value[0]
                                })
                    }
                /**
 * Normalizes render data by wrapping strings in text objects.
 * 
 * @param {any} d - Data to normalize
 * @returns {object} Returns { text: d } if d is string, otherwise returns d unchanged
 */
function setRenderData ( d={} ) {
                                if ( typeof d === 'string' )  return { text: d }
                                else return d
                        } // setRenderData func.
                const isRenderFunction = typeof helpers[name] === 'function';   // Render could be a function or template.
                theData = setRenderData ( theData )
                
                if ( isRenderFunction )  return helpers[name]( { theData, dependencies, full:original},  ...args )
                else                     return _renderHolder ( helpers[name], theData   )
        }  // render func.



export default render



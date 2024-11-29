import _renderHolder from "./_renderHolder.js"



function render ( theData, name, helpers ) {
// *** Executes rendering and return the results 
                function setRenderData ( d={} ) {
                                if ( typeof d === 'string' )  return { text: d }
                                else return d
                        } // setRenderData func.
                const isRenderFunction = typeof helpers[name] === 'function';   // Render could be a function or template.
                theData = setRenderData ( theData )
                if ( isRenderFunction )  return helpers[name]( theData )
                else                     return _renderHolder ( helpers[name], theData   )
        }  // render func.



export default render



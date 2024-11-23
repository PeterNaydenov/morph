import _defineDataType from "./_defineType.js"
import _renderHolder from "./_renderHolder.js"



function render ( theData, name, helpers ) {
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
    }  // render func.



export default render



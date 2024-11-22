import _chopTemplate from './_chopTemplates.js'
import settings from './settings.js'



function _renderHolder ( template, data ) {
    // Data should be an object. No array, no string.
    if ( data == null )   return null    
    const
          chop = _chopTemplate (settings)( template )
        , set  = settings
        ;
    chop.forEach ( (item,i) => {
                            const isPlaceholder = item.includes ( set.TG_PRX )
                            if ( isPlaceholder ) {
                                            const field = item.replace ( set.TG_PRX, '' ).replace ( set.TG_SFX, '' ).trim();
                                            if ( data[field] )  chop[i] = data[field]
                                    } // if isPlaceholder
                    }) // forEach chop
    return chop.join ( '' )
} // _renderHolder func.


export default _renderHolder



function _chopTemplate ( settings ) {
    return function _chopTemplate ( text ) {
        const { TG_PRX, TG_SFX, TG_SIZE_P, TG_SIZE_S } = settings;
        let 
            start      // placeholder start
          , end        // placeholder end
          , checkPoint // check 
          , res = []   // template result array
          ;
    
        if ( typeof(text) != 'string' ) return showError( 'notAString' ) // Template is not a string
        if ( text.length == 0 ) return []
    
        start = text.indexOf ( TG_PRX )
        if ( 0 < start )  res.push ( text.slice(0, start) )
        if ( -1 == start ) {
                    res.push( text  )
                    return res;
             }
        else {
                    checkPoint = text.indexOf ( TG_PRX, start+TG_SIZE_P )
                    end = text.indexOf( TG_SFX )
    
                    if ( end == -1   ) return showError('missingClosing') // Placeholder with missing closing tags
                    if ( end < start ) return showError('closedBeforeOpened') // Placeholder closing tags without starting ones
                    else               end += TG_SIZE_S 
    
                    if ( checkPoint != -1 && checkPoint < end ) {
                         return showError('newBeforeClosed') // New placeholder before first ends
                       }
    
                    res.push( text.slice(start,end) )
                    let nextText = text.slice (end)
                    let additional = _chopTemplate ( nextText )
                    return res.concat ( additional )
             }
    }} // chopTemplate func.
    
    
    
    function showError (type) {
            switch (type) {
                  case 'notAString': 
                            return `Error: Template is not a string.`
                  case 'missingClosing':
                            return `Error: Placeholder with missing closing tag.`
                  case 'closedBeforeOpened':
                            return `Error: Placeholder closing tag without starting one.`
                  case 'newBeforeClosed':
                            return `Error: Nested placeholders. Close placeholder before open new one.`
                  default: 
                            return `Error: Unknown template error.`
                }
    } // showError func.
    
    
    
    export default _chopTemplate
    
    
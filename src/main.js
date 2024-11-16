

import walk from "@peter.naydenov/walk"
import build from "./methods/build.js"

console.log ( build )

const
    defaultSettings = {
            TG_PRX: '{{'
          , TG_SFX: '}}'
          , TG_SIZE_P: 2
          , TG_SIZE_S: 2
        }
    // , render = renderSetup ( walk )
    ;

const morphAPI = {
                //  Engine API
                /**
                 *  
                 *  build - 
                 *  add - register a component to component storage
                 *  get - get a component from component storage
                 *  list - list all components in component storage
                 *  clear - clear all templates in component storage
                 *  remove - remove a template from component storage
                 *  
                 *  shine - extra step to remove all non used placeholders and <rs> tags
                 * 
                 */
                build   // build a component from template description
} // morphAPI



export default morphAPI



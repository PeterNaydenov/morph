/**
 * Template engine configuration settings.
 * 
 * Defines the delimiters and sizes used for template placeholder parsing.
 * 
 * @type {Object}
 * @property {string} TG_PRX - Opening tag prefix for placeholders ('{{')
 * @property {string} TG_SFX - Closing tag suffix for placeholders ('}}')
 * @property {number} TG_SIZE_P - Length of opening tag prefix (2)
 * @property {number} TG_SIZE_S - Length of closing tag suffix (2)
 */
export default {
    TG_PRX: '{{'
  , TG_SFX: '}}'
  , TG_SIZE_P: 2
  , TG_SIZE_S: 2
}
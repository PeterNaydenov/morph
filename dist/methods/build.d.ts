export default build;
export type Template = {
    /**
     * - Data to be rendered;
     */
    template: string;
    /**
     * - Optional. Object with helper functions or simple templates for this template;
     */
    helpers?: object;
    /**
     * - Optional. Example for data to be rendered with;
     */
    handshake?: object;
};
export type tupleResult = any[];
/**
 * @typedef {Object} Template
 * @property {string} template - Data to be rendered;
 * @property {object} [helpers] - Optional. Object with helper functions or simple templates for this template;
 * @property {object} [handshake] - Optional. Example for data to be rendered with;
 */
/**
 * @typedef {Array}  tupleResult
 * @property {boolean} 0 - Indicates success (true) or failure (false).
 * @property {function} 1 - The rendering function or an error function.
 */
/**
 *
 * @param {Template} tpl - template definition;
 * @param {boolean} [extra] - Optional. How to receive the answer - false:as a string(answer) or true: as tuple[success, answer];
 * @param {object} [buildDependencies] - Optional. External dependencies injected;
 * @returns {function|tupleResult} - rendering function
 */
declare function build(tpl: Template, extra?: boolean, buildDependencies?: object): Function | tupleResult;

export default build;
export type UseHelperFn = (name: string, data?: any) => any;
export type HelperFn = (args: {
    data: any;
    dependencies: object;
    full?: any;
    useHelper?: UseHelperFn;
    memory?: object;
}) => any;
export type Template = {
    /**
     * - Data to be rendered;
     */
    template: string;
    /**
     * - Optional. Object with helper functions or simple templates for this template;
     */
    helpers?: {
        [x: string]: string | HelperFn;
    };
    /**
     * - Optional. Example for data to be rendered with;
     */
    handshake?: object;
};
export type tupleResult = any[];
/**
 * @callback UseHelperFn
 * @param {string} name - Name of the helper to call.
 * @param {any} [data] - Optional data override.
 * @returns {any} Result of the helper call.
 */
/**
 * @callback HelperFn
 * @param {object} args
 * @param {any} args.data - The data context.
 * @param {object} args.dependencies - Injected dependencies.
 * @param {any} [args.full] - Full data context.
 * @param {UseHelperFn} [args.useHelper] - Function to call other helpers.
 * @param {object} [args.memory] - internal memory state.
 * @returns {any} Rendered output.
 */
/**
 * @typedef {Object} Template
 * @property {string} template - Data to be rendered;
 * @property {Object.<string, HelperFn|string>} [helpers] - Optional. Object with helper functions or simple templates for this template;
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

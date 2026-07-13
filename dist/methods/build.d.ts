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
    helpers?: Record<string, string | HelperFn>;
    /**
     * - Optional. Example for data to be rendered with;
     */
    handshake?: object;
    /**
     * - Optional. HTML-escape the output of data-only placeholders. Mark single placeholders with action 'raw' to opt out;
     */
    escape?: boolean;
};
export type tupleResult = Array;
/**
 *
 * @param {Template} tpl - template definition;
 * @param {boolean} [extra] - Optional. How to receive the answer - false:as a string(answer) or true: as tuple[success, answer];
 * @param {object} [buildDependencies] - Optional. External dependencies injected;
 * @returns {function|tupleResult} - rendering function
 */
declare function build(tpl: Template, extra?: boolean, buildDependencies?: object): Function | tupleResult;
export default build;

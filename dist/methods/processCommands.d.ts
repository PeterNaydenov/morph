/**
 * Factory for the template command handlers ('debug', 'set', 'snippets').
 * Receives its dependencies through the dependency object - this module
 * performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps.escapeHelper - Built-in 'escape' helper (listed by debug instruction 'helpers')
 * @returns {{ handleDebug: Function, handleSet: Function, handleSnippets: Function }}
 */
declare function processCommandsFactory({ escapeHelper }: {
    escapeHelper: Function;
}): {
    handleDebug: Function;
    handleSet: Function;
    handleSnippets: Function;
};
export default processCommandsFactory;

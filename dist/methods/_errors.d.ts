/**
 * The single source of the missing-helper error format. Placed as a
 * placeholder's value whenever an action or useHelper() references a
 * helper that is not defined - errors stay values, renders never throw.
 *
 * @param {string} name - Name of the unavailable helper
 * @returns {string} The error string to render
 */
declare function missingHelper(name: string): string;
export { missingHelper };

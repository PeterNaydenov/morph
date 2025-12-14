export default render;
/**
 * Renders a helper or template with the provided data and context.
 *
 * @param {any} theData - The data to process.
 * @param {string} name - The name of the helper or template to render.
 * @param {object} helpers - Dictionary of available helpers.
 * @param {any} original - The full original data context.
 * @param {object} dependencies - injected dependencies.
 * @param {...any} args - Additional arguments.
 *
 * @returns {any} The result of the rendering process, or an error string if the helper is not available.
 */
declare function render(theData: any, name: string, helpers: object, original: any, dependencies: object, ...args: any[]): any;

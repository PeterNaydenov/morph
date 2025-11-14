export default render;
/**
 * Executes rendering and returns the rendered result.
 *
 * Handles both function-based and template-based rendering. Normalizes data objects
 * by converting nested objects to their 'text' properties and arrays to their first elements.
 *
 * @param {object|string} theData - Data to be rendered. If string, becomes the 'text' property value.
 * @param {string} name - Name of the render helper/template to execute
 * @param {object} helpers - Object containing helper functions and templates
 * @param {object} original - Original data context for full data access
 * @param {object} dependencies - External dependencies available to helpers
 * @param {...any} args - Additional arguments passed to the render function
 *
 * @returns {string} Rendered string result
 *
 * @example
 * // Render with function helper
 * const result = render(data, 'myHelper', helpers, originalData, deps);
 *
 * @example
 * // Render with template
 * const result = render(data, 'myTemplate', helpers, originalData, deps);
 */
declare function render(theData: object | string, name: string, helpers: object, original: object, dependencies: object, ...args: any[]): string;

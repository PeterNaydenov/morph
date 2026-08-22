/***
 *   Morph (@peter.naydenov/morph)
 *
 *   Text based template engine
 *
 *
 *   History notes:
 *   - Idea was born on October 28th, 2024.
 *   - Published on GitHub for first time: November 30th, 2024
 *   - Version 1.0.0: December 28st, 2024
 *
 */
export type Template = import('./methods/build.js').Template;
export type RenderFn = import('./methods/build.js').RenderFn;
export type MorphErrorFn = (() => string) & {
    isError: true;
};
/**
 * @typedef {import('./methods/build.js').Template} Template
 * @typedef {import('./methods/build.js').RenderFn} RenderFn
 * @typedef {(() => string) & { isError: true }} MorphErrorFn - Error function returned by get() on a miss. Callable - returns the error message; carries an `isError` marker for detection before rendering.
 */
import build from "./methods/build.js";
/**
 * Retrieves a template from storage.
 *
 * A plain string is accepted as shorthand for a template in the 'default' storage.
 *
 * @param {string|string[]} location - The location of the template. Either:
 *   - A string: the template name in the 'default' storage
 *   - An array of two elements:
 *     - First element: The name of the template
 *     - Second element (optional): The name of the storage. Defaults to 'default'
 *
 * @returns {RenderFn|MorphErrorFn} The template (render function) if found, or an error function carrying an
 *   `isError: true` marker that returns the error message when called. The marker lets callers detect a miss
 *   before rendering: `const tpl = get('x'); if (tpl.isError) ...`
 *
 * @example
 * // Get template from default storage (string shorthand)
 * const template = get('myTemplate');
 *
 * @example
 * // Get template from default storage (array form)
 * const template = get(['myTemplate']);
 *
 * @example
 * // Get template from custom storage
 * const template = get(['myTemplate', 'customStorage']);
 */
declare function get(location: string | string[]): RenderFn | MorphErrorFn;
/**
 * Adds a template to storage.
 *
 * If the template is already a function, it's added directly to storage.
 * If it's a template description object, it's built first and then added.
 * If the template is null or broken, a warning/error is logged and it's not added.
 *
 * @param {string|string[]} location - The location to add the template to. Either:
 *   - A string: the template name in the 'default' storage
 *   - An array of two elements:
 *     - First element: The name of the template
 *     - Second element (optional): The name of the storage. Defaults to 'default'
 * @param {Template|RenderFn|null} tplfn - The template description object, pre-built render function, or null
 * @param {...any} args - Additional arguments passed to the build function (only used when tplfn is a template description)
 *
 * @example
 * // Add a pre-built template function (string shorthand)
 * add('myTemplate', templateFunction);
 *
 * @example
 * // Add and build a template description
 * add(['myTemplate'], {
 *   template: 'Hello {{name}}!',
 *   helpers: { name: ({ data }) => data.name }
 * });
 */
declare function add(location: string | string[], tplfn: Template | RenderFn | null, ...args: any[]): void;
/**
 * Returns an array of template names from specified storages.
 *
 * @param {string[]} [storageNames=['default']] - Array of storage names to retrieve template names from.
 *   Defaults to ['default'] if not provided.
 *
 * @returns {string[]} Array of all template names from the specified storages.
 *
 * @example
 * // List templates from default storage
 * const templates = list();
 *
 * @example
 * // List templates from multiple storages
 * const templates = list(['default', 'customStorage']);
 */
declare function list(storageNames?: string[]): string[];
/**
 * Clears all templates from all storages.
 *
 * Deletes all custom storages and resets the 'default' storage to an empty object.
 *
 * @example
 * // Clear all templates
 * clear();
 */
declare function clear(): void;
/**
 * Removes a template from storage.
 *
 * A plain string is accepted as shorthand for a template in the 'default' storage.
 * When the target doesn't exist - wrong argument type, unknown storage or unknown
 * template - a descriptive error message is returned so the caller knows the
 * removal did not happen.
 *
 * @param {string|string[]} location - The location of the template to remove. Either:
 *   - A string: the template name in the 'default' storage
 *   - An array of two elements:
 *     - First element: The name of the template
 *     - Second element (optional): The name of the storage. Defaults to 'default'
 *
 * @returns {void|string} Nothing on successful removal, or an error message
 *   describing why nothing was removed.
 *
 * @example
 * // Remove template from default storage (string shorthand)
 * remove('myTemplate');
 *
 * @example
 * // Remove template from default storage (array form)
 * remove(['myTemplate']);
 *
 * @example
 * // Remove template from custom storage
 * remove(['myTemplate', 'customStorage']);
 */
declare function remove(location: string | string[]): void | string;
declare const morphAPI: {
    build: typeof build;
    get: typeof get;
    add: typeof add;
    list: typeof list;
    clear: typeof clear;
    remove: typeof remove;
};
export default morphAPI;

export default morphAPI;
declare namespace morphAPI {
    export { build };
    export { get };
    export { add };
    export { list };
    export { clear };
    export { remove };
}
import build from "./methods/build.js";
/**
 * Retrieves a template from storage.
 *
 * @param {string[]} location - The location of the template. Array of two elements:
 *   - First element: The name of the template
 *   - Second element (optional): The name of the storage. Defaults to 'default'
 *
 * @returns {Function} The template (render function) if found, or an error function that returns
 *   an error message if the storage or template doesn't exist.
 *
 * @example
 * // Get template from default storage
 * const template = get(['myTemplate']);
 *
 * @example
 * // Get template from custom storage
 * const template = get(['myTemplate', 'customStorage']);
 */
declare function get(location: string[]): Function;
/**
 * Adds a template to storage.
 *
 * If the template is already a function, it's added directly to storage.
 * If it's a template description object, it's built first and then added.
 * If the template is null or broken, a warning/error is logged and it's not added.
 *
 * @param {string[]} location - The location to add the template to. Array of two elements:
 *   - First element: The name of the template
 *   - Second element (optional): The name of the storage. Defaults to 'default'
 * @param {object|function|null} tplfn - The template description object, pre-built template function, or null
 * @param {...any} args - Additional arguments passed to the build function (only used when tplfn is a template description)
 *
 * @example
 * // Add a pre-built template function
 * add(['myTemplate'], templateFunction);
 *
 * @example
 * // Add and build a template description
 * add(['myTemplate'], {
 *   template: 'Hello {{name}}!',
 *   helpers: { name: (data) => data.data.name }
 * });
 */
declare function add(location: string[], tplfn: object | Function | null, ...args: any[]): void;
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
 * @param {string[]} location - The location of the template to remove. Array of two elements:
 *   - First element: The name of the template
 *   - Second element (optional): The name of the storage. Defaults to 'default'
 *
 * @returns {void|string} Returns an error message if the storage or template doesn't exist,
 *   otherwise returns undefined.
 *
 * @example
 * // Remove template from default storage
 * remove(['myTemplate']);
 *
 * @example
 * // Remove template from custom storage
 * remove(['myTemplate', 'customStorage']);
 */
declare function remove(location: string[]): void | string;

declare module '@peter.naydenov/morph' {
  /**
   * Template description object
   */
  interface TemplateDescription {
    /**
     * Template string with placeholders
     */
    template: string;
    /**
     * Optional helper functions or templates
     */
    helpers?: Record<string, any>;
    /**
     * Optional example data for rendering
     */
    handshake?: Record<string, any>;
  }

  /**
   * Build a component from template description
   */
  function build(tpl: TemplateDescription, extra?: boolean, buildDependencies?: Record<string, any>): Function;

  /**
   * Get a component from component storage
   */
  function get(location: [string, string?]): Function;

  /**
   * Add a component to component storage
   */
  function add(location: [string, string?], tplfn: Function | TemplateDescription, ...args: any[]): void;

  /**
   * List the names of all components in the component storage
   */
  function list(storageNames?: string[]): string[];

  /**
   * Clear up all the components in the storage
   */
  function clear(): void;

  /**
   * Remove a template from component storage
   */
  function remove(location: [string, string?]): void | string;

  const morphAPI: {
    build: typeof build;
    get: typeof get;
    add: typeof add;
    list: typeof list;
    clear: typeof clear;
    remove: typeof remove;
  };

  export default morphAPI;
} 
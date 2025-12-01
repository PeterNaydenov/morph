- Empty placeholders - {{}}
- Extend templates: Generate new templates from the template function by add/change helpers, provide alternative handshake data. template ('set',{ plachholders:{nameOrPosition: newPlaceholderDefinition}, helpers: { helpers}, handshake:{ new Handshake}},). Result is a new function(template), ready to receive data;
- Building templates - will not have 'fail' response, because we could build templates without having all helpers available. They can come latter.
- What if we trying to render a template that don't have a helper? - it will return error as a render result. Will explain that renderFunction isn't available;
- Routing actions will be removed. Too unconsistant with other actions. It's can be solved with normal render functions by providing a list of possible templates. It's something that is possible even now;
- Update 'tests' according new features;
- Check jsdoc and update it according code changes. Extend jsdoc where possible. Update .d.ts type definitions;
- Make a version to partial render adn return a function that can be called with more data;
- Make all data from template function debuggable;





**Input**: User description: 
"I want to have new command 'curry' that will work like render but response will be a new render function that will have for template the rendered result from previous render but handshake and helpers will still available. The idea is to simplify the partial rendering idea ahead. We will need a ('debug','count') that will return a number of still available placeholders. In case that we want to know when template is completly or partial rendered."
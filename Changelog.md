## Release History



### 3.3.0 (2025-12-13)
- [x] Use other helper from inside of helper functionsHelper functions attribute - useHelper;



### 3.2.0 (2025-12-01)
- [x] Conditional actions are depricated. ( starting with `?` ). Too unconsistant with other actions. It's can be solved with normal helper functions by providing a list of possible templates. It's something that is possible even now;
- [x] Templates can have empty placeholders - just {{ }};
- [x] Extend templates. Generate new templates from the template function by add/change helpers, provide alternative handshake data. Command 'set' will do this for you. Result is a new function(template), ready to receive data; 
- [x] Building templates - will not have 'fail' response, with reason templates has missing helpers. Now command 'set' can provide helpers latter, so will create the template function without warning. On rendering with missing helper - will return an error as a render result;
- [x] New debug instruction: 'helpers' to return a string of helper names separated by commas;
- [x] New debug instruction: 'count' to return number of unresolved placeholders;
- [x] New command: 'curry' for partial rendering, returning a new render function with rendered output as template;
- [x] Updated JSDoc and TypeScript declarations for new commands.



### 3.1.5 (2025-11-14)
- [x] Types improvements;



### 3.1.4 (2025-10-13)
- [x] Dependencies update. Dev deps update. @peter.naydenov/walk - v.5.0.2;



### 3.1.3 (2025-08-19)
- [x] Some minor fixes and cleanups;



### 3.1.2 (2025-08-19)
- [x] Fix: Argument 'full' contains wrong data;



### 3.1.1 (2025-08-19)
- [x] Fix: Build was not updated;
- [ ] Bug: Argument 'full' contains wrong data;



### 3.1.0 (2025-08-19)
- [x] Helper named argument 'full'. Gives access to full template data. Use it create mixed conditions among many different parameters, not only the iteration data;
- [ ] Bug: Build was not updated;
- [ ] Bug: Argument 'full' contains wrong data;


### 3.0.1 ( 2025-06-14)
- [x] Fix: Bad full render after call of snippets;



### 3.0.0 ( 2025-06-12)
- [x] Render selected snippets;
- [x] Commands and instructions terms;
- [x] Bug: Bad full render after call of snippets;



### 2.2.0 ( 2025-06-06)
- [x] New: Source property can contains a symbol '/';



### 2.1.3 ( 2025-04-12 )
- [x] Fix: Wrong set of arguments for helper functions when data is a primitive value;



### 2.1.2 ( 2025-04-12 )
- [x] Fix: Helper templates should ignore value 'null' and 'undefined';
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;


### 2.1.1 ( 2025-04-11 )
- [x] Fix: Value '0' is not rendered in helper templates;
- [ ] Bug: Helper templates should ignore value 'null' and 'undefined';
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;


### 2.1.0 (2025-04-01)
- [x] Feature: Access a deep property as a breadcrumbs;
- [ ] Bug: Value '0' is not rendered in helper templates;
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;



### 2.0.1 (2025-03-25)
- [x] Fix: Deep data render index;
- [ ] Bug: Value '0' is not rendered in helper templates;
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;



### 2.0.0 (2025-03-25)
- [x] Memory action intoduced - memory is available in data functions;
- [x] Change in arguments format for helper functions;
- [x] Overwrite action introduced - when change in data should be available for all placeholders;
- [ ] Bug: Fix: Deep data render index;
- [ ] Bug: Value '0' is not rendered in helper templates;
- [ ] Bug: Wrong set of arguments for helper functions when data is a primitive value;


### 1.2.3 (2025-03-17)
- [x] Refactoring: Extended render;



### 1.2.2 (2025-03-17)
- [x] Improvment: Optimized code to improve performance;



### 1.2.1 (2025-03-16)
- [x]Enhanced Error Handling in setupActions.js: Improved the error message to provide more context about the missing level markers, making it easier to debug;
- [x] Added TypeScript Type Definitions: Created a types directory with an index.d.ts file containing TypeScript definitions for the library, and added the "types" field to package.json for better TypeScript support;



### 1.2.0 (2025-03-14)
- [x] Fix: Deeply nested data;
- [x] Improvement: Error message if actions do not have deepness of the data (very difficult to debug);



### 1.1.3 (2025-01-23)
- [x] Improve: Error messages when using method "add" with template -> null;



### 1.1.2 ( 2025-01-20 )
- [x] Improve: Error messages when using method "set" with string;



### 1.1.0 ( 2025-01-19 )
- [x] Ignore html comment sections in templates;



### 1.0.3 (2025-01-10)
- [x] Fix: Action should receive dependencies when data is a function;



### 1.0.2 (2025-01-09)
- [x] Fix: Render nested components;
- [x] Refactoring: Placeholder with actions when data is a function;
- [ ] Bug: Action should receive dependencies when data is a function;



### 1.0.1 (2025-01-08)
- [x] Fix: Render functions are not receiving dependencies;
- [ ] Bug: Render nested components;



### 1.0.0 (2024-12-28)
- [x] Change of addressing templates and stores;
- [ ] Bug: Render functions are not receiving dependencies;
- [ ] Bug: Render nested components;



### 0.0.4 (2017-12-24)
- [x] Dependency update. @peter.naydenov/walk 5.0.1;



### 0.0.3 (2017-12-02)
- [x] Fix: Breaks on missing helper;



### 0.0.2 (2017-11-30)
- [x] Fix: Storage is not working;
- [ ] Bug: Breaks on missing helper;



### 0.0.1 (2017-11-30)
 - [x] Initial code;
 - [x] Test package;
 - [x] Documentation;
 - [ ] Bug: Storage is not working;
 - [ ] Bug: Breaks on missing helper;
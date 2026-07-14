<img src="morph.png" alt="morph header image">

# Morph (@peter.naydenov/morph)

![version](https://img.shields.io/github/package-json/v/PeterNaydenov/morph)
![license](https://img.shields.io/github/license/PeterNaydenov/morph)
![GitHub issues](https://img.shields.io/github/issues/PeterNaydenov/morph)
![GitHub top language](https://img.shields.io/github/languages/top/PeterNaydenov/morph)
![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/%40peter.naydenov%2Fmorph)



## General Information

`Morph` has a logic-less template syntax. Placeholders are places surrounded by double curly braces `{{ }}` and they represent the places where the data will be inserted.

Engine is text-based, so it can be used for HTML, CSS, config files, source code, etc.
Some features of Morph:
- Simple logic-less template syntax;
- Built-in storage;
- Powerful action system for data decoration;
- Demo data via the `'demo'` command renders the template with the built-in handshake;
- Nesting templates as part of the action system;
- Partial rendering (render only available data);
- Option to connect templates to external data sources;
- Post-processing plugin mechanism;









## Installation

```
npm install @peter.naydenov/morph
```

Morph can be used in browser and node.js.
```js
import morph from "@peter.naydenov/morph"
// Morph supports also require:
// const morph = require("@peter.naydenov/morph")
```





## Basic Usage

```js
import morph from "@peter.naydenov/morph"

const myTemplateDescription = {
                 template: `Hello, {{name}}!` // simple template - a string with a placeholder
                 , helpers : {
                            // helper functions
                        }
                 , handshake : {
                           // ... demo data here
                           name : 'Ivan'
                        }
            }
const myTemplate = morph.build ( myTemplateDescription );      // myTemplate is a render function
const htmlBlock = myTemplate ( 'render', { name: 'Peter' } )   // Provide data to the render function and get the result
// htmlBlock === 'Hello, Peter!'
const demo = myTemplate ( 'render', 'demo' )
// demo === 'Hello, Ivan!'
```

Morph also has a built-in template storage. Instead of creating a variable for each template, we can use the storage.

```js
// add template to the storage. Automatically builds the render function
// Array of two elements. 0 - template name, 1 - optional. Storage name. Defaults to 'default'
morph.add ( ['myTemplate'], myTemplateDescription ) 
// get template from the storage and render it
const htmlBlock = morph.get ( ['myTemplate'] )({ name: 'Peter' }) 
// it's same as text above
morph.add ( ['myTemplate', 'default'], myTemplateDescription )
const htmlBlock = morph.get ( ['myTemplate', 'default'] )( 'render', { name: 'Peter' })
// if we use custom storage:
morph.add ( ['myTemplate', 'hidden'], myTemplateDescription ) // write template in storage 'hidden'
const htmlBlock = morph.get ( ['myTemplate', 'hidden'] )( 'render', { name: 'Peter' }) // render template from 'hidden' storage
morph.get ( ['myTemplate'] )('render', { name: 'Peter' }) // call template 'myTemplate' from default storage
// will return error, because default storage does not have template "myTemplate"
```

Let's see a more complex example before we go into details:
```js
const myTemplateDescription = {
              template: `Hello, {{ person : a, >getReady }}! Your age is {{ person : >getAge}}.` 
            , helpers: {
                            getReady: (person) => {
                                            return {
                                                      text: person.name
                                                    , href: person.web
                                                }
                                        }
                          , a: `<a href="{{href}}">{{text}}</a>`
                          , getAge: (person) => person.age
                    }
             , handshake: {
                        // ... demo data here           
                }
            }
const myTemplate = morph.build ( myTemplateDescription );
const htmlBlock = myTemplate ( 'render', { person: {
                                              name: 'Peter'
                                            , age : 40
                                            , web : 'example.com'
                                        } 
                                })
// htmlBlock === Hello, <a href="example.com">Peter</a>! Your age is 40.
```





## Methods

```js
  build   : 'Build a component from template description'
, get     : 'Get a component from component storage'
, add     : 'Add a component to component storage'
, list    : 'List the names of all components in the component storage'
, clear   : 'Clear up all the components in the storage'
, remove  : 'Remove a template from component storage'
```





## Template Description Structure
Templates are objects with three properties: `template`, `helpers`, and `handshake`:
```js
const myTemplateDescription = {
      template: `` // (required) Template string
    , helpers: {
                // (optional) Functions and templates used by actions to decorate the data
        }
    , handshake: {
                // (optional) Example data used to render the template.
        }
    , escape: false // (optional) HTML-escape the output of data-only placeholders. See section 'HTML Escaping'
}
```
`Template` is a string with placeholders where we render our external data. It's a skeleton of the template. Placeholders are the dynamic parts of the template.

Helpers are extra templates or functions needed for rendering the template. Example:
```js
const myTemplateDescription = {
      template: `
                <h1>{{title}}</h1>
                <ul>
                    {{list:li,a}}
                </ul>
            `
    , helpers: {
                a: `<a href="{{href}}">{{text}}</a>`,
                li: `<li>{{text}}</li>`
            }
    , handshake: {
                title: 'My title'
              , list: [
                          { text: 'Item 1', href: 'item1.com' }
                        , { text: 'Item 2', href: 'item2.com' }
                        , { text: 'Item 3', href: 'item3.com' }
                    ]
            }
}
```
Helpers will be discussed in detail in the next documentation section - 'Helper Functions'.





## Placeholders

Template placeholders can contain data-source and actions separated by ':'. Data-source is a field of the data object used for the placeholder. Actions describe how the data should be decorated. An action is a list of operations separated by comma. The result from the first action is going as an argument to the second and so on. Execution of actions is from right to left. Actions are optional.

```js
`{{ name : act2, act1 }}`
// placeholder should take data from field 'name', execute 'act1' and 'act2' over it
// actions are separated by ',' and are executed from right to left

// placeholder could have a name. It's optional and is in the end of the placeholder definition separated by ':'
`{{ name : act2, act1 : placeholderName }}`
// Placeholder names are useful when we want to render only a few of them and we prefer to call them by name

`{{ list : li, a }}`
// take data from 'list' and render each element first with 'a' then with 'li' actions

`{{ name }}` // render data from 'name'. Only data is provided to this placeholder
`{{ :someAction}}` // no data, but the result of the action will fill the placeholder
`{{ @all : someAction }}` // provide all the data to the action 'someAction'
`{{:someAction : placeName }}` // action 'someAction' will fulfill content of placeholder and placeholder name will be 'placeName'
```



## Actions

Actions are concise representations of a sequence of function calls. Some functions pertain to `data` manipulation, others to `rendering`, and some to `mixing`. We use a prefix system for enhanced readability and maintainability.

- `Render` functions are most used so they don't have any prefix;
- `Data` functions start with '>';
- `Mixing` functions start with '[]';
- `Extended render` start with '+';
- `Memory` actions start with '^'. Memory action will take a data snapshot and will be available in helper functions as a named argument 'memory'. The name after the prefix is the name of the snapshot. Request saved data from helper functions by calling 'memory[name]';
- `Overwrite` action is marked with '^^'. Means that the current data will be available for all placeholders, not only for the current placeholder;



Here are some examples: 
```js
`
{{ : li }} // example for render actions
{{ : >setup}} // example for data actions
{{ friends : []coma }} // example for mixing action
{{ list : ul, [], li, a}} // example with render and mixing actions
`
// NOTE: See that the mixing function has no name after the prefix.
// Anonymous mixing is a built-in function that will do -> resultList.join ( '' )
// The data will be rendered with 'a', then with 'li'
// then all 'li' elements will be merged and will be provided to 'ul'
```

When input data is array, the result will be an array. Result for each element will stay separated until come the mixing function.

Learn more about how actions work in the section 'helper functions' below.

## Helper Functions

Helpers are templates and functions that are used by actions to decorate the data. Helper functions can be used in templates as actions. Action type explains what to expect from the helper function.

- `Render functions` should return a string - the data that will replace the placeholder. 
- `Data functions` are created to manipulate the data. Expectation is to return data, that will continue to be used by other actions. 
- `Mixing functions` should merge data in a single data result that will be used by other actions.  
- `Extended render functions` will return a string like regular render functions, but will receive a deep branch of requested data.

### Calling Helpers within Helpers

Starting from version 3.3.0, helper functions receive a `useHelper` function in their arguments object. This allows helpers to call other helpers programmatically.

```js
const helpers = {
    // Basic helper
    format: ({ data }) => `[${data}]`,

    // Helper using another helper
    process: ({ data, useHelper }) => {
        return useHelper('format') // Uses current data
    },

    // Helper overriding data
    customProcess: ({ data, useHelper }) => {
        return useHelper('format', 'Override') // Uses provided data
    },

    // Helper calling a template string helper
    linkToCheck: ({ data, useHelper }) => {
        // 'link' is a string template helper defined elsewhere
        if (data.url) return useHelper('link', { text: data.name, href: data.url })
        return data.name
    }
}
```

`useHelper` signature: `useHelper(helperName, [dataOverride])`
- `helperName`: String name of the helper to call.
- `dataOverride`: Optional. Data to pass to the helper. If omitted, the current data context of the caller is used.



## HTML Escaping

Templates that render user-provided data into HTML should escape it. Morph gives you three levels of control.

**Built-in helper `escape`.** Available in every template without declaring it. Escapes `& < > " '`:
```js
const fn = morph.build ({ template: `<p>{{ comment : escape }}</p>` })
fn ( 'render', { comment: '<script>steal()</script>' })
// -> '<p>&lt;script&gt;steal()&lt;/script&gt;</p>'
```
It works in action chains (`{{ items : escape, li }}` - escape each item, then render it with 'li') and inside your helper functions via `useHelper('escape', value)`. Defining your own helper named `escape` overrides the built-in.

**Template option `escape: true`.** Escapes the output of all data-only placeholders - placeholders without actions, where external data lands in the output directly:
```js
const fn = morph.build ({
      template: `<p>{{ comment }}</p>`
    , escape: true
    })
fn ( 'render', { comment: '<img src=x onerror=alert(1)>' })
// -> '<p>&lt;img src=x onerror=alert(1)&gt;</p>'
```
Placeholders with actions are not auto-escaped - helpers are your code and often produce markup on purpose. Escape inside them when they interpolate user data. To opt a single data-only placeholder out, mark it with the action `raw`:
```js
`{{ trustedHtml : raw }}` // rendered without escaping, even with escape: true
```
The option survives the commands `set` and `curry` - derived templates keep the same protection.

**Command `curry` is injection-safe.** Rendered data can not introduce new placeholders in the curried template. Placeholder tags inside data values render as literal text:
```js
const fn = morph.build ({ template: `Hello {{ name }}, role: {{ role }}` })
const curried = fn ( 'curry', { name: '{{ role }}' })   // user-controlled value
curried ( 'render', { role: 'admin' })
// -> 'Hello {{ role }}, role: admin'  - the injected tags stay text
```



## Commands
The first argument of the render function is the command. Available commands are: `render`, `debug`, `snippets`, `curry`, and `set`. Default command is `render` so if template doesn't need external information we can call the function without arguments.


## Debug
The `debug` command provides information about the template. The second argument is an instruction. Available instructions: `raw`, `demo`, `handshake`, `placeholders`, `count`.

- `raw`: Returns the original template string.
- `demo`: Renders the template with handshake data.
- `handshake`: Returns the handshake object.
- `placeholders`: Returns a string of placeholder names separated by commas.
- `count`: Returns the number of unresolved placeholders in the current template state.

```js
const fn = morph.build(template);

let raw = fn('debug', 'raw'); // Original template
let count = fn('debug', 'count'); // Number of unresolved placeholders
```


## Snippets
Snippets are a way to render only specific placeholders instead of always rerendering the entire template. Render function arguments were changed in version 3.x.x to serve this purpose. 

How to access snippets:
```js
 const template = {
                template:`
                            <h1>{{title}}</h1>
                            <p>{{description}}</p>
                            <div class="contact">
                                    {{ name : setupName : theName }}
                            </div>
                            <p>{{ tags : +comma : tagList }}</p>
                    `,
                helpers: {
                            setupName : ( {data} ) => `${data.name} ${data.surname}`,
                            comma : ({data}) =>  data.map ( tag => `<span>${tag}</span>` ).join ( ',' )
                        },
                handshake: {
                            title : 'Contacts',
                            description : 'Contact description text',
                            name : { name: 'Ivan', surname: 'Petrov' },
                            tags : ['tag1', 'tag2', 'tag3'],
                        }
          } // template
  
const fn = morph.build ( template );

let res1 = fn ( 'snippets', 'demo' )
// will return a string with the render results of all placeholders separated by '<~>' string
// `Contacts<~>Contact description text<~>Ivan Petrov<~><span>tag1</span>,<span>tag2</span>,<span>tag3</span><~>`
let res2 = fn ( 'snippets:theName', 'demo' )
// will return a string with the render result of 'name' placeholder. No delimiter because is only one placeholder
// `Ivan Petrov`

let res3 = fn ( 'snippets:theName,tagList', 'demo' )
// will return a string with the render results of 'name' and 'tags' placeholders separated by '<~>' string
// `Ivan Petrov<~><span>tag1</span>,<span>tag2</span>,<span>tag3</span>`

// snippets can be accessed also with index - starting from 0. Index mean the order of appearance of placeholders in the template.
let res4 = fn ( 'snippets:2,3', 'demo' )
// it's the same as res3. Use names or indexes according to your preferences. With indexes placeholder will not need to have a name.
```


## Curry
The `curry` command performs partial rendering with the provided data and returns a new render function. The new function uses the rendered output as the new template, while preserving the original helpers and handshake.

```js
const template = morph.build({
    template: 'Hello {{name}}! Welcome to {{place}}.',
    helpers: { format: ({data}) => data.toUpperCase() },
    handshake: { name: 'World', place: 'Earth' }
});

const curried = template('curry', { name: 'Alice' });
// curried is a new function with template 'Hello Alice! Welcome to {{place}}.'

const result = curried('render', { place: 'Mars' });
// result: 'Hello Alice! Welcome to Mars.'
```

This allows chaining partial renders or completing with defaults using `('render', 'demo')`.


## Set
The `set` command modifies the template by merging new helpers, handshake, or replacing placeholders, then returns a new render function with the changes applied.

```js
const template = morph.build({
    template: 'Hello {{name}}!',
    helpers: { format: ({data}) => data.toLowerCase() },
    handshake: { name: 'World' }
});

const modified = template('set', {
    helpers: { format: ({data}) => data.toUpperCase() },
    placeholders: { 0: '{{greeting}}' } // Replace first placeholder
});
// modified has updated helpers and template 'Hello {{greeting}}!'

const result = modified('render', { greeting: 'Hi' });
// result: 'HELLO HI!' (note: format applied to 'Hi')
```


## Companion tools

The `.morph` file extension and the Vite plugin are **separate projects** that build on top of this engine. They live in their own repos so the engine itself stays a small, focused npm package.

- **Vite plugin** — [vite-plugin-morph](https://github.com/PeterNaydenov/vite-plugin-morph) compiles `.morph` files (HTML, CSS, JS, JSON sections) into ES modules. The compiled output is a render function produced by this engine.
- **VSCode extension** — [Morph Template Syntax Highlighting](https://marketplace.visualstudio.com/items?itemName=PeterNaydenov.morph-template-syntax-highlighting) for `.morph` files.


## Links
- [Release history](Changelog.md)
- [ Migration guide ](https://github.com/PeterNaydenov/morph/blob/master/Migration.guide.md)
- [ Vite Plugin ](https://github.com/PeterNaydenov/vite-plugin-morph)
- [ VSCode Extension ](https://marketplace.visualstudio.com/items?itemName=PeterNaydenov.morph-template-syntax-highlighting)



## Credits
'@peter.naydenov/morph' was created and supported by Peter Naydenov.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

Found a vulnerability? Please follow the disclosure process in [SECURITY.md](SECURITY.md) — do not file a public issue.

## License
'@peter.naydenov/morph' is released under the [MIT License](LICENSE).






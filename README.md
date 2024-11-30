# Morph (@peter.naydenov/morph)
**Experimental stage. Not tested well yet.**

![version](https://img.shields.io/github/package-json/v/peterNaydenov/morph)
![license](https://img.shields.io/github/license/peterNaydenov/morph)
![GitHub issues](https://img.shields.io/github/issues/peterNaydenov/morph)
![GitHub top language](https://img.shields.io/github/languages/top/peterNaydenov/morph)
![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/%40peter.naydenov%2Fmorph)



## General Information

`Morph` has a logic-less template syntax. Placeholders are places surrounded by double curly braces `{{ }}` and they represents the pleces where the data will be inserted.

Engine is text based, so it can be used for HTML, CSS, config files, source code, etc.
Some features of Morph:
- Simple logic-less template syntax;
- Builtin storage;
- Powerfull action system for data decoration;
- Nesting templates as part of the action system;
- Partial rendering (render only available data);
- Option to connect templates to external data sources;
- Post process plugin mechanism;





## Installation

```
npm install @peter.naydenov/morph
```

Morph can be used in browser and node.js.
```js
import morph from "@peter.naydenov/morph"
// Morpho supports also require:
// const morph = require("@peter.naydenov/morph")
```





## Basic Usage

```js
import morph from "@peter.naydenov/morph"

const myTemplateDescription = {
                 template: `Hello, {{name}}!` // simple template - a string with a placeholder
            }
const myTemplate = morph.build ( myTemplateDescription ); // myTemplate is a render function
const htmlBlock = myTemplate ( { name: 'Peter' } )        // Provide data to the render function and get the result
// htmlBlock === 'Hello, Peter!'
```

Morph contains also a builtin template storage. Instead of creating variable for each template, we can use the storage.

```js
morph.add ( 'myTemplate', myTemplateDescription ) // add template to the storage. Automatically builds the render function
const htmlBlock = morph.get ( 'myTemplate' )({ name: 'Peter' }) // get template from the storage and render it
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
            }
const myTemplate = morph.build ( myTemplateDescription );
const htmlBlock = myTemplate ( { person: {
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
, list    : 'List all components in component storage'
, clear   : 'Clear all templates in component storage'
, remove  : 'Remove a template from component storage'
```





## Template Description Structure
Templates are objects with tree properties: `template`, `helpers`, and `handshake`:
```js
const myTemplateDescription = {
      template: `` // (required) Template string
    , helpers: {
                // (optional) Functions and templates used by actions to decorate the data
        }
    , handshake: {
                // (optional) Example data used to render the template.
        }
}
```
`Template` is a string with placeholders where we render our external data. It's a skeleton of the template. Placeholders are the dynamic parts of the template.

Helpers are a extra templates or functions needed for rendering the template. Example:
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
Helpers will be discussed in details in next documentation section - 'Helper Functions'.





## Placeholders

Template placeholders can contain data-source and actions separated by ':'. Data-source is a field of the data object used for the placeholder. Actions describe how the data should be decorated. Action is a list of operations separated by comma. Result from the first action is going as a argument to the second and so on. Executetion of actions is from right to left. Actions are optional.

```js
`{{ name : act2, act1 }}`
// placeholder should take data from field 'name', execute 'act1' and 'act2' over it
// actions are separated by ',' and are executed from right to left

`{{ list : li, a }}`
// take data from 'list' and render each element first with 'a' then with 'li' actions

`{{ name }}` // render data from 'name'. Only data is provided to this placeholder
`{{ :someAction}}` // no data, but the result of the action will fill the placeholder
`{{ @all : someAction }}` // provide all the data to the action 'someAction'
```



## Actions

Actions are concise representations of a sequence of function calls. Some functions pertain to `data` manipulation, others to `rendering`, and some to `mixing`. We use a prefix system for enhanced readability and maintainability.

- `Render` functions are most used so they don't have any prefix;
- `Data` functions start with '>';
- `Mixing` functions start with '[]';
- `Conditional render` actions start with '?';
- `Extended render` start with '+';

Here are some examples: 
```js
`
{{ : li }} // example for render actions
{{ : >setup}} // example for data actions
{{ friends : []coma }} // example for mixing action
{{ list : ul, [], li, a}} // example with render and mixing actions
`
// NOTE: See that mixing function has no name after the prefix. 
// Anonymous mixing is a build in function that will do -> resultList.join ( '' )
// The data will be rendered with 'a', then with 'li'
// then all 'li' elements will be merged and will be provided to 'ul'
```

When input data is array, the result will be an array. Result for each element will stay separated until come the mixing function.

Learn more about how actions work in the section 'helper functions' below.






## Links
- [Release history](Changelog.md)
- [ Migration guide ](https://github.com/PeterNaydenov/morph/blob/master/Migration.guide.md)



## Credits
'@peter.naydenov/morph' was created and supported by Peter Naydenov.

## License
'@peter.naydenov/morph' is released under the MIT License.






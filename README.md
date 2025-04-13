# Morph (@peter.naydenov/morph)

![version](https://img.shields.io/github/package-json/v/peterNaydenov/morph)
![license](https://img.shields.io/github/license/peterNaydenov/morph)
![GitHub issues](https://img.shields.io/github/issues/peterNaydenov/morph)
![GitHub top language](https://img.shields.io/github/languages/top/peterNaydenov/morph)
![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/%40peter.naydenov%2Fmorph)



## What's new in version 2.x.x
- Data helper functions modifies the data per placeholder;
- Arguments for helper functions are named arguments;
- Memory action introduced - memory is available in helper functions as a named argument;
- Overwrite action introduced - when change in data should be available for all placeholders;
- Deep data-sources ( after version 2.1.0 );




## General Information

`Morph` has a logic-less template syntax. Placeholders are places surrounded by double curly braces `{{ }}` and they represents the pleces where the data will be inserted.

Engine is text based, so it can be used for HTML, CSS, config files, source code, etc.
Some features of Morph:
- Simple logic-less template syntax;
- Builtin storage;
- Powerfull action system for data decoration;
- Demo request can render the template with the builtin data;
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
// Morph supports also require:
// const morph = require("@peter.naydenov/morph")
```





## Basic Usage

```js
import morph from "@peter.naydenov/morph"

const myTemplateDescription = {
                 template: `Hello, {{name}}!` // simple template - a string with a placeholder
                 , helers : {
                            // helper functions
                        }
                 , handshake : {
                           // ... demo data here
                           name : 'Ivan'
                        }
            }
const myTemplate = morph.build ( myTemplateDescription );  // myTemplate is a render function
const htmlBlock = myTemplate ( { name: 'Peter' } )           // Provide data to the render function and get the result
// htmlBlock === 'Hello, Peter!'
const demo = myTemplate ( 'demo' )
// demo === 'Hello, Ivan!'
```

Morph contains also a builtin template storages. Instead of creating variable for each template, we can use the storages.

```js
// add template to the storage. Automatically builds the render function
// Array of two elements. 0 - template name, 1 - optional. Storage name. Defaults to 'default'
morph.add ( ['myTemplate'], myTemplateDescription ) 
// get template from the storage and render it
const htmlBlock = morph.get ( ['myTemplate'] )({ name: 'Peter' }) 
// it's same as text above
morph.add ( ['myTemplate', 'default'], myTemplateDescription )
const htmlBlock = morph.get ( ['myTemplate', 'default'] )({ name: 'Peter' })
// if we use custom storage:
morph.add ( ['myTemplate', 'hidden'], myTemplateDescription ) // write template in storage 'hidden'
const htmlBlock = morph.get ( ['myTemplate', 'hidden'] )({ name: 'Peter' }) // render template from 'hidden' storage
morph.get ( ['myTemplate'] )({ name: 'Peter' }) // call template 'myTemplate' from default storage
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
, list    : 'List the names of all components in the component storage'
, clear   : 'Clear up all the components in the storage'
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
### Deep data-sources ( after version 2.1.0 )

Setup a deep data-source by using breadcrumbs.
```js
const myTpl = {
                  template : `Profile: {{ me/stats : line }}.`  // data-source will be data.me.stats
                , helpers: {
                                line: `({{ height}}cm,{{ weight}}kg)`
                        }
        };
const data = {
                me : {
                          name: 'Peter'
                        , stats : {
                                          age: 50
                                        , height: 180
                                        , weight: 66
                                }
                    }
        };
const templateFn = morph.build ( myTpl );
const result = templateFn ( data );
// ---> Profile: (180cm,66kg).
```



## Actions

Actions are concise representations of a sequence of function calls. Some functions pertain to `data` manipulation, others to `rendering`, and some to `mixing`. We use a prefix system for enhanced readability and maintainability.

- `Render` functions are most used so they don't have any prefix;
- `Data` functions start with '>';
- `Mixing` functions start with '[]';
- `Conditional render` actions start with '?';
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
// NOTE: See that mixing function has no name after the prefix. 
// Anonymous mixing is a build in function that will do -> resultList.join ( '' )
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
- `Extended render functions` will return a string like regular render functions, but will receive a deep branch of requested data;
- `Conditional render functions` could return null, that means: ignore this action. The result could be also a string: the name of other helper function that will render the data.



## Good Practices and Examples



### Setup a development environment
Setting up your development environment for working with the Morph components will help you to get the most out of it. First, what you need to do is to start showing HTML markup inside JavaScript. For editor 'Video Studio Code', you can use an extension [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html). Now simple comment will turn your HTML string into colored HTML markup.

Second - make sure that `emmet` works for your javascript files. For editor 'Video Studio Code', go to settings, write 'emmet' in search box. Find a section 'Emmet: Include Languages' and press 'Add item'. Set item 'javascript' and value 'html'. Save settings. Now you can write HTML markup in your JS files. 



### Modify root data before start rendering
Sometimes we need to modify data and modification should be valid for all placeholders. Add in the begining of the template a placeholder like `{{ : blank, ^^, >myModification }}`, where myModification is a helper function that will modify the data, `^^` is overwrite action and `blank` is a render helper function that will return an empty string (placeholder disapears ). Look at the example here:

```js
const myTemplateDescription = {
                template: `
                          {{  : blank, ^^ , >myModification }}  
                          <h1>{{title}}</h1>
                          {{list: ul,[],li,a}}
                      `
              , helpers: {
                          myModification : ({data}) => {   // Modify original input data 
                                          data.list.forEach ( (item,i) =>  item.count = i )
                                          return data
                                }
                          , blank : () => `` // use this helper function to remove the placeholder
                          , a: `<a href="{{href}}">{{ count }}.{{text}}</a>`
                          , li: `<li>{{text}}</li>`
                          , ul: `<ul>{{text}}</ul>`
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
        const templateFn = morph.build ( myTemplateDescription );
        const result = templateFn ( 'demo' );
        // result ---> '<h1>My title</h1><ul><li><a href="item1.com">0.Item 1</a></li><li><a href="item2.com">1.Item 2</a></li><li><a href="item3.com">2.Item 3</a></li></ul>'
```


## Links
- [Release history](Changelog.md)
- [ Migration guide ](https://github.com/PeterNaydenov/morph/blob/master/Migration.guide.md)



## Credits
'@peter.naydenov/morph' was created and supported by Peter Naydenov.

## License
'@peter.naydenov/morph' is released under the MIT License.






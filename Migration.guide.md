# Migration Guides


## 2.x.x -> 3.x.x
Version 3 introduces the ability to render only specific placeholders, rather than rerendering the entire template. This means that if your template represents a full page, you can rerender only the placeholders affected by changed data.


The `render` function now takes a command as its first argument. Available commands are: `render`, `debug`, and `snippets`. Other arguments have no changes. Just shifted right. The second argument becomes the data, the third is dependencies, and the fourth is a list of post-processing functions.

In version 3.x.x, the data is always the second argument. It can be a string, as in version 2.x.x. The term "command" is no longer used for this argument; instead, it is called "instructions". Available instructions include: `raw`, `demo`, `handshake`, and `placeholders`.

```js
// To render the template with internal 'handshake' data
// Before
myTemplate ( 'demo' )
// After 3.x.x
myTemplate ( 'render', 'demo' )


// To show list of placeholders
// Before
myTemplate ( 'placeholders' )
// After 3.x.x
myTemplate ( 'debug', 'placeholders' )


// To see the handshake data
// Before
myTemplate ( 'handshake' )
// After 3.x.x
myTemplate ( 'debug', 'handshake' )


// Functions that don't relay on external data and are called without arguments have no changes
// Before
myTemplate ()
// After 3.x.x
myTemplate ()
// command 'render' is by default
```

That's it!



## 1.x.x -> 2.x.x
Modification of data is available only for current placeholder. If you need to remember changes in data, use the new memory action - '^something' where '^' is for memory and 'something' is the name. Memory will make a snapshot of the current data and will be available in helper functions. If you need to provide changes to all placeholders, use overwrite action. It's a snapshot that will be remember as a main data and will be available for all placeholders.

Arguments for helper functions are chaged. Because we want to have many arguments and we don't want to think about their order, we make an object with named arguments. Available arguments are: data, dependencies, memory. 



## 0.x.x -> 1.x.x
Main change is how you address templates. Before template name and storage were separated arguments. Now they are a single argument where the first element is the template name and the second element is the storage name. Storage name is optional and defaults to 'default'.

```js
// Add template to default storage
// Before
morph.add ( 'myName', myTpl )
// After
morph.add ( ['myName'], myTpl )

// Add template to named storage
// Before
morph.add ( 'myName', myTpl, 'myStorage' )
// After
morph.add ( ['myName', 'myStorage'], myTpl )
```

Calling the render function has changed. The first argument again is the data, but then we have optional injection object and then comes post processing function.

```js
// My injection is new argument
// Before
morph.render ( myData, postProcess1, postProcess2, postProcess3 )
// After
morph.render ( myData, myInjection, postProcess1, postProcess2, postProcess3 )
```

List method is extended. Now you can pass more then one storage to scan for template names.

```js
// Before
let storage1Templates = morph.list ( 'storage1' )
let storage2Templates = morph.list ( 'storage2' )
let all = storage1Templates.concat ( storage2Templates )

// After
let all = morph.list ( ['storage1', 'storage2'] )
```

Library is prety well typed now so expect a smooth migration process.

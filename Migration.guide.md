# Migration Guides


## 1.x.x -> 2.x.x
Modification of data is available only for current placeholder. If you need to remember changes in data, use the new memory action. Memory will make a snapshot of the current data and will be available in data functions. If you need to provide changes to all placeholders, use overwrite action. It's a snapshot that will be remember as a main data and will be available for all placeholders.



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

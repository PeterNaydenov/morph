import   morphAPI    from '../src/main.js'
import { expect } from 'chai'



describe ( 'transformer: build', () => {


    it ( 'Simple mustache like placeholders, no actions', () => {
                // spaces inside placeholders are ignored
                const myTpl = {
                                template: `Your name is {{ name }}. Your age is {{age}}.`
                        }
                const templateFn = morphAPI.build ( myTpl )
                const result = templateFn({
                                                  name: 'Peter'
                                                , age: 50
                                        })
                expect ( result ).to.be.equal ( 'Your name is Peter. Your age is 50.' )
        }) // it simple mustache like placeholders, no actions


    it ( 'Mixing actions', () => {
                // Mix action starts with '[]'. If no name after '[]' it will be like arr.join(''). 
                // If name, it is the helper function used. In our case it is 'coma'.
                const myTpl = {
                                  template : `My friends are {{ names : []coma }}.`
                                , helpers  : {
                                                  coma: (res) => res.join(', ')
                                        }
                        };
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ names: ['Peter', 'Ivan'] });
                expect ( result ).to.be.equal ( 'My friends are Peter, Ivan.' );
        }) // it mixing actions



    it ( 'No placeholders', () => {
                const myTpl = {
                                  template : `My name is Peter.`
                        }
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn();   // No data required
                expect ( result ).to.be.equal ( 'My name is Peter.' );
        }) // it No placeholders



    it ( 'Data action to change the result', () => {
                const myTpl = {
                                  // placeholder will be fullfiled with data[job], but data function 'jobPossible' will filter the result
                                  template : `My job is {{ job : >jobPossible }}.`
                                , helpers  : {
                                                jobPossible: (text) => {
                                                                if ( text === 'Software Engineer' ) return 'hidden'
                                                                else return text
                                                        }
                                        }
                        }
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ job: 'Software Engineer' });
                const result2 = templateFn({ job: 'doctor' });
                expect ( result ).to.be.equal ( 'My job is hidden.' );
                expect ( result2 ).to.be.equal ( 'My job is doctor.' );
        }) // it data action to change the result



     it ( 'Keep a placeholder', () => {
                const myTpl = {
                                  // placeholder will be fullfiled with data[job], but data function 'jobPossible' will filter the result
                                  template : `My job is {{ job : >jobPossible }}.`
                                , helpers  : {
                                                jobPossible: (text) => {
                                                                if ( text === 'Software Engineer' ) return null  // null means: Do not render this field
                                                                else return text
                                                        }
                                        }
                        }
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ job: 'Software Engineer' });
                expect ( result ).to.be.equal ( 'My job is {{ job : >jobPossible }}.' );
        }) // it Keep placeholder



    it ( 'Long chain with variaty of actions: Data, render, and mixing', () => {
                const myTpl = {
                          template: `Hello, {{  name : ul, [], li, >fromList }}! {{ more }}`
                        , helpers: {
                                  fromList: name => (['Peter', 'Ivan'].includes(name) ? name : 'stranger')
                                , ul : `<ul>{{text}}</ul>`
                                , li : `<li>{{text}}</li>`
                            }
                    };
                const templateFn = morphAPI.build ( myTpl )
                const result = templateFn({
                                                  name: [ 'Peter', 'Stoyan' ]
                                                , more: `extended version`
                                        })
                expect ( result ).to.be.equal ( 'Hello, <ul><li>Peter</li><li>stranger</li></ul>! extended version' )
        }) // it Long chain with variaty of actions



     it ( 'Data action on array of objects', () => {
                const myTpl = {
                                template: `My friends: {{ friends : ul, [], li, >people }}`
                                , helpers: {
                                                li: `<li>{{name}}: {{state}}</li>`,
                                                ul: `<ul>{{text}}</ul>`,
                                                people: (res) => {
                                                                if ( res.age < 30 )   res.state = 'young'
                                                                else                   res.state = 'old'
                                                                return res
                                                        }
                                        }
                        }
                const templateFn = morphAPI.build ( myTpl )
                const result = templateFn({
                                            friends: [
                                                        { name: 'Peter', age: 30 }
                                                      , { name: 'Ivan', age: 25 }
                                                      , { name: 'Stoyan', age: 35 }
                                                ]
                                        })
                expect ( result ).to.be.equal ( 'My friends: <ul><li>Peter: old</li><li>Ivan: young</li><li>Stoyan: old</li></ul>' )
        }) // it data action on array of objects



     it ( 'Data array', () => {
                // If input data is an array, we render each element with the template
                const myTpl = {
                                template: `My name is {{ name }}. My age is {{ age }}.`
                        }
                const templateFn = morphAPI.build ( myTpl )
                const result = templateFn([
                                            { name: 'Peter', age: 30 }
                                          , { name: 'Ivan', age: 25 }
                                          , { name: 'Stoyan', age: 35 }
                                ])
                expect ( result ).to.have.length ( 3 )
                expect ( result[0] ).to.be.equal ( 'My name is Peter. My age is 30.' )
                expect ( result[1] ).to.be.equal ( 'My name is Ivan. My age is 25.' )
                expect ( result[2] ).to.be.equal ( 'My name is Stoyan. My age is 35.' )
        }) // it data array



     it ( 'Use all data: @all', () => {   // *** Address full data to placeholder -> @all
                const myTpl = {
                                  template : `My name is {{ name }}. My web page is {{ @all : a, >morphWeb }}. Contact me on  {{ @all : a , >morphMail }}.`
                                , helpers  : {
                                                a : `<a href="{{link}}">{{text}}</a>`
                                                , morphWeb : ( data ) => { 
                                                                data.link = data.web
                                                                data.text = data.web
                                                                return data
                                                        } 
                                                , morphMail: ( data ) => {
                                                                data.link = data.email
                                                                data.text = 'e-mail'
                                                                return data
                                                        }
                                        }
                        }
                const templateFn = morphAPI.build ( myTpl )
                const result = templateFn({
                                                  name  : 'Peter'
                                                , web   : 'example.com'
                                                , email : 'peter@example.com'
                                        })
                expect ( result ).to.be.equal ( 'My name is Peter. My web page is <a href="example.com">example.com</a>. Contact me on  <a href="peter@example.com">e-mail</a>.' )
        }) // it use all data @all



     it ( 'Ignore rendering if data is null', () => {
                // Ignore rendering [] lines that have missing data
                const myTpl = {
                          template : `People and their jobs: {{ jobList : ul, [], li, >jobItems }}`
                        , helpers  : {
                                          ul : `<ul>{{text}}</ul>`
                                        , li : `<li>{{name}} - {{job}}</li>`
                                        , jobItems : ( data ) => { // It's a data function
                                                        // If data-function returns null, it will be ignored in template render
                                                        if ( !data.name || !data.job )   return null
                                                        else                             return data
                                                }
                                }
                        };
                const data = {
                        jobList: [
                                  {name: 'Peter', job: 'Software Engineer'}
                                , {name: 'Ivan' } // No job - ignored in template render
                                , {name: 'Stoyan', job: 'designer'  }
                                ]
                        };
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn(data);
                expect ( result ).to.be.equal ( 'People and their jobs: <ul><li>Peter - Software Engineer</li><li>Stoyan - designer</li></ul>' )
                
        }) // it Ignore rendering if data is null



     it ( 'Ignore rendering fields that have no data', () => {
                const myTpl = {
                        template : `My name is {{ name }}.`

                        };
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ person: 'Peter' });
                expect ( result ).to.be.equal ( 'My name is {{ name }}.' )
        }) // it Ignore rendering fields that have no data



     it ( 'How to hide a placeholder', () => {
        // Hide a placeholder - provide an empty string
                const myTpl = {
                                template : `My name is {{ name }}.{{ extraData}}`
                        }
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ 
                                                  name: 'Peter' 
                                                , extraData: ''
                                        });
                expect ( result ).to.be.equal ( 'My name is Peter.' )
        }) // it how to hide a placeholder



     it ( 'Sequence of render processes with object', () => {
        // Write result of render to field 'text' and preserve other existing fields
        const myTpl = {
                                template : `Here is - {{ website: a, setText }}.`
                              , helpers  : {
                                                  a : `<a href="{{link}}">{{text}}</a>`
                                                , setText : `{{about}}: {{domain}}`
                                        }
                        }
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ 
                                          website : {
                                                          domain: `example.com`
                                                        , about : `My portfolio`
                                                        , link  : `http://example.com`
                                                }
                                        });
                expect ( result ).to.be.equal ( 'Here is - <a href="http://example.com">My portfolio: example.com</a>.' )
        }) // it sequence of render processes with object



     it ( 'Action only', () => {
        // Use helper functions to insert dynamic data from programming environment(state, variable, etc.)
        // Templates that are using actions only, don't need a input data object. It's a dynamic data.
                const myState = 'active'
                const myTpl = {
                                  template: `Profile {{ : state }}.`
                                , helpers: {
                                        state: () => myState  
                                        }
                        };
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn();
                expect ( result ).to.be.equal ( 'Profile active.' )
        }) // it action only



    it ( 'Mixing a string', () => {
        // Providing a string to a mixing function should not break the result.
                const myTpl = {
                            template: `My name is {{ : [], >name }}`
                          , helpers: {
                                        name: ( data ) => data.name 
                                }
                        }
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ name: 'Stoyan'});
                expect ( result ).to.be.equal ( 'My name is Stoyan' )
       }) // it mixing a string



    it ( 'Broken template', () => {
        // If template is broken, the result should be a string, representation of the error.
                const myTpl = {
                                template : `My {{ {{ welcome }}`
                        };
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn();
                expect ( result ).to.be.equal ( 'Error: Nested placeholders. Close placeholder before open new one.' )
        }) // it broken template



     it ( 'Data only - object. Default field is "text"', () => {
        // If provided data is object - default field is 'text'
                const myTpl = {
                                template : `My name is {{ person }}.`
                        };
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ person: { text: 'Ivan', age: 25 }});
                expect ( result ).to.be.equal ( 'My name is Ivan.' )
        })



     it ( 'Data only - array. Should render first element', () => {
        // If provided data is array - default field is the first element of the array
                const myTpl = {
                                template : `My name is {{ person }}.`
                        };
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ person: [ 'John', 'Milen', 'Vladislav' ]});
                expect ( result ).to.be.equal ( 'My name is John.' )
        })



     it ( 'Auto mixing array results', () => {
        // Auto mix if in the end of the action-list the result is still an array
                const myTpl = {
                                  template: `My friends are {{ friendsList: li }}.`
                                , helpers : {
                                                li: `<li>{{ text }}</li>`
                                        }
                        };
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({ friendsList: [ 'John', 'Milen', 'Vladislav' ]});
                expect ( result ).to.be.equal ( 'My friends are <li>John</li><li>Milen</li><li>Vladislav</li>.' )        
        })



    it ( 'Nested templates', () => {
        // Use helper functions to render other templates
                
                const secondaryTpl = { // Template for nesting  
                                  template : `My friends are {{ names : []coma }}.`
                                , helpers: {
                                                  coma: (res) => res.join(', ')
                                        }
                        }        
                const secTemplateFn = morphAPI.build ( secondaryTpl ); 
                
                const myTpl = { // Top level template
                                  template : `My name is {{ name }}. {{ friends: friendListing}}`
                                , helpers: {
                                                friendListing: (d) => {
                                                                return secTemplateFn ({ names : d }) // Nested template render}
                                                        }
                                        }
                        }
                const templateFn = morphAPI.build ( myTpl );
                const result = templateFn({
                                          name : 'Peter'
                                        , friends: [ 'John', 'Milen', 'Vladislav' ]
                                });
                expect ( result ).to.be.equal ( 'My name is Peter. My friends are John, Milen, Vladislav.' )
        }) // it nested templates



    it ( 'Data deep levels' )


    
}) // Describe
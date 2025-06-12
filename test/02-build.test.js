import   morph    from '../src/main.js'
import { expect } from 'chai'



describe ( 'transformer: build', () => {


    it ( 'Simple mustache like placeholders, no actions', () => {
                // spaces inside placeholders are ignored
                const myTpl = {
                                template: `Your name is {{ name }}. Your age is {{age}}.`
                        }
                const templateFn = morph.build ( myTpl )
                const result = templateFn( 'render', {
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
                                                  coma: ({ data:res }) => res.join(', ')
                                        }
                        };
                const templateFn = morph.build ( myTpl );
                const result = templateFn('render', { names: ['Peter', 'Ivan'] });
                expect ( result ).to.be.equal ( 'My friends are Peter, Ivan.' );
        }) // it mixing actions



    it ( 'No placeholders', () => {
                const myTpl = {
                                  template : `My name is Peter.`
                        }
                const templateFn = morph.build ( myTpl );
                const result = templateFn();   // No data required
                expect ( result ).to.be.equal ( 'My name is Peter.' );
        }) // it No placeholders



    it ( 'Data action to change the result', () => {
                const myTpl = {
                                  // placeholder will be fullfiled with data[job], but data function 'jobPossible' will filter the result
                                  template : `My job is {{ job : >jobPossible }}.`
                                , helpers  : {
                                        jobPossible: ( {data:text} ) => {
                                                                if ( text === 'Software Engineer' )   return 'hidden'
                                                                else return text
                                                        }
                                        }
                        }
                const templateFn = morph.build ( myTpl );

                const result = templateFn('render', { job: 'Software Engineer' });
                expect ( result ).to.be.equal ( 'My job is hidden.' );
                
                const result2 = templateFn('render', { job: 'doctor' });
                expect ( result2 ).to.be.equal ( 'My job is doctor.' );
        }) // it data action to change the result



      it ( 'Primitive data with helper function', () => {
                const myTpl = {
                                  template : `My job is {{ job : jobPossible }}.`
                                , helpers  : {
                                                jobPossible: ({data}) => {
                                                                if ( data === 'Software Engineer' ) return null  // null means: Do not render this field
                                                                else return data
                                                        }
                                        }
                        }
                const templateFn = morph.build ( myTpl );
                const result = templateFn({ job: 'programmer' });
                expect ( result ).to.be.equal ( 'My job is programmer.' );
          }) // it primitive data with helper function




     it ( 'Keep a placeholder', () => {
                const myTpl = {
                                  // placeholder will be fullfiled with data[job], but data function 'jobPossible' will filter the result
                                  template : `My job is {{ job : >jobPossible }}.`
                                , helpers  : {
                                                jobPossible: ({data:text}) => {
                                                                if ( text === 'Software Engineer' ) return null  // null means: Do not render this field
                                                                else return text
                                                        }
                                        }
                        }
                const templateFn = morph.build ( myTpl );
                const result = templateFn ( 'render', { job: 'Software Engineer' });
                expect ( result ).to.be.equal ( 'My job is {{ job : >jobPossible }}.' );
        }) // it Keep placeholder



    it ( 'Missing helper function', () => {
                const myTpl = { template : `My name is {{ name : notExistingHelper }}.`}
                const fn = morph.build ( myTpl );
                expect ( fn() ).to.be.equal ( 'Error: Missing helper: notExistingHelper' )
        }) // it Missing helper function



    it ( 'Long chain with variaty of actions: Data, render, and mixing', () => {
                const myTpl = {
                          template: `Hello, {{  name : ul, [], li, >fromList : nano }}! {{ more }}`
                        , helpers: {
                                  fromList: ({data:name}) => (['Peter', 'Ivan'].includes(name) ? name : 'stranger')
                                        
                                , ul : `<ul>{{text}}</ul>`
                                , li : `<li>{{text}}</li>`
                            }
                    };
                const templateFn = morph.build ( myTpl )
                const result = templateFn (
                                        'render',                                        
                                        {
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
                                                people: ( {data:res} ) => {
                                                                if ( res.age < 30 )   res.state = 'young'
                                                                else                  res.state = 'old'
                                                                return res
                                                        } // people func.
                                        }
                        }
                const templateFn = morph.build ( myTpl )
                const result = templateFn ( 'render', {
                                                        friends: [
                                                                        { name: 'Peter', age: 30 }
                                                                , { name: 'Ivan', age: 25 }
                                                                , { name: 'Stoyan', age: 35 }
                                                                ]}
                                        )                
                expect ( result ).to.be.equal ( 'My friends: <ul><li>Peter: old</li><li>Ivan: young</li><li>Stoyan: old</li></ul>' )
        }) // it data action on array of objects



     it ( 'Data array', () => {
                // If input data is an array, we render each element with the template
                const myTpl = {
                                template: `My name is {{ name }}. My age is {{ age }}.`
                        }
                const templateFn = morph.build ( myTpl )
                const result = templateFn('render', [
                                            { name: 'Peter', age: 30 }
                                          , { name: 'Ivan', age: 25 }
                                          , { name: 'Stoyan', age: 35 }
                                ])
                // Result is array of rendered templates
                expect ( result ).to.have.length ( 3 )
                expect ( result[0] ).to.be.equal ( 'My name is Peter. My age is 30.' )
                expect ( result[1] ).to.be.equal ( 'My name is Ivan. My age is 25.' )
                expect ( result[2] ).to.be.equal ( 'My name is Stoyan. My age is 35.' )
        }) // it data array



     it ( 'Use all data: @all, @root', () => {   // *** Address full data to placeholder -> @all
                // Both are equivalent: @all === @root
                const myTpl = {
                                  template : `My name is {{ name }}. My web page is {{ @all : a, >morphWeb }}. Contact me on  {{ @root : a , >morphMail }}.`
                                , helpers  : {
                                                a : `<a href="{{link}}">{{text}}</a>`
                                                , morphWeb : ({ data }) => { 
                                                                data.link = data.web
                                                                data.text = data.web
                                                                return data
                                                        } 
                                                , morphMail: ({ data }) => {
                                                                data.link = data.email
                                                                data.text = 'e-mail'
                                                                return data
                                                        }
                                        }
                        }
                const templateFn = morph.build ( myTpl )
                const result = templateFn( 'render', {
                                                  name  : 'Peter'
                                                , web   : 'example.com'
                                                , email : 'peter@example.com'
                                        })
                expect ( result ).to.be.equal ( 'My name is Peter. My web page is <a href="example.com">example.com</a>. Contact me on <a href="peter@example.com">e-mail</a>.' )
        }) // it use all data @all



     it ( 'Ignore rendering if data is null', () => {
                // Ignore rendering [] lines that have missing data
                const myTpl = {
                          template : `People and their jobs: {{ jobList : ul, [], li, >jobItems }}`
                        , helpers  : {
                                          ul : `<ul>{{text}}</ul>`
                                        , li : `<li>{{name}} - {{job}}</li>`
                                        , jobItems : ({ data }) => { // It's a data function
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
                const templateFn = morph.build (  myTpl );
                const result = templateFn ( 'render', data );
                expect ( result ).to.be.equal ( 'People and their jobs: <ul><li>Peter - Software Engineer</li><li>Stoyan - designer</li></ul>' )
                
        }) // it Ignore rendering if data is null



     it ( 'Ignore rendering fields that have no data', () => {
                const myTpl = {
                        template : `My name is {{ name }}.`

                        };
                const templateFn = morph.build ( myTpl );
                if ( typeof templateFn === 'function' ) {
                        const result = templateFn( 'render', { person: 'Peter' });
                        expect ( result ).to.be.equal ( 'My name is {{ name }}.' )
                   }
                else  {
                        throw new Error ( 'Test failed' )                        
                    }
        }) // it Ignore rendering fields that have no data



     it ( 'How to hide a placeholder', () => {
        // Hide a placeholder - provide an empty string
                const myTpl = {
                                template : `My name is {{ name }}.{{ extraData}}`
                        }
                const templateFn = morph.build ( myTpl );
                if ( typeof templateFn === 'function' ) {
                                const result = templateFn('render', { 
                                                                  name: 'Peter' 
                                                                , extraData: '' // Provide an empty string to hide a placeholder
                                                        });
                                expect ( result ).to.be.equal ( 'My name is Peter.' )        
                        }
                else  {
                        throw new Error ( 'Test failed' )                        
                    }
        }) // it how to hide a placeholder



     it ( 'Data changes - overwrite', () => {
                const myTpl = {
                          template : `{{ : blank, ^^, >setName }}My name is {{name}}.`
                        , helpers  : {
                                        setName : ({ data }) => {
                                                        data.name='Peter'
                                                        return data
                                                }
                                        , blank : () => ``
                                }
                        }
                const templateFn = morph.build ( myTpl );                
                const result = ( typeof templateFn === 'function' ) ? templateFn () : false;
                expect ( result ).to.be.equal ( 'My name is Peter.' )
     }) // it Data changes without render



     it ( 'Data save and use', () => {
                        const myTpl = {
                          template : `{{ : blank, ^buffer, >setName }}My name is {{ : >getFromBuffer}}.`
                        , helpers  : {
                                        setName : ({ data }) => {
                                                        data.name='Peter'
                                                        return data
                                                }
                                        , getFromBuffer : ({ memory}) => memory.buffer.name
                                        , blank : () => ``
                                }
                        }
                const templateFn = morph.build ( myTpl );
                const result = ( typeof templateFn === 'function' ) ? templateFn () : false;
                expect ( result ).to.be.equal ( 'My name is Peter.' )
     }) // it Data save and use



     it ( 'Call external template with array data', () => {
                const myTpl = {
                        template : `{{ list : executeExternal }}`
                        , helpers  : {
                                executeExternal : function ({ data, dependencies:x }) {
                                                        let res = x.ex ( 'render', data )
                                                        return res
                                                }
                                }
                        };   // end myTpl
                const external = {
                                template : `Hi,{{ name }}!`
                        };

                morph.add ( ['external'], external )
                morph.add ( ['myTpl'], myTpl )

                const myData = { list : [
                                                { name : 'Peter' },
                                                { name : 'Ivan' },
                                                { name : 'Stoyan' }
                                        ]}


                
                let deps = { ex: morph.get (['external'] )};
                const result = morph.get ( ['myTpl'] )( 'render', myData, deps )
                expect ( result ).to.be.equal ( 'Hi,Peter!Hi,Ivan!Hi,Stoyan!' )
     }) // it Call external template with array data




     it ( 'Data as null or undefined', () => {
        // If data is null or undefined, should return the template without any changes
                const myTpl = {
                                template : `My name is {{ name }}.{{ extraData}}`
                        }
                const templateFn = morph.build ( myTpl );
                const result = templateFn( 'render', null );
                expect ( result ).to.be.equal ( myTpl.template )
        }) // it data as null or undefined



     it ( 'Sequence of render processes with object', () => {
        // Write result of render to field 'text' and preserve other existing fields
        const myTpl = {
                                template : `Here is - {{ website: a, setText }}.`
                              , helpers  : {
                                                  a : `<a href="{{link}}">{{text}}</a>`
                                                , setText : `{{about}}: {{domain}}`
                                        }
                        }
                const templateFn = morph.build ( myTpl );
                const result = templateFn ( 'render', { 
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
                const templateFn = morph.build ( myTpl );
                const result = templateFn();
                expect ( result ).to.be.equal ( 'Profile active.' )
        }) // it action only



    it ( 'Mixing a string', () => {
        // Providing a string to a mixing function should not break the result.
                const myTpl = {
                            template: `My name is {{ : [], >name }}`
                          , helpers: {
                                        name: ({ data }) => data.name 
                                }
                        }
                const templateFn = morph.build ( myTpl );
                const result = templateFn ( 'render', { name: 'Stoyan'});
                expect ( result ).to.be.equal ( 'My name is Stoyan' )
       }) // it mixing a string



    it ( 'Broken template', () => {
        // If template is broken, the result should be a string, representation of the error.
                const myTpl = {
                                template : `My {{ {{ welcome }}`
                        };
                const templateFn = morph.build ( myTpl );
                const result = templateFn ();
                expect ( result ).to.be.equal ( 'Error: Nested placeholders. Close placeholder before open new one.' )
        }) // it broken template



     it ( 'Data only - object. Default field is "text"', () => {
        // If provided data is object - default field is 'text'
                const myTpl = {
                                template : `My name is {{ person }}.`
                        };
                const templateFn = morph.build ( myTpl );
                const result = templateFn ( 'render', { person: { text: 'Ivan', age: 25 }});
                expect ( result ).to.be.equal ( 'My name is Ivan.' )
        })



     it ( 'Data only - array. Should render first element', () => {
        // If provided data is array - default field is the first element of the array
                const myTpl = {
                                template : `My name is {{ person }}.`
                        };
                const templateFn = morph.build ( myTpl );
                const result = templateFn ( 'render', { person: [ 'John', 'Milen', 'Vladislav' ]});
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
                const templateFn = morph.build ( myTpl );
                const result = templateFn('render', { friendsList: [ 'John', 'Milen', 'Vladislav' ]});
                expect ( result ).to.be.equal ( 'My friends are <li>John</li><li>Milen</li><li>Vladislav</li>.' )        
        })



    it ( 'Nested templates', () => {
        // Use helper functions to render other templates
                
                const secondaryTpl = { // Template for nesting  
                                  template : `My friends are {{ names }}.`
                        }        
                const secTemplateFn = morph.build ( secondaryTpl ); 
                
                const myTpl = { // Top level template
                                  template : `My name is {{ name }}. {{ friends: friendListing, []coma }}`
                                , helpers: {
                                                friendListing: ({ data: d }) => {
                                                                return secTemplateFn ('render',{ names : d })   // Nested template render
                                                        }
                                                , coma: ({ data:res }) => res.join(', ')
                                        }
                        }
                const templateFn = morph.build ( myTpl );
                const result = templateFn(
                                        'render'
                                        , {
                                          name : 'Peter'
                                        , friends: [ 'John', 'Milen', 'Vladislav' ]
                                        }
                                );
                expect ( result ).to.be.equal ( 'My name is Peter. My friends are John, Milen, Vladislav.' )
        }) // it nested templates



    it ( 'List - Data deep object', () => {
                const myTpl = {
                                  template : `My list: {{ list:  ul , [], li,  #, line }}.`
                                , helpers: {
                                                line: `{{ name }} - {{ age }}`
                                              , ul: `<ul>{{ text }}</ul>`
                                              , li: `<li>{{ text }}</li>`
                                        }
                                                
                        };
                const data = {
                        list : [
                                  'John'
                                  , {
                                        name: 'Milen'
                                      , age: 25}
                                  , 'Vladislav'
                                  , {
                                        name: 'Stoyan'
                                      , age: 30}
                                ]
                        };
                const templateFn = morph.build ( myTpl );
                const result = templateFn ( 'render', data );
                expect ( result ).to.be.equal ( 'My list: <ul><li>John</li><li>Milen - 25</li><li>Vladislav</li><li>Stoyan - 30</li></ul>.' )
        }) // it list - data deep object



    it ( 'Modify root data', () => {
        const myTemplateDescription = {
                template: `
                          {{  : blank, ^^ , >myModification }}
                          <h1>{{title}}</h1>
                          {{list: ul,[],li,a}}
                      `
              , helpers: {
                          myModification : ({data}) => {
                                          data.list.forEach ( (item,i) =>  item.count = i )
                                          return data
                                }
                          , blank : () => ``
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
        expect ( result.trim() ).to.be.equal ( `<h1>My title</h1> <ul><li><a href="item1.com">0.Item 1</a></li><li><a href="item2.com">1.Item 2</a></li><li><a href="item3.com">2.Item 3</a></li></ul>`)
    }) // it modify root data



    it ( 'Object - Data deep object', () => {
                const myTpl = {
                                  template : `Profile: {{ me: ul , li, #, line }}.`
                                , helpers: {
                                                line: `({{ height}}cm,{{ weight}}kg)`
                                              , ul: `<ul>{{ text }}</ul>`
                                              , li: `<li>{{ name }} - {{stats}}</li>`
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
                const result = templateFn ( 'render', data );
                expect ( result ).to.be.equal ( 'Profile: <ul><li>Peter - (180cm,66kg)</li></ul>.' )
        }) // it object - data deep object



    it ( 'Access a deep object', () => {
                const myTpl = {
                                  template : `Profile: {{ me/stats : line }}.`
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
                expect ( result ).to.be.equal ( 'Profile: (180cm,66kg).' )
        }) // it object - data deep object



    it ( 'Access a deep property', () => {
                const myTpl = {
                                  template : `Age: {{ me/stats/age }}.`
                                , helpers: {}
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
                expect ( result ).to.be.equal ( 'Age: 50.' )
        }) // it Access a deep property



     it ( 'Use deep array data', () => {
                const myTpl = {
                                template: /*template*/`
                                        <h2>{{title}}</h2>
                                        {{ contacts: [], #, [], cards, #, [], tags }}
                                    `
                                , helpers: {
                                                tags: `<span>{{text}}</span>`
                                                , tagUpdate : function ({ data }) {
                                                                data.tags = data.tags.join ( ' ' )
                                                                return data
                                                        } // tagUpdate func.
                                                , nn : ({ data }) => {
                                                                return data.join ( ' ' )
                                                        } // nn
                                                , cards :`
                                                                <div class="contact">
                                                                        <h3>{{name}}</h3>
                                                                        <p><strong>ID Token</strong>: {{id}}</p>
                                                                        <p><strong>Tags</strong>: 
                                                                                {{tags}}
                                                                        </p>
                                                                        <p>
                                                                                <button class="action" data-click="nav-contacts-edit">Edit</button>
                                                                                <button class="action">Copy ID Token</button>
                                                                                <button class="action warn">Delete</button>
                                                                        </p>
                                                                </div>
                                                                `
                                                        
                                        }
                                , handshake: {
                                        title: 'Contacts',
                                        contacts: [{
                                                     name: 'Ivan Ivanov'
                                                   , id : '3mwes!534-12-2fe-!2d1w'
                                                   , tags : [ 'pro', 'dev', 'Bulgaria', 'Sofia Office' ]
                                                },
                                                {
                                                     name: 'Stoyan Stoyanov'
                                                   , id : '3mwes!522-12-2fw-!2d1q'
                                                   , tags : [ 'intern', 'dev', 'Bulgaria', 'Plovdiv Office' ]
                                                }]
                                        }
                        };
                const templateFn = morph.build( myTpl );
                const result = templateFn ( 'render', 'demo' ).replace ( /\s+/g, '' );
                expect ( result ).to.be.equal ( `
                        <h2>Contacts</h2>
                        
                        <div class="contact">
                                <h3>IvanIvanov</h3>
                                <p><strong>IDToken</strong>: 3mwes!534-12-2fe-!2d1w</p>
                                <p><strong>Tags</strong>:
                                                <span>pro</span>
                                                <span>dev</span>
                                                <span>Bulgaria</span>
                                                <span>SofiaOffice</span>
                                        </p>
                                <p>
                                        <button class="action" data-click="nav-contacts-edit">Edit</button>
                                        <button class="action">CopyIDToken</button>
                                        <button class="actionwarn">Delete</button>
                                        </p>
                                </div>
                                        
                        <div class="contact">
                                <h3>StoyanStoyanov</h3>
                                <p><strong>IDToken</strong>:3mwes!522-12-2fw-!2d1q</p>
                                <p><strong>Tags</strong>:
                                                <span>intern</span>
                                                <span>dev</span>
                                                <span>Bulgaria</span>
                                                <span>PlovdivOffice</span>
                                        </p>
                                <p>
                                        <button class="action" data-click="nav-contacts-edit">Edit</button>
                                        <button class="action">CopyIDToken</button>
                                        <button class="actionwarn">Delete</button>
                                        </p>
                                </div>
                                `.replace ( /\s+/g, '' ) )
     }) // it use deep array



     it ( 'Use extra renders: "+" ', () =>  {
                let touch = false;
                const myTpl = {
                                  template : `Profile: {{ me: +line }}.`
                                , helpers: {
                                                line: ({ data:x }) => {
                                                                expect ( x ).to.have.property ( 'stats' )
                                                                expect ( x ).to.have.property ( 'name' )
                                                                const { height, weight } = x.stats;
                                                                touch = true
                                                                return `${x.name} - (${height}cm,${weight}kg)`
                                                        } // line helper
                                        } // helpers
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
                const result = templateFn ( 'render', data );
                expect ( result ).to.be.equal ( 'Profile: Peter - (180cm,66kg).' )
                expect ( touch ).to.be.true
         }) // it use extra renders "+"



    it ( 'Ignore comments from template', () => {
                const
                   myTpl = {
                                  template : `My name is 
                                           <!-- 
                                                multiline comment section
                                                ... testing

                                                --> 
                                                {{ name }}.`
                        };
                const templateFn = morph.build ( myTpl );
                const result = templateFn( 'render', { name: 'Peter' });
                expect ( result ).to.be.equal ( 'My name is Peter.' )

         }) // it ignore comments from template
    
}) // Describe
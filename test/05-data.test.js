import morph from '../src/main.js'
import { expect } from 'chai'



describe ( 'morph: Data', () => {



    it ( 'Using string literals in helpers', () => {
                const myTpl = {
                              template : `My name is {{ person: hello }}.`
                            , helpers  : {
                                        hello: ({name, age}) => {
                                                    return `${name}o. Age is ${age}`
                                                }
                                    }
                        };
                const templateFn = morph.build ( myTpl );
                const result = templateFn({
                                            person: {
                                                          name: 'Robert'
                                                        , age: 30
                                                    }
                                            
                                        });
                expect ( result ).to.be.equal ( 'My name is Roberto. Age is 30.' )
        }) // it using string literals in helpers



    it ( 'Helper returns null', () => {
                const myTpl = {
                          template : `My name is {{ person: hello }}.`
                        , helpers  : {
                                    hello: ({name, age}) => null
                                }
                    };
                const templateFn = morph.build ( myTpl );
                const result = templateFn({
                                        person: {
                                                      name: 'Robert'
                                                    , age: 30
                                                }
                                        
                                    });
                expect ( result ).to.be.equal ( 'My name is {{ person: hello }}.' )
        }) // it helper returns null



    it ( 'Conditional rendering with string literals', () => {
      // Conditional rendering mean that helper rendering could be called 
      // if data coresponds to some condition.
      // Returning null means: do not render this data
                const myTpl = {
                          template : "Hello, I'm {{ persons: []coma, ?web, hello }}"
                        , helpers  : {
                                      hello: ( data ) => {
                                                    const { name, age } = data;
                                                    if ( age < 28 )   return null
                                                    else              return `${name} - ${age} years old`
                                                }
                                      , coma: (res) => res                          // Coma is a mixing helper
                                                        .filter ( x => x != null)   // filter is required to remove cancelled renders
                                                        .map ( x => x.text )
                                                        .join ( ', ' )
                                    , a : `<a href="{{href}}">{{text}}</a>`
                                    , web: ( d ) => {
                                                    if ( d.href )  return 'a'  // response 'a' means: render this data with helper 'a'
                                                    else           return null // response 'null' in conditional render means: do not render
                                            }
                                }
                    };
                const templateFn = morph.build ( myTpl );
                const result = templateFn({
                                        persons: [
                                                      { name: 'Robert' , age: 30, href: 'http://robert.com' }
                                                    , { name: 'John' , age: 64 }
                                                    , { name: 'Edward' , age: 21,   href: 'http://edward.com' }
                                                    , { name: 'Bob' , age: 34 , href: 'http://bob.com' }
                                                ]
                                    });
                expect ( result ).to.be.equal ( `Hello, I'm <a href="http://robert.com">Robert - 30 years old</a>, John - 64 years old, <a href="http://bob.com">Bob - 34 years old</a>` )
        }) // it conditional rendering with string literals



    it ( 'Post process functions', () => {
                const myTpl = {
                              template : `The template:`
                          }
                const
                      post1 = ( data ) => `${data} >post1`
                    , post2 = ( data ) => `${data} >post2`
                    , post3 = ( data ) => `${data} >post3`
                    ;
                const templateFn = morph.build ( myTpl );
                const result = templateFn ( {}, post1, post2, post3 );
                expect ( result ).to.be.equal ( `The template: >post1 >post2 >post3` )
        }) // it post process functions



    it ( 'Read data from external state', () => {
                const state = {
                                name: 'Robert'
                              , age: 30
                              , job: 'software developer'
                              }
                const myTpl = {
                            template : `Hello from {{ :name }}. I'm {{ :age }} years old {{ :job }}`
                            , helpers : {
                                          name: ( data ) => state.name
                                        , age: ( data ) => state.age
                                        , job: ( data ) => state.job
                                  }
                          }
                const templateFn = morph.build ( myTpl );
                const result = templateFn();
                expect ( result ).to.be.equal ( `Hello from Robert. I'm 30 years old software developer` )
        }) // it read data from external state



    it ( 'Function arguments - data only', () => {
                const state = {
                                name: 'Robert'
                              , age: 30
                              , job: 'software developer'
                              }
                const myTpl = {
                            template : `Hello from {{ name }}. I'm {{ age }} years old {{ job }}`
                          }
                const templateFn = morph.build ( myTpl );
                const result = templateFn({
                                        name: () => state.name
                                      , age: () => state.age
                                      , job: () => state.job
                                    });
                expect ( result ).to.be.equal ( `Hello from Robert. I'm 30 years old software developer` )
        }) // it function arguments - data only



    it ( 'Function arguments with actions', () => {
                const state = {
                                name: 'Robert'
                              , age: 30
                              , job: 'software developer'
                              }
                const myTpl = {
                              template : `Hello from {{ name }}. I'm {{ age: extraAge }} years old {{ job }}`
                            , helpers  : {
                                            extraAge: ( data ) => data+3
                                        }
                            }
                const templateFn = morph.build ( myTpl );
                const result = templateFn({
                                        name: () => state.name
                                      , age: () => state.age
                                      , job: () => state.job
                                    });
                expect ( result ).to.be.equal ( `Hello from Robert. I'm 33 years old software developer` )
        }) // it function arguments with actions

        
}) // describe
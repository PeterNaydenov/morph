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
      // TODO: Not finished. Need description and more reading
                const myTpl = {
                          template : "Hello, I'm {{ persons: []coma, ?web, hello }}"
                        , helpers  : {
                                      hello: ( data ) => {
                                                    const { name, age } = data;
                                                    if ( age < 28 )   return null
                                                    else              return `${name} - ${age} years old`
                                                }
                                                // filter is required to remove cancelled renders
                                    , coma: (res) => res
                                                        .filter ( x => x != null)
                                                        .map ( x => x.text )
                                                        .join ( ', ' )
                                    , a : `<a href="{{href}}">{{text}}</a>`
                                    , web: ( d ) => {
                                                    if ( d.href )  return 'a'
                                                    else           return null
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



        
}) // describe
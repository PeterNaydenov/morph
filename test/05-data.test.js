import a from '@peter.naydenov/walk';
import morph from '../src/main.js'
import { expect } from 'chai'



describe ( 'morph: data', () => {



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
                                    hello: ({name, age}) => {
                                                return null
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
                expect ( result ).to.be.equal ( 'My name is {{ person: hello }}.' )
        }) // it helper returns null



    it ( 'Conditional rendering with string literals', () => {
                const myTpl = {
                          template : "Hello, I'm {{ persons: []coma, hello }}"
                        , helpers  : {
                                      hello: (d) => d.map ( ({name, age}) => {
                                                    if ( age < 28 )   return null
                                                    else              return `${name} - ${age} years old`
                                                })
                                                // filter is required to remove cancelled renders
                                    , coma: (res) => res.filter ( x => x != null).join ( ', ' )
                                }
                    };
                const templateFn = morph.build ( myTpl );
                const result = templateFn({
                                        persons: [
                                                      { name: 'Robert' , age: 30}
                                                    , { name: 'John' , age: 64}
                                                    , { name: 'Edward' , age: 21}
                                                    , { name: 'Bob' , age: 34}
                                                ]
                                    });
                expect ( result ).to.be.equal ( `Hello, I'm Robert - 30 years old, John - 64 years old, Bob - 34 years old` )
        }) // it conditional rendering with string literals



        it ( '', () => {
                // Try to see tag functions...
                
                function tag (list ) {
                            let tpl =  arguments
                            return function tagClosure (vals) {
                                        let extra = 1;
                                        return list.reduce ( ( acc, part ) => {
                                                let 
                                                      key = tpl[extra++]
                                                    , extraData = vals[key]? vals[key] : ''
                                                    ;
                                                if ( !part )   part = extraData
                                                else           part = part + extraData
                                                return acc + part
                                        }, '' )
                            } 
                    } // tag func.

                const 
                      person = { 
                              name   : 'Bob'
                            , greet  : 'Hey'
                            , age    : 30
                            , extra  : 12
                        }
                    ;

                const tg = tag`${'greet'} darling ${'name'}, my age is ${'age'}. Great!`
                const res = tg ( person )
                console.log ( res )
                
                    
            }) // it
        
        
        
        
        it.only ( '', () => {
                // Try to see tag functions...
                
                function tag (list ) {
                            let tpl =  arguments
                            return function tagClosure (vals) {
                                        let extra = 1;
                                        return list.reduce ( ( acc, part ) => {
                                                let 
                                                      key = tpl[extra++]
                                                    , extraData = vals[key]? vals[key] : ''
                                                    ;
                                                if ( !part )   part = extraData
                                                else           part = part + extraData
                                                return acc + part
                                        }, '' )
                            } 
                    } // tag func.

                const 
                      person = { 
                              name   : 'Bob'
                            , greet  : 'Hey'
                            , age    : 30
                            , extra  : 12
                        }
                    ;

                const tg = tag`${'greet'} darling ${'name'}, my age is ${'age'}. Great!`
                const res = tg ( person )
                console.log ( res )
                
                    
            }) // it

}) // describe
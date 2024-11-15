
import build from '../src/methods/build.js'

import { expect } from 'chai'
import walk from '@peter.naydenov/walk'
import stack from '@peter.naydenov/stack'


describe ( 'transformer: build', () => {


    it ( 'simple mustache like placeholders, no actions', () => {
                // spaces inside placeholders are ignored
                const myTpl = {
                                template: `Your name is {{ name }}. Your age is {{age}}.`
                        }
                const templateFn = build ( myTpl )
                const result = templateFn({
                                                  name: 'Peter'
                                                , age: 50
                                        })
                expect ( result ).to.be.equal ( 'Your name is Peter. Your age is 50.' )
        }) // it simple mustache like placeholders, no actions


    it ( 'mixing function', () => {
                // Mix action starts with '[]'. If no name after '[]' it will be like arr.join(''). 
                // If name, it is the helper function used. In our case it is 'coma'.
                const myTpl = {
                                  template : `My friends are {{ names : []coma }}.`
                                , helpers  : {
                                                  coma: (res) => res.join(', ')
                                        }
                        };
                const templateFn = build ( myTpl );
                const result = templateFn({ names: ['Peter', 'Ivan'] });
                expect ( result ).to.be.equal ( 'My friends are Peter, Ivan.' );
        }) // it mixing function


    it ( 'No placeholders', () => {
                const myTpl = {
                                  template : `My name is Peter.`
                        }
                const templateFn = build ( myTpl );
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
                const templateFn = build ( myTpl );
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
                const templateFn = build ( myTpl );
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
                const templateFn = build ( myTpl )
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
                const templateFn = build ( myTpl )
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
                const templateFn = build ( myTpl )
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
                const templateFn = build ( myTpl )
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
                const templateFn = build ( myTpl );
                const result = templateFn(data);
                expect ( result ).to.be.equal ( 'People and their jobs: <ul><li>Peter - Software Engineer</li><li>Stoyan - designer</li></ul>' )
                
        }) // it Ignore rendering if data is null



     it ( 'Ignore rendering fields that have no data', () => {
                const myTpl = {
                        template : `My name is {{ name }}.`

                        };
                const templateFn = build ( myTpl );
                const result = templateFn({ person: 'Peter' });
                expect ( result ).to.be.equal ( 'My name is {{ name }}.' )
        }) // it Ignore rendering fields that have no data



     it.only ( 'How to hide a placeholder', () => {
        // Hide a placeholder - provide an empty string
                const myTpl = {
                                template : `My name is {{ name }}.{{ extraData}}`
                        }
                const templateFn = build ( myTpl );
                const result = templateFn({ 
                                                  name: 'Peter' 
                                                , extraData: ''
                                        });
                expect ( result ).to.be.equal ( 'My name is Peter.' )
        }) // it how to hide a placeholder



     it ( '', () => {
        // TODO: When to present render result as a part of object? Do I need a specific sign before the action?
     })



     it ( 'test walk', () => {
                const data = {
                                  type: 'profile'
                                , profile : {
                                            name: 'Peter'
                                          , age: 30
                                          , hairColor: 'brown'
                                          , profession: 'Software Engineer'
                                          , hobbies: ['coding', 'music']
                                          , address: {
                                                        city: 'Sofia'
                                                      , country: 'Bulgaria'
                                                }
                                        },
                                links: [
                                          { text: 'Home'   , href: 'https://peter.naydenov.dev', person: 'Peter' }
                                        , { text: 'GitHub' , href: 'https://github.com/peter-naydenov', person: 'Stefan' }
                                        , { text: 'Twitter', href: 'https://twitter.com/peter_naydenov', person: 'Ivan' }
                                    ]
                            }

                const 
                      root = {}
                    , nested = {}
                    ;
                let dataDeepLevel = 0;


                function findObjects ({key, value, breadcrumbs}) {
                                        dataDeepLevel = breadcrumbs.split('/').length -1;
                                        if ( !nested[dataDeepLevel] )   nested[dataDeepLevel] = {}
                                        nested[dataDeepLevel][breadcrumbs] = value
                                        // console.log ( `${breadcrumbs}, deep: ${deepLevel}`)
                                        return value
                        } // step func.

                function findRoot ({key, value, breadcrumbs}) {
                                const deepLevel = breadcrumbs.split('/').length -2;
                                if ( deepLevel == 0 )   root[key] = value
                                return value
                        } // findRoot func.

                walk ({ data, objectCallback:findObjects, keyCallback:findRoot })
                nested[0] = root
                console.log ( nested )
                console.log ( root )
                console.log ( dataDeepLevel )
                
                

     }) // it test walk





     it ( 'build actions', () => {
        function setupActions ( actions, dataDeepLevel ) {
                                let 
                                  actSetup = {}
                                , actLevel = 0
                                , actionList = actions.split( ',' ).map ( x => x.trim() )
                                , i = 0
                                ;
                                do {
                                        actSetup[i] = []
                                        i++
                                } while ( i <= dataDeepLevel )
                                
                                actionList.every ( act => {
                                                if ( act === '#' ) {   // it's a change level action
                                                        actLevel++
                                                        if ( actLevel > dataDeepLevel )  return false
                                                        else    return true
                                                   }
                                                if ( act.startsWith ( '[]' )) {   // it's a mixing action
                                                                actSetup[actLevel].push ({
                                                                                  type: 'mix'
                                                                                , name: act.replace ( '[]', '' )
                                                                                , level: actLevel
                                                                                })
                                                                return true
                                                        }
                                                if ( act.startsWith ( '>' ) ) {   // it's a data action. Result will be merged to existing data
                                                                actSetup[actLevel].push ({
                                                                                  type: 'data'
                                                                                , name: act.replace ( '>', '' )
                                                                                , level: actLevel
                                                                                })
                                                                return true
                                                        }
                                        actSetup[actLevel].push ({
                                                                              type: 'render'
                                                                            , name: act
                                                                            , level: actLevel
                                                                        })
                                        return true
                                        }) // actionList every
                                return actSetup
                } // setupActions func.
        
        const actionList = `ul, li, #, []coma, row, a`;
        const deepLevel = 4;
        const actionStacks = setupActions ( actionList, deepLevel );
        const x = actionSupply ( actionStacks, 1 )
        
        for ( let step of x ) {
                        console.log ( step )
                }
        
        function* actionSupply ( act, level ) {
                        let action = stack ({ type:'LIFO' });
                        for ( let i=0; i<=level; i++ ) {
                                        action.push ( act[i] )          
                                }
                        while ( action && !action.isEmpty () ) {
                                        yield action.pull ()
                                }                        
                } // getAction func.
        
     }) // it build actions


}) // Describe
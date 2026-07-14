import morph from '../src/main.js'
import { describe, it, expect } from 'vitest'



describe ( 'morph: commands', () => {



    it ( 'Request a template', () => {
                // Command 'raw'
                const myTpl = { template : `My name is {{ name }}.` };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'debug' ,'raw')
                expect ( result ).toBe ( 'My name is {{ name }}.' )
        }) // it request a template



    it ( 'Request a handshake', () => {
                let demo = { name: 'Stoyan' }
                const myTpl = { 
                        template : `My name is {{ name }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'debug', 'handshake' )
                expect ( result ).toEqual ( demo )
        }) // it request a handshake



    it ( 'Request a demo', () => {
        // Render a template with the handshake
                let demo = { name: 'Stoyan' }
                const myTpl = { 
                          template  : `My name is {{ name }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ([ 'myName'] )( 'render', 'demo' )
                expect ( result ).toBe ( 'My name is Stoyan.' )
    }) // it request a demo



    
    it ( 'Wrong command to component', () => {
        // Commands other than 'raw', 'handshake' and 'demo' should return an error.
                let demo = { name: 'Stoyan' }
                const myTpl = { 
                          template  : `My name is {{ name }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'fake' )

                expect ( result ).toBe ( 'Error: Wrong command "fake". Available commands: render, debug, snippets, set, curry.' )
        }) // it wrong command to component



    it ( 'Wrong instruction to component', () => {
        // Commands other than 'raw', 'handshake' and 'demo' should return an error.
                let demo = { name: 'Stoyan' }
                const myTpl = { 
                          template  : `My name is {{ name }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'debug', 'fake' )
                expect ( result ).toBe ( 'Error: Wrong instruction "fake". Available instructions: raw, demo, handshake, helpers, placeholders, count.' )
        }) // it wrong instruction to component
    

        
    it ( 'See placeholders', () => {
        let demo = { name: 'Stoyan', age: 30 }
                const myTpl = { 
                          template  : `My name is {{ name }}. Age {{ age }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'debug', 'placeholders' )
                expect ( result ).toBe ( '{{ name }}, {{ age }}' )
        }) // it see placeholders



    it ( 'Get snippets', () => {
        let demo = { name: 'Stoyan', age: 30 }
                const myTpl = { 
                          template  : `My name is {{ name::name }}. Age {{ age:: age }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'snippets', 'demo' )
                expect ( result ).toBe ( 'Stoyan<~>30' )
        }) // it get snippets



    it ( 'Call snippets by name', () => {
            const template = {
                        template:`
                                    <h1>{{title}}</h1>
                                    <p>{{description}}</p>
                                    <div class="contact">
                                            {{ name : setupName : theName }}
                                    </div>
                                    <p>{{ tags : +comma : tagList }}</p>
                            `,
                        helpers: {
                                    setupName : ( {data} ) => `${data.name} ${data.surname}`,
                                    comma : ({data}) =>  data.map ( tag => `<span>${tag}</span>` ).join ( ',' )
                                },
                        handshake: {
                                    title : 'Contacts',
                                    description : 'Contact description text',
                                    name : { name: 'Ivan', surname: 'Petrov' },
                                    tags : ['tag1', 'tag2', 'tag3'],
                                }
                    } // template
  
            const fn = morph.build ( template );
            const result = fn ( 'snippets : theName, tagList', 'demo' );
            expect ( result ).toBe (`Ivan Petrov<~><span>tag1</span>,<span>tag2</span>,<span>tag3</span>`)
        }) // it call snippets by name



    it ( 'Call snippets by indexes', () => {
            const template = {
                        template:`
                                    <h1>{{title}}</h1>
                                    <p>{{description}}</p>
                                    <div class="contact">
                                            {{ name : setupName : theName }}
                                    </div>
                                    <p>{{ tags : +comma : tagList }}</p>
                            `,
                        helpers: {
                                    setupName : ( {data} ) => `${data.name} ${data.surname}`,
                                    comma : ({data}) =>  data.map ( tag => `<span>${tag}</span>` ).join ( ',' )
                                },
                        handshake: {
                                    title : 'Contacts',
                                    description : 'Contact description text',
                                    name : { name: 'Ivan', surname: 'Petrov' },
                                    tags : ['tag1', 'tag2', 'tag3'],
                                }
                    } // template
  
            const fn = morph.build ( template );
            const result = fn ( 'snippets: 2,3', 'demo' );
            expect ( result ).toBe (`Ivan Petrov<~><span>tag1</span>,<span>tag2</span>,<span>tag3</span>`)
            
            // separate results with <~>
            let list = result.split ( '<~>' );
            expect ( list[0] ).toBe ( 'Ivan Petrov' );
            expect ( list[1] ).toBe ( '<span>tag1</span>,<span>tag2</span>,<span>tag3</span>' );
        }) // it call snippets by indexes
    

}) // describe
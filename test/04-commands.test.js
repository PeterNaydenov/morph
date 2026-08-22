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
    

    it ( 'Curry with a single data object', () => {
                const fn = morph.build ({ template: `Hello, {{ name }}!` });
                const curried = fn ( 'curry', { name: 'World' });
                expect ( typeof curried ).toBe ( 'function' )
                expect ( curried ( 'render', {}) ).toBe ( 'Hello, World!' )
        }) // it curry with a single data object



    it ( 'Curry with an array of data - one rendering function per element', () => {
                const fn = morph.build ({ template: `Hello, {{ name }}!` });
                const curried = fn ( 'curry', [{ name: 'Peter' }, { name: 'Ivan' }, { name: 'Stoyan' }]);
                expect ( Array.isArray ( curried )).toBe ( true )
                expect ( curried ).toHaveLength ( 3 )
                // Each function mirrors render() for the corresponding element
                expect ( curried.map ( f => f ( 'render', {}) )).toEqual ([ 'Hello, Peter!', 'Hello, Ivan!', 'Hello, Stoyan!' ])
                // Curried functions are full templates: all commands work.
                // 'raw' shows the curried template - 'Peter' is already baked in.
                expect ( curried[0] ( 'debug', 'raw' )).toBe ( 'Hello, Peter!' )
        }) // it curry with an array of data



    it ( 'Curry with mixed completeness in array data', () => {
                const fn = morph.build ({ template: `Hello, {{ name }}!` });
                const [ full, partial ] = fn ( 'curry', [{ name: 'Peter' }, {}]);
                expect ( full  ( 'render', {}) ).toBe ( 'Hello, Peter!' )
                expect ( partial ( 'render', { name: 'Late' }) ).toBe ( 'Hello, Late!' )
        }) // it curry with mixed completeness



    it ( 'Plain snippets renders all placeholders (pure-snippet template)', () => {
                // A template may contain nothing but snippets - plain 'snippets' shows all of them.
                const fn = morph.build ({ template: `{{a::first}}<~>{{b::second}}`, handshake: { a: '1', b: '2' } });
                expect ( fn ( 'snippets', 'demo' )).toBe ( '1<~>2' )
        }) // it plain snippets renders all



    it ( 'Malformed snippets commands are reported, not silently accepted', () => {
                const fn = morph.build ({ template: `A:{{a::first}} B:{{b::second}}`, handshake: { a: '1', b: '2' } });

                // Typo glued to the command name - not a valid command
                expect ( fn ( 'snippetsXYZ' )).toBe ( 'Error: Wrong command "snippetsXYZ". Available commands: render, debug, snippets, set, curry.' )

                // Missing selection after the colon
                expect ( fn ( 'snippets:' )).toBe ( 'Error: Command "snippets:" requires a comma-separated list of snippet names or indexes.' )

                // Empty name in the selection
                expect ( fn ( 'snippets: first,' )).toBe ( 'Error: Command "snippets" received an empty snippet name. Use a comma-separated list of names or indexes.' )

                // Unknown snippet name
                expect ( fn ( 'snippets: nope' )).toBe ( 'Error: Snippet "nope" does not exist in the template.' )

                // The template itself is untouched by all failed attempts
                expect ( fn ( 'render', { a: '1', b: '2' })).toBe ( 'A:1 B:2' )
        }) // it malformed snippets commands are reported



    it ( 'Snippets selection tolerates spaces and numeric indexes', () => {
                const fn = morph.build ({
                                template : `<h1>{{title}}</h1><p>{{ name : setupName : theName }}</p>`
                              , helpers  : { setupName : ({ data }) => `${data.name} ${data.surname}` }
                              , handshake: { title: 'T', name: { name: 'Ivan', surname: 'Petrov' } }
                            });
                // space before colon
                expect ( fn ( 'snippets : theName', 'demo' )).toBe ( 'Ivan Petrov' )
                // numeric index
                expect ( fn ( 'snippets: 1', 'demo' )).toBe ( 'Ivan Petrov' )
                // mixed indexes ({{title}} has no name, so it is index 0)
                expect ( fn ( 'snippets: 0, 1', 'demo' )).toBe ( 'T<~>Ivan Petrov' )
        }) // it snippets selection tolerates spaces and indexes



}) // describe
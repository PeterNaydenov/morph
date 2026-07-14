import morph from '../src/main.js'
import { describe, it, expect } from 'vitest';



describe ( 'Morph - debug a template function', () => {

    it ( 'Check the raw template', () => {
                const template = morph.build ({
                                            template: 'Hello {{name}}!',
                                            helpers: {},
                                            handshake: { name: 'World' }
                                    });

                const result = template ( 'debug', 'raw' );
                expect ( result ).toBe ( 'Hello {{name}}!' )
        }) // it check the raw template


    
    it ( 'Get a handshake', () => {
                        const template = morph.build ({
                                            template: 'Hello {{name}}!',
                                            helpers: {},
                                            handshake: { name: 'World' }
                                    });

                const result = template ( 'debug', 'handshake' );
                expect ( result ).toEqual ( { name: 'World' } )
        }) // it get a handshake


    it ( 'Check for rendered version', () => {
                        const template = morph.build ({
                                            template: 'Hello {{ name : up }}!',
                                            helpers: { up: ({data}) => data.toUpperCase() },
                                            handshake: { name: 'World' }
                                    });
                        const result = template ( 'debug', 'demo' );
                        expect ( result ).toBe ( 'Hello WORLD!' )
        }) // it check for rendered version



    it ( 'Check available helpers', () => {
                        const template = morph.build ({
                                            template: 'Hello {{name}}!',
                                            helpers: { 
                                                      up   : ({data}) => data.toUpperCase()
                                                    , down : ({data}) => data.toLowerCase() 
                                                },
                                            handshake: { name: 'World' }
                                    });
                        const result = template ( 'debug', 'helpers' );
                        expect ( result ).toBe ( 'up, down' )
        }) // it check available helpers



    it ( 'Check for placeholders', () => {
                     const template = morph.build ({
                                         template: 'Hello {{name : uppercase}}! {{ congrats: list: congrats }}',
                                         helpers: {},
                                         handshake: { name: 'World', congrats: 'Welcome a board.' }
                                 });
                           
                    const result = template ( 'debug', 'placeholders' );
                    expect ( result ).toBe ( '{{name : uppercase}}, {{ congrats: list: congrats }}' )
        }) // it check for placeholders



    it ( 'Check for placeholders', () => {
                    let template = morph.build ({
                                        template: 'Hello {{name}}! {{ congrats: list: congrats }}',
                                        helpers: {},
                                        handshake: { name: 'World', congrats: 'Welcome a board.' }
                                });
                    
                    let result = template ( 'debug', 'count' );
                    expect ( result ).toBe ( 2 )
                    // Let's render the name
                    let tpl = template ( 'curry', { name: 'World'})
                    // Now we have just one placeholder
                    result = tpl ( 'debug', 'count' );
                    expect ( result ).toBe ( 1 )
        }) // it check for placeholders
 
}) // describe
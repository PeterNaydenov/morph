import morph from '../src/main.js'
import { expect } from 'chai';



describe ( 'Morph - debug a template function', () => {

    it ( 'Check the raw template', () => {
                const template = morph.build ({
                                            template: 'Hello {{name}}!',
                                            helpers: {},
                                            handshake: { name: 'World' }
                                    });

                const result = template ( 'debug', 'raw' );
                expect ( result ).to.equal ( 'Hello {{name}}!' )
        }) // it check the raw template


    
    it ( 'Get a handshake', () => {
                        const template = morph.build ({
                                            template: 'Hello {{name}}!',
                                            helpers: {},
                                            handshake: { name: 'World' }
                                    });

                const result = template ( 'debug', 'handshake' );
                expect ( result ).to.be.deep.equal ( { name: 'World' } )
        }) // it get a handshake


    it ( 'Check for rendered version', () => {
                        const template = morph.build ({
                                            template: 'Hello {{ name : up }}!',
                                            helpers: { up: ({data}) => data.toUpperCase() },
                                            handshake: { name: 'World' }
                                    });
                        const result = template ( 'debug', 'demo' );
                        expect ( result ).to.equal ( 'Hello WORLD!' )
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
                        expect ( result ).to.be.equal ( 'up, down' )
        }) // it check available helpers



    it ( 'Check for placeholders', () => {
                     const template = morph.build ({
                                         template: 'Hello {{name : uppercase}}! {{ congrats: list: congrats }}',
                                         helpers: {},
                                         handshake: { name: 'World', congrats: 'Welcome a board.' }
                                 });
                           
                    const result = template ( 'debug', 'placeholders' );
                    expect ( result ).to.be.equal ( '{{name : uppercase}}, {{ congrats: list: congrats }}' )
        }) // it check for placeholders
 
}) // describe
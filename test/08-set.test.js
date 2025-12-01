import morph from '../src/main.js'
import { expect } from 'chai';



describe ( 'Morph - modify template function with command "set"', () => {

    it ( 'Returns a function when called with set command', () => {
                const template = morph.build ({
                                            template: 'Hello {{name}}!',
                                            helpers: {},
                                            handshake: { name: 'World' }
                                    });

                const extensions = { 
                                    helpers: { 
                                            format : ({data}) => data.toUpperCase() 
                                        } 
                            };

                // Note: This helper is not used. Just to test if set() returns a function
                const result = template ( 'set', extensions );
                expect ( typeof result ).to.equal ( 'function' )
        }) // it


    it ( 'New template has merged helpers', () => {
                const template = morph.build({
                                            template: 'Hello {{ name : format}}!',
                                            helpers: { format: ({data}) => data.toLowerCase() },
                                            handshake: { name: 'World' }
                                    })

                let result = template('render', { name: 'test' });
                expect ( result ).to.equal('Hello test!');

                const extensions = { helpers: { format: ({data}) => data.toUpperCase() } };
                const newTemplate = template('set', extensions);

                result = newTemplate('render', { name: 'test' });
                expect(result).to.equal('Hello TEST!');
        }) // it 



    it ( 'New template has merged handshake', () => {
                const template = morph.build({
                                            template: 'Hello {{name}}!',
                                            helpers: {},
                                            handshake: { name: 'World' }
                                    });

                const extensions = { handshake: { greeting: 'Hi' } };
                const extensions2 = { handshake: { name: 'test' } };
                
                let result = template ( 'render', 'demo' );
                expect ( result ).to.equal ( 'Hello World!' )
                
                // handshake merged, but demo uses original name. 'greeting' is not used
                result = template ( 'set', extensions )('render', 'demo' );
                expect ( result ).to.equal ( 'Hello World!' )
                // handshake is merged and name is overwritten.
                result = template ( 'set', extensions2 )('render', 'demo' )
                expect ( result ).to.equal ( 'Hello test!' )
        }) // it


    it ( 'Replaces placeholders by position', () => {
                const template = morph.build({
                                        template: 'Hello {{ name }}!',
                                        helpers: {},
                                        handshake: { name: 'World' }
                                    })

                // Number of placeholder is position of the placehilder in placeholders list. 
                // Other parts of the template are can not be changed
                const extensions = { placeholders: { 0: '{{ greeting }}' } };
                const result = template ( 'set', extensions )( 'render', { greeting: 'Hi' })
                // Placeholder was replaced with {{ greeting }}
                expect ( result ).to.equal ( 'Hello Hi!' )
        }) // it


    it ( 'Replaces placeholders by name', () => {
                const template = morph.build ({
                                        template: 'Hello {{ name : format : name }}!',
                                        helpers: { 
                                                format : ({ data }) => data.toLowerCase() 
                                            },
                                        handshake: { name: 'World' }
                                    })

                const extensions = { 
                        placeholders: { 
                                'name': '{{ greeting : format : name }}' 
                            }, 
                        helpers: { 
                                format : ({ data }) => data.toUpperCase () 
                            }
                    };

                let result = template ( 'set', extensions )('render', { greeting: 'hi' })
                expect(result).to.equal('Hello HI!');
        }) // it


    
    it ( 'Define an empty placeholder', () => {
                const template = morph.build ({
                                        template: 'Hello {{}}!',
                                        helpers: {},
                                        handshake: {}
                                    })

                const extensions = { 
                            placeholders: { 
                                        0 : '{{ greeting : format }}' 
                                    }, 
                            helpers : {
                                        format : ({data}) => data.toUpperCase ()
                                    }
                        };
                const result = template ( 'set', extensions )('render', { greeting: 'hi' })
                expect ( result ).to.equal ( 'Hello HI!' )
        }) // it Define an empty placeholder



    it ( 'Create a template with no helpers', () => {
                const template = morph.build ({
                                        template: 'Hello {{ name : format }}!',
                                        helpers: {},
                                        handshake: { name: 'World' }
                                    })
                const extensions = {
                             helpers : {
                                        format : ({data}) => data.toUpperCase ()
                                }
                        }
                const result = template ( 'set', extensions )('render', { name: 'test' })
                expect ( result ).to.equal ( 'Hello TEST!' )
        }) // it Create a template with no helpers



    it ( 'Render a template with missing helper', () => {
                const template = morph.build ({
                                        template: 'Hello {{ name : format }}!',
                                        helpers: {},
                                        handshake: { name: 'World' }
                                    })
                const result = template ( 'render', { name: 'test' })
                expect ( result ).to.equal ( `Hello {{ Error: Helper 'format' is not available}}!` )
        }) // it Create a template with no helpers


    
}) // describe



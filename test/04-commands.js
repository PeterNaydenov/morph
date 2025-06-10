import morph from '../src/main.js'
import { expect } from 'chai'



describe ( 'morph: commands', () => {



    it ( 'Request a template', () => {
                // Command 'raw'
                const myTpl = { template : `My name is {{ name }}.` };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'debug' ,'raw')
                expect ( result ).to.be.equal ( 'My name is {{ name }}.' )
        }) // it request a template



    it ( 'Request a handshake', () => {
                let demo = { name: 'Stoyan' }
                const myTpl = { 
                        template : `My name is {{ name }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'debug', 'handshake' )
                expect ( result ).to.be.deep.equal ( demo )
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
                expect ( result ).to.be.equal ( 'My name is Stoyan.' )
    }) // it request a demo



    
    it ( 'Wrong instruction to component', () => {
        // Commands other than 'raw', 'handshake' and 'demo' should return an error.
                let demo = { name: 'Stoyan' }
                const myTpl = { 
                          template  : `My name is {{ name }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'debug', 'fake' )
                expect ( result ).to.be.equal ( 'Error: Wrong instruction "fake". Available commands: raw, demo, handshake, placeholders.' )
        }) // it wrong command to component
    
    
    it ( 'See placeholders', () => {
        let demo = { name: 'Stoyan', age: 30 }
                const myTpl = { 
                          template  : `My name is {{ name }}. Age {{ age }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'debug', 'placeholders' )
                expect ( result ).to.be.equal ( '{{ name }}, {{ age }}' )
        }) // it see placeholders



    it ( 'Get snippets', () => {
        let demo = { name: 'Stoyan', age: 30 }
                const myTpl = { 
                          template  : `My name is {{ name::name }}. Age {{ age:: age }}.` 
                        , handshake : demo
                    };
                morph.add ( ['myName'], myTpl );
                const result = morph.get ( ['myName'] )( 'snippets', 'demo' )
                expect ( result ).to.be.equal ( 'Stoyan<~>30' )
        }) // it get snippets
    

}) // describe
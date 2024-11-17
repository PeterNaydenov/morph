import morph from '../src/main.js'
import { expect } from 'chai'


describe ( 'morph: storage', () => {



    it ( 'Add template to default storage', () => {
            const myTpl = {
                            template : `My name is {{ name }}.`
                    };
            morph.add ( 'myTpl', morph.build ( myTpl ) );
            const result = morph.get ( 'myTpl' )({ name: 'Peter' })
            expect ( result ).to.be.equal ( 'My name is Peter.' )
        })



    it ( 'Add template definition to default storage', () => {
            morph.clear ()
            const myTpl = {
                            template : `My name is {{ name }}.`
                    };
                    // Can we check if the template is already in the storage?
            morph.add ( 'myName', myTpl );
            const result = morph.get ( 'myName' )({ name: 'Peter' })
            expect ( result ).to.be.equal ( 'My name is Peter.' )
        })



    it ( 'Wrong template description', () => {
        // 
            morph.clear ()
            console.error = ( str ) => {   // Override console.error to avoid console output
                    expect ( str ).to.be.equal ( 'Error: Template "fake" looks broken and is not added to storage.' )
                }
            const fakeTpl = { a: 12, b: 'Hello' };
            morph.add ( 'fake', fakeTpl );
        }) // it wrong template description



    it ( 'Add component to default storage', () => {
            morph.clear ()
            const myTpl = { template: `My name is {{ name }}.` };
            const myTplFn = morph.build ( myTpl );
            morph.add ( 'myTpl', myTplFn );
            const result = morph.get ( 'myTpl' )({ name: 'Peter' })
            expect ( result ).to.be.equal ( 'My name is Peter.' )
       }) // it add component to default storage



    it ( 'Add template definition to custom storage', () => {
        // Using a custom named storage if preffer to organize templates somehow
            morph.clear () // Clear the storage from previous tests
            const myTpl = { template: `My name is {{ name }}.` };
            morph.add ( 'myName', myTpl, 'hidden' ); // Provide a custom storage name as 3rd argument

            let result = morph.get ('myName')({ name: 'Peter' });
            // result of morph.get() is a function that returns a error.
            // Error will popup as a rendering result
            
            expect ( result ).to.be.equal ( 'Error: Template "myName" does not exist in storage "default".' )
            result = morph.get ('myName', 'hidden')({ name: 'Peter' })
            expect ( result ).to.be.equal ( 'My name is Peter.' )

            let list = morph.list ();
            expect ( list ).to.have.length ( 0 )

            list = morph.list ('hidden');
            expect ( list ).to.have.length ( 1 )
            expect ( list[0] ).to.be.equal ( 'myName' )
       }) // it add template definition to custom storage

}) // describe
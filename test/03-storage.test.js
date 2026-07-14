import morph from '../src/main.js'
import { describe, it, expect } from 'vitest'


describe ( 'morph: storage', () => {



    it ( 'Add template to default storage', () => {
            const myTpl = {
                            template : `My name is {{ name }}.`
                    };
            morph.add ( ['myTpl'], morph.build ( myTpl ) );
            const result = morph.get (['myTpl'])('render', { name: 'Peter' })
            expect ( result ).toBe ( 'My name is Peter.' )
        })



    it ( 'Add template definition to default storage', () => {
            morph.clear ()
            const myTpl = {
                            template : `My name is {{ name }}.`
                    };
                    // Can we check if the template is already in the storage?
            morph.add ( ['myName'], myTpl );
            const result = morph.get (['myName'])( 'render', { name: 'Peter' })
            expect ( result ).toBe ( 'My name is Peter.' )
        })



    it ( 'Wrong template description', () => {
        // 
            morph.clear ()
            console.error = ( str ) => {   // Override console.error to avoid console output
                    expect ( str ).toBe ( 'Error: Template "fake" looks broken and is not added to storage.' )
                }
            const fakeTpl = { a: 12, b: 'Hello' };
            morph.add ( ['fake'], fakeTpl );
        }) // it wrong template description



    it ( 'Add component to default storage', () => {
            morph.clear ()
            const myTpl = { template: `My name is {{ name }}.` };
            const myTplFn = morph.build ( myTpl );
            morph.add ( ['myTpl'], myTplFn );
            const result = morph.get ( ['myTpl'] )('render',  { name: 'Peter' })
            expect ( result ).toBe ( 'My name is Peter.' )
       }) // it add component to default storage



    it ( 'Add template definition to custom storage', () => {
        // Using a custom named storage if preffer to organize templates somehow
            morph.clear () // Clear the storage from previous tests
            const myTpl = { template: `My name is {{ name }}.` };
            morph.add ( ['myName', 'hidden'], myTpl ); // Provide a custom storage name as 3rd argument

            let result = ( typeof morph.get (['myName']) === 'function' ) 
                                        ? morph.get (['myName'])( 'render', { name: 'Peter' }) 
                                        : morph.get (['myName'])
            // result of morph.get() is a function that returns a error.
            // Error will popup as a rendering result
            
            expect ( result ).toBe ( 'Error: Template "myName" does not exist in storage "default".' )
            result = morph.get (['myName', 'hidden'])( 'render', { name: 'Peter' })
            
            expect ( result ).toBe ( 'My name is Peter.' )

            let list = morph.list ();
            expect ( list ).toHaveLength ( 0 )

            list = morph.list (['hidden']);
            expect ( list ).toHaveLength ( 1 )
            expect ( list[0] ).toBe ( 'myName' )
       }) // it add template definition to custom storage



    it ( 'Remove component from storage', () => {
            morph.clear ()
            const myTpl = { template: `My name is {{ name }}.` };
            morph.add ( ['myTpl'], myTpl );
            const list = morph.list ();
            expect ( list ).toHaveLength ( 1 )
            morph.remove ( ['myTpl'] );
            const result = morph.list ();
            expect ( result ).toHaveLength ( 0 )
        }) // it remove component from storage


    it ( 'Try to get non existing storage/template', () => {
            morph.clear ()
            const fn = morph.get ( ['myTpl', 'extraStorage'] );
            expect ( fn() ).toBe ( 'Error: Storage "extraStorage" does not exist.' )
            const fn2 = morph.get ( ['myTpl'] );
            expect ( fn2() ).toBe ( 'Error: Template "myTpl" does not exist in storage "default".' )
        }) // it try to get non existing storage/template



    it ( 'Remove from storage component that does not exist', () => {
            morph.clear ()
            let result = morph.remove ( ['myTpl', 'extraStorage'] );
            expect ( result ).toBe ( 'Error: Storage "extraStorage" does not exist.' )
            let result2 = morph.remove ( ['myTpl'] )
            expect ( result2 ).toBe ( 'Error: Template "myTpl" does not exist in storage "default".' )
        }) // it remove from storage component that does not exist



    it ( 'list a non existing storage', () => {
            morph.clear ()
            const list = morph.list ( ['extraStorage'] );
            expect ( list ).toHaveLength ( 0 )
        })

}) // describe
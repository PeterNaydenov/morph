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



    it ( 'Remove component from storage with a plain string (shorthand)', () => {
            morph.clear ()
            const myTpl = { template: `My name is {{ name }}.` };
            morph.add ( ['myTpl'], myTpl );
            expect ( morph.list () ).toHaveLength ( 1 )
            morph.remove ( 'myTpl' );   // string -> 'default' storage
            expect ( morph.list () ).toHaveLength ( 0 )
        }) // it remove component from storage with string shorthand



    it ( 'Remove reports when target does not exist or argument is wrong', () => {
            morph.clear ()
            const myTpl = { template: `My name is {{ name }}.` };
            morph.add ( ['myTpl'], myTpl );

            // Unknown storage
            expect ( morph.remove ( ['myTpl', 'extraStorage'] ) )
                .toBe ( 'Error: Storage "extraStorage" does not exist.' )
            expect ( morph.list () ).toHaveLength ( 1 )

            // Unknown template in default storage - array and string form
            expect ( morph.remove ( ['nope'] ) )
                .toBe ( 'Error: Template "nope" does not exist in storage "default".' )
            expect ( morph.remove ( 'nope' ) )
                .toBe ( 'Error: Template "nope" does not exist in storage "default".' )
            expect ( morph.list () ).toHaveLength ( 1 )

            // Wrong argument type
            expect ( morph.remove ( 42 ) )
                .toBe ( 'Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].' )

            // The real template is still removable after all failures
            morph.remove ( ['myTpl'] )
            expect ( morph.list () ).toHaveLength ( 0 )
        }) // it remove reports missing target



    it ( 'list a non existing storage', () => {
            morph.clear ()
            const list = morph.list ( ['extraStorage'] );
            expect ( list ).toHaveLength ( 0 )
        })


    it ( 'String shorthand works for add/get/remove (default storage)', () => {
            morph.clear ()
            const myTpl = { template: `My name is {{ name }}.` };

            // write with a string
            morph.add ( 'shorthandTpl', myTpl );
            expect ( morph.list () ).toEqual ([ 'shorthandTpl' ])

            // read with a string
            const result = morph.get ( 'shorthandTpl' )( 'render', { name: 'Peter' });
            expect ( result ).toBe ( 'My name is Peter.' )

            // remove with a string
            expect ( morph.remove ( 'shorthandTpl' )).toBeUndefined ()
            expect ( morph.list () ).toEqual ([])

            // get() with a missing template via string still returns an error function
            const err = morph.get ( 'nope' )
            expect ( typeof err ).toBe ( 'function' )
            expect ( err() ).toBe ( 'Error: Template "nope" does not exist in storage "default".' )
        }) // it string shorthand works


    it ( 'Error functions from get() carry an isError marker; real templates do not', () => {
            morph.clear ()
            morph.add ( ['real'], { template: `Hi {{ name }}.` });

            // Real template - no marker
            expect ( morph.get ('real').isError ).toBeUndefined ()

            // Missing template
            const miss = morph.get ( 'nope' )
            expect ( miss.isError ).toBe ( true )
            expect ( miss() ).toBe ( 'Error: Template "nope" does not exist in storage "default".' )

            // Missing storage
            const noStorage = morph.get ( ['real', 'extraStorage'] )
            expect ( noStorage.isError ).toBe ( true )
            expect ( noStorage() ).toBe ( 'Error: Storage "extraStorage" does not exist.' )

            // Invalid location type
            const badArg = morph.get ( 42 )
            expect ( badArg.isError ).toBe ( true )
            expect ( badArg() ).toBe ( 'Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].' )
        }) // it error functions carry isError marker


    it ( 'Wrong argument type to add/get is reported', () => {
            morph.clear ()
            const captured = []
            const originalError = console.error
            console.error = ( str ) => captured.push ( str )   // Override console.error to avoid console output
            try {
                    morph.add ( 42, { template: 'X' });
                    expect ( captured ).toEqual ([ 'Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].' ])
                    expect ( morph.get ( 42 )() )
                        .toBe ( 'Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].' )
                }
            finally { console.error = originalError }
        }) // it wrong argument type is reported

}) // describe
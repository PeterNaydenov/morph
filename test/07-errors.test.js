import morph from '../src/main.js'
import { describe, it, expect } from 'vitest'



describe ( 'morph: Error messages', () => {



it ( 'Get component with argument string (shorthand)', () => {
            morph.clear ()
            const template = { template: `My name is {{ name }}.` };
            morph.add ( ['myName'], template );
            // A plain string is valid shorthand for ['name'] in the 'default' storage.
            const result = morph.get ( 'myName' )( 'render', { name: 'Peter' })
            expect ( result ).toBe ( 'My name is Peter.' )
    }) // it get component with argument string



it ( 'Get a non existing component', () => {
            morph.clear ()
            const template = { template: `My name is {{ name }}.` };
            morph.add ( ['myName', 'ale'], template );
            const result = morph.get ( ['myName'] )('render', { name: 'Peter' })
            expect ( result ).toBe ( 'Error: Template "myName" does not exist in storage "default".' )
    }) // it get a non existing component


it ( 'Add component - null', () => {
            let triggered = false;
            morph.clear ()
            console.warn = function (str) {
                    expect ( str ).toBe ( 'Warning: Template default/myName is not added to storage. The template is null.' )
                    triggered = true
                }
            const template = null;
            morph.add ( ['myName'], template );
            expect ( triggered ).toBe ( true )
            const result = morph.get ( ['myName'] )('render', { name: 'Peter' })
            expect ( result ).toBe ( 'Error: Template "myName" does not exist in storage "default".' )
    }) // it add component - null



    // Regression: a non-string non-array location used to give a misleading
    // "is a string" error. Now the message is generic for any invalid input.
    it ( 'Get component with object argument returns generic error', () => {
            morph.clear ()
            morph.add ( ['myName'], { template: 'Hi {{name}}' });
            const result = morph.get ( { name: 'myName' } )('render', { name: 'Peter' })
            expect ( result ).toBe ( 'Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].' )
    }) // it get component with object argument

    it ( 'Get component with number argument returns generic error', () => {
            morph.clear ()
            const result = morph.get ( 42 )({ name: 'Peter' })
            expect ( result ).toBe ( 'Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].' )
    }) // it get component with number argument



    // History: add() once silently accepted a string and placed the template at
    // a wrong name/storage via character destructuring (e.g. add('myTemplate', ...)
    // stored as 'm' in 'y'). Strings are now valid shorthand for the 'default'
    // storage, while other invalid types log an error and store nothing.
    it ( 'Add component with wrong location type logs an error and stores nothing', () => {
            morph.clear ()
            let triggered = false;
            let captured = null;
            const originalError = console.error;
            console.error = function (str) {
                    captured = str;
                    triggered = true;
                }
            morph.add ( 42, { template: 'Hi {{name}}' });
            console.error = originalError;

            expect ( triggered ).toBe ( true )
            expect ( captured ).toBe ( 'Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].' )

            // Nothing should have been stored - template must not be reachable.
            const result = morph.get ( ['myTemplate'] )('render', { name: 'Peter' })
            expect ( result ).toBe ( 'Error: Template "myTemplate" does not exist in storage "default".' )
    }) // it add component with wrong location type



}) // describe
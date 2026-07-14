import morph from '../src/main.js'
import { expect } from 'chai'



describe ( 'morph: Error messages', () => {



it ( 'Get component with argument string', () => {
            morph.clear ()
            const template = { template: `My name is {{ name }}.` };
            morph.add ( ['myName'], template );
            const result = morph.get ( 'myName' )({ name: 'Peter' }) // Argument for 'get' should be an array of strings.
            expect ( result ).to.be.equal ( 'Error: Argument "location" must be an array. E.g. ["templateName", "storageName"].' )
    }) // it get component with argument string



it ( 'Get a non existing component', () => {
            morph.clear ()
            const template = { template: `My name is {{ name }}.` };
            morph.add ( ['myName', 'ale'], template );
            const result = morph.get ( ['myName'] )('render', { name: 'Peter' })
            expect ( result ).to.be.equal ( 'Error: Template "myName" does not exist in storage "default".' )
    }) // it get a non existing component


it ( 'Add component - null', () => {
            let triggered = false;
            morph.clear ()
            console.warn = function (str) {
                    expect ( str ).to.be.equal ( 'Warning: Template default/myName is not added to storage. The template is null.' )
                    triggered = true
                }
            const template = null;
            morph.add ( ['myName'], template );
            expect ( triggered ).to.be.equal ( true )
            const result = morph.get ( ['myName'] )('render', { name: 'Peter' })
            expect ( result ).to.be.equal ( 'Error: Template "myName" does not exist in storage "default".' )
    }) // it add component - null



    // Regression: a non-string non-array location used to give a misleading
    // "is a string" error. Now the message is generic for any non-array input.
    it ( 'Get component with object argument returns generic error', () => {
            morph.clear ()
            morph.add ( ['myName'], { template: 'Hi {{name}}' });
            const result = morph.get ( { name: 'myName' } )('render', { name: 'Peter' })
            expect ( result ).to.be.equal ( 'Error: Argument "location" must be an array. E.g. ["templateName", "storageName"].' )
    }) // it get component with object argument

    it ( 'Get component with number argument returns generic error', () => {
            morph.clear ()
            const result = morph.get ( 42 )({ name: 'Peter' })
            expect ( result ).to.be.equal ( 'Error: Argument "location" must be an array. E.g. ["templateName", "storageName"].' )
    }) // it get component with number argument



    // Regression: add() used to silently accept a string and place the template
    // at a wrong name/storage (e.g. add('myTemplate', ...) stored as 'm' in 'y').
    // Now it logs an error and stores nothing.
    it ( 'Add component with string location logs an error and stores nothing', () => {
            morph.clear ()
            let triggered = false;
            let captured = null;
            const originalError = console.error;
            console.error = function (str) {
                    captured = str;
                    triggered = true;
                }
            morph.add ( 'myTemplate', { template: 'Hi {{name}}' });
            console.error = originalError;

            expect ( triggered ).to.be.equal ( true )
            expect ( captured ).to.be.equal ( 'Error: Argument "location" must be an array. E.g. ["templateName", "storageName"].' )

            // Nothing should have been stored - 'myTemplate' must not be reachable.
            const result = morph.get ( ['myTemplate'] )('render', { name: 'Peter' })
            expect ( result ).to.be.equal ( 'Error: Template "myTemplate" does not exist in storage "default".' )
    }) // it add component with string location



}) // describe
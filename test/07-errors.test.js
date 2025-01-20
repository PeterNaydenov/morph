import morph from '../src/main.js'
import { expect } from 'chai'



describe ( 'morph: Error messages', () => {



it ( 'Get component with argument string', () => {
            morph.clear ()
            const template = { template: `My name is {{ name }}.` };
            morph.add ( ['myName'], template );
            const result = morph.get ( 'myName' )({ name: 'Peter' }) // Argument for 'get' should be an array of strings.
            expect ( result ).to.be.equal ( 'Error: Argument "location" is a string. Should be an array. E.g. ["templateName", "storageName"].' )
    }) // it get component with argument string



it ( 'Get a non existing component', () => {
            morph.clear ()
            const template = { template: `My name is {{ name }}.` };
            morph.add ( ['myName', 'ale'], template );
            const result = morph.get ( ['myName'] )({ name: 'Peter' }) 
            expect ( result ).to.be.equal ( 'Error: Template "myName" does not exist in storage "default".' )
    }) // it get a non existing component



}) // describe
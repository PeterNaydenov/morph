import morph from '../src/main.js'
import { expect } from 'chai'


describe.only ( 'morph: storage', () => {

    it ( 'Add template to default storage', () => {
            const myTpl = {
                            template : `My name is {{ name }}.`
                    };
            morph.add ( 'myTpl', morph.build ( myTpl ) );
            const result = morph.get ( 'myTpl' )({ name: 'Peter' })
            console.log ( result )
            expect ( result ).to.be.equal ( 'My name is Peter.' )
        })



    it ( 'Try to add template definition to default storage', () => {
            const myTpl = {
                            template : `My name is {{ name }}.`
                    };
                    // TODO: continue here...
                    // Can we check if the template is already in the storage?
                    // Can we check if myTpl is a function?
                    // Try to build the template if it is not a function
            morph.add ( 'myTpl', myTpl );
            const result = morph.get ( 'myTpl' )({ name: 'Peter' })
            console.log ( result )
            // expect ( result ).to.be.equal ( 'My name is Peter.' )
        })

}) // describe
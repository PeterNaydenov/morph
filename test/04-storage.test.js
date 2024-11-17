import morph from '../src/main.js'
import { expect } from 'chai'


describe.only ( 'morph: storage', () => {



    it ( 'Add template to default storage', () => {
            const myTpl = {
                            template : `My name is {{ name }}.`
                    };
            morph.add ( 'myTpl', morph.build ( myTpl ) );
            const result = morph.get ( 'myTpl' )({ name: 'Peter' })
            expect ( result ).to.be.equal ( 'My name is Peter.' )
        })



    it ( 'Add template definition to default storage', () => {
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
            console.error = ( str ) => {   // Override console.error to avoid console output
                    expect ( str ).to.be.equal ( 'Error: Template "fake" looks broken and is not added to storage.' )
                }
            const fakeTpl = { a: 12, b: 'Hello' };
            morph.add ( 'fake', fakeTpl );
        }) // it wrong template description



    it ( 'Add component to default storage', () => {
            const myTpl = { template: `My name is {{ name }}.` };
            const myTplFn = morph.build ( myTpl );
            morph.add ( 'myTpl', myTplFn );
            const result = morph.get ( 'myTpl' )({ name: 'Peter' })
            expect ( result ).to.be.equal ( 'My name is Peter.' )
       }) // it add component to default storage

}) // describe
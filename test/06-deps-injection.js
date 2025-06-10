import morph from '../src/main.js'
import { expect } from 'chai'



describe ( 'morph: Dependencies injection', () => {

it ( 'During definition of template', () => {
        function external () {
                    return 'Peter'
            }

        const myTpl = {
                    template: `My name is {{ : hello }}.`
                    , helpers: { 
                            hello: external
                        }
                }
        let fn =morph.build ( myTpl )
        let result = fn ()
        expect ( result ).to.be.equal ( 'My name is Peter.' )
}) // it During definition of template



it ('During build()' , () => {
        function external () {
                return 'Peter'
            }

        const myTpl = {
                    template: `My name is {{ : hello }}.`
                    , helpers: { 
                            hello: ({ data, dependencies }) => dependencies.ex()
                        }
                }
        let fn =morph.build ( myTpl, false, { ex : external })
        let result = fn ()
        expect ( result ).to.be.equal ( 'My name is Peter.' )
}) // it During build



it ( 'During add()', () => {    
            function external () {
                    return 'Peter'
                }

            const myTpl = {
                        template: `My name is {{ : hello }}.`
                        , helpers: { 
                                hello: ({ data, dependencies:deps }) => deps.ex()
                            }
                    }
            morph.add ( ['name'], myTpl, { ex : external })
            let result = morph.get (['name'])()
            expect ( result ).to.be.equal ( 'My name is Peter.' )
}) // it During add



it ( 'During render()', () => {
            function external () {
                    return 'Peter'
                }

            const myTpl = {
                        template: `My name is {{ : hello }}.`
                        , helpers: { 
                                hello: ({ data, dependencies:deps }) => deps.ex()
                            }
                    }
            morph.add ( ['name'], myTpl)
            let result = morph.get (['name'])('render', {}, { ex : external })
            expect ( result ).to.be.equal ( 'My name is Peter.' )
    }) // it During render



it ( 'Mixed version - building and rendering', () => {
            function peter () {
                    return 'Peter'
                }

            function ivan () {
                    return 'Ivan'
                }

            const myTpl = {
                        template: `My name is {{ : hello }}.`
                        , helpers: { 
                                hello: ({ dependencies: deps }) => {
                                            expect ( deps ).has.property ( 'ex' )
                                            return deps.sec ()
                                        }
                            }
                    }
            morph.add ( ['name'], myTpl, { ex : peter })
            // Note: If deps on add() and on render() have same names, render() has higher priority
            let result = morph.get (['name'])('render', {}, { sec: ivan })
            expect ( result ).to.be.equal ( 'My name is Ivan.' )
    }) // it Mixed version - building and rendering



it ( 'Overwriting dependencies', () => {
            function peter () {
                                return 'Peter'
                            }

            function ivan () {
                    return 'Ivan'
                }

            const myTpl = {
                        template: `My name is {{ : hello }}.`
                        , helpers: { 
                                hello: ({ dependencies: deps }) => {
                                            expect ( deps ).has.property ( 'ex' )
                                            return deps.sec ()
                                        }
                            }
                    }
            morph.add ( ['name'], myTpl, { ex : peter })
            // Note: If deps on add() and on render() have same names, render() has higher priority
            let result = morph.get (['name'])('render', {}, { sec: ivan })
            expect ( result ).to.be.equal ( 'My name is Ivan.' )
}) // it Overwriting dependencies



it ( 'As a data', () => {
        function externalFn () {
                        return 'Peter'
                }

        const myTpl = {
                    template: `My name is {{ h }}.`
                }
        morph.add ( ['name'], myTpl )
        // If data property is a function, it is called, and the result is used
        let result = morph.get (['name'])('render', { h : externalFn })
        expect ( result ).to.be.equal ( 'My name is Peter.' )
}) // it As a data



it ( 'As a data 2', () => {
        function external () {
                return 'Peter'
            }

        const myTpl = {
                    template: `My name is {{ h }}.`
                }
        morph.add ( ['name'], myTpl )
        // If data property is a function, it is called, and the result is used
        let result = morph.get (['name'])('render', { h : external })
        expect ( result ).to.be.equal ( 'My name is Peter.' )
}) // it As a data 2



}) // describe



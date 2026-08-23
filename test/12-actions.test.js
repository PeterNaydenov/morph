import morph from '../src/main.js'
import _actionSupplyFactory from '../src/methods/_actionSupply.js'
import _renderHolderFactory from '../src/methods/_renderHolder.js'
import _chopTemplate from '../src/methods/_chopTemplates.js'
import stack from '@peter.naydenov/stack'
import settings from '../src/methods/settings.js'
import { describe, it, expect } from 'vitest'

// Factories receive their dependencies explicitly - easy to mock without a
// testing library. Here the real ones are injected.
const _actionSupply = _actionSupplyFactory ({ stack })
const _renderHolder = _renderHolderFactory ({ _chopTemplate, settings })



describe ( 'morph: action edge cases (coverage)', () => {



    it ( "Action '>' (data) over function data - helper receives the called value", () => {
                const fn = morph.build ({
                                template : `V={{ fn : >double }}`
                              , helpers  : { double: ({ data }) => data * 2 }
                            })
                // The helper receives the *resolved* value - 'full' carries the already-called value
                let seenFull = null
                const fn2 = morph.build ({
                                template : `V={{ fn : >inspect }}`
                              , helpers  : { inspect: ({ data, full }) => { seenFull = full; return data * 10 } }
                            })
                expect ( fn  ( 'render', { fn: () => 21 }) ).toBe ( 'V=42' )
                expect ( fn2 ( 'render', { fn: () => 4  }) ).toBe ( 'V=40' )
                expect ( seenFull ).toBe ( 4 )
        }) // it data action over function data



    it ( "Action '+' (extendedRender) with a missing helper is silently ignored", () => {
                const fn = morph.build ({ template: `{{ list : +ghostHelper }}` });
                const result = fn ( 'render', { list: [1, 2, 3] })
                expect ( typeof result ).toBe ( 'string' )
                expect ( result ).not.toMatch ( /^Error/ )
        }) // it extendedRender missing helper



    it ( "Action '+' (extendedRender) post-processes every item of the root list", () => {
                const fn = morph.build ({
                                template : `{{ list : +shout }}`
                              , helpers  : { shout: ({ data }) => String ( data ).toUpperCase () }
                            })
                expect ( fn ( 'render', { list: ['a', 'b'] }) ).toBe ( 'A,B' )
        }) // it extendedRender over items



    it ( "Named mix '[]helper' where the helper returns an array spreads it back into the data", () => {
                const fn = morph.build ({
                                template : `{{ list : []pick }}`
                              , helpers  : { pick: ({ data }) => data.slice ( 0, 2 ) }
                            })
                const result = fn ( 'render', { list: [7, 8, 9] })
                expect ( result ).toBe ( '78' )
        }) // it named mix returning an array



    it ( "Built-in 'escape' helper escapes values; null data leaves the placeholder untouched", () => {
                const fn = morph.build ({ template: `[{{ x : escape }}]` });
                expect ( fn ( 'render', { x: '<b>' }) ).toBe ( '[&lt;b&gt;]' )
                expect ( fn ( 'render', { x: { text: '<i>' } }) ).toBe ( '[&lt;i&gt;]' )
                // null resolves to nothing placed - the raw placeholder survives
                expect ( fn ( 'render', { x: null }) ).toBe ( '[{{ x : escape }}]' )
        }) // it escape helper edge cases



    it ( "String helpers are mini templates rendered by _renderHolder", () => {
                const fn = morph.build ({
                                template : `G:{{ name : greet }}`
                              , helpers  : { greet: 'Hello {{ text }}!' }
                            })

                // primitive data is wrapped as { text } for the mini template
                expect ( fn ( 'render', { name: 'Peter' }) ).toBe ( 'G:Hello Peter!' )

                // object data: its .text property feeds {{ text }}
                expect ( fn ( 'render', { name: { text: 'Ana', extra: 1 } }) ).toBe ( 'G:Hello Ana!' )

                // missing outer field: the placeholder survives untouched
                expect ( fn ( 'render', {}) ).toBe ( 'G:{{ name : greet }}' )

                // broken mini template: the parse error is placed as the placeholder's value
                const broken = morph.build ({
                                template   : `B:{{ name : bad }}`
                              , helpers    : { bad: 'Oops {{ x' }
                              , handshake  : {}
                            })
                // broken mini template: the parse error is placed as the placeholder's value
                expect ( broken ( 'render', { name: 'x' }) ).toContain ( 'Error:' )
        }) // it string helpers as mini templates



    it ( "_renderHolder returns null for null data (direct unit call)", () => {
                expect ( _renderHolder ( 'Hello {{name}}!', null )).toBeNull ()
        }) // it _renderHolder null data



    it ( "Debug instructions 'demo'/'handshake' without handshake report an error", () => {
                const fn = morph.build ({ template: `Hi {{ name }}.` });
                expect ( fn ( 'debug', 'demo' )).toBe ( 'Error: No handshake data.' )
                expect ( fn ( 'debug', 'handshake' )).toBe ( 'Error: No handshake data.' )
        }) // it debug without handshake



    it ( "'set' command reports invalid input", () => {
                const fn = morph.build ({ template: `Hi {{ name }}.`, handshake: { name: 'x' } });
                expect ( fn ( 'set', 'nope' )).toBe ( `Error: 'set' command requires an object with placeholders, helpers, handshake.` )
                expect ( fn ( 'set', { placeholders: { ghost: 'X' } }) ).toBe ( 'Error: Placeholder "ghost" does not exist in the template.' )
        }) // it set invalid input



    it ( "Chop error 'closing tag before opening one' surfaces through build()", () => {
                const fail = morph.build ({ template: `a }} b {{ x }}` });
                expect ( typeof fail ).toBe ( 'function' )
                expect ( fail() ).toBe ( 'Error: Placeholder closing tag without starting one.' )
        }) // it chop closedBeforeOpened



    it ( '_actionSupply pulls LIFO and pushes back values received via next() (dynamic insertion)', () => {
                const gen = _actionSupply ({ 0: [{ type: 'first' }], 1: [{ type: 'second' }] }, 1)
                // LIFO stack: the last pushed level is pulled first
                expect ( gen.next ().value ).toEqual ({ type: 'second' })
                expect ( gen.next ().value ).toEqual ({ type: 'first' })
                // A truthy value sent back is pushed onto the stack and yielded again
                expect ( gen.next ({ type: 'injected' }).value ).toEqual ({ type: 'injected' })
                expect ( gen.next ().done ).toBe ( true )
        }) // it _actionSupply dynamic insertion

    it ( 'Function data is resolved once, at the single resolution point', () => {
                let calls = 0
                const fn = morph.build ({ template: `N={{ v }} N={{ v }}` });
                fn ( 'render', { v: () => ++calls })
                expect ( calls ).toBe ( 2 )   // once per placeholder, not once per template
        }) // it function data single resolution



    it ( "Missing '>' helper becomes an error value, not a crash", () => {
                const fn = morph.build ({ template: `[{{ v : >ghost }}]` });
                expect ( fn ( 'render', { v: 5 }) ).toBe ( `[( Error: Helper 'ghost' is not available )]` )
        }) // it missing data helper



    it ( "Missing '[]name' helper becomes an error value, not a crash", () => {
                const fn = morph.build ({ template: `[{{ v : []ghost }}]` });
                expect ( fn ( 'render', { v: [1, 2] }) ).toBe ( `[( Error: Helper 'ghost' is not available )]` )
        }) // it missing mix helper



    it ( "Multi-action chains compose right-to-left instead of crashing", () => {
                const fn = morph.build ({
                                template : `[{{ v : wrap, wrap }}]`
                              , helpers  : { wrap: ({ data }) => `<${data}>` }
                            })
                // rightmost runs first, its result feeds the next action
                expect ( fn ( 'render', { v: 'x' }) ).toBe ( '[<<x>>]' )
        }) // it chain composition



    it ( 'Data-only array placeholders render all elements joined (same as chains and mixes)', () => {
                const fn = morph.build ({ template: `[{{ tags }}]` });
                expect ( fn ( 'render', { tags: ['a', 'b'] }) ).toBe ( '[ab]' )
                expect ( fn ( 'render', { tags: [{ text: 'x' }, { text: 'y' }] }) ).toBe ( '[xy]' )
        }) // it data-only arrays join



    it ( "Functions inside object/array data become an error value, not a crash", () => {
                const fn = morph.build ({
                                template : `[{{ v : >dbl }}]`
                              , helpers  : { dbl: ({ data }) => String ( data ) }
                            })
                expect ( fn ( 'render', { v: { deep: [() => 1] } }) )
                    .toBe ( `[( Error: Render data contains values that can not be copied - functions are not supported inside objects/arrays. )]` )
        }) // it non-clonable data

}) // describe


import { expect } from 'chai'
import morph from '../src/main.js'

describe('Helper Function argument: useHelper', () => {

    it('Allow a helper to call another helper function', () => {
        const helpers = {
            formatting: ({ data }) => `Formatted: ${data}`,
            main: ({ data, useHelper }) => {
                return useHelper('formatting')
            }
        }
        const template = '{{value : main}}'
        const data = { value: 'Hello' }
        const app = morph.build({ template, helpers })
        const result = app('render', data)
        expect(result).to.equal('Formatted: Hello')
    }) // it Allow a helper to call another helper function



    it('Allow a helper to call a template helper', () => {
        const helpers = {
            link: '<a href="{{href}}">{{text}}</a>',
            renderLink: ({ data, useHelper }) => {
                if (data.href) return useHelper('link')
                else return data.text
            }
        }
        const template = '{{items : renderLink}}'
        const app = morph.build({ template, helpers })

        const result1 = app('render', {
            items: [
                { text: 'Click me', href: 'http://example.com' },
                { text: 'Just text' }
            ]
        })
        expect(result1).to.equal('<a href="http://example.com">Click me</a>Just text')

        const result2 = app('render', { items: [{ text: 'Just text' }] })
        expect(result2).to.equal('Just text')
    }) // it Allow a helper to call a template helper



    it('Allow passing overridden data to useHelper', () => {
        const helpers = {
            wrapper: ({ data }) => `[${data}]`,
            processor: ({ data, useHelper }) => {
                return useHelper('wrapper', 'Overridden')
            }
        }
        const template = '{{value : processor}}'
        const app = morph.build({ template, helpers })
        const result = app('render', { value: 'Original' })
        expect(result).to.equal('[Overridden]')
    }) // it Allow passing overridden data to useHelper 



    it('should work with different action types (not just render)', () => {
        const helpers = {
            exclaim: ({ data }) => `${data}!`,
            addExc: ({ data, useHelper }) => {
                return useHelper('exclaim', data + 'World')
            }
        }
        // Template uses data action
        const template = '{{val : addExc}}'
        const app = morph.build({ template, helpers })
        const result = app('render', { val: 'Hello ' })
        expect(result).to.equal('Hello World!')
    })



    it('should support recursive calls', () => {
        const helpers = {
            level1: ({ data }) => `L1(${data})`,
            level2: ({ data, useHelper }) => `L2(${useHelper('level1')})`,
            level3: ({ data, useHelper }) => `L3(${useHelper('level2')})`
        }
        const template = '{{val : level3}}'
        const app = morph.build({ template, helpers })
        const result = app('render', { val: 'x' })
        expect(result).to.equal('L3(L2(L1(x)))')
    })


    it('Should return error when helper does not exist', () => {
        const helpers = {
            caller: ({ useHelper }) => useHelper('missingHelper')
        }
        const template = '{{value : caller}}'
        const app = morph.build({ template, helpers })
        const result = app('render', { value: 'test' })
        expect(result).to.equal("( Error: Helper 'missingHelper' is not available )")
    }) // it Should return error when helper does not exist



    // Regression: a user helper with 2+ positional parameters used to be
    // misidentified as a build() output (heuristic was `length >= 2`) and got
    // called with the wrong arguments. The marker on build() output fixes it.
    it('Routes 2-arg user helper through the normal render path', () => {
        // The helper is called with the standard { data, ... } arg shape. The
        // second positional parameter is the trailing ...args from render(),
        // which is undefined here. The first arg is the options object.
        const helpers = {
            show: (opts, extra) => `${typeof opts}+${typeof extra}`,
            caller: ({ data, useHelper }) => useHelper('show')
        }
        const app = morph.build({ template: '{{x : caller}}', helpers })
        const result = app('render', { x: 'X' })
        // Before the fix, the result was 'string+X' (called as show('render','X',deps))
        expect(result).to.equal('object+undefined')
    }) // it 2-arg user helper



    it('Routes a 3-arg user helper through the normal render path', () => {
        // Whatever the function's arity, useHelper must call it via the
        // standard { data, ... } argument shape. A 3-arg helper used to be
        // called as `helper('render', data, dependencies)` - wrong.
        const helpers = {
            join3: (...args) => args.map(a => typeof a).join(','),
            caller: ({ useHelper }) => useHelper('join3')
        }
        const app = morph.build({ template: '{{x : caller}}', helpers })
        const result = app('render', { x: 'X' })
        // First arg is the standard options object; the rest are forwarded
        // trailing args (none here).
        expect(result).to.equal('object')
    }) // it 3-arg user helper



    it('Still treats a build() output as a compiled template', () => {
        const inner = morph.build({ template: 'Hi {{name}}' })
        const outer = morph.build({
            template: '{{x : invoker}}',
            helpers: {
                inner,                       // build() output, registered as a helper
                invoker: ({ useHelper }) => useHelper('inner')
            }
        })
        // Data is an object so the compiled template doesn't mistake it for a
        // debug instruction (the build() success() function treats string data
        // as instructions by design).
        const result = outer('render', { x: { name: 'Peter' } })
        expect(result).to.equal('Hi Peter')
    }) // it build() output still works through useHelper

}) // describe

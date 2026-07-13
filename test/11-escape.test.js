import morph from '../src/main.js'
import { expect } from 'chai'



describe ( 'morph: HTML escaping', () => {



    it ( 'Built-in helper "escape" works without declaration', () => {
                const templateFn = morph.build ({ template: `<p>{{ text : escape }}</p>` });
                const result = templateFn ( 'render', { text: `<script>steal()</script>` });
                expect ( result ).to.be.equal ( '<p>&lt;script&gt;steal()&lt;/script&gt;</p>' )
        }) // it built-in helper escape



    it ( 'Escapes all five special characters', () => {
                const templateFn = morph.build ({ template: `{{ text : escape }}` });
                const result = templateFn ( 'render', { text: `& < > " '` });
                expect ( result ).to.be.equal ( '&amp; &lt; &gt; &quot; &#39;' )
        }) // it escapes all five special characters



    it ( 'Template option "escape" protects data-only placeholders', () => {
                const templateFn = morph.build ({
                                  template : `<p>{{ comment }}</p>`
                                , escape   : true
                        });
                const result = templateFn ( 'render', { comment: `<img src=x onerror=alert(1)>` });
                expect ( result ).to.be.equal ( '<p>&lt;img src=x onerror=alert(1)&gt;</p>' )
        }) // it template option escape



    it ( 'Action "raw" opts a placeholder out of template escaping', () => {
                const templateFn = morph.build ({
                                  template : `{{ trusted : raw }} | {{ untrusted }}`
                                , escape   : true
                        });
                const result = templateFn ( 'render', { trusted: '<i>ok</i>', untrusted: '<i>no</i>' });
                expect ( result ).to.be.equal ( '<i>ok</i> | &lt;i&gt;no&lt;/i&gt;' )
        }) // it action raw opts out



    it ( 'Helper output stays untouched by template escaping', () => {
                // Helpers are the template author's code. Escape inside them when needed.
                const templateFn = morph.build ({
                                  template : `<ul>{{ items : li }}</ul>`
                                , escape   : true
                                , helpers  : { li: `<li>{{ text }}</li>` }
                        });
                const result = templateFn ( 'render', { items: [ 'a', 'b' ]});
                expect ( result ).to.be.equal ( '<ul><li>a</li><li>b</li></ul>' )
        }) // it helper output stays untouched



    it ( 'Template escaping survives commands "set" and "curry"', () => {
                const templateFn = morph.build ({
                                  template : `{{ a }} {{ b }}`
                                , escape   : true
                        });
                const afterCurry = templateFn ( 'curry', { a: 'A' })( 'render', { b: '<b>' });
                expect ( afterCurry ).to.be.equal ( 'A &lt;b&gt;' )

                const afterSet = templateFn ( 'set', { handshake: { a: 'x' }})( 'render', { a: '<a>', b: 'B' });
                expect ( afterSet ).to.be.equal ( '&lt;a&gt; B' )
        }) // it escaping survives set and curry



    it ( 'Data can not inject placeholders through command "curry"', () => {
                const templateFn = morph.build ({ template: `Hello {{ name }}, role: {{ role }}` });
                const curried = templateFn ( 'curry', { name: '{{ role }}' });   // user-controlled value
                const result = curried ( 'render', { role: 'admin' });
                // The injected tags render as literal text. The template's own placeholder still works.
                expect ( result ).to.be.equal ( 'Hello {{ role }}, role: admin' )
        }) // it curry injection



    it ( 'Helpers can escape on demand with useHelper', () => {
                const templateFn = morph.build ({
                                  template : `{{ user : card }}`
                                , helpers  : {
                                            card : ({ data, useHelper }) => `Name: ${useHelper ( 'escape', data.name )}`
                                        }
                        });
                const result = templateFn ( 'render', { user: { name: '<img>' }});
                expect ( result ).to.be.equal ( 'Name: &lt;img&gt;' )
        }) // it useHelper escape



    it ( 'User helper "escape" takes precedence over the built-in', () => {
                const templateFn = morph.build ({
                                  template : `{{ x : escape }}`
                                , helpers  : { escape: ({ data }) => `CUSTOM:${data}` }
                        });
                const result = templateFn ( 'render', { x: 'value' });
                expect ( result ).to.be.equal ( 'CUSTOM:value' )
        }) // it user helper escape takes precedence



    it ( 'Built-in helpers stay hidden from debug instruction "helpers"', () => {
                const templateFn = morph.build ({
                                  template : `{{ x : up }}`
                                , helpers  : { up: ({ data }) => data.toUpperCase () }
                        });
                const result = templateFn ( 'debug', 'helpers' );
                expect ( result ).to.be.equal ( 'up' )
        }) // it built-in helpers stay hidden


}) // describe

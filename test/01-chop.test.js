import chopTemplates from'../src/methods/_chopTemplates.js'
import { expect } from 'chai';

describe ( 't-templates: chop', () => {

    it ( 'Chop', () => {
                const 
                      str = 'Hello, {{name:ul,li,a}}! Say: {{shout}}, {{shout}}!'
                    , settings = {
                            TG_PRX: '{{'
                          , TG_SFX: '}}'
                          , TG_SIZE_P: 2
                          , TG_SIZE_S: 2
                        }
                    ;
                const tpl = chopTemplates ( settings);
                const res = tpl(str);

                expect(res).to.be.deep.equal ([
                    'Hello, ', '{{name:ul,li,a}}', '! Say: ', '{{shout}}', ', ', '{{shout}}', '!'
                  ])
        }) // it chop

}) // Describe
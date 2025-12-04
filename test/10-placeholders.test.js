import { expect } from 'chai';
import build from '../src/methods/build.js';

describe('t-placeholders: parsing and functionality', () => {

    describe('Basic placeholder structure', () => {
        
        it('should parse full placeholder with data, action, and name', () => {
            const tpl = {
                template: 'Hello {{ info : act : infoName }}!',
                helpers: {
                    act: ({ data }) => data ? data.toString().toUpperCase() : 'NO DATA'
                }
            };
            
            const result = build(tpl);
            expect(result).to.be.a('function');
            
            const output = result('render', { info: 'world' });
            expect(output).to.equal('Hello WORLD!');
        });

        it('should parse placeholder with no data but action and name', () => {
            const tpl = {
                template: 'Result: {{ : act : infoName }}',
                helpers: {
                    act: () => 'ACTION_ONLY'
                }
            };
            
            const result = build(tpl);
            const output = result('render', {});
            expect(output).to.equal('Result: ACTION_ONLY');
        });

        it('should parse placeholder with no data, action and name (compact format)', () => {
            const tpl = {
                template: 'Compact: {{ : act:infoName }}',
                helpers: {
                    act: () => 'COMPACT_ACTION'
                }
            };
            
            const result = build(tpl);
            const output = result('render', {});
            expect(output).to.equal('Compact: COMPACT_ACTION');
        });

        it('should handle no data with action and name with spaces', () => {
            const tpl = {
                template: 'Spaced: {{ : act : infoName }}',
                helpers: {
                    act: () => 'SPACED_ACTION'
                }
            };
            
            const result = build(tpl);
            const output = result('render', {});
            expect(output).to.equal('Spaced: SPACED_ACTION');
        });

        it('should handle no data with action and name using render prefix', () => {
            const tpl = {
                template: 'Render: {{ : >upper : infoName }}',
                helpers: {
                    upper: ({ data }) => 'test'.toUpperCase()
                }
            };
            
            const result = build(tpl);
            const output = result('render', {});
            expect(output).to.equal('Render: TEST');
        });

        it('should parse placeholder with only action', () => {
            const tpl = {
                template: 'Simple: {{ : act }}',
                helpers: {
                    act: () => 'ACTION_RESULT'
                }
            };
            
            const result = build(tpl);
            const output = result('render', {});
            expect(output).to.equal('Simple: ACTION_RESULT');
        });

        it('should parse placeholder with data only', () => {
            const tpl = {
                template: 'Data: {{ data }}',
                helpers: {}
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'VALUE' });
            expect(output).to.equal('Data: VALUE');
        });

        it('should parse placeholder with data and action only', () => {
            const tpl = {
                template: 'Data+Action: {{ data : act }}',
                helpers: {
                    act: ({ data }) => data ? `processed:${data}` : 'no-data'
                }
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'test' });
            expect(output).to.equal('Data+Action: processed:test');
        });

        it('should parse placeholder with data and name only', () => {
            const tpl = {
                template: 'Data+Name: {{ data :: infoName }}',
                helpers: {}
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'value' });
            expect(output).to.equal('Data+Name: value');
        });
    });

    describe('Space handling', () => {
        
        it('should ignore spaces in placeholder syntax', () => {
            const tpl = {
                template: 'Test {{data  : act    : infoName}} and {{  :act2  }}',
                helpers: {
                    act: ({ data }) => data ? data.toUpperCase() : 'EMPTY',
                    act2: () => 'SPACED'
                }
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'spaced' });
            expect(output).to.equal('Test SPACED and SPACED');
        });

        it('should handle multiple spaces consistently', () => {
            const tpl = {
                template: 'Start{{   data   :   act   :   name   }}End',
                helpers: {
                    act: ({ data }) => `[${data}]`
                }
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'test' });
            expect(output).to.equal('Start[test]End');
        });

        it('should handle no spaces', () => {
            const tpl = {
                template: 'Compact{{data:act:name}}Compact',
                helpers: {
                    act: ({ data }) => data
                }
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'compact' });
            expect(output).to.equal('CompactcompactCompact');
        });
    });

    describe('Multiple actions', () => {
        
        it('should handle single action with render prefix', () => {
            const tpl = {
                template: 'Single: {{ data : >upper }}',
                helpers: {
                    upper: ({ data }) => data ? data.toString().toUpperCase() : ''
                }
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'test' });
            expect(output).to.equal('Single: TEST');
        });

        it('should handle action with spaces around commas', () => {
            const tpl = {
                template: 'Spaced: {{ data : >upper }}',
                helpers: {
                    upper: ({ data }) => data ? data.toString().toUpperCase() : ''
                }
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'x' });
            expect(output).to.equal('Spaced: X');
        });
    });

    describe('Edge cases', () => {
        
        it('should handle empty data section with action', () => {
            const tpl = {
                template: 'Empty data: {{ : act }}',
                helpers: {
                    act: () => 'EMPTY_DATA_SECTION'
                }
            };
            
            const result = build(tpl);
            const output = result('render', {});
            expect(output).to.equal('Empty data: EMPTY_DATA_SECTION');
        });

        it('should handle nested data paths', () => {
            const tpl = {
                template: 'Nested: {{ user/profile/name }}',
                helpers: {}
            };
            
            const result = build(tpl);
            const output = result('render', { 
                user: { 
                    profile: { 
                        name: 'John Doe' 
                    } 
                } 
            });
            expect(output).to.equal('Nested: John Doe');
        });
    });

    describe('Complex scenarios', () => {
        
        it('should handle template with multiple different placeholder types', () => {
            const tpl = {
                template: 'Full: {{ info : upper : infoName }} | NoData: {{ : static }} | DataOnly: {{ count }}',
                helpers: {
                    upper: ({ data }) => data ? data.toString().toUpperCase() : '',
                    static: () => 'STATIC_VALUE'
                }
            };
            
            const result = build(tpl);
            const output = result('render', { info: 'hello', count: 42 });
            expect(output).to.equal('Full: HELLO | NoData: STATIC_VALUE | DataOnly: 42');
        });

        it('should handle placeholders with special characters in data', () => {
            const tpl = {
                template: 'Special: {{ user-name : clean }}',
                helpers: {
                    clean: ({ data }) => data ? data.replace(/-/g, '_') : ''
                }
            };
            
            const result = build(tpl);
            const output = result('render', { 'user-name': 'test-value' });
            expect(output).to.equal('Special: test_value');
        });

        it('should handle mixed placeholders with data and actions', () => {
            const tpl = {
                template: '{{ data }} {{ : act }} {{ data : act2 }}',
                helpers: {
                    act: () => 'ACTION',
                    act2: ({ data }) => data ? `PROCESSED:${data}` : ''
                }
            };
            
            const result = build(tpl);
            const output = result('render', { data: 'value' });
            expect(output).to.equal('value ACTION PROCESSED:value');
        });
    });
});
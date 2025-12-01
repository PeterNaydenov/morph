import morph from './src/main.js'

const template = morph.build({
    template: 'Hello {{name}}!',
    helpers: {},
    handshake: { name: 'World' }
});

const extensions = {
    placeholders: { 0: '{{ greeting }}' }
};

const newTemplate = template('set', extensions);

const result = newTemplate('render', { greeting: 'Hi' });

console.log(result);
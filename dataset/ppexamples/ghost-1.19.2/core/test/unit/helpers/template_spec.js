var should = require('should'),
    hbs = require.main.require('core/server/services/themes/engine'),
    template = require.main.require('core/server/helpers/template');

describe('Helpers Template', function () {
    it('can execute a template', function () {
        hbs.registerPartial('test', '<h1>Hello {{name}}</h1>');

        var safeString = template.execute('test', {name: 'world'});

        should.exist(safeString);
        safeString.should.have.property('string').and.equal('<h1>Hello world</h1>');
    });
});

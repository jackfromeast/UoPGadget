var should = require('should'), // jshint ignore:line
    sinon = require('sinon'),

// Thing we're testing
    models = require('../../../../server/models'),
    ghostBookshelf,

    sandbox = sinon.sandbox.create();

describe('Access Rules', function () {
    beforeEach(function () {
        models.init();
        ghostBookshelf = models.Base;
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('Base Model', function () {
        it('should assign isPublicContext to prototype', function () {
            ghostBookshelf.Model.prototype.isPublicContext.should.be.a.Function();
        });

        it('should get called when a model is forged', function () {
            ghostBookshelf.Model.forge(null, {context: 'test'})._context.should.eql('test');
        });

        describe('isPublicContext', function () {
            it('should isPublicContext false if no context is set', function () {
                ghostBookshelf.Model.forge().isPublicContext().should.be.false();
            });

            it('should return false if context has no `public` property', function () {
                ghostBookshelf.Model.forge(null, {context: 'test'}).isPublicContext().should.be.false();
            });

            it('should return false if context.public is false', function () {
                ghostBookshelf.Model.forge(null, {context: {public: false}}).isPublicContext().should.be.false();
            });

            it('should return true if context.public is true', function () {
                ghostBookshelf.Model.forge(null, {context: {public: true}}).isPublicContext().should.be.true();
            });
        });
    });
});

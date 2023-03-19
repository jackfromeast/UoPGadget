var should = require('should'),
    sinon = require('sinon'),
    Promise = require('bluebird'),

    rssCache = require('../../../../server/services/rss/cache'),
    renderer = require('../../../../server/services/rss/renderer'),

    sandbox = sinon.sandbox.create();

describe('RSS: Renderer', function () {
    var rssCacheStub, res, baseUrl;

    beforeEach(function () {
        rssCacheStub = sandbox.stub(rssCache, 'getXML');

        res = {
            locals: {},
            set: sinon.stub(),
            send: sinon.spy()
        };

        baseUrl = '/rss/';
    });

    afterEach(function () {
       sandbox.restore();
    });

    it('calls the cache and attempts to render, even without data', function (done) {
        rssCacheStub.returns(new Promise.resolve('dummyxml'));

        renderer.render(res, baseUrl).then(function () {
            rssCacheStub.calledOnce.should.be.true();
            rssCacheStub.firstCall.args.should.eql(['/rss/', {}]);

            res.set.calledOnce.should.be.true();
            res.set.calledWith('Content-Type', 'text/xml; charset=UTF-8').should.be.true();

            res.send.calledOnce.should.be.true();
            res.send.calledWith('dummyxml').should.be.true();

            done();
        }).catch(done);
    });

    it('correctly merges locals into empty data before rendering', function (done) {
        rssCacheStub.returns(new Promise.resolve('dummyxml'));

        res.locals = {foo: 'bar'};

        renderer.render(res, baseUrl).then(function () {
            rssCacheStub.calledOnce.should.be.true();
            rssCacheStub.firstCall.args.should.eql(['/rss/', {foo: 'bar'}]);

            res.set.calledOnce.should.be.true();
            res.set.calledWith('Content-Type', 'text/xml; charset=UTF-8').should.be.true();

            res.send.calledOnce.should.be.true();
            res.send.calledWith('dummyxml').should.be.true();

            done();
        }).catch(done);
    });

    it('correctly merges locals into non-empty data before rendering', function (done) {
        rssCacheStub.returns(new Promise.resolve('dummyxml'));

        res.locals = {foo: 'bar'};
        var data = {foo: 'baz', fizz: 'buzz'};

        renderer.render(res, baseUrl, data).then(function () {
            rssCacheStub.calledOnce.should.be.true();
            rssCacheStub.firstCall.args.should.eql(['/rss/', {foo: 'baz', fizz: 'buzz'}]);

            res.set.calledOnce.should.be.true();
            res.set.calledWith('Content-Type', 'text/xml; charset=UTF-8').should.be.true();

            res.send.calledOnce.should.be.true();
            res.send.calledWith('dummyxml').should.be.true();

            done();
        }).catch(done);
    });

    it('does nothing if it gets an error', function (done) {
        rssCacheStub.returns(new Promise.reject(new Error('Fake Error')));

        renderer.render(res, baseUrl).then(function () {
            done('This should have errored');
        }).catch(function (err) {
            err.message.should.eql('Fake Error');

            rssCacheStub.calledOnce.should.be.true();
            rssCacheStub.firstCall.args.should.eql(['/rss/', {}]);

            res.set.called.should.be.false();
            res.send.called.should.be.false();

            done();
        });
    });
});

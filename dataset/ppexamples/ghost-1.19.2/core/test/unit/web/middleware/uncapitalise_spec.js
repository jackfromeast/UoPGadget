var should = require('should'), // jshint ignore:line
    sinon = require('sinon'),
    uncapitalise = require('../../../../server/web/middleware/uncapitalise'),

    sandbox = sinon.sandbox.create();

// NOTE: all urls will have had trailing slashes added before uncapitalise is called

describe('Middleware: uncapitalise', function () {
    var res, req, next;

    beforeEach(function () {
        res = {
            redirect: sandbox.spy(),
            set: sandbox.spy()
        };
        req = {};
        next = sandbox.spy();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('Signup or reset request', function () {
        it('[signup] does nothing if there are no capitals in req.path', function (done) {
            req.path = '/ghost/signup/';
            uncapitalise(req, res, next);

            next.calledOnce.should.be.true();
            done();
        });

        it('[signup] does nothing if there are no capitals in the baseUrl', function (done) {
            req.baseUrl = '/ghost/signup/';
            req.path = '';
            uncapitalise(req, res, next);

            next.calledOnce.should.be.true();
            done();
        });

        it('[signup] does nothing if there are no capitals except in a token', function (done) {
            req.baseUrl = '/blog';
            req.path = '/ghost/signup/XEB123';

            uncapitalise(req, res, next);

            next.calledOnce.should.be.true();
            done();
        });

        it('[reset] does nothing if there are no capitals except in a token', function (done) {
            req.baseUrl = '/blog';
            req.path = '/ghost/reset/NCR3NjY4NzI1ODI1OHzlcmlzZHNAZ51haWwuY29tfEpWeGxRWHUzZ3Y0cEpQRkNYYzQvbUZyc2xFSVozU3lIZHZWeFJLRml6cY54';
            uncapitalise(req, res, next);

            next.calledOnce.should.be.true();
            done();
        });

        it('[signup] redirects if there are capitals in req.path', function (done) {
            req.path = '/ghost/SignUP/';
            req.url = req.path;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/ghost/signup/').should.be.true();
            done();
        });

        it('[signup] redirects if there are capitals in req.baseUrl', function (done) {
            req.baseUrl = '/ghost/SignUP/';
            req.path = '';
            req.url = req.path;
            req.originalUrl = req.baseUrl + req.path;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/ghost/signup/').should.be.true();
            done();
        });

        it('[signup] redirects correctly if there are capitals in req.path and req.baseUrl', function (done) {
            req.baseUrl = '/Blog';
            req.path = '/ghosT/signUp/';
            req.url = req.path;
            req.originalUrl = req.baseUrl + req.path;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/blog/ghost/signup/').should.be.true();
            done();
        });

        it('[signup] redirects correctly with capitals in req.path if there is a token', function (done) {
            req.path = '/ghosT/sigNup/XEB123';
            req.url = req.path;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/ghost/signup/XEB123').should.be.true();
            done();
        });

        it('[reset] redirects correctly with capitals in req.path & req.baseUrl if there is a token', function (done) {
            req.baseUrl = '/Blog';
            req.path = '/Ghost/Reset/NCR3NjY4NzI1ODI1OHzlcmlzZHNAZ51haWwuY29tfEpWeGxRWHUzZ3Y0cEpQRkNYYzQvbUZyc2xFSVozU3lIZHZWeFJLRml6cY54';
            req.url = req.path;
            req.originalUrl = req.baseUrl + req.path;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/blog/ghost/reset/NCR3NjY4NzI1ODI1OHzlcmlzZHNAZ51haWwuY29tfEpWeGxRWHUzZ3Y0cEpQRkNYYzQvbUZyc2xFSVozU3lIZHZWeFJLRml6cY54').should.be.true();
            done();
        });
    });

    describe('An API request', function () {
        it('does nothing if there are no capitals', function (done) {
            req.path = '/ghost/api/v0.1/endpoint/';
            uncapitalise(req, res, next);

            next.calledOnce.should.be.true();
            done();
        });

        it('redirects to the lower case slug if there are capitals', function (done) {
            req.path = '/ghost/api/v0.1/ASDfJ/';
            req.url = req.path;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/ghost/api/v0.1/asdfj/').should.be.true();
            done();
        });

        it('redirects to the lower case slug if there are capitals in req.baseUrl', function (done) {
            req.baseUrl = '/Blog';
            req.path = '/ghost/api/v0.1/ASDfJ/';
            req.url = req.path;
            req.originalUrl = req.baseUrl + req.path;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/blog/ghost/api/v0.1/asdfj/').should.be.true();
            done();
        });

        it('does not convert any capitals after the endpoint', function (done) {
            var query = '?filter=mAgic';
            req.path = '/Ghost/API/v0.1/settings/is_private/';
            req.url = req.path + query;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/ghost/api/v0.1/settings/is_private/?filter=mAgic').should.be.true();
            done();
        });

        it('does not convert any capitals after the endpoint with baseUrl', function (done) {
            var query = '?filter=mAgic';
            req.baseUrl = '/Blog';
            req.path = '/ghost/api/v0.1/mail/test@example.COM/';
            req.url = req.path + query;
            req.originalUrl = req.baseUrl + req.path + query;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/blog/ghost/api/v0.1/mail/test@example.COM/?filter=mAgic').should.be.true();
            done();
        });
    });

    describe('Any other request', function () {
        it('does nothing if there are no capitals', function (done) {
            req.path = '/this-is-my-blog-post';
            uncapitalise(req, res, next);

            next.calledOnce.should.be.true();
            done();
        });

        it('redirects to the lower case slug if there are capitals', function (done) {
            req.path = '/THis-iS-my-BLOg-poSt';
            req.url = req.path;

            uncapitalise(req, res, next);

            next.called.should.be.false();
            res.redirect.calledOnce.should.be.true();
            res.redirect.calledWith(301, '/this-is-my-blog-post').should.be.true();
            done();
        });
    });
});

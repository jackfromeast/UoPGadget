var should = require('should'),
    sinon = require('sinon'),
    testUtils = require('../../utils'),
    Promise = require('bluebird'),
    ObjectId = require('bson-objectid'),
    fs = require('fs-extra'),
    _ = require('lodash'),
    context = testUtils.context,
    common = require('../../../server/lib/common'),
    fsLib = require('../../../server/lib/fs'),
    SubscribersAPI = require('../../../server/api/subscribers'),
    sandbox = sinon.sandbox.create();

describe('Subscribers API', function () {
    // Keep the DB clean
    before(testUtils.teardown);
    afterEach(testUtils.teardown);
    afterEach(function () {
        sandbox.restore();
    });
    beforeEach(testUtils.setup('users:roles', 'perms:subscriber', 'perms:init', 'posts', 'subscriber'));

    should.exist(SubscribersAPI);

    describe('Add', function () {
        var newSubscriber;

        beforeEach(function () {
            newSubscriber = _.clone(testUtils.DataGenerator.forKnex.createSubscriber(testUtils.DataGenerator.Content.subscribers[1]));
            Promise.resolve(newSubscriber);
        });

        it('can add a subscriber (admin)', function (done) {
            SubscribersAPI.add({subscribers: [newSubscriber]}, testUtils.context.admin)
                .then(function (results) {
                    should.exist(results);
                    should.exist(results.subscribers);
                    results.subscribers.length.should.be.above(0);
                    done();
                }).catch(done);
        });

        it('can add a subscriber (editor)', function (done) {
            SubscribersAPI.add({subscribers: [newSubscriber]}, testUtils.context.editor)
                .then(function (results) {
                    should.exist(results);
                    should.exist(results.subscribers);
                    results.subscribers.length.should.be.above(0);
                    done();
                }).catch(done);
        });

        it('can add a subscriber (author)', function (done) {
            SubscribersAPI.add({subscribers: [newSubscriber]}, testUtils.context.author)
                .then(function (results) {
                    should.exist(results);
                    should.exist(results.subscribers);
                    results.subscribers.length.should.be.above(0);
                    done();
                }).catch(done);
        });

        it('can add a subscriber (external)', function (done) {
            SubscribersAPI.add({subscribers: [newSubscriber]}, testUtils.context.external)
                .then(function (results) {
                    should.exist(results);
                    should.exist(results.subscribers);
                    results.subscribers.length.should.be.above(0);
                    done();
                }).catch(done);
        });

        it('duplicate subscriber', function (done) {
            SubscribersAPI.add({subscribers: [newSubscriber]}, testUtils.context.external)
                .then(function () {
                    SubscribersAPI.add({subscribers: [newSubscriber]}, testUtils.context.external)
                        .then(function () {
                            return done();
                        })
                        .catch(done);
                })
                .catch(done);
        });

        it('CANNOT add subscriber without context', function (done) {
            SubscribersAPI.add({subscribers: [newSubscriber]})
                .then(function () {
                    done(new Error('Add subscriber without context should have no access.'));
                })
                .catch(function (err) {
                    (err instanceof common.errors.NoPermissionError).should.eql(true);
                    done();
                });
        });
    });

    describe('Edit', function () {
        var newSubscriberEmail = 'subscriber@updated.com',
            firstSubscriber = testUtils.DataGenerator.Content.subscribers[0].id;

        it('can edit a subscriber (admin)', function (done) {
            SubscribersAPI.edit({subscribers: [{email: newSubscriberEmail}]}, _.extend({}, context.admin, {id: firstSubscriber}))
                .then(function (results) {
                    should.exist(results);
                    should.exist(results.subscribers);
                    results.subscribers.length.should.be.above(0);
                    done();
                }).catch(done);
        });

        it('can edit subscriber (external)', function (done) {
            SubscribersAPI.edit({subscribers: [{email: newSubscriberEmail}]}, _.extend({}, context.external, {id: firstSubscriber}))
                .then(function (results) {
                    should.exist(results);
                    should.exist(results.subscribers);
                    results.subscribers.length.should.be.above(0);
                    done();
                }).catch(done);
        });

        it('CANNOT edit a subscriber (editor)', function (done) {
            SubscribersAPI.edit({subscribers: [{email: newSubscriberEmail}]}, _.extend({}, context.editor, {id: firstSubscriber}))
                .then(function () {
                    done(new Error('Edit subscriber as author should have no access.'));
                })
                .catch(function (err) {
                    (err instanceof common.errors.NoPermissionError).should.eql(true);
                    done();
                });
        });

        it('CANNOT edit subscriber (author)', function (done) {
            SubscribersAPI.edit({subscribers: [{email: newSubscriberEmail}]}, _.extend({}, context.author, {id: firstSubscriber}))
                .then(function () {
                    done(new Error('Edit subscriber as author should have no access.'));
                })
                .catch(function (err) {
                    (err instanceof common.errors.NoPermissionError).should.eql(true);
                    done();
                });
        });

        it('CANNOT edit subscriber that doesn\'t exit', function (done) {
            SubscribersAPI.edit({subscribers: [{email: newSubscriberEmail}]}, _.extend({}, context.internal, {id: ObjectId.generate()}))
                .then(function () {
                    done(new Error('Edit non-existent subscriber is possible.'));
                }, function (err) {
                    should.exist(err);
                    (err instanceof common.errors.NotFoundError).should.eql(true);
                    done();
                }).catch(done);
        });
    });

    describe('Destroy', function () {
        var firstSubscriber = testUtils.DataGenerator.Content.subscribers[0];

        it('can destroy subscriber as admin', function (done) {
            SubscribersAPI.destroy(_.extend({}, testUtils.context.admin, {id: firstSubscriber.id}))
                .then(function (results) {
                    should.not.exist(results);

                    done();
                }).catch(done);
        });

        it('can destroy subscriber by email', function (done) {
            SubscribersAPI.destroy(_.extend({}, testUtils.context.admin, {email: firstSubscriber.email}))
                .then(function (results) {
                    should.not.exist(results);

                    done();
                }).catch(done);
        });

        it('returns NotFoundError for unknown email', function (done) {
            SubscribersAPI.destroy(_.extend({}, testUtils.context.admin, {email: 'unknown@example.com'}))
                .then(function (results) {
                    done(new Error('Destroy subscriber should not be possible with unknown email.'));
                }, function (err) {
                    should.exist(err);
                    (err instanceof common.errors.NotFoundError).should.eql(true);
                    done();
                }).catch(done);
        });

        it('CANNOT destroy subscriber', function (done) {
            SubscribersAPI.destroy(_.extend({}, testUtils.context.editor, {id: firstSubscriber.id}))
                .then(function () {
                    done(new Error('Destroy subscriber should not be possible as editor.'));
                }, function (err) {
                    should.exist(err);
                    (err instanceof common.errors.NoPermissionError).should.eql(true);
                    done();
                }).catch(done);
        });
    });

    describe('Browse', function () {
        it('can browse (internal)', function (done) {
            SubscribersAPI.browse(testUtils.context.internal).then(function (results) {
                should.exist(results);
                should.exist(results.subscribers);
                results.subscribers.should.have.lengthOf(1);
                testUtils.API.checkResponse(results.subscribers[0], 'subscriber');
                results.subscribers[0].created_at.should.be.an.instanceof(Date);

                results.meta.pagination.should.have.property('page', 1);
                results.meta.pagination.should.have.property('limit', 15);
                results.meta.pagination.should.have.property('pages', 1);
                results.meta.pagination.should.have.property('total', 1);
                results.meta.pagination.should.have.property('next', null);
                results.meta.pagination.should.have.property('prev', null);

                done();
            }).catch(done);
        });

        it('CANNOT browse subscriber (external)', function (done) {
            SubscribersAPI.browse(testUtils.context.external)
                .then(function () {
                    done(new Error('Browse subscriber should be denied with external context.'));
                })
                .catch(function (err) {
                    (err instanceof common.errors.NoPermissionError).should.eql(true);
                    done();
                });
        });
    });

    describe('Read', function () {
        it('with id', function (done) {
            SubscribersAPI.browse({context: {user: 1}}).then(function (results) {
                should.exist(results);
                should.exist(results.subscribers);
                results.subscribers.length.should.be.above(0);

                var firstSubscriber = _.find(results.subscribers, {id: testUtils.DataGenerator.Content.subscribers[0].id});
                return SubscribersAPI.read({context: {user: 1}, id: firstSubscriber.id});
            }).then(function (found) {
                should.exist(found);
                testUtils.API.checkResponse(found.subscribers[0], 'subscriber');

                done();
            }).catch(done);
        });

        it('with email', function (done) {
            SubscribersAPI.browse({context: {user: 1}}).then(function (results) {
                should.exist(results);
                should.exist(results.subscribers);
                results.subscribers.length.should.be.above(0);

                var firstSubscriber = _.find(results.subscribers, {id: testUtils.DataGenerator.Content.subscribers[0].id});
                return SubscribersAPI.read({context: {user: 1}, email: firstSubscriber.email});
            }).then(function (found) {
                should.exist(found);
                testUtils.API.checkResponse(found.subscribers[0], 'subscriber');

                done();
            }).catch(done);
        });

        it('CANNOT fetch a subscriber which doesn\'t exist', function (done) {
            SubscribersAPI.read({context: {user: 1}, id: 999}).then(function () {
                done(new Error('Should not return a result'));
            }).catch(function (err) {
                should.exist(err);
                (err instanceof common.errors.NotFoundError).should.eql(true);
                done();
            });
        });
    });

    describe('Read CSV', function () {
        var scope = {};

        beforeEach(function () {
            sandbox.stub(fs, 'unlink').resolves();
            sandbox.stub(fsLib, 'readCSV').value(function () {
                if (scope.csvError) {
                    return Promise.reject(new Error('csv'));
                }

                return Promise.resolve(scope.values);
            });
        });

        afterEach(function () {
            scope.csvError = false;
        });

        it('check that fn works in general', function (done) {
            scope.values = [{email: 'lol@hallo.de'}, {email: 'test'}, {email: 'lol@hallo.de'}];

            SubscribersAPI.importCSV(_.merge(testUtils.context.internal, {path: '/somewhere'}))
                .then(function (result) {
                    result.meta.stats.imported.should.eql(1);
                    result.meta.stats.duplicates.should.eql(1);
                    result.meta.stats.invalid.should.eql(1);
                    done();
                })
                .catch(done);
        });

        it('check that fn works in general', function (done) {
            scope.values = [{email: 'lol@hallo.de'}, {email: '1@kate.de'}];

            SubscribersAPI.importCSV(_.merge(testUtils.context.internal, {path: '/somewhere'}))
                .then(function (result) {
                    result.meta.stats.imported.should.eql(2);
                    result.meta.stats.duplicates.should.eql(0);
                    result.meta.stats.invalid.should.eql(0);
                    done();
                })
                .catch(done);
        });

        it('read csv throws a not found error', function (done) {
            scope.csvError = true;

            SubscribersAPI.importCSV(_.merge(testUtils.context.internal, {path: '/somewhere'}))
                .then(function () {
                    done(new Error('we expected an error here!'));
                })
                .catch(function (err) {
                    err.message.should.eql('csv');
                    done();
                });
        });
    });
});

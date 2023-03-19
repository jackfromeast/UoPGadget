var should = require('should'), // jshint ignore:line
    sinon = require('sinon'),

// Stuff we are testing
    helpers = require('../../../server/helpers'),

    sandbox = sinon.sandbox.create();

describe('{{tags}} helper', function () {
    afterEach(function () {
        sandbox.restore();
    });

    it('can return string with tags', function () {
        var tags = [{name: 'foo'}, {name: 'bar'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {autolink: 'false'}}
            );
        should.exist(rendered);

        String(rendered).should.equal('foo, bar');
    });

    it('can use a different separator', function () {
        var tags = [{name: 'haunted'}, {name: 'ghost'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {separator: '|', autolink: 'false'}}
            );

        should.exist(rendered);

        String(rendered).should.equal('haunted|ghost');
    });

    it('can add a single prefix to multiple tags', function () {
        var tags = [{name: 'haunted'}, {name: 'ghost'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {prefix: 'on ', autolink: 'false'}}
            );

        should.exist(rendered);

        String(rendered).should.equal('on haunted, ghost');
    });

    it('can add a single suffix to multiple tags', function () {
        var tags = [{name: 'haunted'}, {name: 'ghost'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {suffix: ' forever', autolink: 'false'}}
            );

        should.exist(rendered);

        String(rendered).should.equal('haunted, ghost forever');
    });

    it('can add a prefix and suffix to multiple tags', function () {
        var tags = [{name: 'haunted'}, {name: 'ghost'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {suffix: ' forever', prefix: 'on ', autolink: 'false'}}
            );

        should.exist(rendered);

        String(rendered).should.equal('on haunted, ghost forever');
    });

    it('can add a prefix and suffix with HTML', function () {
        var tags = [{name: 'haunted'}, {name: 'ghost'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {suffix: ' &bull;', prefix: '&hellip; ', autolink: 'false'}}
            );

        should.exist(rendered);

        String(rendered).should.equal('&hellip; haunted, ghost &bull;');
    });

    it('does not add prefix or suffix if no tags exist', function () {
        var rendered = helpers.tags.call(
            {},
            {hash: {prefix: 'on ', suffix: ' forever', autolink: 'false'}}
        );

        should.exist(rendered);

        String(rendered).should.equal('');
    });

    it('can autolink tags to tag pages', function () {
        var tags = [{name: 'foo', slug: 'foo-bar'}, {name: 'bar', slug: 'bar'}],
            rendered = helpers.tags.call(
                {tags: tags}
            );
        should.exist(rendered);

        String(rendered).should.equal('<a href="/tag/foo-bar/">foo</a>, <a href="/tag/bar/">bar</a>');
    });

    it('can limit no. tags output to 1', function () {
        var tags = [{name: 'foo', slug: 'foo-bar'}, {name: 'bar', slug: 'bar'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {limit: '1'}}
            );
        should.exist(rendered);

        String(rendered).should.equal('<a href="/tag/foo-bar/">foo</a>');
    });

    it('can list tags from a specified no.', function () {
        var tags = [{name: 'foo', slug: 'foo-bar'}, {name: 'bar', slug: 'bar'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {from: '2'}}
            );
        should.exist(rendered);

        String(rendered).should.equal('<a href="/tag/bar/">bar</a>');
    });

    it('can list tags to a specified no.', function () {
        var tags = [{name: 'foo', slug: 'foo-bar'}, {name: 'bar', slug: 'bar'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {to: '1'}}
            );
        should.exist(rendered);

        String(rendered).should.equal('<a href="/tag/foo-bar/">foo</a>');
    });

    it('can list tags in a range', function () {
        var tags = [{name: 'foo', slug: 'foo-bar'}, {name: 'bar', slug: 'bar'}, {name: 'baz', slug: 'baz'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {from: '2', to: '3'}}
            );
        should.exist(rendered);

        String(rendered).should.equal('<a href="/tag/bar/">bar</a>, <a href="/tag/baz/">baz</a>');
    });

    it('can limit no. tags and output from 2', function () {
        var tags = [{name: 'foo', slug: 'foo-bar'}, {name: 'bar', slug: 'bar'}, {name: 'baz', slug: 'baz'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {from: '2', limit: '1'}}
            );
        should.exist(rendered);

        String(rendered).should.equal('<a href="/tag/bar/">bar</a>');
    });

    it('can list tags in a range (ignore limit)', function () {
        var tags = [{name: 'foo', slug: 'foo-bar'}, {name: 'bar', slug: 'bar'}, {name: 'baz', slug: 'baz'}],
            rendered = helpers.tags.call(
                {tags: tags},
                {hash: {from: '1', to: '3', limit: '2'}}
            );
        should.exist(rendered);

        String(rendered).should.equal('<a href="/tag/foo-bar/">foo</a>, <a href="/tag/bar/">bar</a>, <a href="/tag/baz/">baz</a>');
    });

    describe('Internal tags', function () {
        var tags = [
            {name: 'foo', slug: 'foo-bar', visibility: 'public'},
            {name: '#bar', slug: 'hash-bar', visibility: 'internal'},
            {name: 'bar', slug: 'bar', visibility: 'public'},
            {name: 'baz', slug: 'baz', visibility: 'public'},
            {name: 'buzz', slug: 'buzz'}
        ];

        it('will not output internal tags by default', function () {
            var rendered = helpers.tags.call(
                {tags: tags}
            );

            String(rendered).should.equal(
                '<a href="/tag/foo-bar/">foo</a>, ' +
                '<a href="/tag/bar/">bar</a>, ' +
                '<a href="/tag/baz/">baz</a>, ' +
                '<a href="/tag/buzz/">buzz</a>'
            );
        });

        it('should still correctly apply from & limit tags', function () {
            var rendered = helpers.tags.call(
                {tags: tags},
                {hash: {from: '2', limit: '2'}}
            );

            String(rendered).should.equal(
                '<a href="/tag/bar/">bar</a>, ' +
                '<a href="/tag/baz/">baz</a>'
            );
        });

        it('should output all tags with visibility="all"', function () {
            var rendered = helpers.tags.call(
                {tags: tags},
                {hash: {visibility: 'all'}}
            );

            String(rendered).should.equal(
                '<a href="/tag/foo-bar/">foo</a>, ' +
                '<a href="/tag/hash-bar/">#bar</a>, ' +
                '<a href="/tag/bar/">bar</a>, ' +
                '<a href="/tag/baz/">baz</a>, ' +
                '<a href="/tag/buzz/">buzz</a>'
            );
        });

        it('should output all tags with visibility property set with visibility="public,internal"', function () {
            var rendered = helpers.tags.call(
                {tags: tags},
                {hash: {visibility: 'public,internal'}}
            );
            should.exist(rendered);

            String(rendered).should.equal(
                '<a href="/tag/foo-bar/">foo</a>, ' +
                '<a href="/tag/hash-bar/">#bar</a>, ' +
                '<a href="/tag/bar/">bar</a>, ' +
                '<a href="/tag/baz/">baz</a>'
            );
        });

        it('Should output only internal tags with visibility="internal"', function () {
            var rendered = helpers.tags.call(
                {tags: tags},
                {hash: {visibility: 'internal'}}
            );
            should.exist(rendered);

            String(rendered).should.equal('<a href="/tag/hash-bar/">#bar</a>');
        });

        it('should output nothing if all tags are internal', function () {
            var tags = [
                    {name: '#foo', slug: 'hash-foo-bar', visibility: 'internal'},
                    {name: '#bar', slug: 'hash-bar', visibility: 'internal'}
                ],
                rendered = helpers.tags.call(
                    {tags: tags},
                    {hash: {prefix: 'stuff'}}
                );
            should.exist(rendered);

            String(rendered).should.equal('');
        });
    });
});

var should = require('should'), // jshint ignore:line

// Stuff we are testing
    helpers = require('../../../server/helpers');

describe('{{reading_time}} helper', function () {
    it('[success] renders reading time for less than one minute text correctly', function () {
        var data = {
                html: '<div class="kg-card-markdown"><p>This is a text example! Count me in ;)</p></div>',
                title: 'Test',
                slug: 'slug'
            },
            result = helpers.reading_time.call(data);

        String(result).should.equal('< 1 min read');
    });

    it('[success] renders reading time for more than one minute text correctly', function () {
        var data = {
                html: '<div class="kg-card-markdown"><p>Ghost has a number of different user roles for your team</p>' +
                      '<h3 id="authors">Authors</h3><p>The base user level in Ghost is an author. Authors can write posts,' +
                      ' edit their own posts, and publish their own posts. Authors are <strong>trusted</strong> users. If you ' +
                      'don\'t trust users to be allowed to publish their own posts, you shouldn\'t invite them to Ghost admin.</p>' +
                      '<h3 id="editors">Editors</h3><p>Editors are the 2nd user level in Ghost. Editors can do everything that an' +
                      ' Author can do, but they can also edit and publish the posts of others - as well as their own. Editors can also invite new' + ' authors to the site.</p><h3 id="administrators">Administrators</h3><p>The top user level in Ghost is Administrator.' +
                      ' Again, administrators can do everything that Authors and Editors can do, but they can also edit all site settings ' +
                      'and data, not just content. Additionally, administrators have full access to invite, manage or remove any other' +
                      ' user of the site.</p><h3 id="theowner">The Owner</h3><p>There is only ever one owner of a Ghost site. ' +
                      'The owner is a special user which has all the same permissions as an Administrator, but with two exceptions: ' +
                      'The Owner can never be deleted. And in some circumstances the owner will have access to additional special settings ' +
                      'if applicable — for example, billing details, if using Ghost(Pro).</p><hr><p>It\'s a good idea to ask all of your' +
                      ' users to fill out their user profiles, including bio and social links. These will populate rich structured data ' +
                      'for posts and generally create more opportunities for themes to fully populate their design.</p></div>',
                title: 'Test',
                slug: 'slug',
                feature_image: '/content/images/someimage.jpg'
            },
            result = helpers.reading_time.call(data);

        String(result).should.equal('1 min read');
    });

    it('[success] adds time for feature image', function () {
        var data = {
            html: '<div class="kg-card-markdown"><p>Ghost has a number of different user roles for your team</p>' +
                  '<h3 id="authors">Authors</h3><p>The base user level in Ghost is an author. Authors can write posts,' +
                  ' edit their own posts, and publish their own posts. Authors are <strong>trusted</strong> users. If you ' +
                  'don\'t trust users to be allowed to publish their own posts, you shouldn\'t invite them to Ghost admin.</p>' +
                  '<h3 id="editors">Editors</h3><p>Editors are the 2nd user level in Ghost. Editors can do everything that an' +
                  ' Author can do, but they can also edit and publish the posts of others - as well as their own. Editors can also invite new' + ' authors to the site.</p><h3 id="administrators">Administrators</h3><p>The top user level in Ghost is Administrator.' +
                  ' Again, administrators can do everything that Authors and Editors can do, but they can also edit all site settings ' +
                  'and data, not just content. Additionally, administrators have full access to invite, manage or remove any other' +
                  ' user of the site.</p><h3 id="theowner">The Owner</h3><p>There is only ever one owner of a Ghost site. ' +
                  'The owner is a special user which has all the same permissions as an Administrator, but with two exceptions: ' +
                  'The Owner can never be deleted. And in some circumstances the owner will have access to additional special settings ' +
                  'if applicable — for example, billing details, if using Ghost(Pro).</p><hr><p>It\'s a good idea to ask all of your' +
                  ' users to fill out their user profiles, including bio and social links. These will populate rich structured data ',
                title: 'Test',
                slug: 'slug',
                feature_image: '/content/images/someimage.jpg'
            },
            result = helpers.reading_time.call(data);

        // The reading time for this HTML snippet would be 63 seconds without the image
        // Adding the 12 additional seconds for the image results in a reading time > 1 minute
        String(result).should.equal('1 min read');
    });

    it('[failure] does not render reading time when not post', function () {
        var data = {
                author: {
                    name: 'abc 123',
                    slug: 'abc123'
                }
            },
            result = helpers.reading_time.call(data);

        should.not.exist(result);
    });
});

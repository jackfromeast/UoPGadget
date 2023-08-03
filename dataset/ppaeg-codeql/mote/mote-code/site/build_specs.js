var fs = require('fs')
  , root = __dirname.replace(/\w+$/, '')
  , specs = ['interpolation',
             'sections',
             'comments',
             'inverted',
             'delimiters',
             'partials'
            ]
  , js = 'var specs = {};\n\n';

specs.forEach(function(filename) {
  var path = root + 'spec/specs/' + filename + '.json'
    , spec = JSON.parse(fs.readFileSync(path));

  js += 'specs.' + filename + ' = '
      + JSON.stringify(spec.tests, undefined, 2)
      + ';\n\n';
});

fs.writeFileSync(__dirname + '/specs.js', js);


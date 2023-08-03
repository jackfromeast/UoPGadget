function SectionSwitcher(sel) {
  this.el = $(sel);
  this.bindEvents();
  this.showSection('about');
}

SectionSwitcher.prototype.bindEvents = function() {
  var self = this;
  this.el.on('click', 'a', function(event) {
    event.preventDefault();
    var id = $(event.target).html();
    self.showSection(id);
  });
};

SectionSwitcher.prototype.showSection = function(id) {
  var newSel = $('#' + id);
  this.currentSection = this.currentSection || newSel;
  this.currentSection.fadeOut(200, function() {
    newSel.fadeIn(200);
  });
  this.currentSection = newSel;
};

var hsvMin = rgbToHsv(164, 0, 0);
var hsvMax = rgbToHsv(78, 154, 6);

function Result(name, value, max) {
  this.name = name;
  this.value = value;
  this.max = max;
  this.el = $('<div class="result"></div>');
}

Result.prototype.render = function() {
  this.el.html(this.template(this));
  this.bar = this.el.find('.bar');
  return this;
};

Result.prototype.reset = function() {
  this.update(0, 0, 0);
};

Result.prototype.opsSec = function() {
  return Math.floor(this.value/1000);
};

Result.prototype.formatColor = function(ratio) {
  var hsv = interpolate(hsvMin, hsvMax, ratio);
  var rgb = hsvToRgb.apply(null, hsv);
  rgb[0] = Math.floor(rgb[0]);
  rgb[1] = Math.floor(rgb[1]);
  rgb[2] = Math.floor(rgb[2]);
  return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
};

Result.prototype.update = function(min, max, value) {
  var ratio;
  this.value = value != null ? value : this.value;
  this.max = max != null ? max : this.max;
  this.min = min != null ? min : this.min;
  this.render();
  ratio = this.value / this.max;
  colorRatio = (this.value - this.min) / (this.max - this.min);
  this.bar.css({
    width: 290 * ratio,
    backgroundColor: this.formatColor(colorRatio)
  });
  return this;
};

function Suite(suite){
  this.results = {
    mustache: new Result('mustache'),
    hogan: new Result('hogan'),
    mote: new Result('mote'),
    handlebars: new Result('handlebars'),
    dust: new Result('dust'),
  };
  this.name = suite.name;
  this.suite = suite;
  this.running = false;
}

Suite.prototype.render = function() {
  var self = this;

  this.el = this.el || $(this.template(this));

  for (var name in this.results) {
    this.el.append(this.results[name].render().el);
  }

  this.el.find('button').on('click', function(event) {
    event.preventDefault();

    $(event.target).attr('disabled', 'disabled');
    self.run();
  });

  return this;
};

Suite.prototype.resetResults = function() {
  var result;
  for (var name in this.results) {
    this.results[name].reset();
  }
};

Suite.prototype.run = function() {
  var max = 0, min = Infinity, self = this;

  this.resetResults();
  this.suite.reset();

  this.suite.on('cycle', function(event, bench) {
    max = bench.hz > max ? bench.hz : max;
    min = bench.hz < min ? bench.hz : min;
    var result = self.results[bench.name];
    result.update(min, max, bench.hz)
    for (var name in self.results) {
      self.results[name].update(min, max);
    }
  });

  this.suite.on('complete', function() {
    self.el.find('button').attr('disabled', false);
  });

  this.suite.run({async: true});
};

function Spec(name, tests) {
  this.name = name;
  this.tests = tests;
  this.el = $('<div class="spec-section"></div>');
}

Spec.prototype.run = function() {
  var i = 0, len = this.tests.length;
  this.results = [];
  for (; i < len; i++) this.results.push(this.runSpec(this.tests[i]));
};

Spec.prototype.runSpec = function(spec) {
  var name, actual, error, status;
  try {
    mote.clearCache();
    for (name in spec.partials) {
      mote.compilePartial(name, spec.partials[name]);
    }
    actual = mote.compile(spec.template)(spec.data);
  } catch(err) {
    error = err;
  }

  status = error ? 'error' : (actual !== spec.expected) ? 'fail' : 'pass';
  return {status: status, description: spec.desc };
};

Spec.prototype.render = function() {
  this.run();
  this.el.html(this.template(this));
  return this;
};


$(function() {
  Result.prototype.template = mote.compile($('#result').html());
  Suite.prototype.template = mote.compile($('#suite').html());
  Spec.prototype.template = mote.compile($('#spec-section').html());

  var suites = {
    string: new Suite(string),
    replace: new Suite(replace),
    array: new Suite(array),
    object: new Suite(object),
    partial: new Suite(partial),
    recursion: new Suite(recursion),
    complex: new Suite(complex)
  };

  var benchSection = $('#bench');

  for (var name in suites) {
    benchSection.append(suites[name].render().el);
  }

  var specSection = $('#spec');

  for (var name in specs) {
    specSection.append((new Spec(name, specs[name])).render().el);
  }

  new SectionSwitcher('nav');

  hljs.initHighlightingOnLoad();
});

var string = createBenchmark('String', {
  mustache: "Hello World!",
  handlebars: "Hello World!",
  dust: "Hello World!"
});

var replace = createBenchmark('Replace', {
	mustache: "Hello {{name}}! You have {{count}} new messages.",
	handlebars: "Hello {{name}}! You have {{count}} new messages.",
	dust: "Hello {name}! You have {count} new messages."
}, {
	name: "Mick",
	count: 30
});

var array = createBenchmark('Array', {
	mustache: "{{#names}}{{name}}{{/names}}",
	handlebars: "{{#each names}}{{name}}{{/each}}",
	dust: "{#names}{name}{/names}"
}, {
	names: [
		{name: "Moe"},
		{name: "Larry"},
		{name: "Curly"},
		{name: "Shemp"}
	]
});

var object = createBenchmark('Object', {
	mustache: "{{#person}}{{name}}{{age}}{{/person}}",
	handlebars: "{{#with person}}{{name}}{{age}}{{/with}}",
	dust: "{#person}{name}{age}{/person}"
}, {
	person: {
		name: "Larry",
		age: 45
	}
});

var partial = createBenchmark('Partial', {
	mustache: "{{#peeps}}{{>partial}}{{/peeps}}",
	handlebars: "{{#each peeps}}{{>partial}}{{/each}}",
	dust: "{#peeps}{>partial/}{/peeps}"
}, {
	peeps: [
		{name: "Moe", count: 15},
		{name: "Larry", count: 5},
		{name: "Curly", count: 1},
	]
}, {
	mustache: {partial: "Hello {{name}}! You have {{count}} new messages."},
	handlebars: {partial: "Hello {{name}}! You have {{count}} new messages."},
	dust: {partial: "Hello {name}! You have {count} new messages."},
});

var recursion = createBenchmark('Recursion', {
	mustache: "{{name}}{{#kids}}{{>recursion}}{{/kids}}",
	handlebars: "{{name}}{{#each kids}}{{>recursion}}{{/each}}",
	dust: "{name}{#kids}{>Recursion:./}{/kids}",
}, {
	name: '1 ',
	kids: [{
		name: '1.1 ',
		kids: [{
			name: '1.1.1 ',
			kids: []
		}]
	}]
}, {
	mustache: { recursion: "{{name}}{{#kids}}{{>recursion}}{{/kids}}" },
	handlebars: { recursion: "{{name}}{{#each kids}}{{>recursion}}{{/each}}" },
});

var complex = createBenchmark('Complex', {
	mustache: "<h1>{{header}}</h1>{{#hasItems}}<ul>{{#items}}{{#current}}<li><strong>{{name}}</strong></li>{{/current}}{{^current}}<li><a href=\"{{url}}\">{{name}}</a></li>{{/current}}{{/items}}</ul>{{/hasItems}}{{^items}}<p>The list is empty.</p{{/items}}",
	mote: "<h1>{{header}}</h1>{{?items}}<ul>{{#.}}{{#current}}<li><strong>{{name}}</strong></li>{{/current}}{{^current}}<li><a href=\"{{url}}\">{{name}}</a></li>{{/current}}{{/.}}</ul>{{/items}}{{^items}}<p>The list is empty.</p{{/items}}",
	handlebars: "<h1>{{header}}</h1>{{#if items}}<ul>{{#each items}}{{#if current}}<li><strong>{{name}}</strong></li>{{else}}<li><a href=\"{{url}}\">{{name}}</a></li>{{/if}}{{/each}}</ul>{{else}}<p>The list is empty.</p>{{/if}}",
	dust: "<h1>{header}</h1>\n"
		+  "{?items}\n"
		+  "  <ul>\n"
		+  "    {#items}\n"
		+  "      {#current}\n"
		+  "        <li><strong>{name}</strong></li>\n"
		+  "      {:else}\n"
		+  "        <li><a href=\"{url}\">{name}</a></li>\n"
		+  "      {/current}\n"
		+  "    {/items}\n"
		+  "  </ul>\n"
		+  "{:else}\n"
		+  "  <p>The list is empty.</p>\n"
		+  "{/items}"
}, {
	header: function() { return "Colors"; },
	hasItems: true,
	items: [
		{name: "red", current: true, url: "#Red"},
		{name: "green", current: false, url: "#Green"},
		{name: "blue", current: false, url: "#Blue"}
	]
})

function createBenchmark(benchmarkName, templates, context, partials) {
  partials = partials || {};

  /* Compile the partials */
  var name = benchmarkName.toLowerCase();
  if (partials.mustache) mote.compilePartial(name, partials.mustache[name]);
  if (partials.handlebars) Handlebars.registerPartial(name, partials.handlebars[name]);
  if (partials.dust) dust.loadSource(dust.compile(partials.dust[name], name));

  /* Compile the templates */
  var muFn = Mustache.compile(templates.mustache);
  var hoTe = Hogan.compile(templates.mustache);
  var moFn = templates.mote ? mote.compile(templates.mote) : mote.compile(templates.mustache);
  var hbFn = Handlebars.compile(templates.handlebars);
  dust.loadSource(dust.compile(templates.dust, benchmarkName));

  function noop(){};

  console.log('=== ' + benchmarkName + ' ===');
  console.log('mustache  :', muFn(context, partials.mustache));
  console.log('hogan     :', hoTe.render(context, partials.mustache));
  console.log('mote      :', moFn(context));
  console.log('handlebars:', hbFn(context));
  dust.render(benchmarkName, context, function(err, out) {
    console.log('dust      :', out);
  });
  console.log('');

  var suite = new Benchmark.Suite(benchmarkName);
  Benchmark.options.maxTime = 1;
  Benchmark.options.delay = 0.1;

  suite
    .add('mustache', function() { muFn(context, partials.mustache); })
    .add('hogan', function() { hoTe.render(context, partials.mustache); })
    .add('mote', function() { moFn(context); })
    .add('handlebars', function() { hbFn(context); })
    .add('dust', function() { dust.render(benchmarkName, context, noop); })

  return suite;
}


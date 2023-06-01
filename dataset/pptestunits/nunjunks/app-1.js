const nunjucks = require('nunjucks');

// Define your template data
let templateData = {
    title: 'Nunjucks Template',
    description: 'This is an example of Nunjucks template rendering.',
    items: [
        { name: 'Item 1', value: 'Value 1' },
        { name: 'Item 2', value: 'Value 2' },
        { name: 'Item 3', value: 'Value 3' }
    ]
};

// Compile the template
let template = nunjucks.compile(`
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <ul>
    {% for item in items %}
        <li>{{ item.name }}: {{ item.value }}</li>
    {% endfor %}
    </ul>
`);

// Render the template with the data
let output = template.render(templateData);
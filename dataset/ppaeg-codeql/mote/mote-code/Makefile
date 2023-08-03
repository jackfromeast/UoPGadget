SITE_SRC = site/about.md site/docs.md site/index.html.mote site/templates.html
SITE = index.html

all: site

site: ${SITE}

${SITE}: ${SITE_SRC}
	node site/build_site.js


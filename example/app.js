const express = require('express');
const server = express();
const PORT = process.env.PORT || 3000;
const { redirect, replace, proxy, pipe } = require('node-microwave');
const routes = require('./routes');
const replaces = require('./replaces');

const sites = {
	github: 'https://github.com',
	wikipedia: 'https://en.wikipedia.org',
	google: 'http://www.google.com'
};

server
	.use(redirect(routes))
	.get(['/search'], pipe(sites.google))
	.get(['/wiki/*', '/w/*', '/static/*'], pipe(sites.wikipedia))
	.get(['/erezcarmel'], replace(sites.github, replaces))
	.use(proxy(sites.wikipedia));

server.listen(PORT, () => console.log('Web Proxy app start on port', PORT));
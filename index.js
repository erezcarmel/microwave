const request = require('request');
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const proxyServer = httpProxy.createProxyServer({});

exports.redirect = routes => (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

	routes[req.url] ? res.redirect(routes[req.url]) : next();
};

exports.replace = (site, replacers, secured = true) => (req, res) => {
	const url = `${site}${req.url}`;
	if (replacers[req.url]) {
		const protocol = secured ? https : http;
		protocol.get(url, response => {
			let body = '';
			response.on('data', chunk => body += chunk);
			response.on('end', () => {
				replacers[req.url].map(code => {
					body = body.split(code.original).join(code.replace);
				});
				res.send(body);
			});
		});
	} else {
		request(url).pipe(res);
	}
};

exports.global = (site, variables = [], secured = true) => (req, res) => {
	const url = `${site}${req.url}`;
	if (variables.length) {
		const protocol = secured ? https : http;
		protocol.get(url, response => {
			let body = '';
			response.on('data', chunk => body += chunk);
			response.on('end', () => {
				const idx = body.indexOf('<body>') + 6;
				body = [
					body.slice(0, idx),
					`<script>${variables
						.map(variable => `window.${variable.name}='${variable.value}'`)
						.join(';')}</script>`,
					body.slice(idx)
				].join('');
				res.send(body);
			});
		});
	} else {
		request(url).pipe(res);
	}
};

exports.pipe = site => (req, res) => request(`${site}${req.url}`).pipe(res);

exports.proxy = site => (req, res) => {
	proxyServer.web(req, res, {
		target: `${site}${req.url}`,
		secure: false
	});
	proxyServer.on('error', function(err, req, res){
		if(err) console.log(err);
		res.writeHead(500);
		res.end('Microwave is having trouble', err);
	});
};
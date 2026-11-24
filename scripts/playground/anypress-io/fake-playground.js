// Stands in for demo.anypress.site's Playground client on the Try It checks: "starts" the blueprint it is given in
// the iframe, moves the page's progress bar, and answers the calls the page makes, recording them on window.__try.
window.__try = { files: {}, ran: [] };
export async function startPlaygroundWeb({ iframe, remoteUrl, blueprint, progressTracker, disableProgressBar }) {
	Object.assign(window.__try, { remoteUrl, blueprint, disableProgressBar });
	const stage = progressTracker.stage(1);
	stage.set(60);
	await new Promise((r) => setTimeout(r, 700));
	if (blueprint.fail) throw new Error('This blueprint fails on purpose');
	stage.finish();
	iframe.srcdoc = '<h1>Demo site</h1>';
	return {
		async mkdir() {},
		async writeFile(path, data) { window.__try.files[path] = String(data); },
		async run({ code }) {
			window.__try.ran.push(code.slice(0, 40));
			const title = window.__pageTitle || 'Home';
			return { text: JSON.stringify({ content: { pages: [{ title, slug: 'home', content: '<p>Hi</p>', status: 'publish' }] }, images: [{ name: 'photo.jpg', path: '/wordpress/wp-content/uploads/photo.jpg' }, { name: 'elsewhere.jpg', path: '/wordpress/wp-content/uploads/elsewhere.jpg' }] }) };
		},
		async readFileAsBuffer() { return new Uint8Array(1234); },
	};
}

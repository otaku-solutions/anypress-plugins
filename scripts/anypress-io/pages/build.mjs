// Writes anypress.io's pages as block markup into html/, with pages.json listing each page's address and title for
// setup.php. The words and lists come from site-data.json, exported from anypress-site's src/lib (see README.md).
//
//   node build.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import home from './home.mjs';
import pricing from './pricing.mjs';
import resellers from './resellers.mjs';
import sellers from './sellers.mjs';
import sitePage, { sitesIndex } from './sites.mjs';
import { footer, header, menu } from './parts.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(resolve(HERE, 'site-data.json'), 'utf8'));
const PAGES = [
	{ path: '', file: 'home', title: 'AnyPress', build: home },
	{ path: 'pricing', file: 'pricing', title: 'Prices', build: pricing },
	{ path: 'sites', file: 'sites', title: 'Kinds of site', build: sitesIndex },
	{ path: 'sellers', file: 'sellers', title: 'Sell websites', build: sellers },
	{ path: 'resellers', file: 'resellers', title: 'Resellers', build: resellers },
	...['website', 'bookings', 'store', 'community', 'everything'].map((id) => ({ path: `sites/${id}`, file: `sites-${id}`, title: id, build: (data) => sitePage(data, id) })),
];

mkdirSync(resolve(HERE, 'html'), { recursive: true });
const manifest = PAGES.map(({ path, file, title, build }) => {
	if (path.startsWith('sites/')) title = data.SITE_TYPES.find((t) => `sites/${t.id}` === path).name;
	writeFileSync(resolve(HERE, 'html', `${file}.html`), build(data));
	return { path, file, title, template: 'page-no-title' };
});
mkdirSync(resolve(HERE, 'parts'), { recursive: true });
writeFileSync(resolve(HERE, 'parts', 'header.html'), `${header()}\n`);
writeFileSync(resolve(HERE, 'parts', 'footer.html'), `${footer(data)}\n`);
writeFileSync(resolve(HERE, 'parts', 'menu.html'), `${menu()}\n`);
writeFileSync(resolve(HERE, 'pages.json'), `${JSON.stringify(manifest, null, '\t')}\n`);
console.log(`Wrote ${manifest.length} page(s).`);

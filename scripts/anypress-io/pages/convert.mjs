// Writes anypress.io's pages as block markup into html/ (and the header and footer into parts/), straight from the
// pages anypress-site serves, so the WordPress pages carry the same markup and class names and look the same.
//
// Run anypress-site with test prices first (README.md), then:
//
//   node convert.mjs [http://localhost:3311]
//
// Each element becomes the core block that saves the same tag: sections and boxes become Groups, headings Headings,
// paragraphs Paragraphs, plain lists Lists; anything else (cards, links, pictures, tables) stays as it is in a
// Custom HTML block. Prices come back as the AnyPress Site plugin's price shortcodes, found by the test prices.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import forms from './forms.mjs';
import { prices, TEST_PRICES } from './test-prices.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = (process.argv[2] ?? 'http://localhost:3311').replace(/\/$/, '');
const PUBLIC = resolve(process.env.ANYPRESS_SITE_DIR ?? resolve(HERE, '../../../../anypress-site'), 'public');
const ASSETS = resolve(HERE, '../plugin/assets');
const { chromium } = createRequire(resolve(HERE, '../../playground/package.json'))('playwright');

// Runs in the page: the block markup for one element and everything in it.
function toBlocks([rootSelector, partsOnly]) {
	const GROUP = new Set(['DIV', 'SECTION', 'HEADER', 'FOOTER', 'ARTICLE', 'ASIDE', 'MAIN']);
	const INLINE = new Set(['A', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'BR', 'CODE', 'SMALL', 'SUP', 'SUB', 'S', 'MARK', 'KBD', 'U', 'ABBR', 'TIME', 'WBR']);
	// Parts the site's scripts fill in or that the plugin's own blocks stand in for, kept whole.
	const WHOLE = '[data-drawing],[data-vignette],.video-tile,.logo-swap,[data-anypress-block]';
	const json = (o) => JSON.stringify(o).replace(/--/g, '\\u002d\\u002d').replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
	const comment = (name, attrs) => `wp:${name}${Object.keys(attrs).length ? ` ${json(attrs)}` : ''}`;
	const inlineOnly = (el) => [...el.querySelectorAll('*')].every((n) => INLINE.has(n.tagName));
	const hasText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
	// React's markers and other comments are taken out of the page itself, so the markup holds none.
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
	const comments = [];
	while (walker.nextNode()) comments.push(walker.currentNode);
	comments.forEach((c) => c.remove());
	const inner = (el) => el.innerHTML;
	const outer = (el) => el.outerHTML;
	// Class, id and the rest of an element's attributes, as a block stores them.
	const common = (el, attrs) => {
		const cls = el.getAttribute('class');
		if (cls) attrs.className = cls;
		if (el.id) attrs.anchor = el.id;
		const extra = {};
		for (const a of el.attributes) if (a.name !== 'class' && a.name !== 'id') extra[a.name] = a.value;
		if (Object.keys(extra).length) attrs.anypressAttrs = extra;
		return attrs;
	};
	const open = (tag, el, base) => {
		const cls = [base, el.getAttribute('class')].filter(Boolean).join(' ');
		return `<${tag}${el.id ? ` id="${el.id}"` : ''}${cls ? ` class="${cls}"` : ''}>`;
	};
	for (const s of document.querySelectorAll('main script')) s.remove();
	const html = (el) => `<!-- wp:html -->\n${outer(el)}\n<!-- /wp:html -->`;

	// The site's worked-out pieces become the AnyPress Site plugin's calculator block and example shortcode, which draw
	// the same markup from the live price list.
	const calc = (attrs) => `<!-- wp:anypress-io/calculator${attrs ? ` ${JSON.stringify(attrs)}` : ''} /-->`;
	const shortcode = (code) => `<!-- wp:html -->\n${code}\n<!-- /wp:html -->`;
	const WIDGETS = [
		['.calc-wrap', (el) => calc({ kind: 'earnings', ...(el.querySelector('.calc-seg.two [aria-pressed="true"] b')?.textContent === 'Reseller' ? { start: 'reseller' } : {}) })],
		['.calc', () => calc(null)],
		['.card', (el) => (el.querySelector('input[type="number"]') ? calc({ kind: 'course' }) : null)],
		['.compare', (el) => ({ 'A year of selling Website sites': shortcode('[anypress_example kind="seller"]'), 'Two brands on one wholesale bill': shortcode('[anypress_example kind="reseller"]') })[el.querySelector('[role="region"]')?.getAttribute('aria-label')] ?? null],
	];

	function block(el) {
		const tag = el.tagName;
		for (const [selector, make] of WIDGETS) {
			const made = el.matches(selector) ? make(el) : null;
			if (made) return made;
		}
		if (el.matches(WHOLE)) return html(el);
		if (GROUP.has(tag) && el.children.length && !hasText(el)) {
			const attrs = common(el, {});
			if (tag !== 'DIV') attrs.tagName = tag.toLowerCase();
			const t = tag.toLowerCase();
			return `<!-- ${comment('group', attrs)} -->\n${open(t, el, 'wp-block-group')}${[...el.children].map(block).join('\n')}</${t}>\n<!-- /wp:group -->`;
		}
		if (/^H[1-6]$/.test(tag) && inlineOnly(el)) {
			const level = Number(tag[1]);
			const attrs = common(el, level === 2 ? {} : { level });
			return `<!-- ${comment('heading', attrs)} -->\n${open(tag.toLowerCase(), el, 'wp-block-heading')}${inner(el)}</${tag.toLowerCase()}>\n<!-- /wp:heading -->`;
		}
		if (tag === 'P' && inlineOnly(el)) {
			return `<!-- ${comment('paragraph', common(el, {}))} -->\n${open('p', el, '')}${inner(el)}</p>\n<!-- /wp:paragraph -->`;
		}
		if ((tag === 'UL' || tag === 'OL') && el.children.length && !hasText(el) && [...el.children].every((li) => li.tagName === 'LI' && inlineOnly(li))) {
			const attrs = common(el, tag === 'OL' ? { ordered: true } : {});
			const items = [...el.children].map((li) => `<!-- ${comment('list-item', common(li, {}))} -->\n${open('li', li, '')}${inner(li)}</li>\n<!-- /wp:list-item -->`);
			return `<!-- ${comment('list', attrs)} -->\n${open(tag.toLowerCase(), el, 'wp-block-list')}${items.join('\n')}</${tag.toLowerCase()}>\n<!-- /wp:list -->`;
		}
		return html(el);
	}

	// Forms keep anypress.io's markup; site.js sends them to the Fluent Forms form with the same fields.
	for (const f of document.querySelectorAll('form')) {
		for (const i of f.querySelectorAll('input[name^="$"]')) i.remove();
		for (const a of ['action', 'enctype', 'method']) f.removeAttribute(a);
		f.setAttribute('data-anypress-form', f.querySelector('[name="business"]') ? '{{form:seller-application}}' : '{{form:sign-up}}');
	}

	if (partsOnly) {
		const header = [document.querySelector('body > aside.announce'), document.querySelector('body > header')].filter(Boolean).map(block).join('\n');
		return { header, footer: block(document.querySelector('body > footer')) };
	}
	return { main: block(document.querySelector(rootSelector)) };
}

// The site's own files (pictures, drawings, scenes) the markup points at, copied into the plugin's assets.
const used = new Set();
function assets(markup) {
	return markup
		.replace(/\/_next\/image\?url=([^&"]+)[^"]*/g, (_, u) => decodeURIComponent(u))
		.replace(/\s(?:srcset|sizes)="[^"]*"/g, '')
		.replace(/(src="|href="|poster="|url\((?:&quot;)?)(\/[^"#?)&]+\.(?:png|jpe?g|svg|webp|gif|avif|mp4|json|pdf|zip))(?=["?)&])/g, (_, before, path) => {
			if (path.startsWith('/videos/')) return `${before}{{videos}}${path.slice(7)}`;
			used.add(path);
			return `${before}{{assets}}${path}`;
		});
}

const pages = JSON.parse(readFileSync(resolve(HERE, 'pages.json'), 'utf8'));
const browser = await chromium.launch();
const tab = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
const kept = [];
const leftovers = [];
mkdirSync(resolve(HERE, 'html'), { recursive: true });
mkdirSync(resolve(HERE, 'parts'), { recursive: true });
for (const page of pages) {
	// Pages anypress.io draws in the browser (Try It) are the plugin's own block, which draws the same markup.
	if (page.block) {
		writeFileSync(resolve(HERE, 'html', `${page.file}.html`), `<!-- wp:${page.block} /-->\n`);
		kept.push(page);
		continue;
	}
	const res = await tab.goto(`${SITE}/${page.path}`, { waitUntil: 'load' });
	if (!res || res.status() !== 200) {
		console.log(`Left out /${page.path}: the site answers ${res?.status()}.`);
		continue;
	}
	if (page.path === '') {
		const parts = await tab.evaluate(toBlocks, [null, true]);
		writeFileSync(resolve(HERE, 'parts', 'header.html'), `${prices(assets(parts.header), leftovers, 'header')}\n`);
		writeFileSync(resolve(HERE, 'parts', 'footer.html'), `${prices(assets(parts.footer), leftovers, 'footer')}\n`);
	}
	const { main } = await tab.evaluate(toBlocks, ['body > main', false]);
	writeFileSync(resolve(HERE, 'html', `${page.file}.html`), `${prices(assets(main), leftovers, page.path || 'home')}\n`);
	kept.push({ path: page.path, file: page.file, title: page.title, template: 'anypress-io' });
}
await browser.close();

for (const path of used) {
	const from = resolve(PUBLIC, `.${path}`);
	const to = resolve(ASSETS, `.${path}`);
	if (!existsSync(from)) {
		console.log(`Missing in anypress-site/public: ${path}`);
		continue;
	}
	mkdirSync(dirname(to), { recursive: true });
	copyFileSync(from, to);
}

const priceList = JSON.parse(readFileSync(resolve(HERE, '../plugin/pricing.json'), 'utf8'));
writeFileSync(resolve(HERE, 'forms.json'), `${JSON.stringify(forms(priceList), null, '\t')}\n`);
writeFileSync(resolve(HERE, 'pages.json'), `${JSON.stringify(kept, null, '\t')}\n`);
console.log(`Wrote ${kept.length} page(s), ${used.size} picture(s) and file(s).`);
if (leftovers.length) {
	console.log(`Test prices left in the markup (${TEST_PRICES.note}):`);
	for (const l of leftovers) console.log(`  ${l}`);
	process.exitCode = 1;
}

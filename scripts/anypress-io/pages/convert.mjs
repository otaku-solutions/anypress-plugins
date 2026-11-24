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
		// What's New: the filter and the months are the AnyPress Changelog block, drawn from the Changes posts.
		if (el.matches('[aria-label="Show changes for"]')) return '<!-- wp:anypress-io/changelog /-->';
		if (el.matches('[aria-label="Show changes for"] ~ section')) return '';
		for (const [selector, make] of WIDGETS) {
			const made = el.matches(selector) ? make(el) : null;
			if (made) return made;
		}
		if (el.matches(WHOLE)) return html(el);
		if (GROUP.has(tag) && el.children.length && !hasText(el)) {
			const attrs = common(el, {});
			if (tag !== 'DIV') attrs.tagName = tag.toLowerCase();
			const t = tag.toLowerCase();
			return `<!-- ${comment('group', attrs)} -->\n${open(t, el, 'wp-block-group')}${[...el.children].map(block).filter(Boolean).join('\n')}</${t}>\n<!-- /wp:group -->`;
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

// Runs in the page: what it tells search engines and share previews.
function head() {
	const content = (selector) => document.querySelector(selector)?.getAttribute('content') ?? '';
	return {
		title: document.title,
		description: content('meta[name="description"]'),
		image: content('meta[property="og:image"]'),
		schema: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()),
	};
}

// anypress.io's own address with WordPress's trailing slash: /sellers#earnings is /sellers/#earnings.
const slash = (to) => to.replace(/^\/([^#?]*?)\/?([#?].*)?$/, (_, p, h) => `/${p ? `${p}/` : ''}${h ?? ''}`);

// A page's search and share details for Rank Math: prices as their shortcodes, anypress.io's own addresses as
// {{home}}, and its share picture saved in og/ for the Media Library ({{og}}).
const LIVE = 'https://anypress.io';
async function meta(seo, page) {
	const where = `${page.path || 'home'} (search details)`;
	let og = '';
	if (seo.image) {
		const res = await fetch(seo.image.replace(LIVE, SITE));
		if (res.ok) {
			mkdirSync(resolve(HERE, 'og'), { recursive: true });
			writeFileSync(resolve(HERE, 'og', `${page.file}.png`), Buffer.from(await res.arrayBuffer()));
			og = `${page.file}.png`;
		} else console.log(`No share picture for /${page.path}: ${res.status}`);
	}
	const fill = (value, key = '') => {
		if (Array.isArray(value)) return value.map((v) => fill(v));
		if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v, k)]));
		if (typeof value === 'number' && ['price', 'lowPrice', 'highPrice'].includes(key)) return prices(`$${value}`, leftovers, where);
		if (typeof value !== 'string') return value;
		if (value === seo.image) return '{{og}}';
		if (value === LIVE || value.startsWith(`${LIVE}/`)) return `{{home}}${slash(value.slice(LIVE.length) || '/')}`;
		return prices(value, leftovers, where);
	};
	return {
		title: prices(seo.title, leftovers, where),
		description: prices(seo.description, leftovers, where),
		image: og,
		// The business and the site are Rank Math's own (setup.php fills in its knowledge graph).
		schema: fill(seo.schema.filter((s) => !['Organization', 'WebSite'].includes(s['@type']))),
	};
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
		await tab.goto(`${SITE}/${page.path}`, { waitUntil: 'load' });
		kept.push({ ...page, seo: await meta(await tab.evaluate(head), page) });
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
	const seo = await tab.evaluate(head);
	const { main } = await tab.evaluate(toBlocks, ['body > main', false]);
	writeFileSync(resolve(HERE, 'html', `${page.file}.html`), `${prices(assets(main), leftovers, page.path || 'home')}\n`);
	kept.push({ path: page.path, file: page.file, title: page.title, template: 'anypress-io', seo: await meta(seo, page) });
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

// What's New, as Changes posts: anypress-site's changelog, its prices as shortcodes and its pictures in media/.
const SITE_SRC = resolve(PUBLIC, '..');
const log = await import(resolve(SITE_SRC, 'src/content/changelog.ts'));
const changes = log.CHANGES.map((c) => {
	const where = `changelog: ${c.id}`;
	const out = { ...c, title: prices(c.title, leftovers, where), body: prices(c.body, leftovers, where) };
	if (c.image) {
		const file = c.image.src.split('/').pop();
		mkdirSync(resolve(HERE, 'media'), { recursive: true });
		copyFileSync(resolve(PUBLIC, `.${c.image.src}`), resolve(HERE, 'media', file));
		out.image = { file, alt: c.image.alt };
	}
	if (c.link) out.link = { href: c.link.href.startsWith('/') ? slash(c.link.href) : c.link.href, label: c.link.label };
	return out;
});
writeFileSync(resolve(HERE, 'changes.json'), `${JSON.stringify({ kinds: log.KIND_LABELS, for: log.FOR_LABELS, changes }, null, '\t')}\n`);

// anypress.io's old addresses (next.config.ts), as Rank Math redirections: a ":name" part becomes a regex group.
const config = (await import(resolve(SITE_SRC, 'next.config.ts'))).default;
const redirects = (await config.redirects()).map((r) => {
	const from = r.source.replace(/^\//, '');
	const code = r.permanent ? 301 : 302;
	if (!from.includes(':')) return { from, to: slash(r.destination), code };
	let n = 0;
	return { from: `^${from.replace(/:[a-z]+/gi, '([^/]+)')}/?$`, to: slash(r.destination.replace(/:[a-z]+/gi, () => `$${++n}`)), code, regex: true };
});
writeFileSync(resolve(HERE, 'redirects.json'), `${JSON.stringify(redirects, null, '\t')}\n`);
console.log(`Wrote ${kept.length} page(s), ${used.size} picture(s) and file(s), ${changes.length} change(s), ${redirects.length} redirect(s).`);
if (leftovers.length) {
	console.log(`Test prices left in the markup (${TEST_PRICES.note}):`);
	for (const l of leftovers) console.log(`  ${l}`);
	process.exitCode = 1;
}

// anypress.io's sections as block patterns: one of each kind the pages use (cards, questions, steps, a price list...),
// taken from pages/html/ and written to plugin/patterns/, which the AnyPress Site plugin registers under "anypress.io".
// They show in the block inserter's Patterns tab, and the site tools' pattern search finds them, so a new section,
// added by hand or by an agent, comes in anypress.io's own look.
//
//   node patterns.mjs      (after convert.mjs)
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KINDS } from './kinds.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../plugin/patterns');

// A section is the kind of the first of the site's pieces (kinds.mjs) it holds; sections holding none (plain text)
// aren't patterns.

/** The top-level blocks of a page, as their whole block markup. */
function sections(markup) {
	const out = [];
	const re = /<!-- (\/?)wp:([a-z0-9/-]+)(?: (\{.*?\}))? (\/?)-->/g;
	let depth = 0;
	let start = -1;
	for (const m of markup.matchAll(re)) {
		const [, close, , , self] = m;
		if (self) {
			if (depth === 0) out.push(m[0]);
			continue;
		}
		if (!close) {
			depth++;
			if (depth === 1) start = m.index;
		} else {
			if (depth === 1) out.push(markup.slice(start, m.index + m[0].length));
			depth--;
		}
	}
	return out;
}

const PATHS = Object.fromEntries(JSON.parse(readFileSync(resolve(HERE, 'pages.json'), 'utf8')).map((p) => [p.file, p.path]));
const classes = (markup) => [...markup.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/));
const seen = new Map();
for (const file of readdirSync(resolve(HERE, 'html')).sort()) {
	const page = file.replace(/\.html$/, '');
	for (const section of sections(readFileSync(resolve(HERE, 'html', file), 'utf8'))) {
		// Sections that are a page's own widget (a calculator, the Try It page, What's New) stay on their page.
		if (/wp:anypress-io\/(?!button|drawing|icon)|\[anypress_example|data-anypress-form/.test(section)) continue;
		const has = new Set(classes(section));
		const kind = KINDS.find(([cls]) => has.has(cls));
		if (!kind || seen.has(kind[0])) continue;
		seen.set(kind[0], { slug: kind[0], title: kind[1], path: PATHS[page] ?? page, markup: section });
	}
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const { slug, title, path, markup } of seen.values()) {
	// Plugin patterns are PHP files with a header; the plugin's pictures and the videos are found as the pattern loads.
	const php = `<?php
/**
 * Title: ${title}
 * Slug: anypress-io/${slug}
 * Categories: anypress-io
 * Keywords: anypress.io, ${title.toLowerCase()}
 * Description: anypress.io's ${title.toLowerCase()} section, as on /${path}.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;
?>
${markup
	.replaceAll('<?', '&lt;?')
	.replace(/\{\{videos\}\}\/([a-z0-9.-]+)/g, "<?php echo esc_url( anypress_io_video( '$1' ) ); ?>")
	.replaceAll('{{assets}}', "<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>")}
`;
	writeFileSync(resolve(OUT, `${slug}.php`), php);
}
// One list for the plugin to register them from, so it reads a single file instead of each pattern's header.
writeFileSync(resolve(OUT, 'index.json'), `${JSON.stringify([...seen.values()].map(({ slug, title, path }) => ({ slug, title, path })), null, '\t')}\n`);
console.log(`${seen.size} pattern(s): ${[...seen.values()].map((p) => p.title).join(', ')}.`);

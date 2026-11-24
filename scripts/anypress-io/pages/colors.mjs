// anypress.io's colours as WordPress colours: rewrites plugin/assets/site/css/site.css (copied from anypress-site's
// build) so every colour it uses is one of the site's colour variables, and writes plugin/colors.json, the palette the
// AnyPress Site plugin gives WordPress (Appearance > Editor > Styles > Colors). The plugin points each variable at its
// WordPress colour, so a colour changed in Styles changes everywhere it's used.
//
//   node colors.mjs      (after copying a new site.css in; running it twice changes nothing)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = resolve(HERE, '../plugin/assets/site/css/site.css');

// Variable, name in Styles, value. The first block is anypress.io's own; the rest are colours its stylesheet typed out.
const PALETTE = [
	['ink', 'Ink', '#141414'],
	['ink-mid', 'Ink Mid', '#3d3a37'],
	['ink-soft', 'Ink Soft', '#5f5a55'],
	['paper', 'Paper', '#fff'],
	['paper-2', 'Paper Warm', '#faf8f5'],
	['panel', 'Panel', '#fff'],
	['line', 'Line', '#e9e4de'],
	['hair', 'Hairline', '#f1ede8'],
	['cream', 'Cream', '#fffaf0'],
	['butter', 'Butter', '#fff8ea'],
	['honey-tint', 'Honey Tint', '#fff1d6'],
	['honey', 'Honey', '#ffc75a'],
	['amber', 'Amber', '#ffb338'],
	['orange', 'Orange', '#ff7a2a'],
	['red', 'Red', '#f2413a'],
	['rose', 'Rose', '#ee2f5e'],
	['magenta', 'Magenta', '#d21fa4'],
	['accent', 'Accent', '#c8264d'],
	['deep-red', 'Deep Red', '#b4232c'],
	['tick-green', 'Tick Green', '#17703d'],
	['on-accent', 'On Accent', '#fff'],
];
// Typed-out colours and the variable each one is. #3d3935 is a hair off Ink Mid and becomes it.
const TYPED = { '#141414': 'ink', '#3d3a37': 'ink-mid', '#3d3935': 'ink-mid', '#5f5a55': 'ink-soft', '#faf8f5': 'paper-2', '#e9e4de': 'line', '#f1ede8': 'hair',
	'#fffaf0': 'cream', '#fff8ea': 'butter', '#fff1d6': 'honey-tint', '#ffc75a': 'honey', '#ffb338': 'amber', '#ff7a2a': 'orange', '#f2413a': 'red', '#ee2f5e': 'rose',
	'#d21fa4': 'magenta', '#c8264d': 'accent', '#b4232c': 'deep-red', '#17703d': 'tick-green' };
// White as a card's background is the Panel colour; as text or a shadow on ink, the Paper colour.
const WHITE = { background: 'panel', color: 'paper', 'box-shadow': 'paper' };

let css = readFileSync(CSS, 'utf8');
const vars = PALETTE.map(([slug, , value]) => `--${slug}:${value}`).join(';');
// The site's own variable block gets the added colours, once.
css = css.replace(/--ink:#141414;[^}]*?--on-accent:#fff/, vars);
let changed = 0;
css = css.replace(/\{([^{}]*)\}/g, (block, body) => {
	if (body.includes('--ink:#141414')) return block;
	const out = body.split(';').map((decl) => {
		const at = decl.indexOf(':');
		const prop = decl.slice(0, at).trim();
		if (at < 0 || prop.startsWith('--tw-') || prop === 'initial-value' || prop.startsWith('--color-')) return decl;
		let value = decl.slice(at + 1).replace(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g, (hex) => (TYPED[hex.toLowerCase()] ? `var(--${TYPED[hex.toLowerCase()]})` : hex));
		if (WHITE[prop]) value = value.replace(/#fff(?![0-9a-fA-F])/g, `var(--${WHITE[prop]})`);
		return `${decl.slice(0, at + 1)}${value}`;
	}).join(';');
	if (out !== body) changed++;
	return `{${out}}`;
});
writeFileSync(CSS, css);
writeFileSync(resolve(HERE, '../plugin/colors.json'), `${JSON.stringify(PALETTE.map(([slug, name, color]) => ({ slug, name, color })), null, '\t')}\n`);
console.log(`${changed} rule(s) now use the colour variables; ${PALETTE.length} colours in colors.json.`);

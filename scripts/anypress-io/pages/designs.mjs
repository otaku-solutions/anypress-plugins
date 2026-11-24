// anypress.io/designs and /designs/blocks: the theme's kits and AnyPress Blocks, each with a picture and a link that
// opens its example site on the Try It page, from the live site's pages and its KITS and BLOCKS lists.
import { buttons, drawing, faq, grid, group, h, head, image, p, page, section } from './blocks.mjs';
import { ctaBand, flow, pageHero, questions } from './shared.mjs';

const RAW = 'https://raw.githubusercontent.com/otaku-solutions/';
const THEME_REPO = 'https://github.com/otaku-solutions/anypress-theme';
const BLOCKS_REPO = 'https://github.com/otaku-solutions/anypress-blocks';
const tryBlueprint = (url, title) => `/try/?blueprint=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
const kitTry = (k) => tryBlueprint(`${RAW}anypress-theme/main/demo/${k.slug}/blueprint.json`, `${k.name} kit`);
const blockTry = (b) => tryBlueprint(`${RAW}anypress-blocks/main/demo/${b ? `blueprints/${b.slug}.json` : 'blueprint.json'}`, b ? `${b.title} block` : 'AnyPress Blocks');

/** A picture of an example page in a browser frame, opening that example live. */
const framed = (src, alt, href) => image(src, { alt, className: 'is-style-browser-window', link: href });

export const designs = (data) => page(
	pageHero({
		drawing: 'paint', eyebrow: 'designs', title: `${data.KITS.length === 16 ? 'Sixteen' : data.KITS.length} looks, ==one click== to switch.`,
		lead: 'Every site comes with ready-made looks for different kinds of business. Pick the one that fits, change the colours if you like, and your whole site follows.',
		extra: [buttons([{ text: 'See the looks →', url: '#kits' }, { text: 'See the extras', url: '#extras', outline: true }])],
	}),
	section([
		head({ eyebrow: 'the kits', title: 'Made for your kind of business.', lead: 'Each kit has its own colours, fonts, page layouts and sections. Try any of them live: the whole example site opens in your browser, ready to click around.', anchor: 'kits' }),
		grid(data.KITS.map((k) => [
			framed(`{{assets}}/designs/${k.slug}.webp`, `The home page of an example site in the ${k.name} kit`, kitTry(k)),
			h(3, k.name, { size: 'large' }),
			p(k.who, { size: 'small' }),
			p(`**[Try ${k.name} live ↗](${kitTry(k)})**`, { size: 'small' }),
		].join('\n\n')), { min: '15rem', count: 4, card: false }),
	].join('\n\n'), { style: 'tint' }),
	section([head({ eyebrow: 'any time', title: 'Try a new look without starting over.' }), flow([
		['paint', 'Pick a look', "Open your site's design screen and click a kit. Colours, fonts and spacing change across every page at once."],
		['words', 'Or ask your AI app', 'Connect AnyPress to your [AI app](/ai/) and ask to see the designs. Each kit shows as a live preview of your own site, right in the chat, with a button to switch it on.'],
		['backup', 'Change your mind', 'Your old look is saved when you switch, so you can go straight back. Your words, photos and pages stay as they are.'],
	])].join('\n\n')),
	section([
		head({ eyebrow: 'the extras', title: 'Pieces that do something.', lead: 'Add them to any page. They match your look, work on phones, and only load on the pages that use them.', anchor: 'extras' }),
		grid([
			...data.BLOCKS.map((b) => [h(3, `[${b.title}](/designs/blocks/#${b.slug})`, { size: 'medium' }), p(b.body, { size: 'small' })].join('\n\n')),
			[h(3, 'And the usual pieces', { size: 'medium' }), p('Headings, text, photos, buttons, columns, galleries and videos, all set up to follow your look.', { size: 'small' })].join('\n\n'),
		], { min: '17rem', count: 3 }),
		buttons([{ text: 'See them working →', url: '/designs/blocks/' }, { text: 'Try them all live ↗', url: blockTry(), outline: true }]),
	].join('\n\n'), { style: 'tint' }),
	section([head({ eyebrow: 'questions', title: 'Good to know.' }), group(faq([
		['Do I have to use a kit?', "No. Every site starts with the AnyPress theme's own look. Kits are there when you want one made for your kind of business."],
		['Can I change the colours and fonts myself?', "Yes. Pick a kit, then change any colour or font in the design screen. Every page follows, because pages use the site's colours and fonts rather than fixed ones."],
		['Will switching break my pages?', "No. A kit changes how things look, not what's on the page. Your text, photos, forms and shop stay where they are, and the old look is saved."],
		['Do the extras cost more?', 'No. Popups, countdowns, maps and the rest come with every site, on every plan.'],
		['What happens when I click Try it live?', 'A full WordPress site with that kit opens in your browser, using WordPress Playground. Click around, open the editor, change anything. Nothing is installed and nothing is saved, and it can take a minute to open.'],
		['Can I use the designs on another WordPress site?', `Yes. The [AnyPress theme](${THEME_REPO}) and the [AnyPress Blocks plugin](${BLOCKS_REPO}) are free and open source, for any WordPress site.`],
	], { firstOpen: false }), { layout: { type: 'constrained' } })].join('\n\n')),
	ctaBand({ drawings: ['paint', 'website', 'store'] }),
);

export const designBlocks = (data) => page(
	pageHero({
		drawing: 'tools', eyebrow: 'the blocks', title: 'Pieces that ==do something==.', lead: 'Popups, sliders, countdowns, maps and more, ready to drop into any page of your site. Try each one live before you use it.',
		extra: [buttons([{ text: 'Try them all live ↗', url: blockTry() }, { text: 'See the designs', url: '/designs/', outline: true }])],
	}),
	section([
		head({ eyebrow: 'every block', title: 'On every site, ready to use.', lead: 'Each picture is the block working on an example page. Try it live to open that page in your browser.' }),
		grid([
			...data.BLOCKS.map((b) => group([
				framed(`{{assets}}/designs/blocks/${b.slug}.webp`, `The ${b.title} block on an example page`, blockTry(b)),
				h(3, b.title, { size: 'large' }),
				p(b.body, { size: 'small' }),
				p(`**[Try the ${b.title.toLowerCase()} live ↗](${blockTry(b)})**`, { size: 'small' }),
			].join('\n\n'), { layout: { type: 'default' }, anchor: b.slug })),
			[drawing('note', 80), h(3, 'Missing one?', { align: 'center', size: 'large' }), p('Tell us what your site needs.', { align: 'center' }), p('**[Ask for a block](/contact/)**', { align: 'center' })].join('\n\n'),
		], { min: '17rem', count: 3, card: false }),
	].join('\n\n'), { style: 'tint' }),
	section([head({ eyebrow: 'built well', title: 'Made for real visitors.' }), flow([
		['paint', 'They match your look', "Every block uses your site's colours, fonts and spacing, so it changes with your kit."],
		['thirty', 'They keep pages quick', "A block's code only loads on the pages that use it. Pages without one carry nothing extra."],
		['open', 'They work for everyone', 'They work on phones and with a keyboard, and stay still for visitors who turn motion off.'],
	])].join('\n\n')),
	questions('Good to know.', [
		['How do I add one?', "Open a page in the editor, click the plus button and type the block's name, such as Popup or Countdown. Or ask your AI app to add one for you."],
		['Do they cost more?', 'No. Every block comes with every site, on every plan.'],
		['What happens when I click Try it live?', "A full WordPress site opens in your browser on that block's page, using WordPress Playground. Click around, open the editor, change anything. Nothing is installed and nothing is saved, and it can take a minute to open."],
		['Can I use them on another WordPress site?', `Yes. [AnyPress Blocks](${BLOCKS_REPO}) is a free, open source plugin that works with any theme.`],
	]),
	ctaBand({ drawings: ['tools', 'website', 'store'] }),
);

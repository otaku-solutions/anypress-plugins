// Sections that several anypress.io pages share, as the live site's shared components draw them.
import { buttons, columns, drawing, faq, form, grid, group, h, hand, head, image, list, p, section, table, video } from './blocks.mjs';

export const price = (type, size = 'small', period = 'monthly') => `[anypress_price type="${type}"${size !== 'small' ? ` size="${size}"` : ''}${period !== 'monthly' ? ` period="${period}"` : ''}]`;
export const num = (of) => `[anypress_number of="${of}"]`;
export const SHOP = 'https://shop.anypress.io';
/** A plan's page on the shop: /item/<shop slug>-<size>/. */
export const planUrl = (t, size = 'small') => `${SHOP}/item/${t.shopSlug}-${size}/`;

/** The title at the top of an inner page: a drawing, an eyebrow, the title and the lead, centred. */
export const pageHero = ({ drawing: d, eyebrow, title, lead, extra = [] }) => section([
	d && drawing(d, 180),
	head({ eyebrow, title, lead, level: 1 }),
	...extra,
].filter(Boolean).join('\n\n'), { width: 'narrow' });

/** "Sound familiar?": each problem people name, crossed out, with what AnyPress does about it. */
export const problemFix = ({ eyebrow = 'sound familiar?', title, who, items, style = 'tint', after }) => section([
	head({ eyebrow, title, lead: who && `For ${who.join(', ').replace(/, ([^,]*)$/, ' and $1').toLowerCase()}.` }),
	grid(items.map(([[pt, pb], [ft, fb]]) => [p(`~~${pt}~~`, { size: 'small' }), p(pb, { size: 'small' }), h(3, `✓ ${ft}`, { size: 'medium' }), p(fb)].join('\n\n')), { min: '20rem', count: items.length % 3 === 0 || items.length > 4 ? 3 : 2 }),
	after,
].filter(Boolean).join('\n\n'), { style });

/** Prices next to other platforms, for the same kind of site. */
export const priceCompare = (data) => table(['You’re building', 'Elsewhere', 'AnyPress'], data.SITE_TYPES.map((t) => [
	`**${t.name}**`,
	data.ELSEWHERE[t.id].map((o) => `[${o.who} ${o.plan}](${o.url}): $${o.price}/mo${o.yearly ? ' (billed yearly)' : ''}${o.note ? `, ${o.note}` : ''}`).join(' · '),
	`✓ **${price(t.id)}/mo**, no cut of your sales`,
]), { caption: `Starting prices per site, billed monthly unless marked, from each company's own pricing page on ${data.PRICES_CHECKED}. Prices change, so follow the links for today's. Each platform has features the others don't, and the card company's fee applies everywhere. With AnyPress, paying yearly gets you ${num('monthsFree')} months free.` });

/** Questions, with their title on the left on wide screens. */
export const questions = (title, items, { side = false } = {}) => section(side
	? columns([h(2, title, { size: 'x-large' }), faq(items, { firstOpen: false })], { verticalAlign: 'top' })
	: [head({ eyebrow: 'questions', title }), group(faq(items), { layout: { type: 'constrained' } })].join('\n\n'));

/** The band at the end of a page: drawings, a line, and the way to start. */
export const ctaBand = ({ eyebrow = 'your turn', title = 'Ready when you are.', body = "Pick what you're building. It's ready to use the same day, and we look after it from there.", href = '/#sites', label = 'Start your site', drawings = ['store', 'everything', 'bookings'] } = {}) => section([
	group(drawings.map((d) => drawing(d, 130)).join('\n'), { layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'center' } }),
	head({ eyebrow, title, lead: body }),
	buttons([{ text: `${label} →`, url: href }, { text: 'Talk to us', url: '/contact/', outline: true }]),
].join('\n\n'), { style: 'brand-soft' });

/** A list with ticks, beside its title. */
export const ticksBeside = (title, items, style = 'tint') => section(columns([h(2, title, { size: 'x-large' }), list(items)], { verticalAlign: 'top' }), { style });

/** The band under a page's hero: what every site comes with, each beside its drawing. */
export const includedStrip = (items) => group([
	hand('included with every site'),
	group(items.map(([d, l]) => group([drawing(d, 54), p(l, { size: 'small' })].join(''), { layout: { type: 'flex', flexWrap: 'nowrap' }, gap: 'small' })).join('\n'), { layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'center' }, gap: 'medium' }),
].join('\n\n'), { align: 'full', className: 'is-style-section-brand-soft', padding: ['large', 'medium'] });

/** "In one look": each fact as a card, its drawing, a name and a line. */
export const facts = (items) => grid(items.map(([d, term, detail]) => [drawing(d, 72), h(3, term, { align: 'center', size: 'medium' }), p(detail, { align: 'center', size: 'small' })].join('\n\n')), { min: '13rem', count: 4 });

/** Numbered steps, each under its drawing. */
export const flow = (steps) => grid(steps.map(([d, title, body], i) => [drawing(d, 110), h(3, `${i + 1}. ${title}`, { align: 'center', size: 'medium' }), p(body, { align: 'center', size: 'small' })].join('\n\n')), { min: '12rem', card: false, count: steps.length });

/** Short videos recorded on the real product, from the site's video folder ({{videos}}). */
export const videos = (items) => grid(items.map(([slug, title, length]) => [video(`{{videos}}/${slug}.mp4`, `{{videos}}/${slug}.jpg`), p(`**${title}**`, { size: 'small' }), p(length, { size: 'small' })].join('\n\n')), { min: '16rem', count: 3 });

/** Real dashboard screens (sample data), each beside what it lets you do. */
export const dashboardTour = (shots) => shots.map(({ src, alt, label, title, points }) => columns([
	[image(`{{assets}}${src}`, { alt, className: 'is-style-browser-window' }), p(label, { align: 'center', size: 'small' })].join('\n\n'),
	[h(3, title, { size: 'large' }), list(points)].join('\n\n'),
])).join('\n\n');

/** What sellers and resellers can put in the sites they sell. */
export const buildYourOwn = (style) => section([
	head({ eyebrow: 'for sellers and resellers', title: 'Sell our ready-built sites, or sites you build yourself.', lead: 'Your storefront sells whatever WordPress site you want to sell. Each order becomes its own copy, and we host and look after every one.' }),
	grid([
		['website', 'Start from ours', 'Sell the five ready-built sites as they are, with every tool already set up.'],
		['plug', 'Add any free plugin', 'Search the WordPress plugin directory from your dashboard and pick which of your sites get each one.'],
		['key', 'Bring your premium plugins', 'Upload the paid plugins you already use, with your licence key, and every new site gets them ready to go.'],
		['box', 'Or upload a whole site', 'Built a site you love? Upload it as your starting site, with its theme, pages and plugins. Every order is a copy.'],
	].map(([d, t, b]) => [drawing(d, 120), h(3, t, { align: 'center', size: 'medium' }), p(b, { align: 'center' })].join('\n\n')), { min: '14rem', count: 4 }),
	p("A few kinds of plugin can't be added because the hosting already does their job: page caching, backups, email sending, file managers and server firewalls.", { align: 'center', size: 'small' }),
].join('\n\n'), { style });

/** A free guide (or the calculator) on one side, and the tips-by-email sign-up on the other. */
export const guideBand = ({ eyebrow = 'free guide', title, body, href, label, tips = 'A few short emails, then the occasional update.', anchor, style }) => section(columns([
	[drawing('scroll', 120, { align: 'left' }), hand(eyebrow, { align: 'left' }), h(2, title, { size: 'x-large' }), p(body), buttons([{ text: label, url: href }], { justify: 'left' })].join('\n\n'),
	group([h(3, 'Want tips like this by email?', { size: 'large' }), p(tips), form('tips-by-email')].join('\n\n'), { className: 'is-style-section-card', padding: ['large', 'large'], layout: { type: 'default' } }),
], { verticalAlign: 'top' }), { anchor, style });

/** Most people hear "WordPress" and picture an empty install: what arrives instead, next to plain WordPress hosting. */
export const readyBuilt = (data, style) => section([
	drawing('tools', 130),
	head({ eyebrow: 'already use WordPress?', title: 'Ready to go out of the gate.', lead: 'Most WordPress hosts hand you a blank site and a week of setup. Yours arrives finished the same day, with everything installed, connected and working.' }),
	table(['Out of the box', 'Plain WordPress hosting', 'AnyPress'], [
		['Price for one site', `From $${data.WP_HOST.price}/mo for hosting alone (${data.WP_HOST.who})`, 'From [anypress_price lowest="1"]/mo, tools included'],
		['Shop, bookings, members or courses', 'Research, buy and install plugins', 'Installed and switched on'],
		['Contact forms and a mailing list', 'Another plugin to set up and connect', 'Ready, and every sign-up lands in your list'],
		['Getting found on Google', 'Install an SEO plugin and work through it', 'Set up on every page'],
		['Email that arrives', 'Set up a sending service yourself', 'Sends from your own address'],
		['Add-ons that break each other', "Hope they don't", 'Made by one team to work together'],
		['Security fixes', 'Your job', 'Done for you'],
	].map(([a, b, c]) => [`**${a}**`, b, `✓ ${c}`])),
	p(`${data.WP_HOST.who}'s price is from [its own pricing page](${data.WP_HOST.url}), billed monthly. [See every plugin in each site, by name](/included/)`, { align: 'center', size: 'small' }),
].join('\n\n'), { style });

export { hand };

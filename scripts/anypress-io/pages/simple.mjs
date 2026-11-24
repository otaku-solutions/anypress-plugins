// The shorter pages of anypress.io, from the live site's pages of the same address: about, contact, what's included,
// HighLevel, what's new (the changelog, CHANGES in site-data.json) and the three legal pages (LEGAL, the approved
// text as HTML).
import { buttons, columns, drawing, faq, form, grid, group, h, hand, head, htmlBlocks, list, p, page, section } from './blocks.mjs';
import { ctaBand, pageHero, questions } from './shared.mjs';

const EMAIL = 'support@anypress.io';
const ACCOUNT = 'https://shop.anypress.io/account/';

/** Rows of a title and its line, two to a row on wide screens, as the live site's bordered lists. */
const pairs = (items, { count = 2 } = {}) => grid(items.map(([t, b]) => [h(3, t, { size: 'medium' }), p(b)].join('\n\n')), { min: '18rem', count });

export const about = () => page(
	pageHero({ drawing: 'note', eyebrow: 'about', title: 'WordPress can do anything. ==We make it easy==.', lead: 'AnyPress is built by Otaku Solutions. We take the hard parts of WordPress off your plate, so you can get on with your business.' }),
	section(columns([
		h(2, 'WordPress can feel like a giant flea market.', { size: 'x-large' }),
		[
			p("There are thousands of add-ons, and nobody tells you which ones fit together. Then there's hosting, the padlock, backups and email to sort out before you sell a single thing.", { size: 'medium' }),
			p('So we picked the parts, fitted them together, and made the whole thing something you order instead of something you build. Pick the kind of site you need, and it arrives ready.', { size: 'medium' }),
		].join('\n\n'),
	], { verticalAlign: 'top' })),
	section([
		head({ title: 'What we believe.' }),
		grid([
			["Building a website shouldn't be hard.", "WordPress can do almost anything. Getting there shouldn't take a weekend of hunting for parts."],
			['Your site is yours.', 'It runs on WordPress, with your content in your own private website. If you ever leave, it comes with you.'],
			['Your sales are yours.', 'We charge for the site, not a share of what you sell on it.'],
			['Build it in the open.', 'Everything behind AnyPress is open source, so anyone can check how it works.'],
		].map(([t, b], i) => [hand(String(i + 1), { align: 'left' }), h(3, t, { size: 'large' }), p(b)].join('\n\n')), { min: '20rem', count: 2 }),
	].join('\n\n'), { style: 'tint' }),
	section(columns([
		[h(2, 'The code is open.', { size: 'x-large' }), p("All of it is public under the GPL license. You don't need any of this to use AnyPress, but it's there if you want to look.", { size: 'medium' })].join('\n\n'),
		list([
			'[**The engine**](https://github.com/otaku-solutions/anypress-api): builds, saves and runs every site',
			'[**The WordPress plugins**](https://github.com/otaku-solutions/anypress-plugins): the shop that sells sites, and the helper inside each one',
			'[**The partner dashboard**](https://github.com/otaku-solutions/anypress-dashboard): where partners see and manage their sites',
			'[**The theme**](https://github.com/otaku-solutions/anypress-theme) and [**AnyPress Blocks**](https://github.com/otaku-solutions/anypress-blocks): the look of every site, and its extra blocks',
		], { style: 'divided' }),
	], { verticalAlign: 'top' })),
	ctaBand(),
);

export const contact = () => page(
	pageHero({
		drawing: 'mailbox', eyebrow: 'contact', title: 'Ask us anything.',
		lead: 'Questions about AnyPress, selling sites to your clients, or creating sites from your own app? Send us a note.',
		extra: [buttons([{ text: EMAIL, url: `mailto:${EMAIL}` }, { text: 'Already a customer? Sign in', url: ACCOUNT, outline: true }])],
	}),
	section([
		grid([
			['Choosing a site', "Tell us what you're building and we'll point you to the right box."],
			['Selling sites to clients', 'Seller and reseller accounts, under your own name.'],
			['Creating sites from your app', 'Access for your developers.'],
			['Something else', 'Bigger projects, partnerships, press.'],
		].map(([t, b]) => [h(3, `[${t}](mailto:${EMAIL}?subject=${encodeURIComponent(`AnyPress: ${t}`)})`, { size: 'medium' }), p(b)].join('\n\n')), { min: '18rem', count: 2 }),
		p('Looking for a quick answer? Try the **[help page](/help/)**.', { align: 'center' }),
	].join('\n\n'), { style: 'tint' }),
);

export const included = (data) => page(
	pageHero({ drawing: 'tools', eyebrow: "what's included", title: "What's included, by name.", lead: "For people who know WordPress: the tools that come set up in each site. If these names mean nothing to you, that's fine. You don't need to know them." }),
	section([
		h(2, 'By site.', { size: 'x-large' }),
		...data.SITE_TYPES.map((t) => columns([
			[drawing(t.drawing, 90, { align: 'left' }), h(3, `[${t.name}](/sites/${t.id}/)`, { size: 'large' })].join('\n\n'),
			list(t.tools, { style: 'pills' }),
		], { verticalAlign: 'center' })),
	].join('\n\n'), { style: 'tint' }),
	section([
		h(2, 'On every site.', { size: 'x-large' }),
		pairs([
			['Its own WordPress and database', 'Every site runs in its own container. Nothing is shared with other sites.'],
			['SSL', 'Certificates are issued and renewed automatically.'],
			['Nightly backups', 'Files and database, saved every night, with restore.'],
			['Domains', 'A free .anypress.site address, plus your own domain. Supported DNS providers connect in one click with Domain Connect.'],
			['Email from your domain', "Store email sends from your own domain once it's verified."],
			['One-click sign-in', 'Open wp-admin from your account without a separate password.'],
			['The AnyPress theme and 17 design kits', 'A block theme with a kit for each kind of business, restyled in the Site Editor. [See the designs](/designs/).'],
			['AnyPress Blocks', 'Popup, carousel, before and after, countdown, counter, star rating, map, location finder and more. [Try them live](/designs/blocks/).'],
		]),
		p('Building on top of AnyPress? See the **[developer page](/developers/)**.'),
	].join('\n\n')),
	ctaBand(),
);

const HL_FAQ = [
	['Do I have to stop using HighLevel?', 'No. Keep HighLevel for contacts, texts, your inbox and your workflows. AnyPress adds the WordPress website next to it.'],
	["Can a site's forms and bookings reach HighLevel?", 'Yes. AnyPress connects to HighLevel, so people who book or write in on the website can land in that sub-account’s contacts.'],
	['What can a workflow do?', "Create a site, look one up, and suspend or resume it, so a site follows the client's subscription without anyone logging in."],
	['Is it ready now?', "The HighLevel app is in early access. Email us and we'll set you up."],
];

export const highlevel = () => page(
	pageHero({
		drawing: 'plug', eyebrow: 'for HighLevel agencies', title: 'Keep HighLevel. ==Give every client a real WordPress website==.',
		lead: "HighLevel runs your clients' contacts, texts and inbox. AnyPress adds the website: a real WordPress site for every sub-account, created from a workflow and looked after for you.",
		extra: [buttons([
			{ text: 'Get early access →', url: `mailto:${EMAIL}?subject=AnyPress%20for%20HighLevel` },
			{ text: 'Try one in your browser', url: '/try/?type=highlevel', outline: true },
			{ text: 'See how it connects', url: 'https://shop.anypress.io/docs/use-anypress-in-highlevel/', outline: true },
		])],
	}),
	section([
		head({ eyebrow: 'works with HighLevel', title: 'The website your HighLevel clients are missing.' }),
		grid([
			['plug', 'A site from a workflow', 'Add the AnyPress action to any HighLevel workflow, and a new sub-account comes with its own website.'],
			['nametag', 'Your brand, your prices', 'Clients see your name, not ours. You set what they pay.'],
			['server', 'Nothing to host', 'Every site gets its own space, a copy saved every night and security fixes, without you running servers.'],
			['website', 'Real WordPress', 'A store, bookings or courses when a client outgrows a funnel page, and a site they can keep.'],
		].map(([d, t, b]) => [drawing(d, 110), h(3, t, { align: 'center', size: 'medium' }), p(b, { align: 'center', size: 'small' })].join('\n\n')), { min: '14rem', count: 4 }),
		p('**[See every way to create sites automatically →](/automate/)**', { align: 'center' }),
	].join('\n\n'), { style: 'tint' }),
	questions('Questions', HL_FAQ),
	ctaBand({ eyebrow: 'ready?', title: 'Add websites to what you already sell.', body: 'Apply in a few minutes, then book a short call with us to get set up, billing included.', href: '/sell/', label: 'Apply to sell websites', drawings: ['sell', 'plug', 'website'] }),
);

/** A legal document: its title and effective date, then the approved text as plain blocks, one column wide. */
// The one price in the legal text, as shortcodes on the live price list.
const LEGAL_PRICED = [['currently 10,000 emails for $5', 'currently [anypress_number of="emailPackEmails"] emails for [anypress_number of="emailPackPrice"]']];
const priced = (html) => LEGAL_PRICED.reduce((s, [a, b]) => s.replace(a, b), html);

export const legal = (doc, title) => page(
	pageHero({ drawing: 'scroll', eyebrow: 'legal', title, lead: `Effective date: ${doc.effective}` }),
	section(group(htmlBlocks(priced(doc.html)), { layout: { type: 'constrained' }}), { width: 'narrow' }),
);

const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const WEEKDAY = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' });
const at = (date) => new Date(`${date}T00:00:00Z`);

/** What's new: each month, each day beside its changes, with the smaller ones folded away. */
export function changelog(data) {
	const entry = (c) => group([
		hand(data.KIND_LABELS[c.kind], { align: 'left', size: 'large' }),
		h(3, c.title, { size: 'large', anchor: c.id }),
		p(c.body),
		list(c.for.length ? c.for.map((f) => data.FOR_LABELS[f]) : ['Every site'], { style: 'pills' }),
		c.link && p(`**[${c.link.label} →](${c.link.href.replace(/^\/(\w[\w-]*)(\?|$)/, '/$1/$2')})**`, { size: 'small' }),
	].filter(Boolean).join('\n\n'), { layout: { type: 'default' } });
	const months = new Map();
	for (const c of data.CHANGES) {
		const m = MONTH.format(at(c.date));
		if (!months.has(m)) months.set(m, new Map());
		const days = months.get(m);
		days.set(c.date, [...(days.get(c.date) ?? []), c]);
	}
	const timeline = [...months].map(([month, days]) => [
		hand(month, { align: 'left', size: 'x-large' }),
		...[...days].map(([date, items]) => {
			const main = items.filter((c) => !c.minor);
			const minor = items.filter((c) => c.minor);
			return columns([
				[p(`**${DAY.format(at(date))}**`, { size: 'large' }), p(WEEKDAY.format(at(date)), { size: 'small' })].join('\n\n'),
				[...main.map(entry), minor.length && faq([[`${minor.length} smaller improvement${minor.length > 1 ? 's' : ''}`, minor.map((c) => `**${c.title}.** ${c.body}`).join('\n\n')]], { firstOpen: false })].filter(Boolean).join('\n\n'),
			], { verticalAlign: 'top', widths: ['25%', '75%'] });
		}),
	].join('\n\n')).join('\n\n');
	return page(
		pageHero({ drawing: 'note', eyebrow: "what's new", title: 'New on AnyPress. ==Already on your site==.', lead: "New designs, new ways to move in and new things your site can do, newest first. There's nothing to install or update. We add it to your site for you." }),
		section([timeline, p('How updates reach your site without breaking it: [safe updates](/updates/).', { size: 'small' })].join('\n\n')),
		section(group([
			hand('by email', { align: 'left' }),
			h(2, "What's new, once a month", { size: 'x-large' }),
			p('A short roundup of what reached your site that month, with a tip or two for using it.'),
			form('tips-by-email'),
		].join('\n\n'), { layout: { type: 'constrained' } }), { style: 'tint', width: 'narrow' }),
		ctaBand(),
	);
}

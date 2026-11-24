// anypress.io/who and /who/<group>: who AnyPress is for, and a page for each group of business, from the live site's
// who pages and its lists (AUDIENCE_GROUPS, GROUP_STORIES in site-data.json).
import { buttons, columns, drawing, grid, group, h, hand, head, image, list, p, page, section, table } from './blocks.mjs';
import { ctaBand, guideBand, num, pageHero, planUrl, price, problemFix, questions } from './shared.mjs';

const label = (t) => (t.short.toLowerCase() === 'website' ? 'website' : `${t.short.toLowerCase()} site`);
const groupUrl = (g) => g.href ?? `/who/${g.id}/`;

/** One row per group: who they are, in their words, what it's like, and the sites that fit. */
const groupRows = (data, groups, fitsLabel) => groups.map((g) => columns([
	drawing(g.drawing, 140),
	[h(3, g.name, { size: 'large' }), hand(g.line, { align: 'left', size: 'medium' }), p(g.body), list(g.examples, { style: 'inline' })].join('\n\n'),
	[p(`**${fitsLabel}**`, { size: 'small' }), list(g.fits.map((id) => { const t = data.SITE_TYPES.find((s) => s.id === id); return `[${t.name}](/sites/${id}/) · from ${price(id)}/mo`; }), { style: undefined }), buttons([{ text: 'Read more →', url: groupUrl(g), outline: true }], { justify: 'left' })].join('\n\n'),
], { verticalAlign: 'top' })).join('\n\n');

export function whoIndex(data) {
	const owners = data.AUDIENCE_GROUPS.filter((g) => g.side === 'owners');
	const technical = data.AUDIENCE_GROUPS.filter((g) => g.side === 'technical');
	return page(
		pageHero({
			drawing: 'pick',
			eyebrow: "who it's for",
			title: 'A website for your business, or websites to sell. ==We set it all up==.',
			lead: 'Most people use AnyPress for their own business: to get found, get booked and get paid. Others sell websites to their clients, or create them from their own software. Find yourself below.',
			extra: [buttons([{ text: 'A website for my business ↓', url: '#owners' }, { text: 'I sell or build websites ↓', url: '#technical', outline: true }])],
		}),
		section([
			head({ eyebrow: 'a website for your business', title: 'Businesses that use AnyPress.', lead: "Each of these gets a finished WordPress site that's set up for them and looked after every day. Here's who they are, what usually gets in the way, and which site fits." }),
			groupRows(data, owners, 'Sites that fit'),
			p('Not on the list? Anyone who needs a website can use AnyPress. Start from **[what your site needs to do](/#sites)**.', { align: 'center' }),
		].join('\n\n'), { style: 'tint', anchor: 'owners' }),
		section([
			head({ eyebrow: 'selling or building websites', title: 'People who sell websites, or build them into a product.', lead: 'We host and look after every site. You choose the price, your name is on it, and your customers deal with you.' }),
			groupRows(data, technical, 'Sites they sell most'),
			h(3, 'Which account do I need?', { align: 'center', size: 'x-large' }),
			table(['', 'Website owner', '[Seller](/sell/)', '[Reseller](/resellers/)'], [
				['Who it\'s for', 'A business that wants a website of its own', 'Freelancers, web design studios and groups selling sites under one name', 'Studios, franchises, hosts and software companies with several brands'],
				['How you start', "Pick a site and pay. It's ready in minutes.", 'Apply, then book a short call with us to get set up, billing included.', 'Apply to be a reseller, then book a short call to agree billing and get set up.'],
				['How you pay', 'Monthly or yearly, for each site', `Per site, as you sell. ${num('volumeMin')} to ${num('volumeMax')}% off from ${num('volumeFirstSites')} sites`, `One bill a month, ${num('wholesalePercent')}% off every site`],
				['Whose name customers see', 'Yours', 'Yours, on one storefront', 'Yours, on a storefront for each brand'],
				['Where you sign in', 'Sign in, here on anypress.io', 'The partner dashboard', 'The partner dashboard'],
			].map(([q, ...r]) => [`**${q}**`, ...r])),
			p('Creating sites from your own app? Read the **[developer page](/developers/)** and **[creating sites automatically](/automate/)**.', { align: 'center' }),
		].join('\n\n'), { anchor: 'technical' }),
		ctaBand({ eyebrow: 'still not sure?', title: "Ask us. We'll point you the right way.", body: "Tell us what you're building and we'll tell you which site fits, or whether selling sites suits you better.", href: '/contact/', label: 'Ask a question' }),
	);
}

export default function groupPage(data, id) {
	const g = data.AUDIENCE_GROUPS.find((x) => x.id === id);
	const pg = g.page;
	const story = data.GROUP_STORIES[id];
	const main = data.SITE_TYPES.find((t) => t.id === pg.example);
	const ex = main.example;
	const fits = g.fits.map((f) => data.SITE_TYPES.find((t) => t.id === f));
	return page(
		pageHero({
			drawing: g.drawing,
			eyebrow: g.name.toLowerCase(),
			title: pg.title,
			lead: pg.lead,
			extra: [
				buttons([{ text: `Start your ${label(main)} →`, url: planUrl(main) }, { text: 'Get the free guide', url: '#guide', outline: true }]),
				list([`From ${price(main.id)} a month`, 'No cut of your sales', `${num('trialDays')} days free to start`, '30-day money-back'], { style: 'inline' }),
			],
		}),
		story && problemFix({
			title: 'What usually gets in the way, and how AnyPress fixes it.',
			items: story.problems.map((pr, i) => [[pr.title, pr.body], [pg.benefits[i].title, pg.benefits[i].body]]),
			after: list(['We set it up and apply security fixes', 'A copy saved every night', 'Your own domain, and the site stays yours'], { style: 'inline' }),
		}),
		section([
			head({ eyebrow: 'see one', title: `A real ${main.name.toLowerCase()} site.`, lead: `${ex.name} is a made-up business. ${ex.what}` }),
			group(image(`{{assets}}/examples/${ex.shot}-card.webp`, { alt: `The ${ex.name} example site on a laptop and a phone`, className: 'is-style-browser-window', link: `/try/?type=${main.id}` }), { layout: { type: 'constrained', contentSize: '880px' } }),
			buttons([{ text: 'Open the example →', url: `/try/?type=${main.id}`, outline: true }]),
		].join('\n\n')),
		section([
			head({ eyebrow: 'good place to start', title: 'Plans that fit.', lead: 'Prices are monthly, for the Small size.', anchor: 'plans' }),
			grid(fits.map((t) => [drawing(t.drawing, 140), h(3, `[${t.name}](/sites/${t.id}/)`, { align: 'center', size: 'medium' }), p(t.pitch, { align: 'center', size: 'small' }), p(`**${price(t.id)}** / month`, { align: 'center', size: 'large' }), p(`[See what's inside →](/sites/${t.id}/)`, { align: 'center' })].join('\n\n')), { min: '15rem', count: fits.length }),
		].join('\n\n'), { style: 'tint' }),
		questions('Questions', pg.questions),
		guideBand({ title: pg.guide, body: 'Read it now, no sign-up needed.', href: `/guides/${id}/`, label: 'Read the guide →', tips: `A few short emails for ${g.name.toLowerCase()}, then the occasional update.`, anchor: 'guide', style: 'tint' }),
		ctaBand({ href: fits.length === 1 ? planUrl(fits[0]) : '#plans', label: fits.length === 1 ? `Start your ${label(fits[0])}` : 'Pick your plan', drawings: fits.map((t) => t.drawing).slice(0, 3) }),
	);
}

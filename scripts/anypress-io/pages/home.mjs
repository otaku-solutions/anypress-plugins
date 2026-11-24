// anypress.io's home page: the words from the live site (site PR #46's copy), built from theme sections.
import { buttons, columns, drawing, faq, grid, group, h, hand, head, image, list, p, page, section, table } from './blocks.mjs';
import { includedStrip, readyBuilt } from './shared.mjs';

const price = (type) => `[anypress_price type="${type}"]`;

// What each kind of site does, in three short results.
const RESULTS = {
	website: 'Found on Google · Messages to your inbox · Your own mailing list',
	bookings: 'Booked online · Paid upfront · Reminders sent for you',
	store: 'Sell online · Keep every sale · Customers on your list',
	community: "Sell courses · Paid members' area · Students on your list",
	everything: 'Store, bookings and courses · Customer help · One site',
};

export const INCLUDED = [
	['email', 'Email @yourbusiness.com, so you look professional'],
	['places', 'Get found on Google'],
	['bookings', 'Online booking and payments'],
	['nametag', "Your customer list, and it's yours"],
	['backup', 'Backed up every night'],
	['piggy', 'No cut of your sales'],
	['box', 'Yours to keep'],
	['thirty', '30-day money-back'],
];

export const PROBLEMS = [
	[['Nickel-and-dimed by add-ons', 'A site builder, then a booking app, a payments app, an email service and a contact list, each with its own bill.'], ['One price, everything in', 'Booking, payments, forms, your customer list and email are in your site from day one. Nothing else to buy.']],
	[["You're not technical, and one update can break your site", "Everything stops working, and you don't find out until you hear it from a customer."], ['We do the technical part', 'Your site is ready the same day. If you can write an email, you can edit your pages.']],
	[['Nobody nearby can find you', "You may be the best in town, but if no one knows it, you don't get the business."], ['Get found locally', 'Your site is ready for Google from day one, with your name, your services and your area in the right places.']],
	[['A cut of every sale', 'Some platforms take a percentage of every order on top of the monthly fee.'], ['No cut of your sales', "One monthly price. The card company's normal fee is the only fee on an order."]],
	[['A payment company can freeze your account', 'If your only way to take payments gets suspended, your shop stops selling overnight.'], ['Your own payment accounts, side by side', 'Payments go to your own accounts, not through us. On a store you can switch on Stripe and PayPal together, so customers can still pay if one has a problem.']],
	[['Hard to leave', "Many builders won't let you take your site with you."], ['Real WordPress you can take with you', 'Download a full copy of your site whenever you like. No lock-in.']],
];

const FAQ = [
	['Do I need to be technical?', "No. You pick what you're building and we set everything up. If you can write an email, you can edit your pages."],
	['Will my site show up on Google?', 'Your site is set up for Google from day one: page titles, link previews and a sitemap are done for you. Pages that say what you do and where you work do the rest.'],
	['What if an update breaks something?', "We apply security fixes for you, and a copy of your site is saved every night, so it can be put back the way it was. If something looks wrong, email us and we'll help."],
	['Can I use my own domain?', "Yes. Every site starts with a free address, and you can connect your own domain whenever you're ready. Email can come from it too."],
	['Can I move my current site over?', "If it runs on WordPress, yes. You add WordPress's free Reprint plugin to your current site, paste in the token we give you, and we copy the whole site across. [How moving works](/move/)."],
	['Do you take a cut of my sales?', "Never. You pay one monthly price for the site. The only fee on an order is the card company's."],
	['What if I want to leave?', "It's real WordPress, so you can take a full copy of your site with you. No lock-in."],
	['How do I get help?', "Email support@anypress.io and we'll help. There's a [help page](/help/) with guides too."],
];

export default function home(data) {
	const types = data.SITE_TYPES;
	const owners = data.AUDIENCE_GROUPS.filter((g) => g.side === 'owners');
	const technical = data.AUDIENCE_GROUPS.filter((g) => g.side === 'technical');
	const groupLink = (g) => (g.id === 'agencies' ? '/sellers/' : `/who/${g.id}/`);

	const hero = section(columns([
		[
			p('**New** [Bring your current WordPress site with you →](/move/)', { size: 'small' }),
			hand('a website that runs your business, set up for you', { align: 'left' }),
			h(1, 'Get found, get booked and get paid. ==We set it all up==.', { size: 'xx-large' }),
			p('Your site arrives ready to show up on Google, take bookings and payments, keep track of every customer and send email from your business name. You add your words and photos.', { size: 'medium' }),
			buttons([{ text: 'Start your site →', url: '#sites' }, { text: 'See prices', url: '/pricing/', outline: true }], { justify: 'left' }),
			list([`From [anypress_price lowest="1"] a month, everything included`, 'No cut of your sales', '[anypress_number of="trialDays"] days free to start', '30-day money-back']),
		].join('\n\n'),
		[
			list(['Buy hosting', 'Pick plugins', 'Pay for add-ons', 'Set up email', 'Back it up', 'Keep it secure'], { style: 'crossed' }),
			drawing('website', 260, { className: 'is-style-draw-in' }),
			hand('we do all of this for you'),
		].join('\n\n'),
	]));

	const included = includedStrip(INCLUDED);

	const examples = section([
		head({ eyebrow: 'click around', title: 'See a real one before you start.', lead: 'Five example sites, built on AnyPress exactly as yours would be.', anchor: 'examples' }),
		grid(types.map((t) => [
			image(`{{assets}}/examples/${t.example.shot}-card.webp`, { alt: `The ${t.example.name} example site on a laptop and a phone`, className: 'is-style-browser-window', link: `/try/?type=${t.id}` }),
			h(3, t.example.name, { size: 'large' }),
			p(`${t.short} · ${price(t.id)}/mo`, { size: 'small' }),
			p(t.example.what),
			buttons([{ text: 'Try It Yourself →', url: `/try/?type=${t.id}` }], { justify: 'left' }),
		].join('\n\n')), { min: '18rem', card: false, gap: 'x-large' }),
		p('Want a different look? [See all 17 designs](/designs/).', { align: 'center' }),
	].join('\n\n'));

	const problems = section([
		head({ eyebrow: 'sound familiar?', title: 'Stop paying for your website one piece at a time.', lead: 'For shops and makers, coaches and studios, course creators, chambers and associations, churches, franchises and small businesses.' }),
		grid(PROBLEMS.map(([[pt, pb], [ft, fb]]) => [
			p(`~~${pt}~~`, { size: 'small' }),
			p(pb, { size: 'small' }),
			h(3, `✓ ${ft}`, { size: 'medium' }),
			p(fb),
		].join('\n\n')), { min: '20rem' }),
	].join('\n\n'), { style: 'tint' });

	const sites = section([
		head({ eyebrow: 'pick one', title: 'What do you need your website to do?', lead: 'Each one arrives ready to use.', anchor: 'sites' }),
		grid(types.map((t) => [
			drawing(t.drawing, 160),
			h(3, `[${t.name}](/sites/${t.id}/)`, { align: 'center', size: 'medium' }),
			p(t.pitch, { align: 'center', size: 'small' }),
			hand(RESULTS[t.id], { size: 'medium' }),
			p(`**${price(t.id)}** / month`, { align: 'center' }),
			p(`[See what's inside →](/sites/${t.id}/)`, { align: 'center' }),
		].join('\n\n')), { min: '12rem' }),
	].join('\n\n'), { style: 'brand-soft' });

	const how = section([
		head({ eyebrow: 'how it works', title: 'You do the fun part. We do the rest.' }),
		columns([
			[
				h(3, 'Your part', { size: 'large' }), hand('about an afternoon', { align: 'left', size: 'medium' }),
				grid([['pick', "Pick what you're building", 'Five kinds of site, one price each.'], ['words', 'Add your words, photos and prices', 'Edit pages like a document.'], ['open', 'Open your doors', 'Share your link and take orders.']]
					.map(([d, t, s]) => [drawing(d, 110), h(4, t, { align: 'center', size: 'medium' }), p(s, { align: 'center', size: 'small' })].join('\n\n')), { min: '10rem' }),
			].join('\n\n'),
			[
				h(3, 'Our part', { size: 'large' }), hand('every day after', { align: 'left', size: 'medium' }),
				grid([['domain', 'Your own domain, connected'], ['email', 'Email from your business name'], ['backup', 'A copy saved every night'], ['lock', 'Kept safe and running'], ['card', 'Payments ready to switch on']]
					.map(([d, t]) => [drawing(d, 80), p(`**${t}**`, { align: 'center', size: 'small' })].join('\n\n')), { min: '10rem' }),
			].join('\n\n'),
		], { verticalAlign: 'top' }),
		p('**[See how it all works, step by step →](/how-it-works/)**', { align: 'center' }),
	].join('\n\n'), { style: 'tint' });

	const who = section([
		head({ eyebrow: "who it's for", title: 'Made for every kind of business.', lead: "No one comes first. If you need a website to run things, it's for you." }),
		grid(owners.map((g) => [drawing(g.drawing, 120, { link: groupLink(g) }), p(`**[${g.name}](${groupLink(g)})**`, { align: 'center' })].join('\n\n')), { min: '13rem' }),
		h(3, 'And for people who sell websites, or build them into software', { align: 'center', size: 'large' }),
		grid(technical.map((g) => [drawing(g.drawing, 120, { link: groupLink(g) }), p(`**[${g.name}](${groupLink(g)})**`, { align: 'center' })].join('\n\n')), { min: '13rem' }),
		p('**[Not sure which one you are? Start here →](/who/)**', { align: 'center' }),
	].join('\n\n'));

	const prices = section([
		head({ eyebrow: 'simple prices', title: 'One price per site. Nothing hidden.', lead: 'Starting prices for a small site, per month.' }),
		grid(types.map((t) => [p(`**[${t.short}](/sites/${t.id}/)**`, { align: 'center' }), p(`${price(t.id)}`, { align: 'center', size: 'xx-large' }), p('/ month', { align: 'center', size: 'small' })].join('\n\n')), { min: '10rem' }),
		list(['Pay yearly, get [anypress_number of="monthsFree"] months free', 'More room? Medium is [anypress_number of="mediumTimes"]×, Large is [anypress_number of="largeTimes"]×', '[anypress_number of="volumeFirstSites"] or more sites? Save [anypress_number of="volumeMin"] to [anypress_number of="volumeMax"]%'], { style: 'inline' }),
		h(3, 'Next to other platforms', { align: 'center', size: 'large' }),
		hand('same kind of site, smallest plan', { size: 'medium' }),
		table(['You’re building', 'Elsewhere', 'AnyPress'], types.map((t) => [
			`**${t.name}**`,
			data.ELSEWHERE[t.id].map((o) => `[${o.who} ${o.plan}](${o.url}): $${o.price}/mo${o.yearly ? ' (billed yearly)' : ''}${o.note ? `, ${o.note}` : ''}`).join(' · '),
			`✓ **${price(t.id)}/mo**, no cut of your sales`,
		]), { caption: `Starting prices per site, billed monthly unless marked, from each company's own pricing page on ${data.PRICES_CHECKED}. Prices change, so follow the links for today's. Each platform has features the others don't, and the card company's fee applies everywhere. With AnyPress, paying yearly gets you [anypress_number of="monthsFree"] months free.` }),
		buttons([{ text: 'See all prices', url: '/pricing/' }]),
	].join('\n\n'), { style: 'tint' });

	const sell = section(columns([
		drawing('sell', 240),
		[
			hand('have clients?', { align: 'left' }),
			h(2, 'Sell websites under your own name.', { size: 'x-large' }),
			p('Anyone with customers can offer AnyPress sites as their own. Your customers buy from your shop and never see us.'),
			list(['**Seller:** one free shop, pay per site, save up to [anypress_number of="volumeMax"]% as you grow.', '**Reseller:** several shops, [anypress_number of="wholesalePercent"]% off every site, one monthly bill.']),
			buttons([{ text: 'See how selling works →', url: '/how-it-works/sellers/' }, { text: 'Sell websites', url: '/sellers/', outline: true }], { justify: 'left' }),
		].join('\n\n'),
	]), { style: 'dark' });

	const questions = section([head({ eyebrow: 'questions', title: 'Questions people ask' }), group(faq(FAQ), { layout: { type: 'constrained' } })].join('\n\n'));

	const cta = section([
		group(['store', 'everything', 'bookings'].map((d) => drawing(d, 130)).join('\n'), { layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'center' } }),
		head({ eyebrow: 'your turn', title: 'Ready when you are.', lead: "Pick what you're building. It's ready to use the same day, and we look after it from there." }),
		buttons([{ text: 'Start your site →', url: '/#sites' }, { text: 'Talk to us', url: '/contact/', outline: true }]),
	].join('\n\n'), { style: 'brand-soft' });

	return page(hero, included, examples, problems, sites, how, who, readyBuilt(data, 'tint'), prices, sell, questions, cta);
}

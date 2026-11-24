// anypress.io/pricing: every kind of site at every size, what every site gets, the same site elsewhere, the
// calculator, the sizes, why it's priced this way and price questions. Prices are shortcodes on the live list.
import { calculator, grid, h, head, list, p, page, section, table } from './blocks.mjs';
import { ctaBand, num, pageHero, planUrl, price, priceCompare, problemFix, questions, ticksBeside } from './shared.mjs';

const EVERY_SITE = [
	'Your own domain',
	'Email from @yourbusiness.com',
	'Set up to be found on Google',
	'A list of every customer, with their history',
	'Contact forms that reach your inbox',
	'A copy saved every night, kept for 7 days, plus weekly copies for 4 weeks',
	'Security fixes done for you',
	'No cut of your sales',
];
const PITCH = {
	website: 'Get found on Google and get messages from customers.',
	bookings: 'Customers book a time and pay upfront. Reminders go out for you.',
	store: 'Sell online and keep every dollar, minus the card fee.',
	community: "Sell courses and run a paid members' area.",
	everything: 'A store, bookings, courses and customer help on one site.',
};
const PROBLEMS = [
	[['Nickel-and-dimed by add-ons', 'A builder plan, then a payments app, a booking app and an email service, each with its own bill.'], ['One price includes the tools', 'Everything your kind of site needs is switched on when it arrives. Nothing extra to buy.']],
	[['A cut of every sale', 'Some platforms take a percentage of your sales on top of the monthly fee.'], ['No cut, ever', "You pay one monthly price. The card company's normal fee is the only fee on an order."]],
	[['Not sure what size you need', "Pay for too little and the site struggles, too much and you're wasting money."], ['Start Small, move up any time', 'A bigger size starts right away and you only pay the difference for the rest of the month.']],
	[['Several sites add up fast', 'Every extra site is another full-price plan.'], ['Savings from your third site', `Every site saves ${num('volumeMin')}% from ${num('volumeFirstSites')} sites, up to ${num('volumeMax')}% as you grow.`]],
	[["Afraid of paying for something that doesn't fit", 'Some hosts lock you into a year up front with no way back.'], [`${num('trialDays')} days free, then 30 days to decide`, `Add a card and the first ${num('trialDays')} days are free. Cancel before then and you pay nothing. After that, your first payment is still covered for 30 days.`]],
];
const FAQ = [
	['Why does a shop cost more than a website?', 'Shops, bookings and members’ areas do more work and send more email, so they need more from the computers they run on. The price follows what the site needs.'],
	['Which size do I need?', 'Start with Small. It suits most new sites. If your site gets busy, move up to Medium or Large and nothing about your site changes except the room it has.'],
	['What happens if I send more email than my size includes?', 'Your everyday emails, like receipts and booking confirmations, keep sending. Newsletters to your list pause until the next month or until you move up a size.'],
	['Is there a yearly price?', `Yes. Paying yearly costs ${num('yearlyMonths')} times the monthly price, so you get ${num('monthsFree')} months free.`],
	['Do you charge a fee on sales?', 'No. The card company charges its normal fee on payments, and we add nothing on top.'],
	['Is there a free trial?', `Yes. Your first website plan starts with ${num('trialDays')} days free. You add a card when you start, and the plan's price starts after the free days unless you cancel first. It's one free trial per person.`],
	['How do I cancel?', `From your account, any time. Cancel in the first ${num('trialDays')} days and you pay nothing. Within 30 days of your first payment, you get that payment back.`],
	['Can you make changes to my site for me?', `Yes. Care gives your website time for changes each month, from ${num('careFrom')} a month, and one-time help to set it up or move it in. See [Care for your site](/care/).`],
];

export default function pricing(data) {
	const sizes = data.SIZES;
	return page(
		pageHero({
			drawing: 'piggy',
			eyebrow: 'prices',
			title: 'One monthly price. Everything included. No cut of your sales.',
			lead: 'Hosting, your site, booking, payments, forms, your customer list and business email are all in the price. Pick what your site needs to do; start small and grow any time.',
			extra: [p('Selling websites to your own clients? [See seller prices](/sellers/#tiers) or [reseller wholesale prices](/resellers/#wholesale).', { align: 'center' })],
		}),
		section([
			table(['Kind of site', ...sizes.map((s) => s.name), ''], data.SITE_TYPES.map((t) => [
				`**[${t.name}](/sites/${t.id}/)**\n${PITCH[t.id]}`,
				...sizes.map((s) => `[**${price(t.id, s.name.toLowerCase())}** /mo](${planUrl(t, s.name.toLowerCase())})`),
				`[Start →](${planUrl(t)})`,
			]), { className: 'is-style-comparison', caption: `Monthly prices in US dollars. Pay yearly and get ${num('monthsFree')} months free.` }),
		].join('\n\n')),
		ticksBeside('Included on every site.', EVERY_SITE),
		section([
			head({ eyebrow: 'side by side', title: 'What the same site costs elsewhere.', lead: "What you'd pay elsewhere for the same kind of site, before the add-ons.", anchor: 'compare' }),
			priceCompare(data),
			p(`WordPress hosting starts at $${data.WP_HOST.price} a month for the server alone (${data.WP_HOST.who}), before you buy a single add-on. [AnyPress vs Shopify](/compare/shopify/)`, { align: 'center', size: 'small' }),
		].join('\n\n'), { style: 'tint' }),
		section([
			head({ eyebrow: 'work it out', title: 'What will it cost?', lead: `Pick what you're building, the size and how many sites. ${num('volumeFirstSites')} or more sites save ${num('volumeMin')} to ${num('volumeMax')}% on every one.`, anchor: 'calculator' }),
			calculator('price', { align: 'wide' }),
		].join('\n\n')),
		section([
			head({ title: 'What each size includes.', lead: 'Every kind of site comes in the same three sizes.' }),
			grid(sizes.map((s) => [
				h(3, s.name, { size: 'large' }),
				p(s.goodFor),
				list([`**Computing power:** ${s.cpu}`, `**Storage:** ${s.storage}`, `**Emails a month:** ${s.emails}`, `**AI assistant messages a month:** ${s.assistant}`, `**Price:** ${s.times === 1 ? 'the starting price' : `${num(`${s.name.toLowerCase()}Times`)}× the starting price`}`]),
			].join('\n\n')), { min: '17rem' }),
		].join('\n\n'), { style: 'tint' }),
		problemFix({ eyebrow: "why it's priced this way", title: "Prices that don't surprise you later.", who: ['Small business owners', 'Makers and shops', 'Coaches and studios', 'Course creators', 'Chambers, churches and groups'], items: PROBLEMS, style: undefined }),
		questions('Price questions', FAQ, { side: true }),
		ctaBand({ title: 'Not sure which one?', body: "Tell us what your business does and we'll tell you which site fits.", href: '/contact/', label: 'Ask us' }),
	);
}

// anypress.io/affiliates and /affiliates/kit: the affiliate program (the rate and every example earning from the live
// price list) and the kit of words and logos, from the live site's pages of the same address.
import { buttons, columns, faq, grid, h, hand, head, p, page, section, table } from './blocks.mjs';
import { ctaBand, num, pageHero, problemFix } from './shared.mjs';

const EMAIL = 'support@anypress.io';
const SHOP = 'https://shop.anypress.io';
const JOIN = `${SHOP}/affiliates/`;
const RATE = `${num('affiliatePercent')}%`;
const MIN_PAYOUT = '$50';

const EXAMPLES = [['Website', 'website', false], ['Store', 'store', false], ['Everything', 'everything', false], ['Store', 'store', true], ['Everything', 'everything', true]];
const at = (type, yearly, extra = '') => `[anypress_price type="${type}"${yearly ? ' period="yearly"' : ''}${extra}]`;

export const affiliates = () => page(
	pageHero({
		drawing: 'coins', eyebrow: 'affiliate program', title: `Recommend AnyPress. ==Earn ${RATE}==.`,
		lead: `Share AnyPress with the people you build for, write for or teach. You earn ${RATE} of every new customer's first payment, on every plan.`,
		extra: [buttons([{ text: 'Join the program', url: JOIN }, { text: 'Affiliate sign in', url: JOIN, outline: true }, { text: 'Affiliate kit', url: '/affiliates/kit/', outline: true }])],
	}),
	problemFix({ who: ['Bloggers and video makers', 'Web designers', 'Coaches and teachers', 'Anyone people ask about websites'], title: 'Recommend websites without the headaches.', items: [
		[['People ask you where to make a website', "You want to point them somewhere that won't leave them stuck with setup and upkeep."], ["A site that's looked after", 'Every AnyPress plan is set up for them, with security fixes and a copy saved every night.']],
		[["Hard to tell what you'll earn", 'Commission tables full of tiers and conditions make it hard to know what one recommendation is worth.'], [`${RATE} of the first payment`, 'On every plan, monthly or yearly. The examples below show what one sale pays.']],
		[['Payouts that take months', 'Some programs hold your money until you reach a high threshold or a long payment cycle.'], ['Paid every month', `By PayPal at the start of each month, once you've earned ${MIN_PAYOUT}.`]],
		[['Writing about it from scratch', "Finding the right words, links and images for a product you don't run yourself takes time."], ['A ready-made kit', 'Copy, links and images are in the [affiliate kit](/affiliates/kit/).']],
	] }),
	section([head({ title: 'How it works.' }), grid([
		['Sign up', 'with your name, email and PayPal address. We approve new affiliates by hand, usually within a day.'],
		['Share your link', 'on your site, in your videos, with your clients. Anyone who buys within 30 days counts as yours.'],
		['They buy a plan', `and you earn ${RATE} of what they pay up front, monthly or yearly.`],
		['You get paid', `by PayPal at the start of each month, once you've earned ${MIN_PAYOUT}.`],
	].map(([t, b], i) => [hand(`step ${i + 1}`, { align: 'left' }), h(3, t, { size: 'medium' }), p(b)].join('\n\n')), { min: '14rem', count: 4 })].join('\n\n')),
	section([
		head({ title: 'What you could earn.', lead: 'A few examples, for one sale each.' }),
		table(['Plan', 'They pay', 'You earn'], EXAMPLES.map(([name, type, yearly]) => [`${name}, ${yearly ? 'yearly' : 'monthly'}`, at(type, yearly), `**${at(type, yearly, ' affiliate="1"')}**`])),
	].join('\n\n'), { style: 'tint', width: 'narrow' }),
	section([head({ title: 'The fine print.', anchor: 'terms' }), faq([
		['What counts as a sale?', "Any plan or email pack someone buys within 30 days of clicking your link. If they clicked someone else's link after yours, the later link gets the sale."],
		["What's the commission worked out on?", `${RATE} of the amount actually paid, after any discount and before tax. Renewals aren't included.`],
		['What if they ask for a refund?', 'If the customer is refunded, the commission on that sale is cancelled. We hold each commission for 30 days, the length of our money-back promise, before it can be paid.'],
		['Can I buy through my own link?', "No. Your own purchases don't earn commission."],
		["Is there anything I can't do?", "Don't bid on the AnyPress name in search ads, send spam, or promise things we don't offer. We may close accounts that do, and unpaid commission from those sales isn't paid."],
		['When do payouts go out?', `At the start of each month, by PayPal, once your approved balance reaches ${MIN_PAYOUT}. Smaller balances roll over to the next month.`],
		['Can these terms change?', `We'll give you 30 days' notice by email before we change the rate or terms. Questions? Email [${EMAIL}](mailto:${EMAIL}).`],
	], { firstOpen: false })].join('\n\n'), { width: 'narrow' }),
	ctaBand({ title: 'Ready to start earning?', body: "Joining is free. Once you're approved, your link and your earnings are in your affiliate dashboard.", href: JOIN, label: 'Join the program', drawings: ['coins', 'sell', 'piggy'] }),
);

const COPY = {
	shops: 'AnyPress gives you a real online store on your own domain, set up and looked after for you, with no cut of your sales.',
	regulated: 'If you sell supplements or CBD, AnyPress gives you your own store with your own payment account, instead of a marketplace listing.',
	courses: 'AnyPress runs your courses and community on your own site for one monthly price. No share of your course sales.',
	chambers: "AnyPress puts a chamber's members, dues and events on one website that nobody on the team has to maintain.",
	churches: 'AnyPress gives churches one site for giving, events and small groups, easy enough for any volunteer to update.',
	franchises: 'With AnyPress, every location gets its own site from the same starting point, and the price per site drops as you add more.',
	agencies: 'AnyPress lets you sell websites as a monthly service under your own name. They build and look after every site.',
	developers: 'AnyPress has an API that creates a WordPress site for each of your customers. They run the servers, security fixes and backups.',
};

export const affiliateKit = (data) => page(
	pageHero({
		drawing: 'words', eyebrow: 'affiliate kit', title: 'Everything you need to ==share AnyPress==.', lead: 'Your link, a few words for each kind of business, and our logo. Use what helps, and say it your way.',
		extra: [buttons([{ text: 'Get your link', url: JOIN }, { text: 'Program terms', url: '/affiliates/', outline: true }])],
	}),
	section([
		h(2, 'Your link.', { size: 'x-large' }),
		p(`Sign in to your affiliate dashboard to see your link. It looks like \`${SHOP}/?ref=123\`, where 123 is your number.`, { size: 'medium' }),
		p("You can add `?ref=123` to the end of any page on shop.anypress.io, such as a plan's page, and the sale still counts as yours.", { size: 'medium' }),
		p('Sharing in several places? Add a name for each one, like `&utm_campaign=youtube-oct`, so you can tell which one works best. Use lowercase words joined by dashes.', { size: 'medium' }),
	].join('\n\n'), { width: 'narrow' }),
	section([
		head({ title: 'Words for each kind of business.', lead: "Copy one, change it to sound like you, and only say what's true for you." }),
		...data.AUDIENCE_GROUPS.map((g) => columns([h(3, g.name, { size: 'medium' }), p(COPY[g.id] ?? g.body)], { verticalAlign: 'top', widths: ['33%', '67%'] })),
	].join('\n\n'), { style: 'tint' }),
	section([
		head({ title: 'Logo.', lead: "Use it as it is: don't stretch it, recolour it or put it on a busy background." }),
		buttons([{ text: 'Download the logo (SVG)', url: '{{assets}}/logo.svg', outline: true }, { text: 'Download the mark (SVG)', url: '{{assets}}/logo-mark.svg', outline: true }]),
		p("Please don't bid on the AnyPress name in search ads, send email to people who didn't ask for it, or promise things we don't offer. The full rules are on the **[program page](/affiliates/#terms)**.", { align: 'center' }),
	].join('\n\n')),
	ctaBand({ title: 'Not an affiliate yet?', body: `It's free to join. You earn ${RATE} of every new customer's first payment.`, href: JOIN, label: 'Join the program', drawings: ['coins', 'words', 'sell'] }),
);

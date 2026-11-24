// anypress.io/sites/<type>: one page per kind of site, from the live site's SiteTypePage and site-data.json.
import { buttons, drawing, grid, group, h, hand, head, list, p, page, section } from './blocks.mjs';
import { PROBLEMS } from './home.mjs';
import { ctaBand, includedStrip, num, planUrl, price, problemFix, questions } from './shared.mjs';

const EYEBROW = {
	website: 'a website that brings in customers',
	bookings: 'a website that fills your calendar',
	store: 'a store on your own website',
	community: 'courses and members on your own website',
	everything: 'everything your business runs on, in one website',
};
const HEADLINE = {
	website: 'Get found on Google and hear from customers.',
	bookings: 'Get booked and get paid while you work.',
	store: 'Sell online and keep every sale.',
	community: 'Sell your courses and grow your members.',
	everything: 'Sell, take bookings and teach, all on one site.',
};
const LEAD = {
	website: 'Your site arrives ready to show up on Google, take messages and grow your mailing list.',
	bookings: 'Your site arrives with a booking calendar, payment when people book and reminder emails, all switched on.',
	store: 'Your store arrives ready to take payments, ship orders and email your customers, with no cut of your sales.',
	community: "Your site arrives with courses, a members' area and paid access, all switched on.",
	everything: 'Your site arrives with a store, bookings, courses and a help desk, all working together.',
};
// Industry demos for each kind of site (the store template's playground/<type>-<demo>.json).
const DEMOS = { bookings: [['law-office', 'Law Office']] };
const LOOKED_AFTER = { title: 'Looked after for you', items: [['', 'Security fixes applied for you'], ['', 'A copy saved every night'], ['', 'The padlock (https) on your own domain'], ['', 'Two-step sign-in and limits on login attempts'], ['', 'Spam protection on every form'], ['', 'Logins for your team, each with their own access']] };
const INCLUDED = [
	['email', 'Email @yourbusiness.com'], ['places', 'Get found on Google'], ['nametag', "Your customer list, and it's yours"],
	['backup', 'Backed up every night'], ['piggy', 'No cut of your sales'], ['thirty', '30-day money-back'],
];

export default function sitePage(data, id) {
	const t = data.SITE_TYPES.find((s) => s.id === id);
	const d = data.SITE_DETAILS[id];
	const label = t.short.toLowerCase() === 'website' ? 'website' : `${t.short.toLowerCase()} site`;
	const others = data.SITE_TYPES.filter((s) => s.id !== id);
	const steps = [['pick', 'Pick a size and pay', 'a minute'], ['tools', `We build your ${label}`, 'minutes'], ['words', 'Make it yours', `add ${d.yourPart}`], ['open', 'Open your doors', 'we keep it running']];
	const asPair = (x) => (Array.isArray(x) ? x : [x.problem, x.fix]);

	const hero = section([
		hand(EYEBROW[id]),
		h(1, `${HEADLINE[id]} ==We set it all up==.`, { align: 'center', size: 'xx-large' }),
		p(`${LEAD[id]} You add ${d.yourPart}.`, { align: 'center', size: 'medium' }),
		buttons([{ text: `Start your ${label} →`, url: planUrl(t) }, { text: 'Try one in your browser', url: `/try/?type=${id}`, outline: true }, { text: 'See prices', url: '#sizes', outline: true }]),
		list([`From ${price(id)} a month`, 'No cut of your sales', `${num('trialDays')} days free to start`, '30-day money-back'], { style: 'inline' }),
		p(`**Made for:** ${t.idealFor.join(' · ')}`, { align: 'center', size: 'small' }),
		...(DEMOS[id] ?? []).map(([demo, name]) => p(`**Try one set up for:** [${name} →](/try/?demo=${demo})`, { align: 'center', size: 'small' })),
		grid(steps.map(([dr, title, sub]) => [drawing(dr, 110), p(`**${title}**`, { align: 'center' }), hand(sub, { size: 'medium' })].join('\n\n')), { min: '11rem', card: false }),
	].join('\n\n'));

	const included = includedStrip(INCLUDED);

	const tryStrip = section(group([
		hand('try it yourself', { align: 'left' }),
		p(`**${t.example.name}** is a made-up business on a real AnyPress ${label}.`),
		list(t.example.tryIt),
		buttons([{ text: 'Open the example →', url: `/try/?type=${id}` }], { justify: 'left' }),
	].join('\n\n'), { className: 'is-style-section-card', padding: ['large', 'large'], layout: { type: 'constrained' } }));

	const does = section([
		head({ eyebrow: 'what it does', title: 'What it does for you.' }),
		grid(t.features.map((f, i) => [drawing(d.featureDrawings[i], 140), h(3, f.title, { align: 'center', size: 'medium' }), p(f.body, { align: 'center' })].join('\n\n')), { min: '14rem', card: false }),
	].join('\n\n'));

	const can = section([
		head({ eyebrow: 'the full list', title: 'Everything you can do with it.', lead: 'All of it is switched on when your site arrives. Nothing extra to buy.' }),
		grid([...d.can, LOOKED_AFTER].map((g) => [h(3, g.title, { size: 'medium' }), list(g.items.map(([, x]) => x))].join('\n\n')), { min: '14rem' }),
		p('Know WordPress? **[See the tools by name](/included/)**', { align: 'center' }),
	].join('\n\n'), { style: 'tint' });

	const sizes = section([
		head({ eyebrow: 'pick a size', title: `${t.name} prices.`, lead: 'Same tools in every size. A bigger size gives your site more room, for when it gets busy.', anchor: 'sizes' }),
		grid(data.SIZES.map((s) => {
			const size = s.name.toLowerCase();
			return [
				s.times === 1 ? hand('most start here', { size: 'medium' }) : '',
				h(3, s.name, { align: 'center', size: 'large' }),
				p(s.goodFor, { align: 'center' }),
				p(`**${price(id, size)}**/month`, { align: 'center', size: 'x-large' }),
				p(`or ${price(id, size, 'yearly')} a year, ${num('monthsFree')} months free`, { align: 'center', size: 'small' }),
				list([`**Computing power:** ${s.cpu}`, `**Storage:** ${s.storage}`, `**Emails a month:** ${s.emails}`, `**AI assistant messages a month:** ${s.assistant}`]),
				buttons([{ text: `Start with ${s.name}`, url: planUrl(t, size), outline: s.times !== 1 }]),
			].filter(Boolean).join('\n\n');
		}), { min: '19rem' }),
		p(`You pay on our shop, and you can get your money back within 30 days. ${num('volumeFirstSites')} or more sites? Every site saves ${num('volumeMin')} to ${num('volumeMax')}%. **[Work out your price](/pricing/#calculator)**`, { align: 'center' }),
	].join('\n\n'), { style: 'tint' });

	const other = section([
		head({ eyebrow: 'or', title: 'Building something else?' }),
		grid(others.map((o) => [drawing(o.drawing, 130), h(3, `[${o.name}](/sites/${o.id}/)`, { align: 'center', size: 'medium' }), p(o.pitch, { align: 'center', size: 'small' }), p(`**${price(o.id)}** / month`, { align: 'center' })].join('\n\n')), { min: '13rem' }),
	].join('\n\n'), { style: 'tint' });

	return page(
		hero,
		included,
		tryStrip,
		problemFix({ title: 'Stop paying for your website one piece at a time.', items: [...PROBLEMS.slice(0, 2), ...d.problems.map(asPair)] }),
		does,
		can,
		sizes,
		questions(`Questions about ${t.name.toLowerCase()} sites`, d.questions),
		other,
		ctaBand({ title: `Ready for your ${label}?`, body: "It's ready to use the same day, and we look after it from there. Not for you? Get your money back within 30 days.", href: planUrl(t), label: `Start your ${label}`, drawings: [t.drawing, 'open', 'thirty'] }),
	);
}

/** anypress.io/sites: the five kinds of site, so each site's page has a home above it. */
export const sitesIndex = (data) => page(
	section([
		head({ eyebrow: 'pick one', title: 'What do you need your website to do?', lead: 'Each one arrives ready to use.', level: 1 }),
		grid(data.SITE_TYPES.map((o) => [drawing(o.drawing, 150), h(2, `[${o.name}](/sites/${o.id}/)`, { align: 'center', size: 'medium' }), p(o.pitch, { align: 'center', size: 'small' }), p(`**${price(o.id)}** / month`, { align: 'center' }), p(`[See what's inside →](/sites/${o.id}/)`, { align: 'center' })].join('\n\n')), { min: '12rem' }),
	].join('\n\n'), { style: 'brand-soft' }),
	ctaBand(),
);

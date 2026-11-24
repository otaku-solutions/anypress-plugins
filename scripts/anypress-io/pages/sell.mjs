// anypress.io/sell: apply to sell websites, with the application as a Fluent Forms form that goes to the AnyPress API
// (includes/application.php), from the live site's page of the same address.
import { form, grid, group, h, hand, p, page, section } from './blocks.mjs';
import { pageHero, problemFix } from './shared.mjs';

export default function sell() {
	return page(
		pageHero({ drawing: 'sell', eyebrow: 'for sellers and resellers', title: 'Sell websites under your name and get paid every month. ==We set it all up==.', lead: 'Tell us about your business below, then book a short call. We set up your storefront with you, then host every site, back it up every night and apply security fixes. Your price per site drops as you grow.' }),
		problemFix({ who: ['Freelance web designers', 'Small web design studios', 'Niche site sellers', 'Anyone whose clients ask for a website'], title: "Stop paying for every client's site one piece at a time.", items: [
			[["Paying for every client's site piece by piece", 'Hosting, a theme, plugin licences and an email service for every client, each with its own bill and renewal.'], ['One price per site, everything in', "Hosting, plugins, email, nightly copies and security fixes are in every site's price. Nothing else to buy."]],
			[['You get paid once, then start again at zero', 'You build a site, send the invoice, and next month you need a new project to get paid.'], ['A monthly service', 'Clients pay you every month for their site, at the prices you set.']],
			[['Hosting every client is a second job', "A hosting account, a renewal and a bill for every client, and you're the one they call."], ['One login for every site', 'Each order becomes its own website on our servers, and you see them all in one dashboard.']],
			[["One update breaks a client's site", "Everything stops working, and you hear it from your client before you know it's happened."], ['We look after every site', 'Security fixes applied for you and a copy saved every night, under your name, not ours.']],
		] }),
		section([
			grid([
				['Apply', 'Tell us about your business and who you build websites for. It takes two minutes.'],
				['Book a short call', 'We email you a link to book a call. We get to know your business, show you how selling works and agree how billing works, then approve your account.'],
				['Start selling', "Sign in, set up your shop, and sell your first website. There's no minimum."],
			].map(([t, b], i) => [hand(`step ${i + 1}`, { align: 'left' }), h(2, t, { size: 'large' }), p(b)].join('\n\n')), { min: '15rem', count: 3, card: false }),
			group([h(2, 'Your application', { size: 'x-large', anchor: 'apply' }), form('seller-application')].join('\n\n'), { className: 'is-style-section-card', padding: ['x-large', 'large'], layout: { type: 'default' } }),
		].join('\n\n')),
	);
}

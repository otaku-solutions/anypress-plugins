// anypress.io/resellers: several storefronts and one wholesale bill, from the live site's ResellersPage. Every price
// is a shortcode on the live price list; the two-brand example is [anypress_example kind="reseller"].
import { buttons, calculator, head, p, page, section, shortcode, table } from './blocks.mjs';
import { INCLUDED } from './home.mjs';
import { buildYourOwn, ctaBand, dashboardTour, facts, flow, includedStrip, num, pageHero, problemFix, questions, videos } from './shared.mjs';

const WHO = ['Studios with several brands', 'Franchise offices', 'Web hosts', 'Software companies', 'Groups that run sites for members'];
const W = num('wholesalePercent');

const FACTS = [
	['shops', 'What you get', 'Several storefronts under one login: one for each brand, region or kind of customer.'],
	['coins', 'What a site costs you', `${W}% off our list price for every live site, from the first one. A Small Website is [anypress_price type="website" wholesale="1"] a month.`],
	['bill', 'How you pay', "One bill on the 1st, for the days each site was live. Suspended sites don't count."],
	['piggy', 'What you charge', 'Whatever you like, for each brand. Customers buy from your storefronts and pay you.'],
	['key', 'For your developers', 'Partner keys for each brand, so your own app can create, change and remove sites.'],
	['server', 'What we do', 'Build every site, host it, save a copy every night, apply security fixes and send its email.'],
	['nametag', 'Your team', 'Invite the people who help you, and choose who can change things and who can only look.'],
	['words', 'How to start', 'Apply, book a short call with us to agree billing, and we set up your account and your first storefronts.'],
];

const PROBLEMS = [
	[['Every brand needs its own setup', 'A separate account, login and set of sites for each brand, region or kind of customer.'], ['Several storefronts, one login', 'Run a storefront for each brand, region or kind of customer, and switch between them at the top of the dashboard.']],
	[['A pile of bills every month', 'Hosting bills per brand and per client, each to check and pay.'], ['One wholesale bill', `Every live site across every brand on one bill, ${W}% off, sent on the 1st.`]],
	[['Your developers wait on manual steps', 'Someone has to click through a setup for every new site your product sells.'], ['Partner keys for each brand', 'Your code creates, changes and removes sites on its own. See the [developer page](/developers/).']],
	[['Your brand gets lost', "Hosting emails, error pages and dashboards show someone else's name."], ['Your brand, not ours', 'Customers buy from your storefronts at your prices. Even if a site is ever unavailable, they see your brand.']],
	[['Servers to run for every brand', 'Security fixes, backups and keeping hundreds of sites online.'], ['We run every site', 'Security fixes, nightly copies and keeping each site safe are done for you.']],
	[['Afraid of being locked in', 'If the platform changes or disappears, your whole business goes with it.'], ['Open source underneath', 'Everything behind AnyPress is public, so you can always [run it yourself](/self-host/).']],
];
// The pains resellers name first, in the homepage's words.
const TOP_PROBLEMS = [
	[['Paying for every brand piece by piece', 'Hosting, plugin licences and email for every brand and every client, each with its own bill.'], PROBLEMS[1][1]],
	[['One update breaks a pile of sites', 'Everything stops working, and your customers hear it before you do.'], PROBLEMS[4][1]],
	PROBLEMS[0],
	PROBLEMS[2],
	PROBLEMS[3],
	PROBLEMS[5],
];

const VIDEOS = [
	['a-resellers-first-day', "A reseller's first day: storefronts, bill and keys", '1:06'],
	['your-first-site-from-the-api', 'Your first site from the API', '1:47'],
	['create-sites-automatically', 'Create sites from a form or a payment', '0:38'],
];

const DASHBOARD = [
	{ src: '/sell/reseller-bill.webp', label: 'app.anypress.io · Reseller Account', alt: "The Reseller Account page: this month's bill so far, site by site at wholesale, past invoices and the reseller's storefronts", title: 'One bill for every brand', points: ["This month's bill so far, line by line: each storefront, each size, the days its sites were live and the price each.", 'Past invoices to view or download, and a CSV of any month.', 'Your storefronts in one list, with a button to add the next one.'] },
	{ src: '/sell/reseller-stores.webp', label: 'app.anypress.io · Stores', alt: "A reseller's Stores list: sample sites with the storefront that sold each one, its version, domain, status and last backup", title: 'Every site, from every storefront', points: ["See which storefront sold each site, and whether it's ready, being built or suspended.", 'Open any site, log in to its WordPress with one click, connect its domain or restore a backup.', "Move a customer's existing site in, or start one by hand."] },
	{ src: '/sell/reseller-sales-kit.webp', label: 'app.anypress.io · Sales Kit', alt: 'The Sales Kit: eight kinds of customer, each with the plan to sell them and what you keep each month at wholesale', title: 'A plan for each kind of customer', points: ['Eight kinds of customer, from shops and course creators to franchises and software teams, each with a day-by-day plan and the messages to send.', 'What you keep from each sale, worked out at your wholesale price.', "Everything goes out under the storefront's own name, never ours."] },
];

const LOCATIONS = [
	['Starting on brand', 'Each location set up by hand, and they drift apart', '✓ Every location is copied from the same starting site'],
	['Local details', 'Every change waits for head office', '✓ Each location changes its own hours, team, offers and bookings'],
	['Its own address', "A folder on head office's site", "✓ Its own domain, under the location's own name"],
	['When something breaks', 'One problem can take every location down', '✓ Each site is walled off, so a problem stays in one place'],
	['Billing', 'One big plan for everyone, whatever they use', "✓ Each location's site on your bill only while it's live"],
];

const SELLER_OR_RESELLER = [
	['Storefronts', 'One, with your name on it', 'Several, under one login'],
	['How you pay', 'For each site, as you sell', 'One wholesale bill a month'],
	['Saving as you grow', `${num('volumeMin')} to ${num('volumeMax')}% off with ${num('volumeFirstSites')} or more sites`, `${W}% off every site, from the first one`],
	['Sites you sell', 'Ours, or your own with any plugins', 'Ours, or your own, different for each storefront'],
	['Partner keys for developers', 'No', 'Yes, for each brand'],
	['Who it suits', 'Freelancers, studios and groups with one brand', 'Studios, franchises, hosts and software companies with several'],
];

const STEPS = [
	['words', 'Apply', 'Tell us about your business and your brands. It takes a few minutes.'],
	['question', 'Book a short call', 'We answer your questions, agree how billing works and set up your reseller account.'],
	['shops', 'Set up your storefronts', 'Add a storefront for each brand, with its own domain, prices and starting site.'],
	['coins', 'Sell', 'Your customers pay you. Each site is built in minutes, and we send one bill a month.'],
];

const FAQ = [
	['What does it cost?', `${W}% off our list price for every live site, on one bill each month. A site that goes live mid-month is billed for the days it was live, and suspended sites don't count. You charge your customers whatever you like.`],
	['Do my customers see AnyPress?', 'No. They buy from your storefronts, at your prices, under your brands.'],
	['Seller or reseller: which am I?', "One business name? You're a seller. More than one? You're a reseller. One application covers both, and we'll set up the right account."],
	['Can each brand sell different sites?', 'Yes. Each storefront has its own starting site, its own prices and its own domain.'],
	['Can I start as a seller and become a reseller later?', "Yes. Tell us when you're ready and we'll move your account over."],
	['Can my developers create sites automatically?', 'Yes, with or without a developer. Partner keys let your code create, change and remove sites for each brand, and no-code tools like n8n, Make and Zapier can do it from a form, a payment or your CRM. See [create sites automatically](/automate/).'],
	['Who do I ask?', 'Email [support@anypress.io](mailto:support@anypress.io).'],
];

export default function resellers(data) {
	return page(
		pageHero({
			drawing: 'shops',
			eyebrow: 'for businesses with more than one brand',
			title: 'Sell websites under every brand you run. ==We set it all up==.',
			lead: `Each brand gets its own storefront, ready to sell, at ${W}% off every site. We build every site, host it and look after it, and you get one bill on the 1st of the month.`,
			extra: [buttons([{ text: 'Apply to become a reseller →', url: '/sell/' }, { text: "Watch a reseller's first day (1:06)", url: '#videos', outline: true }])],
		}),
		includedStrip(INCLUDED),
		section([head({ eyebrow: 'the short version', title: 'Reselling with AnyPress in one look.' }), facts(FACTS)].join('\n\n'), { style: 'tint' }),
		problemFix({ title: "Stop paying for every brand's sites one piece at a time.", who: WHO, items: TOP_PROBLEMS, style: undefined }),
		section([head({ eyebrow: 'recorded on the real product', title: 'Watch it work.', lead: 'Short videos of the real dashboard: your storefronts and bill, and sites created from your own code, a form or a payment.' }), videos(VIDEOS)].join('\n\n'), { style: 'tint', anchor: 'videos' }),
		section([head({ eyebrow: 'sample data, real screens', title: 'Your dashboard.', lead: 'Every brand, every site and your bill in one place, at app.anypress.io.' }), dashboardTour(DASHBOARD)].join('\n\n')),
		section([
			head({ eyebrow: 'franchises and multi-location brands', title: 'A website for every location, not a page on yours.', lead: 'Each location gets a real site of its own, copied from the same starting site, so it looks like your brand and the local owner can still make it theirs.' }),
			table(['', "A page on head office's site", 'A site for every location'], LOCATIONS.map(([a, b, c]) => [`**${a}**`, b, c])),
			p("Head office's own site can list every branch next to a map with the Location finder block, and visitors tap “Near me” to find the closest.", { align: 'center', size: 'small' }),
		].join('\n\n'), { style: 'tint' }),
		section([
			head({ eyebrow: 'wholesale prices', title: `${W}% off every site.`, lead: `Prices for the Small size. Medium is ${num('mediumTimes')}× and Large is ${num('largeTimes')}×, with the same discount. You set your own prices for your customers.`, anchor: 'wholesale' }),
			table(['Kind of site', 'Website owners pay', 'You pay'], data.SITE_TYPES.map((t) => [`**${t.name}**`, `[anypress_price type="${t.id}"] a month`, `**[anypress_price type="${t.id}" wholesale="1"]** a month`])),
		].join('\n\n')),
		section([
			head({ eyebrow: 'a worked example', title: 'Two brands, one bill.', lead: 'Say you run two brands: one selling Small Website sites to trades, one selling Small Bookings sites to salons.' }),
			shortcode('[anypress_example kind="reseller"]'),
			p('The prices your customers pay are only an example: you set them for each brand. [Try your own numbers](#earnings).', { align: 'center', size: 'small' }),
		].join('\n\n'), { style: 'tint', anchor: 'example' }),
		section([
			head({ eyebrow: 'your own numbers', title: 'What could you earn?', lead: 'Pick a kind of site, how many you sell and your price. The table under the result shows the same numbers as a seller, so you can see which account fits.' }),
			calculator('earnings', { align: 'wide', start: 'reseller' }),
		].join('\n\n'), { anchor: 'earnings' }),
		section([
			head({ eyebrow: 'two ways to sell', title: 'Seller or reseller?', lead: 'One business name is a seller. More than one is a reseller.' }),
			table(['', 'Seller', 'Reseller'], SELLER_OR_RESELLER.map(([a, b, c]) => [`**${a}**`, b, c])),
		].join('\n\n'), { style: 'tint' }),
		buildYourOwn(),
		section([head({ eyebrow: 'how to start', title: 'Four steps to your first sale.' }), flow(STEPS)].join('\n\n'), { style: 'tint' }),
		questions('Reseller questions', FAQ),
		ctaBand({ eyebrow: 'ready?', title: 'Tell us about your brands.', body: 'Apply in a few minutes, then book a short call with us to get set up, billing included.', href: '/sell/', label: 'Apply to become a reseller', drawings: ['shops', 'bill', 'key'] }),
	);
}

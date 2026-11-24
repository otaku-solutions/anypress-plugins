// anypress.io/sellers: selling websites under your own name, from the live site's SellersPage. Every price is a
// shortcode on the live price list; the worked example is [anypress_example], worked out from it.
import { buttons, calculator, columns, drawing, grid, h, hand, head, list, p, page, section, shortcode } from './blocks.mjs';
import { INCLUDED } from './home.mjs';
import { buildYourOwn, ctaBand, dashboardTour, facts, flow, includedStrip, num, pageHero, problemFix, questions, videos } from './shared.mjs';

const WHO = ['Freelance web designers', 'Small web design studios', 'Marketing consultants', 'Chambers selling to members', 'Anyone whose clients ask for a website'];

const FACTS = [
	['shops', 'What you sell', 'Websites as a monthly service: Website, Bookings, Online store, Community & courses and Everything, each in Small, Medium and Large.'],
	['piggy', 'What you charge', 'Whatever you like, monthly or yearly. Clients pay you, into your own payment account.'],
	['coins', 'What a site costs you', `Our list price for each live site, from [anypress_price lowest="1"] a month. ${num('volumeMin')} to ${num('volumeMax')}% off every site once you have ${num('volumeFirstSites')} or more.`],
	['store', 'Your storefront', 'Free. A shop on your own domain, with your name, logo, prices and emails.'],
	['server', 'What we do', 'Build every site, host it, save a copy every night, apply security fixes and send its email.'],
	['nametag', 'What you do', 'Find clients and look after them, the way you do today. They never see AnyPress.'],
	['open', 'How fast', 'A paid order becomes a working site in minutes. Nobody has to press a button.'],
	['words', 'How to start', "Apply in two minutes, then book a short call with us to get set up, billing included. There's no minimum."],
];

const PROBLEMS = [
	[['You get paid once, then start again at zero', 'You build a site, send the invoice, and next month you need a new project to get paid.'], ['Websites become a monthly service', 'Every client pays you each month, so each new one adds to what comes in. [See a year of it](#example).']],
	[['Building the same site again and again', 'Install WordPress, add the theme and plugins, set up email, connect the domain. For every client.'], ['Build it once, sell it every time', 'Make your starting site once, or use one of ours. Every order is a copy of it, ready in minutes.']],
	[['Hosting every client is a second job', "A hosting account, a login, a renewal and a bill for every client, and you're the one they call."], ['Every client under one login', 'Each order becomes its own website on our servers, and every one of them is in one list on your dashboard.']],
	[['Upkeep eats your weekends', "Security fixes, backups and the odd emergency, for every site you've ever built."], ['We look after every site', 'Security fixes applied for you, a copy saved every night and restored in one click, and the padlock on every site.']],
	[['Big hosts put their name on everything', "Your clients see someone else's brand, and it's easy for them to go straight to the host."], ['Your name, not ours', 'Your storefront, your domain, your prices and emails from your name. Your clients never see AnyPress.']],
];
// The pains sellers name first, in the homepage's words.
const TOP_PROBLEMS = [
	[["Paying for every client's site piece by piece", 'Hosting, a theme, plugin licences and an email service for every client, each with its own bill and renewal.'], ['One price per site, everything in', "Hosting, plugins, email, nightly copies and security fixes are in every site's price. Nothing else to buy."]],
	[["One update breaks a client's site", "Everything stops working, and you hear it from your client before you know it's happened."], PROBLEMS[3][1]],
	PROBLEMS[0],
	PROBLEMS[1],
	PROBLEMS[4],
];

const VIDEOS = [
	['a-sellers-first-sale', "A seller's first sale, from checkout to a finished site", '0:52'],
	['set-up-your-storefront', 'Set up your storefront', '1:45'],
	['create-sites-automatically', 'Create sites from a form or a payment', '0:38'],
];

const DASHBOARD = [
	{ src: '/sell/seller-stores.webp', label: 'app.anypress.io · Stores', alt: "A seller's Stores list in the AnyPress dashboard: sample client sites with their kind, version, domain, status, last backup and date", title: "Every client's site in one list", points: ['See which sites are ready, being built, failed or suspended, and when each was last backed up.', 'Open any site, log in to its WordPress with one click, connect its domain or restore a backup.', "Start a new site by hand, or move a client's existing site in, from the top of the page."] },
	{ src: '/sell/seller-templates.webp', label: 'app.anypress.io · Templates', alt: 'The Templates page: the starting site, its saved versions and the one new orders are copied from', title: 'Change your starting site safely', points: ['Your starting site is what every new order gets: WordPress, the theme, your plugins and your pages.', 'Changed something? Save it as a new version and check it before any client gets it.', 'Choose which version new orders are copied from. Older versions stay in the list if you want to go back.'] },
	{ src: '/sell/seller-sales-kit.webp', label: 'app.anypress.io · Sales Kit', alt: 'The Sales Kit: eight kinds of customer, each with the plan to sell them and what you keep each month', title: 'Help finding clients, built in', points: ['Pick who you want to sell to, from shops and course creators to churches and franchises, and get a day-by-day plan with the messages to send.', 'Find businesses near you, check their current website, and print an offer sheet and a short deck.', 'Everything goes out under your name, at your prices, and shows what you keep from each sale.'] },
];

const MOVE = [
	['ticket', 'Get a token', 'Choose Move a site in on your dashboard. We set up the new site and give you its token.'],
	['plug', 'Add Reprint', "Install Reprint, WordPress's own free moving plugin, on the client's current site and paste the token in."],
	['truck', 'We copy it across', 'The whole site comes straight from the old host: pages, products, orders, theme, plugins and photos.'],
	['open', 'Check it, then go live', 'Look it over on its new address, copy again to catch anything new, then point the domain at it.'],
];

const START = [
	['words', 'Apply', 'Tell us about your business and who you build for. It takes two minutes.'],
	['question', 'Book a short call', 'We get to know your business, show you how selling works and agree how billing works.'],
	['shops', 'We set you up', "Once you're approved, your storefront is built in minutes. We help you pick what to sell and set your prices."],
	['coins', 'Sell, with us behind you', "Your clients pay you and each site is built in minutes. Questions later? Email support@anypress.io and we'll help."],
];

const YOU = [
	['Your brand', 'Your name, logo and domain on the storefront and every email. AnyPress stays in the background.'],
	['Your prices', 'Charge whatever you like, monthly or yearly. Your clients never see our prices.'],
	['Your payment account', 'Clients pay you directly. You keep the relationship and the money.'],
	['Your starting sites', 'Sell our ready-built sites, or your own with any plugins you like, premium ones included.'],
	['Your team', 'Invite the people who help you, and choose who can change things and who can only look.'],
];
const US = [
	['Building every site', 'Each order becomes its own WordPress with its own database, in minutes.'],
	['Keeping them running', 'Security fixes, the padlock, and every site walled off from the others.'],
	['Nightly copies', 'Every site is saved each night, away from the server, and we test restoring them every day.'],
	['Email that arrives', 'Each site sends from its own address, with sending set up for you.'],
	['Checking every update', 'New versions of WordPress, our theme and the plugins we include are tried on every kind of site before we use them.'],
];

const QUESTIONS = [
	['Do my clients see AnyPress?', 'No. They buy from your storefront, get emails from your name and manage their site from an account on your shop.'],
	['How many sites do I need to start?', `None. Start with one. Once you have ${num('volumeFirstSites')} live sites, every site saves ${num('volumeMin')}%, and it goes up from there.`],
	["How fast is a client's site ready?", 'Minutes after they pay. The site is copied from your starting site, with their details filled in, and the welcome email goes out from your name.'],
	['Can I bring sites I already look after?', "Yes. Choose Move a site in on your dashboard, add WordPress's free Reprint plugin to the old site and paste in the token. The whole site is copied across. [How moving works](/move/)."],
	["Do I have to create each client's site by hand?", 'No. A paid order on your storefront builds the site by itself. Clients who sign up somewhere else can get a site from a form, a payment or your CRM through n8n, Make or Zapier. [Create sites automatically](/automate/). On HighLevel? [Add a website to every sub-account](/highlevel/).'],
	['What if I change my starting site later?', "Save the change as a new version on the Templates page, check it, then choose it for new orders. Clients' existing sites aren't touched."],
	['Who supports my clients?', 'You do the client-facing side, the way you do today. We support you, and we look after the sites themselves.'],
	['What does the storefront cost?', 'Nothing. Your first storefront is included. You pay for each live site you sell.'],
	['I run several brands. Is this for me?', `Then a reseller account fits better: several storefronts, one wholesale bill at ${num('wholesalePercent')}% off, and partner keys for each brand. [About resellers](/resellers/).`],
	['Who do I ask?', 'Email [support@anypress.io](mailto:support@anypress.io).'],
];

/** Two columns of what each side does: a name in bold, then a line. */
const split = (left, right) => columns([left, right].map(([d, title, items]) => [drawing(d, 90, { align: 'left' }), h(3, title, { size: 'large' }), list(items.map(([b, s]) => `**${b}**\n${s}`))].join('\n\n')), { verticalAlign: 'top' });

export default function sellers() {
	return page(
		pageHero({
			drawing: 'agency',
			eyebrow: 'for anyone who builds websites for clients',
			title: 'Sell websites under your name and get paid every month. ==We set it all up==.',
			lead: 'Your storefront arrives ready to sell, with your name, your prices and email from your business. Every client who buys gets their own site in minutes, and we host it, back it up every night and keep it safe. You find the clients.',
			extra: [buttons([{ text: 'Apply to sell websites →', url: '/sell/' }, { text: 'Watch a first sale (0:52)', url: '#videos', outline: true }])],
		}),
		includedStrip(INCLUDED),
		section([head({ eyebrow: 'the short version', title: 'Selling with AnyPress in one look.' }), facts(FACTS)].join('\n\n'), { style: 'tint' }),
		problemFix({ title: "Stop paying for every client's site one piece at a time.", who: WHO, items: TOP_PROBLEMS, style: undefined }),
		section([head({ eyebrow: 'recorded on the real product', title: 'Watch it work.', lead: 'Short videos of the real storefront and dashboard: a client buys a website, gets it, and you look after it.' }), videos(VIDEOS)].join('\n\n'), { style: 'tint', anchor: 'videos' }),
		section([head({ eyebrow: 'sample data, real screens', title: 'Your dashboard.', lead: 'Every client and every site in one place, at app.anypress.io. You and your team sign in with a link we email you.' }), dashboardTour(DASHBOARD)].join('\n\n')),
		buildYourOwn('tint'),
		section([
			head({ eyebrow: 'a worked example', title: 'A year of selling one kind of site.', lead: `Say you sell Small Website sites at $49 a month and win a few clients a month. Your cost per site drops as you pass ${num('volumeSites')} live sites.` }),
			shortcode('[anypress_example kind="seller" price="49"]'),
			p('$49 is only an example: you set your own price. Sites move to a new saving at their next renewal, so a month can be a little higher while they catch up. [Try your own numbers](#earnings).', { align: 'center', size: 'small' }),
		].join('\n\n'), { anchor: 'example' }),
		section([head({ eyebrow: 'who does what', title: 'You run the business. We run the sites.' }), split(['nametag', 'You control', YOU], ['tools', 'We handle', US])].join('\n\n'), { style: 'tint' }),
		section([
			head({ eyebrow: 'already have clients?', title: 'Bring the sites you already look after.', lead: "Move each client's site over at your own pace. Their old site keeps running, untouched, until you switch." }),
			flow(MOVE),
			p('On WooCommerce, LearnDash, BuddyPress or another plugin? Each site can switch those to the Fluent plugins in a few clicks. [What can be switched](/move/).', { align: 'center', size: 'small' }),
		].join('\n\n')),
		section([
			head({ eyebrow: 'your own numbers', title: 'What could you earn?', lead: `Pick seller or reseller, then move the sliders. As a seller your price per site drops as you sell more; as a reseller every site is ${num('wholesalePercent')}% off from the first.` }),
			calculator('earnings', { align: 'wide' }),
		].join('\n\n'), { style: 'tint', anchor: 'earnings' }),
		section([
			head({ eyebrow: 'volume savings', title: 'The more sites you sell, the less each one costs.', lead: 'Counted across all your live sites. When you reach a new level, your other sites move to it at their next renewal.' }),
			shortcode('[anypress_volume_tiers]'),
		].join('\n\n'), { anchor: 'tiers' }),
		section([
			head({ eyebrow: 'two ways to sell', title: 'Seller or reseller?', lead: 'One business name is a seller. More than one is a reseller.' }),
			grid([
				[drawing('sell', 140), h(3, 'Seller', { align: 'center', size: 'large' }), p('One storefront with your name on it. Pay for each site at our list price, with the volume savings above. Most people start here.', { align: 'center' }), list(['Freelance designers', 'Local web design studios', 'Chambers selling to members']), buttons([{ text: 'Apply as a seller →', url: '/sell/' }])].join('\n\n'),
				[drawing('shops', 140), h(3, 'Reseller', { align: 'center', size: 'large' }), p(`Several storefronts under one login, ${num('wholesalePercent')}% off every site on one monthly bill, and partner keys so your developers can create sites with code.`, { align: 'center' }), list(['Studios with several brands', 'Franchise offices', 'Software companies']), buttons([{ text: 'About resellers →', url: '/resellers/', outline: true }])].join('\n\n'),
			], { min: '18rem', count: 2 }),
		].join('\n\n'), { style: 'tint' }),
		questions('Questions sellers ask', QUESTIONS),
		section([
			head({ eyebrow: 'how to start', title: 'Four steps to your first sale.', lead: "You're never left to work it out alone: we talk it through with you first and set you up." }),
			flow(START),
			p('**[How we set you up](/sellers/setup/)** · **[What happens after each sale](/sellers/autopilot/)**', { align: 'center' }),
		].join('\n\n'), { style: 'tint' }),
		section(columns([
			drawing('scroll', 160),
			[hand('not ready yet?', { align: 'left' }), h(2, 'Work out your numbers first', { size: 'x-large' }), p('Pick a site type and your price, and see what each client leaves you every month. No sign-up needed.'), buttons([{ text: 'Try the calculator ↑', url: '#earnings' }], { justify: 'left' })].join('\n\n'),
		])),
		ctaBand({ eyebrow: 'ready?', title: 'Sell your first website this month.', body: 'Tell us about your business and who you build for. It takes two minutes, then you book a short call with us to get set up, billing included.', href: '/sell/', label: 'Apply to sell websites', drawings: ['sell', 'shops', 'coins'] }),
	);
}

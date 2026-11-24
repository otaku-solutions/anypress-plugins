// anypress.io/beta: the beta invite page for the Fluent community, from the live site's page of the same address.
// Prices come from the price list's shortcodes; the sign-up is the "Beta sign-up" Fluent form (forms.mjs).
import { buttons, columns, drawing, form, grid, group, h, hand, head, image, list, p, page, section, table } from './blocks.mjs';
import { ctaBand, dashboardTour, facts, num, pageHero, price, problemFix, questions, videos } from './shared.mjs';

const EMAIL = 'support@anypress.io';

// Plugin icons from their wordpress.org pages, in the site plugin's assets.
const LOGOS = {
	FluentAuth: 'logos/fluent-auth.svg', FluentSMTP: 'logos/fluent-smtp.svg', FluentCRM: 'logos/fluent-crm.svg', 'Fluent Forms': 'logos/fluent-forms.webp',
	FluentPlayer: 'logos/fluent-player.svg', FluentSnippets: 'logos/fluent-snippets.svg', FluentBooking: 'logos/fluent-booking.svg', FluentCart: 'logos/fluent-cart.svg',
	'FluentCart with Stripe': 'logos/fluent-cart.svg', FluentCommunity: 'logos/fluent-community.svg', 'FluentCommunity courses': 'logos/fluent-community.svg',
	'FluentCommunity spaces and courses': 'logos/fluent-community.svg', FluentAffiliate: 'logos/fluent-affiliate.svg', 'Fluent Support': 'logos/fluent-support.svg',
	'Rank Math SEO': 'logos/rank-math.webp', AutomatorWP: 'logos/automatorwp.webp', 'WP Fusion Lite': 'logos/wp-fusion-lite.webp', WooCommerce: 'logos/woocommerce.svg',
	BuddyPress: 'logos/buddypress.svg', MailPoet: 'logos/mailpoet.webp', Newsletter: 'logos/newsletter.webp', 'Contact Form 7': 'logos/contact-form-7.svg',
	WPForms: 'logos/wpforms.webp', 'Ninja Forms': 'logos/ninja-forms.webp', 'Awesome Support': 'logos/awesome-support.webp', SliceWP: 'logos/slicewp.webp',
	'Tutor LMS': 'logos/tutor.webp', LifterLMS: 'logos/lifterlms.png', LearnDash: 'logos/learndash.svg', Circle: 'logos/circle.png', MemberPress: 'logos/memberpress.png',
	Polylang: 'logos/polylang.webp', Claude: 'logos/claude.svg', ChatGPT: 'logos/chatgpt.png', n8n: 'apps/n8n-logo.svg', Make: 'apps/make-logo.svg',
	Zapier: 'apps/zapier-logo.svg', HighLevel: 'apps/highlevel-logo.svg',
};
const logo = (name, size) => (LOGOS[name] ? image(`{{assets}}/${LOGOS[name]}`, { alt: '', width: size }) : '');
const row = (inner, justify = 'left', gap = 'small') => group(inner, { layout: { type: 'flex', flexWrap: 'wrap', justifyContent: justify }, gap });
/** A plugin's icon beside its name, as one small chip. */
const chip = (name, size = 18) => group([logo(name, size), p(name, { size: 'small' })].join(''), { layout: { type: 'flex', flexWrap: 'nowrap' }, gap: 'x-small' });

const FLUENT = ['FluentAuth', 'FluentSMTP', 'FluentCRM', 'Fluent Forms', 'FluentBooking', 'FluentCart', 'FluentCommunity', 'FluentPlayer', 'FluentAffiliate', 'Fluent Support', 'FluentSnippets'];

const FACTS = [
	['website', 'What it is', 'Finished WordPress sites built on the Fluent plugins. We host them, set up the plugins, email and domain, back them up every night and test every update. You still get the full WordPress admin.'],
	['makers', "Who it's for", 'Anyone building on Fluent: a business site, bookings, a shop, a community with courses, or all of it. And people who build those sites for clients.'],
	['key', 'What testers get', 'A real site on your own domain, the dashboard for every site you run, and a direct line to the people building AnyPress. What you ask for shapes what ships before launch.'],
	['coins', 'What it costs', `For your own site, one Small site of any type: add a card when you start and the first ${num('trialDays')} days are free. After that it's your plan's normal price. Sellers and resellers get up to 5 Small sites and book a short call with us to get set up, billing included. [Every price](/pricing/)`],
	['words', 'What we ask', 'Use it for something real, and tell us what gets in the way, by email or a support ticket from your site.'],
	['mailbox', 'Dates', '25 beta sites, with invites going out now: places for 3 sellers or resellers and 10 website owners. Full launch on 1 December. Your site keeps running after the beta, with nothing to move.'],
	['server', 'Where it runs', 'On our servers, or [on your own](/self-host/). Every site has its own WordPress and its own database.'],
	['tools', 'Who builds it', `Otaku Solutions, selling websites as a service since 2023. Questions go to [${EMAIL}](mailto:${EMAIL}).`],
];

const PROBLEMS = [
	[['Which host, and what size?', 'Ask in any group and you get ten different answers. Then your community or shop outgrows the plan and slows down right when it’s busiest.'], ['No server to size or tune', 'Every site gets its own WordPress and database, sized by its plan. We host it, or [we set it up on your own server](/self-host/).']],
	[['Why does my email land in spam?', 'Welcome emails, receipts and newsletters quietly go missing, and fixing it means digging into DNS records.'], ['Email that lands', 'Your mail domain and FluentSMTP and FluentCRM sending are set up before your first member or buyer arrives.']],
	[['Which plugins do I actually need?', 'Too few and something’s missing. Too many and they start stepping on each other.'], ['Only the plugins you need', 'Pick what you’re building and only those Fluent plugins are turned on, already connected to each other.']],
	[['How do I move my community over?', 'Your members, courses, orders and forms live in other plugins, and copying them by hand could take weeks.'], ['Bring your site with you', 'Built-in switches copy WooCommerce, BuddyPress, LearnDash, Circle and more into the Fluent plugins. Your old data stays put until you’re happy.']],
	[['How do I keep many client sites the same?', 'Over time every site ends up a little different, and sooner or later an update breaks one of them on a Friday.'], ['Many sites, one place', 'Create, back up, restore and connect domains for every site from one dashboard, with your team. Updates are tested before they reach your sites.']],
	[['Can AI do the busywork?', 'Most AI tools can write you a paragraph, but they can’t actually do anything on the site.'], ['One AI connector for every site', 'Connect Claude, ChatGPT or any other MCP app once and ask in plain words: make a site, back it up, connect a domain or change its pages. [See what it does](/ai/).']],
];

const DASHBOARD = [
	{ src: '/beta/dashboard-stores.webp', label: 'app.anypress.io · Stores', alt: "The AnyPress dashboard's Stores list, showing sample sites with their version, domain, status, last backup and date", title: 'Every site in one list', points: ['See which sites are ready, being built, failed or suspended.', "Each site's domain, version and last backup at a glance.", 'Start a new site, or move one in, from the top of the page.'] },
	{ src: '/beta/dashboard-store.webp', label: 'app.anypress.io · A store', alt: 'One site in the AnyPress dashboard: its domains with a connected custom domain, and its details', title: 'Everything about one site on one page', points: ['Log in to WordPress with one click, or email the owner.', 'Connect a domain, change the address or buy a new one.', 'Turn on more languages, set the email sender, take or restore a backup.'] },
	{ src: '/beta/dashboard-plugins.webp', label: 'app.anypress.io · Plugins', alt: 'The Plugins page: the Fluent plugins the template comes with, a wordpress.org search and a premium plugin upload', title: 'Choose the plugins your sites get', points: ["The Fluent plugins come with every site. Switch off what you don't use.", 'Add any free plugin from wordpress.org, or upload a premium one.', 'Every plugin is pinned to a version, so every site runs the same code.'] },
];

const VIDEOS = [
	['build-a-site-in-your-browser', 'Build a site in your browser at anypress.io/try', '0:41'],
	['choose-a-plan', 'Choose a plan on the shop', '0:43'],
	['buy-a-website', 'Buy a website and open it', '1:09'],
	['store-designs-and-plugins', 'Designs and plugins', '0:42'],
	['edit-your-website-with-ai', 'Edit your site with AI', '0:36'],
	['your-own-domain-and-email', 'Your own domain and email', '0:36'],
	['backups-and-restores', 'Backups and restores', '0:29'],
	['move-your-site-to-anypress', 'Move your site in', '0:42'],
];

const HOOD = [
	['software', 'WordPress 7.1 on PHP 8.3', 'Each site in its own WordPress and MariaDB containers, never shared with another site.'],
	['lock', 'Plugins pinned and tested', 'Every plugin and theme is pinned to a version. A new version is tried on every kind of site before it reaches yours, and the previous one is kept to roll back to.'],
	['key', 'Free Fluent plugins, your Pro licences', 'Sites come with the free versions. Add your Pro licences in WordPress like on any site and the Pro features turn on.'],
	['backup', 'Backups off the server', 'A copy every night, kept in separate storage, restored from the dashboard in one click.'],
	['email', 'Email set up', 'FluentSMTP sends from your own domain, so FluentCRM newsletters and receipts arrive.'],
	['words', 'Your AI, connected', 'Connect Claude, ChatGPT or any other app that speaks MCP once, then ask in plain words: make a site, back it up, connect a domain or change its pages.', ['Claude', 'ChatGPT']],
	['plug', 'Automations and an API', "Ready-made steps for n8n, Make, Zapier and HighLevel, like starting a site when someone pays and emailing them when it's ready. Plus a REST API with TypeScript and PHP SDKs.", ['n8n', 'Make', 'Zapier', 'HighLevel']],
	['places', 'More than one language', 'Turn on the Languages switch and Polylang is set up, with a language switcher in your menu.', ['Polylang']],
];

const MOVES = [
	['WooCommerce products, orders and customers', ['WooCommerce'], 'FluentCart'],
	['WooCommerce buyers, MailPoet and Newsletter subscribers', ['WooCommerce', 'MailPoet', 'Newsletter'], 'FluentCRM'],
	['Contact Form 7, WPForms and Ninja Forms', ['Contact Form 7', 'WPForms', 'Ninja Forms'], 'Fluent Forms'],
	['BuddyPress groups and members', ['BuddyPress'], 'FluentCommunity'],
	['LearnDash courses, students and progress', ['LearnDash'], 'FluentCommunity courses'],
	['Circle communities, with courses', ['Circle'], 'FluentCommunity'],
	['Awesome Support tickets', ['Awesome Support'], 'Fluent Support'],
	['SliceWP affiliates', ['SliceWP'], 'FluentAffiliate'],
	['Tutor LMS and LifterLMS courses', ['Tutor LMS', 'LifterLMS'], 'FluentCommunity courses'],
	['MemberPress members', ['MemberPress'], 'FluentCommunity spaces and courses'],
];

const STEPS = [
	['note', 'Join the list', 'today', "Tell us what you'd build and what you'd move in. It takes a minute."],
	['mailbox', 'Get your invite', 'within a few days', 'We email your invite when your place is ready, with a link to start your site.'],
	['pick', "Pick what you're building", 'same day', 'A website, bookings, an online store, a community with courses, or all of it. Add a card and it’s ready to use the same day.'],
	['question', "Tell us what's missing", 'during the beta', 'Reply to any of our emails or open a support ticket from your site. What testers ask for decides what we build next.'],
	['open', 'Your plan starts', `after ${num('trialDays')} days`, "Your plan's normal price starts once the free days end, unless you cancel first. Your site carries on as it is through launch on 1 December, with nothing to move or rebuild."],
];

const ASKS = [
	['Use it for something real', 'A client site, your own community or a new shop. Real use finds what demos miss.'],
	['Tell us what gets in the way', 'A missing setting, a confusing screen, a plugin you expected. Short notes are fine.'],
	["Tell us what you'd move in", 'The plugins and platforms you’d leave decide which switch we build next.'],
];

const BUILDERS = [
	['server', 'We host it', 'Pick a plan and your site is ready the same day. Nothing to set up.', '/pricing/', 'See plans'],
	['tools', 'On your own server', 'We install AnyPress on your server and accounts, or you run the open-source installer.', '/self-host/', 'Run it yourself'],
	['nametag', 'Under your own brand', 'Sell Fluent sites to your clients from your own shop, as a seller or reseller.', '/resellers/', 'How reselling works'],
];

export default function beta(data) {
	const hero = section([
		drawing('everything', 180),
		head({ eyebrow: 'beta invites open now', title: 'A better WordPress experience with the ==Fluent== plugins.', lead: "Finished WordPress sites with the hosting, plugins, email and updates handled as one package. Pick what you're building, and the right Fluent plugins arrive set up and connected.", level: 1 }),
		buttons([{ text: 'Join the beta', url: '#join' }, { text: 'Try it in your browser', url: '/try/?type=community', outline: true }]),
		list(['Invites open now', `${num('trialDays')} days free, then your plan`, 'Up to 5 sites for sellers', 'Your Fluent Pro licences work'], { style: 'inline' }),
		row(FLUENT.map((f) => group([logo(f, 40), p(f, { size: 'small', align: 'center' })].join(''), { layout: { type: 'flex', orientation: 'vertical', justifyContent: 'center' }, gap: 'x-small' })).join('\n'), 'center', 'medium'),
		image('{{assets}}/beta/dashboard-store.webp', { alt: DASHBOARD[1].alt, className: 'is-style-browser-window' }),
		p('app.anypress.io: one of your sites', { align: 'center', size: 'small' }),
	].join('\n\n'));

	const examples = section([
		head({ eyebrow: 'real sites, made-up businesses', title: "See what you'd get.", lead: 'Five live sites, one of each kind, all running on AnyPress. Open any of them and click around.' }),
		grid(data.SITE_TYPES.map((t) => [
			image(`{{assets}}/examples/${t.example.shot}-card.webp`, { alt: `The ${t.example.name} example site on a laptop and a phone`, className: 'is-style-browser-window', link: `/try/?type=${t.id}` }),
			h(3, t.example.name, { size: 'large' }),
			p(t.example.what, { size: 'small' }),
			p(`**[Try it yourself →](/try/?type=${t.id})**`, { size: 'small' }),
		].join('\n\n')), { min: '17rem', card: false, count: 3, gap: 'large' }),
	].join('\n\n'));

	const types = section([
		head({ eyebrow: 'try any of them first', title: 'What are you building?', lead: 'Each kind of site turns on its own set of plugins, already connected. Open any of them in your browser first: nothing is installed and nothing is saved.' }),
		...data.SITE_TYPES.map((t) => group(columns([
			drawing(t.drawing, 120),
			[h(3, t.name, { size: 'large' }), p(t.pitch), row(t.tools.filter((x) => x !== 'WordPress').map((x) => chip(x)).join('\n'))].join('\n\n'),
			[p(`**${price(t.id)}** / month`, { size: 'large' }), buttons([{ text: 'Try it', url: `/try/?type=${t.id}`, outline: true }], { justify: 'left' }), p(`[What's inside →](/sites/${t.id}/)`, { size: 'small' })].join('\n\n'),
		], { widths: ['8rem', undefined, '12rem'] }), { className: 'is-style-section-card', padding: ['medium', 'medium'], layout: { type: 'default' } })),
		p(`Medium is ${num('mediumTimes')} times the Small price and Large ${num('largeTimes')} times. Yearly is ${num('yearlyMonths')} months' price. [All prices](/pricing/)`, { align: 'center', size: 'small' }),
	].join('\n\n'));

	const hood = section([
		head({ eyebrow: 'for the technical side', title: 'Under the hood.' }),
		grid(HOOD.map(([d, title, body, logos]) => [
			drawing(d, 72, { align: 'left' }),
			h(3, title, { size: 'medium' }),
			p(body, { size: 'small' }),
			logos && row(logos.map((l) => chip(l, 20)).join('\n')),
		].filter(Boolean).join('\n\n')), { min: '16rem', count: 4 }),
	].join('\n\n'), { style: 'tint' });

	const moves = section([
		drawing('truck', 150),
		head({ eyebrow: 'no copying by hand', title: 'Bring your site with you.', lead: "Already on WordPress? We copy your whole site across first, and your clients' sites too if you build for others. Then switches in your site's admin move your data into the Fluent plugins, one at a time, and each one can be undone." }),
		table(['From', 'Into'], MOVES.map(([from, , into]) => [`**${from}**`, `✓ ${into}`])),
		row([...new Set(MOVES.flatMap(([, logos, into]) => [...logos, into]))].filter((n) => LOGOS[n] && !n.includes(' courses') && !n.includes(' spaces')).map((n) => logo(n, 32)).join('\n'), 'center', 'medium'),
		p("Coming from somewhere else, like Skool or Kajabi? Tell us in the form below. [How moving a site works](/move/)", { align: 'center' }),
	].join('\n\n'));

	const how = section([
		head({ eyebrow: 'three weeks, start to launch', title: 'How the beta works.' }),
		grid(STEPS.map(([d, title, when, body], i) => [drawing(d, 100), hand(when, { size: 'medium' }), h(3, `${i + 1}. ${title}`, { align: 'center', size: 'medium' }), p(body, { align: 'center', size: 'small' })].join('\n\n')), { min: '11rem', card: false, count: 5 }),
	].join('\n\n'), { style: 'tint' });

	const join = section(columns([
		[
			hand('your place', { align: 'left' }),
			h(2, 'Join the beta.', { size: 'xx-large' }),
			p("We'll email you when your place is ready, and you can reply with any question."),
			h(3, 'What we ask of testers', { size: 'medium' }),
			list(ASKS.map(([b, s]) => `**${b}.** ${s}`)),
		].join('\n\n'),
		group([form('beta-sign-up'), p('One email to confirm, then your beta invite. Unsubscribe any time.', { size: 'small' })].join('\n\n'), { className: 'is-style-section-card', padding: ['large', 'large'], layout: { type: 'default' } }),
	], { verticalAlign: 'top' }), { anchor: 'join' });

	const builders = section([
		head({ eyebrow: 'for people who build sites', title: 'Host it, run it yourself, or sell it as your own.' }),
		grid(BUILDERS.map(([d, title, body, href, label]) => [drawing(d, 110), h(3, title, { align: 'center', size: 'large' }), p(body, { align: 'center' }), p(`**[${label} →](${href})**`, { align: 'center' })].join('\n\n')), { min: '15rem', count: 3 }),
	].join('\n\n'), { style: 'tint' });

	return page(
		hero,
		section([head({ eyebrow: 'before you say yes', title: 'The beta in one look.' }), facts(FACTS)].join('\n\n'), { style: 'tint' }),
		examples,
		section([head({ eyebrow: 'sample data, real screens', title: 'Your dashboard.', lead: 'Every site you run, in one place, at app.anypress.io. You and your team sign in with a link we email you.' }), dashboardTour(DASHBOARD)].join('\n\n'), { style: 'tint' }),
		section([head({ eyebrow: 'under a minute each', title: 'Watch it work.', lead: 'Recorded on the live anypress.io and shop, start to finish.' }), videos(VIDEOS)].join('\n\n')),
		problemFix({ title: "You've probably asked one of these.", items: PROBLEMS }),
		types,
		hood,
		moves,
		how,
		join,
		builders,
		questions('Questions.', [
			['Can I try it before the beta?', 'Yes. [Open a community site](/try/?type=community) or [any design](/designs/) in your browser. It runs on WordPress Playground: nothing is installed and nothing is saved.'],
			['What does it cost?', `For your own site, you add a card when you start and the first ${num('trialDays')} days are free. Cancel before they end and you pay nothing. Sellers and resellers book a short call with us to get set up, billing included. After that, plans run from ${price('website')} a month for a website to ${price('everything')} for everything, and your first payment has a [30-day money-back guarantee](/refund-policy/). [See pricing](/pricing/).`],
			['How many places are there?', "We're keeping the beta small: 25 sites in total. That's places for 3 sellers or resellers with up to 5 Small sites each, and 10 website owners with one each. Free demos on anypress.io/try have no limit, and everyone else can start at launch on 1 December."],
			['Do my Fluent Pro licences work?', 'Yes. Sites come with the free versions of the Fluent plugins. Add your Pro licences like on any WordPress site, and the Pro features turn on.'],
			['Which WordPress and PHP do sites run?', 'WordPress 7.1 on PHP 8.3, each site with its own WordPress and database.'],
			['What happens to my site when the beta ends?', "Pick a plan at today's prices and your site keeps running as it is, on the same address and with its backups. There's nothing to move or rebuild. If you don't pick one, the site is removed after launch."],
			['What if I want to leave?', "Download the whole site any time and take it to any host. In wp-admin, Tools > Download my site gives you one zip with WordPress, every file and the database, and it restores on any WordPress host. Sellers and resellers get the same button on each site's page in the dashboard. No lock-in."],
			['Can it run on my own server?', 'Yes. We host it, or we [set AnyPress up on your server](/self-host/). The whole platform is open source.'],
			['I build sites for clients. Can I resell?', 'Yes. Sellers sell from one shop and pay per site; resellers run several brands on one wholesale bill. [See how it works](/resellers/).'],
			["Can you move my clients' sites too?", "Yes. Any WordPress site can come across, yours or a client's, one at a time or several. Each one becomes its own site in your dashboard, with its own domain and backups."],
			['Something else?', `Email [${EMAIL}](mailto:${EMAIL}) and we'll get back to you.`],
		]),
		ctaBand({ eyebrow: 'invites open now', title: 'Get your place in the beta.', body: "Tell us what you'd build, and we'll send your invite when your place is ready.", href: '#join', label: 'Join the beta', drawings: ['courses', 'store', 'bookings'] }),
	);
}

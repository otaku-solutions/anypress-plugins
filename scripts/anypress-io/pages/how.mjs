// anypress.io/how-it-works and /how-it-works/sellers: how getting a website works for a website owner, and how
// selling websites works for sellers and resellers, from the live site's pages of the same address.
import { buttons, columns, drawing, grid, group, h, hand, head, list, p, page, section, table } from './blocks.mjs';
import { buildYourOwn, ctaBand, num, pageHero, problemFix, questions } from './shared.mjs';
import { versionStory } from './trust.mjs';

const ACCOUNT = 'https://shop.anypress.io/account/';

/** The two sides of How it works, with the one you're on filled in. */
const sideSwitch = (active) => buttons([
	{ text: 'I want a website', url: '/how-it-works/', outline: active !== 'owners' },
	{ text: 'I sell websites', url: '/how-it-works/sellers/', outline: active !== 'sellers' },
]);

/** Numbered steps, each a drawing beside its title, how long it takes, and what happens. */
const steps = (items) => items.map(([d, title, when, body, more], i) => columns([
	drawing(d, 110),
	[h(3, `${i + 1}. ${title}`, { size: 'large' }), hand(when, { align: 'left', size: 'medium' }), p(body), more && list(more)].filter(Boolean).join('\n\n'),
], { verticalAlign: 'top', widths: ['20%', '80%'] })).join('\n\n');

const cards = (items, min = '15rem') => grid(items.map(([d, t, b]) => [drawing(d, 100), h(3, t, { align: 'center', size: 'medium' }), p(b, { align: 'center', size: 'small' })].join('\n\n')), { min, count: items.length });

export const howItWorks = () => page(
	pageHero({
		drawing: 'website', eyebrow: 'how it works', title: "Pick what you're building. ==We set it all up==.",
		lead: 'Your site arrives ready to show up on Google, take payments and send email from your business name. You add your words and photos, and we keep it running and up to date from then on.',
		extra: [sideSwitch('owners')],
	}),
	section([
		head({ eyebrow: 'step by step', title: 'From picking a site to opening your doors.' }),
		steps([
			['pick', "Pick what you're building and pay", 'a minute', `Choose a website, bookings, a store, courses or everything, and a size. Small suits most new sites. You add a card, monthly or yearly, and the first ${num('trialDays')} days are free. After that, your first payment is still covered for 30 days. [See prices](/pricing/).`],
			['tools', 'We build your site', 'minutes', "Nobody has to press a button. As soon as you've paid, your site is being made, and it arrives finished:", ['Pages that already suit your kind of business', 'The tools you picked switched on, like your shop, bookings or courses', 'Your business name, address, time zone and currency filled in', 'A free address to share straight away, with the padlock already on', 'Email that sends from your site, so receipts and bookings reach people']],
			['mailbox', 'You get a welcome email', "when it's ready", "It links to your account on anypress.io. From there, one click opens your site's editor. There's no second password to set up."],
			['words', 'Make it yours', 'an afternoon', 'Swap in your words, photos and prices. Change colours and fonts in a few clicks. Already have a domain? Type it in, and with supported domain companies it connects in one click. Email starts coming from it too.'],
			['open', 'Open your doors', 'whenever you like', 'Share your link and start taking orders, bookings or sign-ups. Payments go straight to your own account, and we never take a cut.'],
			['backup', 'We look after it from then on', 'every day', "A copy of your site is saved every night. Security fixes are applied for you. If something goes wrong, email us and we'll help."],
		]),
		buttons([{ text: 'Start your site →', url: '/#sites' }, { text: 'See an example first', url: '/#examples', outline: true }]),
	].join('\n\n'), { style: 'tint' }),
	section([head({ eyebrow: 'before you start', title: 'All you need.' }), cards([
		['email', 'An email address', 'Where we send your welcome email and receipts.'],
		['card', 'A card to pay with', `The first ${num('trialDays')} days are free, then monthly or yearly. Cancel any time from your account.`],
		['words', 'Your words and photos', 'Rough is fine. You can change them whenever you like.'],
		['domain', 'Your domain, if you have one', 'Optional. You can start on the free address and add it later.'],
	], '13rem')].join('\n\n')),
	problemFix({ who: ['Shops and makers', 'Coaches and studios', 'Course creators', 'Chambers, clubs and churches', 'Any business that needs a website'], title: 'Stop paying for your website one piece at a time.', items: [
		[['Nickel-and-dimed by add-ons', 'A site builder, then a booking app, a payments app, an email service and a contact list, each with its own bill.'], ['One price, everything in', "The tools for what you're building arrive in your site, set up and switched on. Nothing else to buy."]],
		[['Your site slows down when someone else gets busy', 'Cheap hosting puts many websites on one shared plan, so a busy neighbour makes your pages slow for your customers.'], ['Your own space, sized for your site', 'Your site gets its own set computing power for its size. Nothing is shared with anyone else.']],
		[['One update can break your site', "Everything stops working, and you don't find out until you hear it from a customer."], ['Updates done for you, safely', 'We try every update before it reaches your site, apply security fixes and save a copy every night, and we check those copies work.']],
		[['Hard to leave', "Many site builders won't let you take your site with you."], ['Real WordPress you can take with you', 'Download a full copy of your site whenever you like. No lock-in.']],
	] }),
	section([head({ eyebrow: "once you're in", title: 'Where everything lives.', lead: "Three places, and you'll mostly use the first two." }), cards([
		['website', 'Your account', `On [your account page](${ACCOUNT}), under My website. See your sites, change your plan, connect your own domain and open each site's editor.`],
		['paint', "Your site's editor", 'Where you change pages, photos, colours, products and bookings. It works like editing a document.'],
		['lifebuoy', 'Help when you need it', 'Email [support@anypress.io](mailto:support@anypress.io), or read the [help page](/help/).'],
	], '17rem')].join('\n\n')),
	questions('Questions about how it works', [
		['Do I need to be technical?', "No. We do the technical part. If you can write an email, you can edit your pages, and we're an email away if you get stuck."],
		['How long does a new site take?', "Minutes, not days. You get an email as soon as it's ready. If a build ever fails, we're told straight away and fix it."],
		["Is my site really separate from everyone else's?", "Yes. It has its own space and its own WordPress. Another site getting busy or having a problem doesn't touch yours."],
		['Who can see or change my site?', 'You, and anyone you add. We only step in to keep it running, or when you ask us for help.'],
		['Can I bring the site I already have?', "If it's on WordPress, yes. [How moving works](/move/)."],
		['Can I take my site with me?', "Yes. It's real WordPress, so a full copy can go with you to any host. No lock-in."],
	]),
	section(p('Selling websites to your own clients? **[See how it works for sellers](/how-it-works/sellers/)**.', { align: 'center' })),
	ctaBand(),
);

/** One storefront, many websites: orders come in on the storefront, each becomes its own site, and we look after them all. */
const bigPicture = (data) => columns([
	group([drawing('shops', 120), h(3, 'Your storefront', { align: 'center', size: 'large' }), p('On your own domain, at your prices, paid into your own account.', { align: 'center' }), hand('orders coming in', { size: 'medium' })].join('\n\n'), { className: 'is-style-section-card', padding: ['large', 'medium'], layout: { type: 'default' } }),
	group([drawing('everything', 120), h(3, 'A site for every order', { align: 'center', size: 'large' }), p('Copied from your starting site in minutes, each one its own WordPress.', { align: 'center' }), list(data.SITE_TYPES.map((t) => t.name), { style: 'pills' })].join('\n\n'), { className: 'is-style-section-card', padding: ['large', 'medium'], layout: { type: 'default' } }),
	group([drawing('server', 120), h(3, 'Looked after by us', { align: 'center', size: 'large' }), list(['A copy saved every night', 'Security fixes applied for you', 'Kept safe, walled off from the others', "Email from each site's own address", 'Domains and the padlock'])].join('\n\n'), { className: 'is-style-section-card', padding: ['large', 'medium'], layout: { type: 'default' } }),
], { verticalAlign: 'top' });

export const howItWorksSellers = (data) => page(
	pageHero({
		drawing: 'shops', eyebrow: 'how it works for sellers', title: 'Your client pays, and their site builds itself. ==We look after it from there==.',
		lead: 'Sell websites under your own name. Your clients buy from your storefront, each order becomes its own site, copied from your starting site in minutes, and we host and look after every one.',
		extra: [sideSwitch('sellers')],
	}),
	section([head({ eyebrow: 'the big picture', title: 'One storefront can create as many sites as you sell.', lead: 'One place takes the orders. Every order becomes a separate website, and then we look after it.' }), bigPicture(data)].join('\n\n'), { style: 'tint' }),
	section([
		head({ eyebrow: 'step by step', title: 'From applying to your hundredth client.' }),
		steps([
			['sell', 'Apply and book a call', 'a short call', 'Tell us about your business on [Apply to sell](/sell/), then book a short call with us. We agree how billing works and set you up as a seller, or as a reseller if you run several brands.'],
			['shops', 'Set up your storefront', 'an afternoon', 'Your first storefront is free: a shop on your own domain, with your name, logo and prices. Payments go into your own payment account.'],
			['paint', 'Choose what you sell', 'once', 'Sell our ready-built sites as they are, or make your own starting site with your design, pages and plugins. You only build it once.'],
			['pick', 'Your client buys from your shop', 'a minute', 'They pick a site and pay you, at your price. They never see AnyPress.'],
			['tools', 'We build their site', 'minutes', "Each order becomes its own WordPress site, copied from your starting site, with your client's details filled in. Nobody has to press a button."],
			['mailbox', 'Your client gets their welcome, from you', "when it's ready", 'The email comes from your name. Your client signs in on your shop and opens their site with one click.'],
			['backup', 'We look after every site', 'every day', 'Nightly copies, security fixes and email sending, for every site you sell. You look after your clients, we look after the sites.'],
		]),
		buttons([{ text: 'Apply to sell websites →', url: '/sell/' }, { text: "Work out what you'd earn", url: '/sellers/#earnings', outline: true }]),
	].join('\n\n')),
	buildYourOwn('tint'),
	section([
		head({ eyebrow: 'changing every site safely', title: "Change all your clients' sites at once, without breaking one.", lead: "Your starting site has versions. Change a copy, try it, then move your clients over when you're ready. The old one stays, so you can always go back." }),
		versionStory(),
		p('We update WordPress and the plugins every site comes with for you. **[How updates stay safe](/updates/)**.', { align: 'center' }),
	].join('\n\n')),
	section([head({ eyebrow: 'who signs in where', title: 'Your team, your shop, your clients.' }), cards([
		['nametag', 'Your team: the dashboard', 'At [app.anypress.io](https://app.anypress.io). Every client and every site in one list, your storefronts, starting sites, plugins, bills and keys.'],
		['shops', 'Your storefront', 'Your own WordPress shop. Change products, prices, emails and the look like any other site.'],
		['website', 'Your clients: your shop', 'They sign in on your storefront to see their site, change plan and open their editor.'],
	], '17rem')].join('\n\n'), { style: 'tint' }),
	section([
		head({ eyebrow: 'two ways to sell', title: 'Seller or reseller?', lead: 'One business name is a seller. More than one is a reseller.', anchor: 'h-pay' }),
		table(['', 'Seller', 'Reseller'], [
			["Who it's for", 'One business name, one storefront', 'Several brands, a storefront for each'],
			['What you pay us', `Our list price per site, ${num('volumeMin')}% off from ${num('volumeFirstSites')} sites, up to ${num('volumeMax')}% from ${num('volumeLastSites')}`, `${num('wholesalePercent')}% off list for every site`],
			['How you pay', 'Per site, as you sell', 'One wholesale bill a month'],
			['What you charge', 'Whatever you like', 'Whatever you like, per brand'],
			['Code access', 'An API key', 'Partner keys for each brand'],
		].map(([q, a, b]) => [`**${q}**`, a, b])),
		buttons([{ text: 'Selling websites →', url: '/sellers/' }, { text: 'Becoming a reseller', url: '/resellers/', outline: true }]),
	].join('\n\n')),
	section([head({ eyebrow: 'under the hood', title: 'For the technical folks.', lead: 'The same system, in a bit more detail.' }), grid([
		['server', 'Its own WordPress', 'Every site runs its own copy of WordPress with its own database. Nothing is shared between sites.'],
		['lock', 'Walled off', "Sites can't reach each other or the machine they run on. One site having a bad day stays its own problem."],
		['sizes', "Sizes we've tested", 'Small, Medium and Large each get set computing power, memory and storage, sized from load tests.'],
		['backup', 'Copies kept off-site', 'Nightly copies are stored away from the servers, and we test restoring one every day. [Hosting and safety](/hosting/).'],
		['key', 'An API for everything', 'Create, change and remove sites with code, or from n8n, Make and Zapier. [See the API](/developers/).'],
		['box', 'Open source', 'The software behind AnyPress is open source, so you can read how it works, or [run it yourself](/self-host/).'],
	].map(([d, t, b]) => [drawing(d, 90), h(3, t, { align: 'center', size: 'medium' }), p(b, { align: 'center', size: 'small' })].join('\n\n')), { min: '16rem', count: 3 })].join('\n\n'), { style: 'tint' }),
	questions('Questions sellers ask', [
		['Do my clients see AnyPress?', 'No. They buy from your storefront, get emails from your name and manage their site from an account on your shop.'],
		['What is a starting site?', "It's the site every new order is copied from. Use one of ours, or set up your own with your design, pages and plugins, so every client starts with it."],
		['What does the storefront cost?', 'Nothing. Your first storefront is included. You pay per site you sell.'],
		['Can I create sites without a shop?', 'Yes. Sites can come from a form, a payment or your own app through the API, n8n, Make or Zapier. [Create sites automatically](/automate/).'],
		['Who supports my clients?', 'You do the client-facing side. We support you, and we look after the sites themselves.'],
		['Who updates WordPress and the plugins?', 'We do, for WordPress, our theme and the plugins we include. Every new release is tried on every kind of site before it reaches yours. Plugins you add yourself, you update in a new version of your starting site.'],
		['Does every site get the padlock (HTTPS)?', 'Yes. Every site and every domain your clients connect gets a free certificate, renewed for you.'],
		['What happens when a client stops paying?', 'When their plan is cancelled, the site is backed up and taken offline for you. Nothing to remember.'],
		['Can I bring sites I already host?', 'Yes. Choose Move a site in on your dashboard and the whole site is copied across. [How moving works](/move/).'],
	]),
	section(p('Want a website for your own business? **[See how it works for website owners](/how-it-works/)**.', { align: 'center' })),
	ctaBand({ eyebrow: 'ready?', title: 'Ready to sell websites?', body: 'Tell us about your business and who you build for, then book a short call with us to get set up, billing included.', href: '/sell/', label: 'Apply to sell websites', drawings: ['sell', 'shops', 'coins'] }),
);

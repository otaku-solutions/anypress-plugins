// anypress.io/self-host: running AnyPress on your own server, yourself or with our help, from the live site's page of
// the same address. The setup, care and larger-team prices are typed on the live page too: they aren't in the price
// list yet. The move-in price and the lowest site price come from the price list's shortcodes.
import { buttons, columns, drawing, grid, h, head, image, list, p, page, section, table } from './blocks.mjs';
import { ctaBand, pageHero, problemFix, questions } from './shared.mjs';

const EMAIL = 'support@anypress.io';
const REPO = 'https://github.com/otaku-solutions/anypress-api';
const INSTALLER_DOCS = `${REPO}/blob/main/install/README.md`;
const GUIDE = `${REPO}/blob/main/docs/self-hosting.md`;
const ask = (subject) => `mailto:${EMAIL}?subject=${encodeURIComponent(`AnyPress on my own server: ${subject}`)}`;

const AUDIENCES = [
	['sell', 'You sell websites to clients', 'Run your own website business on your own server: your shop, your prices, your brand, and the money paid into your own Stripe.', ['Your customers buy sites from your shop', 'Every site is made for you automatically', 'No per-site fee to AnyPress']],
	['server', 'Your company needs its own servers', 'Give your teams, branches or members websites that stay on servers you own, in the country you choose.', ['Your data stays where you put it', 'Your IT team keeps the keys', 'A contract and data agreement when we help']],
];

const PROBLEMS = [
	[['A hosting platform takes months to build', 'Provisioning, billing, backups, a dashboard and a shop to sell from are each a project.'], ['One installer does it all', 'It sets up your dashboard, your shop and the site templates on a server you choose.']],
	[["Locked into someone else's platform", 'If the platform changes its prices or closes, your business goes with it.'], ['Open source under the GPL', 'Every part is public. Read it, change it and run it for as long as you like.']],
	[["Your data on someone else's servers", 'Some companies, clients and countries need to know exactly where their sites live.'], ['Your server, your country', 'Use any provider and region you like, with backups in your own storage bucket.']],
	[['Setting it up by hand misses a step', 'One forgotten DNS record or password and something quietly breaks later.'], ['It checks its own work', 'It ends with a check that tells you what still needs doing, and running it again is safe.']],
];

const WAYS = [
	['tools', 'Do it yourself', 'Free', 'For developers and teams with someone technical.', 'Run the installer and you have the whole platform. The code is yours under the GPL.', ['The installer and every guide', 'New site templates and releases on GitHub', 'Questions and bug reports on GitHub'], ['Read the install guide', INSTALLER_DOCS]],
	['box', 'We set it up', '$1,500 one time', 'For businesses that want it working without learning servers.', 'We install AnyPress on your server and your accounts, then hand it over working.', ['The server, your domains and DNS', 'Storage, email and Stripe connected', 'Your shop and its plans made with you', 'Your brand on the shop customers buy from', 'A walk-through call, and a written handover', 'Your existing sites moved in: [anypress_care item="move-my-site-in" show="price"] a site'], ['Book a setup', ask('set it up')]],
	['lifebuoy', 'We look after it', '$199 a month', "For anyone running it who'd rather not keep it up to date.", 'We keep your platform up to date and watch it, so you can get on with your work.', ['New releases put on for you', 'Health, backups and restore tests watched', 'Answered by email within 1 business day', 'Moving to a bigger server when you need it'], ['Start care', ask('care')]],
	['agency', 'For larger teams', 'From $1,000 a month', 'For companies with several servers, strict rules or a buying process.', 'Everything in care, with faster answers and the paperwork a company needs.', ['Answered the same business day', 'A named contact and a monthly call', 'Several servers, in the countries you choose', 'A data processing agreement and security answers', 'Invoices and a written contract', 'Changes built for your team'], ['Talk to us', ask('larger team')]],
];

const COMPARE = [
	['Who runs the server', 'AnyPress', 'You, or us with a care plan'],
	['Where sites live', "AnyPress's servers in the US", 'Any provider and country you choose'],
	['What you pay', 'Per site, from [anypress_price lowest="1"] a month', 'Your own server costs. The software is free'],
	['Updates', 'Put on for you', 'You put them on, or care does'],
	['Help', 'Included with every plan', 'GitHub, or a care plan'],
	['Selling under your name', 'A seller or reseller account', 'Your own shop and dashboard'],
	['Best for', 'Most people', 'Teams that need their own servers'],
];

const INCLUDED = [
	['website', 'Five kinds of site', 'Website, bookings, online store, community and courses, or everything, each on its own WordPress and database.'],
	['plug', 'The tools set up', 'The Fluent plugins, Rank Math and AnyPress Client switched on for each site type, with the AnyPress theme and Blocks.'],
	['backup', 'Backups that are tested', 'Nightly backups of every site to your bucket, and a nightly test that one restores.'],
	['domain', 'Domains and email', "Free addresses under your domain, customers' own domains, and email from their own domain."],
	['store', 'Your own shop', 'A WordPress shop on FluentCart where your customers buy sites, paid into your own Stripe.'],
	['sizes', 'Your own dashboard', 'Every site, customer and job in one place, on your own domain.'],
	['truck', 'Moving sites in', 'The same switches that move WooCommerce, LearnDash, BuddyPress and others into the Fluent tools.'],
	['words', 'An API and connector', 'Make and change sites from your own code, automations or an AI assistant.'],
];

const HOW = [
	['note', 'Answer a few questions', "Your brand's domain, the domain your customers' sites go under, your email and your storage bucket."],
	['server', 'Run the installer', 'It makes a server at Hostinger, Hetzner or DigitalOcean for you, or runs on a server you already have.'],
	['open', 'Open your dashboard', 'Your dashboard, your shop and the site templates are ready, with a list of anything left to do.'],
];

const SCREENS = [
	['/beta/dashboard-stores.webp', 'Your dashboard · Stores', "The AnyPress dashboard's Stores list, showing sample sites with their version, domain, status, last backup and date", 'Every site in one list: which are ready or being built, each one’s domain and last backup.'],
	['/beta/dashboard-store.webp', 'Your dashboard · A store', 'One site in the AnyPress dashboard: its domains with a connected custom domain, and its details', 'One page per site: log in to WordPress, connect a domain, take or restore a backup.'],
];

const NEEDS = [
	['A server', 'Ubuntu 24.04 with 4 GB of memory or more. Hostinger, Hetzner, DigitalOcean or any provider.'],
	['Two domains', "One for your brand (your dashboard lives on it) and one your customers' sites are named under."],
	['A storage bucket', 'Cloudflare R2 or any S3-compatible storage, for site templates and backups.'],
	['Optional', 'A Cloudflare token to set the DNS records for you, toSend for email, and Stripe for selling.'],
];

const STEPS = [
	'Installs Coolify, with your email as its admin.',
	'Sets your DNS records in Cloudflare, when you give it a token.',
	'Runs the AnyPress API and its database, with generated passwords and keys.',
	'Puts on the newest site templates, checked so nothing was changed on the way.',
	'Builds your shop: the WordPress shop your customers buy sites from.',
	'Deploys the dashboard on your server, or on your own Vercel account.',
	'Ends with a check that tells you what still needs doing. Running it again is safe.',
];

export default function selfHost(data) {
	return page(
		pageHero({
			drawing: 'server', eyebrow: 'open source', title: 'Run AnyPress on ==your own server==.',
			lead: 'The same AnyPress, on a server you choose. Do it yourself for free, or we set it up and look after it for you.',
			extra: [buttons([{ text: 'See the four ways →', url: '#ways' }, { text: 'For your tech team', url: '#tech', outline: true }])],
		}),
		section([
			head({ title: "Who it's for.", lead: 'Two kinds of people run AnyPress on their own servers.' }),
			grid(AUDIENCES.map(([d, title, body, points]) => [drawing(d, 110, { align: 'left' }), h(3, title, { size: 'large' }), p(body), list(points)].join('\n\n')), { min: '20rem', count: 2 }),
			p('Just want a website for your own business? Our [hosted plans](/pricing/) are simpler: we run everything for you.', { align: 'center' }),
		].join('\n\n')),
		problemFix({ eyebrow: 'why run it yourself', title: 'Your own website platform, without building one.', items: PROBLEMS }),
		section([
			head({ title: 'Four ways to get it.', lead: 'The software is the same in all four. What changes is how much of the work we do for you.', anchor: 'ways' }),
			grid(WAYS.map(([d, name, cost, who, body, items, [label, url]]) => [
				drawing(d, 80, { align: 'left' }),
				h(3, name, { size: 'large' }),
				p(`**${cost}**`, { size: 'large', color: 'primary' }),
				p(`**${who}**`, { size: 'small' }),
				p(body, { size: 'small' }),
				list(items, { style: 'divided' }),
				buttons([{ text: label, url, outline: true }], { justify: 'left' }),
			].join('\n\n')), { min: '14rem', count: 4 }),
			p("The server is yours, so how often it's up depends on the provider you pick. We watch it and tell you when something is wrong.", { align: 'center', size: 'small' }),
		].join('\n\n')),
		section([
			head({ title: 'Hosted by us, or on your own server.', lead: 'The software is the same. What changes is who runs the server.' }),
			table(['', 'Hosted by AnyPress', 'On your own server'], COMPARE.map(([row, hosted, own]) => [`**${row}**`, hosted, own])),
			p("Running it yourself is a real job: someone has to look after the server. If that isn't you, a care plan or our [hosted plans](/pricing/) are the easier way.", { align: 'center' }),
		].join('\n\n'), { style: 'tint' }),
		section([
			head({ title: 'What you get.', lead: 'The same platform that runs anypress.io, on your own server.' }),
			grid(INCLUDED.map(([d, title, body]) => [drawing(d, 72, { align: 'left' }), h(3, title, { size: 'medium' }), p(body, { size: 'small' })].join('\n\n')), { min: '15rem', count: 4 }),
		].join('\n\n')),
		section(columns([
			[drawing('lock', 120, { align: 'left' }), h(2, 'Your data stays where you put it.', { size: 'x-large' }), p('Choose the country your server is in, and your sites, their databases and their backups stay there.')].join('\n\n'),
			list([
				'**Pick the region.** With Hetzner, the installer can make the server in Germany or Finland for Europe, or in the US. On a server you already have, it runs wherever that server is.',
				'**Backups in your bucket.** Backups go to your own storage. Cloudflare R2 can keep a bucket inside the EU.',
				"**We don't see it.** AnyPress staff never get into your sites or your data unless you ask us to help and give us access yourself.",
			]),
		], { verticalAlign: 'top' }), { style: 'tint' }),
		section([
			head({ title: 'How it works.', lead: "Three steps. If you'd rather not do them, we do them for you." }),
			grid(HOW.map(([d, title, body], i) => [drawing(d, 110), h(3, `${i + 1}. ${title}`, { align: 'center', size: 'medium' }), p(body, { align: 'center', size: 'small' })].join('\n\n')), { min: '14rem', count: 3 }),
		].join('\n\n')),
		section([
			head({ eyebrow: 'sample data, real screens', title: 'The dashboard you get.', lead: 'Every site you run, on your own domain. These are the same screens as app.anypress.io.' }),
			columns(SCREENS.map(([src, label, alt, caption]) => [image(`{{assets}}${src}`, { alt, className: 'is-style-browser-window' }), p(label, { align: 'center', size: 'small' }), p(caption)].join('\n\n')), { verticalAlign: 'top' }),
		].join('\n\n'), { style: 'tint' }),
		section([
			head({ title: 'The sites your customers get.', lead: 'Real example sites, one for each kind. Every site you sell starts from these.' }),
			grid(data.SITE_TYPES.map((t) => [
				image(`{{assets}}/examples/${t.example.shot}-card.webp`, { alt: `The ${t.example.name} example site on a laptop and a phone`, className: 'is-style-browser-window', link: `/try/?type=${t.id}` }),
				h(3, t.example.name, { size: 'large' }),
				p(t.example.what, { size: 'small' }),
				p(`**[Try it yourself →](/try/?type=${t.id})**`, { size: 'small' }),
			].join('\n\n')), { min: '17rem', card: false, count: 3, gap: 'large' }),
		].join('\n\n')),
		section([
			head({ eyebrow: 'for your tech team', title: 'What you need, and what the installer does.', lead: 'The technical details in one place. The install guide has every step and setting.', anchor: 'tech' }),
			columns([
				[h(3, 'What you need', { size: 'large' }), list(NEEDS.map(([t, b]) => `**${t}.** ${b}`), { style: 'divided' }), p('A server with 4 to 8 GB of memory costs about $20 to $50 a month at most providers.', { size: 'small' })].join('\n\n'),
				[h(3, 'What the installer does', { size: 'large' }), list(STEPS, { ordered: true })].join('\n\n'),
			], { verticalAlign: 'top' }),
			buttons([{ text: 'Read the install guide', url: INSTALLER_DOCS }, { text: 'Read the self-hosting guide', url: GUIDE, outline: true }]),
		].join('\n\n'), { style: 'tint' }),
		questions('Questions.', [
			['What do I do after it finishes?', "Open your shop's WordPress admin, connect Stripe and make the plans your customers buy. The installer prints the address and where your passwords are kept."],
			['Can I put the dashboard on Vercel?', 'Yes. Add a Vercel token to the answers file and the dashboard is deployed to your own Vercel account instead of your server.'],
			['Where is the full guide?', `The [install guide](${INSTALLER_DOCS}) covers every answer, and the [self-hosting guide](${GUIDE}) explains each part, from one server up.`],
			['Does it cost anything?', 'The software is free and open source. You pay your own server, storage and email providers directly; a server with 4 to 8 GB of memory is about $20 to $50 a month. If you want our help, setup is $1,500 one time, care is $199 a month, and plans for larger teams start at $1,000 a month.'],
			['Is it the same AnyPress as anypress.io?', 'Yes. It is the same code, and new releases come out for everyone at the same time.'],
			['How do I keep it up to date?', 'Run the installer again and it puts on the newest site templates. The API and the dashboard update when you redeploy them in Coolify. With a care plan, we do this for you.'],
			['Can I sell sites under my own name?', 'Yes. The shop your customers buy from and their sites carry your brand, and the money goes to your own Stripe account.'],
			['Can I take the AnyPress name off?', "Your customers see your brand: on your shop, your dashboard's domain and their sites. The code is under the GPL, so you may change any part of it, including names and logos, as long as what you share with others stays under the GPL too."],
			['Is running it myself right for me?', 'If you want websites for your own business, our [hosted plans](/pricing/) are simpler. Running it yourself suits people who sell websites, or companies that must keep sites on servers they own.'],
			['Can my servers be in Europe?', 'Yes. Your sites, databases and backups stay on the server and in the bucket you choose. If we set it up or look after it for you, ask us about a data processing agreement.'],
		]),
		ctaBand({ eyebrow: 'or let us', title: 'Rather not do it yourself?', body: 'We can set up AnyPress on your own server and accounts, and look after it for you.', href: '#ways', label: 'See the four ways', drawings: ['server', 'tools', 'lifebuoy'] }),
	);
}

// anypress.io/automate: client sites that build themselves, from the storefront, n8n, Make, Zapier, HighLevel or an AI
// app, with ready-made templates to copy, from the live site's page of the same address.
import { buttons, columns, drawing, grid, group, h, hand, head, image, list, p, page, section } from './blocks.mjs';
import { ctaBand, flow, pageHero, problemFix, questions } from './shared.mjs';

const API_DOCS = 'https://api.anypress.io/docs';
const DOCS = 'https://shop.anypress.io/docs-category/automation/';
const DOC = (slug) => `https://shop.anypress.io/docs/${slug}/`;
const ZAPIER_INVITE = 'https://zapier.com/developer/public-invite/248504/d92ccd4f604ea3e76535ff8452c69eb9/';
const READY_DOC = DOC('email-the-client-when-their-site-is-ready');

/** The four tools' logos in a row, the HighLevel one included. */
const logos = (size = 56) => group(['n8n', 'make', 'zapier', 'highlevel'].map((n) => image(`{{assets}}/apps/${n}-logo.svg`, { alt: n === 'make' ? 'Make' : n === 'highlevel' ? 'HighLevel' : n === 'n8n' ? 'n8n' : 'Zapier', width: size })).join('\n'), { layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'center' }, gap: 'large' });

const APPS = [
	['n8n', 'n8n', 'Install the community node n8n-nodes-anypress from Settings, then Community nodes. Works on any self-hosted n8n.', ['Install in n8n', DOC('use-anypress-in-n8n')], DOC('use-anypress-in-n8n'), ['Create a site', 'Get a site', 'Suspend a site', 'Resume a site', 'Delete a site'], 'AnyPress Trigger', ['n8n-create-site.webp', "The AnyPress node in n8n, set to create a site from the form's business name and email"]],
	['Make', 'make', 'Open the invite link to add the AnyPress app to your Make account, then add any AnyPress module to a scenario.', ['Add to Make', 'https://www.make.com/en/hq/app-invitation/671dddf42544d057e9ecc35c05ecdf8b'], DOC('use-anypress-in-make'), ['Create a Site', 'Get a Site', 'Suspend a Site', 'Resume a Site', 'Delete a Site'], 'Watch Site Events', ['make-create-site.webp', 'The AnyPress Create a Site module in Make, with the site name, reference, client email and size filled in']],
	['Zapier', 'zapier', 'Open the invite link to add AnyPress to your Zapier account, then pick it as the app in any Zap.', ['Add to Zapier', ZAPIER_INVITE], DOC('use-anypress-in-zapier'), ['Create Site', 'Find Site', 'Suspend Site', 'Resume Site', 'Delete Site'], 'Site Event', ['zapier-create-site.webp', 'The AnyPress Create Site action in a Zap, with the site name, reference, client email and size filled in']],
	['HighLevel', 'highlevel', 'For HighLevel agencies (GoHighLevel). Install AnyPress on your sub-accounts and add its actions to any workflow, so every sub-account you sell comes with its own WordPress site under your brand.', ['Get early access', 'mailto:support@anypress.io?subject=AnyPress%20for%20HighLevel'], DOC('use-anypress-in-highlevel'), ['Create site', 'Get site', 'Suspend site', 'Resume site', 'Delete site'], 'Site event', null, true],
];

// Each template: its tool, title, what it does, its picture, the file to import (or the Zapier invite) and its guide.
const T = (file) => `{{assets}}/templates/${file}`;
const TEMPLATES = [
	['n8n', 'Intake form sent, site created', 'A client fills in your form and their site starts building, named after their business and with their login made.', T('n8n-create-site.webp'), 'n8n workflow: Client intake form, then AnyPress Create a site', ['Download the workflow', T('n8n-create-site.json')], DOC('create-a-site-from-a-form-with-n8n')],
	['n8n', 'Stripe payment, site created', 'A paid Stripe checkout makes the site. The subscription id is its reference, so a retry never makes two.', T('n8n-stripe-create-site.webp'), 'n8n workflow: Stripe checkout paid, then AnyPress Create a site', ['Download the workflow', T('n8n-stripe-create-site.json')], DOC('use-anypress-in-n8n')],
	['n8n', 'Subscription ended, site suspended', 'When the Stripe subscription ends, the site is backed up and taken offline. Resume brings it back as it was.', T('n8n-stripe-suspend-site.webp'), 'n8n workflow: Stripe subscription ended, then AnyPress Suspend the site', ['Download the workflow', T('n8n-stripe-suspend-site.json')], DOC('suspend-a-site-when-a-client-cancels')],
	['n8n', 'Site ready, team emailed', 'The AnyPress trigger starts the flow the moment a site is built, with its name, address and your reference.', T('n8n-site-ready.webp'), 'n8n workflow: AnyPress Site ready trigger, then Email the team', ['Download the workflow', T('n8n-site-ready.json')], READY_DOC],
	['Make', 'Deal won in your CRM, site created', "Your CRM calls the scenario when a client signs, and AnyPress makes their site from the contact's details.", '{{assets}}/apps/make-scenario.webp', 'Make scenario: a custom webhook, then AnyPress Create a Site', ['Download the blueprint', T('make-create-site.blueprint.json')], DOC('create-a-site-from-a-crm-step-with-make')],
	['Make', 'Site ready, client emailed', 'Watch Site Events starts the scenario when a site is ready, then an email goes out with its address.', '{{assets}}/apps/make-site-ready.webp', 'Make scenario: AnyPress Watch Site Events, then Send an Email', ['Download the blueprint', T('make-site-ready.blueprint.json')], READY_DOC],
	['Zapier', 'Stripe payment, site created', 'A new Stripe payment makes the site, with the payment id as its reference so a Zap that runs twice still makes one.', '{{assets}}/apps/zapier-zap.webp', 'Zap: Stripe New Payment, then AnyPress Create Site', ['Add AnyPress to Zapier', ZAPIER_INVITE], DOC('create-a-site-from-a-payment-with-zapier')],
	['Zapier', 'Site ready, client emailed', 'The Site Event trigger runs the Zap when a site is ready, and Email by Zapier sends the welcome.', '{{assets}}/apps/zapier-site-ready.webp', 'Zap: AnyPress Site Event, then Email by Zapier', ['Add AnyPress to Zapier', ZAPIER_INVITE], READY_DOC],
	['HighLevel', 'Contact tagged, site created', 'Tag a contact and the Create site step makes their site. The contact is its reference, so a workflow that runs twice still makes one.', T('highlevel-create-site.webp'), 'HighLevel workflow: Contact Tag trigger, then AnyPress Create site and Get site', null, DOC('use-anypress-in-highlevel')],
	['HighLevel', 'Site ready, workflow starts', 'The Site event trigger starts a workflow the moment a site is built. Add your welcome email or text after it.', T('highlevel-site-ready.webp'), 'HighLevel workflow: AnyPress Site Event trigger, then Wait', null, DOC('use-anypress-in-highlevel')],
];

const FAQ = [
	['Do I need a developer?', 'No. If your clients buy on your storefront, sites are already created for you. For anything else, add the AnyPress app in n8n, Make or Zapier and pick the step. Any other tool can do the same with a web request.'],
	['Where do I get an API key?', "Sign in at [app.anypress.io](https://app.anypress.io) and open API keys. The secret is shown once, so put it straight into your tool's saved logins. Resellers can ask us for a partner key, which works on every storefront in the account."],
	['How do I use a template?', 'Add the AnyPress app to your tool first. In n8n, download the workflow and paste or import it onto an empty canvas. In Make, download the blueprint, create a scenario, then choose Import blueprint from its ... menu. In Zapier, add AnyPress with the invite link and follow the guide: each Zap is a trigger and one AnyPress step. Then pick your AnyPress login on the AnyPress step and turn it on.'],
	['What can a new site be told?', `Its name, your reference, the client's email and role, which starting site to copy, its size and the client's own domain. The guide for each app lists them, and the [API reference](${API_DOCS}) has every field.`],
	['Which events can start a flow?', 'Site ready, site failed, domain connected, suspended, resumed, deleted, restored and backup done. Pick one or several on the AnyPress trigger.'],
	['What if the flow runs twice?', 'Always fill in Your Reference with something unique, like the order or deal number. Running Create again with the same reference gets the site already made, and never builds another.'],
	['How does the client get into their new site?', "Creating the site makes their WordPress login with their email. Your welcome email links to the site's password page, so they choose their own password. Sites sold on your storefront get a one-click sign-in from their account instead."],
	["Can it put the client's own words and logo in too?", 'Yes. Every site starts from your starting site, and an AI app connected to AnyPress can then change pages, sections, colours and menus for you. See [AnyPress in your AI app](/ai/).'],
	['Do my clients see AnyPress?', 'No. The flows are yours, the emails come from you, and sites sold from your shop show your brand.'],
	['Is there an app for HighLevel (GoHighLevel)?', "Yes, in early access. Install AnyPress on your sub-accounts, create a client's site from any HighLevel workflow, then start the welcome steps when it's ready. Email support@anypress.io and we'll set you up. You can also start today with HighLevel's own webhook steps: the HighLevel guide in our docs shows how."],
];

export default function automate() {
	return page(
		pageHero({
			eyebrow: 'automation', title: 'Client sites that ==build themselves==.', lead: "Nobody on your team should be building websites by hand. An order, a form or a step in your CRM creates the client's site, and tells you when it's ready.",
			extra: [logos(64), buttons([{ text: 'See the apps →', url: '#apps' }, { text: 'Browse templates', url: '#templates', outline: true }])],
		}),
		problemFix({ who: ['Sellers and resellers', 'Web designers with a CRM', 'Teams without a developer'], title: "Selling sites shouldn't mean building each one.", style: undefined, items: [
			[['Every sale means a site built by hand', 'Someone on the team copies a site, sets it up and sends the logins, for every new client.'], ['The order builds it', 'When someone pays on your storefront, their site is built straight away. Nothing to connect.']],
			[["Clients don't all come through a shop", 'Deals close on a form, a signed proposal or a payment in another tool.'], ['Your tools start it', 'The AnyPress app in n8n, Make or Zapier creates the site from that step, or start from a ready-made template.']],
			[["Nobody knows when it's ready", "Someone keeps checking back, and the client waits for a welcome email that's late."], ["You're told when it's ready", "The Site ready trigger can email the team or send the client their welcome, the moment it's built."]],
			[['Cancelled clients keep a live site', 'When a plan ends, the site lives on until someone remembers to take it down.'], ['Cancelling tidies up', 'When a storefront plan is cancelled, the site is backed up and taken offline for you.']],
		] }),
		section([
			head({ eyebrow: 'four ways in', title: 'Pick how sites get made.', lead: 'Most sellers use the first one and never think about it again. The others are for orders and clients that start somewhere else.' }),
			grid([
				['shops', 'Your shop does it', "Someone pays on your storefront and their site is built. When they cancel, it's backed up and taken offline. Nothing to connect.", '#shop', 'Every seller, from day one'],
				['plug', 'No-code tools', 'A form, a signed proposal or a payment somewhere else starts a flow in n8n, Make or Zapier, and the AnyPress app in it creates the site.', '#apps', 'Teams without a developer'],
				['tools', 'Start from a template', 'Ready-made flows for the usual jobs: a form or a payment makes a site, a cancelled plan suspends it, a finished site emails the team.', '#templates', 'Anyone who wants it done in minutes'],
				['words', 'Just ask an AI app', 'Connect AnyPress to Claude or ChatGPT and ask in plain words: make a site, back it up, change its home page.', '/ai/', "Anyone who'd rather type than click"],
			].map(([d, t, b, href, who]) => [drawing(d, 100), h(3, `[${t}](${href})`, { align: 'center', size: 'medium' }), p(b, { size: 'small' }), hand(who, { size: 'medium' })].join('\n\n')), { min: '14rem', count: 4 }),
		].join('\n\n'), { style: 'tint' }),
		section([
			head({ eyebrow: 'no setup', title: 'Your storefront already does it.', lead: 'Every approved seller gets a storefront. Make a product for each kind of site you sell, and every paid order turns into a site with nobody pressing a button.', anchor: 'shop' }),
			columns([
				[
					hand('on your storefront', { align: 'left' }),
					h(3, 'Order paid, site built', { size: 'large' }),
					['Add a subscription product in your storefront, with its price.', 'Turn on the website integration for it and pick the kind of site, the starting site and the size.', "That's it. A paid order builds the site and emails your client a link to sign in."].map((x, i) => p(`**${i + 1}.** ${x}`)).join('\n\n'),
					p('When a subscription is cancelled or runs out, the site is backed up and taken offline, then deleted after your grace period. If they pay again first, it comes back.', { size: 'small' }),
				].join('\n\n'),
				flow([['card', 'Your client pays', 'On your shop, at your price.'], ['tools', 'The site is built', 'From your starting site, in minutes.'], ['mailbox', "They're emailed", 'With a one-click way in.']]),
			], { verticalAlign: 'top', widths: ['40%', '60%'] }),
		].join('\n\n')),
		section([
			head({ eyebrow: 'the apps', title: 'AnyPress in n8n, Make, Zapier and HighLevel.', lead: 'Add the AnyPress app to the tool you already use and pick a step. Nothing to code, and the trigger sets up its own webhook when you turn the flow on.', anchor: 'apps' }),
			...APPS.map(([tool, logo, how, [addLabel, addUrl], doc, actions, trigger, shot, soon]) => {
				const text = [
					image(`{{assets}}/apps/${logo}-logo.svg`, { alt: tool, width: 56 }),
					h(3, `AnyPress for ${tool}${soon ? ' (early access)' : ''}`, { size: 'large' }),
					p(how),
					p('**Actions**', { size: 'small' }), list(actions, { style: 'pills' }),
					p('**Trigger**', { size: 'small' }), list([trigger], { style: 'pills' }),
					p('Starts your flow when a site is ready, fails, is suspended and more.', { size: 'small' }),
					buttons([{ text: `${addLabel} →`, url: addUrl }, { text: 'Setup guide', url: doc, outline: true }], { justify: 'left' }),
				].join('\n\n');
				return group(shot ? columns([text, [image(`{{assets}}/apps/${shot[0]}`, { alt: shot[1], className: 'is-style-browser-window' }), p(tool, { align: 'center', size: 'small' })].join('\n\n')], { verticalAlign: 'top' }) : text, { className: 'is-style-section-card', padding: ['large', 'large'], layout: { type: 'default' } });
			}),
			p(`Each app signs in with your API key and secret. With a partner key, pick the storefront on each step (in Make, add one connection per storefront). Using another tool? It can make the same calls with a web request: see the [API reference](${API_DOCS}).`, { align: 'center', size: 'small' }),
		].join('\n\n')),
		section([
			head({ eyebrow: 'templates', title: 'Copy a flow that already works.', lead: 'Each one is a trigger and an AnyPress step, ready to go. Add it to your account, pick your AnyPress login and turn it on.', anchor: 'templates' }),
			grid(TEMPLATES.map(([tool, t, b, src, alt, get, guide]) => [
				image(src, { alt, className: 'is-style-browser-window' }),
				hand(tool, { align: 'left' }),
				h(3, t, { size: 'medium' }),
				p(b, { size: 'small' }),
				get ? buttons([{ text: get[0], url: get[1] }, { text: 'Guide', url: guide, outline: true }], { justify: 'left' }) : p(`**Early access.** [Read the guide](${guide})`, { size: 'small' }),
			].join('\n\n')), { min: '18rem', count: 3 }),
			p(`n8n: download the workflow, then paste or import it onto an empty canvas. Make: create a scenario, then Import blueprint from its ... menu. Every template has a guide in [the docs](${DOCS}).`, { align: 'center', size: 'small' }),
		].join('\n\n'), { style: 'tint' }),
		section(columns([
			[
				hand('Claude, ChatGPT and more', { align: 'left' }),
				h(2, 'Or just ask.', { size: 'x-large', anchor: 'ai' }),
				p('Connect AnyPress to your AI app and say what you need: “make a bookings site for Still Water Yoga”, “back up every site tonight”, “add a pricing section to the home page”.', { size: 'medium' }),
				buttons([{ text: 'AnyPress in your AI app →', url: '/ai/' }], { justify: 'left' }),
			].join('\n\n'),
			[image('{{assets}}/apps/claude-stores.webp', { alt: 'Claude answering "Show my stores" with the AnyPress stores screen: each site with its address and Back up and Suspend buttons', className: 'is-style-browser-window' }), p('Claude', { align: 'center', size: 'small' })].join('\n\n'),
		])),
		questions('Automation questions', FAQ),
		ctaBand({ eyebrow: 'ready?', title: 'Stop building sites by hand.', body: 'Apply to sell, and your storefront creates sites from the first order. Need a partner key or help with a flow? Email support@anypress.io.', href: '/sell/', label: 'Apply to sell', drawings: ['plug', 'tools', 'shops'] }),
	);
}

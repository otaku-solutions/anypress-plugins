// anypress.io/ai: AnyPress in an AI app through the MCP connector, from the live site's page of the same address.
import { buttons, drawing, grid, group, h, head, image, list, p, page, section } from './blocks.mjs';
import { ctaBand, pageHero, problemFix, questions } from './shared.mjs';

const GUIDE = 'https://shop.anypress.io/docs/connect-an-ai-app-to-anypress/';
const MCP = 'https://api.anypress.io/mcp';

/** A real screen in a browser frame, with its label under it. */
const shot = (src, alt, label, width = '760px') => group([
	image(`{{assets}}/apps/${src}`, { alt, className: 'is-style-browser-window' }),
	p(label, { align: 'center', size: 'small' }),
].join('\n\n'), { layout: { type: 'constrained', contentSize: width } });

export default function ai() {
	return page(
		pageHero({
			drawing: 'plug', eyebrow: 'AI apps', title: 'AnyPress in ==your AI app==.', lead: 'Connect once, then ask in plain words. Your AI app makes sites, backs them up, connects domains and edits pages, and shows you what it did.',
			extra: [buttons([{ text: 'Connect it →', url: '#connect' }, { text: 'Setup guide', url: GUIDE, outline: true }])],
		}),
		problemFix({ who: ['Sellers and resellers', 'Website owners', 'Anyone who uses an AI app'], title: 'Run your sites by asking, not clicking.', items: [
			[['Every job is a trip to the dashboard', "A backup, a domain or a site that's stuck building each means signing in and clicking through screens."], ['Just ask', 'Type “Back up every site tonight” or “Which sites are still building?” and your AI app does it.']],
			[['Page changes mean learning the editor', 'A new section or a different header colour is a small change that takes a long time to find.'], ['Describe the change', "Ask for a pricing section, a different look or a carousel of reviews. The app builds from your theme's own designs and shows you what it did."]],
			[['Connecting AI usually means keys and code', 'Most tools want an API key pasted somewhere, or a developer to wire it up.'], ['Sign in and approve', "Add the connector, sign in to AnyPress and tick what it may do. There's no key or secret to copy."]],
			[['Letting AI loose feels risky', "It's hard to trust an app that could change or delete the wrong site."], ['It can only do what you can', 'It acts with your role, only does what you ticked, asks before deleting or restoring, and logs every change.']],
		], style: undefined }),
		section([
			head({ eyebrow: 'two minutes', title: 'Connect it once.', anchor: 'connect' }),
			grid([
				['plug', 'Add AnyPress as a connector', 'In Claude, open Settings, then Connectors, then Add custom connector. In ChatGPT, turn on developer mode under Settings, Apps and Connectors, then create a connector. In Cursor, VS Code, Devin Desktop, Gemini CLI or any other MCP app, add a remote MCP server. Paste the address below.'],
				['key', 'Sign in and choose what it may do', "Your AI app opens our sign-in page. Sign in to AnyPress, tick what the app may see and change, and approve. There's no key or secret to copy."],
				['words', 'Ask', "Type what you need, the way you'd ask a person. The app picks the right steps, and shows your sites right in the chat."],
			].map(([d, t, b], i) => [drawing(d, 100), h(3, `${i + 1}. ${t}`, { align: 'center', size: 'medium' }), p(b, { size: 'small' })].join('\n\n')), { min: '17rem', count: 3 }),
			shot('claude-connector.webp', "AnyPress connected in Claude's connector settings, at https://api.anypress.io/mcp, with its tools listed", 'Claude, Settings, Connectors', '640px'),
			grid([
				['You sell sites', 'Sellers and resellers. Resellers pick which storefront each connection is for.', MCP],
				['You have one site', "Website owners. Approve in your own site's dashboard, and the app can edit that site's pages and design.", `${MCP}/site`],
				["Look, don't touch", 'Sellers and resellers who want an app that can only see their sites.', `${MCP}/read-only`],
			].map(([who, body, url]) => [h(3, who, { size: 'medium' }), p(body, { size: 'small' }), p(`\`${url}\``)].join('\n\n')), { min: '17rem', count: 3 }),
		].join('\n\n'), { style: 'tint' }),
		section([
			head({ eyebrow: 'what to ask', title: "Say it the way you'd say it to a person." }),
			grid([
				['website', 'Sites', ['Make a bookings site for Still Water Yoga.', 'Which sites are still building?', 'Take the site for order 1042 offline.']],
				['backup', 'Backups', ['Back up every site tonight.', "Put Fern & Clay back to yesterday's backup."]],
				['domain', 'Domains and email', ['Connect stillwateryoga.com to the yoga site.', "Send the bakery's emails from its own domain."]],
				['paint', 'Pages and design', ['Add a pricing section to the home page.', 'Give the bakery site the Hearth look.', 'Add a carousel of our reviews and a popup for the spring offer.', 'Draft an About page from this text.']],
			].map(([d, t, asks]) => [drawing(d, 90), h(3, t, { align: 'center', size: 'medium' }), list(asks.map((a) => `“${a}”`), { style: 'no-bullets' })].join('\n\n')), { min: '14rem', count: 4 }),
		].join('\n\n')),
		section([
			head({ eyebrow: 'in the chat', title: 'It shows you, not just tells you.', lead: 'In apps that support it, your sites appear as a screen in the chat, with buttons to back up, suspend or bring a site back. Ask to see the designs and every kit shows as a live preview of your own site in that look, with a button to switch it on.' }),
			shot('claude-stores.webp', 'Claude answering "Show my stores" with the AnyPress stores screen: each site with its address, and Back up and Suspend buttons', 'Claude', '720px'),
		].join('\n\n'), { style: 'tint' }),
		section([
			head({ eyebrow: 'in your control', title: 'It can only do what you can.' }),
			grid([
				['It acts as you', 'With your role on the team. If you can only look, so can the app.'],
				['Only what you ticked', 'Sites, backups, domains, email, versions and pages are each switched on separately.'],
				['It asks first', 'Before anything that deletes or restores, the app checks with you.'],
				['Every change is logged', "Under your name. Page edits can be undone from the page's revisions."],
			].map(([t, b]) => [h(3, `✓ ${t}`, { size: 'medium' }), p(b, { size: 'small' })].join('\n\n')), { min: '14rem', count: 4 }),
		].join('\n\n')),
		questions('AI app questions', [
			['Which AI apps work?', 'Any app that connects to MCP servers: Claude and ChatGPT (on plans that let you add custom connectors), code editors such as Cursor, VS Code with GitHub Copilot and Devin Desktop, and command-line agents such as Claude Code and Gemini CLI. A tool that can’t open a sign-in page can use your storefront’s API key and secret instead.'],
			['Do I need an API key?', "No. You sign in to AnyPress and approve, the same way you'd sign in with Google. The app never sees a password or a secret."],
			['Can my clients use it for their own site?', "Yes. A website owner adds the /mcp/site address and approves in their site's dashboard. Their app can then change that one site's pages and design, and nothing else."],
			['Does it know my site’s designs?', 'Yes. The app can see every ready-made section and starter page, the [17 design kits](/designs/) made for different kinds of business, the colour and font sets, and the [interactive blocks](/designs/blocks/) such as carousels, popups, counters and maps. Ask to see them and the app shows each kit as a live preview of your site in that look, right in the chat. It can switch your site to a kit’s look and build pages from that kit’s sections. The old look is saved, so you can go back.'],
			['How do I stop it?', 'Remove the connector in your AI app. Access also ends the moment you leave the team.'],
			['Building your own agent?', 'The connector speaks the open MCP standard, so any agent can use it. The API, SDKs and webhooks are on the [developer page](/developers/).'],
		]),
		ctaBand({ eyebrow: 'ready?', title: 'Make your next site by asking for it.', body: 'Apply to sell, then connect AnyPress to your AI app. Stuck? Email support@anypress.io.', href: '/sell/', label: 'Apply to sell', drawings: ['plug', 'words', 'website'] }),
	);
}

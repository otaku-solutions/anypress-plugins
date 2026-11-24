// anypress.io/developers: the API, webhooks, SDKs and connector for creating sites from your own product, from the
// live site's page of the same address.
import { buttons, code, columns, grid, group, h, hand, list, p, page, section, form } from './blocks.mjs';
import { ctaBand, pageHero, problemFix } from './shared.mjs';

const API_REPO = 'https://github.com/otaku-solutions/anypress-api';

const PARTS = [
	['REST API', 'Create, suspend, resume, restore, back up and delete sites. Every change runs in the background and reports its status.', '`/v1/tenants`'],
	['Webhooks', 'Signed events when a site is ready, fails, changes domain, gets backed up or is restored. No polling.', '`tenant.ready`'],
	['TypeScript & PHP SDKs', 'Typed clients built from the OpenAPI files, so your editor knows every call and field.', '`npm · composer`'],
	['MCP connector', 'Let Claude, ChatGPT or any MCP client create and manage sites, with a simple sign-in and per-area permissions.', '[`/mcp`](/ai/)'],
	['Your own domains', "Add, remove and switch a site's domains, and give it its own email sending domain, all through the API.", '`domains`'],
	['n8n, Make and Zapier apps', 'Create sites from a form, a payment or a CRM step with the AnyPress app for n8n, Make or Zapier: pick a step, no code to write.', '[`/automate`](/automate/)'],
	['Open source', 'The API, the WordPress plugins and the dashboard are public under the GPL. Read it, improve it, or run it yourself with one installer.', '`GPL-3.0`'],
];

const SAMPLE = `await anypress.tenants.create({
  name: "Kettle & Crumb",
  externalId: customer.id,
  wordPressUserEmail: customer.email,
});

// later, in your webhook handler
if (event.type === "tenant.ready") {
  notify(customer, event.data.tenant.domainName);
}`;

export default function developers() {
	return page(
		pageHero({
			drawing: 'software', eyebrow: 'for developers', title: 'Websites, ==created by your code==.', lead: 'Everything AnyPress does is an API call. Give each of your customers a WordPress site from inside your own product.',
			extra: [buttons([{ text: 'Read the API docs', url: API_REPO }, { text: 'No-code recipes', url: '/automate/', outline: true }])],
		}),
		problemFix({ who: ['SaaS teams', 'Platforms that give each customer a site', 'Developers at web studios', 'Hosts', 'No-code builders'], title: 'A WordPress site for every customer, without building a hosting company.', items: [
			[['Multi-site hosting takes months to build', 'Servers, isolation, backups, domains and certificates, before your first customer gets a site.'], ['One API call per site', 'Create, suspend, resume, restore and delete WordPress sites from your app. We run the servers.']],
			[['Polling to see if it worked', "Site creation takes time, so your code keeps asking until it's done."], ['Signed webhooks', 'Hear the moment a site is ready, fails, changes domain or is backed up, without asking again and again.']],
			[['One customer can take down the rest', "On a shared install, one heavy or hacked site slows or breaks everyone's."], ['Every site stands alone', 'Each site is its own WordPress with its own database, sized Small, Medium or Large.']],
			[['Custom domains are fiddly', "DNS checks, certificates and email sending for every customer's own domain."], ['Domains through the API', 'Add and switch domains, with certificates handled, and give each site its own email sending domain.']],
			[['Locked into a vendor', 'If the host changes its terms, your product is stuck with them.'], ['Open source under the GPL', 'The API, plugins and dashboard are public. Run it yourself with one installer whenever you want.']],
		] }),
		section(grid(PARTS.map(([t, b, tag]) => [h(2, t, { size: 'large' }), p(tag, { size: 'small' }), p(b)].join('\n\n')), { min: '20rem', count: 2 })),
		section(columns([
			[h(2, 'Three calls to a live site.', { size: 'x-large' }), list(['Create the site, with your own id for it.', 'Get `tenant.ready` with its address.', 'Send your customer to their new site, with the WordPress login you created for them.'], { ordered: true, style: '' })].join('\n\n'),
			[p('`signup.ts`', { size: 'small' }), code(SAMPLE)].join('\n\n'),
		]), { style: 'tint' }),
		section(columns([
			[hand('not ready yet?', { align: 'left' }), h(2, 'Read the free guide first.', { size: 'x-large' }), p('Read our free guide, **[your first site from the API](/guides/developers/)**, or get a few short emails with tips.', { size: 'medium' })].join('\n\n'),
			group([h(3, 'Want tips like this by email?', { size: 'large' }), form('tips-by-email')].join('\n\n'), { className: 'is-style-section-card', padding: ['large', 'large'], layout: { type: 'default' } }),
		], { verticalAlign: 'top' })),
		ctaBand({ title: 'Build on AnyPress.', body: "Tell us what you're making and we'll set you up with an API key.", href: '/contact/', label: 'Get API access', drawings: ['software', 'key', 'plug'] }),
	);
}

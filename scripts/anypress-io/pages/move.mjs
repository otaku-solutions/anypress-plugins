// anypress.io/move: moving a WordPress site in with Reprint, and the switches from other plugins into the Fluent
// plugins that every AnyPress site has, from the live site's page of the same address.
import { buttons, columns, drawing, grid, h, hand, head, list, p, page, section } from './blocks.mjs';
import { ctaBand, flow, pageHero, problemFix, questions } from './shared.mjs';

const EMAIL = 'support@anypress.io';

const SWITCHES = [
	['Circle', 'FluentCommunity', "Spaces, members, posts, comments and courses, through Circle's own Admin API."],
	['Skool', 'FluentCommunity', "Your group's members, from the Members tab's export, into a space or course. Their answers to your membership questions go into FluentCRM."],
	['LearnDash, Tutor LMS or LifterLMS', 'FluentCommunity courses', 'Courses and lessons, students and how far each one got.'],
	['MemberPress', 'FluentCommunity', 'Active members get their spaces and courses, with FluentCRM tags. Payments stay in MemberPress.'],
	['BuddyPress or BuddyBoss', 'FluentCommunity', 'Groups become spaces with their members, and posts come with their comments, reactions and photos.'],
	['WooCommerce', 'FluentCart', 'Products, orders, customers, coupons and refunds, plus gallery images and shipping zones.'],
	['Easy Digital Downloads', 'FluentCart', 'Downloads, orders, customers, coupons, tax rates, subscriptions and licences, and the buy buttons on your pages. Run it on your current site with AnyPress Move before it moves in. Licences need FluentCart Pro.'],
	['Contact Form 7, WPForms, Ninja Forms or Gravity Forms', 'Fluent Forms', 'Your forms with their entries, and the pages that show them.'],
	['Calendly', 'FluentBooking', "Your weekly hours, event types and upcoming bookings, through Calendly's own API. Calendly keeps sending the reminders for bookings made there."],
	['WooCommerce buyers, MailPoet or Newsletter', 'FluentCRM', 'Your contacts and lists. Unsubscribed people stay unsubscribed.'],
	['Brevo or MailerLite', 'FluentCRM', "Your contacts, from FluentCRM's own Import screen on your AnyPress site."],
	['AffiliateWP, SliceWP and others', 'FluentAffiliate', 'Your affiliates, their referrals and payouts.'],
	['Awesome Support and others', 'Fluent Support', 'Your help desk tickets.'],
];

const FAQ = [
	['How do I get a Migration Token?', `Pick your plan, then email [${EMAIL}](mailto:${EMAIL}) with your current site's address and we'll send you a token. Selling sites with AnyPress? Choose Move a site in on your dashboard and the token is right there.`],
	['What is Reprint?', 'A [free plugin made by WordPress.org](https://wordpress.org/plugins/reprint/) for moving sites. Add it from Plugins, Add New Plugin like any other, then open Tools, Reprint Server, paste the token and choose Authorize client. It lets your new AnyPress site read a copy of the old one, and nothing on the old site is changed.'],
	['Do I have to keep a page open while it moves?', "No. The copy runs on our side, straight from your old host, and your new site shows Ready when it's done. Big sites can take a while, and an interrupted copy carries on where it stopped."],
	['Is my site down while it moves?', 'No. Your current site keeps running the whole time. Visitors only reach the new one once you point your domain at it.'],
	['What about orders that come in after the copy?', "Your new site stays on hold until you go live: it sends no emails to customers, runs no renewals and isn't shown to search engines. Just before you switch, copy it again and the newest orders, posts and form entries come across. Changes made on the new site in the meantime are replaced, so do your edits after you go live."],
	['What if my host blocks the copy?', "Some security services, such as Cloudflare's browser check or Wordfence, stop the copy. We'll tell you what got in the way. Let it through and copy again, or we'll give you another way to send the site."],
	["What doesn't come across?", "Caches and backup plugins' archives are left out, because your AnyPress site has its own. Caching add-ons your old host put in place are removed for the same reason."],
	['Can I switch plugins once my site is on AnyPress?', "Yes. The moves from Circle, LearnDash, Tutor LMS, LifterLMS, MemberPress, BuddyPress, WooCommerce and the rest are built into every AnyPress site. Each one checks first and tells you what will come across, and an undo takes out only what it added. Your old plugin and its data aren't changed."],
	["My site isn't on AnyPress. Can I still use the moves?", 'Yes. The same moves come as AnyPress Move, a free plugin for any WordPress. It adds Tools, Move to Fluent, with the same check and undo.'],
	['Can I move a multisite network?', 'Not yet. We move one WordPress site at a time. If you run a network, talk to us about your options.'],
	['Does my site need anything special?', 'It needs to be reachable at an https address. Reprint runs on almost any WordPress and PHP your host offers.'],
];

export default function move() {
	return page(
		pageHero({
			drawing: 'truck', eyebrow: 'move your site', title: 'Move your site without losing a thing. ==We copy it all across==.',
			lead: "Already have a WordPress site somewhere else? Add WordPress's free Reprint plugin, paste in your token, and we copy the whole site across. Your old site isn't touched.",
			extra: [
				buttons([{ text: 'Pick a plan →', url: '/pricing/' }, { text: 'Ask about moving', url: `mailto:${EMAIL}?subject=Moving%20my%20site%20to%20AnyPress`, outline: true }]),
				list(['Nothing to upload', 'No downtime', 'Old site left as it is'], { style: 'inline' }),
			],
		}),
		problemFix({ who: ['WordPress site owners', 'Shops on another host', "Sellers moving clients' sites"], title: "Moving a site shouldn't be a weekend job.", items: [
			[['Moving takes a weekend', 'Exporting the database, copying files and fixing what broke on the way is a job most people put off for years.'], ['A free plugin and a token', "Add WordPress's free Reprint plugin to your current site and paste in your token. We copy the rest."]],
			[['The site goes down while it moves', 'Visitors and orders hit an error page while files are copied and settings are changed.'], ['No downtime', 'Your current site keeps running the whole time. Visitors only reach the new one once you point your domain at it.']],
			[['Something gets left behind', "A missing plugin, a lost photo folder or last week's orders turn up after the switch."], ['Everything comes across, right up to the switch', 'Pages, posts, products, orders, customers, settings, themes, plugins, photos and files. Copy again before you go live and the newest orders come too.']],
			[['The upkeep stays with you', 'On most hosts, security fixes and copies of your site are still your job after you move.'], ['Looked after from then on', 'We apply security fixes and save a copy of your site every night.']],
		] }),
		section([head({ eyebrow: 'how it works', title: 'Add a plugin, paste a token. We do the moving.' }), flow([
			['ticket', 'Get your token', 'We set up your new site and give you its Migration Token.'],
			['plug', 'Add Reprint', "Install Reprint, WordPress's own free moving plugin, on your current site and paste the token in."],
			['truck', 'We copy it across', 'Your new site copies the old one straight from its host. Nothing to download, nothing to upload.'],
			['open', 'Check it, then go live', 'Look it over on its new address, copy again to catch new orders, then point your domain at it.'],
		])].join('\n\n')),
		section([head({ eyebrow: 'what comes across', title: 'Everything that makes it your site.' }), grid([
			['words', 'Every page and post', 'Your whole database: pages, posts, products, orders, customers and settings.'],
			['paint', 'Your look', 'Your themes, plugins, photos, files and languages.'],
			['lock', 'Your old site, untouched', "Nothing on your current site is changed or deleted. It keeps running until you switch."],
		].map(([d, t, b]) => [drawing(d, 110), h(3, t, { align: 'center', size: 'medium' }), p(b, { align: 'center' })].join('\n\n')), { min: '16rem', count: 3 })].join('\n\n'), { style: 'tint' }),
		section([
			head({ eyebrow: 'switch to Fluent', title: 'Leaving another plugin or platform? Bring it along.', lead: 'Once your site is here, a move copies one plugin’s data into the Fluent plugin that replaces it. It checks first and says what will come across, it can be undone, and your old plugin is left as it was.' }),
			grid(SWITCHES.map(([from, into, what]) => [h(3, `${from} → ${into}`, { size: 'medium' }), p(what, { size: 'small' })].join('\n\n')), { min: '17rem', count: 3 }),
		].join('\n\n'), { anchor: 'switches' }),
		section(columns([
			drawing('agency', 160),
			[
				hand('selling sites?', { align: 'left' }),
				h(2, "Move your clients' sites in from your dashboard.", { size: 'x-large' }),
				p("Choose **Move a site in** on your Stores page. It sets up a store that waits for the site and gives you the Migration Token to hand to your client. Once Reprint is authorized, enter the old site's address and start the copy, and copy again before it goes live."),
				p('Developers can start and repeat the copy with one API call.'),
				buttons([{ text: 'How selling works →', url: '/sellers/' }, { text: 'For developers', url: '/developers/', outline: true }], { justify: 'left' }),
			].join('\n\n'),
		], { widths: ['25%', '75%'] }), { style: 'dark' }),
		questions('Questions about moving', FAQ),
		ctaBand({ eyebrow: 'ready to move?', title: 'Your site, without the old hassle.', body: "Pick a plan, then we'll send your token. Your site keeps running until you switch.", href: '/pricing/', label: 'Pick a plan', drawings: ['truck', 'box', 'open'] }),
	);
}

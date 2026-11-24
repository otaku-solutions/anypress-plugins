// anypress.io/hosting and /updates: how every site is hosted, backed up and updated without breaking, from the live
// site's pages of the same address. Sizes come from SIZES in site-data.json.
import { columns, group, h, hand, head, image, list, p, page, section, table } from './blocks.mjs';
import { ctaBand, facts, flow, pageHero, problemFix, questions, videos } from './shared.mjs';

export const hosting = (data) => page(
	pageHero({ drawing: 'server', eyebrow: 'hosting and safety', title: 'Fast, safe hosting ==you never have to think about==.', lead: "Your site runs on its own, it's backed up every night, and the padlock and speed settings are done before you log in. Here's exactly how, in plain words." }),
	problemFix({ eyebrow: 'why it matters', title: "Hosting shouldn't be another job.", items: [
		[['A slow site loses customers', 'Shared hosting means a busy neighbour can slow your pages right when people are buying.'], ['Your own space, already fast', 'Your site has its own set share of the machine, with caching and speed settings done for you.']],
		[['Backups nobody has tested', "You find out a backup doesn't work on the day you need it."], ['Tested every single day', 'Every night we restore a real backup onto a spare copy and check it opens.']],
		[['Plugins just to keep the lights on', 'A backup plugin, a security plugin, a cache plugin, an SSL setup. Each one more thing to update.'], ['Built in, not bolted on', 'Backups, the padlock, caching and sign-in protection come with every site. Nothing to install.']],
	] }),
	section([head({ eyebrow: 'every site gets', title: 'Done for you before you write a word.' }), facts([
		['server', 'Its own WordPress', 'Every site has its own copy of WordPress, its own database and its own web server. Nothing is shared with other sites.'],
		['lock', 'The padlock, free', 'Every site and every domain gets an HTTPS certificate, renewed for you. Browsers are told to always use it.'],
		['backup', 'Nightly backups', 'Files and database, every night, stored away from the servers. We test that one restores every day.'],
		['tools', 'Fast from day one', 'Pages are cached, PHP is tuned for WordPress, and communities get their own Redis cache.'],
		['key', 'Sign-ins protected', 'Repeated wrong passwords are blocked, and the file editor is switched off in wp-admin.'],
		['email', 'Email that arrives', "Site email sends from your own domain once it's verified, not from a shared server."],
		['open', 'Up to date', 'WordPress 7.1 on PHP 8.3, updated for you after every update is tried on every kind of site.'],
		['box', 'Yours to take', 'Download your whole site as one zip any time. It works on any WordPress host.'],
	])].join('\n\n')),
	section([
		head({ eyebrow: 'sizes', title: 'Start Small, move up any time.', lead: 'Each size gets its own share of the machine, sized from load tests. Move up when your site gets busier.' }),
		table(['', 'Computing power', 'Memory', 'Storage', 'Emails a month', 'Good for'], data.SIZES.map((s) => [`**${s.name}**`, s.cpu, s.memory, s.storage, s.emails, s.goodFor])),
	].join('\n\n'), { style: 'tint' }),
	section([
		head({ eyebrow: 'backups', title: 'A backup only counts if it restores.', lead: 'So we restore one every day to prove it.' }),
		flow([
			['backup', 'Every night', "Your site's files and database are zipped and stored away from the servers."],
			['note', 'Kept for weeks', 'We keep one copy from each of the last 7 days and each of the last 4 weeks.'],
			['tools', 'Tested every day', "Every night one site's backup is restored onto a spare copy and checked it opens. Every site gets its turn."],
			['open', 'Put back in a click', 'Restore any copy from your dashboard. We save the site as it is first, so you can undo it.'],
		]),
		group(videos([['backups-and-restores', 'Backups and restores', '0:29']]), { layout: { type: 'constrained', contentSize: '360px' } }),
	].join('\n\n')),
	questions('Questions about hosting', [
		['Is my site on a shared server?', "Sites share the machine, not the site. Each one has its own WordPress, database and set amount of computing power and memory, so a busy neighbour can't slow yours down or reach your files."],
		['What happens if a backup fails?', "It's tried again ten minutes later. If it still fails, it lands on our list to fix. Your site keeps running either way."],
		['How big can uploads be?', 'Up to 64 MB a file on most sites. Community and Everything sites take up to 512 MB, for the videos members post.'],
		['Do you keep my backups if I leave?', 'When a site is removed, its backups are kept for another 90 days, so it can be brought back if you change your mind.'],
		['Can I install my own plugins?', "Yes. Your site is real WordPress. We look after the plugins every site comes with; ones you add, you update. [See what's included](/included/)."],
		['Who updates WordPress?', 'We do. [How updates stay safe](/updates/).'],
	]),
	ctaBand(),
);

const SITES = 24;
const STEPS = [
	['Make a new version', 'v1.5 · a copy of v1.4', "One click copies your starting site. Every client's site stays on v1.4 and doesn't notice a thing."],
	['Add the booking page', 'v1.5 · booking page added', 'Add the plugin, build the page, change the menu. Only in v1.5.'],
	['Try it yourself', 'v1.5 · opened and checked', 'Open v1.5 like a real site. Book a test appointment.'],
	['Move sites over', 'New orders get v1.5', `Move one client first, then the rest when you're happy. Their pages, orders and photos come with them. All ${SITES} sites are now on v1.5.`],
	['Go back if you need to', '1 site back on v1.4', `A client who doesn't want it? Move their site back. v1.4 stays in your list, and ${SITES - 1} sites stay on v1.5.`],
];

/** A worked example of changing every client's site with versions of the starting site, beside the real Templates page. */
export const versionStory = () => [
	group([hand('for example'), p(`You want every client to get a booking page. You have ${SITES} clients on version v1.4 of your starting site.`, { align: 'center', size: 'medium' })].join('\n\n'), { layout: { type: 'constrained' } }),
	columns([
		STEPS.map(([t, tag, b], i) => [h(3, `${i + 1}. ${t}`, { size: 'medium' }), list([tag], { style: 'pills' }), p(b)].join('\n\n')).join('\n\n'),
		[
			image('{{assets}}/sell/seller-templates.webp', { alt: 'The Templates page in the AnyPress dashboard: saved versions of the starting site, with v1.4 marked Production and a New version button', className: 'is-style-browser-window' }),
			p('app.anypress.io · Templates (sample data)', { align: 'center', size: 'small' }),
		].join('\n\n'),
	], { verticalAlign: 'top', widths: ['45%', '55%'] }),
].join('\n\n');

export const updates = () => page(
	pageHero({ drawing: 'tools', eyebrow: 'safe updates', title: 'Updates that ==never break your site==.', lead: 'We keep WordPress and everything that comes with it up to date, after trying every update on every kind of site. You never press Update, and you can always go back.' }),
	problemFix({ eyebrow: 'why it matters', title: 'Updates are where websites break.', items: [
		[['One update takes the site down', 'You press Update, the page goes white, and you hear about it from a customer.'], ['Tried before it touches you', "Every update runs on a test copy of every kind of site first. If anything errors, it never reaches yours."]],
		[['Updating site after site', 'Forty client sites means forty logins and forty Update buttons, every week.'], ['Done for every site at once', 'WordPress, the theme and the plugins every site comes with are updated for you, everywhere.']],
		[['No way back', 'A change goes wrong and the only fix is a late night putting it back by hand.'], ['Go back in a click', "The version a site was on is kept. Move it back, and it's as it was."]],
	] }),
	section([
		head({ eyebrow: 'what we update for you', title: 'Every update is tried before it reaches you.', lead: "Nobody presses Update on a live site. Here's the path every update takes first." }),
		flow([
			['open', 'We spot a new release', 'Every hour we look for new versions of WordPress, our theme, our blocks and the plugins every site comes with.'],
			['tools', 'We try it on every kind of site', 'A test copy of each kind of site is built with the update. Every admin screen and the home page must load without an error.'],
			['backup', 'We test it like a real site', 'The test copy is set up the way a new site is, and every page must open before the update goes anywhere.'],
			['truck', 'Sites move over', "Only then does it reach your sites. A site that doesn't move cleanly is put back where it was."],
			['key', 'The old version stays', 'The version sites were on is kept, so we can always go back.'],
		]),
	].join('\n\n')),
	section([
		head({ eyebrow: 'for sellers: your own changes', title: "Change all your clients' sites at once, without breaking one.", lead: "Your starting site is the one every order is copied from. Change a copy of it, try it, then move sites over when you're ready." }),
		versionStory(),
	].join('\n\n'), { style: 'tint' }),
	questions('Questions about updates', [
		['Do I have to update anything?', 'Not for WordPress, our theme, our blocks or the plugins every site comes with. We do those. Plugins you add yourself, you update in a new version of your starting site.'],
		['Will an update change my pages or orders?', "No. Updates change the software, not what's in the site. Your pages, posts, orders, members and uploads stay as they are."],
		['How fast do security fixes arrive?', 'We look for new releases every hour. A fix reaches sites as soon as it has passed the checks above, usually the same day.'],
		['What if an update breaks something?', "It shouldn't get that far, because every update is tried on every kind of site first. If it does, the site can go back to the version it was on, and every site also has nightly backups."],
		["Can I stop my clients' sites from getting a change of mine?", 'Yes. Your changes only reach a site when you move it to the new version. Until then it stays on the one it has.'],
		['Can I turn on automatic plugin updates in WordPress?', "There's no need for the plugins we include, because we update them for you. For more about how sites are run, see [hosting and safety](/hosting/)."],
	]),
	ctaBand(),
);

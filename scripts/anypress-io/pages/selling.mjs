// anypress.io/sellers/setup and /sellers/autopilot: how a seller gets set up with us, and what happens to every
// client's site on its own after the sale, from the live site's pages of the same address.
import { head, p, page, section, table } from './blocks.mjs';
import { ctaBand, facts, flow, pageHero, problemFix, questions, videos } from './shared.mjs';

const EMAIL = 'support@anypress.io';
const WHO = ['Freelance web designers', 'Small web design studios', 'Marketing consultants', 'Chambers selling to members', 'Franchise offices'];

export const sellerSetup = () => page(
	pageHero({ drawing: 'nametag', eyebrow: 'how we set you up', title: 'Start selling websites, ==with us beside you==.', lead: 'Every seller and reseller starts with a call. We set you up together, then stay close while you make your first sales.' }),
	problemFix({ who: WHO, title: "Getting started shouldn't be a guessing game.", items: [
		[["Sign up, then you're on your own", 'Most platforms hand you a login and a help centre, and wish you luck.'], ['A real call with us', 'Half an hour together before you start. We show you the real thing and answer every question.']],
		[['Not sure what to charge', 'Price too low and you work for free. Too high and nobody buys.'], ['Prices worked out together', "We go through what you'd sell, what it costs you and what you'd earn, before your first sale."]],
		[['Billing surprises', "You only learn how you're charged when the first bill lands."], ['Billing agreed on the call', "You know exactly how you pay us before you're set up."]],
	] }),
	section([head({ eyebrow: 'step by step', title: 'From applying to your first sale.' }), flow([
		['sell', 'Apply', 'Two minutes on [Apply to sell](/sell/): your business and who you build for.'],
		['mailbox', 'Book your call', 'The email that follows has a link to pick a time that suits you. It takes half an hour.'],
		['question', 'The call', 'We get to know your business, show you how selling works on the real thing, and agree how billing works.'],
		['key', "You're approved", 'You get an email with your sign-in link. Your storefront is built in minutes.'],
		['shops', 'Your first week', "Make your storefront yours, pick what you sell and set your prices. We're on email the whole way."],
	])].join('\n\n')),
	section([head({ eyebrow: 'before the call', title: 'Handy to have ready.', lead: 'None of it is required. It just makes the call go further.' }), facts([
		['paint', 'Your name and logo', 'So your storefront looks like yours from day one.'],
		['domain', 'Your domain', "The address you'd like your storefront on, if you have one."],
		['card', 'A Stripe account', "Where your clients' payments land. No account yet? We'll show you how to make one."],
		['coins', "What you'll sell", "Roughly what you'll offer and what you'd like to charge."],
		['shops', 'Your brands', 'If you run more than one, a list of them.'],
	])].join('\n\n'), { style: 'tint' }),
	section([head({ eyebrow: 'see it first', title: "What you'll be setting up." }), videos([
		['set-up-your-storefront', 'Set up your storefront', '1:45'],
		['a-sellers-first-sale', "A seller's first sale, from checkout to a finished site", '0:52'],
		['a-resellers-first-day', "A reseller's first day: storefronts, bill and keys", '1:06'],
	])].join('\n\n')),
	questions('Questions about getting set up', [
		["Why a call? Can't I just sign up?", 'Selling websites works best when billing, what you sell and your prices are right from day one. Half an hour together saves weeks of guessing.'],
		['What does the call cost?', "Nothing. It's how every seller and reseller starts."],
		['Seller or reseller: which am I?', "One business name is a seller. Several brands, each with its own storefront, is a reseller. We'll work it out on the call. [See the difference](/how-it-works/sellers/#h-pay)."],
		['Do I have to build a starting site?', "No. Sell our ready-built sites as they are, or change one into your own. We'll go through both on the call."],
		['I already host client sites. Can I bring them?', "Yes. [Moving a site in](/move/) copies the whole site across. We'll plan it with you on the call."],
		["Who do I talk to after I'm set up?", `Us. Email [${EMAIL}](mailto:${EMAIL}) and we'll help.`],
	]),
	ctaBand({ eyebrow: 'ready?', title: 'Apply in two minutes.', body: 'Tell us about your business and who you build for. The email that follows has the link to book your call.', href: '/sell/', label: 'Apply to sell websites', drawings: ['sell', 'mailbox', 'shops'] }),
);

export const autopilot = () => page(
	pageHero({ drawing: 'tools', eyebrow: 'selling on autopilot', title: 'Sell the site. ==We handle everything after==.', lead: 'Building it, billing it, backing it up, pausing it when a card fails and taking it down when a client leaves. You get paid. Your team never presses a button.' }),
	problemFix({ who: WHO, title: "Selling sites shouldn't mean babysitting them.", items: [
		[['Building every site by hand', 'Each new client means an afternoon of installing WordPress, plugins and a theme before you earn a cent.'], ['Sold means built', 'Your client pays and their site is ready minutes later, copied from yours. Nobody touches a thing.']],
		[['Chasing clients who stopped paying', "The card fails, the site stays up, and you're stuck sending awkward emails."], ['Late payers are paused for you', 'No payment, no site. It comes back the moment they pay, exactly as it was.']],
		[["Old sites you're still paying for", 'A client left months ago, and their site is still on your hosting bill.'], ['Leavers are cleaned up', "When a client's paid time runs out, their site is backed up and taken down. Nothing to remember."]],
	] }),
	section([head({ eyebrow: "a client's first month", title: 'From the first payment to the next one.' }), flow([
		['pick', 'Your client orders', 'They pick a site on your storefront and pay you, at your price.'],
		['tools', 'The site is built', 'In minutes, copied from your starting site, with their details filled in.'],
		['mailbox', 'They get your welcome', 'An email from your name with a link to set their password and open their site.'],
		['bill', "They're billed each month", 'Your storefront takes the payment. Nothing for you to send or chase.'],
		['backup', 'Every night, a copy', 'Their site is backed up, and we keep updating WordPress and the plugins.'],
	])].join('\n\n')),
	section([
		head({ eyebrow: 'what happens when', title: 'Every awkward moment, already handled.', lead: 'Failed cards, cancellations and clients who come back. Look down the last column.' }),
		table(['', 'What happens', 'What you do'], [
			['An order is paid', 'The site is built and the welcome email goes out', 'Nothing'],
			['A monthly payment goes through', 'The site stays as it is', 'Nothing'],
			['A payment fails', 'The site is paused. Nothing is deleted', 'Nothing'],
			['The client pays again', 'The site comes back as it was', 'Nothing'],
			['The client cancels', 'The site stays up until the end of the time they paid for', 'Nothing'],
			['Their paid time runs out', 'The site is backed up and taken offline', 'Nothing'],
			['30 days later', 'The site is removed. Its backups are kept another 90 days', 'Nothing, or change the 30 days in your settings'],
			['The client comes back', 'Their site is put back from its backup', 'Nothing'],
		].map(([a, b, c]) => [`**${a}**`, b, `✓ ${c}`])),
	].join('\n\n'), { style: 'tint' }),
	section([head({ eyebrow: 'see it', title: 'Watch it happen on the real thing.' }), videos([
		['a-sellers-first-sale', "A seller's first sale, from checkout to a finished site", '0:52'],
		['create-sites-automatically', 'Create sites from a form or a payment', '0:38'],
		['backups-and-restores', 'Backups and restores', '0:29'],
	])].join('\n\n')),
	questions('Questions about selling on autopilot', [
		['Do I have to do anything when someone buys?', "No. The order builds the site and sends your welcome email. You'll see the new site in your dashboard a few minutes later."],
		["What if a client's card fails?", 'Their site is paused, not deleted. When they pay, it comes back exactly as it was.'],
		['What does a paused site look like?', "Visitors see a short page saying the site isn't available right now. The site itself, its pages, orders and members, are kept."],
		['Can a client leave and come back?', 'Yes. If they buy again before their backups are gone, their site is put back from its last backup, with everything they had.'],
		["Can I take a client's site somewhere else?", "Yes. Download site on a site's page in your dashboard makes one zip of WordPress, its files and its database. It works on any WordPress host."],
		['Can sites start somewhere other than my storefront?', 'Yes, from a form, your CRM or your own app. [See the ways in](/automate/). Every site follows the same steps after that.'],
	]),
	ctaBand({ eyebrow: 'ready?', title: 'Sell websites without building them.', body: 'Tell us about your business, then book a short call with us to get set up.', href: '/sell/', label: 'Apply to sell websites', drawings: ['sell', 'tools', 'coins'] }),
);

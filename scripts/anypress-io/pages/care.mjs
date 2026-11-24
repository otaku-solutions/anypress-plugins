// anypress.io/care and /help: care packages and one-time help (every price a shortcode on the live price list), and
// quick answers for website owners, from the live site's pages of the same address.
import { buttons, columns, faq, grid, h, hand, head, list, p, page, section } from './blocks.mjs';
import { ctaBand, num, pageHero, questions } from './shared.mjs';

const EMAIL = 'support@anypress.io';
const ACCOUNT = 'https://shop.anypress.io/account/';
const CARE_ADD = 'https://shop.anypress.io/account/website';
const care = (item, show) => `[anypress_care item="${item}" show="${show}"]`;

const PACKAGES = [
	['care', 'For owners who mostly run the site themselves and want someone on call.', []],
	['care-plus', 'For a business adding pages, products or courses most months.', ['Set-up jobs included']],
	['care-pro', 'For a busy community, shop or course business.', ['A 30-minute planning call each month']],
];
const SERVICES = [
	['set-up-my-site', 'We fill in your pages, logo, colours, menus and first products, courses or spaces from what you send us.'],
	['move-my-site-in', 'We run the move from WordPress, Circle, LearnDash, Tutor LMS, LifterLMS, MemberPress or WooCommerce, then check it.'],
	['one-hour', 'For a one-off change, with no package. The hour is added to your website and used as you ask.'],
];

export const carePage = () => page(
	pageHero({
		drawing: 'lifebuoy', eyebrow: 'care', title: 'Changes to your site, made for you every month. ==Just email us what you need==.',
		lead: `A new page, a new price, a photo swapped or a form changed: email us and we'll do it, with time set aside for you every month. From ${num('careFrom')} a month, on any AnyPress website.`,
		extra: [buttons([{ text: 'Add care to my website', url: CARE_ADD }, { text: 'Start a website', url: '/#sites', outline: true }])],
	}),
	section([
		head({ title: 'Three packages.', lead: 'Each one is a set amount of time for changes every month. Pick the one that fits how often your site changes.' }),
		grid(PACKAGES.map(([key, who, adds]) => [
			h(3, care(key, 'name'), { size: 'large' }),
			p(`**${care(key, 'monthly')}** a month`, { size: 'x-large' }),
			p(`or ${care(key, 'yearly')} a year, ${num('monthsFree')} months free`, { size: 'small' }),
			p(who),
			list([`${care(key, 'time')} of changes a month`, `Answered within ${care(key, 'answer')}`, ...adds, 'A monthly report of what we did']),
			buttons([{ text: `Add ${care(key, 'name')}`, url: CARE_ADD, outline: true }], { justify: 'left' }),
		].join('\n\n')), { min: '17rem', count: 3 }),
	].join('\n\n')),
	section([
		head({ title: 'One-time help.', lead: "No package needed. Each is paid once, from the website's card in your account." }),
		grid(SERVICES.map(([key, about]) => [h(3, care(key, 'name'), { size: 'medium' }), p(`**${care(key, 'price')}**`, { size: 'large' }), p(about)].join('\n\n')), { min: '17rem', count: 3 }),
		p(`With a care package, an extra hour is ${care('extra-hour', 'price')}, bought straight from the website's card in your account.`, { align: 'center' }),
	].join('\n\n'), { style: 'tint' }),
	section([
		head({ title: 'How it works.' }),
		grid([
			['Add it to your website', "Pick a package right after you buy your plan, or any time later from the website's card in your account. Checkout takes a minute."],
			['Your time is ready', "Your package's time for this month is there as soon as you pay, and starts again on the 1st of each month."],
			['Send requests, we make the changes', "Write what you need on the website's card in your account. We log the time each change takes, and the card shows what's left this month."],
		].map(([t, b], i) => [hand(String(i + 1), { align: 'left', size: 'xx-large' }), h(3, t, { size: 'medium' }), p(b)].join('\n\n')), { min: '17rem', count: 3 }),
	].join('\n\n')),
	section([
		head({ title: 'Care terms.', lead: 'These add to our [Terms of Service](/terms/) and [Refund Policy](/refund-policy/).', anchor: 'terms' }),
		list([
			'Care is for one website: the one you add it to. Each website needs its own package.',
			"Your monthly time starts again on the 1st of each month. Unused time doesn't carry over.",
			`When a month's time runs out, an extra hour is ${care('extra-hour', 'price')} with a care package, or ${care('one-hour', 'price')} without one. Hours you buy never expire and are used after the month's time.`,
			'Answer times count business days, Monday to Friday. We answer by email; the change itself may take longer for bigger jobs, and we tell you when.',
			`A year of care costs ${num('yearlyMonths')} months, so ${num('monthsFree')} months are free.`,
			"Care renews on its own and you can cancel it any time from your account. It ends when the website's plan ends.",
			"Care isn't refunded for days your website is offline or paused.",
			'Care is paid by card.',
		], { style: 'divided' }),
	].join('\n\n'), { style: 'tint', width: 'narrow' }),
	questions('Questions.', [
		['What counts as a change?', 'Anything on your website: new pages and text, photos, products, courses, menus, forms, emails, settings, and fixing something that broke.'],
		['Can I change packages?', 'Yes. Write to us and we move your website to the other package.'],
		['Not sure which one fits?', `Write to us at [${EMAIL}](mailto:${EMAIL}) with what you'd like done, and we'll tell you which package fits.`],
		['Do I need care?', "No. Your plan already includes hosting, nightly backups and help when something isn't working: reply to any of our emails or open a support ticket from your site. Care is for when you'd like us to make the changes for you."],
		['Who makes the changes?', `Our own team. Ask us anything first at [${EMAIL}](mailto:${EMAIL}).`],
	]),
	ctaBand({ title: 'Want us to look after it?', body: 'Add a package from your account, right after your plan or any time later.', href: CARE_ADD, label: 'Add care to my website' }),
);

const HELP = [
	['Your account', [
		['How do I sign in?', `Go to [your account page](${ACCOUNT}) and sign in with the email address you bought your plan with. If you don't know your password, choose "Lost your password?" on the sign-in page and we'll email you a link to set a new one.`],
		["How do I open my site's editor?", `Sign in to [your account page](${ACCOUNT}), open My website and choose Log in to your website. It opens your site's WordPress dashboard already signed in, with no second password.`],
		["My site isn't ready yet. Is that normal?", "A new site is usually ready a few minutes after you pay. We email you when it is. If it's been more than an hour, email us and we'll look right away."],
	]],
	['Your domain', [
		['What address does my site start with?', 'Every site starts on a free address ending in anypress.site, with a secure (https) connection. You can keep it or switch to your own domain whenever you like.'],
		['How do I use my own domain?', `Sign in to [your account page](${ACCOUNT}) and open My website. Under "Use your own domain" you'll find the records to add where your domain is managed (the company you bought it from, or Cloudflare). Add them, then type your domain in the same place. The secure connection is set up for you, and the old address keeps working for a few minutes while it switches.`],
	]],
	['Billing', [
		['How do I cancel?', `Sign in to [your account page](${ACCOUNT}), open My website and choose Manage or cancel plan. Your site stays online until the end of the period you've paid for, and you won't be charged again.`],
		['Is there a free trial?', `Yes. Your first website plan starts with ${num('trialDays')} days free. You add a card when you start, and the plan's price starts after the free days unless you cancel first from your account. It's one free trial per person.`],
		['How do I get a refund?', `Your first payment for a new plan is covered by our 30-day money-back guarantee. Email [${EMAIL}](mailto:${EMAIL}?subject=Refund) within 30 days with your account's email address and your site name. A refund ends the plan and takes the site offline, so export anything you want to keep first. The details are in our [refund policy](/refund-policy/).`],
		['Can I change my plan or size?', "Yes. [Email us](/contact/) with your site name and what you'd like, and we'll switch it for you. The new price starts from your next renewal."],
	]],
	['Looking after your site', [
		['Is my site backed up?', "Yes. We save a copy of every site each night and keep daily and weekly copies. If something goes wrong, email us and we'll bring it back."],
		['Who looks after security fixes?', 'We do. Security fixes for WordPress, its plugins and the server are applied for you, so you can get on with your business.'],
	]],
	['If you sell websites', [
		['I sell websites. Where do I sign in?', 'Sellers and resellers sign in to the dashboard at [app.anypress.io](https://app.anypress.io), not here. It has every client and site you sell. New to selling? [See how selling works](/how-it-works/sellers/).'],
		['Where do my clients sign in?', 'On your own storefront. They never get an AnyPress login, and they never see AnyPress.'],
	]],
];

export const help = () => page(
	pageHero({
		drawing: 'lifebuoy', eyebrow: 'help', title: 'How can we help?', lead: "Quick answers to the things people ask most. If yours isn't here, email us and we'll help.",
		extra: [buttons([{ text: 'Sign in to your website', url: ACCOUNT }, { text: EMAIL, url: `mailto:${EMAIL}`, outline: true }])],
	}),
	section(HELP.map(([title, items]) => columns([h(2, title, { size: 'large' }), faq(items, { firstOpen: false })], { verticalAlign: 'top', widths: ['35%', '65%'] })).join('\n\n')),
);

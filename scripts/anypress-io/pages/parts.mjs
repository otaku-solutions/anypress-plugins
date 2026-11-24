// anypress.io's header, footer and menu: the header's links and the footer's four columns from the live site.
import { buttons, columns, group, h, p } from './blocks.mjs';

const SHOP = 'https://shop.anypress.io';

export const MENU = [
	['/pricing/', 'Prices'],
	['/how-it-works/', 'How it works'],
	['/#examples', 'Examples'],
	['/designs/', 'Designs'],
	['/who/', "Who it's for"],
	['/help/', 'Help'],
	['/sellers/', 'Sell websites', [['/sellers/', 'Sell websites'], ['/how-it-works/sellers/', 'How selling works'], ['/resellers/', 'Become a reseller']]],
];

/** The menu as navigation-link blocks, for the wp_navigation post setup.php makes. */
export function menu() {
	const link = ([url, label]) => `<!-- wp:navigation-link ${JSON.stringify({ label, url, kind: 'custom', isTopLevelLink: true })} /-->`;
	return MENU.map(([url, label, sub]) => (sub
		? `<!-- wp:navigation-submenu ${JSON.stringify({ label, url, kind: 'custom' })} -->\n${sub.map(link).join('\n')}\n<!-- /wp:navigation-submenu -->`
		: link([url, label]))).join('\n');
}

/** The header: logo and name, the menu (setup.php fills in its id), and the button to start. */
export const header = () => group(
	group([
		group('<!-- wp:site-logo {"width":36,"shouldSyncIcon":true} /-->\n\n<!-- wp:site-title {"level":0} /-->', { layout: { type: 'flex', flexWrap: 'nowrap' }, gap: 'small' }),
		group([
			'<!-- wp:navigation {"ref":{{menu}},"overlayMenu":"mobile","layout":{"type":"flex","justifyContent":"right"}} /-->',
			buttons([{ text: 'Start your site →', url: '/#sites' }], { justify: 'right' }),
		].join('\n\n'), { layout: { type: 'flex', flexWrap: 'nowrap' }, gap: 'medium' }),
	].join('\n\n'), { layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' } }),
	{ align: 'full', padding: ['small', 'medium'], layout: { type: 'constrained', contentSize: '80rem' } },
);

const FOOTER = (types) => [
	['Get a website', [...types.map((t) => [`/sites/${t.id}/`, t.name]), ['/pricing/', 'Prices'], ['/how-it-works/', 'How it works'], ['/move/', 'Move your site'], ['/care/', 'Care for your site'], ['/compare/', 'Compare']]],
	['Sell websites', [['/sellers/', 'Sell websites'], ['/how-it-works/sellers/', 'How selling works'], ['/sellers/setup/', 'How we set you up'], ['/sellers/autopilot/', 'Selling on autopilot'], ['/resellers/', 'Become a reseller'], ['/sell/', 'Apply to sell'], ['/automate/', 'Create sites automatically'], ['/ai/', 'AnyPress in your AI app'], ['/developers/', 'For developers'], ['/self-host/', 'Run it yourself'], ['https://github.com/otaku-solutions/anypress-plugins', 'Open source code']]],
	['AnyPress', [['/who/', "Who it's for"], ['/#examples', 'Example sites'], ['/designs/', 'Designs'], ['/designs/blocks/', 'Blocks'], ['/included/', "What's included"], ['/hosting/', 'Hosting and safety'], ['/updates/', 'Safe updates'], ['/changelog/', "What's new"], ['/affiliates/', 'Affiliate program'], ['/about/', 'About'], ['/contact/', 'Contact']]],
	['Help', [['/help/', 'Help'], [`${SHOP}/account/`, 'Sign in to your website'], ['https://app.anypress.io', 'Seller and reseller sign-in'], ['/terms/', 'Terms'], ['/privacy/', 'Privacy'], ['/refund-policy/', 'Refunds']]],
];

/** The footer: the four columns of links, then the business and the contact address. */
export const footer = (data) => group([
	columns(FOOTER(data.SITE_TYPES).map(([title, links]) => [
		h(2, title, { size: 'medium' }),
		group(links.map(([url, label]) => p(`[${label}](${url})`, { size: 'small' })).join('\n'), { layout: { type: 'flex', orientation: 'vertical' }, gap: 'small' }),
	].join('\n\n')), { verticalAlign: 'top' }),
	p('© AnyPress, by Otaku Solutions. · [support@anypress.io](mailto:support@anypress.io)', { size: 'small' }),
].join('\n\n'), { align: 'full', className: 'is-style-section-dark', padding: ['x-large', 'medium'], layout: { type: 'constrained', contentSize: '80rem' } });

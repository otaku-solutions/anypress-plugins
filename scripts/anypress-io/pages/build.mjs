// Writes anypress.io's pages as block markup into html/, with pages.json listing each page's address and title for
// setup.php. The words and lists come from site-data.json, exported from anypress-site's src/lib (see README.md).
//
//   node build.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import home from './home.mjs';
import pricing from './pricing.mjs';
import guidePage, { guidesIndex } from './guides.mjs';
import resellers from './resellers.mjs';
import sellers from './sellers.mjs';
import sitePage, { sitesIndex } from './sites.mjs';
import { footer, header, menu } from './parts.mjs';
import { hosting, updates } from './trust.mjs';
import { carePage, help } from './care.mjs';
import { autopilot, sellerSetup } from './selling.mjs';
import move from './move.mjs';
import { affiliateKit, affiliates } from './affiliates.mjs';
import developers from './developers.mjs';
import ai from './ai.mjs';
import automate from './automate.mjs';
import forms from './forms.mjs';
import sell from './sell.mjs';
import comparePage, { compareIndex } from './compare.mjs';
import { designBlocks, designs } from './designs.mjs';
import { howItWorks, howItWorksSellers } from './how.mjs';
import { about, changelog, contact, highlevel, included, legal } from './simple.mjs';
import groupPage, { whoIndex } from './who.mjs';
import beta from './beta.mjs';
import selfHost from './selfhost.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(resolve(HERE, 'site-data.json'), 'utf8'));
const PAGES = [
	{ path: '', file: 'home', title: 'AnyPress', build: home },
	{ path: 'pricing', file: 'pricing', title: 'Prices', build: pricing },
	{ path: 'sites', file: 'sites', title: 'Kinds of site', build: sitesIndex },
	{ path: 'sellers', file: 'sellers', title: 'Sell websites', build: sellers },
	{ path: 'resellers', file: 'resellers', title: 'Resellers', build: resellers },
	{ path: 'who', file: 'who', title: "Who it's for", build: whoIndex },
	...data.AUDIENCE_GROUPS.filter((g) => g.page).map((g) => ({ path: `who/${g.id}`, file: `who-${g.id}`, title: g.name, build: (d) => groupPage(d, g.id) })),
	{ path: 'guides', file: 'guides', title: 'Free guides', build: guidesIndex },
	...data.GUIDES.map((g) => ({ path: `guides/${g.id}`, file: `guides-${g.id}`, title: g.title, build: (d) => guidePage(d, g.id) })),
	{ path: 'about', file: 'about', title: 'About', build: about },
	{ path: 'contact', file: 'contact', title: 'Contact', build: contact },
	{ path: 'included', file: 'included', title: "What's included", build: included },
	{ path: 'highlevel', file: 'highlevel', title: 'AnyPress for HighLevel', build: highlevel },
	{ path: 'changelog', file: 'changelog', title: "What's new", build: changelog },
	{ path: 'terms', file: 'terms', title: 'Terms of Service', build: (d) => legal(d.LEGAL.TERMS, 'Terms of Service') },
	{ path: 'privacy', file: 'privacy', title: 'Privacy Policy', build: (d) => legal(d.LEGAL.PRIVACY, 'Privacy Policy') },
	{ path: 'refund-policy', file: 'refund-policy', title: 'Refund Policy', build: (d) => legal(d.LEGAL.REFUND, 'Refund Policy') },
	{ path: 'sellers/setup', file: 'sellers-setup', title: 'How we set you up', build: sellerSetup },
	{ path: 'sellers/autopilot', file: 'sellers-autopilot', title: 'Selling on autopilot', build: autopilot },
	{ path: 'move', file: 'move', title: 'Move your site', build: move },
	{ path: 'affiliates', file: 'affiliates', title: 'Affiliate program', build: affiliates },
	{ path: 'affiliates/kit', file: 'affiliates-kit', title: 'Affiliate kit', build: affiliateKit },
	{ path: 'developers', file: 'developers', title: 'For developers', build: developers },
	{ path: 'ai', file: 'ai', title: 'AnyPress in your AI app', build: ai },
	{ path: 'automate', file: 'automate', title: 'Create sites automatically', build: automate },
	{ path: 'sell', file: 'sell', title: 'Apply to sell websites', build: sell },
	{ path: 'compare', file: 'compare', title: 'Compare', build: compareIndex },
	...data.COMPARISONS.map((c) => ({ path: `compare/${c.slug}`, file: `compare-${c.slug}`, title: `AnyPress vs ${c.name}`, build: (d) => comparePage(d, c.slug) })),
	{ path: 'designs', file: 'designs', title: 'Designs', build: designs },
	{ path: 'designs/blocks', file: 'designs-blocks', title: 'Blocks', build: designBlocks },
	{ path: 'how-it-works', file: 'how-it-works', title: 'How it works', build: howItWorks },
	{ path: 'how-it-works/sellers', file: 'how-it-works-sellers', title: 'How selling works', build: howItWorksSellers },
	{ path: 'beta', file: 'beta', title: 'Join the beta', build: beta },
	{ path: 'self-host', file: 'self-host', title: 'Run AnyPress yourself', build: selfHost },
	{ path: 'care', file: 'care', title: 'Care for your website', build: carePage },
	{ path: 'help', file: 'help', title: 'Help', build: help },
	{ path: 'hosting', file: 'hosting', title: 'Hosting and safety', build: hosting },
	{ path: 'updates', file: 'updates', title: 'Safe updates', build: updates },
	...['website', 'bookings', 'store', 'community', 'everything'].map((id) => ({ path: `sites/${id}`, file: `sites-${id}`, title: id, build: (data) => sitePage(data, id) })),
];

mkdirSync(resolve(HERE, 'html'), { recursive: true });
const manifest = PAGES.map(({ path, file, title, build }) => {
	if (path.startsWith('sites/')) title = data.SITE_TYPES.find((t) => `sites/${t.id}` === path).name;
	writeFileSync(resolve(HERE, 'html', `${file}.html`), build(data));
	return { path, file, title, template: 'page-no-title' };
});
mkdirSync(resolve(HERE, 'parts'), { recursive: true });
writeFileSync(resolve(HERE, 'parts', 'header.html'), `${header()}\n`);
writeFileSync(resolve(HERE, 'parts', 'footer.html'), `${footer(data)}\n`);
writeFileSync(resolve(HERE, 'parts', 'menu.html'), `${menu()}\n`);
// The forms, with the kinds of site from the site plugin's copy of the price list.
const priceList = JSON.parse(readFileSync(resolve(HERE, '../plugin/pricing.json'), 'utf8'));
writeFileSync(resolve(HERE, 'forms.json'), `${JSON.stringify(forms(priceList), null, '\t')}\n`);
writeFileSync(resolve(HERE, 'pages.json'), `${JSON.stringify(manifest, null, '\t')}\n`);
console.log(`Wrote ${manifest.length} page(s).`);

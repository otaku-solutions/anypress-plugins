// anypress.io/compare and /compare/<slug>: AnyPress next to other ways of getting a site, from the live site's pages
// and its COMPARISONS list. Our own prices in the list are turned into shortcodes on the live price list.
import { readFileSync } from 'node:fs';
import { drawing, grid, h, head, p, page, section, table } from './blocks.mjs';
import { ctaBand, pageHero, priceCompare } from './shared.mjs';

const PRICES = JSON.parse(readFileSync(new URL('../plugin/pricing.json', import.meta.url), 'utf8'));

/** "$12" in AnyPress's own column, as the shortcode for the kind of site at that Small monthly price. */
function ours(text) {
	return text.replace(/\$(\d+(?:\.\d+)?)/g, (all, n) => {
		const type = PRICES.siteTypes.find((t) => Number(t.monthly.small) === Number(n));
		if (!type) throw new Error(`compare: no kind of site costs ${all} a month, so the price can't come from the price list`);
		const lowest = Math.min(...PRICES.siteTypes.map((t) => t.monthly.small)) === Number(n);
		return lowest ? '[anypress_price lowest="1"]' : `[anypress_price type="${type.key === 'online-store' ? 'store' : type.key}"]`;
	});
}

const rows = (c) => table(['What you need', c.name, 'AnyPress'], c.rows.map(([need, theirs, anypress]) => [`**${need}**`, theirs, `✓ ${ours(anypress)}`]));
const cards = (list, width = 120) => grid(list.map((c) => [drawing(c.drawing, width), h(3, `[AnyPress vs ${c.name}](/compare/${c.slug}/)`, { align: 'center', size: 'medium' }), c.title && p(c.title, { align: 'center', size: 'small' })].filter(Boolean).join('\n\n')), { min: '14rem', count: Math.min(list.length, 5) });

export const compareIndex = (data) => page(
	pageHero({ drawing: 'scales', eyebrow: 'compare', title: 'How AnyPress compares.', lead: 'Honest side-by-sides, including when the other option is the better choice.' }),
	section([head({ eyebrow: 'prices', title: 'What the same site costs elsewhere.', lead: "The smallest plan for each kind of site, from each platform's own pricing page." }), priceCompare(data)].join('\n\n'), { style: 'tint' }),
	section([
		head({ eyebrow: 'website builders', title: 'Most website tools sell it to you in pieces.' }),
		table(['What you need', 'Piecing it together', 'AnyPress'], [
			['A website you can grow', 'Builder plan', 'Included'],
			['Email from your business name', 'Separate email service', 'Included'],
			['Card payments', 'Extra app or plugin', 'Ready to switch on'],
			['Bookings, courses or members', 'Another monthly app', 'In the plan you pick'],
			['A cut of every sale', 'Some platforms take one', '0%'],
		].map(([a, b, c]) => [`**${a}**`, b, `✓ ${c}`])),
	].join('\n\n')),
	section([
		head({ eyebrow: 'side by side', title: 'Pick a comparison.' }),
		cards(data.COMPARISONS),
		p('Already on HighLevel? AnyPress adds the website to it. **[Works with HighLevel →](/highlevel/)**', { align: 'center' }),
	].join('\n\n'), { style: 'tint' }),
	ctaBand(),
);

export default function comparePage(data, slug) {
	const c = data.COMPARISONS.find((x) => x.slug === slug);
	return page(
		pageHero({ drawing: 'scales', eyebrow: `AnyPress vs ${c.name}`, title: c.title, lead: c.lead }),
		section(rows(c), { style: 'tint' }),
		section([
			head({ eyebrow: 'being fair', title: 'Which one is right for you?' }),
			grid([
				[drawing(c.drawing, 120), h(3, `${c.name} is the better choice if…`, { align: 'center', size: 'large' }), p(c.theirs, { align: 'center' })].join('\n\n'),
				[drawing('everything', 120), h(3, 'AnyPress is the better choice if…', { align: 'center', size: 'large' }), p(c.ours, { align: 'center' })].join('\n\n'),
			], { min: '18rem', count: 2 }),
		].join('\n\n')),
		section([head({ eyebrow: 'more comparisons', title: 'Comparing something else?' }), cards(data.COMPARISONS.filter((x) => x.slug !== slug).map(({ title, ...o }) => o), 100)].join('\n\n'), { style: 'tint' }),
		c.side === 'owners' ? ctaBand() : ctaBand({ eyebrow: 'ready?', title: 'Sell websites without running servers.', body: 'Apply in a few minutes, then book a short call with us to get set up, billing included.', href: '/sell/', label: 'Apply to sell websites', drawings: ['sell', 'shops', 'software'] }),
	);
}

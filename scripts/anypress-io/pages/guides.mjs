// anypress.io/guides/<group>: the free guide for each group of business, from the live site's content/guides.ts
// (GUIDES in site-data.json). Plain article pages: headings, steps and checklists, then the tips sign-up.
import { calculator, drawing, form, grid, group, h, list, p, page, section } from './blocks.mjs';
import { ctaBand, pageHero } from './shared.mjs';

// The one worked price in the guides, as shortcodes on the live price list instead of the numbers of the day.
const PRICED = {
	'Ten Bookings sites at $': 'Ten Bookings sites at [anypress_price type="bookings"] each is [anypress_price type="bookings" count="10"] a month at full price. At ten sites the volume discount is [anypress_number of="volumeAt" sites="10"]%, so it comes to [anypress_price type="bookings" count="10" sites="10"] a month for all ten.',
};
const priced = (body) => Object.entries(PRICED).find(([start]) => body.startsWith(start))?.[1] ?? body;

export default function guidePage(data, id) {
	const guide = data.GUIDES.find((x) => x.id === id);
	const who = data.AUDIENCE_GROUPS.find((x) => x.id === (guide.group ?? id));
	const whoUrl = who.href ?? `/who/${who.id}/`;
	const article = guide.sections.map((s) => [
		h(2, s.heading, { size: 'x-large' }),
		s.body && p(priced(s.body), { size: 'medium' }),
		s.steps && list(s.steps, { ordered: true, style: '' }),
		s.checks && list(s.checks),
	].filter(Boolean).join('\n\n'));
	return page(
		pageHero({ drawing: 'scroll', eyebrow: 'free guide', title: `${guide.title}.`, lead: guide.lead }),
		section(group([
			...article,
			guide.calculator === 'course' && calculator('course'),
			p(`**[How AnyPress works for ${who.name.toLowerCase()}](${whoUrl})**`, { size: 'medium' }),
		].filter(Boolean).join('\n\n'), { layout: { type: 'constrained' } }), { width: 'narrow' }),
		section(group([
			h(2, 'Get more like this by email.', { size: 'x-large' }),
			p(`A few short emails with tips for ${who.name.toLowerCase()}. Unsubscribe any time.`),
			form('tips-by-email'),
		].join('\n\n'), { layout: { type: 'constrained' } }), { style: 'tint', width: 'narrow' }),
		ctaBand(),
	);
}

/** anypress.io/guides: every free guide, so each guide's page has a home above it. */
export const guidesIndex = (data) => page(
	pageHero({ drawing: 'scroll', eyebrow: 'free guides', title: 'Short guides for each kind of business.', lead: 'Plain steps and checklists, free to read with no sign-up.' }),
	section(grid(data.GUIDES.map((g) => {
		const who = data.AUDIENCE_GROUPS.find((x) => x.id === (g.group ?? g.id));
		return [drawing(who.drawing, 110), h(2, `[${g.title}](/guides/${g.id}/)`, { align: 'center', size: 'medium' }), p(g.lead, { align: 'center', size: 'small' }), p(`[Read the guide →](/guides/${g.id}/)`, { align: 'center' })].join('\n\n');
	}), { min: '16rem', count: 4 }), { style: 'tint' }),
	ctaBand(),
);

// AnyPress Calculator on the Interactivity API. Every pick or slider updates the block's context, and recalc() works
// out the numbers into context.out, which the page shows. The sums match the site's React calculators and the shop's
// cart: list price x size, yearly = months x monthly, the volume tier for the number of sites, the reseller discount.
import { store, getContext } from '@wordpress/interactivity';

const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2, maximumFractionDigits: 2 })}`;
const cents = (n) => Math.round(n * 100) / 100;
const typeOf = (c, id = c.type) => c.types.find((t) => t.id === id) || c.types[0];
const timesOf = (c, name = c.size) => (c.sizes.find((s) => s.name === name) || c.sizes[0]).times;
const volume = (c, sites) => c.tiers.reduce((p, t) => (sites >= t.sites ? t.percent : p), 0);
const nextTier = (c, sites) => c.tiers.find((t) => sites < t.sites);
const range = (c) => `${c.tiers[0]?.percent} to ${c.tiers[c.tiers.length - 1]?.percent}%`;
// What sellers often charge for a looked-after Small site; a bigger size adds what the bigger size costs.
const SUGGESTED = { website: 49, bookings: 79, store: 99, community: 129, everything: 249 };
const suggested = (c) => SUGGESTED[c.type] + typeOf(c).from * (timesOf(c) - 1);

function price(c) {
	const t = typeOf(c);
	const list = c.yearly ? t.from * timesOf(c) * c.months : t.from * timesOf(c);
	const percent = volume(c, c.count);
	const each = cents(list * (1 - percent / 100));
	const total = cents(each * c.count);
	const saved = cents(list * c.count - total);
	const next = nextTier(c, c.count);
	const per = c.yearly ? 'year' : 'month';
	const more = next ? next.sites - c.count : 0;
	return {
		eyebrow: 'your estimate',
		big: money(total),
		per: ` / ${per}`,
		line: `${c.count} ${t.short.toLowerCase()} ${c.count === 1 ? 'site' : 'sites'}, ${c.size}, at ${money(each)} each${percent ? ` (you save ${percent}%)` : ''}`,
		save: saved > 0 ? `You save ${money(saved)} every ${per}.` : '',
		next: next ? `${more} more ${more === 1 ? 'site' : 'sites'} and every site saves ${next.percent}%.` : '',
		planUrl: `${c.shop}/item/${t.slug}-${c.size.toLowerCase()}/`,
		planLabel: `Start with one ${t.short.toLowerCase()} site →`,
	};
}

function earnings(c) {
	const list = typeOf(c).from * timesOf(c);
	const min = Math.ceil(list);
	const max = Math.max(min * 6, 300 * timesOf(c));
	const charge = Math.min(Math.max(c.charge, min), max);
	const discount = (account) => (account === 'reseller' ? c.wholesale : volume(c, c.count));
	const figures = (account) => {
		const cost = cents((list * (100 - discount(account))) / 100);
		return { cost, month: cents((charge - cost) * c.count), perSite: cents(charge - cost) };
	};
	const seller = figures('seller');
	const reseller = figures('reseller');
	const mine = c.account === 'seller' ? seller : reseller;
	const percent = discount(c.account);
	const next = c.account === 'seller' ? nextTier(c, c.count) : null;
	return {
		sellerNote: `One storefront. Pay per site, ${range(c)} off as you grow.`,
		resellerNote: `Several brands. ${c.wholesale}% off every site, one monthly bill.`,
		min,
		max,
		minText: money(min),
		maxText: money(max),
		price: money(charge),
		priceValue: charge,
		eyebrow: `what you keep as a ${c.account}`,
		big: money(mine.month),
		per: ' / month',
		line: `${money(mine.perSite)} on each site, ${money(mine.month * 12)} a year.`,
		paysLabel: `${c.count} ${c.count === 1 ? 'client pays' : 'clients pay'} you ${money(charge)} each`,
		pays: money(charge * c.count),
		costLabel: `You pay AnyPress ${money(mine.cost)} a site`,
		why: percent
			? `${money(list)} list, less ${percent}% ${c.account === 'reseller' ? 'wholesale' : 'volume saving'}`
			: `${money(list)} list, no volume saving below ${c.tiers[0]?.sites} sites`,
		cost: `−${money(mine.cost * c.count)}`,
		next: next ? `Reach ${next.sites} sites and every site costs ${next.percent}% less.` : '',
		sellerCost: money(seller.cost),
		sellerMonth: money(seller.month),
		sellerCurrent: c.account === 'seller' ? 'true' : null,
		resellerCost: money(reseller.cost),
		resellerMonth: money(reseller.month),
		resellerCurrent: c.account === 'reseller' ? 'true' : null,
		fine: "US dollars, before your payment company's fees and taxes. You set your own prices and your clients pay you directly; we build, host and look after every site. Sellers' savings count all their live sites. Resellers are for running several brands.",
		affiliateLine: `Only want to recommend us? Affiliates earn ${c.affiliate}% of a new customer's first payment.`,
	};
}

function course(c) {
	const community = typeOf(c, 'community');
	const platform = 12 * (c.fee + (c.sales * c.share) / 100);
	const ours = 12 * community.from;
	return {
		platform: money(platform),
		oursLabel: `AnyPress ${community.short}, per year`,
		ours: money(ours),
		difference: money(platform - ours),
		fine: `Card fees apply on both and aren't counted here. ${community.short} starts at ${money(community.from)} a month (Small size); bigger sizes cost more.`,
	};
}

const KINDS = { price, earnings, course };
const recalc = (c) => {
	c.out = { ...c.out, ...(KINDS[c.kind] || price)(c) };
};

store('anypress-io/calculator', {
	state: {
		// A picker button is pressed when its value is the one picked.
		get picked() {
			const c = getContext();
			const now = c.field === 'yearly' ? (c.yearly ? 'yes' : 'no') : c[c.field];
			return now === c.value ? 'true' : 'false';
		},
		// A size button on the earnings calculator shows that size's list price for the kind picked.
		get sizeNote() {
			const c = getContext();
			return `${money(typeOf(c).from * timesOf(c, c.value))} / month list`;
		},
	},
	actions: {
		pick() {
			const c = getContext();
			if (c.field === 'yearly') c.yearly = c.value === 'yes';
			else c[c.field] = c.value;
			// Picking another kind or size moves the earnings price slider to what sellers often charge for it.
			if (c.kind === 'earnings' && (c.field === 'type' || c.field === 'size')) c.charge = suggested(c);
			recalc(c);
		},
		number(event) {
			const c = getContext();
			c[event.target.dataset.field] = Math.max(0, Number(event.target.value) || 0);
			recalc(c);
		},
	},
	callbacks: {
		setUp() {
			const c = getContext();
			if (c.kind === 'earnings') c.charge = suggested(c);
			recalc(c);
		},
	},
});

// Test prices: anypress-site is built with these in place of the real price list, so convert.mjs can tell each
// price on a page apart and write the AnyPress Site plugin's shortcode for it, and the pages keep reading the one
// price list (plugin/pricing.json) instead of holding a typed price.
//
//   node test-prices.mjs <anypress-site>/src/lib/pricing.json   (writes the test prices; git checkout it afterwards)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TYPES = { website: 1101, bookings: 1103, 'online-store': 1107, community: 1109, everything: 1113 };
const VOLUME = [13, 23, 37];
const CARE = { care: 3301, 'care-plus': 3307, 'care-pro': 3313 };
const SERVICES = { 'set-up-my-site': 3401, 'move-my-site-in': 3403, 'one-hour': 3407, 'extra-hour': 3409 };
const PACKS = { email: { emails: 99991, price: 3501 }, storage: { gb: 59, monthly: 3503 } };
const WHOLESALE = 41;
const AFFILIATE = 31;
export const TEST_PRICES = { note: 'site types 1101-1113, care 3301-3313, services 3401-3409, packs 3501-3503, 13/23/37/41/31 %' };

/** The price list with test prices in, sizes and yearly as the real list multiplies them. */
function testList(list) {
	for (const t of list.siteTypes) {
		const small = TYPES[t.key];
		t.monthly = Object.fromEntries(Object.entries(list.sizeTimes).map(([size, times]) => [size, small * times]));
		t.yearly = Object.fromEntries(Object.entries(t.monthly).map(([size, m]) => [size, m * list.yearlyMonths]));
	}
	list.volumeTiers.forEach((tier, i) => (tier.percent = VOLUME[i]));
	list.wholesalePercent = WHOLESALE;
	list.affiliatePercent = AFFILIATE;
	for (const c of list.care.packages) Object.assign(c, { monthly: CARE[c.key], yearly: CARE[c.key] * list.yearlyMonths });
	for (const s of list.care.services) s.price = SERVICES[s.key];
	list.packs = structuredClone(PACKS);
	return list;
}

// "$1101" and "$1,101", with or without cents, as the site may print a price.
const money = (n) => {
	const cents = Math.round(n * 100) / 100;
	const plain = Number.isInteger(cents) ? String(cents) : cents.toFixed(2);
	const comma = Number(plain).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(cents) ? 0 : 2, maximumFractionDigits: 2 });
	return [...new Set([plain, comma])];
};

/** Every test price and the shortcode that prints the real one. */
function shortcodes() {
	const list = testList(JSON.parse(readFileSync(new URL('../plugin/pricing.json', import.meta.url), 'utf8')));
	const out = [];
	const add = (amount, code) => money(amount).forEach((m) => out.push([`$${m}`, code]));
	for (const t of list.siteTypes) {
		for (const period of ['monthly', 'yearly']) {
			for (const [size, amount] of Object.entries(t[period])) {
				const base = `type="${t.key}" size="${size}" period="${period}"`;
				add(amount, `[anypress_price ${base}]`);
				add((amount * (100 - WHOLESALE)) / 100, `[anypress_price ${base} wholesale="1"]`);
				add((amount * AFFILIATE) / 100, `[anypress_price ${base} affiliate="1"]`);
				list.volumeTiers.forEach((tier) => add((amount * (100 - tier.percent)) / 100, `[anypress_price ${base} sites="${tier.sites}"]`));
			}
		}
	}
	for (const c of list.care.packages) for (const show of ['monthly', 'yearly']) add(c[show], `[anypress_care item="${c.key}" show="${show}"]`);
	for (const s of list.care.services) add(s.price, `[anypress_care item="${s.key}" show="price"]`);
	add(PACKS.email.price, '[anypress_number of="emailPackPrice"]');
	add(PACKS.storage.monthly, '[anypress_number of="storagePackPrice"]');
	// Longest first, so $11,010 isn't read as $1101 and a 0.
	return out.sort((a, b) => b[0].length - a[0].length);
}

const CODES = shortcodes();
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PRICE = new RegExp(`(${CODES.map(([m]) => escape(m)).join('|')})(?![0-9]|\\.[0-9])`, 'g');
const LOOKUP = new Map(CODES);
const PERCENT = { 13: 'volumeMin', 37: 'volumeMax', [WHOLESALE]: 'wholesalePercent', [AFFILIATE]: 'affiliatePercent' };

/** The markup with each test price swapped for its shortcode; anything still looking like one goes in leftovers. */
export function prices(markup, leftovers, where) {
	let out = markup.replace(PRICE, (m) => LOOKUP.get(m));
	out = out.replace(/(?<![0-9.,$])(13|23|37|41|31)(?=%| to [0-9]+%)/g, (m) => (m === '23' ? '[anypress_number of="volumeAt" sites="10"]' : `[anypress_number of="${PERCENT[m]}"]`));
	out = out.replace(/(?<![0-9,])99,?991(?![0-9])/g, '[anypress_number of="emailPackEmails"]');
	out = out.replace(/(?<![0-9.,$])59(?= ?GB)/g, '[anypress_number of="storagePackGb"]');
	// Text only: attributes and drawings' paths hold numbers of their own.
	const text = out.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, ' ');
	for (const m of text.matchAll(/.{0,40}(?<![0-9])(11\d\d|22\d\d|44\d\d|33\d\d|34\d\d|35\d\d|11,?\d{3}|99,?991)(?![0-9]).{0,30}/g)) {
		leftovers.push(`${where}: ${m[0].replace(/\s+/g, ' ').trim()}`);
	}
	return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2]) {
	writeFileSync(process.argv[2], `${JSON.stringify(testList(JSON.parse(readFileSync(process.argv[2], 'utf8'))), null, 2)}\n`);
	console.log(`Test prices written to ${process.argv[2]}.`);
}

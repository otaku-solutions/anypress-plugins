// AnyPress Try It, on the page: reads which demo the link asks for, starts it in WordPress Playground (our own
// build at demo.anypress.site, loaded only here and only in the browser) inside the page's iframe, shows our loading
// screen while it starts, and keeps the demo with Make This My Site. Nothing is made on a server until the visitor
// asks to keep it.
import { ProgressTracker } from './progress.js';
import { DEMO_EXPORT_PHP } from './demo-export.js';

const root = document.querySelector('.wp-block-anypress-io-try');
const config = root ? JSON.parse(root.dataset.config) : null;
const part = (name) => root.querySelector(`.wp-block-anypress-io-try__${name}`);
const words = config?.words ?? {};
const LINE_SECONDS = 4;

/** The site's own calls (includes/demo.php), with the page's REST nonce. */
async function call(path, { method = 'GET', body, raw } = {}) {
	const res = await fetch(config.rest + path, {
		method,
		headers: { 'X-WP-Nonce': config.nonce, ...(raw ? {} : { 'Content-Type': 'application/json' }) },
		body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
		credentials: 'same-origin',
	});
	const answer = await res.json().catch(() => null);
	return { ok: res.ok, status: res.status, answer };
}

const blueprintUrl = (name) => `${config.raw}anypress-api/main/templates/anypress-store/playground/${name}.json`;
const isOurBlueprint = (url) => typeof url === 'string' && url.startsWith(config.raw) && !url.includes('..');
const tryLink = (type) => `${window.location.pathname.replace(/\/$/, '')}?type=${encodeURIComponent(type)}`;
const LINK = 'shrink-0 rounded-full border px-3.5 py-1.5 text-[14px] font-bold transition-colors';
const LINK_ON = 'border-[#141414] bg-[#141414] text-white';
const LINK_OFF = 'border-[#e9e4de] text-[#141414] hover:border-[#141414]';
/** The site type a prospect demo's store site type opens as. */
const prospectType = (siteType) => {
	if (siteType === 'online-store') return 'store';
	if (siteType === 'store') return 'everything';
	return Object.hasOwn(config.types, siteType) ? siteType : 'website';
};

/** What the link asks for: a demo made for a business, one of our blueprints, an industry demo or a site type. */
async function pick() {
	const q = new URLSearchParams(window.location.search);
	const code = q.get('for');
	if (code) {
		if (!/^p_[A-Za-z0-9_-]{16}$/.test(code)) return null;
		const { ok, answer } = await call(`prospect/${code}`);
		if (!ok || typeof answer?.company !== 'string') return null;
		const type = prospectType(answer.siteType);
		return {
			blueprint: blueprintUrl(config.types[type].blueprint),
			title: answer.company.slice(0, 60),
			type,
			// What was read from the business's website, then the sample's last part, which gives the site their look.
			steps: [
				{ step: 'writeFile', path: '/wordpress/anypress-prospect.json', data: JSON.stringify(answer) },
				{ step: 'runPHP', code: `<?php define('ANYPRESS_SAMPLE_PARTS', ["prospect"]); require '/wordpress/anypress-sample/run.php';`, progress: { caption: 'Making the demo yours' } },
			],
		};
	}
	const blueprint = q.get('blueprint');
	if (isOurBlueprint(blueprint)) return { blueprint, title: (q.get('title') || words.example).slice(0, 60) };
	const demo = q.get('demo');
	if (demo && Object.hasOwn(config.demos, demo)) {
		const { name, type } = config.demos[demo];
		return { blueprint: blueprintUrl(`${config.types[type].blueprint}-${demo}`), title: name, type };
	}
	const asked = q.get('type');
	const type = asked && Object.hasOwn(config.types, asked) ? asked : 'website';
	return { blueprint: blueprintUrl(config.types[type].blueprint), title: config.types[type].name, type };
}

/** Our bar: the site types (or the example's name), and Make This My Site or Get This Site. */
function drawBar({ title, type }) {
	const nav = part('types');
	const name = part('title');
	if (type) {
		nav.replaceChildren(...Object.entries(config.types).map(([id, t]) => {
			const a = document.createElement('a');
			if (id === type) a.setAttribute('aria-current', 'page');
			a.className = `${LINK} ${id === type ? LINK_ON : LINK_OFF}`;
			a.href = tryLink(id);
			a.textContent = t.short;
			return a;
		}));
		nav.hidden = false;
	} else {
		name.textContent = title;
		name.hidden = false;
	}
	part('get').href = type ? config.types[type].buy : config.pricing;
	part('frame').title = words.running.replace('%s', title);
}

/** Make This My Site shows once the demo runs; HighLevel sites are sold through their own page. */
const canKeep = (type) => type !== undefined && type !== 'highlevel';
function showKeep(type, ready) {
	const keep = ready && canKeep(type);
	part('keep').hidden = !keep;
	part('get').hidden = keep;
	part('note').textContent = keep ? words.noteKeep : words.note;
}

/** A line every few seconds, in an order that shows every line before any comes back; the first stays first. */
function startLines(type, seconds) {
	const lines = [...config.lines.always, ...(type ? config.lines[type] ?? [] : [])];
	const order = lines.map((_, i) => i).slice(1);
	for (let i = order.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[order[i], order[j]] = [order[j], order[i]];
	}
	const line = part('line');
	const more = part('more');
	let next = 0;
	const started = Date.now();
	const lineTimer = setInterval(() => {
		line.textContent = `${lines[order[next % order.length]]}…`;
		// A new line fades in again, as anypress.io's does.
		const fade = 'motion-safe:animate-[fadeIn_400ms_ease-out]';
		line.classList.remove(fade);
		void line.offsetWidth;
		line.classList.add(fade);
		next += 1;
	}, LINE_SECONDS * 1000);
	const clock = setInterval(() => {
		more.textContent = (Date.now() - started) / 1000 < seconds ? words.building : words.slow;
	}, 1000);
	return () => { clearInterval(lineTimer); clearInterval(clock); };
}

/** The website assistant beside the demo's page editor, when the API can give it a sign-in right now. */
async function addAssistant(client, type) {
	const { answer } = await call('assistant', { method: 'POST', body: { siteType: config.types[type].blueprint } }).catch(() => ({}));
	const token = answer?.token;
	if (typeof token !== 'string' || !/^apdemo_[A-Za-z0-9_-]{43}$/.test(token)) return;
	const dir = '/wordpress/wp-content/mu-plugins';
	await client.mkdir(dir);
	await client.writeFile(`${dir}/anypress-demo-assistant.php`, `<?php\ndefine('ANYPRESS_DEMO_ASSISTANT', '${token}');\n`);
}

/** Reads the demo out of its WordPress, saves it as a draft with its photos, and answers the checkout link. */
async function keepDemo(client, type) {
	const out = await client.run({ code: DEMO_EXPORT_PHP });
	const demo = JSON.parse(out.text);
	const saved = await call('draft', { method: 'POST', body: { siteType: config.types[type].blueprint, content: demo.content, images: demo.images.map((i) => i.name) } });
	if (!saved.ok || !saved.answer?.id) throw new Error(typeof saved.answer?.message === 'string' ? saved.answer.message : words.saveError);
	const { id, uploads = [], maxImageBytes = 0 } = saved.answer;
	await Promise.all(uploads.map(async ({ name, uploadUrl }) => {
		const image = demo.images.find((i) => i.name === name);
		if (!image) return;
		const bytes = await client.readFileAsBuffer(image.path);
		// A photo that doesn't arrive keeps its placeholder; the rest of the demo still counts.
		if (maxImageBytes && bytes.byteLength > maxImageBytes) return;
		await call(`image?uploadUrl=${encodeURIComponent(uploadUrl)}`, { method: 'POST', raw: new Blob([bytes]) }).catch(() => {});
	}));
	const checkout = new URL(config.types[type].buy);
	checkout.searchParams.set('demo', id);
	return checkout.toString();
}

async function main() {
	const site = await pick();
	if (!site) {
		// As on anypress.io: no demo screen, just the note on the page.
		const gone = part('gone');
		root.replaceWith(gone);
		gone.hidden = false;
		return;
	}
	drawBar(site);
	showKeep(site.type, false);

	const frame = part('frame');
	const status = part('status');
	const fill = part('fill');
	let client = null;
	let leaving = false;
	let stopLines = () => {};

	// Nothing in a demo is kept: once it runs, the browser asks before the tab closes or reloads.
	window.addEventListener('beforeunload', (e) => {
		if (!client || leaving) return;
		e.preventDefault();
		e.returnValue = '';
	});

	const start = async () => {
		part('starting').hidden = false;
		part('failed').hidden = true;
		status.hidden = false;
		frame.classList.replace('opacity-100', 'opacity-0');
		root.classList.remove('is-ready');
		fill.style.width = '4%';
		stopLines = startLines(site.type, 75);
		let shown = 0;
		try {
			const { startPlaygroundWeb } = await import(config.client);
			const tracker = new ProgressTracker();
			tracker.addEventListener('progress', (e) => {
				shown = Math.max(shown, Math.round(e.detail.progress));
				fill.style.width = `${Math.max(shown, 4)}%`;
			});
			const res = await fetch(site.blueprint, { cache: 'no-store' });
			if (!res.ok) throw new Error(`Blueprint ${res.status}`);
			const blueprint = await res.json();
			if (site.steps?.length) blueprint.steps = [...(blueprint.steps ?? []), ...site.steps];
			client = await startPlaygroundWeb({ iframe: frame, remoteUrl: config.remote, blueprint, progressTracker: tracker, disableProgressBar: true });
			if (site.type) await addAssistant(client, site.type);
			stopLines();
			frame.classList.replace('opacity-0', 'opacity-100');
			root.classList.add('is-ready');
			status.hidden = true;
			showKeep(site.type, true);
		} catch (err) {
			console.error(err);
			stopLines();
			client = null;
			part('starting').hidden = true;
			part('failed').hidden = false;
		}
	};

	// Another try is a fresh page: Playground's iframe can't be started twice.
	part('retry').addEventListener('click', () => window.location.reload());

	const keep = part('keep');
	const errors = [part('error'), part('error2')];
	const showError = (text) => errors.forEach((e) => { e.textContent = text; e.hidden = !text; });
	keep.addEventListener('click', async () => {
		if (!client || keep.disabled) return;
		keep.disabled = true;
		keep.textContent = words.saving;
		showError('');
		try {
			const checkout = await keepDemo(client, site.type);
			leaving = true;
			window.location.assign(checkout);
		} catch (err) {
			console.error(err);
			showError(err instanceof Error && err.message.length < 200 ? err.message : words.saveError);
			keep.disabled = false;
			keep.textContent = words.keep;
		}
	});

	await start();
}

if (config) main();

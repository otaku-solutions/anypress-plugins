// AnyPress Changelog on the page: the filter by site type, a link to one change opening the fold it sits in, and
// an entry's # copying its link, as anypress.io's list has always done.
const smaller = (n) => (n === 1 ? '1 smaller improvement' : `${n} smaller improvements`);

for (const root of document.querySelectorAll('[data-anypress-changelog]')) {
	const list = root.querySelector('[data-anypress-changes]');
	const all = list.cloneNode(true);
	const buttons = [...root.querySelectorAll('[data-filter]')];
	const on = buttons[0].dataset.on;
	const off = buttons[0].dataset.off;

	const openHash = () => {
		const id = decodeURIComponent(location.hash.slice(1));
		const target = id && document.getElementById(id);
		const fold = target && target.closest('details');
		if (fold && root.contains(fold)) fold.open = true;
	};

	const show = (filter) => {
		const view = all.cloneNode(true);
		if (filter !== 'all') {
			for (const entry of view.querySelectorAll('[data-for]')) {
				const forList = entry.dataset.for.split(' ').filter(Boolean);
				if (forList.length && !forList.includes(filter)) entry.remove();
			}
		}
		for (const fold of view.querySelectorAll('details')) {
			const left = fold.querySelectorAll('li[data-for]').length;
			if (!left) fold.remove();
			else fold.querySelector('[data-count]').textContent = smaller(left);
		}
		for (const day of view.querySelectorAll('ol > li')) if (!day.querySelector('[data-for]')) day.remove();
		for (const month of view.querySelectorAll('section')) if (!month.querySelector('ol > li')) month.remove();
		list.replaceChildren(...view.childNodes);
		for (const b of buttons) {
			const picked = b.dataset.filter === filter;
			b.setAttribute('aria-pressed', String(picked));
			b.className = picked ? on : off;
		}
		openHash();
	};

	for (const b of buttons) b.addEventListener('click', () => show(b.dataset.filter));

	root.addEventListener('click', (event) => {
		const link = event.target.closest('[data-anypress-copy]');
		if (!link || !navigator.clipboard) return;
		navigator.clipboard.writeText(`${location.origin}${location.pathname}${link.getAttribute('href')}`).then(
			() => {
				link.textContent = 'Link copied';
				setTimeout(() => (link.textContent = '#'), 1500);
			},
			() => undefined,
		);
	});

	window.addEventListener('hashchange', openHash);
	openHash();
}

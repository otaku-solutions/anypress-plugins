// Block markup for anypress.io's pages, written the way the editor saves each block, so every page opens in the
// editor as valid, editable blocks. Everything uses the AnyPress theme's colour, font and spacing slugs and its
// section and block styles (Sketchbook palette and fonts), AnyPress Blocks, and the AnyPress Site plugin's blocks.
// Images point at the site plugin's assets through the {{assets}} token, which setup.php fills in.

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const json = (o) => (o && Object.keys(o).length ? ` ${JSON.stringify(o).replace(/--/g, '\\u002d\\u002d').replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')}` : '');
const cls = (...c) => c.filter(Boolean).join(' ');
const block = (name, a, html) => (html === undefined ? `<!-- wp:${name}${json(a)} /-->` : `<!-- wp:${name}${json(a)} -->\n${html}\n<!-- /wp:${name} -->`);
const sp = (slug) => `var:preset|spacing|${slug}`;
const spCss = (slug) => `var(--wp--preset--spacing--${slug})`;

/** Inline text: **bold**, *italic*, `code`, [link](url) and ==marked== (the highlighter mark). Everything else is escaped. */
export function inline(text) {
	return esc(text)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/~~(.+?)~~/g, '<s>$1</s>')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\n/g, '<br>')
		.replace(/==(.+?)==/g, '<mark class="has-inline-color has-primary-alt-background-color" style="background-color:var(--wp--preset--color--primary-alt)">$1</mark>')
		.replace(/\[([^[\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${attr(u)}">${t}</a>`);
}

export function p(text, { align, size, className, color } = {}) {
	const a = {};
	if (align) a.align = align;
	if (size) a.fontSize = size;
	if (className) a.className = className;
	if (color) a.textColor = color;
	const c = cls(align && `has-text-align-${align}`, className, color && `has-${color}-color has-text-color`, size && `has-${size}-font-size`);
	return block('paragraph', a, `<p${c ? ` class="${c}"` : ''}>${inline(text)}</p>`);
}

/** A handwritten note (the theme's Handwritten note paragraph style), as the site's eyebrows and asides. */
export const hand = (text, { align = 'center', size = 'large' } = {}) => p(text, { align, size, className: 'is-style-handwritten' });

export function h(level, text, { align, size, anchor, className } = {}) {
	const a = {};
	if (level !== 2) a.level = level;
	if (align) a.textAlign = align;
	if (size) a.fontSize = size;
	if (anchor) a.anchor = anchor;
	if (className) a.className = className;
	const c = cls('wp-block-heading', align && `has-text-align-${align}`, className, size && `has-${size}-font-size`);
	return block('heading', a, `<h${level} class="${c}"${anchor ? ` id="${attr(anchor)}"` : ''}>${inline(text)}</h${level}>`);
}

/** The centred head of a section: a handwritten eyebrow, the title and a lead line. */
export const head = ({ eyebrow, title, lead, level = 2, anchor }) => [
	eyebrow && hand(eyebrow),
	h(level, title, { align: 'center', size: level === 1 ? 'xx-large' : 'x-large', anchor }),
	lead && p(lead, { align: 'center', size: 'medium' }),
].filter(Boolean).join('\n\n');

export function list(items, { style = 'ticks', ordered = false, className } = {}) {
	const a = {};
	if (ordered) a.ordered = true;
	const c = cls(style && `is-style-${style}`, className);
	if (c) a.className = c;
	const tag = ordered ? 'ol' : 'ul';
	const li = items.map((t) => block('list-item', {}, `<li>${inline(t)}</li>`)).join('\n');
	return block('list', a, `<${tag} class="${cls('wp-block-list', c)}">${li}</${tag}>`);
}

export function buttons(items, { justify = 'center' } = {}) {
	const inner = items.map(({ text, url, outline }) => {
		const a = outline ? { className: 'is-style-outline' } : {};
		return block('button', a, `<div class="${cls('wp-block-button', outline && 'is-style-outline')}"><a class="wp-block-button__link wp-element-button" href="${attr(url)}">${inline(text)}</a></div>`);
	}).join('\n');
	return block('buttons', { layout: { type: 'flex', justifyContent: justify } }, `<div class="wp-block-buttons">${inner}</div>`);
}

export function image(src, { alt = '', width, align, className, style, link } = {}) {
	const a = {};
	if (width) a.width = `${width}px`;
	a.sizeSlug = 'full';
	a.linkDestination = link ? 'custom' : 'none';
	if (align) a.align = align;
	if (className) a.className = className;
	const img = `<img src="${attr(src)}" alt="${attr(alt)}"${width ? ` style="width:${width}px"` : ''}/>`;
	const c = cls('wp-block-image', align && `align${align}`, 'size-full', width && 'is-resized', className);
	return block('image', a, `<figure class="${c}">${link ? `<a href="${attr(link)}">${img}</a>` : img}</figure>`);
}

/** One of the site's drawings, from the site plugin's assets. */
export const drawing = (name, width = 160, opts = {}) => image(`{{assets}}/drawings/${name}.svg`, { width, align: 'center', ...opts });

export function group(inner, { align, className, layout = { type: 'constrained' }, padding, gap, style: extra, tag, anchor } = {}) {
	const a = {};
	if (tag) a.tagName = tag;
	if (anchor) a.anchor = anchor;
	if (align) a.align = align;
	if (className) a.className = className;
	const style = { ...(extra ?? {}) };
	const css = [];
	if (padding) {
		const [v, hz] = Array.isArray(padding) ? padding : [padding, null];
		style.spacing = { ...(style.spacing ?? {}), padding: { top: sp(v), bottom: sp(v), ...(hz ? { left: sp(hz), right: sp(hz) } : {}) } };
		css.push(`padding-top:${spCss(v)}`, `padding-bottom:${spCss(v)}`);
		if (hz) css.push(`padding-left:${spCss(hz)}`, `padding-right:${spCss(hz)}`);
	}
	if (gap) {
		style.spacing = { ...(style.spacing ?? {}), blockGap: sp(gap) };
	}
	if (Object.keys(style).length) a.style = style;
	a.layout = layout;
	const t = tag ?? 'div';
	const c = cls('wp-block-group', align && `align${align}`, className);
	return block('group', a, `<${t}${anchor ? ` id="${attr(anchor)}"` : ''} class="${c}"${css.length ? ` style="${css.join(';')}"` : ''}>${inner}</${t}>`);
}

/** A full-width section: a theme section style (tint, brand-soft, dark...) or plain, with the content inside. */
export const section = (inner, { style, anchor, width = 'wide' } = {}) =>
	group(width === 'wide' ? group(inner, { align: 'wide', layout: { type: 'default' } }) : inner, {
		align: 'full',
		className: style ? `is-style-section-${style}` : undefined,
		padding: ['xx-large', 'medium'],
		anchor,
		tag: 'section',
	});

/** Cards in a grid that wraps on its own: each card a group in the theme's Card section style. */
export function grid(cards, { min = '15rem', card = true, gap = 'medium', count } = {}) {
	const inner = cards.map((c) => (card ? group(c, { className: 'is-style-section-card', padding: ['medium', 'medium'], layout: { type: 'default' } }) : group(c, { layout: { type: 'default' } }))).join('\n');
	// With a column count as well, the grid shows at most that many columns and still wraps on small screens.
	return group(inner, { layout: { type: 'grid', ...(count ? { columnCount: count } : {}), minimumColumnWidth: min }, gap });
}

export function columns(cols, { verticalAlign = 'center', widths } = {}) {
	const inner = cols.map((c, i) => {
		const w = widths?.[i];
		return block('column', { verticalAlignment: verticalAlign, ...(w ? { width: w } : {}) }, `<div class="wp-block-column is-vertically-aligned-${verticalAlign}"${w ? ` style="flex-basis:${w}"` : ''}>${c}</div>`);
	}).join('\n');
	return block('columns', { verticalAlignment: verticalAlign, align: 'wide' }, `<div class="wp-block-columns alignwide are-vertically-aligned-${verticalAlign}">${inner}</div>`);
}

/** Questions and answers, each a core Details block, the first one open. */
export const faq = (items, { firstOpen = true } = {}) => items.map(([q, a], i) => {
	const open = firstOpen && i === 0;
	return block('details', open ? { showContent: true } : {}, `<details class="wp-block-details"${open ? ' open' : ''}><summary>${inline(q)}</summary>${p(a)}</details>`);
}).join('\n\n');

export function table(head, rows, { className = 'is-style-comparison', caption } = {}) {
	const th = `<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>`;
	const tb = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
	return block('table', { className }, `<figure class="wp-block-table ${className}"><table class="has-fixed-layout">${th}${tb}</table>${caption ? `<figcaption class="wp-element-caption">${inline(caption)}</figcaption>` : ''}</figure>`);
}

/** A video with its poster, loading nothing until it's played. */
export const video = (src, poster, caption) => block('video', {}, `<figure class="wp-block-video"><video controls poster="${attr(poster)}" preload="none" src="${attr(src)}" playsinline></video>${caption ? `<figcaption class="wp-element-caption">${inline(caption)}</figcaption>` : ''}</figure>`);
export const shortcode = (text) => block('shortcode', {}, text);
/** A Fluent Forms form by its name in forms.json; setup.php puts in the form's id. */
export const form = (name) => block('fluentfom/guten-block', { formId: `{{form:${name}}}` });

export const separator = () => block('separator', { className: 'is-style-wide' }, '<hr class="wp-block-separator has-alpha-channel-opacity is-style-wide"/>');
export const spacer = (height = 'large') => block('spacer', { height: `var:preset|spacing|${height}` }, `<div style="height:var(--wp--preset--spacing--${height})" aria-hidden="true" class="wp-block-spacer"></div>`);
export const calculator = (kind, extra = {}) => block('anypress-io/calculator', { kind, ...extra });
export const raw = (name, attrs) => block(name, attrs);

/** A page: its blocks, one after another. */
export const page = (...parts) => `${parts.filter(Boolean).join('\n\n')}\n`;

/**
 * Plain HTML (p, h2-h4, ul, ol, table, with inline strong, em, a and code), as the blocks the editor would save for
 * it. For approved documents such as the legal pages, whose text arrives as HTML.
 */
export function htmlBlocks(html) {
	const out = [];
	const re = /<(p|h[2-4]|ul|ol|table)(\s[^>]*)?>([\s\S]*?)<\/\1>/g;
	for (const [, tag, attrs = '', body] of html.matchAll(re)) {
		const inner = body.trim();
		if (tag === 'p') out.push(block('paragraph', {}, `<p>${inner}</p>`));
		else if (tag[0] === 'h') {
			const level = Number(tag[1]);
			const id = attrs.match(/id="([^"]+)"/)?.[1];
			const a = {};
			if (level !== 2) a.level = level;
			if (id) a.anchor = id;
			out.push(block('heading', a, `<h${level} class="wp-block-heading"${id ? ` id="${attr(id)}"` : ''}>${inner}</h${level}>`));
		} else if (tag === 'table') {
			const rows = (part) => [...(inner.match(new RegExp(`<${part}>([\\s\\S]*?)</${part}>`))?.[1] ?? '').matchAll(/<tr(?:\s[^>]*)?>([\s\S]*?)<\/tr>/g)]
				.map(([, r]) => `<tr>${[...r.matchAll(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/g)].map(([, c, t]) => `<${c}>${t.trim()}</${c}>`).join('')}</tr>`).join('');
			const th = rows('thead');
			out.push(block('table', {}, `<figure class="wp-block-table"><table class="has-fixed-layout">${th ? `<thead>${th}</thead>` : ''}<tbody>${rows('tbody')}</tbody></table></figure>`));
		} else {
			const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(([, t]) => block('list-item', {}, `<li>${t.trim()}</li>`)).join('\n');
			out.push(block('list', tag === 'ol' ? { ordered: true } : {}, `<${tag} class="wp-block-list">${items}</${tag}>`));
		}
	}
	return out.join('\n\n');
}

/** A code sample, as the editor's Code block. */
export const code = (text) => block('code', {}, `<pre class="wp-block-code"><code>${esc(text)}</code></pre>`);

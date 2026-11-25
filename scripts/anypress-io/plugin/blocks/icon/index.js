// anypress.io Icon, editor side: the icon as the page shows it. It saves the icon's own code, so the page keeps it as is.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps } = wp.blockEditor;
	const { createElement: el, RawHTML } = wp.element;

	registerBlockType('anypress-io/icon', {
		edit({ attributes }) {
			return el('span', useBlockProps({ className: 'anypress-io-icon', dangerouslySetInnerHTML: { __html: attributes.svg || '' } }));
		},
		save({ attributes }) {
			return el(RawHTML, null, attributes.svg);
		},
	});
})(window.wp);

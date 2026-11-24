// AnyPress Try It, editor side: the demo only starts on the page itself, so the editor shows what the block is.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps } = wp.blockEditor;
	const { createElement: el } = wp.element;
	const { __ } = wp.i18n;

	registerBlockType('anypress-io/try', {
		edit() {
			return el(
				'div',
				useBlockProps({ className: 'is-editor-preview' }),
				el('strong', null, __('Try It', 'anypress-io')),
				el('p', null, __('On the page, this starts the demo in the visitor’s browser and fills the whole screen: /try?type=bookings for a site type, ?demo= for an industry demo, ?blueprint= for a kit’s example site.', 'anypress-io'))
			);
		},
		save: () => null,
	});
})(window.wp);

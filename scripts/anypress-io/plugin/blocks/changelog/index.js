// AnyPress Changelog, editor side: the list as the page shows it. Changes are added and edited under Changes.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps } = wp.blockEditor;
	const { createElement: el } = wp.element;
	const ServerSideRender = wp.serverSideRender;

	registerBlockType('anypress-io/changelog', {
		edit() {
			return el('div', useBlockProps(), el(ServerSideRender, { block: 'anypress-io/changelog' }));
		},
		save: () => null,
	});
})(window.wp);

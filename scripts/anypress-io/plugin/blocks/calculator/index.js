// AnyPress Calculator, editor side: pick which calculator; the editor shows it as the page will.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody, SelectControl } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const ServerSideRender = wp.serverSideRender;
	const { __ } = wp.i18n;

	registerBlockType('anypress-io/calculator', {
		edit({ attributes: a, setAttributes }) {
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Calculator', 'anypress-io') },
						el(SelectControl, {
							label: __('Which calculator', 'anypress-io'),
							value: a.kind,
							options: [
								{ label: __('What will it cost?', 'anypress-io'), value: 'price' },
								{ label: __('What a seller or reseller keeps', 'anypress-io'), value: 'earnings' },
								{ label: __('A course platform next to Community', 'anypress-io'), value: 'course' },
							],
							onChange: (kind) => setAttributes({ kind }),
							__next40pxDefaultSize: true,
							__nextHasNoMarginBottom: true,
						}),
						a.kind === 'earnings'
							? el(SelectControl, {
								label: __('Starts as', 'anypress-io'),
								value: a.start,
								options: [
									{ label: __('Seller', 'anypress-io'), value: 'seller' },
									{ label: __('Reseller', 'anypress-io'), value: 'reseller' },
								],
								onChange: (start) => setAttributes({ start }),
								__next40pxDefaultSize: true,
								__nextHasNoMarginBottom: true,
							})
							: null
					)
				),
				el('div', useBlockProps(), el(ServerSideRender, { block: 'anypress-io/calculator', attributes: a }))
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);

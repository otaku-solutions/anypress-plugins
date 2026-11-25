// anypress.io Drawing, editor side: the drawing as the page shows it (assets/site/canvas.js draws it in), and a list of
// the site's drawings in the block's settings. Saves the empty box site.js draws into on the page.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody, SelectControl } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const { __ } = wp.i18n;
	const label = (name) => name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

	registerBlockType('anypress-io/drawing', {
		edit({ attributes, setAttributes }) {
			const settings = window.anypressIoEditor || {};
			const pick = (name) => {
				setAttributes({ name });
				// Each drawing has its own shape: the box takes it from the drawing's viewBox.
				fetch(`${settings.assets}/drawings/${name}.svg`)
					.then((r) => r.text())
					.then((svg) => {
						const box = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(svg);
						if (box) setAttributes({ ratio: `${box[1]} / ${box[2]}` });
					});
			};
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Drawing', 'anypress-io') },
						el(SelectControl, {
							label: __('Drawing', 'anypress-io'),
							value: attributes.name,
							options: (settings.drawings || [attributes.name]).map((name) => ({ label: label(name), value: name })),
							onChange: pick,
							__nextHasNoMarginBottom: true,
						})
					)
				),
				// A new box for each drawing, so the canvas draws the new one in.
				el('div', { key: attributes.name, ...useBlockProps({ 'data-drawing': attributes.name, 'aria-hidden': 'true', style: attributes.ratio ? { aspectRatio: attributes.ratio } : undefined }) })
			);
		},
		save({ attributes }) {
			return el('div', useBlockProps.save({ 'data-drawing': attributes.name, 'aria-hidden': 'true', style: attributes.ratio ? { aspectRatio: attributes.ratio } : undefined }));
		},
	});
})(window.wp);

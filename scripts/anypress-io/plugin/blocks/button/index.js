// anypress.io Button, editor side: the words are typed on the button itself; the link and the look (Ink, Paper or
// Honey) are in the block's settings. The button saves as anypress.io's own link, <a class="btn btn-ink" href="...">.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, RichText, InspectorControls, BlockControls } = wp.blockEditor;
	const { PanelBody, TextControl, SelectControl, ToolbarGroup, ToolbarButton, Popover } = wp.components;
	const { createElement: el, Fragment, useState } = wp.element;
	const { __ } = wp.i18n;

	const LOOKS = ['btn-ink', 'btn-paper', 'btn-honey'];
	const lookOf = (className) => LOOKS.find((l) => (className || '').split(/\s+/).includes(l)) || '';
	const withLook = (className, look) => {
		const rest = (className || '').split(/\s+/).filter((c) => c && !LOOKS.includes(c));
		if (!rest.includes('btn')) rest.unshift('btn');
		if (look) rest.splice(1, 0, look);
		return rest.join(' ');
	};

	registerBlockType('anypress-io/button', {
		edit({ attributes, setAttributes, isSelected }) {
			const [linking, setLinking] = useState(false);
			const blockProps = useBlockProps();
			return el(
				Fragment,
				null,
				el(
					BlockControls,
					null,
					el(ToolbarGroup, null, el(ToolbarButton, { icon: 'admin-links', label: __('Link', 'anypress-io'), onClick: () => setLinking(!linking), isPressed: linking }))
				),
				isSelected && linking &&
					el(
						Popover,
						{ placement: 'bottom', onClose: () => setLinking(false) },
						el('div', { style: { padding: '12px', minWidth: '280px' } }, el(TextControl, { label: __('Link', 'anypress-io'), value: attributes.url || '', onChange: (url) => setAttributes({ url }), __nextHasNoMarginBottom: true }))
					),
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Button', 'anypress-io') },
						el(TextControl, { label: __('Link', 'anypress-io'), value: attributes.url || '', onChange: (url) => setAttributes({ url }), __nextHasNoMarginBottom: true }),
						el(SelectControl, {
							label: __('Look', 'anypress-io'),
							value: lookOf(attributes.className),
							options: [
								{ label: __('Ink', 'anypress-io'), value: 'btn-ink' },
								{ label: __('Paper', 'anypress-io'), value: 'btn-paper' },
								{ label: __('Honey', 'anypress-io'), value: 'btn-honey' },
								{ label: __('Plain', 'anypress-io'), value: '' },
							],
							onChange: (look) => setAttributes({ className: withLook(attributes.className, look) }),
							__nextHasNoMarginBottom: true,
						})
					)
				),
				el(RichText, {
					...blockProps,
					tagName: 'a',
					value: attributes.text,
					onChange: (text) => setAttributes({ text }),
					placeholder: __('Button words', 'anypress-io'),
					allowedFormats: ['core/bold', 'core/italic'],
					withoutInteractiveFormatting: true,
				})
			);
		},
		save({ attributes }) {
			return el(RichText.Content, { ...useBlockProps.save({ href: attributes.url || undefined }), tagName: 'a', value: attributes.text });
		},
	});
})(window.wp);

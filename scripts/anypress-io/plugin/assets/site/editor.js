// The block editor for anypress.io's pages.
( function ( wp ) {
	var hooks = wp.hooks;
	var el = wp.element.createElement;

	// Keeps anypressAttrs (attributes core blocks can't hold, see includes/look.php) on blocks the editor saves.
	var names = [ 'core/group', 'core/heading', 'core/paragraph', 'core/list', 'core/list-item', 'core/details' ];
	hooks.addFilter( 'blocks.registerBlockType', 'anypress-io/attrs', function ( settings, name ) {
		if ( names.indexOf( name ) === -1 ) {
			return settings;
		}
		settings.attributes = Object.assign( {}, settings.attributes, { anypressAttrs: { type: 'object' } } );
		return settings;
	} );

	// The site's hand-made pieces (drawings, cards, tables...) are Custom HTML blocks. WordPress shows each one in a
	// box of its own, apart from the page, so they lose the page's layout. Here they show in place, as on the page,
	// with an "Edit HTML" button for the code. Only for people allowed to save any HTML (administrators).
	var settings = window.anypressIoEditor || {};
	if ( ! settings.inline ) {
		return;
	}
	var rendered = {};
	var render = function ( content ) {
		if ( content.indexOf( '[anypress_' ) === -1 ) {
			return Promise.resolve( content );
		}
		rendered[ content ] = rendered[ content ] || wp.apiFetch( { path: '/anypress-io/v1/preview', method: 'POST', data: { content: content } } ).then(
			function ( r ) {
				return r.html;
			},
			function () {
				return content;
			}
		);
		return rendered[ content ];
	};
	var InPlace = function ( props ) {
		// The piece's code: its content attribute, or, for a piece not yet changed in this editor, the code it was saved with.
		var original = wp.data.useSelect( function ( select ) {
			var b = select( 'core/block-editor' ).getBlock( props.clientId );
			return b ? b.originalContent : '';
		}, [ props.clientId ] );
		var content = typeof props.attributes.content === 'string' ? props.attributes.content : original || '';
		var state = wp.element.useState( content.indexOf( '[anypress_' ) === -1 ? content : '' );
		wp.element.useEffect( function () {
			var live = true;
			render( content ).then( function ( html ) {
				if ( live ) {
					state[ 1 ]( html );
				}
			} );
			return function () {
				live = false;
			};
		}, [ content ] );
		var blockProps = wp.blockEditor.useBlockProps( { className: 'anypress-io-in-place' } );
		return el(
			wp.element.Fragment,
			null,
			el(
				wp.blockEditor.BlockControls,
				null,
				el( wp.components.ToolbarGroup, null, el( wp.components.ToolbarButton, { text: wp.i18n.__( 'Edit HTML', 'anypress-io' ), onClick: props.onCode } ) )
			),
			el( 'div', Object.assign( {}, blockProps, { dangerouslySetInnerHTML: { __html: state[ 0 ] } } ) )
		);
	};
	hooks.addFilter(
		'editor.BlockEdit',
		'anypress-io/in-place',
		wp.compose.createHigherOrderComponent( function ( BlockEdit ) {
			return function ( props ) {
				var code = wp.element.useState( false );
				wp.element.useEffect( function () {
					if ( ! props.isSelected ) {
						code[ 1 ]( false );
					}
				}, [ props.isSelected ] );
				if ( props.name !== 'core/html' || ( code[ 0 ] && props.isSelected ) ) {
					return el( BlockEdit, props );
				}
				return el( InPlace, Object.assign( {}, props, {
					onCode: function () {
						code[ 1 ]( true );
					},
				} ) );
			};
		}, 'withAnypressIoInPlace' )
	);
} )( window.wp );

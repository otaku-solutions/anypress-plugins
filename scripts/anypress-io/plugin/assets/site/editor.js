// The block editor for anypress.io's pages.
( function ( wp ) {
	var hooks = wp.hooks;
	var el = wp.element.createElement;

	// Keeps anypressAttrs (attributes core blocks can't hold, see includes/look.php) on blocks the editor saves.
	var names = [ 'core/group', 'core/heading', 'core/paragraph', 'core/list', 'core/list-item', 'core/details', 'core/image' ];
	hooks.addFilter( 'blocks.registerBlockType', 'anypress-io/attrs', function ( settings, name ) {
		if ( names.indexOf( name ) === -1 ) {
			return settings;
		}
		settings.attributes = Object.assign( {}, settings.attributes, { anypressAttrs: { type: 'object' } } );
		return settings;
	} );

	// A block that keeps another tag on the page (anypressAttrs.tag, see includes/look.php) shows with that tag, its
	// style and its data in the editor too, so the site's rules for it apply here as on the page. A Group's tag is its
	// own; a Paragraph's is marked, for editor.css.
	var styleObject = function ( css ) {
		var out = {};
		String( css || '' ).split( ';' ).forEach( function ( rule ) {
			var at = rule.indexOf( ':' );
			if ( at < 1 ) {
				return;
			}
			var name = rule.slice( 0, at ).trim();
			out[ name.indexOf( '--' ) === 0 ? name : name.replace( /-([a-z])/g, function ( m, c ) {
				return c.toUpperCase();
			} ) ] = rule.slice( at + 1 ).trim();
		} );
		return out;
	};
	hooks.addFilter(
		'editor.BlockListBlock',
		'anypress-io/kept-attrs',
		wp.compose.createHigherOrderComponent( function ( BlockListBlock ) {
			return function ( props ) {
				var kept = props.attributes && props.attributes.anypressAttrs;
				if ( ! kept || typeof kept !== 'object' ) {
					return el( BlockListBlock, props );
				}
				var extra = {};
				Object.keys( kept ).forEach( function ( name ) {
					if ( name === 'style' ) {
						extra.style = styleObject( kept.style );
					} else if ( /^(data-[a-z0-9-]+|role|aria-[a-z]+)$/.test( name ) ) {
						extra[ name ] = String( kept[ name ] );
					}
				} );
				if ( typeof kept.tag === 'string' ) {
					extra[ 'data-anypress-tag' ] = kept.tag;
				}
				return el( BlockListBlock, Object.assign( {}, props, { wrapperProps: Object.assign( {}, props.wrapperProps, extra ) } ) );
			};
		}, 'withAnypressIoKeptAttrs' )
	);
	var GROUP_TAGS = [ 'span', 'b', 'strong', 'small', 'em', 'i', 'label', 'a', 'div', 'p', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'nav', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'blockquote' ];
	hooks.addFilter(
		'editor.BlockEdit',
		'anypress-io/kept-tag',
		wp.compose.createHigherOrderComponent( function ( BlockEdit ) {
			return function ( props ) {
				var kept = ( props.attributes && props.attributes.anypressAttrs ) || {};
				var inner = el( BlockEdit, props.name === 'core/group' && GROUP_TAGS.indexOf( kept.tag ) !== -1 ? Object.assign( {}, props, { attributes: Object.assign( {}, props.attributes, { tagName: kept.tag } ) } ) : props );
				// A card or a link: where it goes, in the block's settings.
				if ( ! props.isSelected || ( kept.tag !== 'a' && ! kept.href ) ) {
					return inner;
				}
				return el(
					wp.element.Fragment,
					null,
					inner,
					el(
						wp.blockEditor.InspectorControls,
						null,
						el(
							wp.components.PanelBody,
							{ title: wp.i18n.__( 'Link', 'anypress-io' ) },
							el( wp.components.TextControl, {
								label: wp.i18n.__( 'Goes to', 'anypress-io' ),
								value: kept.href || '',
								onChange: function ( href ) {
									props.setAttributes( { anypressAttrs: Object.assign( {}, kept, { href: href } ) } );
								},
								__nextHasNoMarginBottom: true,
							} )
						)
					)
				);
			};
		}, 'withAnypressIoKeptTag' )
	);

	// The site's hand-made pieces (drawings, cards, tables...) are Custom HTML blocks. WordPress shows each one in a
	// box of its own, apart from the page, so they lose the page's layout. Here they show in place, as on the page,
	// with an "Edit HTML" button for the code. Only for people allowed to save any HTML (administrators).
	var settings = window.anypressIoEditor || {};
	if ( ! settings.inline ) {
		return;
	}
	// Pieces holding price shortcodes are filled in by the site, all the ones on screen in one request.
	var rendered = {};
	var waiting = [];
	var send = function () {
		var batch = waiting;
		waiting = [];
		wp.apiFetch( { path: '/anypress-io/v1/preview', method: 'POST', data: { contents: batch.map( function ( w ) {
			return w.content;
		} ) } } ).then(
			function ( r ) {
				batch.forEach( function ( w, i ) {
					w.done( typeof r.html[ i ] === 'string' ? r.html[ i ] : w.content );
				} );
			},
			function () {
				batch.forEach( function ( w ) {
					w.done( w.content );
				} );
			}
		);
	};
	var render = function ( content ) {
		if ( content.indexOf( '[anypress_' ) === -1 ) {
			return Promise.resolve( content );
		}
		rendered[ content ] = rendered[ content ] || new Promise( function ( done ) {
			if ( ! waiting.length ) {
				setTimeout( send, 50 );
			}
			waiting.push( { content: content, done: done } );
		} );
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
	// Words holding a price shortcode show the price, as on the page, until clicked; then the shortcode is there to edit.
	var Priced = function ( props ) {
		var content = String( props.attributes.content || '' );
		var state = wp.element.useState( '' );
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
		var tag = props.name === 'core/heading' ? 'h' + ( props.attributes.level || 2 ) : 'p';
		var blockProps = wp.blockEditor.useBlockProps( { className: props.name === 'core/heading' ? 'wp-block-heading' : undefined } );
		return el( tag, Object.assign( {}, blockProps, { dangerouslySetInnerHTML: { __html: state[ 0 ] || content } } ) );
	};
	hooks.addFilter(
		'editor.BlockEdit',
		'anypress-io/priced',
		wp.compose.createHigherOrderComponent( function ( BlockEdit ) {
			return function ( props ) {
				var priced = ( props.name === 'core/paragraph' || props.name === 'core/heading' ) && String( props.attributes.content || '' ).indexOf( '[anypress_' ) !== -1;
				return priced && ! props.isSelected ? el( Priced, props ) : el( BlockEdit, props );
			};
		}, 'withAnypressIoPriced' )
	);
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

// Keeps anypressAttrs (attributes core blocks can't hold, see includes/look.php) on blocks the editor saves.
( function ( hooks ) {
	var names = [ 'core/group', 'core/heading', 'core/paragraph', 'core/list', 'core/list-item' ];
	hooks.addFilter( 'blocks.registerBlockType', 'anypress-io/attrs', function ( settings, name ) {
		if ( names.indexOf( name ) === -1 ) {
			return settings;
		}
		settings.attributes = Object.assign( {}, settings.attributes, { anypressAttrs: { type: 'object' } } );
		return settings;
	} );
} )( window.wp.hooks );

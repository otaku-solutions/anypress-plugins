<?php
/**
 * anypress.io's colours and fonts as WordPress's own: they show in Appearance > Editor > Styles (Colors and
 * Typography) and in every block's colour and font pickers, and the site's stylesheet reads them, so a colour or
 * font changed there changes it on every page. The defaults are anypress.io's, so nothing changes until someone
 * picks another.
 *
 * colors.json is written by pages/colors.mjs, which also points every colour in assets/site/css/site.css at its
 * variable.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

/** The palette: slug, name, colour. */
function anypress_io_palette(): array {
	static $palette = null;
	if ( null === $palette ) {
		$palette = json_decode( (string) file_get_contents( dirname( __DIR__ ) . '/colors.json' ), true );
		$palette = is_array( $palette ) ? $palette : array();
	}
	return $palette;
}

/** The two fonts: the text and headings, and the handwritten notes. */
function anypress_io_fonts(): array {
	return array(
		array(
			'slug'       => 'body',
			'name'       => __( 'Text (Hanken Grotesk)', 'anypress-io' ),
			'fontFamily' => '"Hanken Grotesk", "Hanken Grotesk Fallback"',
			'variable'   => 'font-hanken',
		),
		array(
			'slug'       => 'handwritten',
			'name'       => __( 'Handwritten (Caveat)', 'anypress-io' ),
			'fontFamily' => '"Caveat", "Caveat Fallback"',
			'variable'   => 'font-caveat',
		),
	);
}

// The site's colours and fonts in place of the theme's, as the theme.json of this site.
add_filter(
	'wp_theme_json_data_theme',
	static function ( $theme_json ) {
		return $theme_json->update_with(
			array(
				'version'  => 3,
				'settings' => array(
					'color'      => array(
						'palette'        => array_map( static fn( $c ) => array_intersect_key( $c, array_flip( array( 'slug', 'name', 'color' ) ) ), anypress_io_palette() ),
						'defaultPalette' => false,
						'custom'         => true,
					),
					'typography' => array(
						'fontFamilies' => array_map( static fn( $f ) => array_intersect_key( $f, array_flip( array( 'slug', 'name', 'fontFamily' ) ) ), anypress_io_fonts() ),
					),
				),
				// Links look as the site's stylesheet says (the editor shows WordPress's own link style otherwise).
				'styles'   => array(
					'elements' => array(
						'link' => array(
							'color'      => array( 'text' => 'inherit' ),
							'typography' => array( 'textDecoration' => 'inherit' ),
						),
					),
				),
			)
		);
	}
);

/** A value from Styles as CSS ("var:preset|color|ink" is var(--wp--preset--color--ink)), or null when it isn't one. */
function anypress_io_style_value( $value ): ?string {
	if ( ! is_string( $value ) || '' === $value ) {
		return null;
	}
	if ( preg_match( '/^var:preset\|([a-z-]+)\|([a-z0-9-]+)$/', $value, $m ) ) {
		return "var(--wp--preset--{$m[1]}--{$m[2]})";
	}
	// Only plain colours, font names and WordPress's own variables: nothing that could close the rule.
	return preg_match( '/^[#a-zA-Z0-9 ,"\'().%_-]+$/', $value ) && ! str_contains( $value, '}' ) ? $value : null;
}

/** The site's variables pointed at WordPress's colours and fonts, after the stylesheet that sets their defaults. */
function anypress_io_settings_css(): string {
	$out = array();
	foreach ( anypress_io_palette() as $color ) {
		$out[] = sprintf( '--%1$s:var(--wp--preset--color--%1$s,%2$s)', $color['slug'], $color['color'] );
	}
	foreach ( anypress_io_fonts() as $font ) {
		$out[] = sprintf( '--%s:var(--wp--preset--font-family--%s,%s)', $font['variable'], $font['slug'], $font['fontFamily'] );
	}
	// What someone picked in Styles itself (Colors > Background and Text, Typography > Text) wins: the page's paper, its
	// ink and its text font.
	$picked = class_exists( 'WP_Theme_JSON_Resolver' ) ? ( WP_Theme_JSON_Resolver::get_user_data()->get_raw_data()['styles'] ?? array() ) : array();
	foreach ( array( 'paper' => array( 'color', 'background' ), 'ink' => array( 'color', 'text' ), 'font-hanken' => array( 'typography', 'fontFamily' ) ) as $variable => $path ) {
		$value = anypress_io_style_value( $picked[ $path[0] ][ $path[1] ] ?? null );
		if ( null !== $value ) {
			$out[] = "--$variable:$value";
		}
	}
	// WordPress's own variables and the classes its colour and font pickers add (has-ink-color and the like).
	return wp_get_global_stylesheet( array( 'variables', 'presets' ) ) . ':root{' . implode( ';', $out ) . '}';
}

add_action(
	'wp_enqueue_scripts',
	static function () {
		wp_add_inline_style( 'anypress-io-site', anypress_io_settings_css() );
	},
	6
);

// The same in the editor, so a colour picked in Styles shows on the blocks there too.
add_action(
	'enqueue_block_assets',
	static function () {
		if ( is_admin() ) {
			wp_add_inline_style( 'anypress-io-site', anypress_io_settings_css() );
		}
	},
	11
);

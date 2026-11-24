<?php
/**
 * anypress.io's sections as block patterns, under "anypress.io" in the inserter's Patterns tab, so a section added by
 * hand or by an agent through the site tools comes in the site's own look. pages/patterns.mjs writes patterns/ from
 * the pages; each loads only when the inserter or the site tools ask for it.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

/** A how-to video's address: its copy in the Media Library (setup.php), or anypress.io's video folder. */
function anypress_io_video( string $file ): string {
	$urls = (array) get_option( 'anypress_io_video_urls', array() );
	if ( isset( $urls[ $file ] ) ) {
		return (string) $urls[ $file ];
	}
	return ( defined( 'ANYPRESS_IO_VIDEOS' ) ? ANYPRESS_IO_VIDEOS : 'https://anypress.io/videos' ) . '/' . $file;
}

add_action(
	'init',
	static function () {
		register_block_pattern_category(
			'anypress-io',
			array(
				'label'       => __( 'anypress.io', 'anypress-io' ),
				'description' => __( "anypress.io's own sections, in the site's look.", 'anypress-io' ),
			)
		);
		$dir = dirname( __DIR__ ) . '/patterns/';
		foreach ( (array) json_decode( (string) file_get_contents( $dir . 'index.json' ), true ) as $pattern ) {
			register_block_pattern(
				'anypress-io/' . $pattern['slug'],
				array(
					'title'       => $pattern['title'],
					/* translators: %s: the page the section is from. */
					'description' => sprintf( __( "anypress.io's section, as on /%s.", 'anypress-io' ), $pattern['path'] ),
					'categories'  => array( 'anypress-io' ),
					'keywords'    => array( 'anypress.io', strtolower( $pattern['title'] ) ),
					'filePath'    => $dir . $pattern['slug'] . '.php',
				)
			);
		}
	}
);

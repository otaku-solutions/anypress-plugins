<?php
/**
 * Sets up anypress.io on a website store: its pages from pages/html and its header and footer from pages/parts
 * (both written by pages/convert.mjs), the sign-up forms, the home page and the site's name. Pages are found by their address, so running it again
 * brings each page back to what pages/html holds, keeping a revision of the one it replaces.
 *
 *   wp eval-file setup.php --user=<admin>
 *
 * Needs the AnyPress Site plugin (plugin/, a must-use plugin on the store): its blocks, shortcodes and images.
 *
 * @package AnyPress_IO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
if ( ! defined( 'ANYPRESS_IO_VERSION' ) ) {
	WP_CLI::error( 'The AnyPress Site plugin is not loaded: install plugin/ as a must-use plugin first (README.md).' );
}
if ( ! current_user_can( 'manage_options' ) ) {
	WP_CLI::error( 'Run this as an administrator: add --user=<admin>.' );
}

$anypress_io_dir    = __DIR__ . '/pages';
$anypress_io_assets = untrailingslashit( plugins_url( 'assets', WPMU_PLUGIN_DIR . '/anypress-io/anypress-io.php' ) );
// The how-to videos stay on anypress.io's video folder until they're added to this site's Media Library.
$anypress_io_videos = defined( 'ANYPRESS_IO_VIDEOS' ) ? ANYPRESS_IO_VIDEOS : 'https://anypress.io/videos';
$anypress_io_pages  = json_decode( (string) file_get_contents( $anypress_io_dir . '/pages.json' ), true );

update_option( 'blogname', 'AnyPress' );
update_option( 'blogdescription', 'Managed WordPress for shops, studios, clubs and small businesses' );

// The sign-up forms, once each, through Fluent Forms' own import (as Tools > Import would), found again by title.
$anypress_io_forms = array();
if ( class_exists( '\\FluentForm\\App\\Services\\Transfer\\TransferService' ) ) {
	require_once ABSPATH . 'wp-admin/includes/file.php';
	foreach ( json_decode( (string) file_get_contents( $anypress_io_dir . '/forms.json' ), true ) as $anypress_io_form ) {
		$found = \FluentForm\App\Models\Form::where( 'title', $anypress_io_form['title'] )->first();
		if ( ! $found ) {
			$tmp = wp_tempnam( 'anypress-form.json' );
			file_put_contents( $tmp, wp_json_encode( array( $anypress_io_form ) ) );
			\FluentForm\App\Services\Transfer\TransferService::importForms( new \FluentForm\Framework\Http\Request\File( $tmp, 'forms.json' ) );
			wp_delete_file( $tmp );
			$found = \FluentForm\App\Models\Form::where( 'title', $anypress_io_form['title'] )->first();
		}
		$anypress_io_forms[ sanitize_title( $anypress_io_form['title'] ) ] = $found ? (string) $found->id : '';
	}
	WP_CLI::log( sprintf( 'Forms ready: %s.', implode( ', ', array_keys( $anypress_io_forms ) ) ) );
} else {
	WP_CLI::warning( 'Fluent Forms is not active, so the sign-up forms are left out.' );
}

// The site's addresses and forms put into the markup convert.mjs wrote.
$anypress_io_fill = static function ( string $markup ) use ( $anypress_io_assets, $anypress_io_videos, $anypress_io_forms ): string {
	$markup = str_replace( array( '{{assets}}', '{{videos}}' ), array( $anypress_io_assets, $anypress_io_videos ), $markup );
	return (string) preg_replace_callback( '/\{\{form:([a-z0-9-]+)\}\}/', static fn( $m ) => $anypress_io_forms[ $m[1] ] ?? '', $markup );
};

// Pages, parents first, so /sites/website/ finds /sites/.
usort( $anypress_io_pages, static fn( $a, $b ) => substr_count( $a['path'], '/' ) <=> substr_count( $b['path'], '/' ) );
$anypress_io_ids = array();
foreach ( $anypress_io_pages as $anypress_io_page ) {
	$content = $anypress_io_fill( (string) file_get_contents( $anypress_io_dir . '/html/' . $anypress_io_page['file'] . '.html' ) );
	$path    = trim( $anypress_io_page['path'], '/' );
	$slug    = '' === $path ? 'home' : basename( $path );
	$parent  = str_contains( $path, '/' ) ? get_page_by_path( dirname( $path ) ) : null;
	if ( str_contains( $path, '/' ) && ! $parent ) {
		// anypress.io has no page at some parents' addresses (/guides/): a private page holds the address for its children.
		$parent = get_post(
			wp_insert_post(
				array(
					'post_type'   => 'page',
					'post_status' => 'private',
					'post_title'  => ucfirst( basename( dirname( $path ) ) ),
					'post_name'   => basename( dirname( $path ) ),
				)
			)
		);
	}
	$found   = get_page_by_path( '' === $path ? 'home' : $path );
	$post    = array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => $anypress_io_page['title'],
		'post_name'    => $slug,
		'post_parent'  => $parent ? $parent->ID : 0,
		'post_content' => wp_slash( $content ),
	);
	if ( ! empty( $anypress_io_page['template'] ) ) {
		$post['page_template'] = $anypress_io_page['template'];
	}
	if ( $found ) {
		$post['ID'] = $found->ID;
	}
	$id = wp_insert_post( $post, true );
	if ( is_wp_error( $id ) ) {
		WP_CLI::error( sprintf( '%s: %s', '/' . $path, $id->get_error_message() ) );
	}
	$anypress_io_ids[ $path ] = $id;
	WP_CLI::log( sprintf( '%s /%s', $found ? 'Updated' : 'Made', $path ) );
}

if ( isset( $anypress_io_ids[''] ) ) {
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $anypress_io_ids[''] );
}

// The logo, once: the site's logo and icon.
if ( ! get_option( 'site_logo' ) ) {
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$anypress_io_tmp = wp_tempnam( 'anypress-logo.png' );
	copy( WPMU_PLUGIN_DIR . '/anypress-io/assets/logo.png', $anypress_io_tmp );
	$anypress_io_logo = media_handle_sideload( array( 'name' => 'anypress-logo.png', 'tmp_name' => $anypress_io_tmp ), 0, 'AnyPress' );
	if ( ! is_wp_error( $anypress_io_logo ) ) {
		update_option( 'site_logo', $anypress_io_logo );
		update_option( 'site_icon', $anypress_io_logo );
	}
}

// The header and footer, as the Site Editor saves them: the theme's header and footer template parts, which the
// plugin's anypress.io page template puts around every page. Each is found by its name, so a second run replaces it.
$anypress_io_find = static fn( string $type, string $name ) => get_posts( array( 'post_type' => $type, 'name' => $name, 'post_status' => 'any', 'numberposts' => 1 ) )[0] ?? null;
foreach ( array( 'header', 'footer' ) as $anypress_io_area ) {
	$found = $anypress_io_find( 'wp_template_part', $anypress_io_area );
	$id    = wp_insert_post(
		array(
			'ID'           => $found ? $found->ID : 0,
			'post_type'    => 'wp_template_part',
			'post_status'  => 'publish',
			'post_title'   => ucfirst( $anypress_io_area ),
			'post_name'    => $anypress_io_area,
			'post_content' => wp_slash( $anypress_io_fill( (string) file_get_contents( $anypress_io_dir . "/parts/$anypress_io_area.html" ) ) ),
			'tax_input'    => array(
				'wp_theme'              => array( get_stylesheet() ),
				'wp_template_part_area' => array( $anypress_io_area ),
			),
		)
	);
	// tax_input needs the capability to assign terms; set them directly so it works from any runner.
	wp_set_post_terms( $id, array( get_stylesheet() ), 'wp_theme' );
	wp_set_post_terms( $id, array( $anypress_io_area ), 'wp_template_part_area' );
}
WP_CLI::log( 'Header and footer set.' );

WP_CLI::success( sprintf( '%d page(s) set up.', count( $anypress_io_ids ) ) );

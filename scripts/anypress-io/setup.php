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
// Where the how-to videos are copied into the Media Library from (anypress.io's video folder). Define
// ANYPRESS_IO_SKIP_VIDEOS to leave them playing from there instead, as the browser preview does.
$anypress_io_videos = defined( 'ANYPRESS_IO_VIDEOS' ) ? ANYPRESS_IO_VIDEOS : 'https://anypress.io/videos';
$anypress_io_pages  = json_decode( (string) file_get_contents( $anypress_io_dir . '/pages.json' ), true );

update_option( 'blogname', 'AnyPress' );
update_option( 'blogdescription', 'Managed WordPress for shops, studios, clubs and small businesses' );

// One CRM for all of AnyPress: the shop's. anypress.io's forms send sign-ups to the shop's lead route (includes/lead.php)
// and it has no accounts of its own, so the site type's FluentCRM and WP Fusion stay off here (AnyPress Client 2.46.0+).
update_option( 'anypress_plugins_kept_off', array( 'fluent-crm/fluent-crm.php', 'wp-fusion-lite/wp-fusion-lite.php' ) );

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

require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

/**
 * A file in the Media Library, added once: found again by the name it was added under, so a second run reuses it.
 * $from is a file next to this script or an address to download. Returns the attachment's id, or 0.
 */
$anypress_io_media = static function ( string $name, string $from, string $title, string $alt = '' ): int {
	$found = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_anypress_io_media', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- setup, run once.
			'meta_value'  => $name, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- setup, run once.
		)
	);
	if ( $found ) {
		return (int) $found[0];
	}
	if ( str_starts_with( $from, 'http' ) ) {
		$tmp = download_url( $from, 600 );
		if ( is_wp_error( $tmp ) ) {
			WP_CLI::warning( sprintf( '%s: %s', $from, $tmp->get_error_message() ) );
			return 0;
		}
	} else {
		$tmp = wp_tempnam( $name );
		copy( $from, $tmp );
	}
	$id = media_handle_sideload( array( 'name' => basename( $name ), 'tmp_name' => $tmp ), 0, $title );
	if ( is_wp_error( $id ) ) {
		wp_delete_file( $tmp );
		WP_CLI::warning( sprintf( '%s: %s', $name, $id->get_error_message() ) );
		return 0;
	}
	update_post_meta( $id, '_anypress_io_media', $name );
	if ( '' !== $alt ) {
		update_post_meta( $id, '_wp_attachment_image_alt', $alt );
	}
	return (int) $id;
};

// The how-to videos and their posters into the Media Library, each pair side by side so the player finds the video
// next to its poster (site.js swaps .jpg for .mp4).
$anypress_io_video_urls = array();
if ( ! defined( 'ANYPRESS_IO_SKIP_VIDEOS' ) ) {
	$anypress_io_markup = implode( '', array_map( 'file_get_contents', array_merge( glob( $anypress_io_dir . '/html/*.html' ), glob( $anypress_io_dir . '/parts/*.html' ) ) ) );
	preg_match_all( '#\{\{videos\}\}/([a-z0-9-]+)\.jpg#', $anypress_io_markup, $anypress_io_found );
	foreach ( array_unique( $anypress_io_found[1] ) as $anypress_io_video ) {
		$poster = $anypress_io_media( "videos/$anypress_io_video.jpg", "$anypress_io_videos/$anypress_io_video.jpg", $anypress_io_video );
		$movie  = $poster ? $anypress_io_media( "videos/$anypress_io_video.mp4", "$anypress_io_videos/$anypress_io_video.mp4", $anypress_io_video ) : 0;
		$url    = $movie ? (string) wp_get_attachment_url( $poster ) : '';
		if ( $url && preg_replace( '/\.jpg$/', '.mp4', $url ) === wp_get_attachment_url( $movie ) ) {
			$anypress_io_video_urls[ "{{videos}}/$anypress_io_video.jpg" ] = $url;
			$anypress_io_video_urls[ "{{videos}}/$anypress_io_video.mp4" ] = (string) wp_get_attachment_url( $movie );
		}
	}
	// For the plugin's patterns (plugin/includes/patterns.php), by file name.
	$anypress_io_saved = array();
	foreach ( $anypress_io_video_urls as $anypress_io_key => $anypress_io_url ) {
		$anypress_io_saved[ basename( $anypress_io_key ) ] = $anypress_io_url;
	}
	update_option( 'anypress_io_video_urls', $anypress_io_saved, false );
	WP_CLI::log( sprintf( 'Videos in the Media Library: %d.', count( $anypress_io_saved ) / 2 ) );
}

// The site's addresses and forms put into the markup convert.mjs wrote.
$anypress_io_fill = static function ( string $markup ) use ( $anypress_io_assets, $anypress_io_videos, $anypress_io_forms, $anypress_io_video_urls ): string {
	$markup = strtr( $markup, $anypress_io_video_urls );
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

	// Search and share details, in Rank Math's own fields; the structured data joins Rank Math's (plugin/includes/seo.php).
	$seo = $anypress_io_page['seo'] ?? array();
	update_post_meta( $id, 'rank_math_title', wp_slash( $seo['title'] ?? '' ) );
	update_post_meta( $id, 'rank_math_description', wp_slash( $seo['description'] ?? '' ) );
	$og = ! empty( $seo['image'] ) ? $anypress_io_media( 'og/' . $seo['image'], $anypress_io_dir . '/og/' . $seo['image'], $anypress_io_page['title'], $seo['title'] ?? '' ) : 0;
	if ( $og ) {
		update_post_meta( $id, 'rank_math_facebook_image', wp_get_attachment_url( $og ) );
		update_post_meta( $id, 'rank_math_facebook_image_id', $og );
		update_post_meta( $id, 'rank_math_twitter_use_facebook', 'on' );
	}
	$schema = str_replace( '{{og}}', $og ? (string) wp_get_attachment_url( $og ) : '', (string) wp_json_encode( $seo['schema'] ?? array() ) );
	update_post_meta( $id, '_anypress_io_schema', wp_slash( $schema ) );
	WP_CLI::log( sprintf( '%s /%s', $found ? 'Updated' : 'Made', $path ) );
}

if ( isset( $anypress_io_ids[''] ) ) {
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $anypress_io_ids[''] );
}

// The logo, once: the site's logo and icon.
if ( ! get_option( 'site_logo' ) ) {
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

// Rank Math: AnyPress as the business behind the site, robots.txt, and anypress.io's old addresses as redirections.
if ( defined( 'RANK_MATH_VERSION' ) ) {
	$anypress_io_logo_id = (int) get_option( 'site_logo' );
	update_option(
		'rank-math-options-titles',
		array_merge(
			(array) get_option( 'rank-math-options-titles', array() ),
			array(
				'knowledgegraph_type'    => 'company',
				'knowledgegraph_name'    => 'AnyPress',
				'website_name'           => 'AnyPress',
				'knowledgegraph_logo'    => $anypress_io_logo_id ? wp_get_attachment_url( $anypress_io_logo_id ) : '',
				'knowledgegraph_logo_id' => $anypress_io_logo_id,
			)
		)
	);
	update_option(
		'rank-math-options-general',
		array_merge(
			(array) get_option( 'rank-math-options-general', array() ),
			array( 'robots_txt_content' => "User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\nSitemap: " . home_url( '/sitemap_index.xml' ) . "\n" )
		)
	);
	\RankMath\Helper::update_modules( array( 'redirections' => 'on', 'sitemap' => 'on' ) );
	$anypress_io_moved = 0;
	if ( class_exists( '\\RankMath\\Redirections\\Redirection' ) ) {
		foreach ( json_decode( (string) file_get_contents( $anypress_io_dir . '/redirects.json' ), true ) as $anypress_io_redirect ) {
			$from = $anypress_io_redirect['from'];
			// Each added once; the ones added are remembered, so a second run leaves them (and any edits) alone.
			$done = (array) get_option( 'anypress_io_redirects', array() );
			if ( in_array( $from, $done, true ) ) {
				continue;
			}
			update_option( 'anypress_io_redirects', array_merge( $done, array( $from ) ), false );
			\RankMath\Redirections\Redirection::from(
				array(
					'sources'     => array(
						array(
							'pattern'    => $from,
							'comparison' => empty( $anypress_io_redirect['regex'] ) ? 'exact' : 'regex',
						),
					),
					'url_to'      => home_url( $anypress_io_redirect['to'] ),
					'header_code' => (string) $anypress_io_redirect['code'],
				)
			)->save();
			++$anypress_io_moved;
		}
	}
	// The sitemap's addresses.
	flush_rewrite_rules( false );
	WP_CLI::log( sprintf( 'Search details set; %d redirection(s) added.', $anypress_io_moved ) );
} else {
	WP_CLI::warning( 'Rank Math is not active, so search details and redirections are left out.' );
}

// What's New: each change a post under Changes, with its kind and the sites it's for (plugin/includes/changelog.php).
$anypress_io_log = json_decode( (string) file_get_contents( $anypress_io_dir . '/changes.json' ), true );
foreach ( array( 'anypress_change_kind' => 'kinds', 'anypress_change_for' => 'for' ) as $anypress_io_tax => $anypress_io_key ) {
	foreach ( $anypress_io_log[ $anypress_io_key ] as $anypress_io_slug => $anypress_io_label ) {
		if ( ! term_exists( $anypress_io_slug, $anypress_io_tax ) ) {
			wp_insert_term( $anypress_io_label, $anypress_io_tax, array( 'slug' => $anypress_io_slug ) );
		}
	}
}
foreach ( $anypress_io_log['changes'] as $anypress_io_i => $anypress_io_change ) {
	$found = get_posts( array( 'post_type' => 'anypress_change', 'name' => $anypress_io_change['id'], 'post_status' => 'any', 'numberposts' => 1 ) )[0] ?? null;
	// Changes on one day keep the list's order: each a second earlier than the one before it.
	$id = wp_insert_post(
		array(
			'ID'           => $found ? $found->ID : 0,
			'post_type'    => 'anypress_change',
			'post_status'  => 'publish',
			'post_name'    => $anypress_io_change['id'],
			'post_title'   => wp_slash( $anypress_io_change['title'] ),
			'post_content' => wp_slash( "<!-- wp:paragraph -->\n<p>" . esc_html( $anypress_io_change['body'] ) . "</p>\n<!-- /wp:paragraph -->" ),
			'post_date'    => $anypress_io_change['date'] . ' ' . gmdate( 'H:i:s', 12 * HOUR_IN_SECONDS - $anypress_io_i ),
		),
		true
	);
	if ( is_wp_error( $id ) ) {
		WP_CLI::warning( sprintf( '%s: %s', $anypress_io_change['id'], $id->get_error_message() ) );
		continue;
	}
	wp_set_object_terms( $id, array( $anypress_io_change['kind'] ), 'anypress_change_kind' );
	wp_set_object_terms( $id, $anypress_io_change['for'], 'anypress_change_for' );
	update_post_meta( $id, 'anypress_minor', empty( $anypress_io_change['minor'] ) ? '' : '1' );
	update_post_meta( $id, 'anypress_link_href', $anypress_io_change['link']['href'] ?? '' );
	update_post_meta( $id, 'anypress_link_label', $anypress_io_change['link']['label'] ?? '' );
	if ( ! empty( $anypress_io_change['image'] ) ) {
		$picture = $anypress_io_media( 'changes/' . $anypress_io_change['image']['file'], $anypress_io_dir . '/media/' . $anypress_io_change['image']['file'], $anypress_io_change['title'], $anypress_io_change['image']['alt'] );
		if ( $picture ) {
			set_post_thumbnail( $id, $picture );
		}
	}
}
WP_CLI::log( sprintf( 'Changes: %d.', count( $anypress_io_log['changes'] ) ) );

WP_CLI::success( sprintf( '%d page(s) set up.', count( $anypress_io_ids ) ) );

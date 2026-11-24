<?php
/**
 * anypress.io's What's New: each change is a post under Changes in wp-admin (title, text, featured image, date it
 * reached customers), with its kind (New, Improved, Fixed) and the sites it's for picked in the sidebar, and
 * "Smaller" ticked for one that folds away under the day's smaller improvements. The AnyPress Changelog block
 * shows them on /changelog/.
 *
 * Custom fields on a change: anypress_minor (1 for a smaller one), anypress_link_href and anypress_link_label (a
 * link shown after its tags).
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'init',
	static function () {
		register_post_type(
			'anypress_change',
			array(
				'labels'       => array(
					'name'          => __( 'Changes', 'anypress-io' ),
					'singular_name' => __( 'Change', 'anypress-io' ),
					'add_new_item'  => __( 'Add a change', 'anypress-io' ),
					'edit_item'     => __( 'Edit change', 'anypress-io' ),
					'menu_name'     => __( 'Changes', 'anypress-io' ),
				),
				'description'  => __( "What's new on AnyPress, shown on /changelog/.", 'anypress-io' ),
				'public'       => false,
				'show_ui'      => true,
				'show_in_rest' => true,
				'menu_icon'    => 'dashicons-megaphone',
				'supports'     => array( 'title', 'editor', 'thumbnail', 'custom-fields', 'revisions' ),
			)
		);
		register_taxonomy(
			'anypress_change_kind',
			'anypress_change',
			array(
				'labels'            => array(
					'name'          => __( 'Kind', 'anypress-io' ),
					'singular_name' => __( 'Kind', 'anypress-io' ),
				),
				'public'            => false,
				'show_ui'           => true,
				'show_in_rest'      => true,
				'hierarchical'      => true,
				'show_admin_column' => true,
			)
		);
		register_taxonomy(
			'anypress_change_for',
			'anypress_change',
			array(
				'labels'            => array(
					'name'          => __( 'For', 'anypress-io' ),
					'singular_name' => __( 'For', 'anypress-io' ),
				),
				'description'       => __( 'The sites a change is for. None picked means every site.', 'anypress-io' ),
				'public'            => false,
				'show_ui'           => true,
				'show_in_rest'      => true,
				'hierarchical'      => true,
				'show_admin_column' => true,
			)
		);
		foreach ( array( 'anypress_minor', 'anypress_link_href', 'anypress_link_label' ) as $key ) {
			register_post_meta(
				'anypress_change',
				$key,
				array(
					'type'              => 'string',
					'single'            => true,
					'show_in_rest'      => true,
					'sanitize_callback' => 'anypress_link_href' === $key ? 'esc_url_raw' : 'sanitize_text_field',
					'auth_callback'     => static fn() => current_user_can( 'edit_posts' ),
				)
			);
		}
	}
);

/** The site types a change can be for, slug => label, in the filter's order. */
function anypress_io_change_for_labels(): array {
	$terms = get_terms(
		array(
			'taxonomy'   => 'anypress_change_for',
			'hide_empty' => false,
			'orderby'    => 'term_id',
		)
	);
	return is_wp_error( $terms ) ? array() : wp_list_pluck( $terms, 'name', 'slug' );
}

/** "1 smaller improvement", "3 smaller improvements". */
function anypress_io_smaller_label( int $count ): string {
	/* translators: %d: how many smaller improvements. */
	return sprintf( _n( '%d smaller improvement', '%d smaller improvements', $count, 'anypress-io' ), $count );
}

/**
 * Published changes, newest first, as the list draws them.
 *
 * @return array<int, array{id: string, date: string, kind: string, kindLabel: string, minor: bool, title: string, body: string, for: string[], image: ?array, link: ?array}>
 */
function anypress_io_changes(): array {
	$out = array();
	foreach (
		get_posts(
			array(
				'post_type'   => 'anypress_change',
				'post_status' => 'publish',
				'numberposts' => -1,
				'orderby'     => 'date',
				'order'       => 'DESC',
			)
		) as $post
	) {
		$kind  = get_the_terms( $post, 'anypress_change_kind' );
		$kind  = $kind && ! is_wp_error( $kind ) ? $kind[0] : null;
		$for   = get_the_terms( $post, 'anypress_change_for' );
		$thumb = get_post_thumbnail_id( $post );
		$href  = (string) get_post_meta( $post->ID, 'anypress_link_href', true );
		$out[] = array(
			'id'        => $post->post_name,
			'date'      => get_the_date( 'Y-m-d', $post ),
			'kind'      => $kind ? $kind->slug : 'improved',
			'kindLabel' => $kind ? $kind->name : __( 'Improved', 'anypress-io' ),
			'minor'     => '1' === (string) get_post_meta( $post->ID, 'anypress_minor', true ),
			'title'     => get_the_title( $post ),
			'body'      => trim( wp_strip_all_tags( do_shortcode( do_blocks( $post->post_content ) ), false ) ),
			'for'       => $for && ! is_wp_error( $for ) ? wp_list_pluck( $for, 'slug' ) : array(),
			'image'     => $thumb ? array(
				'src' => (string) wp_get_attachment_image_url( $thumb, 'full' ),
				'alt' => (string) get_post_meta( $thumb, '_wp_attachment_image_alt', true ),
			) : null,
			'link'      => $href ? array(
				'href'  => $href,
				'label' => (string) get_post_meta( $post->ID, 'anypress_link_label', true ),
			) : null,
		);
	}
	return $out;
}

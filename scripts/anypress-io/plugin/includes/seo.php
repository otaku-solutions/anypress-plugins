<?php
/**
 * Each page's search and share details as anypress.io had them, through Rank Math: setup.php puts the page's
 * title, description and share picture in Rank Math's own fields, and its structured data (FAQs, breadcrumbs,
 * articles, plans) in _anypress_io_schema, which joins Rank Math's structured data here. Prices in any of them are
 * the price shortcodes, filled from the price list as the page is shown.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

/** Text with the price shortcodes filled in. */
function anypress_io_fill_prices( $text ) {
	return is_string( $text ) && str_contains( $text, '[anypress_' ) ? do_shortcode( $text ) : $text;
}

foreach (
	array(
		'rank_math/frontend/title',
		'rank_math/frontend/description',
		'rank_math/opengraph/facebook/og_title',
		'rank_math/opengraph/facebook/og_description',
		'rank_math/opengraph/facebook/og_image_alt',
		'rank_math/opengraph/twitter/twitter_title',
		'rank_math/opengraph/twitter/twitter_description',
	) as $anypress_io_hook
) {
	add_filter( $anypress_io_hook, 'anypress_io_fill_prices' );
}

/**
 * A page's structured data with its addresses and prices filled in: {{home}} is this site's address, and a price
 * field (price, lowPrice, highPrice) holding a price shortcode becomes the number.
 *
 * @param mixed  $value The value.
 * @param string $key   Its key.
 * @return mixed
 */
function anypress_io_fill_schema( $value, string $key = '' ) {
	if ( is_array( $value ) ) {
		foreach ( $value as $k => $v ) {
			$value[ $k ] = anypress_io_fill_schema( $v, (string) $k );
		}
		return $value;
	}
	if ( ! is_string( $value ) ) {
		return $value;
	}
	$value = anypress_io_fill_prices( str_replace( '{{home}}', untrailingslashit( home_url() ), $value ) );
	if ( in_array( $key, array( 'price', 'lowPrice', 'highPrice' ), true ) ) {
		return (float) preg_replace( '/[^0-9.]/', '', html_entity_decode( $value ) );
	}
	return html_entity_decode( $value, ENT_QUOTES );
}

add_filter(
	'rank_math/json_ld',
	static function ( $data ) {
		if ( ! is_array( $data ) ) {
			return $data;
		}
		// The business, as anypress.io described it: its support address.
		if ( isset( $data['publisher'] ) && is_array( $data['publisher'] ) ) {
			$data['publisher']['email']        = 'support@anypress.io';
			$data['publisher']['contactPoint'] = array(
				'@type'             => 'ContactPoint',
				'contactType'       => 'customer support',
				'email'             => 'support@anypress.io',
				'availableLanguage' => 'English',
			);
		}
		$id     = is_singular() ? get_queried_object_id() : ( is_front_page() ? (int) get_option( 'page_on_front' ) : 0 );
		$schema = $id ? json_decode( (string) get_post_meta( $id, '_anypress_io_schema', true ), true ) : null;
		if ( is_array( $schema ) ) {
			// anypress.io's pages aren't articles by the site's admin: the guides carry their own Article data, as before.
			foreach ( $data as $key => $entity ) {
				if ( is_array( $entity ) && array_intersect( (array) ( $entity['@type'] ?? '' ), array( 'Article', 'BlogPosting', 'NewsArticle', 'Person', 'ProfilePage' ) ) ) {
					unset( $data[ $key ] );
				}
			}
		}
		foreach ( is_array( $schema ) ? $schema : array() as $i => $entity ) {
			unset( $entity['@context'] );
			$data[ 'anypress-io-' . $i ] = anypress_io_fill_schema( $entity );
		}
		return $data;
	},
	99
);

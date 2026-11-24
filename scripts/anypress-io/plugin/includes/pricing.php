<?php
/**
 * AnyPress's one price list, read from the API (GET https://api.anypress.io/pricing) and kept for six hours. When the
 * API can't be reached the site uses the copy that ships with this plugin (pricing.json, written by the site's
 * `npm run prices`), so the calculators always show a price.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

/**
 * The price list as an array: siteTypes, sizeTimes, yearlyMonths, volumeTiers, wholesalePercent, affiliatePercent...
 *
 * @return array<string, mixed>
 */
function anypress_io_pricing(): array {
	$cached = get_transient( 'anypress_io_pricing' );
	if ( is_array( $cached ) ) {
		return $cached;
	}
	$res  = wp_remote_get( 'https://api.anypress.io/pricing', array( 'timeout' => 5 ) );
	$list = is_wp_error( $res ) || 200 !== wp_remote_retrieve_response_code( $res ) ? null : json_decode( wp_remote_retrieve_body( $res ), true );
	if ( ! is_array( $list ) || empty( $list['siteTypes'] ) ) {
		$copy = __DIR__ . '/../pricing.json';
		$list = is_readable( $copy ) ? json_decode( (string) file_get_contents( $copy ), true ) : array(); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- a file in this plugin.
		// Try the API again in ten minutes rather than six hours.
		set_transient( 'anypress_io_pricing', $list, 10 * MINUTE_IN_SECONDS );
		return is_array( $list ) ? $list : array();
	}
	set_transient( 'anypress_io_pricing', $list, 6 * HOUR_IN_SECONDS );
	return $list;
}

/**
 * The five kinds of site as the calculators show them, in the site's order, with their Small monthly price.
 *
 * @return list<array{id: string, short: string, from: float, slug: string}>
 */
function anypress_io_site_types(): array {
	$names = array(
		'website'      => __( 'Website', 'anypress-io' ),
		'bookings'     => __( 'Bookings', 'anypress-io' ),
		'online-store' => __( 'Store', 'anypress-io' ),
		'community'    => __( 'Community', 'anypress-io' ),
		'everything'   => __( 'Everything', 'anypress-io' ),
	);
	$out = array();
	foreach ( anypress_io_pricing()['siteTypes'] ?? array() as $type ) {
		if ( isset( $names[ $type['key'] ] ) ) {
			$out[] = array(
				'id'    => 'online-store' === $type['key'] ? 'store' : $type['key'],
				'short' => $names[ $type['key'] ],
				'from'  => (float) $type['monthly']['small'],
				'slug'  => $type['key'],
			);
		}
	}
	return $out;
}

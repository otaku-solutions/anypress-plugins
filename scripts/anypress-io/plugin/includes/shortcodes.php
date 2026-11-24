<?php
/**
 * Prices and price-list numbers inside page text, from the live price list, so no page ever types a price:
 *
 *   [anypress_price type="website"]                          $12 (Small, monthly)
 *   [anypress_price type="community" size="large" period="yearly"]
 *   [anypress_price lowest="1"]                              the lowest Small monthly price
 *   [anypress_price type="website" wholesale="1"]            the reseller's price, wholesalePercent off
 *   [anypress_price type="bookings" count="10" sites="10"]   ten sites' price, with the saving for ten sites
 *   [anypress_price type="store" period="yearly" affiliate="1"]  what an affiliate earns on that first payment
 *   [anypress_number of="trialDays"]                         7; also wholesalePercent, affiliatePercent,
 *                                                            yearlyMonths, monthsFree, mediumTimes, largeTimes,
 *                                                            volumeMin, volumeMax, volumeFirstSites, volumeLastSites, volumeSites
 *                                                            ("3, 10 and 25"), careFrom ($79), emailPackEmails
 *                                                            (10,000), emailPackPrice, storagePackGb, storagePackPrice
 *   [anypress_care item="care-plus" show="monthly"]          a care package or service: monthly, yearly, price,
 *                                                            time ("2 hours"), answer ("1 business day") or name
 *   [anypress_example kind="seller"]                         a year of selling Small Website sites at $49
 *   [anypress_example kind="reseller"]                       two brands on one wholesale bill
 *
 * Shortcodes work inside paragraphs, headings and buttons, and stay editable as text in the editor.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

/** $12, $12.50: whole dollars without cents. */
function anypress_io_money( float $amount ): string {
	return '$' . ( floor( $amount ) === $amount ? number_format( $amount ) : number_format( $amount, 2 ) );
}

/** A list price from the price list, or null; $type "" means the lowest of every kind of site. */
function anypress_io_list_price( string $type, string $size = 'small', string $period = 'monthly' ): ?float {
	$period = 'yearly' === $period ? 'yearly' : 'monthly';
	$size   = in_array( $size, array( 'small', 'medium', 'large' ), true ) ? $size : 'small';
	$found  = array();
	foreach ( (array) ( anypress_io_pricing()['siteTypes'] ?? array() ) as $row ) {
		// The site calls the online store "store"; the price list calls it "online-store".
		if ( '' === $type || $row['key'] === $type || ( 'store' === $type && 'online-store' === $row['key'] ) ) {
			$found[] = (float) ( $row[ $period ][ $size ] ?? 0 );
		}
	}
	return $found ? min( $found ) : null;
}

/** The reseller's price for a list price: wholesalePercent off. */
function anypress_io_wholesale( float $price ): float {
	return round( $price * ( 100 - (float) ( anypress_io_pricing()['wholesalePercent'] ?? 0 ) ) / 100, 2 );
}

/** The volume saving, in percent, once a seller has this many live sites. */
function anypress_io_volume_percent( int $sites ): float {
	$percent = 0.0;
	foreach ( (array) ( anypress_io_pricing()['volumeTiers'] ?? array() ) as $tier ) {
		if ( $sites >= (int) $tier['sites'] ) {
			$percent = (float) $tier['percent'];
		}
	}
	return $percent;
}

add_shortcode(
	'anypress_price',
	static function ( $atts ): string {
		$atts  = shortcode_atts(
			array(
				'type'      => 'website',
				'size'      => 'small',
				'period'    => 'monthly',
				'lowest'    => '',
				'wholesale' => '',
				'sites'     => '',
				'count'     => '1',
				'affiliate' => '',
			),
			$atts,
			'anypress_price'
		);
		$price = anypress_io_list_price( '' !== $atts['lowest'] ? '' : (string) $atts['type'], (string) $atts['size'], (string) $atts['period'] );
		if ( null === $price ) {
			return '';
		}
		if ( '' !== $atts['affiliate'] ) {
			$price = round( $price * (float) ( anypress_io_pricing()['affiliatePercent'] ?? 0 ) / 100, 2 );
		} elseif ( '' !== $atts['wholesale'] ) {
			$price = anypress_io_wholesale( $price );
		} elseif ( '' !== $atts['sites'] ) {
			$price = round( $price * ( 100 - anypress_io_volume_percent( (int) $atts['sites'] ) ) / 100, 2 );
		}
		return esc_html( anypress_io_money( round( $price * max( 1, (int) $atts['count'] ), 2 ) ) );
	}
);

add_shortcode(
	'anypress_number',
	static function ( $atts ): string {
		$atts   = shortcode_atts(
			array(
				'of'    => '',
				'sites' => '0',
			),
			$atts,
			'anypress_number'
		);
		$prices = anypress_io_pricing();
		$tiers  = (array) ( $prices['volumeTiers'] ?? array() );
		$value  = match ( $atts['of'] ) {
			'trialDays', 'wholesalePercent', 'affiliatePercent', 'yearlyMonths' => $prices[ $atts['of'] ] ?? '',
			'volumeMin'        => $tiers ? $tiers[0]['percent'] : '',
			'volumeMax'        => $tiers ? $tiers[ count( $tiers ) - 1 ]['percent'] : '',
			'volumeFirstSites' => $tiers ? $tiers[0]['sites'] : '',
			'volumeLastSites'  => $tiers ? $tiers[ count( $tiers ) - 1 ]['sites'] : '',
			'volumeAt'         => anypress_io_volume_percent( (int) ( $atts['sites'] ?? 0 ) ),
			'volumeSites'      => $tiers ? preg_replace( '/, ([^,]*)$/', ' and $1', implode( ', ', array_column( $tiers, 'sites' ) ) ) : '',
			'monthsFree'       => isset( $prices['yearlyMonths'] ) ? 12 - (int) $prices['yearlyMonths'] : '',
			'mediumTimes'      => $prices['sizeTimes']['medium'] ?? '',
			'largeTimes'       => $prices['sizeTimes']['large'] ?? '',
			'careFrom'         => ( $prices['care']['packages'] ?? array() ) ? anypress_io_money( (float) min( array_column( $prices['care']['packages'], 'monthly' ) ) ) : '',
			'emailPackEmails'  => isset( $prices['packs']['email']['emails'] ) ? number_format( (int) $prices['packs']['email']['emails'] ) : '',
			'emailPackPrice'   => isset( $prices['packs']['email']['price'] ) ? anypress_io_money( (float) $prices['packs']['email']['price'] ) : '',
			'storagePackGb'    => $prices['packs']['storage']['gb'] ?? '',
			'storagePackPrice' => isset( $prices['packs']['storage']['monthly'] ) ? anypress_io_money( (float) $prices['packs']['storage']['monthly'] ) : '',
			default            => '',
		};
		return esc_html( (string) $value );
	}
);

add_shortcode(
	'anypress_example',
	static fn( $atts ): string => anypress_io_example_html( 'reseller' === ( shortcode_atts( array( 'kind' => 'seller' ), $atts, 'anypress_example' )['kind'] ) ? 'reseller' : 'seller' )
);

/** Minutes of care as words, as anypress.io writes them: "30 minutes", "1 hour", "2 hours", "1 hour 30 minutes". */
function anypress_io_care_time( int $minutes ): string {
	$hours = intdiv( $minutes, 60 );
	$rest  = $minutes % 60;
	$parts = array();
	if ( $hours ) {
		$parts[] = $hours . ( 1 === $hours ? ' hour' : ' hours' );
	}
	if ( $rest ) {
		$parts[] = $rest . ( 1 === $rest ? ' minute' : ' minutes' );
	}
	return implode( ' ', $parts );
}

add_shortcode(
	'anypress_care',
	static function ( $atts ): string {
		$atts  = shortcode_atts(
			array(
				'item' => '',
				'show' => 'monthly',
			),
			$atts,
			'anypress_care'
		);
		$care  = (array) ( anypress_io_pricing()['care'] ?? array() );
		$found = null;
		foreach ( array_merge( (array) ( $care['packages'] ?? array() ), (array) ( $care['services'] ?? array() ) ) as $row ) {
			if ( ( $row['key'] ?? '' ) === $atts['item'] ) {
				$found = $row;
			}
		}
		if ( ! $found ) {
			return '';
		}
		$value = match ( $atts['show'] ) {
			'monthly', 'yearly', 'price' => isset( $found[ $atts['show'] ] ) ? anypress_io_money( (float) $found[ $atts['show'] ] ) : '',
			'time'                       => anypress_io_care_time( (int) ( $found['minutes'] ?? 0 ) ),
			'answer', 'name'             => (string) ( $found[ $atts['show'] ] ?? '' ),
			default                      => '',
		};
		return esc_html( $value );
	}
);

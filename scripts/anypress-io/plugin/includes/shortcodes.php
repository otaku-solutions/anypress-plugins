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
 *   [anypress_volume_tiers]                                  the volume savings, one line per level
 *   [anypress_example kind="seller" price="49"]              a year of selling Small Website sites at $49
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
	'anypress_volume_tiers',
	static function (): string {
		$tiers = array_values( (array) ( anypress_io_pricing()['volumeTiers'] ?? array() ) );
		if ( ! $tiers ) {
			return '';
		}
		$rows = array( array( '0%', sprintf( '1 to %d sites', (int) $tiers[0]['sites'] - 1 ) ) );
		foreach ( $tiers as $i => $tier ) {
			$next   = $tiers[ $i + 1 ] ?? null;
			$rows[] = array(
				sprintf( '%s%% off', $tier['percent'] ),
				$next ? sprintf( '%d to %d sites', $tier['sites'], (int) $next['sites'] - 1 ) : sprintf( '%d+ sites', $tier['sites'] ),
			);
		}
		// Block themes render the page before wp_head, so this prints in the head, only on pages with the list.
		wp_register_style( 'anypress-io-tiers', false, array(), ANYPRESS_IO_VERSION );
		wp_add_inline_style( 'anypress-io-tiers', '.anypress-io-tiers{list-style:none;padding:0;margin-inline:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:var(--wp--preset--spacing--medium);max-width:56rem}.anypress-io-tiers li{display:flex;flex-direction:column;align-items:center;gap:.25em;padding:var(--wp--preset--spacing--medium);border:1.5px solid var(--wp--preset--color--main);border-radius:10px;background:var(--wp--preset--color--base)}.anypress-io-tiers b{font-family:var(--wp--preset--font-family--heading,inherit);font-size:var(--wp--preset--font-size--x-large);line-height:1.2;white-space:nowrap}' );
		wp_enqueue_style( 'anypress-io-tiers' );
		$out = '<ul class="anypress-io-tiers">';
		foreach ( $rows as [ $off, $sites ] ) {
			$out .= '<li><b>' . esc_html( $off ) . '</b><span>' . esc_html( $sites ) . '</span></li>';
		}
		return $out . '</ul>';
	}
);

/**
 * A worked example as a core Table block in the theme's Comparison style, rendered as a block so the table's styles
 * load with it: rows of cells, the first and last column in bold.
 */
function anypress_io_example_table( array $head, array $rows ): string {
	$out = '<!-- wp:table {"className":"is-style-comparison"} --><figure class="wp-block-table is-style-comparison"><table class="has-fixed-layout"><thead><tr>';
	foreach ( $head as $cell ) {
		$out .= '<th>' . esc_html( $cell ) . '</th>';
	}
	$out .= '</tr></thead><tbody>';
	foreach ( $rows as $row ) {
		$out .= '<tr>';
		foreach ( $row as $i => $cell ) {
			$out .= '<td>' . ( count( $row ) - 1 === $i || 0 === $i ? '<strong>' . esc_html( $cell ) . '</strong>' : esc_html( $cell ) ) . '</td>';
		}
		$out .= '</tr>';
	}
	return do_blocks( $out . '</tbody></table></figure><!-- /wp:table -->' );
}

add_shortcode(
	'anypress_example',
	static function ( $atts ): string {
		$atts = shortcode_atts(
			array(
				'kind'  => 'seller',
				'price' => '49',
			),
			$atts,
			'anypress_example'
		);
		if ( 'reseller' === $atts['kind'] ) {
			// Two brands, each at the reseller's own example price.
			$brands = array(
				array( 'Brand A: sites for trades', 'website', 20, 49 ),
				array( 'Brand B: booking sites for salons', 'bookings', 10, 79 ),
			);
			$rows   = array();
			$total  = array( 0, 0.0, 0.0 );
			foreach ( $brands as [ $brand, $type, $sites, $price ] ) {
				$cost   = anypress_io_wholesale( (float) anypress_io_list_price( $type ) );
				$paid   = $sites * $price;
				$owed   = $sites * $cost;
				$rows[] = array( $brand, sprintf( '%d at %s', $sites, anypress_io_money( $price ) ), anypress_io_money( $paid ), sprintf( '%s (%s each)', anypress_io_money( $owed ), anypress_io_money( $cost ) ), anypress_io_money( $paid - $owed ) );
				$total  = array( $total[0] + $sites, $total[1] + $paid, $total[2] + $owed );
			}
			$rows[] = array( 'Every month', sprintf( '%d sites', $total[0] ), anypress_io_money( $total[1] ), anypress_io_money( $total[2] ), anypress_io_money( $total[1] - $total[2] ) );
			return anypress_io_example_table( array( '', 'Sites', 'Your customers pay you', 'You pay us', 'You keep' ), $rows );
		}
		$price = max( 1, (float) $atts['price'] );
		$list  = (float) anypress_io_list_price( 'website' );
		$rows  = array();
		foreach ( array( 1 => 1, 2 => 3, 4 => 6, 6 => 10, 9 => 18, 12 => 25 ) as $month => $sites ) {
			$cost   = round( $list * ( 100 - anypress_io_volume_percent( $sites ) ) / 100, 2 );
			$rows[] = array( "Month $month", (string) $sites, anypress_io_money( $sites * $price ), anypress_io_money( $cost ) . ' each', anypress_io_money( $sites * ( $price - $cost ) ) );
		}
		return anypress_io_example_table( array( '', 'Live sites', 'Your clients pay you', 'You pay us', 'You keep each month' ), $rows );
	}
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

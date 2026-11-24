<?php
/**
 * anypress.io's worked-out pieces, written in the same markup the site has always shown so its stylesheet lays
 * them out the same: the price, earnings and course calculators (the AnyPress Calculator block) and the two worked
 * examples on the selling pages ([anypress_example]). The numbers come from the price list; assets/site/site.js
 * works them out again in the browser as visitors pick, from the same list (anypress_io_widget_data()).
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

/** The kinds of site as the calculators show them, with their drawing and the shop's plan address. */
function anypress_io_widget_types(): array {
	$meta = array(
		'website'    => array( 'Website & blog', 'website', 'website', 175 ),
		'bookings'   => array( 'Bookings', 'bookings', 'bookings', 185 ),
		'store'      => array( 'Online store', 'online-store', 'store', 190 ),
		'community'  => array( 'Community & courses', 'community', 'courses', 200 ),
		'everything' => array( 'Everything', 'everything', 'everything', 190 ),
	);
	$out  = array();
	foreach ( anypress_io_site_types() as $type ) {
		if ( isset( $meta[ $type['id'] ] ) ) {
			[ $name, $shop, $drawing, $height ] = $meta[ $type['id'] ];
			$out[] = $type + array( 'name' => $name, 'shop' => $shop, 'drawing' => $drawing, 'ratio' => '240 / ' . $height );
		}
	}
	return $out;
}

/** What the calculators need, for site.js. */
function anypress_io_widget_data(): array {
	$prices = anypress_io_pricing();
	$times  = (array) ( $prices['sizeTimes'] ?? array() );
	return array(
		'types'     => anypress_io_widget_types(),
		'sizes'     => array(
			array( 'name' => 'Small', 'times' => (float) ( $times['small'] ?? 1 ), 'goodFor' => 'Most new sites' ),
			array( 'name' => 'Medium', 'times' => (float) ( $times['medium'] ?? 2 ), 'goodFor' => 'Busier sites' ),
			array( 'name' => 'Large', 'times' => (float) ( $times['large'] ?? 4 ), 'goodFor' => 'Big shops and communities' ),
		),
		'tiers'     => array_values( (array) ( $prices['volumeTiers'] ?? array() ) ),
		'months'    => (int) ( $prices['yearlyMonths'] ?? 10 ),
		'wholesale' => (float) ( $prices['wholesalePercent'] ?? 0 ),
		'affiliate' => (float) ( $prices['affiliatePercent'] ?? 0 ),
		'shop'      => ANYPRESS_IO_SHOP,
	);
}

/** Rounded to cents, as the site rounds. */
function anypress_io_cents( float $n ): float {
	return round( $n * 100 ) / 100;
}

/** The volume saving for this many sites, and the next tier up. */
function anypress_io_next_tier( array $tiers, int $sites ): ?array {
	foreach ( $tiers as $tier ) {
		if ( $sites < (int) $tier['sites'] ) {
			return $tier;
		}
	}
	return null;
}

/** A drawing that doesn't animate, as the calculators' buttons show them; site.js loads it. */
function anypress_io_still_drawing( array $type ): string {
	return sprintf( '<div data-drawing="%s" aria-hidden="true" class="ob  w-14" style="aspect-ratio:%s"></div>', esc_attr( $type['drawing'] ), esc_attr( $type['ratio'] ) );
}

/** A button that's picked or not. */
function anypress_io_pick_button( bool $on, string $inner, string $value ): string {
	return sprintf( '<button type="button" aria-pressed="%s" data-value="%s">%s</button>', $on ? 'true' : 'false', esc_attr( $value ), $inner );
}

/** "What will it cost?" on /pricing. */
function anypress_io_price_calc_html( array $d ): string {
	$type   = $d['types'][2] ?? $d['types'][0];
	$size   = $d['sizes'][0];
	$count  = 1;
	$list   = $type['from'] * $size['times'];
	$next   = anypress_io_next_tier( $d['tiers'], $count );
	$types  = '';
	$sizes  = '';
	$ticks  = '<span>1</span>';
	foreach ( $d['types'] as $t ) {
		$types .= anypress_io_pick_button( $t['id'] === $type['id'], anypress_io_still_drawing( $t ) . '<span>' . esc_html( $t['short'] ) . '</span>', $t['id'] );
	}
	foreach ( $d['sizes'] as $s ) {
		$sizes .= anypress_io_pick_button( $s['name'] === $size['name'], '<b>' . esc_html( $s['name'] ) . '</b><small>' . esc_html( $s['goodFor'] ) . '</small>', $s['name'] );
	}
	foreach ( $d['tiers'] as $i => $tier ) {
		$ticks .= sprintf( '<span>%d · %s%s%%</span>', (int) $tier['sites'], 0 === $i ? 'save ' : '', esc_html( (string) $tier['percent'] ) );
	}
	$ticks .= '<span>50</span>';
	$label  = 'website' === strtolower( $type['short'] ) ? 'website' : strtolower( $type['short'] ) . ' site';
	$months = 12 - $d['months'];
	return '<div class="calc" data-calc="price"><div class="calc-inputs">'
		. '<fieldset><legend>1. What are you building?</legend><div class="calc-types" data-pick="type">' . $types . '</div></fieldset>'
		. '<fieldset><legend>2. How big?</legend><div class="calc-seg" data-pick="size">' . $sizes . '</div></fieldset>'
		. '<fieldset><legend>3. How many sites? <output class="calc-count">1</output></legend><input type="range" min="1" max="50" aria-label="Number of sites" value="1"/><div class="calc-ticks" aria-hidden="true">' . $ticks . '</div></fieldset>'
		. '<fieldset><legend>4. Pay monthly or yearly?</legend><div class="calc-seg two" data-pick="yearly">' . anypress_io_pick_button( true, '<b>Monthly</b><small>Cancel any time</small>', '0' ) . anypress_io_pick_button( false, '<b>Yearly</b><small>' . esc_html( sprintf( '%d months free', $months ) ) . '</small>', '1' ) . '</div></fieldset>'
		. '</div><div class="calc-result" aria-live="polite"><span class="eyebrow">your estimate</span>'
		. '<p class="calc-big">' . esc_html( anypress_io_money( $list ) ) . '<small> / month</small></p>'
		. '<p class="calc-line">1 ' . esc_html( strtolower( $type['short'] ) ) . ' site, ' . esc_html( $size['name'] ) . ', at ' . esc_html( anypress_io_money( $list ) ) . ' each</p>'
		. ( $next ? '<p class="calc-next">' . esc_html( sprintf( '%d more %s and every site saves %s%%.', $next['sites'] - $count, 1 === $next['sites'] - $count ? 'site' : 'sites', $next['percent'] ) ) . '</p>' : '' )
		. '<a href="' . esc_url( $d['shop'] . '/item/' . $type['shop'] . '-small/' ) . '" class="btn btn-ink mt-5 w-full">Start with one ' . esc_html( $label ) . ' →</a>'
		. '<p class="calc-fine">Prices in US dollars. Savings apply when you have ' . esc_html( (string) ( $d['tiers'][0]['sites'] ?? 3 ) ) . ' or more live sites, and your existing sites move to the new price when they renew. The card company&#x27;s fee on your own sales isn&#x27;t included.</p>'
		. '</div></div>';
}

/** What a seller or reseller keeps, on /sellers and /resellers; site.js redraws the result as visitors pick. */
function anypress_io_earnings_calc_html( array $d, string $account ): string {
	$type     = $d['types'][0];
	$size     = $d['sizes'][0];
	$clients  = 10;
	$list     = $type['from'] * $size['times'];
	$min      = (int) ceil( $list );
	$price    = max( 49, $min );
	$max      = max( $min * 6, (int) ( 300 * $size['times'] ) );
	$first    = $d['tiers'][0]['percent'] ?? 0;
	$last     = $d['tiers'][ count( $d['tiers'] ) - 1 ]['percent'] ?? 0;
	$types    = '';
	$sizes    = '';
	foreach ( $d['types'] as $t ) {
		$types .= anypress_io_pick_button( $t['id'] === $type['id'], anypress_io_still_drawing( $t ) . '<span>' . esc_html( $t['short'] ) . '</span>', $t['id'] );
	}
	foreach ( $d['sizes'] as $s ) {
		$sizes .= anypress_io_pick_button( $s['name'] === $size['name'], '<b>' . esc_html( $s['name'] ) . '</b><small>' . esc_html( anypress_io_money( $type['from'] * $s['times'] ) ) . ' / month list</small>', $s['name'] );
	}
	$slider = static fn( string $label, int $lo, int $hi, int $value, string $aria, callable $format ): string => '<fieldset><legend>' . esc_html( $label ) . ' <output class="calc-count">' . esc_html( $format( $value ) ) . '</output></legend><input type="range" min="' . $lo . '" max="' . $hi . '" step="1" aria-label="' . esc_attr( $aria ) . '" value="' . $value . '"/><div class="calc-ticks" aria-hidden="true"><span>' . esc_html( $format( $lo ) ) . '</span><span>' . esc_html( $format( $hi ) ) . '</span></div></fieldset>';
	return '<div class="calc-wrap" data-calc="earnings" data-account="' . esc_attr( $account ) . '"><div class="calc"><div class="calc-inputs">'
		. '<fieldset><legend>1. How do you sell?</legend><div class="calc-seg two" data-pick="account">'
		. anypress_io_pick_button( 'seller' === $account, '<b>Seller</b><small>' . esc_html( sprintf( 'One storefront. Pay per site, %s to %s%% off as you grow.', $first, $last ) ) . '</small>', 'seller' )
		. anypress_io_pick_button( 'reseller' === $account, '<b>Reseller</b><small>' . esc_html( sprintf( 'Several brands. %s%% off every site, one monthly bill.', $d['wholesale'] ) ) . '</small>', 'reseller' )
		. '</div></fieldset>'
		. '<fieldset><legend>2. What do you sell your clients?</legend><div class="calc-types" data-pick="type">' . $types . '</div></fieldset>'
		. '<fieldset><legend>3. Size</legend><div class="calc-seg" data-pick="size">' . $sizes . '</div></fieldset>'
		. $slider( '4. How many client sites?', 1, 100, $clients, 'Number of client sites', 'strval' )
		. $slider( '5. What does each client pay you a month?', $min, $max, $price, 'Your monthly price per client', static fn( $n ) => anypress_io_money( (float) $n ) )
		. '</div>' . anypress_io_earnings_result( $d, $account, $list, $price, $clients ) . '</div></div>';
}

/** One account's numbers: what a site costs it, what it keeps on each and what it keeps a month. */
function anypress_io_earnings_figures( array $d, string $account, float $list, float $price, int $sites ): array {
	$percent = 'reseller' === $account ? $d['wholesale'] : anypress_io_volume_percent( $sites );
	$cost    = anypress_io_cents( $list * ( 100 - $percent ) / 100 );
	return array(
		'percent' => $percent,
		'cost'    => $cost,
		'perSite' => anypress_io_cents( $price - $cost ),
		'month'   => anypress_io_cents( ( $price - $cost ) * $sites ),
	);
}

/** The earnings calculator's result panel. */
function anypress_io_earnings_result( array $d, string $account, float $list, float $price, int $clients ): string {
	$seller   = anypress_io_earnings_figures( $d, 'seller', $list, $price, $clients );
	$reseller = anypress_io_earnings_figures( $d, 'reseller', $list, $price, $clients );
	$mine     = 'seller' === $account ? $seller : $reseller;
	$m        = static fn( float $n ): string => esc_html( anypress_io_money( anypress_io_cents( $n ) ) );
	$why      = 0.0 === (float) $mine['percent'] ? $m( $list ) . ' list, no volume saving below ' . (int) ( $d['tiers'][0]['sites'] ?? 3 ) . ' sites' : $m( $list ) . ' list, less ' . esc_html( (string) $mine['percent'] ) . '% ' . ( 'reseller' === $account ? 'wholesale' : 'volume saving' );
	$next     = 'seller' === $account ? anypress_io_next_tier( $d['tiers'], $clients ) : null;
	$rows     = '';
	foreach ( array( array( 'seller', 'Seller', $seller ), array( 'reseller', 'Reseller', $reseller ) ) as [ $id, $name, $f ] ) {
		$rows .= '<tr' . ( $account === $id ? ' aria-current="true"' : '' ) . '><th scope="row">' . $name . '</th><td>' . $m( $f['cost'] ) . '</td><td>' . $m( $f['month'] ) . '</td></tr>';
	}
	return '<div class="calc-result" aria-live="polite"><span class="eyebrow">what you keep as a ' . esc_html( $account ) . '</span>'
		. '<p class="calc-big">' . $m( $mine['month'] ) . '<small> / month</small></p>'
		. '<p class="calc-line">' . $m( $mine['perSite'] ) . ' on each site, ' . $m( $mine['month'] * 12 ) . ' a year.</p>'
		. '<dl class="calc-sum"><div><dt>' . esc_html( sprintf( '%d %s you %s each', $clients, 1 === $clients ? 'client pays' : 'clients pay', anypress_io_money( $price ) ) ) . '</dt><dd>' . $m( $price * $clients ) . '</dd></div>'
		. '<div><dt>You pay AnyPress ' . $m( $mine['cost'] ) . ' a site<small class="calc-why">' . $why . '</small></dt><dd>−' . $m( $mine['cost'] * $clients ) . '</dd></div>'
		. '<div class="total"><dt>You keep each month</dt><dd>' . $m( $mine['month'] ) . '</dd></div></dl>'
		. ( $next ? '<p class="calc-next">' . esc_html( sprintf( 'Reach %d sites and every site costs %s%% less.', $next['sites'], $next['percent'] ) ) . '</p>' : '' )
		. '<table class="calc-compare"><caption>Seller and reseller, at these numbers</caption><thead><tr><th scope="col"></th><th scope="col">You pay a site</th><th scope="col">You keep a month</th></tr></thead><tbody>' . $rows . '</tbody></table>'
		. '<p class="calc-fine">US dollars, before your payment company&#x27;s fees and taxes. You set your own prices and your clients pay you directly; we build, host and look after every site. Sellers&#x27; savings count all their live sites. Resellers are for running several brands, <a class="underline" href="/resellers">see how they differ</a>. Only want to recommend us? Affiliates earn ' . esc_html( (string) $d['affiliate'] ) . '% of a new customer&#x27;s first payment, <a class="underline" href="/affiliates">see affiliates</a>.</p>'
		. '</div>';
}

/** A year on a course platform next to a year on the Community plan, on /guides/courses. */
function anypress_io_course_calc_html( array $d ): string {
	$community = null;
	foreach ( $d['types'] as $t ) {
		if ( 'community' === $t['id'] ) {
			$community = $t;
		}
	}
	if ( ! $community ) {
		return '';
	}
	$input    = 'mt-1 block w-full rounded-md border border-line bg-bg px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-accent';
	$platform = 12 * ( 99 + 2000 * 5 / 100 );
	$ours     = 12 * $community['from'];
	$num      = static fn( string $label, string $field, string $step, string $value ): string => '<label class="block text-sm font-medium">' . esc_html( $label ) . '<input type="number" min="0" step="' . $step . '" class="' . $input . '" value="' . $value . '" data-field="' . $field . '"/></label>';
	$row      = static fn( string $k, float $v ): string => '<div class="flex items-center justify-between gap-6 py-4"><dt class="text-ink-soft">' . esc_html( $k ) . '</dt><dd class="font-display text-xl font-semibold">' . esc_html( anypress_io_money( anypress_io_cents( $v ) ) ) . '</dd></div>';
	return '<div class="card p-6" data-calc="course"><div class="grid gap-5 sm:grid-cols-3">'
		. $num( 'Your course sales per month ($)', 'sales', '100', '2000' ) . $num( 'Platform fee per month ($)', 'fee', '1', '99' ) . $num( 'Share of each sale it takes (%)', 'share', '0.5', '5' )
		. '</div><dl class="mt-8 divide-y divide-line border-y border-line">'
		. $row( 'Your platform, per year', $platform ) . $row( 'AnyPress ' . $community['name'] . ', per year', $ours ) . $row( 'Difference per year', $platform - $ours )
		. '</dl><p class="mt-4 text-sm text-ink-soft">Card fees apply on both and aren&#x27;t counted here. ' . esc_html( $community['name'] ) . ' starts at ' . esc_html( anypress_io_money( $community['from'] ) ) . ' a month (Small size); bigger sizes cost more.</p></div>';
}

/** The worked examples on /sellers (a year of selling) and /resellers (two brands on one bill). */
function anypress_io_example_html( string $kind ): string {
	$d     = anypress_io_widget_data();
	$m     = static fn( float $n ): string => esc_html( anypress_io_money( anypress_io_cents( $n ) ) );
	$table = static function ( string $label, array $head, array $rows ): string {
		$out = '<div class="compare"><div class="tablewrap" tabindex="0" role="region" aria-label="' . esc_attr( $label ) . '"><table><thead><tr><th scope="col"><span class="sr-only">' . esc_html( $label ) . '</span></th>';
		foreach ( $head as $h ) {
			$out .= '<th scope="col">' . esc_html( $h ) . '</th>';
		}
		$out .= '</tr></thead><tbody>';
		foreach ( $rows as $row ) {
			$out .= '<tr><th scope="row">' . array_shift( $row ) . '</th><td>' . implode( '</td><td>', $row ) . '</td></tr>';
		}
		return $out . '</tbody></table></div></div>';
	};
	$from  = array_column( $d['types'], 'from', 'id' );
	if ( 'reseller' === $kind ) {
		$rows  = array();
		$total = array( 0, 0.0, 0.0 );
		foreach ( array( array( 'Brand A: sites for trades', 'website', 20, 49 ), array( 'Brand B: booking sites for salons', 'bookings', 10, 79 ) ) as [ $brand, $id, $sites, $price ] ) {
			$cost   = anypress_io_cents( (float) ( $from[ $id ] ?? 0 ) * ( 100 - $d['wholesale'] ) / 100 );
			$rows[] = array( esc_html( $brand ), $sites . ' at ' . $m( $price ), $m( $sites * $price ), $m( $sites * $cost ) . ' (' . $m( $cost ) . ' each)', $m( $sites * $price - $sites * $cost ) );
			$total  = array( $total[0] + $sites, $total[1] + $sites * $price, $total[2] + $sites * $cost );
		}
		$rows[] = array( '<b>Every month</b>', $total[0] . ' sites', $m( $total[1] ), $m( $total[2] ), '<b>' . $m( $total[1] - $total[2] ) . '</b>' );
		return $table( 'Two brands on one wholesale bill', array( 'Sites', 'Your customers pay you', 'You pay us', 'You keep' ), $rows );
	}
	$rows = array();
	foreach ( array( 1 => 1, 2 => 3, 4 => 6, 6 => 10, 9 => 18, 12 => 25 ) as $month => $sites ) {
		$cost   = (float) ( $from['website'] ?? 0 ) * ( 100 - anypress_io_volume_percent( $sites ) ) / 100;
		$rows[] = array( 'Month ' . $month, (string) $sites, $m( $sites * 49 ), $m( $cost ) . ' each', '<b>' . $m( $sites * ( 49 - $cost ) ) . '</b>' );
	}
	return $table( 'A year of selling Website sites', array( 'Live sites', 'Your clients pay you', 'You pay us', 'You keep each month' ), $rows );
}

// site.js works the calculators out again from the same price list.
add_action(
	'wp_enqueue_scripts',
	static function () {
		wp_add_inline_script( 'anypress-io-site', 'window.anypressIoPrices=' . wp_json_encode( anypress_io_widget_data() ) . ';', 'before' );
	},
	6
);

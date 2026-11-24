<?php
/**
 * AnyPress Calculator: the price, earnings or course calculator. The prices come from the live price list
 * (anypress_io_pricing()); view.js (store anypress-io/calculator) works out the numbers as the visitor picks.
 *
 * @package AnyPress_IO
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_io_prices = anypress_io_pricing();
$anypress_io_types  = anypress_io_site_types();
if ( ! $anypress_io_types ) {
	return;
}
$anypress_io_kind  = in_array( $attributes['kind'] ?? 'price', array( 'price', 'earnings', 'course' ), true ) ? $attributes['kind'] : 'price';
$anypress_io_times = (array) ( $anypress_io_prices['sizeTimes'] ?? array() );
$anypress_io_sizes = array(
	array( 'name' => 'Small', 'times' => (float) ( $anypress_io_times['small'] ?? 1 ), 'goodFor' => __( 'Most new sites', 'anypress-io' ) ),
	array( 'name' => 'Medium', 'times' => (float) ( $anypress_io_times['medium'] ?? 2 ), 'goodFor' => __( 'Busier sites', 'anypress-io' ) ),
	array( 'name' => 'Large', 'times' => (float) ( $anypress_io_times['large'] ?? 4 ), 'goodFor' => __( 'Big shops and communities', 'anypress-io' ) ),
);
$anypress_io_drawing = static function ( string $id ): string {
	$file = 'store' === $id ? 'store' : ( 'community' === $id ? 'courses' : $id );
	return plugins_url( 'assets/drawings/' . $file . '.svg', dirname( __DIR__, 2 ) . '/anypress-io.php' );
};
$anypress_io_context = array(
	'kind'      => $anypress_io_kind,
	'types'     => $anypress_io_types,
	'sizes'     => $anypress_io_sizes,
	'tiers'     => $anypress_io_prices['volumeTiers'] ?? array(),
	'months'    => (int) ( $anypress_io_prices['yearlyMonths'] ?? 10 ),
	'wholesale' => (float) ( $anypress_io_prices['wholesalePercent'] ?? 0 ),
	'affiliate' => (float) ( $anypress_io_prices['affiliatePercent'] ?? 0 ),
	'shop'      => ANYPRESS_IO_SHOP,
	'type'      => 'price' === $anypress_io_kind ? 'store' : 'website',
	'size'      => 'Small',
	'count'     => 'earnings' === $anypress_io_kind ? 10 : 1,
	'yearly'    => false,
	'account'   => 'reseller' === ( $attributes['start'] ?? 'seller' ) ? 'reseller' : 'seller',
	'charge'    => 49,
	'sales'     => 2000,
	'fee'       => 99,
	'share'     => 5,
	'out'       => array(
		'planLabel' => __( 'See the plans', 'anypress-io' ),
		'planUrl'   => ANYPRESS_IO_SHOP . '/plans/',
	),
);
$anypress_io_wrapper = get_block_wrapper_attributes(
	array(
		'class'               => 'is-' . $anypress_io_kind,
		'data-wp-interactive' => 'anypress-io/calculator',
		'data-wp-context'     => wp_json_encode( $anypress_io_context ),
		'data-wp-init'        => 'callbacks.setUp',
	)
);
$anypress_io_pick = static function ( string $field, string $value, string $inner ): string {
	return sprintf(
		'<button type="button" data-wp-context="%1$s" data-wp-on--click="actions.pick" data-wp-bind--aria-pressed="state.picked" aria-pressed="false">%2$s</button>',
		esc_attr( wp_json_encode( array( 'field' => $field, 'value' => $value ) ) ),
		$inner
	);
};
$anypress_io_type_buttons = '';
foreach ( $anypress_io_types as $anypress_io_type ) {
	$anypress_io_type_buttons .= $anypress_io_pick( 'type', $anypress_io_type['id'], '<img src="' . esc_url( $anypress_io_drawing( $anypress_io_type['id'] ) ) . '" alt="" width="56" height="56" loading="lazy"><span>' . esc_html( $anypress_io_type['short'] ) . '</span>' );
}
?>
<div <?php echo $anypress_io_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
<?php if ( 'course' === $anypress_io_kind ) : ?>
	<div class="anypress-calc-course">
		<div class="anypress-calc-fields">
			<label><?php esc_html_e( 'Your course sales per month ($)', 'anypress-io' ); ?><input type="number" min="0" step="100" value="2000" data-field="sales" data-wp-on--input="actions.number"></label>
			<label><?php esc_html_e( 'Platform fee per month ($)', 'anypress-io' ); ?><input type="number" min="0" step="1" value="99" data-field="fee" data-wp-on--input="actions.number"></label>
			<label><?php esc_html_e( 'Share of each sale it takes (%)', 'anypress-io' ); ?><input type="number" min="0" step="0.5" value="5" data-field="share" data-wp-on--input="actions.number"></label>
		</div>
		<dl class="anypress-calc-rows" aria-live="polite">
			<div><dt><?php esc_html_e( 'Your platform, per year', 'anypress-io' ); ?></dt><dd data-wp-text="context.out.platform"></dd></div>
			<div><dt data-wp-text="context.out.oursLabel"></dt><dd data-wp-text="context.out.ours"></dd></div>
			<div><dt><?php esc_html_e( 'Difference per year', 'anypress-io' ); ?></dt><dd data-wp-text="context.out.difference"></dd></div>
		</dl>
		<p class="anypress-calc-fine" data-wp-text="context.out.fine"></p>
	</div>
<?php else : ?>
	<div class="anypress-calc">
		<div class="anypress-calc-inputs">
		<?php if ( 'earnings' === $anypress_io_kind ) : ?>
			<fieldset>
				<legend><?php esc_html_e( '1. How do you sell?', 'anypress-io' ); ?></legend>
				<div class="anypress-calc-seg two">
					<?php
					echo $anypress_io_pick( 'account', 'seller', '<b>' . esc_html__( 'Seller', 'anypress-io' ) . '</b><small data-wp-text="context.out.sellerNote"></small>' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts.
					echo $anypress_io_pick( 'account', 'reseller', '<b>' . esc_html__( 'Reseller', 'anypress-io' ) . '</b><small data-wp-text="context.out.resellerNote"></small>' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts.
					?>
				</div>
			</fieldset>
			<fieldset>
				<legend><?php esc_html_e( '2. What do you sell your clients?', 'anypress-io' ); ?></legend>
				<div class="anypress-calc-types"><?php echo $anypress_io_type_buttons; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts. ?></div>
			</fieldset>
			<fieldset>
				<legend><?php esc_html_e( '3. Size', 'anypress-io' ); ?></legend>
				<div class="anypress-calc-seg">
				<?php foreach ( $anypress_io_sizes as $anypress_io_size ) : ?>
					<?php echo $anypress_io_pick( 'size', $anypress_io_size['name'], '<b>' . esc_html( $anypress_io_size['name'] ) . '</b><small data-wp-text="state.sizeNote"></small>' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts. ?>
				<?php endforeach; ?>
				</div>
			</fieldset>
			<fieldset>
				<legend><?php esc_html_e( '4. How many client sites?', 'anypress-io' ); ?> <output class="anypress-calc-count" data-wp-text="context.count"></output></legend>
				<input type="range" min="1" max="100" value="10" data-field="count" data-wp-bind--value="context.count" data-wp-on--input="actions.number" aria-label="<?php esc_attr_e( 'Number of client sites', 'anypress-io' ); ?>">
				<div class="anypress-calc-ticks" aria-hidden="true"><span>1</span><span>100</span></div>
			</fieldset>
			<fieldset>
				<legend><?php esc_html_e( '5. What does each client pay you a month?', 'anypress-io' ); ?> <output class="anypress-calc-count" data-wp-text="context.out.price"></output></legend>
				<input type="range" step="1" data-field="charge" data-wp-bind--min="context.out.min" data-wp-bind--max="context.out.max" data-wp-bind--value="context.out.priceValue" data-wp-on--input="actions.number" aria-label="<?php esc_attr_e( 'Your monthly price per client', 'anypress-io' ); ?>">
				<div class="anypress-calc-ticks" aria-hidden="true"><span data-wp-text="context.out.minText"></span><span data-wp-text="context.out.maxText"></span></div>
			</fieldset>
		<?php else : ?>
			<fieldset>
				<legend><?php esc_html_e( '1. What are you building?', 'anypress-io' ); ?></legend>
				<div class="anypress-calc-types"><?php echo $anypress_io_type_buttons; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts. ?></div>
			</fieldset>
			<fieldset>
				<legend><?php esc_html_e( '2. How big?', 'anypress-io' ); ?></legend>
				<div class="anypress-calc-seg">
				<?php foreach ( $anypress_io_sizes as $anypress_io_size ) : ?>
					<?php echo $anypress_io_pick( 'size', $anypress_io_size['name'], '<b>' . esc_html( $anypress_io_size['name'] ) . '</b><small>' . esc_html( $anypress_io_size['goodFor'] ) . '</small>' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts. ?>
				<?php endforeach; ?>
				</div>
			</fieldset>
			<fieldset>
				<legend><?php esc_html_e( '3. How many sites?', 'anypress-io' ); ?> <output class="anypress-calc-count" data-wp-text="context.count">1</output></legend>
				<input type="range" min="1" max="50" value="1" data-field="count" data-wp-bind--value="context.count" data-wp-on--input="actions.number" aria-label="<?php esc_attr_e( 'Number of sites', 'anypress-io' ); ?>">
				<div class="anypress-calc-ticks" aria-hidden="true">
					<span>1</span>
					<?php foreach ( $anypress_io_context['tiers'] as $anypress_io_i => $anypress_io_tier ) : ?>
					<span><?php echo esc_html( $anypress_io_tier['sites'] . ' · ' . ( 0 === $anypress_io_i ? __( 'save ', 'anypress-io' ) : '' ) . $anypress_io_tier['percent'] . '%' ); ?></span>
					<?php endforeach; ?>
					<span>50</span>
				</div>
			</fieldset>
			<fieldset>
				<legend><?php esc_html_e( '4. Pay monthly or yearly?', 'anypress-io' ); ?></legend>
				<div class="anypress-calc-seg two">
					<?php
					echo $anypress_io_pick( 'yearly', 'no', '<b>' . esc_html__( 'Monthly', 'anypress-io' ) . '</b><small>' . esc_html__( 'Cancel any time', 'anypress-io' ) . '</small>' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts.
					/* translators: %d: months free when paying yearly. */
					echo $anypress_io_pick( 'yearly', 'yes', '<b>' . esc_html__( 'Yearly', 'anypress-io' ) . '</b><small>' . esc_html( sprintf( __( '%d months free', 'anypress-io' ), 12 - $anypress_io_context['months'] ) ) . '</small>' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts.
					?>
				</div>
			</fieldset>
		<?php endif; ?>
		</div>
		<div class="anypress-calc-result" aria-live="polite">
			<span class="anypress-calc-eyebrow" data-wp-text="context.out.eyebrow"></span>
			<p class="anypress-calc-big"><span data-wp-text="context.out.big"></span><small data-wp-text="context.out.per"></small></p>
			<p class="anypress-calc-line" data-wp-text="context.out.line"></p>
		<?php if ( 'earnings' === $anypress_io_kind ) : ?>
			<dl class="anypress-calc-sum">
				<div><dt data-wp-text="context.out.paysLabel"></dt><dd data-wp-text="context.out.pays"></dd></div>
				<div><dt><span data-wp-text="context.out.costLabel"></span><small data-wp-text="context.out.why"></small></dt><dd data-wp-text="context.out.cost"></dd></div>
				<div class="total"><dt><?php esc_html_e( 'You keep each month', 'anypress-io' ); ?></dt><dd data-wp-text="context.out.big"></dd></div>
			</dl>
			<p class="anypress-calc-next" data-wp-bind--hidden="!context.out.next" data-wp-text="context.out.next"></p>
			<table class="anypress-calc-compare">
				<caption><?php esc_html_e( 'Seller and reseller, at these numbers', 'anypress-io' ); ?></caption>
				<thead><tr><th scope="col"></th><th scope="col"><?php esc_html_e( 'You pay a site', 'anypress-io' ); ?></th><th scope="col"><?php esc_html_e( 'You keep a month', 'anypress-io' ); ?></th></tr></thead>
				<tbody>
					<tr data-wp-bind--aria-current="context.out.sellerCurrent"><th scope="row"><?php esc_html_e( 'Seller', 'anypress-io' ); ?></th><td data-wp-text="context.out.sellerCost"></td><td data-wp-text="context.out.sellerMonth"></td></tr>
					<tr data-wp-bind--aria-current="context.out.resellerCurrent"><th scope="row"><?php esc_html_e( 'Reseller', 'anypress-io' ); ?></th><td data-wp-text="context.out.resellerCost"></td><td data-wp-text="context.out.resellerMonth"></td></tr>
				</tbody>
			</table>
			<p class="anypress-calc-fine"><span data-wp-text="context.out.fine"></span> <a href="/resellers"><?php esc_html_e( 'See how they differ', 'anypress-io' ); ?></a>. <span data-wp-text="context.out.affiliateLine"></span> <a href="/affiliates"><?php esc_html_e( 'See affiliates', 'anypress-io' ); ?></a>.</p>
		<?php else : ?>
			<p class="anypress-calc-save" data-wp-bind--hidden="!context.out.save" data-wp-text="context.out.save"></p>
			<p class="anypress-calc-next" data-wp-bind--hidden="!context.out.next" data-wp-text="context.out.next"></p>
			<a class="wp-element-button anypress-calc-go" data-wp-bind--href="context.out.planUrl" data-wp-text="context.out.planLabel" href="<?php echo esc_url( ANYPRESS_IO_SHOP . '/plans/' ); ?>"></a>
			<p class="anypress-calc-fine"><?php esc_html_e( 'Prices in US dollars. Savings apply when you have 3 or more live sites, and your existing sites move to the new price when they renew. The card company\'s fee on your own sales isn\'t included.', 'anypress-io' ); ?></p>
		<?php endif; ?>
		</div>
	</div>
<?php endif; ?>
</div>

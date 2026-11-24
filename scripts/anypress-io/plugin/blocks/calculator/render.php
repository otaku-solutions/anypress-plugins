<?php
/**
 * AnyPress Calculator: the price, earnings or course calculator, drawn by includes/widgets.php in anypress.io's own
 * markup from the live price list; assets/site/site.js works the numbers out as the visitor picks.
 *
 * @package AnyPress_IO
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_io_data = anypress_io_widget_data();
if ( ! $anypress_io_data['types'] ) {
	return;
}
$anypress_io_kind = $attributes['kind'] ?? 'price';
if ( 'earnings' === $anypress_io_kind ) {
	echo anypress_io_earnings_calc_html( $anypress_io_data, 'reseller' === ( $attributes['start'] ?? 'seller' ) ? 'reseller' : 'seller' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped as it's built.
} elseif ( 'course' === $anypress_io_kind ) {
	echo anypress_io_course_calc_html( $anypress_io_data ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped as it's built.
} else {
	echo anypress_io_price_calc_html( $anypress_io_data ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped as it's built.
}

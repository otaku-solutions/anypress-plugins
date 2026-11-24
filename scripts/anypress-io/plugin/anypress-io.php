<?php
/**
 * Plugin Name:       AnyPress Site
 * Description:       Pieces only anypress.io uses: the price, earnings and course calculators, the Try It page, the What's New list, each page's search and share details, its colours and fonts in Styles, its sections as patterns, its forms sending sign-ups to the shop's customer list, and the seller application to the AnyPress API.
 * Version:           0.3.0
 * Requires at least: 7.1
 * Requires PHP:      8.3
 * Author:            AnyPress
 * Author URI:        https://anypress.io
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       anypress-io
 *
 * Runs as a must-use plugin (wp-content/mu-plugins/anypress-io/, loaded by mu-plugins/anypress-io.php): AnyPress Client
 * keeps a website store to its site type's plugins and would turn an ordinary plugin off. See ../README.md.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

define( 'ANYPRESS_IO_VERSION', '0.3.0' );
define( 'ANYPRESS_IO_SHOP', 'https://shop.anypress.io' );

require __DIR__ . '/includes/pricing.php';
require __DIR__ . '/includes/lead.php';
require __DIR__ . '/includes/application.php';
require __DIR__ . '/includes/demo.php';
require __DIR__ . '/includes/shortcodes.php';
require __DIR__ . '/includes/look.php';
require __DIR__ . '/includes/widgets.php';
require __DIR__ . '/includes/changelog.php';
require __DIR__ . '/includes/seo.php';
require __DIR__ . '/includes/settings.php';
require __DIR__ . '/includes/patterns.php';

add_action(
	'init',
	static function () {
		register_block_type( __DIR__ . '/blocks/calculator' );
		register_block_type( __DIR__ . '/blocks/try' );
		register_block_type( __DIR__ . '/blocks/changelog' );
	}
);

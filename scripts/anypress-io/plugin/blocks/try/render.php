<?php
/**
 * AnyPress Try It: the whole screen, with AnyPress's bar on top and the demo under it. Which demo opens comes from the
 * page's link (?type=, ?demo=, ?blueprint=&title=, ?for=), read by view.js, so the page itself is the same for every
 * visitor. view.js starts WordPress Playground (demo.anypress.site's own build, without Playground's bar) in the
 * iframe, shows our own loading screen, and runs Make This My Site through this site's anypress-io/v1/demo routes.
 *
 * @package AnyPress_IO
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_io_try_shop = trailingslashit( ANYPRESS_IO_SHOP ) . 'item/';
// The site types on the bar, in the site's order. Each opens the blueprint a new store of that type starts from
// (anypress-api templates/anypress-store/playground/<blueprint>.json); "store" is the template's "online-store".
$anypress_io_try_types = array(
	'website'    => array( __( 'Website', 'anypress-io' ), __( 'Website', 'anypress-io' ), 'website' ),
	'bookings'   => array( __( 'Bookings Site', 'anypress-io' ), __( 'Bookings', 'anypress-io' ), 'bookings' ),
	'store'      => array( __( 'Online Store', 'anypress-io' ), __( 'Online Store', 'anypress-io' ), 'online-store' ),
	'community'  => array( __( 'Community Site', 'anypress-io' ), __( 'Community', 'anypress-io' ), 'community' ),
	'everything' => array( __( 'Everything Site', 'anypress-io' ), __( 'Everything', 'anypress-io' ), 'everything' ),
	'highlevel'  => array( __( 'HighLevel Site', 'anypress-io' ), __( 'HighLevel', 'anypress-io' ), 'highlevel' ),
);
$anypress_io_try_config = array(
	'raw'      => 'https://raw.githubusercontent.com/otaku-solutions/',
	'remote'   => 'https://demo.anypress.site/remote.html',
	'client'   => 'https://demo.anypress.site/client/index.js',
	'rest'     => esc_url_raw( rest_url( 'anypress-io/v1/demo/' ) ),
	'nonce'    => wp_create_nonce( 'wp_rest' ),
	'types'    => array(),
	// Industry demos: a site type set up for one trade (the template's playground/<blueprint>-<demo>.json).
	'demos'    => array(
		'law-office' => array(
			'name' => __( 'Law Office', 'anypress-io' ),
			'type' => 'bookings',
		),
	),
	'lines'    => array(
		'always'     => array(
			__( 'Starting WordPress in your browser', 'anypress-io' ),
			__( 'Nothing to install: it all runs on this page', 'anypress-io' ),
			__( 'Adding the design and the tools for this site', 'anypress-io' ),
			__( 'Switching on the plugins this site comes with', 'anypress-io' ),
			__( 'Loading sample data so every screen has something to show', 'anypress-io' ),
			__( 'Filling in months of history, so it feels lived in', 'anypress-io' ),
			__( 'Writing six months of blog posts', 'anypress-io' ),
			__( 'Sending past newsletters to the mailing list', 'anypress-io' ),
			__( 'Adding contacts to the CRM', 'anypress-io' ),
			__( 'Filling in a few form entries', 'anypress-io' ),
			__( 'Setting up the pages and the menu', 'anypress-io' ),
			__( 'Putting the kettle on', 'anypress-io' ),
		),
		'website'    => array( __( 'Planning the next newsletter', 'anypress-io' ), __( 'Lining up a sponsored post', 'anypress-io' ) ),
		'bookings'   => array( __( 'Booking three months of sessions', 'anypress-io' ), __( 'Filling the calendar for the next two weeks', 'anypress-io' ), __( 'Taking payment for paid sessions', 'anypress-io' ) ),
		'store'      => array( __( 'Taking six months of orders', 'anypress-io' ), __( 'Stocking the shop with real products', 'anypress-io' ), __( 'Packing a few parcels', 'anypress-io' ) ),
		'community'  => array( __( 'Bringing in members, posts and comments', 'anypress-io' ), __( 'Opening the course and its lessons', 'anypress-io' ), __( 'Signing up the first members', 'anypress-io' ) ),
		'everything' => array( __( 'Taking orders, bookings and members', 'anypress-io' ), __( 'Opening the course and its lessons', 'anypress-io' ), __( 'Booking a few sessions', 'anypress-io' ) ),
		'highlevel'  => array( __( 'Building the business’s pages', 'anypress-io' ), __( 'Connecting the contact forms', 'anypress-io' ) ),
	),
	'words'    => array(
		'example'   => __( 'Example site', 'anypress-io' ),
		'running'   => __( '%s, running in your browser', 'anypress-io' ),
		'keep'      => __( 'Make This My Site', 'anypress-io' ),
		'saving'    => __( 'Saving your site…', 'anypress-io' ),
		'saveError' => __( 'We couldn’t save your demo. Please try again.', 'anypress-io' ),
		'noteKeep'  => __( 'This demo runs in your browser and isn’t saved. Closing this tab clears it, and the same link starts a fresh one. To keep your changes, click Make This My Site.', 'anypress-io' ),
		'note'      => __( 'This demo runs in your browser and isn’t saved. Closing this tab clears it, and the same link starts a fresh one.', 'anypress-io' ),
		'slow'      => __( 'Still going. On a slower computer it can take up to two minutes.', 'anypress-io' ),
		'building'  => __( 'We’re building a real WordPress site in your browser, full of sample data, so you can click through everything.', 'anypress-io' ),
	),
	'pricing'  => home_url( '/pricing/' ),
);
foreach ( $anypress_io_try_types as $anypress_io_try_id => [ $anypress_io_try_name, $anypress_io_try_short, $anypress_io_try_blueprint ] ) {
	$anypress_io_try_config['types'][ $anypress_io_try_id ] = array(
		'name'      => $anypress_io_try_name,
		'short'     => $anypress_io_try_short,
		'blueprint' => $anypress_io_try_blueprint,
		// The shop's Small plan page for the type, where the saved demo goes to checkout.
		'buy'       => 'highlevel' === $anypress_io_try_id ? home_url( '/highlevel/' ) : $anypress_io_try_shop . $anypress_io_try_blueprint . '-small/',
	);
}

$anypress_io_try_wrapper = get_block_wrapper_attributes(
	array(
		'data-config' => wp_json_encode( $anypress_io_try_config ),
	)
);
?>
<div <?php echo $anypress_io_try_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<header class="wp-block-anypress-io-try__bar">
		<div class="wp-block-anypress-io-try__row">
			<a class="wp-block-anypress-io-try__home" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'AnyPress home', 'anypress-io' ); ?>">
				<svg viewBox="0 0 100 100" width="28" height="28" aria-hidden="true" focusable="false"><defs><linearGradient id="anypress-try-l" x1="8" y1="80" x2="66" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB338"/><stop offset=".55" stop-color="#FF7A2A"/><stop offset="1" stop-color="#F2413A"/></linearGradient><linearGradient id="anypress-try-r" x1="56" y1="14" x2="86" y2="86" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF5A33"/><stop offset=".5" stop-color="#EE2F5E"/><stop offset="1" stop-color="#D21FA4"/></linearGradient><linearGradient id="anypress-try-t" x1="8" y1="78" x2="44" y2="72" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFC75A"/><stop offset="1" stop-color="#FF9A30"/></linearGradient></defs><path d="M48.5 17.5 Q51 14 55 15 L56 27 L50.5 48 L62.3 48 L66.2 59 L48 64 L44 77.5 L20 77.5 Q16 77.5 18.5 75 Q28 68 32 58 Z" fill="url(#anypress-try-l)"/><path d="M20 77.5 Q16 77.5 18.5 75 Q24 71 30 70 Q36 72 44 77.5 Z" fill="url(#anypress-try-t)"/><path d="M51 15 L62 15 Q65.5 15 66.8 18.5 L90 80 Q91.5 84 87.5 84 L77.5 84 Q75 84 74 81.5 L55 27 Z" fill="url(#anypress-try-r)"/><path d="M51 15 L55 27 L56.8 32 L52.6 24 Z" fill="#7A0F3A" opacity=".35"/></svg>
			</a>
			<nav class="wp-block-anypress-io-try__types" aria-label="<?php esc_attr_e( 'Site type', 'anypress-io' ); ?>" hidden></nav>
			<p class="wp-block-anypress-io-try__title" hidden></p>
			<div class="wp-block-anypress-io-try__actions">
				<p class="wp-block-anypress-io-try__error" role="alert" hidden></p>
				<button type="button" class="wp-block-anypress-io-try__keep wp-element-button" hidden><?php esc_html_e( 'Make This My Site', 'anypress-io' ); ?></button>
				<a class="wp-block-anypress-io-try__get wp-element-button" href="<?php echo esc_url( home_url( '/pricing/' ) ); ?>"><?php esc_html_e( 'Get This Site', 'anypress-io' ); ?></a>
			</div>
		</div>
		<p class="wp-block-anypress-io-try__note"></p>
	</header>
	<div class="wp-block-anypress-io-try__stage">
		<iframe class="wp-block-anypress-io-try__frame" title="<?php esc_attr_e( 'Demo site, running in your browser', 'anypress-io' ); ?>"></iframe>
		<div class="wp-block-anypress-io-try__status" role="status" aria-live="polite">
			<div class="wp-block-anypress-io-try__starting">
				<svg class="wp-block-anypress-io-try__mark" viewBox="0 0 100 100" width="48" height="48" aria-hidden="true" focusable="false"><path d="M48.5 17.5 Q51 14 55 15 L56 27 L50.5 48 L62.3 48 L66.2 59 L48 64 L44 77.5 L20 77.5 Q16 77.5 18.5 75 Q28 68 32 58 Z" fill="url(#anypress-try-l)"/><path d="M20 77.5 Q16 77.5 18.5 75 Q24 71 30 70 Q36 72 44 77.5 Z" fill="url(#anypress-try-t)"/><path d="M51 15 L62 15 Q65.5 15 66.8 18.5 L90 80 Q91.5 84 87.5 84 L77.5 84 Q75 84 74 81.5 L55 27 Z" fill="url(#anypress-try-r)"/></svg>
				<p class="wp-block-anypress-io-try__heading"><?php esc_html_e( 'Hang tight, this takes about a minute', 'anypress-io' ); ?></p>
				<p class="wp-block-anypress-io-try__line"><?php esc_html_e( 'Starting WordPress in your browser', 'anypress-io' ); ?>…</p>
				<div class="wp-block-anypress-io-try__track"><div class="wp-block-anypress-io-try__fill"></div></div>
				<p class="wp-block-anypress-io-try__more"><?php esc_html_e( 'We’re building a real WordPress site in your browser, full of sample data, so you can click through everything.', 'anypress-io' ); ?></p>
				<noscript><p><?php esc_html_e( 'The demo runs in your browser, so it needs JavaScript switched on.', 'anypress-io' ); ?></p></noscript>
			</div>
			<div class="wp-block-anypress-io-try__failed" hidden>
				<p class="wp-block-anypress-io-try__heading"><?php esc_html_e( 'This demo didn’t start.', 'anypress-io' ); ?></p>
				<p><?php esc_html_e( 'It runs in your browser, so a private window or a blocked site can stop it. Try once more.', 'anypress-io' ); ?></p>
				<button type="button" class="wp-block-anypress-io-try__retry wp-element-button"><?php esc_html_e( 'Try again', 'anypress-io' ); ?></button>
			</div>
			<div class="wp-block-anypress-io-try__gone" hidden>
				<p><?php esc_html_e( 'This demo link isn’t ready yet, or it has ended.', 'anypress-io' ); ?> <a href="<?php echo esc_url( add_query_arg( 'type', 'website', get_permalink() ) ); ?>"><?php esc_html_e( 'Try AnyPress here', 'anypress-io' ); ?></a>.</p>
			</div>
		</div>
	</div>
</div>

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
		'building'  => __( 'We\'re building a real WordPress site in your browser, full of sample data, so you can click through everything.', 'anypress-io' ),
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

// The AnyPress mark, as anypress.io draws it; each copy gets its own gradient ids.
$anypress_io_try_logo = static function ( string $id, string $classes ): string {
	$svg = '<svg viewBox="0 0 100 100" class="CLS" aria-hidden="true" focusable="false"><defs><linearGradient id="ID_l" x1="8" y1="80" x2="66" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB338"></stop><stop offset=".55" stop-color="#FF7A2A"></stop><stop offset="1" stop-color="#F2413A"></stop></linearGradient><linearGradient id="ID_r" x1="56" y1="14" x2="86" y2="86" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF5A33"></stop><stop offset=".5" stop-color="#EE2F5E"></stop><stop offset="1" stop-color="#D21FA4"></stop></linearGradient><linearGradient id="ID_t" x1="8" y1="78" x2="44" y2="72" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFC75A"></stop><stop offset="1" stop-color="#FF9A30"></stop></linearGradient></defs><path d="M48.5 17.5 Q51 14 55 15 L56 27 L50.5 48 L62.3 48 L66.2 59 L48 64 L44 77.5 L20 77.5 Q16 77.5 18.5 75 Q28 68 32 58 Z" fill="url(#ID_l)"></path><path d="M20 77.5 Q16 77.5 18.5 75 Q24 71 30 70 Q36 72 44 77.5 Z" fill="url(#ID_t)"></path><path d="M51 15 L62 15 Q65.5 15 66.8 18.5 L90 80 Q91.5 84 87.5 84 L77.5 84 Q75 84 74 81.5 L55 27 Z" fill="url(#ID_r)"></path><path d="M51 15 L55 27 L56.8 32 L52.6 24 Z" fill="#7A0F3A" opacity=".35"></path></svg>';
	return str_replace( array( 'CLS', 'ID' ), array( esc_attr( $classes ), esc_attr( $id ) ), $svg );
};

$anypress_io_try_wrapper = get_block_wrapper_attributes(
	array(
		'class'       => 'fixed inset-0 z-[60] flex flex-col bg-[var(--paper-2,#faf8f5)]',
		'data-config' => wp_json_encode( $anypress_io_try_config ),
	)
);
$anypress_io_try_btn = 'btn btn-ink shrink-0 !px-4 !py-2 text-[15px]';
?>
<div <?php echo $anypress_io_try_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<header class="wp-block-anypress-io-try__bar border-b border-[#e9e4de] bg-white">
		<div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-5">
			<a aria-label="<?php esc_attr_e( 'AnyPress home', 'anypress-io' ); ?>" class="shrink-0 rounded-md" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo $anypress_io_try_logo( 'anypress-try-a', 'h-7 w-7' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed markup, attributes escaped. ?></a>
			<nav aria-label="<?php esc_attr_e( 'Site type', 'anypress-io' ); ?>" class="wp-block-anypress-io-try__types order-last -mx-4 flex w-[calc(100%+2rem)] gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:order-none md:mx-0 md:w-auto md:flex-1 md:px-0" hidden></nav>
			<p class="wp-block-anypress-io-try__title min-w-0 flex-1 truncate text-[15px] font-bold" hidden></p>
			<div class="ml-auto flex shrink-0 items-center gap-3">
				<p role="alert" class="wp-block-anypress-io-try__error hidden max-w-[22rem] text-right text-[13px] leading-snug text-[#b4232c] lg:block" hidden></p>
				<button type="button" class="wp-block-anypress-io-try__keep <?php echo esc_attr( $anypress_io_try_btn ); ?> disabled:opacity-70" hidden><?php esc_html_e( 'Make This My Site', 'anypress-io' ); ?></button>
				<a class="wp-block-anypress-io-try__get <?php echo esc_attr( $anypress_io_try_btn ); ?>" href="<?php echo esc_url( home_url( '/pricing/' ) ); ?>"><?php esc_html_e( 'Get This Site', 'anypress-io' ); ?></a>
			</div>
		</div>
		<p role="alert" class="wp-block-anypress-io-try__error2 px-4 pb-2 text-[13px] text-[#b4232c] sm:px-5 lg:hidden" hidden></p>
		<p class="wp-block-anypress-io-try__note border-t border-[#f1ede8] bg-[#fff8ea] px-4 py-1.5 text-[13px] leading-snug text-[#5f5a55] sm:px-5"><?php echo esc_html( $anypress_io_try_config['words']['note'] ); ?></p>
	</header>
	<div class="relative flex-1">
		<iframe title="<?php esc_attr_e( 'Demo site, running in your browser', 'anypress-io' ); ?>" class="wp-block-anypress-io-try__frame absolute inset-0 h-full w-full border-0 bg-white transition-opacity duration-300 opacity-0"></iframe>
		<div class="wp-block-anypress-io-try__status absolute inset-0 flex items-center justify-center px-6" role="status" aria-live="polite">
			<div class="w-full max-w-sm text-center">
				<div class="wp-block-anypress-io-try__starting contents">
					<?php echo $anypress_io_try_logo( 'anypress-try-b', 'mx-auto h-12 w-12 motion-safe:animate-pulse' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed markup, attributes escaped. ?>
					<p class="mt-4 text-[22px] font-extrabold"><?php esc_html_e( 'Hang tight, this takes about a minute', 'anypress-io' ); ?></p>
					<p class="wp-block-anypress-io-try__line mt-2 min-h-[48px] text-[17px] text-[#3d3935] motion-safe:animate-[fadeIn_400ms_ease-out]"><?php esc_html_e( 'Starting WordPress in your browser', 'anypress-io' ); ?>…</p>
					<div class="mt-4 h-2 overflow-hidden rounded-full bg-[#f1ede8]"><div class="wp-block-anypress-io-try__fill h-full rounded-full bg-[linear-gradient(90deg,#ffb338,#ff7a2a,#ee2f5e)] transition-[width] duration-500" style="width: 4%;"></div></div>
					<p class="wp-block-anypress-io-try__more mt-3 text-[14px] text-[#5f5a55]"><?php echo esc_html( $anypress_io_try_config['words']['building'] ); ?></p>
					<noscript><p class="mt-3 text-[14px] text-[#5f5a55]"><?php esc_html_e( 'The demo runs in your browser, so it needs JavaScript switched on.', 'anypress-io' ); ?></p></noscript>
				</div>
				<div class="wp-block-anypress-io-try__failed contents" hidden>
					<p class="text-[19px] font-extrabold"><?php esc_html_e( 'This demo didn’t start.', 'anypress-io' ); ?></p>
					<p class="mt-2 text-[15px] text-[#5f5a55]"><?php esc_html_e( 'It runs in your browser, so a private window or a blocked site can stop it. Try once more.', 'anypress-io' ); ?></p>
					<button type="button" class="wp-block-anypress-io-try__retry btn btn-ink mt-5"><?php esc_html_e( 'Try again', 'anypress-io' ); ?></button>
				</div>
			</div>
		</div>
	</div>
	<div class="wp-block-anypress-io-try__gone flex min-h-[60vh] items-center justify-center px-6 text-center" hidden>
		<p><?php esc_html_e( 'This demo link isn’t ready yet, or it has ended.', 'anypress-io' ); ?> <a href="<?php echo esc_url( get_permalink() ); ?>" class="underline"><?php esc_html_e( 'Try AnyPress here', 'anypress-io' ); ?></a>.</p>
	</div>
</div>

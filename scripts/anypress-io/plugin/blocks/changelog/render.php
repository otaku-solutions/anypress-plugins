<?php
/**
 * The What's New list, in the markup anypress.io has always shown so its stylesheet lays it out the same: the
 * filter by site type, then months, each with its days and each day's changes; smaller ones fold away under
 * "N smaller improvements". view.js filters it and copies an entry's link.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

$anypress_io_changes = anypress_io_changes();
$anypress_io_for     = anypress_io_change_for_labels();
$anypress_io_kind    = array(
	'new'      => 'bg-ink text-paper border-ink',
	'improved' => 'bg-paper text-ink border-ink',
	'fixed'    => 'bg-paper text-ink-soft border-line',
);
$anypress_io_on      = 'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors border-ink bg-ink text-paper';
$anypress_io_off     = 'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors border-line bg-paper hover:border-ink';
$anypress_io_link    = 'ml-2 align-middle text-base font-normal text-ink-soft opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100';

$anypress_io_tags = static function ( array $change ) use ( $anypress_io_for ): string {
	$labels = $change['for'] ? array_map( static fn( $f ) => $anypress_io_for[ $f ] ?? $f, $change['for'] ) : array( __( 'Every site', 'anypress-io' ) );
	$out    = '<p class="mt-3 flex flex-wrap items-center gap-2 text-sm">';
	foreach ( $labels as $label ) {
		$out .= '<span class="rounded-full border border-line px-2.5 py-0.5 text-ink-soft">' . esc_html( $label ) . '</span>';
	}
	if ( $change['link'] ) {
		$out .= '<a href="' . esc_url( $change['link']['href'] ) . '" class="ml-1 font-semibold underline underline-offset-4">' . esc_html( $change['link']['label'] ) . ' →</a>';
	}
	return $out . '</p>';
};
$anypress_io_permalink = static function ( array $change ) use ( $anypress_io_link ): string {
	/* translators: %s: the change's title. */
	return '<a href="#' . esc_attr( $change['id'] ) . '" aria-label="' . esc_attr( sprintf( __( 'Link to %s', 'anypress-io' ), $change['title'] ) ) . '" class="' . $anypress_io_link . '" data-anypress-copy>#</a>';
};

// Months, newest first, each holding its days, each day holding that day's changes.
$anypress_io_months = array();
foreach ( $anypress_io_changes as $anypress_io_change ) {
	$anypress_io_months[ gmdate( 'F Y', strtotime( $anypress_io_change['date'] . ' 00:00:00 UTC' ) ) ][ $anypress_io_change['date'] ][] = $anypress_io_change;
}

$anypress_io_wrapper = get_block_wrapper_attributes( array( 'class' => 'contents' ) );
?>
<div <?php echo $anypress_io_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?> data-anypress-changelog>
<div role="group" aria-label="<?php esc_attr_e( 'Show changes for', 'anypress-io' ); ?>" class="mb-10 flex flex-wrap gap-2">
<button type="button" aria-pressed="true" data-filter="all" data-on="<?php echo esc_attr( $anypress_io_on ); ?>" data-off="<?php echo esc_attr( $anypress_io_off ); ?>" class="<?php echo esc_attr( $anypress_io_on ); ?>"><?php esc_html_e( 'All sites', 'anypress-io' ); ?></button>
<?php foreach ( $anypress_io_for as $anypress_io_slug => $anypress_io_label ) : ?>
<button type="button" aria-pressed="false" data-filter="<?php echo esc_attr( $anypress_io_slug ); ?>" class="<?php echo esc_attr( $anypress_io_off ); ?>"><?php echo esc_html( $anypress_io_label ); ?></button>
<?php endforeach; ?>
</div>
<div data-anypress-changes>
<?php foreach ( $anypress_io_months as $anypress_io_month => $anypress_io_days ) : ?>
<section aria-label="<?php echo esc_attr( $anypress_io_month ); ?>" class="mb-14"><h2 class="mb-8 text-sm font-semibold uppercase tracking-wider text-ink-soft"><?php echo esc_html( $anypress_io_month ); ?></h2><ol class="relative border-l border-line pl-6 sm:border-0 sm:pl-0">
	<?php
	foreach ( $anypress_io_days as $anypress_io_date => $anypress_io_items ) :
		$anypress_io_time  = strtotime( $anypress_io_date . ' 00:00:00 UTC' );
		$anypress_io_main  = array_filter( $anypress_io_items, static fn( $c ) => ! $c['minor'] );
		$anypress_io_minor = array_filter( $anypress_io_items, static fn( $c ) => $c['minor'] );
		?>
<li class="relative pb-12 last:pb-0 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-10"><span aria-hidden="true" class="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full border-2 border-ink bg-paper sm:hidden"></span><div class="mb-4 sm:mb-0"><time datetime="<?php echo esc_attr( $anypress_io_date ); ?>" class="block sm:sticky sm:top-24"><span class="block text-lg font-semibold"><?php echo esc_html( gmdate( 'M j', $anypress_io_time ) ); ?></span><span class="block text-sm text-ink-soft"><?php echo esc_html( gmdate( 'l', $anypress_io_time ) ); ?></span></time></div><div class="grid min-w-0 gap-10 sm:border-l sm:border-line sm:pl-10">
		<?php foreach ( $anypress_io_main as $anypress_io_change ) : ?>
<article id="<?php echo esc_attr( $anypress_io_change['id'] ); ?>" class="group scroll-mt-24" data-for="<?php echo esc_attr( implode( ' ', $anypress_io_change['for'] ) ); ?>"><span class="inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold <?php echo esc_attr( $anypress_io_kind[ $anypress_io_change['kind'] ] ?? $anypress_io_kind['improved'] ); ?>"><?php echo esc_html( $anypress_io_change['kindLabel'] ); ?></span><h3 class="mt-2 text-xl font-semibold sm:text-2xl"><?php echo esc_html( $anypress_io_change['title'] ) . $anypress_io_permalink( $anypress_io_change ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped where it's built. ?></h3><p class="mt-2 max-w-2xl text-ink-soft"><?php echo wp_kses( $anypress_io_change['body'], array( 'a' => array( 'href' => true, 'class' => true ), 'strong' => array(), 'em' => array() ) ); ?></p>
			<?php if ( $anypress_io_change['image'] ) : ?>
<img alt="<?php echo esc_attr( $anypress_io_change['image']['alt'] ); ?>" loading="lazy" width="1440" height="900" decoding="async" class="mt-4 h-auto w-full max-w-2xl rounded-lg border border-line" src="<?php echo esc_url( $anypress_io_change['image']['src'] ); ?>">
			<?php endif; ?>
			<?php echo $anypress_io_tags( $anypress_io_change ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped where it's built. ?></article>
		<?php endforeach; ?>
		<?php if ( $anypress_io_minor ) : ?>
<details class="group/more max-w-2xl rounded-lg border border-line bg-paper-2"><summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-semibold [&amp;::-webkit-details-marker]:hidden"><span data-count><?php echo esc_html( anypress_io_smaller_label( count( $anypress_io_minor ) ) ); ?></span><span aria-hidden="true" class="transition-transform group-open/more:rotate-180">⌄</span></summary><ul class="divide-y divide-line border-t border-line">
			<?php foreach ( $anypress_io_minor as $anypress_io_change ) : ?>
<li id="<?php echo esc_attr( $anypress_io_change['id'] ); ?>" class="group scroll-mt-24 px-4 py-3" data-for="<?php echo esc_attr( implode( ' ', $anypress_io_change['for'] ) ); ?>"><p class="font-semibold"><?php echo esc_html( $anypress_io_change['title'] ) . $anypress_io_permalink( $anypress_io_change ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped where it's built. ?></p><p class="mt-1 text-ink-soft"><?php echo wp_kses( $anypress_io_change['body'], array( 'a' => array( 'href' => true, 'class' => true ), 'strong' => array(), 'em' => array() ) ); ?></p><?php echo $anypress_io_tags( $anypress_io_change ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped where it's built. ?></li>
			<?php endforeach; ?>
</ul></details>
		<?php endif; ?>
</div></li>
	<?php endforeach; ?>
</ol></section>
<?php endforeach; ?>
</div>
</div>

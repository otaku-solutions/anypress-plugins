<?php
/**
 * Title: Flow
 * Slug: anypress-io/flow
 * Categories: anypress-io
 * Keywords: anypress.io, flow
 * Description: anypress.io's flow section, as on /hosting.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"className":"sec","anypressAttrs":{"aria-labelledby":"h-backups"},"tagName":"section"} -->
<section class="wp-block-group sec"><!-- wp:group {"className":"in"} -->
<div class="wp-block-group in"><!-- wp:group {"className":"sec-head"} -->
<div class="wp-block-group sec-head"><!-- wp:html -->
<span class="eyebrow">backups</span>
<!-- /wp:html -->
<!-- wp:heading {"anchor":"h-backups"} -->
<h2 id="h-backups" class="wp-block-heading">A backup only counts if it restores.</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>So we restore one every day to prove it.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:html -->
<ol class="flow !mt-0"><li><div data-drawing="backup" aria-hidden="true" class="ob draw " style="aspect-ratio:120 / 120"></div><b>1. Every night</b><span>Your site's files and database are zipped and stored away from the servers.</span></li><li><div data-drawing="note" aria-hidden="true" class="ob draw " style="aspect-ratio:176 / 150"></div><b>2. Kept for weeks</b><span>We keep one copy from each of the last 7 days and each of the last 4 weeks.</span></li><li><div data-drawing="tools" aria-hidden="true" class="ob draw " style="aspect-ratio:176 / 156"></div><b>3. Tested every day</b><span>Every night one site's backup is restored onto a spare copy and checked it opens. Every site gets its turn.</span></li><li><div data-drawing="open" aria-hidden="true" class="ob draw " style="aspect-ratio:176 / 150"></div><b>4. Put back in a click</b><span>Restore any copy from your dashboard. We save the site as it is first, so you can undo it.</span></li></ol>
<!-- /wp:html -->
<!-- wp:group {"className":"mx-auto mt-12 max-w-[360px]"} -->
<div class="wp-block-group mx-auto mt-12 max-w-[360px]"><!-- wp:html -->
<ul class="beta-videos"><li><figure class="video-tile"><button type="button" aria-label="Play: Backups and restores (0:29)"><img src="<?php echo esc_url( anypress_io_video( 'backups-and-restores.jpg' ) ); ?>" alt="" width="1280" height="720" loading="lazy"><span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"></path></svg></span></button></figure></li></ul>
<!-- /wp:html --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->

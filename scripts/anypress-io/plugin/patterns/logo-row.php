<?php
/**
 * Title: Logo Row
 * Slug: anypress-io/logo-row
 * Categories: anypress-io
 * Keywords: anypress.io, logo row
 * Description: anypress.io's logo row section, as on /automate.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"className":"in end","metadata":{"name":"Closing Call to Action"},"tagName":"section"} -->
<section class="wp-block-group in end"><!-- wp:paragraph {"className":"eyebrow","anypressAttrs":{"tag":"span"}} -->
<p class="eyebrow">ready?</p>
<!-- /wp:paragraph -->
<!-- wp:heading -->
<h2 class="wp-block-heading">Stop building sites by hand.</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Apply to sell, and your storefront creates sites from the first order. Need a partner key or help with a flow? Email support@anypress.io.</p>
<!-- /wp:paragraph -->
<!-- wp:group {"className":"ctas","metadata":{"name":"Call to Action"}} -->
<div class="wp-block-group ctas"><!-- wp:anypress-io/button {"className":"btn btn-ink"} -->
<a class="btn btn-ink" href="/sell">Apply to sell →</a>
<!-- /wp:anypress-io/button -->
<!-- wp:anypress-io/button {"className":"btn btn-paper"} -->
<a class="btn btn-paper" href="/contact">Talk to us</a>
<!-- /wp:anypress-io/button --></div>
<!-- /wp:group -->
<!-- wp:html {"metadata":{"name":"List"}} -->
<ul class="logo-row" aria-label="Works with"><li class="logo-tile"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/n8n-logo.svg" alt="n8n" width="56" height="56"></li><li class="logo-tile"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/make-logo.svg" alt="Make" width="56" height="56"></li><li class="logo-tile"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/zapier-logo.svg" alt="Zapier" width="56" height="56"></li><li class="logo-tile"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/highlevel-logo.svg" alt="HighLevel" width="56" height="56"></li></ul>
<!-- /wp:html --></section>
<!-- /wp:group -->

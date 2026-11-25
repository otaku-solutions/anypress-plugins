<?php
/**
 * Title: Volume Savings
 * Slug: anypress-io/tiers
 * Categories: anypress-io
 * Keywords: anypress.io, volume savings
 * Description: anypress.io's volume savings section, as on /sellers.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"className":"sec scroll-mt-20","anchor":"tiers","anypressAttrs":{"aria-labelledby":"h-tiers"},"metadata":{"name":"The more sites you sell, the less each…"},"tagName":"section"} -->
<section id="tiers" class="wp-block-group sec scroll-mt-20"><!-- wp:group {"className":"in"} -->
<div class="wp-block-group in"><!-- wp:group {"className":"sec-head"} -->
<div class="wp-block-group sec-head"><!-- wp:paragraph {"className":"eyebrow","anypressAttrs":{"tag":"span"}} -->
<p class="eyebrow">volume savings</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"anchor":"h-tiers"} -->
<h2 id="h-tiers" class="wp-block-heading">The more sites you sell, the less each one costs.</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Counted across all your live sites. When you reach a new level, your other sites move to it at their next renewal.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:list {"className":"tiers"} -->
<ul class="wp-block-list tiers"><!-- wp:list-item -->
<li><b>0%</b><span>1 to 2 sites</span></li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><b>[anypress_number of="volumeMin"]% off</b><span>3 to 9 sites</span></li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><b>[anypress_number of="volumeAt" sites="10"]% off</b><span>10 to 24 sites</span></li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><b>[anypress_number of="volumeMax"]% off</b><span>25+ sites</span></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->

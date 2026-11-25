<?php
/**
 * Title: Price List
 * Slug: anypress-io/prices
 * Categories: anypress-io
 * Keywords: anypress.io, price list
 * Description: anypress.io's price list section, as on /.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"className":"sec soft","anypressAttrs":{"aria-labelledby":"h-price"},"metadata":{"name":"One price per site. Nothing hidden."},"tagName":"section"} -->
<section class="wp-block-group sec soft"><!-- wp:group {"className":"in"} -->
<div class="wp-block-group in"><!-- wp:group {"className":"sec-head"} -->
<div class="wp-block-group sec-head"><!-- wp:paragraph {"className":"eyebrow","anypressAttrs":{"tag":"span"}} -->
<p class="eyebrow">simple prices</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"anchor":"h-price"} -->
<h2 id="h-price" class="wp-block-heading">One price per site. Nothing hidden.</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Starting prices for a small site, per month.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"className":"prices","metadata":{"name":"Price List"}} -->
<div class="wp-block-group prices"><!-- wp:paragraph {"anypressAttrs":{"tag":""}} -->
<p><a href="/sites/website"><b>Website</b><strong>[anypress_price type="website" size="small" period="monthly"]</strong><small>/ month</small></a><a href="/sites/bookings"><b>Bookings</b><strong>[anypress_price type="bookings" size="small" period="monthly"]</strong><small>/ month</small></a><a href="/sites/store"><b>Store</b><strong>[anypress_price type="online-store" size="small" period="monthly"]</strong><small>/ month</small></a><a href="/sites/community"><b>Community</b><strong>[anypress_price type="community" size="small" period="monthly"]</strong><small>/ month</small></a><a href="/sites/everything"><b>Everything</b><strong>[anypress_price type="everything" size="small" period="monthly"]</strong><small>/ month</small></a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:list {"className":"price-notes"} -->
<ul class="wp-block-list price-notes"><!-- wp:list-item -->
<li>Pay yearly, get 2 months free</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>More room? Medium is 2×, Large is 4×</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>3 or more sites? Save [anypress_number of="volumeMin"] to [anypress_number of="volumeMax"]%</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:heading {"level":3,"className":"mt-16 text-center text-[26px] font-extrabold"} -->
<h3 class="wp-block-heading mt-16 text-center text-[26px] font-extrabold">Next to other platforms <span class="hand block text-[22px] sm:ml-1.5 sm:inline">same kind of site, smallest plan</span></h3>
<!-- /wp:heading -->
<!-- wp:group {"className":"mt-6"} -->
<div class="wp-block-group mt-6"><!-- wp:group {"className":"compare","metadata":{"name":"Comparison Table"}} -->
<div class="wp-block-group compare"><!-- wp:group {"className":"tablewrap","anypressAttrs":{"tabindex":"0","role":"region","aria-label":"AnyPress prices next to other platforms"}} -->
<div class="wp-block-group tablewrap"><!-- wp:html {"metadata":{"name":"Table"}} -->
<table class="price-compare"><thead><tr><th scope="col">You're building</th><th scope="col">Elsewhere</th><th scope="col">AnyPress</th></tr></thead><tbody><tr><th scope="row">Website &amp; blog</th><td><ul class="elsewhere"><li><a href="https://www.squarespace.com/pricing" target="_blank" rel="noopener nofollow">Squarespace Basic</a> <span class="no">$25/mo</span><small>2% of any shop sales</small></li><li><a href="https://www.wix.com/plans" target="_blank" rel="noopener nofollow">Wix Light</a> <span class="no">$17/mo, paid yearly</span><small>Can't take payments</small></li></ul></td><td><span class="yes"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class=""><path d="M2.5 9.8c1.6 1.2 3 2.7 4.2 4.6C8.6 9.7 11.6 5.5 15.8 2.8"></path></svg>[anypress_price type="website" size="small" period="monthly"]/mo</span><small>No cut of your sales</small></td></tr><tr><th scope="row">Bookings</th><td><ul class="elsewhere"><li><a href="https://www.wix.com/plans" target="_blank" rel="noopener nofollow">Wix Core</a> <span class="no">$29/mo, paid yearly</span></li></ul></td><td><span class="yes"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class=""><path d="M2.5 9.8c1.6 1.2 3 2.7 4.2 4.6C8.6 9.7 11.6 5.5 15.8 2.8"></path></svg>[anypress_price type="bookings" size="small" period="monthly"]/mo</span><small>No cut of your sales</small></td></tr><tr><th scope="row">Online store</th><td><ul class="elsewhere"><li><a href="https://www.shopify.com/pricing" target="_blank" rel="noopener nofollow">Shopify Basic</a> <span class="no">$39/mo</span><small>2% of each sale unless you use Shopify's own payments</small></li><li><a href="https://www.squarespace.com/pricing" target="_blank" rel="noopener nofollow">Squarespace Core</a> <span class="no">$39/mo</span></li></ul></td><td><span class="yes"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class=""><path d="M2.5 9.8c1.6 1.2 3 2.7 4.2 4.6C8.6 9.7 11.6 5.5 15.8 2.8"></path></svg>[anypress_price type="online-store" size="small" period="monthly"]/mo</span><small>No cut of your sales</small></td></tr><tr><th scope="row">Community &amp; courses</th><td><ul class="elsewhere"><li><a href="https://kajabi.com/pricing" target="_blank" rel="noopener nofollow">Kajabi Basic</a> <span class="no">$179/mo</span></li><li><a href="https://circle.so/pricing" target="_blank" rel="noopener nofollow">Circle Professional</a> <span class="no">$89/mo, paid yearly</span><small>2% of each sale</small></li><li><a href="https://www.skool.com/pricing" target="_blank" rel="noopener nofollow">Skool Hobby</a> <span class="no">$9/mo</span><small>10% of each sale</small></li></ul></td><td><span class="yes"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class=""><path d="M2.5 9.8c1.6 1.2 3 2.7 4.2 4.6C8.6 9.7 11.6 5.5 15.8 2.8"></path></svg>[anypress_price type="community" size="small" period="monthly"]/mo</span><small>No cut of your sales</small></td></tr><tr><th scope="row">Everything</th><td><ul class="elsewhere"><li><a href="https://kajabi.com/pricing" target="_blank" rel="noopener nofollow">Kajabi Growth</a> <span class="no">$249/mo</span></li></ul></td><td><span class="yes"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class=""><path d="M2.5 9.8c1.6 1.2 3 2.7 4.2 4.6C8.6 9.7 11.6 5.5 15.8 2.8"></path></svg>[anypress_price type="everything" size="small" period="monthly"]/mo</span><small>No cut of your sales</small></td></tr></tbody></table>
<!-- /wp:html --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:paragraph {"className":"compare-note"} -->
<p class="compare-note">Starting prices per site, billed monthly unless marked, from each company's own pricing page on 11 November 2026. Prices change, so follow the links for today's. Each platform has features the others don't, and the card company's fee applies everywhere. With AnyPress, paying yearly gets you two months free.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"className":"ctas mt-10","metadata":{"name":"Call to Action"}} -->
<div class="wp-block-group ctas mt-10"><!-- wp:anypress-io/button {"className":"btn btn-ink"} -->
<a class="btn btn-ink" href="/pricing">See all prices</a>
<!-- /wp:anypress-io/button --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->

<?php
/**
 * Title: Chips
 * Slug: anypress-io/chips
 * Categories: anypress-io
 * Keywords: anypress.io, chips
 * Description: anypress.io's chips section, as on /automate.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"className":"sec in","anchor":"apps","anypressAttrs":{"aria-labelledby":"h-apps"},"metadata":{"name":"Chips"},"tagName":"section"} -->
<section id="apps" class="wp-block-group sec in"><!-- wp:group {"className":"sec-head"} -->
<div class="wp-block-group sec-head"><!-- wp:paragraph {"className":"eyebrow","anypressAttrs":{"tag":"span"}} -->
<p class="eyebrow">the apps</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"anchor":"h-apps"} -->
<h2 id="h-apps" class="wp-block-heading">AnyPress in n8n, Make, Zapier and HighLevel.</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Add the AnyPress app to the tool you already use and pick a step. Nothing to code, and the trigger sets up its own webhook when you turn the flow on.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"className":"apps","metadata":{"name":"Apps"}} -->
<div class="wp-block-group apps"><!-- wp:group {"className":"app","tagName":"article"} -->
<article class="wp-block-group app"><!-- wp:group {"className":"app-text"} -->
<div class="wp-block-group app-text"><!-- wp:group {"className":"app-logos","anypressAttrs":{"aria-hidden":"true"},"metadata":{"name":"App Logos"}} -->
<div class="wp-block-group app-logos"><!-- wp:html {"metadata":{"name":"Picture"}} -->
<span class="app-logo"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/logo-mark.svg" alt="" width="28" height="28"></span>
<!-- /wp:html -->
<!-- wp:html {"metadata":{"name":"Text"}} -->
<span>+</span>
<!-- /wp:html -->
<!-- wp:html {"metadata":{"name":"Picture"}} -->
<span class="app-logo"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/n8n-logo.svg" alt="" width="28" height="28"></span>
<!-- /wp:html --></div>
<!-- /wp:group -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">AnyPress for n8n</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Install the community node n8n-nodes-anypress from Settings, then Community nodes. Works on any self-hosted n8n.</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Actions</h4>
<!-- /wp:heading -->
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>Create a site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Get a site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Suspend a site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Resume a site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Delete a site</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Trigger</h4>
<!-- /wp:heading -->
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>AnyPress Trigger</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:paragraph {"className":"app-note"} -->
<p class="app-note">Starts your flow when a site is ready, fails, is suspended and more.</p>
<!-- /wp:paragraph -->
<!-- wp:group {"className":"ctas mt-6","metadata":{"name":"Call to Action"}} -->
<div class="wp-block-group ctas mt-6"><!-- wp:anypress-io/button {"className":"btn btn-ink"} -->
<a class="btn btn-ink" href="https://shop.anypress.io/docs/use-anypress-in-n8n/">Install in n8n →</a>
<!-- /wp:anypress-io/button -->
<!-- wp:anypress-io/button {"className":"btn btn-paper"} -->
<a class="btn btn-paper" href="https://shop.anypress.io/docs/use-anypress-in-n8n/">Setup guide</a>
<!-- /wp:anypress-io/button --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:html {"metadata":{"name":"App Screenshot"}} -->
<figure class="appshot"><div class="appshot-bar" aria-hidden="true"><i></i><i></i><i></i><span>n8n</span></div><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/n8n-create-site.webp" alt="The AnyPress node in n8n, set to create a site from the form's business name and email" width="780" height="1311" loading="lazy"></figure>
<!-- /wp:html --></article>
<!-- /wp:group -->
<!-- wp:group {"className":"app","metadata":{"name":"AnyPress for Make"},"tagName":"article"} -->
<article class="wp-block-group app"><!-- wp:group {"className":"app-text"} -->
<div class="wp-block-group app-text"><!-- wp:group {"className":"app-logos","anypressAttrs":{"aria-hidden":"true"},"metadata":{"name":"App Logos"}} -->
<div class="wp-block-group app-logos"><!-- wp:html {"metadata":{"name":"Picture"}} -->
<span class="app-logo"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/logo-mark.svg" alt="" width="28" height="28"></span>
<!-- /wp:html -->
<!-- wp:html {"metadata":{"name":"Text"}} -->
<span>+</span>
<!-- /wp:html -->
<!-- wp:html {"metadata":{"name":"Picture"}} -->
<span class="app-logo"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/make-logo.svg" alt="" width="28" height="28"></span>
<!-- /wp:html --></div>
<!-- /wp:group -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">AnyPress for Make</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Open the invite link to add the AnyPress app to your Make account, then add any AnyPress module to a scenario.</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Actions</h4>
<!-- /wp:heading -->
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>Create a Site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Get a Site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Suspend a Site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Resume a Site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Delete a Site</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Trigger</h4>
<!-- /wp:heading -->
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>Watch Site Events</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:paragraph {"className":"app-note"} -->
<p class="app-note">Starts your flow when a site is ready, fails, is suspended and more.</p>
<!-- /wp:paragraph -->
<!-- wp:group {"className":"ctas mt-6","metadata":{"name":"Call to Action"}} -->
<div class="wp-block-group ctas mt-6"><!-- wp:anypress-io/button {"className":"btn btn-ink"} -->
<a class="btn btn-ink" href="https://www.make.com/en/hq/app-invitation/671dddf42544d057e9ecc35c05ecdf8b">Add to Make →</a>
<!-- /wp:anypress-io/button -->
<!-- wp:anypress-io/button {"className":"btn btn-paper"} -->
<a class="btn btn-paper" href="https://shop.anypress.io/docs/use-anypress-in-make/">Setup guide</a>
<!-- /wp:anypress-io/button --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:html {"metadata":{"name":"App Screenshot"}} -->
<figure class="appshot"><div class="appshot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Make</span></div><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/make-create-site.webp" alt="The AnyPress Create a Site module in Make, with the site name, reference, client email and size filled in" width="894" height="666" loading="lazy"></figure>
<!-- /wp:html --></article>
<!-- /wp:group -->
<!-- wp:group {"className":"app","metadata":{"name":"AnyPress for Zapier"},"tagName":"article"} -->
<article class="wp-block-group app"><!-- wp:group {"className":"app-text"} -->
<div class="wp-block-group app-text"><!-- wp:group {"className":"app-logos","anypressAttrs":{"aria-hidden":"true"},"metadata":{"name":"App Logos"}} -->
<div class="wp-block-group app-logos"><!-- wp:html {"metadata":{"name":"Picture"}} -->
<span class="app-logo"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/logo-mark.svg" alt="" width="28" height="28"></span>
<!-- /wp:html -->
<!-- wp:html {"metadata":{"name":"Text"}} -->
<span>+</span>
<!-- /wp:html -->
<!-- wp:html {"metadata":{"name":"Picture"}} -->
<span class="app-logo"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/zapier-logo.svg" alt="" width="28" height="28"></span>
<!-- /wp:html --></div>
<!-- /wp:group -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">AnyPress for Zapier</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Open the invite link to add AnyPress to your Zapier account, then pick it as the app in any Zap.</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Actions</h4>
<!-- /wp:heading -->
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>Create Site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Find Site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Suspend Site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Resume Site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Delete Site</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Trigger</h4>
<!-- /wp:heading -->
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>Site Event</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:paragraph {"className":"app-note"} -->
<p class="app-note">Starts your flow when a site is ready, fails, is suspended and more.</p>
<!-- /wp:paragraph -->
<!-- wp:group {"className":"ctas mt-6","metadata":{"name":"Call to Action"}} -->
<div class="wp-block-group ctas mt-6"><!-- wp:anypress-io/button {"className":"btn btn-ink"} -->
<a class="btn btn-ink" href="https://zapier.com/developer/public-invite/248504/d92ccd4f604ea3e76535ff8452c69eb9/">Add to Zapier →</a>
<!-- /wp:anypress-io/button -->
<!-- wp:anypress-io/button {"className":"btn btn-paper"} -->
<a class="btn btn-paper" href="https://shop.anypress.io/docs/use-anypress-in-zapier/">Setup guide</a>
<!-- /wp:anypress-io/button --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:html {"metadata":{"name":"App Screenshot"}} -->
<figure class="appshot"><div class="appshot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Zapier</span></div><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/zapier-create-site.webp" alt="The AnyPress Create Site action in a Zap, with the site name, reference, client email and size filled in" width="808" height="580" loading="lazy"></figure>
<!-- /wp:html --></article>
<!-- /wp:group -->
<!-- wp:group {"className":"app no-shot","metadata":{"name":"AnyPress for HighLevelEarly access"},"tagName":"article"} -->
<article class="wp-block-group app no-shot"><!-- wp:group {"className":"app-text"} -->
<div class="wp-block-group app-text"><!-- wp:group {"className":"app-logos","anypressAttrs":{"aria-hidden":"true"},"metadata":{"name":"App Logos"}} -->
<div class="wp-block-group app-logos"><!-- wp:html {"metadata":{"name":"Picture"}} -->
<span class="app-logo"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/logo-mark.svg" alt="" width="28" height="28"></span>
<!-- /wp:html -->
<!-- wp:html {"metadata":{"name":"Text"}} -->
<span>+</span>
<!-- /wp:html -->
<!-- wp:html {"metadata":{"name":"Picture"}} -->
<span class="app-logo"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/highlevel-logo.svg" alt="" width="28" height="28"></span>
<!-- /wp:html --></div>
<!-- /wp:group -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">AnyPress for HighLevel<span class="soon">Early access</span></h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>For HighLevel agencies (GoHighLevel). Install AnyPress on your sub-accounts and add its actions to any workflow, so every sub-account you sell comes with its own WordPress site under your brand.</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Actions</h4>
<!-- /wp:heading -->
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>Create site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Get site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Suspend site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Resume site</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li>Delete site</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Trigger</h4>
<!-- /wp:heading -->
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>Site event</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:paragraph {"className":"app-note"} -->
<p class="app-note">Starts your flow when a site is ready, fails, is suspended and more.</p>
<!-- /wp:paragraph -->
<!-- wp:group {"className":"ctas mt-6","metadata":{"name":"Call to Action"}} -->
<div class="wp-block-group ctas mt-6"><!-- wp:anypress-io/button {"className":"btn btn-ink"} -->
<a class="btn btn-ink" href="mailto:support@anypress.io?subject=AnyPress%20for%20HighLevel">Get early access →</a>
<!-- /wp:anypress-io/button -->
<!-- wp:anypress-io/button {"className":"btn btn-paper"} -->
<a class="btn btn-paper" href="https://shop.anypress.io/docs/use-anypress-in-highlevel/">Setup guide</a>
<!-- /wp:anypress-io/button --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></article>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:paragraph {"className":"compare-note"} -->
<p class="compare-note">Each app signs in with your API key and secret. With a partner key, pick the storefront on each step (in Make, add one connection per storefront). Using another tool? It can make the same calls with a web request: see the <a href="https://api.anypress.io/docs">API reference</a>.</p>
<!-- /wp:paragraph --></section>
<!-- /wp:group -->

<?php
/**
 * Title: Steps
 * Slug: anypress-io/steps
 * Categories: anypress-io
 * Keywords: anypress.io, steps
 * Description: anypress.io's steps section, as on /ai.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"className":"sec soft","anchor":"connect","anypressAttrs":{"aria-labelledby":"h-connect"},"metadata":{"name":"Connect it once."},"tagName":"section"} -->
<section id="connect" class="wp-block-group sec soft"><!-- wp:group {"className":"in"} -->
<div class="wp-block-group in"><!-- wp:group {"className":"sec-head"} -->
<div class="wp-block-group sec-head"><!-- wp:paragraph {"className":"eyebrow","anypressAttrs":{"tag":"span"}} -->
<p class="eyebrow">two minutes</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"anchor":"h-connect"} -->
<h2 id="h-connect" class="wp-block-heading">Connect it once.</h2>
<!-- /wp:heading --></div>
<!-- /wp:group -->
<!-- wp:group {"className":"steps","metadata":{"name":"Steps"},"anypressAttrs":{"tag":"ol"}} -->
<div class="wp-block-group steps"><!-- wp:group {"metadata":{"name":"Box"},"anypressAttrs":{"tag":"li"}} -->
<div class="wp-block-group"><!-- wp:anypress-io/drawing {"name":"plug","className":"ob draw","ratio":"176 / 150"} -->
<div data-drawing="plug" aria-hidden="true" class="ob draw" style="aspect-ratio:176 / 150"></div>
<!-- /wp:anypress-io/drawing -->
<!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">1. Add AnyPress as a connector</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>In Claude, open Settings, then Connectors, then Add custom connector. In ChatGPT, turn on developer mode under Settings, Apps and Connectors, then create a connector. In Cursor, VS Code, Devin Desktop, Gemini CLI or any other MCP app, add a remote MCP server. Paste the address below.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:group {"metadata":{"name":"Box"},"anypressAttrs":{"tag":"li"}} -->
<div class="wp-block-group"><!-- wp:anypress-io/drawing {"name":"key","className":"ob draw","ratio":"176 / 150"} -->
<div data-drawing="key" aria-hidden="true" class="ob draw" style="aspect-ratio:176 / 150"></div>
<!-- /wp:anypress-io/drawing -->
<!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">2. Sign in and choose what it may do</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Your AI app opens our sign-in page. Sign in to AnyPress, tick what the app may see and change, and approve. There's no key or secret to copy.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:group {"metadata":{"name":"Box"},"anypressAttrs":{"tag":"li"}} -->
<div class="wp-block-group"><!-- wp:anypress-io/drawing {"name":"words","className":"ob draw","ratio":"176 / 156"} -->
<div data-drawing="words" aria-hidden="true" class="ob draw" style="aspect-ratio:176 / 156"></div>
<!-- /wp:anypress-io/drawing -->
<!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">3. Ask</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Type what you need, the way you'd ask a person. The app picks the right steps, and shows your sites right in the chat.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:group {"className":"ai-connector"} -->
<div class="wp-block-group ai-connector"><!-- wp:group {"className":"appshot","metadata":{"name":"App Screenshot"},"anypressAttrs":{"tag":"figure"}} -->
<div class="wp-block-group appshot"><!-- wp:group {"className":"appshot-bar","anypressAttrs":{"aria-hidden":"true"}} -->
<div class="wp-block-group appshot-bar"><!-- wp:paragraph {"anypressAttrs":{"tag":""}} -->
<p><i></i><i></i><i></i><span>Claude, Settings, Connectors</span></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:image {"anypressAttrs":{"width":"809","height":"626","loading":"lazy","tag":"img"}} -->
<figure class="wp-block-image"><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/claude-connector.webp" alt="AnyPress connected in Claude's connector settings, at https://api.anypress.io/mcp, with its tools listed"/></figure>
<!-- /wp:image --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:group {"className":"addresses","metadata":{"name":"List"},"anypressAttrs":{"tag":"ul"}} -->
<div class="wp-block-group addresses"><!-- wp:group {"metadata":{"name":"Box"},"anypressAttrs":{"tag":"li"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">You sell sites</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Sellers and resellers. Resellers pick which storefront each connection is for.</p>
<!-- /wp:paragraph -->
<!-- wp:group {"className":"copyfield"} -->
<div class="wp-block-group copyfield"><!-- wp:html {"metadata":{"name":"Box"}} -->
<input readonly="" aria-label="Connector address for: You sell sites" value="https://api.anypress.io/mcp">
<!-- /wp:html -->
<!-- wp:group {"anypressAttrs":{"type":"button","tag":"button"},"metadata":{"name":"Box"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"anypressAttrs":{"tag":""}} -->
<p>Copy</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:group {"metadata":{"name":"Box"},"anypressAttrs":{"tag":"li"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">You have one site</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Website owners. Approve in your own site's dashboard, and the app can edit that site's pages and design.</p>
<!-- /wp:paragraph -->
<!-- wp:group {"className":"copyfield"} -->
<div class="wp-block-group copyfield"><!-- wp:html {"metadata":{"name":"Box"}} -->
<input readonly="" aria-label="Connector address for: You have one site" value="https://api.anypress.io/mcp/site">
<!-- /wp:html -->
<!-- wp:group {"anypressAttrs":{"type":"button","tag":"button"},"metadata":{"name":"Box"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"anypressAttrs":{"tag":""}} -->
<p>Copy</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- wp:group {"metadata":{"name":"Box"},"anypressAttrs":{"tag":"li"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Look, don't touch</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Sellers and resellers who want an app that can only see their sites.</p>
<!-- /wp:paragraph -->
<!-- wp:group {"className":"copyfield"} -->
<div class="wp-block-group copyfield"><!-- wp:html {"metadata":{"name":"Box"}} -->
<input readonly="" aria-label="Connector address for: Look, don't touch" value="https://api.anypress.io/mcp/read-only">
<!-- /wp:html -->
<!-- wp:group {"anypressAttrs":{"type":"button","tag":"button"},"metadata":{"name":"Box"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"anypressAttrs":{"tag":""}} -->
<p>Copy</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->

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
<!-- wp:html {"metadata":{"name":"List"}} -->
<ol class="steps"><li><div data-drawing="plug" aria-hidden="true" class="ob draw " style="aspect-ratio:176 / 150"></div><div><h3>1. Add AnyPress as a connector</h3><p>In Claude, open Settings, then Connectors, then Add custom connector. In ChatGPT, turn on developer mode under Settings, Apps and Connectors, then create a connector. In Cursor, VS Code, Devin Desktop, Gemini CLI or any other MCP app, add a remote MCP server. Paste the address below.</p></div></li><li><div data-drawing="key" aria-hidden="true" class="ob draw " style="aspect-ratio:176 / 150"></div><div><h3>2. Sign in and choose what it may do</h3><p>Your AI app opens our sign-in page. Sign in to AnyPress, tick what the app may see and change, and approve. There's no key or secret to copy.</p></div></li><li><div data-drawing="words" aria-hidden="true" class="ob draw " style="aspect-ratio:176 / 156"></div><div><h3>3. Ask</h3><p>Type what you need, the way you'd ask a person. The app picks the right steps, and shows your sites right in the chat.</p></div></li></ol>
<!-- /wp:html -->
<!-- wp:group {"className":"ai-connector","metadata":{"name":"App Screenshot"}} -->
<div class="wp-block-group ai-connector"><!-- wp:html {"metadata":{"name":"App Screenshot"}} -->
<figure class="appshot"><div class="appshot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Claude, Settings, Connectors</span></div><img src="<?php echo esc_url( untrailingslashit( anypress_io_asset( '' ) ) ); ?>/apps/claude-connector.webp" alt="AnyPress connected in Claude's connector settings, at https://api.anypress.io/mcp, with its tools listed" width="809" height="626" loading="lazy"></figure>
<!-- /wp:html --></div>
<!-- /wp:group -->
<!-- wp:html {"metadata":{"name":"List"}} -->
<ul class="addresses"><li><h3>You sell sites</h3><p>Sellers and resellers. Resellers pick which storefront each connection is for.</p><div class="copyfield"><input readonly="" aria-label="Connector address for: You sell sites" value="https://api.anypress.io/mcp"><button type="button">Copy</button></div></li><li><h3>You have one site</h3><p>Website owners. Approve in your own site's dashboard, and the app can edit that site's pages and design.</p><div class="copyfield"><input readonly="" aria-label="Connector address for: You have one site" value="https://api.anypress.io/mcp/site"><button type="button">Copy</button></div></li><li><h3>Look, don't touch</h3><p>Sellers and resellers who want an app that can only see their sites.</p><div class="copyfield"><input readonly="" aria-label="Connector address for: Look, don't touch" value="https://api.anypress.io/mcp/read-only"><button type="button">Copy</button></div></li></ul>
<!-- /wp:html --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->

# anypress.io on WordPress

anypress.io is moving from its Next.js site onto an AnyPress website store. This folder holds the few pieces only
anypress.io needs. Everything general (blocks, block styles, the Sketchbook palette and fonts) is in AnyPress Blocks and
the AnyPress theme, so every store can use it.

`plugin/` is the **AnyPress Site** plugin:

- **AnyPress Calculator** block (`anypress-io/calculator`): the price calculator, the seller and reseller earnings
  calculator, and a course platform next to the Community plan. Prices come from the live price list
  (`https://api.anypress.io/pricing`, kept for six hours), or from `pricing.json` beside the plugin when the API can't
  be reached. Built on the Interactivity API; its script loads only on pages with the block.
- **AnyPress Try It** block (`anypress-io/try`): the `/try` page. It fills the screen with AnyPress's bar and starts
  the demo the link asks for (`?type=<site type>`, `?demo=<industry demo>`, `?blueprint=<one of our blueprints>&title=`,
  `?for=<prospect code>`) in WordPress Playground in the visitor's browser, from demo.anypress.site's own build. Make
  This My Site saves the demo as a draft through the AnyPress API's public demo routes, called from the site
  (`/wp-json/anypress-io/v1/demo/*`, checked with the page's REST nonce), and goes to the plan's checkout with it. The
  page is never cached. `blocks/try/progress.js` is Playground's ProgressTracker bundled into one file (how: its top
  lines); `blocks/try/demo-export.js` is the same PHP as anypress-site's `src/lib/demoExport.ts`.
- **Sign-ups to the shop's customer list**: a Fluent Forms form with a hidden field named `anypress_lead` sends its
  `email`, `names`, `interest`, `group`, `source`, `campaign` and `beta` fields to the shop's lead route
  (`POST https://shop.anypress.io/wp-json/anypress/v1/lead`). Each send shows in the entry's log.

## Installing it on the store

It runs as a **must-use plugin**, because AnyPress Client keeps a website store to its site type's plugins and turns
other plugins off:

1. Copy `plugin/` to `wp-content/mu-plugins/anypress-io/`, with a current `pricing.json` beside `anypress-io.php`.
2. Add `wp-content/mu-plugins/anypress-io.php` containing
   `<?php require __DIR__ . '/anypress-io/anypress-io.php';`

## Trying it

`cd scripts/playground && npm ci && npm run anypress-io` builds a website store on Playground with this plugin and
checks the calculators against the price list and a sign-up against a stand-in for the shop. Screenshots go to
`scripts/playground/anypress-io-shots/`; `-- --serve` keeps the site running.

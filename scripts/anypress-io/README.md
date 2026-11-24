# anypress.io on WordPress

anypress.io is moving from its Next.js site onto an AnyPress website store, looking exactly as it does now. This folder
holds the pieces only anypress.io needs: its pages, made from the live site's own markup, and the plugin that gives them
the site's own look.

`plugin/` is the **AnyPress Site** plugin:

- **anypress.io's look** (`includes/look.php`): the site's own stylesheet, fonts and script (`assets/site/`, from
  anypress-site's build), and a page template with the site's header and footer around each page. WordPress's and the
  theme's styles stay off these pages, so they sit exactly as on anypress.io, while each page is still core blocks
  (groups, headings, paragraphs, lists, Custom HTML) with the site's class names, editable in the editor.
- **AnyPress Calculator** block (`anypress-io/calculator`): the price calculator, the seller and reseller earnings
  calculator, and a course platform next to the Community plan, in anypress.io's markup (`includes/widgets.php`,
  worked by `assets/site/site.js`). Prices come from the live price list (`https://api.anypress.io/pricing`, kept for
  six hours), or from `pricing.json` beside the plugin when the API can't be reached.
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

## The pages

`pages/convert.mjs` writes anypress.io's pages as block markup straight from the pages anypress-site serves, so the
WordPress pages carry the same markup and class names:

1. In anypress-site, put the test prices in and build it:
   `node <this folder>/pages/test-prices.mjs src/lib/pricing.json && npm run build && npx next start -p 3311`.
   Each test price is a number no real price uses, so convert.mjs can tell every price on a page apart.
2. `node pages/convert.mjs` (in `scripts/anypress-io`) writes `pages/html/` (one file per page in `pages/pages.json`),
   the header and footer in `pages/parts/`, and `pages/forms.json` (the sign-up and seller application forms, as Fluent
   Forms' own export), and copies the pictures and drawings the pages use into `plugin/assets/`. Each test price
   becomes the shortcode that prints the real one; it stops with a list if any is left over. Pages anypress.io draws
   in the browser (Try It) are the plugin's own block instead.
3. `git checkout src/lib/pricing.json` in anypress-site.
4. `wp eval-file setup.php --user=<admin>` on the store makes or updates each page by its address (keeping a revision),
   imports the forms, and sets the home page, logo, header and footer.

The sign-up form sends each sign-up to the shop's customer list (`plugin/includes/lead.php`). The seller
application is sent to the AnyPress API's `/applications` route as the form's last check, so a second application from
the same email, or a storefront address that's taken, shows on the form (`plugin/includes/application.php`).

No page types an AnyPress price: prices and price-list numbers are the `[anypress_price]`, `[anypress_number]` and
`[anypress_care]` shortcodes, and
the worked examples are `[anypress_example]`, all read from
`pricing.json` (`plugin/includes/shortcodes.php`). The how-to videos load from anypress.io's video folder until they're
added to the store's Media Library; define `ANYPRESS_IO_VIDEOS` with their address to point the pages there instead.

## Trying it

`cd scripts/playground && npm ci && npm run anypress-io` builds a website store on Playground with this plugin and
checks the calculators and price shortcodes against the price list, a sign-up against a stand-in for the shop and the
seller application against a stand-in for the API, then sets up the pages
and checks each one: prices filled in, every image loads, it fits a phone, and every block is valid in the editor. Screenshots go to
`scripts/playground/anypress-io-shots/`; `-- --serve` keeps the site running.

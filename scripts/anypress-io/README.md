# anypress.io on WordPress

anypress.io is moving from its Next.js site onto an AnyPress website store, looking exactly as it does now. This folder
holds the pieces only anypress.io needs: its pages, made from the live site's own markup, and the plugin that gives them
the site's own look.

`plugin/` is the **AnyPress Site** plugin:

- **anypress.io's look** (`includes/look.php`): the site's own stylesheet, fonts and script (`assets/site/`, from
  anypress-site's build), and a page template with the site's header and footer around each page. WordPress's and the
  theme's styles stay off these pages, so they sit exactly as on anypress.io, while each page is still blocks (groups,
  headings, paragraphs, lists, questions, buttons, Custom HTML) with the site's class names, editable in the editor.
- **anypress.io Button** block (`anypress-io/button`): the site's button (`<a class="btn btn-ink">`), its words typed
  on the button, its link and look (Ink, Paper, Honey) in the block's settings.
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

1. In anypress-site, put the test prices in, tag the drawings and scenes with their names, and build it:
   `node <this folder>/pages/test-prices.mjs src/lib/pricing.json`, then add `data-drawing={name}` to the `<div ref={ref}`
   in `src/components/Drawing.tsx` and `data-vignette={name}` to the one in `src/components/Vignette.tsx` (site.js
   draws them from those names), then `npm run build && npx next start -p 3311`.
   Each test price is a number no real price uses, so convert.mjs can tell every price on a page apart.
2. `node pages/convert.mjs` (in `scripts/anypress-io`) writes `pages/html/` (one file per page in `pages/pages.json`),
   the header and footer in `pages/parts/`, and `pages/forms.json` (the sign-up and seller application forms, as Fluent
   Forms' own export), and copies the pictures and drawings the pages use into `plugin/assets/`. Each test price
   becomes the shortcode that prints the real one; it stops with a list if any is left over. Pages anypress.io draws
   in the browser (Try It) are the plugin's own block instead. It also writes each page's search details into
   `pages.json` (title, description, structured data) with its share picture in `pages/og/`, the changelog into
   `pages/changes.json`, and the old addresses from anypress-site's `next.config.ts` into `pages/redirects.json`.
3. `git checkout src/lib/pricing.json src/components` in anypress-site.
4. `wp eval-file setup.php --user=<admin>` on the store makes or updates each page by its address (keeping a revision),
   imports the forms, and sets the home page, logo, header and footer. It also:
   - puts each page's title, description and share picture in Rank Math's own fields, and its structured data
     (FAQs, breadcrumbs, guides as articles, plans with their prices) beside Rank Math's (`plugin/includes/seo.php`);
     sets AnyPress as the business in Rank Math's knowledge graph and writes robots.txt;
   - adds the old addresses as Rank Math redirections (each once, so edits made in Rank Math stay);
   - copies the how-to videos and their posters into the Media Library;
   - adds What's New as posts under **Changes** in wp-admin (`plugin/includes/changelog.php`): kind and the sites it's
     for in the sidebar, `anypress_minor`, `anypress_link_href` and `anypress_link_label` in Custom Fields. The
     AnyPress Changelog block on /changelog/ lists them, with the filter by site type.
   - keeps the website site type's FluentCRM and WP Fusion Lite off (AnyPress Client 2.46.0's
     `anypress_plugins_kept_off`): AnyPress has one CRM, the shop's, and this site's forms already send to it.
5. `node pages/colors.mjs` after copying a new `site.css` into `plugin/assets/site/css/`: it points every colour the
   stylesheet uses at one of the site's colour variables and writes `plugin/colors.json`. Then `node pages/patterns.mjs`
   writes one block pattern per kind of section into `plugin/patterns/`.

## Editing the pages

The editor shows a page as the page looks: full width, on the site's paper, in its fonts. The page template holds the
`<main>`, so a page is its sections one after another, each named in List View for its kind or its heading ("Home Top",
"Questions", "Price List"). Labels, lines of text and answers are Paragraphs, questions are Details blocks and buttons
are anypress.io Buttons. What stays code (drawings, cards with icons, tables, forms) is a Custom HTML block named for
what it is ("Drawing", "Form", "Table"), shown in place on the page with its drawings drawn in
(`assets/site/editor.js`, `assets/site/canvas.js`); **Edit HTML** in its toolbar opens the code. That needs the
`unfiltered_html` capability (administrators); others see WordPress's own Custom HTML preview.

## Changing the look in WordPress

The site's colours and its two fonts are WordPress's own (`plugin/includes/settings.php`): they show in Appearance >
Editor > Styles and in every block's colour and font pickers, and a colour changed there changes it on every page.
Background, Text and the text font picked in Styles change the pages' paper, ink and font. Until someone picks
another, the pages look exactly as anypress.io's.

Each kind of section the pages use (questions, steps, cards, price list, comparison table...) is a block pattern under
**anypress.io** in the inserter's Patterns tab (`plugin/includes/patterns.php`), so a section added by hand, or by an
agent through the site tools, comes in the site's own look.

The sign-up form sends each sign-up to the shop's customer list (`plugin/includes/lead.php`). The seller
application is sent to the AnyPress API's `/applications` route as the form's last check, so a second application from
the same email, or a storefront address that's taken, shows on the form (`plugin/includes/application.php`).

No page types an AnyPress price: prices and price-list numbers are the `[anypress_price]`, `[anypress_number]` and
`[anypress_care]` shortcodes, and
the worked examples are `[anypress_example]`, all read from
`pricing.json` (`plugin/includes/shortcodes.php`). Prices in the search details and structured data are the same
shortcodes, filled as the page is shown. setup.php copies the how-to videos from `ANYPRESS_IO_VIDEOS` (default
anypress.io's video folder); define `ANYPRESS_IO_SKIP_VIDEOS` to leave them playing from there.

## Trying it

`cd scripts/playground && npm ci && npm run anypress-io` builds a website store on Playground with this plugin and
checks the calculators and price shortcodes against the price list, a sign-up against a stand-in for the shop and the
seller application against a stand-in for the API, then sets up the pages
and checks each one: prices filled in, every image loads, it fits a phone, and every block is valid in the editor. Screenshots go to
`scripts/playground/anypress-io-shots/`; `-- --serve` keeps the site running.

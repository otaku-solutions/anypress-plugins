// anypress.io on WordPress Playground, as a website store: the AnyPress theme and Blocks, the website site type's
// plugins at the store template's versions, AnyPress Client from this checkout with ANYPRESS_TENANT_ROLES=website, and
// the anypress.io site plugin (scripts/anypress-io/plugin) as a must-use plugin, as the store runs it. Checks its calculators against the price list in a real
// browser, and that a Fluent Forms sign-up goes to the shop's lead route, then screenshots them.
//
//   cd scripts/playground && npm ci
//   npm run anypress-io                    # checks and screenshots into anypress-io-shots/, exit 1 on a failure
//   npm run anypress-io -- --serve         # keep the site running at http://127.0.0.1:9430 afterwards
//
// ANYPRESS_THEME_DIR=<anypress-theme checkout> uses that theme instead of the released one (an unreleased theme change).
// Needs packages/anypress-client/vendor (composer install), an anypress-api checkout next to this repository (its store
// template's build.sh and roles.json; or ANYPRESS_API_DIR), and network access to downloads.wordpress.org. The price
// list comes from https://api.anypress.io/pricing, or anypress-site's copy (ANYPRESS_SITE_DIR) when the API is out.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runCLI } from '@wp-playground/cli';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const CLIENT = resolve(ROOT, 'packages/anypress-client');
const SITE_PLUGIN = resolve(ROOT, 'scripts/anypress-io/plugin');
const API = process.env.ANYPRESS_API_DIR || resolve(ROOT, '../anypress-api');
const SITE_REPO = process.env.ANYPRESS_SITE_DIR || resolve(ROOT, '../anypress-site');
const SHOTS = resolve(HERE, 'anypress-io-shots');
const PHP = process.env.PLAYGROUND_PHP || '8.3';
const PORT = Number(process.env.PLAYGROUND_PORT || 9430);
const SERVE = process.argv.includes('--serve');
const THEME_DIR = process.env.ANYPRESS_THEME_DIR ? resolve(process.env.ANYPRESS_THEME_DIR) : null;

for (const [path, fix] of [
    [resolve(CLIENT, 'vendor/autoload.php'), 'run composer install in packages/anypress-client'],
    [resolve(API, 'templates/anypress-store/build.sh'), 'set ANYPRESS_API_DIR to an anypress-api checkout'],
]) {
    if (!existsSync(path)) {
        console.error(`${path} is missing: ${fix} first.`);
        process.exit(1);
    }
}

// The price list the plugin falls back to when it can't reach the API (as the release zip ships it).
let pricing;
try {
    const res = await fetch('https://api.anypress.io/pricing', { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    pricing = await res.json();
} catch {
    pricing = JSON.parse(readFileSync(resolve(SITE_REPO, 'src/lib/pricing.json'), 'utf8'));
}
writeFileSync(resolve(SITE_PLUGIN, 'pricing.json'), `${JSON.stringify(pricing, null, 2)}\n`);

const build = readFileSync(resolve(API, 'templates/anypress-store/build.sh'), 'utf8');
const WP = process.env.PLAYGROUND_WP || build.match(/WP_VERSION=\$\{WP_VERSION:-([0-9.]+)\}/)[1];
const roles = JSON.parse(readFileSync(resolve(API, 'templates/anypress-store/roles.json'), 'utf8'));
const website = new Set(roles.website.plugins.map((p) => p.split('/')[0]));
const pinned = build.match(/^PLUGINS="\n([\s\S]*?)\n"/m)[1].trim().split('\n').map((l) => l.trim().split(/\s+/)).filter(([slug]) => website.has(slug));
const literal = (path, name) => ({ resource: 'literal', name, contents: readFileSync(path) });

const blueprint = {
    features: { networking: true },
    steps: [
        { step: 'defineWpConfigConsts', consts: { WP_DEBUG: true, WP_DEBUG_LOG: true, WP_DEBUG_DISPLAY: false, WP_DISABLE_FATAL_ERROR_HANDLER: true, AUTOMATIC_UPDATER_DISABLED: true, DISABLE_WP_CRON: true } },
        { step: 'setSiteOptions', options: { permalink_structure: '/%postname%/', blogname: 'AnyPress' } },
        // The released theme, or ANYPRESS_THEME_DIR's checkout (mounted below) to try a theme change before it is released.
        ...(THEME_DIR ? [{ step: 'activateTheme', themeFolderName: 'anypress' }] : [{ step: 'installTheme', themeData: literal(resolve(HERE, 'preview-zips/anypress.zip'), 'anypress.zip'), options: { activate: true } }]),
        ...pinned.map(([slug, version]) => ({ step: 'installPlugin', pluginData: { resource: 'url', url: `https://downloads.wordpress.org/plugin/${slug}.${version}.zip` } })),
        { step: 'installPlugin', pluginData: literal(resolve(HERE, 'preview-zips/anypress-blocks.zip'), 'anypress-blocks.zip') },
        { step: 'mkdir', path: '/wordpress/wp-content/plugins/anypress-client-data' },
        { step: 'writeFile', path: '/wordpress/wp-content/plugins/anypress-client-data/roles.json', data: JSON.stringify(roles) },
        { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/0-anypress-store-env.php', data: "<?php putenv('ANYPRESS_IS_TENANT=true'); define('ANYPRESS_TENANT_ROLES', 'website'); define('DISALLOW_FILE_MODS', true);\n" },
        // Stands in for the shop's lead route: records each request instead of sending it.
        { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/1-fake-shop.php', data: "<?php add_filter('pre_http_request', function ($pre, $args, $url) { if (!str_starts_with($url, 'https://shop.anypress.io/wp-json/anypress/v1/lead')) return $pre; update_option('fake_shop_leads', array_merge(get_option('fake_shop_leads', []), [json_decode($args['body'], true)])); return ['headers' => [], 'body' => '{\"confirm\":true}', 'response' => ['code' => 200, 'message' => 'OK'], 'cookies' => [], 'filename' => null]; }, 10, 3);\n" },
        // Stands in for the API's public demo routes and the photo upload links (the Try It page).
        { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/2-fake-api.php', data: readFileSync(resolve(HERE, 'anypress-io/fake-api.php'), 'utf8') },
        { step: 'activatePlugin', pluginPath: 'anypress-client/anypress-client.php' },
        // As on the store: a must-use plugin, because AnyPress Client keeps a website store to its site type's plugins.
        { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/anypress-io.php', data: "<?php require __DIR__ . '/anypress-io/anypress-io.php';\n" },
        { step: 'runPHP', code: "<?php require '/wordpress/wp-load.php'; foreach ([1, 2, 3] as $id) { wp_delete_post($id, true); }" },
    ],
};

const cli = await runCLI({
    command: 'server',
    wp: `https://wordpress.org/wordpress-${WP}.zip`,
    php: PHP,
    port: PORT,
    blueprint,
    mount: [
        { hostPath: CLIENT, vfsPath: '/wordpress/wp-content/plugins/anypress-client' },
        { hostPath: SITE_PLUGIN, vfsPath: '/wordpress/wp-content/mu-plugins/anypress-io' },
        { hostPath: resolve(ROOT, 'scripts/anypress-io'), vfsPath: '/wordpress/anypress-io-setup' },
        ...(THEME_DIR ? [{ hostPath: THEME_DIR, vfsPath: '/wordpress/wp-content/themes/anypress' }] : []),
    ],
    verbosity: 'quiet',
});
const base = cli.serverUrl.replace(/\/$/, '');
console.log(`WordPress ${WP} on PHP ${PHP}, site type website, at ${base}`);

const failures = [];
const check = (ok, msg, detail = '') => {
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${msg}${ok || !detail ? '' : ` (${detail})`}`);
    if (!ok) failures.push(msg);
};
async function php(code) {
    const res = await cli.playground.run({ code: `<?php require '/wordpress/wp-load.php'; ${code}` }).catch(async (e) => {
        const log = await cli.playground.run({ code: "<?php echo @file_get_contents('/wordpress/wp-content/debug.log') ?: '';" });
        throw new Error(`${e.message.split('\n')[0]}\n${log.text.split('\n').slice(-6).join('\n')}`);
    });
    if (res.errors) throw new Error(res.errors);
    return JSON.parse(res.text);
}

// anypress.io's pages, as setup.php makes them on the store. setup.php is written for `wp eval-file`; Playground has no
// WP-CLI, so a stand-in prints its lines.
const setupOut = await cli.playground.run({ code: `<?php require '/wordpress/wp-load.php';
    class WP_CLI { public static function log($m) { echo $m, "\\n"; } public static function warning($m) { echo 'Warning: ', $m, "\\n"; } public static function success($m) { echo 'Success: ', $m, "\\n"; } public static function error($m) { throw new RuntimeException($m); } }
    wp_set_current_user(1);
    try { include '/wordpress/anypress-io-setup/setup.php'; } catch (Throwable $e) { echo 'ERROR: ', $e->getMessage(), "\\n"; }` });
const pagesMade = JSON.parse(readFileSync(resolve(ROOT, 'scripts/anypress-io/pages/pages.json'), 'utf8'));

if (SERVE) {
    console.log(`Serving ${base}: every page of anypress.io, /try/ with the real demo from demo.anypress.site. Ctrl+C to stop.`);
    await new Promise(() => {});
}

console.log(setupOut.text.split('\n').filter(Boolean).map((l) => `     ${l}`).join('\n'));
check(setupOut.text.includes('Success:') && setupOut.text.includes('Header and footer set.') && setupOut.text.includes('Forms ready: sign-up, seller-application'), "setup.php makes anypress.io's pages, header, footer and forms", setupOut.text.slice(-300));

const active = await php("echo json_encode(['site' => function_exists('anypress_io_pricing'), 'forms' => is_plugin_active('fluentform/fluentform.php'), 'block' => WP_Block_Type_Registry::get_instance()->is_registered('anypress-io/calculator') && WP_Block_Type_Registry::get_instance()->is_registered('anypress-io/try'), 'types' => count(anypress_io_site_types())]);");
check(active.site && active.forms && active.block, 'the site plugin, its calculator and Try It blocks and Fluent Forms are on, on a website store', JSON.stringify(active));
check(active.types === 5, 'the price list has the five kinds of site', String(active.types));

// A sign-up through Fluent Forms reaches the shop's lead route with the form's fields.
await php(`do_action('fluentform/submission_inserted', 7, ['anypress_lead' => '1', 'email' => 'sam@anypress.example', 'names' => ['first_name' => 'Sam', 'last_name' => 'Rivera'], 'group' => 'seller', 'beta' => '1'], (object) ['id' => 3, 'title' => 'Beta']);
    do_action('fluentform/submission_inserted', 8, ['email' => 'other@anypress.example'], (object) ['id' => 4, 'title' => 'Contact']);
    echo 1;`);
const leads = await php("echo json_encode(get_option('fake_shop_leads', []));");
check(leads.length === 1 && leads[0].email === 'sam@anypress.example' && leads[0].name === 'Sam Rivera' && leads[0].group === 'seller' && leads[0].beta === '1' && leads[0].source === 'anypress.io Beta',
    "a sign-up form sends its email, name, group and beta answer to the shop's lead route, and other forms send nothing", JSON.stringify(leads));

// The seller application goes to the API's /applications route as the form's last check, and the API's answer shows on the form.
const apply = await php(`$form = (object) ['id' => 5, 'title' => 'Seller application'];
    $base = ['anypress_application' => '1', 'name' => 'Ana Ortiz', 'email' => 'ana@anypress.example', 'business' => 'Ortiz Studio', 'clients' => 'Salons in our city', 'expected_sites' => '3-9', 'has_site' => 'no', 'subdomain' => 'Ortiz', 'highlevel' => 'no', 'site_types' => ['bookings', 'not-sure'], 'audiences' => ['shops', 'none']];
    update_option('fake_api_calls', []);
    $ok = apply_filters('fluentform/validation_errors', [], $base, $form, []);
    $again = apply_filters('fluentform/validation_errors', [], ['email' => 'again@anypress.example'] + $base, $form, []);
    $taken = apply_filters('fluentform/validation_errors', [], ['subdomain' => 'taken'] + $base, $form, []);
    $failed = apply_filters('fluentform/validation_errors', ['name' => ['Please add your name.']], $base, $form, []);
    $other = apply_filters('fluentform/validation_errors', [], ['email' => 'x@anypress.example'], (object) ['id' => 6, 'title' => 'Contact'], []);
    echo json_encode(['ok' => $ok, 'again' => $again, 'taken' => $taken, 'failed' => $failed, 'other' => $other, 'sent' => array_values(array_filter(get_option('fake_api_calls', []), fn($c) => $c[0] === 'application'))]);`);
const sent = apply.sent[0]?.[1] ?? {};
check(apply.sent.length === 3 && sent.email === 'ana@anypress.example' && sent.wantsStorefront === true && sent.storefrontSubdomain === 'ortiz' && sent.highLevelAgency === false && sent.siteTypes === undefined && sent.audiences?.join() === 'shops' && sent.expectedSites === '3-9',
    'seller application: the form\'s answers reach the API\'s /applications route, with "Not sure yet" keeping every kind of site', JSON.stringify(apply.sent));
check(Array.isArray(apply.ok) && apply.ok.length === 0, 'seller application: an application the API takes saves with no errors', JSON.stringify(apply.ok));
check(apply.again.email?.[0]?.includes('already have an application'), 'seller application: a second application from the same email shows on the email field', JSON.stringify(apply.again));
check(apply.taken.subdomain?.[0] === 'storefrontSubdomain is taken', "seller application: a storefront address that's taken shows on that field", JSON.stringify(apply.taken));
check(Object.keys(apply.failed).join() === 'name' && Array.isArray(apply.other) && apply.other.length === 0, "seller application: nothing is sent while the form's own checks fail, or from other forms", JSON.stringify([apply.failed, apply.other]));

// Care and affiliate prices on the pages come from the price list too.
const priced = await php(`echo json_encode([do_shortcode('[anypress_care item="care-plus" show="monthly"]'), do_shortcode('[anypress_care item="move-my-site-in" show="price"]'), do_shortcode('[anypress_price type="website" affiliate="1"]')]);`);
const usd = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const affiliateCut = Math.round(pricing.siteTypes.find((t) => t.key === 'website').monthly.small * pricing.affiliatePercent) / 100;
check(priced.join() === [usd(pricing.care.packages.find((c) => c.key === 'care-plus').monthly), usd(pricing.care.services.find((c) => c.key === 'move-my-site-in').price), usd(affiliateCut)].join(),
    'care and affiliate prices come from the price list', JSON.stringify(priced));

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
mkdirSync(SHOTS, { recursive: true });
try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const text = (sel) => page.$eval(sel, (e) => e.textContent.trim());
    const small = (id) => pricing.siteTypes.find((t) => t.key === id).monthly.small;
    const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2, maximumFractionDigits: 2 })}`;
    const tier = (n) => pricing.volumeTiers.reduce((p, t) => (n >= t.sites ? t.percent : p), 0);

    // The calculators, in anypress.io's own markup (worked by the site's script), against the price list.
    const big = (calc) => page.$eval(`${calc} .calc-big`, (e) => e.firstChild.textContent.trim());
    const price = '.calc[data-calc=price]';
    await page.goto(`${base}/pricing/`, { waitUntil: 'networkidle' });
    check(await big(price) === money(small('online-store')), 'price calculator: starts on one Small store at its monthly price', await big(price));
    await page.click(`${price} [data-pick=type] [data-value=website]`);
    await page.locator(`${price} input[type=range]`).fill('10');
    const ten = Math.round(small('website') * (1 - tier(10) / 100) * 100) / 100;
    check(await big(price) === money(ten * 10) && (await text(`${price} .calc-line`)).includes(`(you save ${tier(10)}%)`), 'price calculator: ten website sites get the volume saving', await text(`${price} .calc-line`));
    await page.click(`${price} [data-pick=yearly] [data-value="1"]`);
    check(await big(price) === money(Math.round(small('website') * pricing.yearlyMonths * (1 - tier(10) / 100) * 100) / 100 * 10) && (await text(`${price} .calc-big small`)) === '/ year', 'price calculator: yearly costs the yearly months');
    check((await page.getAttribute(`${price} .calc-result a`, 'href')) === 'https://shop.anypress.io/item/website-small/', 'price calculator: the button goes to the plan on the shop');
    check(await page.getAttribute(`${price} [data-pick=type] [data-value=website]`, 'aria-pressed') === 'true', 'price calculator: the picked kind of site shows as pressed');
    await page.screenshot({ path: resolve(SHOTS, 'website-desktop-pricing.png'), fullPage: true });

    const earn = '[data-calc=earnings]';
    await page.goto(`${base}/sellers/`, { waitUntil: 'networkidle' });
    const sellerCost = Math.round(small('website') * (100 - tier(10))) / 100;
    check(await big(earn) === money((49 - sellerCost) * 10), 'earnings calculator: a seller with ten $49 website clients keeps the difference', await big(earn));
    await page.click(`${earn} [data-pick=account] [data-value=reseller]`);
    const resellerCost = Math.round(small('website') * (100 - pricing.wholesalePercent)) / 100;
    check(await big(earn) === money((49 - resellerCost) * 10) && (await text(`${earn} .calc-result .eyebrow`)).includes('reseller'), 'earnings calculator: a reseller pays the wholesale price', await big(earn));
    await page.screenshot({ path: resolve(SHOTS, 'website-desktop-sellers.png'), fullPage: true });

    await page.goto(`${base}/guides/courses/`, { waitUntil: 'networkidle' });
    const community = small('community');
    check((await page.$$eval('[data-calc=course] dd', (d) => d.map((x) => x.textContent.trim()))).join() === [money(12 * (99 + 100)), money(12 * community), money(12 * (99 + 100) - 12 * community)].join(), 'course calculator: a year on a course platform next to Community',
        (await page.$$eval('[data-calc=course] dd', (d) => d.map((x) => x.textContent.trim()))).join());

    // Try It: the page's own bar and loading screen around a stand-in for demo.anypress.site's Playground client, the
    // blueprints and the shop, so the checks don't start a real WordPress in the browser.
    const RAW = 'https://raw.githubusercontent.com/otaku-solutions/';
    const tryPage = async (query, { width = 1280, title } = {}) => {
        const tab = await browser.newPage({ viewport: { width, height: 860 } });
        tab.on('pageerror', (e) => errors.push(`${query}: ${e.message}`));
        await tab.route('https://demo.anypress.site/client/index.js', (r) => r.fulfill({ contentType: 'text/javascript', body: readFileSync(resolve(HERE, 'anypress-io/fake-playground.js'), 'utf8') }));
        await tab.route(`${RAW}**`, (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ steps: [{ step: 'login' }], fail: r.request().url().includes('fail') }) }));
        await tab.route('https://shop.anypress.io/**', (r) => r.fulfill({ contentType: 'text/html', body: '<h1>Shop</h1>' }));
        if (title) await tab.addInitScript((t) => { window.__pageTitle = t; }, title);
        const res = await tab.goto(`${base}/try/${query}`, { waitUntil: 'domcontentloaded' });
        return { tab, res };
    };
    const shown = (tab, sel) => tab.locator(sel).isVisible();
    await php("delete_option('fake_api_calls'); echo 1;");

    let { tab, res } = await tryPage('?type=bookings');
    check(/no-cache|no-store/.test(res.headers()['cache-control'] ?? ''), 'try it: the page is never cached', res.headers()['cache-control']);
    check(await shown(tab, '.wp-block-anypress-io-try__starting') && (await tab.locator('.wp-block-anypress-io-try__starting p').first().textContent()).includes('about a minute'), 'try it: shows our own loading screen while the demo starts');
    await tab.waitForSelector('.wp-block-anypress-io-try.is-ready', { timeout: 10000 });
    let started = await tab.evaluate(() => ({ remote: window.__try.remoteUrl, steps: window.__try.blueprint.steps.length, bar: window.__try.disableProgressBar, files: Object.keys(window.__try.files),
        nav: [...document.querySelectorAll('.wp-block-anypress-io-try__types a')].map((a) => `${a.textContent}${a.getAttribute('aria-current') ? '*' : ''}`).join(), fill: document.querySelector('.wp-block-anypress-io-try__fill').style.width }));
    check(started.remote === 'https://demo.anypress.site/remote.html' && started.bar === true, 'try it: starts our own Playground, without its progress bar', JSON.stringify(started));
    check(started.nav === 'Website,Bookings*,Online Store,Community,Everything,HighLevel', 'try it: the bar lists the six site types with Bookings picked', started.nav);
    check(parseInt(started.fill, 10) >= 60, 'try it: the progress bar follows Playground starting', started.fill);
    check(started.files.includes('/wordpress/wp-content/mu-plugins/anypress-demo-assistant.php'), "try it: the website assistant gets the API's demo sign-in");
    check(await shown(tab, '.wp-block-anypress-io-try__frame') && !(await shown(tab, '.wp-block-anypress-io-try__status')) && await shown(tab, '.wp-block-anypress-io-try__keep') && !(await shown(tab, '.wp-block-anypress-io-try__get')),
        'try it: once running, the demo shows and Make This My Site takes the place of Get This Site');
    check((await tab.locator('.wp-block-anypress-io-try__note').textContent()).includes('click Make This My Site'), 'try it: the bar says the demo isn’t saved and how to keep it');
    await tab.screenshot({ path: resolve(SHOTS, 'website-desktop-try.png') });
    await tab.click('.wp-block-anypress-io-try__keep');
    await tab.waitForURL('https://shop.anypress.io/**', { timeout: 15000 });
    check(tab.url() === 'https://shop.anypress.io/item/bookings-small/?demo=d_test123', 'try it: Make This My Site saves the demo and goes to the plan’s checkout with it', tab.url());
    const calls = await php("echo json_encode(get_option('fake_api_calls', []));");
    const draft = calls.find((c) => c[0] === 'draft');
    check(calls.some((c) => c[0] === 'assistant' && c[1].siteType === 'bookings') && draft?.[1].siteType === 'bookings' && draft[1].content.pages[0].title === 'Home' && draft[1].images.join() === 'photo.jpg,elsewhere.jpg',
        "try it: the site passes the demo's pages and photo names to the API's demo routes", JSON.stringify(calls).slice(0, 300));
    check(calls.filter((c) => c[0] === 'upload').length === 1 && calls.find((c) => c[0] === 'upload')[1] === 'PUT' && calls.find((c) => c[0] === 'upload')[2] === 1234,
        'try it: photos go to the upload links, and only to object storage', JSON.stringify(calls.filter((c) => c[0] === 'upload')));
    await tab.close();

    ({ tab } = await tryPage('?type=website', { title: 'Too big' }));
    await tab.waitForSelector('.wp-block-anypress-io-try.is-ready', { timeout: 10000 });
    await tab.click('.wp-block-anypress-io-try__keep');
    await tab.waitForSelector('.wp-block-anypress-io-try__error:not([hidden])', { timeout: 10000 });
    check(await tab.locator('.wp-block-anypress-io-try__error').textContent() === 'This demo is too large to save.' && await tab.locator('.wp-block-anypress-io-try__keep').isEnabled(),
        "try it: when the API won't take the demo, its words show and the button works again");
    const asked = await tab.evaluate(() => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; });
    await tab.close();
    check(asked, 'try it: a running demo asks before the tab closes');

    ({ tab } = await tryPage('?type=highlevel'));
    await tab.waitForSelector('.wp-block-anypress-io-try.is-ready', { timeout: 10000 });
    check(!(await shown(tab, '.wp-block-anypress-io-try__keep')) && (await tab.getAttribute('.wp-block-anypress-io-try__get', 'href')) === `${base}/highlevel/`, 'try it: a HighLevel demo links to the HighLevel page instead of keeping the demo');
    await tab.close();

    ({ tab } = await tryPage(`?blueprint=${encodeURIComponent(`${RAW}anypress-theme/main/kits/ridge.json`)}&title=Ridge`));
    await tab.waitForSelector('.wp-block-anypress-io-try.is-ready', { timeout: 10000 });
    check(await tab.locator('.wp-block-anypress-io-try__title').textContent() === 'Ridge' && !(await shown(tab, '.wp-block-anypress-io-try__types')) && (await tab.getAttribute('.wp-block-anypress-io-try__get', 'href')) === `${base}/pricing/`,
        "try it: a kit's example site shows its name, with Get This Site going to the prices");
    await tab.close();

    ({ tab } = await tryPage(`?blueprint=${encodeURIComponent('https://elsewhere.example/blueprint.json')}`));
    await tab.waitForSelector('.wp-block-anypress-io-try.is-ready', { timeout: 10000 });
    check(await tab.evaluate(() => window.__try.blueprint && document.querySelector('.wp-block-anypress-io-try__types a[aria-current]')?.textContent) === 'Website', "try it: a link can't make the page run someone else's blueprint");
    await tab.close();

    ({ tab } = await tryPage('?for=p_AAAAAAAAAAAAAAAA'));
    await tab.waitForSelector('.wp-block-anypress-io-try.is-ready', { timeout: 10000 });
    started = await tab.evaluate(() => ({ steps: window.__try.blueprint.steps.map((s) => s.step).join(), type: document.querySelector('.wp-block-anypress-io-try__types a[aria-current]')?.textContent }));
    check(started.type === 'Online Store' && started.steps === 'login,writeFile,runPHP', "try it: a business's demo opens its site type with their look added", JSON.stringify(started));
    await tab.close();

    ({ tab } = await tryPage('?for=p_BBBBBBBBBBBBBBBB'));
    await tab.waitForSelector('.wp-block-anypress-io-try__gone:not([hidden])', { timeout: 10000 });
    check(true, 'try it: an ended business demo says so and links to the demos');
    await tab.close();

    ({ tab } = await tryPage(`?blueprint=${encodeURIComponent(`${RAW}anypress-theme/main/fail.json`)}&title=Broken`));
    await tab.waitForSelector('.wp-block-anypress-io-try__failed:not([hidden])', { timeout: 10000 });
    check(await shown(tab, '.wp-block-anypress-io-try__retry'), "try it: a demo that doesn't start says why and offers another try");
    await tab.close();

    ({ tab } = await tryPage('?type=community', { width: 390 }));
    await tab.waitForSelector('.wp-block-anypress-io-try.is-ready', { timeout: 10000 });
    const phoneBar = await tab.evaluate(() => ({ scroll: document.documentElement.scrollWidth - innerWidth, keep: document.querySelector('.wp-block-anypress-io-try__keep').getBoundingClientRect().right <= innerWidth,
        navScrolls: document.querySelector('.wp-block-anypress-io-try__types').scrollWidth > document.querySelector('.wp-block-anypress-io-try__types').clientWidth }));
    check(phoneBar.scroll <= 0 && phoneBar.keep && phoneBar.navScrolls, 'phone: the Try It bar fits, its site types scroll sideways', JSON.stringify(phoneBar));
    await tab.screenshot({ path: resolve(SHOTS, 'website-phone-try.png') });
    await tab.close();

    const noNonce = await fetch(`${base}/wp-json/anypress-io/v1/demo/draft`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteType: 'website', content: {} }) });
    check(noNonce.status === 401 || noNonce.status === 403, "try it: the demo routes refuse calls that don't come from the page", String(noNonce.status));

    // Every page: renders without leftover shortcodes or PHP errors, fits a phone, and is valid blocks in the editor.
    const shotPages = resolve(SHOTS, 'pages');
    mkdirSync(shotPages, { recursive: true });
    // Try It starts a real demo from demo.anypress.site, so it's checked above against a stand-in instead.
    for (const made of pagesMade.filter((m) => !m.block)) {
        const url = `${base}/${made.path ? `${made.path}/` : ''}`;
        for (const [name, width] of [['desktop', 1440], ['phone', 390]]) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(url, { waitUntil: 'networkidle' });
            // Scroll down the page so lazy images load, as a visitor's would.
            await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
            await page.waitForLoadState('networkidle');
            const seen = await page.evaluate(() => ({ text: document.body.innerText, scroll: document.documentElement.scrollWidth - innerWidth,
                broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src) }));
            if (name === 'desktop') {
                check(!/\[anypress_|Fatal error|Warning:/.test(seen.text) && seen.broken.length === 0, `/${made.path}: renders with prices filled in and every image`, seen.broken.join(' '));
            } else {
                check(seen.scroll <= 0, `/${made.path}: fits a phone`, String(seen.scroll));
            }
            await page.screenshot({ path: resolve(shotPages, `${made.file}-${name}.png`), fullPage: true });
        }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    const home = await page.evaluate(() => document.body.innerText);
    const lowest = Math.min(...pricing.siteTypes.map((t) => t.monthly.small));
    check(home.includes(`From ${money(lowest)}`) && home.includes(`Bookings · ${money(small('bookings'))}/mo`), 'home: prices come from the price list', '');

    // The sign-up form keeps anypress.io's markup and goes to the Fluent Forms form setup.php imports: on a group's
    // page it reaches the shop with that group.
    await page.goto(`${base}/who/shops/`, { waitUntil: 'networkidle' });
    await page.fill('form[data-anypress-form] input[name="email"]', 'tips@anypress.example');
    await page.click('form[data-anypress-form] button[type="submit"]');
    await page.waitForSelector('[role=status]:has-text("Check your inbox")', { timeout: 30000 }).catch(() => {});
    await php(`do_action('fluentform/submission_inserted', 9, ['anypress_lead' => '1', 'email' => 'seller@anypress.example', 'group' => 'sellers'], (object) ['id' => 5, 'title' => 'Sign-up']); echo 1;`);
    const tipLeads = await php("echo json_encode(get_option('fake_shop_leads', []));");
    const tip = tipLeads.find((l) => l.email === 'tips@anypress.example');
    const sellerTip = tipLeads.find((l) => l.email === 'seller@anypress.example');
    check(tip?.group === 'shops' && (await page.textContent('[role=status]').catch(() => '')).includes('Check your inbox'), "sign-up form: a sign-up on a group's page thanks the visitor and reaches the shop with that group", JSON.stringify(tip));
    check(sellerTip?.group === 'agencies' && sellerTip?.interest === 'Seller', 'sign-up form: a sign-up on the sellers page reaches the shop as a seller', JSON.stringify(sellerTip));

    const editor = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await editor.goto(`${base}/wp-login.php`);
    await editor.fill('#user_login', 'admin');
    await editor.fill('#user_pass', 'password');
    await editor.click('#wp-submit');
    await editor.waitForLoadState('networkidle');
    const pageIds = await php(`echo json_encode(array_map(fn($p) => get_page_by_path($p['path'] === '' ? 'home' : $p['path'])?->ID, json_decode(${JSON.stringify(JSON.stringify(pagesMade))}, true)));`);
    for (const [i, id] of pageIds.entries()) {
        await editor.goto(`${base}/wp-admin/post.php?post=${id}&action=edit`, { waitUntil: 'domcontentloaded' });
        await editor.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlocks().length > 0, null, { timeout: 60000 });
        const invalid = await editor.evaluate(() => {
            const bad = [];
            const walk = (blocks) => blocks.forEach((b) => { if (!b.isValid) bad.push(b.name); walk(b.innerBlocks); });
            walk(window.wp.data.select('core/block-editor').getBlocks());
            return bad;
        });
        check(invalid.length === 0, `/${pagesMade[i].path}: every block is valid in the editor`, invalid.slice(0, 8).join(', '));
    }
    await editor.close();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/pricing/`, { waitUntil: 'networkidle' });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'phone: the price calculator fits the screen');
    await page.screenshot({ path: resolve(SHOTS, 'website-phone-pricing.png'), fullPage: true });
    check(errors.length === 0, 'no JavaScript errors', errors.join(' | '));
} finally {
    await browser.close();
}

const log = await cli.playground.run({ code: "<?php echo @file_get_contents('/wordpress/wp-content/debug.log') ?: '';" });
const ours = log.text.split('\n').filter((l) => l.includes('anypress-io'));
check(ours.length === 0, 'no PHP notices or errors from the site plugin', ours.slice(0, 3).join(' | '));
console.log(failures.length ? `\n${failures.length} check(s) failed` : `\nAll checks passed. Screenshots in ${SHOTS}`);
await cli[Symbol.asyncDispose]?.();
process.exit(failures.length ? 1 : 0);

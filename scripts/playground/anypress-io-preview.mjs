// anypress.io on WordPress Playground, as a website store: the AnyPress theme and Blocks, the website site type's
// plugins at the store template's versions, AnyPress Client from this checkout with ANYPRESS_TENANT_ROLES=website, and
// the anypress.io site plugin (scripts/anypress-io/plugin) as a must-use plugin, as the store runs it. Checks its calculators against the price list in a real
// browser, and that a Fluent Forms sign-up goes to the shop's lead route, then screenshots them.
//
//   cd scripts/playground && npm ci
//   npm run anypress-io                    # checks and screenshots into anypress-io-shots/, exit 1 on a failure
//   npm run anypress-io -- --serve         # keep the site running at http://127.0.0.1:9430 afterwards
//
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
        { step: 'installTheme', themeData: literal(resolve(HERE, 'preview-zips/anypress.zip'), 'anypress.zip'), options: { activate: true } },
        ...pinned.map(([slug, version]) => ({ step: 'installPlugin', pluginData: { resource: 'url', url: `https://downloads.wordpress.org/plugin/${slug}.${version}.zip` } })),
        { step: 'installPlugin', pluginData: literal(resolve(HERE, 'preview-zips/anypress-blocks.zip'), 'anypress-blocks.zip') },
        { step: 'mkdir', path: '/wordpress/wp-content/plugins/anypress-client-data' },
        { step: 'writeFile', path: '/wordpress/wp-content/plugins/anypress-client-data/roles.json', data: JSON.stringify(roles) },
        { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/0-anypress-store-env.php', data: "<?php putenv('ANYPRESS_IS_TENANT=true'); define('ANYPRESS_TENANT_ROLES', 'website'); define('DISALLOW_FILE_MODS', true);\n" },
        // Stands in for the shop's lead route: records each request instead of sending it.
        { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/1-fake-shop.php', data: "<?php add_filter('pre_http_request', function ($pre, $args, $url) { if (!str_starts_with($url, 'https://shop.anypress.io/wp-json/anypress/v1/lead')) return $pre; update_option('fake_shop_leads', array_merge(get_option('fake_shop_leads', []), [json_decode($args['body'], true)])); return ['headers' => [], 'body' => '{\"confirm\":true}', 'response' => ['code' => 200, 'message' => 'OK'], 'cookies' => [], 'filename' => null]; }, 10, 3);\n" },
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

const calc = (kind, extra = {}) => `<!-- wp:anypress-io/calculator ${JSON.stringify({ kind, align: "wide", ...extra })} /-->`;
const ids = await php(`echo json_encode([
    'pricing' => wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Pricing', 'post_name' => 'pricing', 'post_content' => ${JSON.stringify(calc('price'))}]),
    'sellers' => wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Sellers', 'post_name' => 'sellers', 'post_content' => ${JSON.stringify(calc('earnings'))}]),
    'courses' => wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Courses', 'post_name' => 'courses', 'post_content' => ${JSON.stringify(calc('course'))}]),
]);`);

if (SERVE) {
    console.log(`Serving ${base}: /pricing/, /sellers/, /courses/. Ctrl+C to stop.`);
    await new Promise(() => {});
}

const active = await php("echo json_encode(['site' => function_exists('anypress_io_pricing'), 'forms' => is_plugin_active('fluentform/fluentform.php'), 'block' => WP_Block_Type_Registry::get_instance()->is_registered('anypress-io/calculator'), 'types' => count(anypress_io_site_types())]);");
check(active.site && active.forms && active.block, 'the site plugin, its calculator block and Fluent Forms are on, on a website store', JSON.stringify(active));
check(active.types === 5, 'the price list has the five kinds of site', String(active.types));

// A sign-up through Fluent Forms reaches the shop's lead route with the form's fields.
await php(`do_action('fluentform/submission_inserted', 7, ['anypress_lead' => '1', 'email' => 'sam@anypress.example', 'names' => ['first_name' => 'Sam', 'last_name' => 'Rivera'], 'group' => 'seller', 'beta' => '1'], (object) ['id' => 3, 'title' => 'Beta']);
    do_action('fluentform/submission_inserted', 8, ['email' => 'other@anypress.example'], (object) ['id' => 4, 'title' => 'Contact']);
    echo 1;`);
const leads = await php("echo json_encode(get_option('fake_shop_leads', []));");
check(leads.length === 1 && leads[0].email === 'sam@anypress.example' && leads[0].name === 'Sam Rivera' && leads[0].group === 'seller' && leads[0].beta === '1' && leads[0].source === 'anypress.io Beta',
    "a sign-up form sends its email, name, group and beta answer to the shop's lead route, and other forms send nothing", JSON.stringify(leads));

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

    await page.goto(`${base}/pricing/`, { waitUntil: 'networkidle' });
    check(await text('.anypress-calc-big span') === money(small('online-store')), 'price calculator: starts on one Small store at its monthly price', await text('.anypress-calc-big span'));
    await page.click('.anypress-calc-types button:has-text("Website")');
    await page.$eval('input[data-field="count"]', (e) => { e.value = '10'; e.dispatchEvent(new Event('input', { bubbles: true })); });
    const ten = Math.round(small('website') * (1 - tier(10) / 100) * 100) / 100;
    check(await text('.anypress-calc-big span') === money(ten * 10) && (await text('.anypress-calc-line')).includes(`(you save ${tier(10)}%)`), 'price calculator: ten website sites get the volume saving', await text('.anypress-calc-line'));
    await page.click('.anypress-calc-seg button:has-text("Yearly")');
    check(await text('.anypress-calc-big span') === money(Math.round(small('website') * pricing.yearlyMonths * (1 - tier(10) / 100) * 100) / 100 * 10) && await text('.anypress-calc-big small') === '/ year', 'price calculator: yearly costs the yearly months');
    check((await page.getAttribute('.anypress-calc-go', 'href')) === 'https://shop.anypress.io/item/website-small/', 'price calculator: the button goes to the plan on the shop');
    check(await page.getAttribute('.anypress-calc-types button:has-text("Website")', 'aria-pressed') === 'true', 'price calculator: the picked kind of site shows as pressed');
    await page.screenshot({ path: resolve(SHOTS, 'website-desktop-pricing.png'), fullPage: true });

    await page.goto(`${base}/sellers/`, { waitUntil: 'networkidle' });
    const sellerCost = Math.round(small('website') * (100 - tier(10))) / 100;
    check(await text('.anypress-calc-big span') === money((49 - sellerCost) * 10), 'earnings calculator: a seller with ten $49 website clients keeps the difference', await text('.anypress-calc-big span'));
    await page.click('.anypress-calc-seg button:has-text("Reseller")');
    const resellerCost = Math.round(small('website') * (100 - pricing.wholesalePercent)) / 100;
    check(await text('.anypress-calc-big span') === money((49 - resellerCost) * 10) && (await text('.anypress-calc-eyebrow')).includes('reseller'), 'earnings calculator: a reseller pays the wholesale price', await text('.anypress-calc-big span'));
    check(await page.getAttribute('.anypress-calc-compare tbody tr:nth-child(2)', 'aria-current') === 'true', 'earnings calculator: the comparison marks the reseller row');
    await page.screenshot({ path: resolve(SHOTS, 'website-desktop-sellers.png'), fullPage: true });

    await page.goto(`${base}/courses/`, { waitUntil: 'networkidle' });
    const community = small('community');
    check((await page.$$eval('.anypress-calc-rows dd', (d) => d.map((x) => x.textContent))).join() === [money(12 * (99 + 100)), money(12 * community), money(12 * (99 + 100) - 12 * community)].join(), 'course calculator: a year on a course platform next to Community');

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

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
    'try' => wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Try it', 'post_name' => 'try', 'post_content' => '<!-- wp:anypress-io/try /-->', 'page_template' => 'page-blank']),
]);`);

if (SERVE) {
    console.log(`Serving ${base}: /pricing/, /sellers/, /courses/, /try/ (the real demo, from demo.anypress.site). Ctrl+C to stop.`);
    await new Promise(() => {});
}

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
    check(await shown(tab, '.wp-block-anypress-io-try__starting') && (await tab.locator('.wp-block-anypress-io-try__heading').first().textContent()).includes('about a minute'), 'try it: shows our own loading screen while the demo starts');
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

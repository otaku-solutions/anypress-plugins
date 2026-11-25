// AnyPress Client's "sign in with your shop account" (src/Features/ShopSignIn.php) between two Playground sites side by
// side: a shop running AnyPress Host (its account sign-in, src/Api/AccountSignIn.php) and a community store (site
// type community: AnyPress Client with ANYPRESS_TENANT_ROLES=community, FluentCommunity, FluentAuth, FluentEvent and
// scripts/community/setup.php). A real browser signs a customer in through the shop; the community makes the member,
// links them to the shop account and signs them in; a seller joins the sellers' space and leaves it when the shop stops
// calling them a seller; a site manager's email and a forged answer are turned away.
//
//   cd scripts/playground && npm ci
//   npm run shop-sign-in
//
// Needs packages/anypress-client/vendor and packages/anypress-host/vendor (composer install), an anypress-api
// checkout next to this repository (or ANYPRESS_API_DIR), and network access to downloads.wordpress.org.
// The shop's groups come from a stand-in filter here; on the real shop anypress-crm.php adds them from FluentCRM tags.

import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runCLI } from '@wp-playground/cli';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const CLIENT = resolve(ROOT, 'packages/anypress-client');
const HOST = resolve(ROOT, 'packages/anypress-host');
const API = process.env.ANYPRESS_API_DIR || resolve(ROOT, '../anypress-api');
const WP = `https://wordpress.org/wordpress-${process.env.PLAYGROUND_WP || '7.1.5'}.zip`;
const SHOP_PORT = Number(process.env.SHOP_PORT || 9450);
const COMMUNITY_PORT = Number(process.env.COMMUNITY_PORT || 9451);
const SHOP = `http://127.0.0.1:${SHOP_PORT}`;
const COMMUNITY = `http://127.0.0.1:${COMMUNITY_PORT}`;

for (const [path, fix] of [
    [resolve(CLIENT, 'vendor/autoload.php'), 'run composer install in packages/anypress-client'],
    [resolve(HOST, 'vendor/autoload.php'), 'run composer install in packages/anypress-host'],
    [resolve(API, 'templates/anypress-store/roles.json'), 'set ANYPRESS_API_DIR to an anypress-api checkout'],
]) {
    if (!existsSync(path)) {
        console.error(`${path} is missing: ${fix} first.`);
        process.exit(1);
    }
}

const literal = (path, name) => ({ resource: 'literal', name, contents: readFileSync(path) });
const theme = { step: 'installTheme', themeData: literal(resolve(HERE, 'preview-zips/anypress.zip'), 'anypress.zip'), options: { activate: true } };

const shop = await runCLI({
    command: 'server',
    wp: WP,
    php: '8.3',
    port: SHOP_PORT,
    blueprint: {
        steps: [
            { step: 'defineWpConfigConsts', consts: { WP_DEBUG: true, WP_DEBUG_LOG: true, WP_DEBUG_DISPLAY: false } },
            { step: 'setSiteOptions', options: { blogname: 'AnyPress Shop' } },
            theme,
            // The shop sells on FluentCart; AnyPress Host's account routes answer only with a shop to read from.
            { step: 'installPlugin', pluginData: { resource: 'wordpress.org/plugins', slug: 'fluent-cart' }, options: { activate: true } },
            { step: 'activatePlugin', pluginPath: 'anypress-host/anypress-host.php' },
            // Stand-ins: AnyPress Host adds "customer" for an account with a website plan, and the shop's anypress-crm.php adds
            // "seller" from FluentCRM's "Seller: Active" tag.
            { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/groups.php', data: "<?php add_filter('anypress_host_account_groups', function ($groups, $user) { if (get_user_meta($user->ID, 'test_customer', true)) { $groups[] = 'customer'; } return get_user_meta($user->ID, 'test_seller', true) ? array_merge($groups, ['seller']) : $groups; }, 10, 2);\n" },
        ],
    },
    mount: [{ hostPath: HOST, vfsPath: '/wordpress/wp-content/plugins/anypress-host' }],
    verbosity: 'quiet',
});

const community = await runCLI({
    command: 'server',
    wp: WP,
    php: '8.3',
    port: COMMUNITY_PORT,
    blueprint: {
        features: { networking: true },
        steps: [
            { step: 'defineWpConfigConsts', consts: { WP_DEBUG: true, WP_DEBUG_LOG: true, WP_DEBUG_DISPLAY: false } },
            { step: 'setSiteOptions', options: { permalink_structure: '/%postname%/', blogname: 'AnyPress Community' } },
            theme,
            ...['fluent-community.2.15.0.zip', 'fluent-security.3.1.1.zip'].map((zip) => ({ step: 'installPlugin', pluginData: { resource: 'url', url: `https://downloads.wordpress.org/plugin/${zip}` }, options: { activate: true } })),
            { step: 'installPlugin', pluginData: literal(resolve(API, 'templates/anypress-store/plugins/fluent-event-1.0.1.zip'), 'fluent-event.zip'), options: { activate: true } },
            { step: 'mkdir', path: '/wordpress/wp-content/plugins/anypress-client-data' },
            { step: 'writeFile', path: '/wordpress/wp-content/plugins/anypress-client-data/roles.json', data: readFileSync(resolve(API, 'templates/anypress-store/roles.json'), 'utf8') },
            { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/0-anypress-store-env.php', data: "<?php putenv('ANYPRESS_IS_TENANT=true'); define('ANYPRESS_TENANT_ROLES', 'community'); define('DISALLOW_FILE_MODS', true);\n" },
            { step: 'activatePlugin', pluginPath: 'anypress-client/anypress-client.php' },
            { step: 'writeFile', path: '/tmp/community-setup.php', data: readFileSync(resolve(ROOT, 'scripts/community/setup.php'), 'utf8') },
            ...readdirSync(resolve(ROOT, 'scripts/community')).filter((file) => /\.(png|html)$/.test(file)).map((file) => ({ step: 'writeFile', path: `/tmp/${file}`, data: file.endsWith('.html') ? readFileSync(resolve(ROOT, 'scripts/community', file), 'utf8') : new Uint8Array(readFileSync(resolve(ROOT, 'scripts/community', file))) })),
        ],
    },
    mount: [{ hostPath: CLIENT, vfsPath: '/wordpress/wp-content/plugins/anypress-client' }],
    verbosity: 'quiet',
});
console.log(`Shop at ${SHOP}, community (site type community) at ${COMMUNITY}`);

const run = async (cli, code) => (await cli.playground.run({ code: `<?php require '/wordpress/wp-load.php'; ${code}` })).text.trim();
let failed = 0;
const check = (ok, what, detail = '') => {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${ok || !detail ? '' : `: ${detail}`}`);
    if (!ok) failed++;
};

try {
    // The community: its spaces (no sample members), then connected to the shop.
    const setup = await run(community, `
        class WP_CLI { public static function log($m) {} public static function success($m) { echo 'Success'; } public static function error($m) { throw new RuntimeException($m); } }
        wp_update_user(['ID' => 1, 'user_email' => 'owner@anypress.example']);
        wp_set_current_user(1); $args = []; include '/tmp/community-setup.php';
        echo ' ', \\AnyPressClient\\Features\\ShopSignIn::redirect_uri();
    `);
    const redirectUri = setup.split(' ').pop();
    check(setup.startsWith('Success') && redirectUri.startsWith(COMMUNITY), 'the community is set up', setup);

    // The shop: two customers, one of them a seller, and the community registered as a sign-in client.
    const client = JSON.parse(await run(shop, `
        foreach ([['pat', 'pat@anypress.example', 'Pat Rivera'], ['dev', 'dev@anypress.example', 'Dev Patel'], ['boss', 'owner@anypress.example', 'Same Email As The Community Admin']] as [$login, $email, $name]) {
            if (!username_exists($login)) { wp_insert_user(['user_login' => $login, 'user_email' => $email, 'user_pass' => 'shop-password', 'display_name' => $name, 'role' => 'subscriber']); }
        }
        update_user_meta(get_user_by('login', 'dev')->ID, 'test_seller', 1);
        update_user_meta(get_user_by('login', 'pat')->ID, 'test_customer', 1);
        echo wp_json_encode(\\AnyPressHost\\Api\\AccountClients::create('AnyPress Community', ['${redirectUri}']));
    `));
    check(Boolean(client.client_id && client.client_secret), 'the shop registers the community as a sign-in client');

    const connected = await run(community, `
        \\AnyPressClient\\Features\\ShopSignIn::save(['shop' => '${SHOP}', 'client_id' => '${client.client_id}', 'client_secret' => '${client.client_secret}', 'label' => 'Sign in with your AnyPress account', 'spaces' => ['customer' => ['customers'], 'seller' => ['sellers-and-resellers'], 'reseller' => ['sellers-and-resellers']]]);
        echo \\AnyPressClient\\Features\\ShopSignIn::settings() ? 'yes' : 'no';
    `);
    check(connected === 'yes', 'the community is connected to the shop');

    const reach = await run(community, `$r = wp_remote_post('${SHOP}/wp-json/anypress-host/v1/account/token', ['body' => ['grant_type' => 'x']]); echo is_wp_error($r) ? $r->get_error_message() : wp_remote_retrieve_response_code($r) . ' ' . substr(wp_remote_retrieve_body($r), 0, 200);`);
    check(/^\d{3} /.test(reach), 'the community reaches the shop', reach);

    const { chromium } = createRequire(import.meta.url)('playwright');
    const browser = await chromium.launch();

    /** Signs in on the community through the shop, as a visitor would; returns the page where they end up. */
    async function signIn(login, start = `${COMMUNITY}/space/say-hello/home`) {
        const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
        const page = await context.newPage();
        await page.goto(start, { waitUntil: 'networkidle' }).catch(() => {});
        await page.goto(`${COMMUNITY}/wp-login.php`, { waitUntil: 'domcontentloaded' });
        const button = page.locator('.anypress-shop-sign-in a');
        const buttonText = (await button.textContent().catch(() => '')) || '';
        await page.goto(`${COMMUNITY}/wp-login.php?action=anypress-shop-sign-in&redirect_to=${encodeURIComponent(start)}`, { waitUntil: 'domcontentloaded' });
        const onShop = page.url().startsWith(SHOP);
        if (onShop && (await page.locator('#user_login').count())) {
            await page.fill('#user_login', login);
            await page.fill('#user_pass', 'shop-password');
            await Promise.all([page.waitForLoadState('domcontentloaded'), page.click('#wp-submit')]);
            await page.waitForURL((url) => !url.href.startsWith(SHOP), { timeout: 20000 }).catch(() => {});
        }
        await page.waitForLoadState('networkidle').catch(() => {});
        return { context, page, onShop, buttonText, body: await page.content() };
    }

    const pat = await signIn('pat');
    check(pat.buttonText.includes('Sign in with your AnyPress account'), 'wp-login.php shows the shop sign-in button', pat.buttonText);
    check(pat.onShop, 'the sign-in starts on the shop');
    check(pat.page.url().startsWith(`${COMMUNITY}/space/say-hello`), 'the customer comes back to the page they asked for', `${pat.page.url()} ${(await pat.page.locator('body').innerText().catch(() => '')).slice(0, 300)}`);
    mkdirSync(resolve(HERE, 'community-shots'), { recursive: true });
    await pat.page.screenshot({ path: resolve(HERE, 'community-shots/shop-sign-in.png') });
    await pat.context.close();

    const member = JSON.parse(await run(community, `
        $u = get_user_by('email', 'pat@anypress.example');
        echo wp_json_encode($u ? ['login' => $u->user_login, 'name' => $u->display_name, 'roles' => $u->roles, 'link' => get_user_meta($u->ID, 'anypress_shop_account', true), 'profile' => (bool) \\FluentCommunity\\App\\Models\\XProfile::where('user_id', $u->ID)->exists()] : null);
    `));
    check(member?.name === 'Pat Rivera' && member.roles.includes('subscriber'), 'the community makes a member with the shop name', JSON.stringify(member));
    check(/^127\.0\.0\.1:\d+$/.test(member?.link || ''), 'the member is linked to the shop account', member?.link);
    check(member?.profile === true, 'the member has a community profile');

    const again = await signIn('pat');
    const count = await run(community, `echo count(get_users(['search' => 'pat@anypress.example', 'search_columns' => ['user_email']]));`);
    check(again.page.url().startsWith(COMMUNITY) && count === '1', 'signing in again uses the same member', `${again.page.url()} ${count}`);
    await again.context.close();

    const inSpace = (email, slug) => run(community, `
        $u = get_user_by('email', '${email}'); $s = \\FluentCommunity\\App\\Models\\BaseSpace::query()->withoutGlobalScopes()->where('slug', '${slug}')->first();
        echo $u && \\FluentCommunity\\App\\Services\\Helper::isUserInSpace($u->ID, $s->id) ? 'yes' : 'no';
    `);
    const inSellers = (email) => inSpace(email, 'sellers-and-resellers');
    const dev = await signIn('dev');
    await dev.context.close();
    check((await inSellers('dev@anypress.example')) === 'yes', 'a seller joins Sellers And Resellers');
    check((await inSellers('pat@anypress.example')) === 'no', 'a customer who does not sell stays out of it');
    check((await inSpace('pat@anypress.example', 'customers')) === 'yes', 'a customer joins Customers');
    check((await inSpace('dev@anypress.example', 'customers')) === 'no', 'a seller without a website plan stays out of Customers');

    await run(shop, `delete_user_meta(get_user_by('login', 'dev')->ID, 'test_seller');`);
    const devAgain = await signIn('dev');
    await devAgain.context.close();
    check((await inSellers('dev@anypress.example')) === 'no', 'a seller who stops selling leaves it at the next sign-in');

    const boss = await signIn('boss');
    const admins = await run(community, `echo get_user_by('email', 'owner@anypress.example')->user_login, ' ', count(get_user_meta(1, 'anypress_shop_account'));`);
    check(boss.body.includes('password form') && admins === 'admin 0', 'a site manager with the same email is turned away', `${boss.page.url()} ${admins}`);
    await boss.context.close();

    // A made-up answer: a code with no state this site started.
    const forged = await fetch(`${COMMUNITY}/wp-login.php?action=anypress-shop-sign-in&code=made-up&state=${'a'.repeat(32)}`, { redirect: 'manual' });
    check(forged.status === 400, 'an answer this site did not ask for is refused', String(forged.status));

    await browser.close();
} catch (error) {
    check(false, String(error?.stack || error));
}

await community[Symbol.asyncDispose]?.();
await shop[Symbol.asyncDispose]?.();
process.exit(failed ? 1 : 0);

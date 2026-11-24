// Preview of the AnyPress community (community.anypress.io) on WordPress Playground, as a community store: the AnyPress
// theme, FluentCommunity, FluentAuth and FluentEvent at the store template's versions, AnyPress Client from this
// checkout with ANYPRESS_TENANT_ROLES=community, then scripts/community/setup.php with its sample content.
// Checks every space, the course, the events and the guidelines page, then screenshots them for a visitor and a
// member at desktop and phone width.
//
//   cd scripts/playground && npm ci
//   npm run community                      # checks and screenshots into community-shots/, exit 1 on a failure
//   npm run community -- --serve           # keep the site running at http://127.0.0.1:9420 afterwards
//
// Needs packages/anypress-client/vendor (composer install), an anypress-api checkout next to this repository (its
// store template's roles.json and FluentEvent zip; or ANYPRESS_API_DIR), and network access to downloads.wordpress.org.

import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runCLI } from '@wp-playground/cli';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const CLIENT = resolve(ROOT, 'packages/anypress-client');
const API = process.env.ANYPRESS_API_DIR || resolve(ROOT, '../anypress-api');
const THEME = resolve(HERE, 'preview-zips/anypress.zip');
const BLOCKS = resolve(HERE, 'preview-zips/anypress-blocks.zip');
const EVENT = resolve(API, 'templates/anypress-store/plugins/fluent-event-1.0.1.zip');
const SETUP = resolve(ROOT, 'scripts/community/setup.php');
const SHOTS = resolve(HERE, 'community-shots');
const WP = process.env.PLAYGROUND_WP || '7.1.5';
const PHP = process.env.PLAYGROUND_PHP || '8.3';
const PORT = Number(process.env.PLAYGROUND_PORT || 9420);
const SITE = `http://127.0.0.1:${PORT}`;
const SERVE = process.argv.includes('--serve');
// The store template's versions (anypress-api templates/anypress-store/build.sh).
const PLUGINS = ['fluent-community.2.15.0.zip', 'fluent-security.3.1.1.zip'];

for (const [path, fix] of [
    [resolve(CLIENT, 'vendor/autoload.php'), 'run composer install in packages/anypress-client'],
    [resolve(API, 'templates/anypress-store/roles.json'), 'set ANYPRESS_API_DIR to an anypress-api checkout'],
    [EVENT, 'set ANYPRESS_API_DIR to an anypress-api checkout'],
]) {
    if (!existsSync(path)) {
        console.error(`${path} is missing: ${fix} first.`);
        process.exit(1);
    }
}

const literal = (path, name) => ({ resource: 'literal', name, contents: readFileSync(path) });
const blueprint = {
    features: { networking: true },
    steps: [
        { step: 'defineWpConfigConsts', consts: { WP_DEBUG: true, WP_DEBUG_LOG: true, WP_DEBUG_DISPLAY: false, AUTOMATIC_UPDATER_DISABLED: true, DISABLE_WP_CRON: true } },
        { step: 'setSiteOptions', options: { permalink_structure: '/%postname%/', blogname: 'AnyPress Community' } },
        { step: 'installTheme', themeData: literal(THEME, 'anypress.zip'), options: { activate: true } },
        ...PLUGINS.map((zip) => ({ step: 'installPlugin', pluginData: { resource: 'url', url: `https://downloads.wordpress.org/plugin/${zip}` }, options: { activate: true } })),
        { step: 'installPlugin', pluginData: literal(EVENT, 'fluent-event.zip'), options: { activate: true } },
        { step: 'installPlugin', pluginData: literal(BLOCKS, 'anypress-blocks.zip'), options: { activate: true } },
        { step: 'mkdir', path: '/wordpress/wp-content/plugins/anypress-client-data' },
        { step: 'writeFile', path: '/wordpress/wp-content/plugins/anypress-client-data/roles.json', data: readFileSync(resolve(API, 'templates/anypress-store/roles.json'), 'utf8') },
        { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/0-anypress-store-env.php', data: "<?php putenv('ANYPRESS_IS_TENANT=true'); define('ANYPRESS_TENANT_ROLES', 'community');\n" },
        { step: 'activatePlugin', pluginPath: 'anypress-client/anypress-client.php' },
        { step: 'writeFile', path: '/tmp/community-setup.php', data: readFileSync(SETUP, 'utf8') },
        ...readdirSync(dirname(SETUP)).filter((file) => /\.(png|html)$/.test(file)).map((file) => ({ step: 'writeFile', path: `/tmp/${file}`, data: file.endsWith('.html') ? readFileSync(resolve(dirname(SETUP), file), 'utf8') : new Uint8Array(readFileSync(resolve(dirname(SETUP), file))) })),
        // As the store template sets them (anypress-api templates/anypress-store/presets.php and build.sh): the Events
        // page and tabs on, and no Hello World, Sample Page or Privacy Policy.
        { step: 'runPHP', code: "<?php require '/wordpress/wp-load.php'; \\FluentCommunity\\App\\Functions\\Utility::updateOption('_fluent_event_settings', array_merge(\\FluentCommunity\\Modules\\Integrations\\Integrations::getFluentEventSettings(), ['enable_fluent_event' => 'yes'])); foreach ([1, 2, 3] as $id) { wp_delete_post($id, true); }" },
    ],
};

const cli = await runCLI({
    command: 'server',
    wp: `https://wordpress.org/wordpress-${WP}.zip`,
    php: PHP,
    port: PORT,
    blueprint,
    mount: [{ hostPath: CLIENT, vfsPath: '/wordpress/wp-content/plugins/anypress-client' }],
    verbosity: 'quiet',
});
console.log(`WordPress ${WP} on PHP ${PHP}, site type community`);

async function php(code) {
    const out = await cli.playground.run({ code: `<?php require '/wordpress/wp-load.php'; ${code}` });
    return out.text.trim();
}

let failed = 0;
const check = (ok, what) => {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
    if (!ok) failed++;
};

try {
    // setup.php is written for `wp eval-file`; Playground has no WP-CLI, so a stand-in prints its lines.
    const setupOut = await php(`
        if (!class_exists('WP_CLI')) {
            class WP_CLI {
                public static function log($m) { echo $m, "\\n"; }
                public static function success($m) { echo 'Success: ', $m, "\\n"; }
                public static function error($m) { throw new RuntimeException($m); }
            }
        }
        wp_set_current_user(1);
        $args = ['sample'];
        try { include '/tmp/community-setup.php'; } catch (Throwable $e) { echo 'ERROR: ', $e->getMessage(), "\\n"; }
    `);
    console.log(setupOut.split('\n').map((l) => `     ${l}`).join('\n'));
    check(setupOut.includes('Success:'), 'setup.php runs with sample content');

    // A second run adds nothing.
    const again = await php(`
        class_exists('WP_CLI') || eval('class WP_CLI { public static function log($m) { echo $m, "\\n"; } public static function success($m) { echo "Success: ", $m, "\\n"; } public static function error($m) { throw new RuntimeException($m); } }');
        wp_set_current_user(1); $args = ['sample']; include '/tmp/community-setup.php';
    `);
    check(!/^(Group|Space|Page|Course|Event):/m.test(again), 'a second run adds nothing');

    const counts = JSON.parse(await php(`
        echo wp_json_encode([
            'spaces' => \\FluentCommunity\\App\\Models\\Space::query()->count(),
            'groups' => \\FluentCommunity\\App\\Models\\SpaceGroup::query()->count(),
            'posts' => \\FluentCommunity\\App\\Models\\Feed::query()->count(),
            'comments' => \\FluentCommunity\\App\\Models\\Comment::query()->count(),
            'courses' => \\FluentCommunity\\App\\Models\\Space::query()->withoutGlobalScopes()->where('type', 'course')->count(),
            'lessons' => \\FluentCommunity\\App\\Models\\Feed::query()->withoutGlobalScopes()->where('type', 'course_lesson')->count(),
            'events' => class_exists('FluentEvent\\\\App\\\\Models\\\\Event') ? \\FluentEvent\\App\\Models\\Event::query()->count() : -1,
            'home' => get_option('anypress_community_home'),
            'guidelines' => (bool) get_page_by_path('community-guidelines'),
            'join' => (bool) get_page_by_path('join'),
            'colours' => (apply_filters('fluent_community/color_schmea_config', ['light_schema' => 'default'], 'view')['light_schema'] ?? ''),
            'highlevel' => (string) (\\FluentCommunity\\App\\Models\\Space::query()->where('slug', 'highlevel-sites')->first()->logo ?? ''),
        ]);
    `));
    console.log(`     ${JSON.stringify(counts)}`);
    check(counts.spaces === 13 && counts.groups === 4, '13 spaces in 4 groups');
    check(counts.posts >= 14 && counts.comments >= 15, 'posts and comments in the spaces');
    check(counts.courses === 1 && counts.lessons === 6, 'the AnyPress Basics course with 6 lessons');
    check(counts.events === 3, 'three webinars in FluentEvent');
    check(counts.home === 'yes' && counts.guidelines, 'the community on the home page, and the guidelines page');
    check(counts.join, 'the /join page for visitors');
    check(counts.colours === 'anypress_site_colours', 'the community wears the site\'s own colours');
    check(counts.highlevel.includes('highlevel'), 'HighLevel Sites shows the HighLevel logo');

    const cookie = JSON.parse(await php(`
        $u = get_user_by('login', 'maya'); $e = time() + 7200;
        echo wp_json_encode(['member' => LOGGED_IN_COOKIE . '=' . rawurlencode(wp_generate_auth_cookie($u->ID, $e, 'logged_in')) . '; ' . AUTH_COOKIE . '=' . rawurlencode(wp_generate_auth_cookie($u->ID, $e, 'auth'))]);
    `)).member;
    for (const path of ['/', '/space/moving-in/home', '/course/anypress-basics/lessons', '/community-guidelines/']) {
        const res = await fetch(SITE + path, { headers: { cookie }, redirect: 'manual' });
        check(res.status === 200, `${path} opens for a member (${res.status})`);
    }

    // The machine's own Playwright and Chromium (not a dependency of this folder).
    const { chromium, devices } = createRequire(import.meta.url)('playwright');
    mkdirSync(SHOTS, { recursive: true });
    const browser = await chromium.launch();
    const pages = [['home', '/'], ['space', '/space/moving-in/home'], ['course', '/course/anypress-basics/lessons'], ['events', '/events'], ['spaces', '/discover/spaces'], ['guidelines', '/community-guidelines/'], ['join', '/join/']];
    for (const [who, withCookie] of [['visitor', false], ['member', true]]) {
        for (const [size, options] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', devices['iPhone 13']]]) {
            const context = await browser.newContext(options);
            if (withCookie) {
                await context.addCookies(cookie.split('; ').map((pair) => {
                    const [name, ...rest] = pair.split('=');
                    return { name, value: decodeURIComponent(rest.join('=')), url: SITE };
                }));
            }
            const page = await context.newPage();
            for (const [name, path] of pages) {
                const res = await page.goto(SITE + path, { waitUntil: 'networkidle' }).catch((error) => error);
                if (!res || res instanceof Error || res.status() >= 400) {
                    check(false, `${path} opens for a ${who} (${res instanceof Error ? res.message : res?.status()})`);
                }
                await page.waitForTimeout(1500);
                await page.screenshot({ path: resolve(SHOTS, `${who}-${size}-${name}.png`), fullPage: name === 'join' });
            }
            await context.close();
        }
    }
    await browser.close();
    console.log(`Screenshots in ${SHOTS}`);
} catch (error) {
    check(false, String(error?.stack || error));
    const log = await cli.playground.readFileAsText('/wordpress/wp-content/debug.log').catch(() => '');
    console.log(log.split('\n').filter((line) => /Fatal|Uncaught/.test(line)).slice(-5).join('\n'));
}

if (SERVE) {
    console.log(`Serving the community at ${SITE} (sign in at ${SITE}/wp-login.php as admin / password). Ctrl+C to stop.`);
} else {
    await cli[Symbol.asyncDispose]?.();
    process.exit(failed ? 1 : 0);
}

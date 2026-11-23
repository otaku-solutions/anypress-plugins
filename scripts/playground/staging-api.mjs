// The staging shop's pretend AnyPress API (scripts/test-storefront/remote/staging/anypress-staging-api.php) on
// WordPress Playground: AnyPress Host's own API client builds a pretend store that turns Done a minute later at the
// address the shop asked for, its address answers the shop's check, suspend, packs, care and backups are recorded,
// delete removes it, no call leaves the site, and on a site that isn't staging the plugin does nothing.
//
//   npm run staging-api

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCLI } from '@wp-playground/cli';

const HERE = dirname(fileURLToPath(import.meta.url));
const HOST = resolve(HERE, '../../packages/anypress-host');
const STAGING = resolve(HERE, '../test-storefront/remote/staging');

async function site(environment) {
    return runCLI({
        command: 'server',
        wp: `https://wordpress.org/wordpress-${process.env.PLAYGROUND_WP || '7.1.4'}.zip`,
        php: '8.3',
        port: Number(process.env.PLAYGROUND_PORT || 9433) + (environment === 'staging' ? 0 : 1),
        blueprint: {
            steps: [
                { step: 'defineWpConfigConsts', consts: { WP_ENVIRONMENT_TYPE: environment, ANYPRESS_API_KEY: 'k', ANYPRESS_API_SECRET: 's' } },
                { step: 'mkdir', path: '/wordpress/wp-content/mu-plugins' },
                { step: 'cp', fromPath: '/wordpress/wp-content/anypress-staging/anypress-staging-api.php', toPath: '/wordpress/wp-content/mu-plugins/anypress-staging-api.php' },
                { step: 'activatePlugin', pluginPath: 'anypress-host/anypress-host.php' },
            ],
        },
        mount: [
            { hostPath: HOST, vfsPath: '/wordpress/wp-content/plugins/anypress-host' },
            { hostPath: STAGING, vfsPath: '/wordpress/wp-content/anypress-staging' },
        ],
        verbosity: 'quiet',
    });
}

let failed = false;
const check = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failed = true; };

const staging = await site('staging');
const php = async (cli, code) => (await cli.playground.run({ code: `<?php require '/wordpress/wp-load.php';
use AnyPressHost\\Core\\{ConfigService, HttpService, ProvisioningApi};
$api = new ProvisioningApi(new HttpService(new ConfigService()));
$out = [];
// Nothing may leave the site: anything the pretend API passes on is caught and noted.
add_filter('pre_http_request', function ($pre, $args, $url) use (&$out) { if ($pre === false) { $out['leaked'][] = $url; return new WP_Error('blocked', 'test'); } return $pre; }, 99, 3);
${code}
echo wp_json_encode($out);` })).text;

const r = JSON.parse(await php(staging, `
$created = $api->create_tenant(['name' => 'Staging Bakery', 'wordpress_username' => 'owner', 'wordpress_email' => 'owner@anypress.example', 'wordpress_user_role' => 'administrator', 'wordpress_password' => 'secret-pass', 'external_id' => 'sub-1', 'custom_domain_name' => 'staging-bakery.anypress.site', 'size' => 'small']);
$out['created'] = $created->statusCode;
$out['pending'] = $api->get_tenant_safe('sub-1')->statusCode;
$out['reachable'] = $api->test_reachability();
$stores = get_option('anypress_staging_api_stores'); $stores['sub-1']['created'] -= 120; update_option('anypress_staging_api_stores', $stores);
$t = $api->get_tenant_safe('sub-1');
$out['done'] = $t->statusCode; $out['domain'] = $t->domainName;
$out['head'] = wp_remote_retrieve_response_code(wp_remote_head('https://staging-bakery.anypress.site', ['redirection' => 0]));
$api->suspend_tenant('sub-1');
$out['suspended'] = $api->get_tenant_safe('sub-1')->isSuspended;
$api->resume_tenant('sub-1');
$out['resumed'] = $api->get_tenant_safe('sub-1')->isSuspended;
$out['packs'] = $api->set_storage_packs('sub-1', 2)->storagePacksGb;
$api->set_care('sub-1', 'care-plus');
$api->create_tenant_backup('sub-1');
$out['backups'] = count($api->get_tenant_backups('sub-1'));
$out['all'] = count($api->get_tenants());
$out['password_logged'] = strpos(wp_json_encode(get_option('anypress_staging_api_log')), 'secret-pass') !== false;
$api->delete_tenant(['external_id' => 'sub-1']);
$out['after_delete'] = $api->get_tenant_safe('sub-1');
`));
console.log(r);
check(r.created === 0 && r.pending === 0, 'a new pretend store is Pending');
check(r.reachable !== false, 'the shop sees the API as reachable');
check(r.done === 1 && r.domain === 'staging-bakery.anypress.site', 'a minute later it is Done at the address the shop asked for');
check(r.head === 200, "its address answers the shop's check");
check(r.suspended === true && r.resumed === false, 'suspend and resume are recorded');
check(r.packs === 50, 'storage packs are recorded');
check(r.backups === 1, 'a backup is recorded');
check(r.all === 1, 'the store list shows it');
check(r.password_logged === false, 'the call log keeps no password');
check(r.after_delete === null, 'delete removes it');
check(!r.leaked, `no call leaves the site${r.leaked ? ': ' + r.leaked.join(', ') : ''}`);
await staging[Symbol.asyncDispose]?.();

const live = await site('production');
const l = JSON.parse(await php(live, `try { $api->create_tenant(['name' => 'X', 'wordpress_username' => 'o', 'wordpress_email' => 'o@anypress.example', 'wordpress_user_role' => 'administrator', 'external_id' => 'x']); } catch (\\Throwable $e) { /* blocked by this test */ }`));
check(Array.isArray(l.leaked) && l.leaked[0].startsWith('https://api.anypress.io/v1/tenants'), 'on a site that is not staging the plugin does nothing (the call goes to the real API)');
await live[Symbol.asyncDispose]?.();

process.exit(failed ? 1 : 0);

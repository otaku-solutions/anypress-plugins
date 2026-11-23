<?php
/**
 * Plugin Name: AnyPress staging: pretend API
 * Description: The staging shop never talks to the real AnyPress API. Every call AnyPress Host makes there is
 * answered here instead: an order "builds" a pretend store that is ready a minute later, and backups, domains,
 * packs and care are recorded but nothing is built anywhere. Tools > Pretend API lists what was asked.
 * Price lists are the real ones (a public read). Must-use plugin for shop-staging.anypress.io only.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

// Only on a site that says it is staging: copied to live by mistake, it does nothing.
if (!function_exists('wp_get_environment_type') || wp_get_environment_type() !== 'staging') {
    return;
}

const ANYPRESS_STAGING_API_STORES = 'anypress_staging_api_stores';
const ANYPRESS_STAGING_API_LOG = 'anypress_staging_api_log';
const ANYPRESS_STAGING_API_READY_AFTER = 60; // seconds until a pretend store is "built"

/** The API address AnyPress Host uses, without a trailing slash. */
function anypress_staging_api_base(): string
{
    // Resolved exactly as AnyPress Host's ConfigService does, so every call it makes is caught here.
    $base = defined('ANYPRESS_API_BASE_URL') ? (string) constant('ANYPRESS_API_BASE_URL') : (string) get_option('anypress_api_base_url', '');
    $base = (string) apply_filters('anypress_settings_api_base_url', $base !== '' ? $base : 'https://api.anypress.io');
    return untrailingslashit($base !== '' ? $base : 'https://api.anypress.io');
}

/** A WordPress HTTP answer. */
function anypress_staging_api_answer($body, int $code = 200): array
{
    return [
        'headers' => ['content-type' => 'application/json'],
        'body' => $body === null ? '' : wp_json_encode($body),
        'response' => ['code' => $code, 'message' => $code < 300 ? 'OK' : 'Error'],
        'cookies' => [],
        'filename' => null,
    ];
}

/** @return array<string, array<string, mixed>> pretend stores by externalId */
function anypress_staging_api_stores(): array
{
    $stores = get_option(ANYPRESS_STAGING_API_STORES, []);
    return is_array($stores) ? $stores : [];
}

function anypress_staging_api_save(array $stores): void
{
    update_option(ANYPRESS_STAGING_API_STORES, $stores, false);
}

/** A pretend store as the API shows one: Pending until a minute after the order, then Done. */
function anypress_staging_api_view(array $store): array
{
    $done = time() - (int) $store['created'] >= ANYPRESS_STAGING_API_READY_AFTER;
    $status = !empty($store['removing']) ? 3 : ($done ? 1 : 0);
    return [
        'id' => $store['id'],
        'tenantId' => $store['id'],
        'externalId' => $store['externalId'],
        'name' => $store['name'],
        'statusCode' => $status,
        'statusName' => ['Pending', 'Done', 'Failed', 'Removing'][$status],
        'domainName' => $store['domainName'],
        'baseDomain' => $store['domainName'],
        'customDomain' => null,
        'isSuspended' => !empty($store['suspended']),
        'onHold' => false,
        'size' => $store['size'],
        'versionName' => 'staging',
        'storagePacks' => (int) ($store['storagePacks'] ?? 0),
        'care' => $store['care'] ?? null,
        'dateCreated' => gmdate('c', (int) $store['created']),
    ];
}

/** Every request this site sends: calls to the API are answered here, and pretend stores answer HEAD checks. */
add_filter('pre_http_request', function ($pre, $args, $url) {
    $base = anypress_staging_api_base();
    $method = strtoupper($args['method'] ?? 'GET');

    // The Host checks a new store's address answers before it calls it ready.
    $host = (string) wp_parse_url($url, PHP_URL_HOST);
    foreach (anypress_staging_api_stores() as $store) {
        if ($host !== '' && $host === $store['domainName']) {
            return anypress_staging_api_answer(null, 200);
        }
    }

    if (strpos($url, $base . '/') !== 0) {
        return $pre;
    }
    $path = (string) wp_parse_url(substr($url, strlen($base)), PHP_URL_PATH);
    parse_str((string) wp_parse_url($url, PHP_URL_QUERY), $query);

    // The price list is public and the same everywhere: the real one.
    if ($method === 'GET' && $path === '/pricing') {
        return $pre;
    }

    $body = isset($args['body']) && is_string($args['body']) ? json_decode($args['body'], true) : null;
    $log = get_option(ANYPRESS_STAGING_API_LOG, []);
    $log = is_array($log) ? array_slice($log, -99) : [];
    // Who and what, never secrets: passwords are dropped.
    $logged = is_array($body) ? array_diff_key($body, array_flip(['wordPressUserPassword', 'contact'])) : null;
    // The owner's details (name, phone, address) ride along in wpOptions; keep only which options were sent.
    if (isset($logged['wpOptions']) && is_array($logged['wpOptions'])) {
        $logged['wpOptions'] = array_keys($logged['wpOptions']);
    }
    $log[] = ['at' => gmdate('c'), 'method' => $method, 'path' => $path, 'query' => $query, 'body' => $logged];
    update_option(ANYPRESS_STAGING_API_LOG, $log, false);

    return anypress_staging_api_route($method, $path, $query, is_array($body) ? $body : []);
}, 5, 3);

/** The pretend API's routes. Anything it doesn't know is accepted and answered empty. */
function anypress_staging_api_route(string $method, string $path, array $query, array $body): array
{
    $stores = anypress_staging_api_stores();
    $external_id = isset($query['externalId']) ? (string) $query['externalId'] : '';
    $store = $stores[$external_id] ?? null;

    switch ("$method $path") {
        case 'GET /v1/versions':
            return anypress_staging_api_answer([['id' => 'staging', 'name' => 'staging', 'isProduction' => true, 'statusCode' => 1, 'statusName' => 'Done']]);
        case 'GET /v1/versions/production/roles':
            return anypress_staging_api_answer(json_decode('{}'));
        case 'GET /v1/snapshots':
            return anypress_staging_api_answer([]);
        case 'GET /v1/webhooks':
            return anypress_staging_api_answer([]);
        case 'POST /v1/webhooks':
            return anypress_staging_api_answer(['id' => 'staging', 'url' => $body['url'] ?? '', 'secret' => 'whsec_' . base64_encode(random_bytes(32))], 201);

        case 'POST /v1/tenants':
            $id = wp_generate_uuid4();
            $ext = (string) ($body['externalId'] ?? $id);
            $domain = (string) ($body['customDomainName'] ?? (sanitize_title((string) ($body['name'] ?? 'store')) . '.staging.invalid'));
            $stores[$ext] = [
                'id' => $id,
                'externalId' => $ext,
                'name' => (string) ($body['name'] ?? ''),
                'domainName' => $domain,
                'size' => (string) ($body['size'] ?? 'small'),
                'created' => time(),
            ];
            anypress_staging_api_save($stores);
            return anypress_staging_api_answer(anypress_staging_api_view($stores[$ext]), 202);

        case 'GET /v1/tenants':
            if ($external_id === '') {
                return anypress_staging_api_answer(array_values(array_map('anypress_staging_api_view', $stores)));
            }
            return anypress_staging_api_answer($store ? [anypress_staging_api_view($store)] : []);
    }

    if ($store === null && strpos($path, '/v1/tenants') === 0 && $external_id !== '') {
        return anypress_staging_api_answer(['code' => 'not_found', 'message' => 'No pretend store has that id.'], 404);
    }

    switch ("$method $path") {
        case 'PUT /v1/tenants':
            $stores[$external_id] = array_merge($store, array_intersect_key($body, array_flip(['name', 'size'])));
            break;
        case 'DELETE /v1/tenants':
            unset($stores[$external_id]);
            anypress_staging_api_save($stores);
            return anypress_staging_api_answer(null, 202);
        case 'POST /v1/tenants/suspend':
            $stores[$external_id]['suspended'] = true;
            break;
        case 'POST /v1/tenants/resume':
            $stores[$external_id]['suspended'] = false;
            break;
        case 'PUT /v1/tenants/storage-packs':
            $stores[$external_id]['storagePacks'] = (int) ($body['packs'] ?? 0);
            anypress_staging_api_save($stores);
            $packs = $stores[$external_id]['storagePacks'];
            return anypress_staging_api_answer(['tenantId' => $store['id'], 'externalId' => $external_id, 'storagePacks' => $packs, 'storagePacksGb' => $packs * 25]);
        case 'PUT /v1/tenants/care':
            $stores[$external_id]['care'] = $body['package'] ?? null;
            break;
        case 'GET /v1/tenants/backups':
            return anypress_staging_api_answer($store['backups'] ?? []);
        case 'POST /v1/tenants/backups':
            $backup = ['id' => wp_generate_uuid4(), 'reason' => 'manual', 'statusCode' => 1, 'statusName' => 'Done', 'dateCreated' => gmdate('c')];
            $stores[$external_id]['backups'][] = $backup;
            anypress_staging_api_save($stores);
            return anypress_staging_api_answer($backup, 202);
        case 'POST /v1/tenants/site/handoff':
            return anypress_staging_api_answer(['url' => 'https://' . $store['domainName'] . '/wp-admin/']);
        case 'GET /v1/tenants/mail-domain':
            return anypress_staging_api_answer(['mailDomain' => $store['mailDomain'] ?? null]);
        case 'PUT /v1/tenants/mail-domain':
            $stores[$external_id]['mailDomain'] = ['domainName' => (string) ($body['domainName'] ?? ''), 'status' => 'verified', 'dateCreated' => gmdate('c'), 'dateVerified' => gmdate('c'), 'records' => []];
            anypress_staging_api_save($stores);
            return anypress_staging_api_answer(['mailDomain' => $stores[$external_id]['mailDomain']]);
        case 'DELETE /v1/tenants/mail-domain':
            unset($stores[$external_id]['mailDomain']);
            anypress_staging_api_save($stores);
            return anypress_staging_api_answer(null, 202);
        case 'GET /v1/tenants/domains/search':
            return anypress_staging_api_answer([]);
        case 'GET /v1/tenants/domains/available':
            // Free unless a pretend store already has it.
            $domain = (string) ($query['domain'] ?? '');
            $taken = in_array($domain, array_column($stores, 'domainName'), true);
            return anypress_staging_api_answer(['domain' => $domain, 'available' => !$taken]);
    }

    anypress_staging_api_save($stores);
    if ($method === 'GET') {
        return anypress_staging_api_answer(strpos($path, '/v1/tenants/domains') === 0 ? [] : json_decode('{}'));
    }
    return anypress_staging_api_answer($store ? anypress_staging_api_view($stores[$external_id] ?? $store) : json_decode('{}'), 202);
}

/** Tools > Pretend API: the pretend stores and the last 100 calls, so a test can check what was asked. */
add_action('admin_menu', function () {
    add_submenu_page('tools.php', 'Pretend API', 'Pretend API', 'manage_options', 'anypress-staging-api', function () {
        if (!current_user_can('manage_options')) {
            return;
        }
        if (isset($_POST['anypress_staging_api_clear']) && check_admin_referer('anypress_staging_api_clear')) {
            delete_option(ANYPRESS_STAGING_API_STORES);
            delete_option(ANYPRESS_STAGING_API_LOG);
        }
        echo '<div class="wrap"><h1>' . esc_html__('Pretend API', 'anypress-staging') . '</h1>';
        echo '<p>' . esc_html__('This staging shop never calls the real AnyPress API. Orders make the pretend stores below, ready a minute later; nothing is built on the server.', 'anypress-staging') . '</p>';
        echo '<h2>' . esc_html__('Pretend stores', 'anypress-staging') . '</h2><table class="widefat striped"><thead><tr><th>Name</th><th>Address</th><th>Status</th><th>Size</th></tr></thead><tbody>';
        foreach (anypress_staging_api_stores() as $store) {
            $view = anypress_staging_api_view($store);
            printf('<tr><td>%s</td><td>%s</td><td>%s%s</td><td>%s</td></tr>', esc_html($view['name']), esc_html($view['domainName']), esc_html($view['statusName']), $view['isSuspended'] ? esc_html(' (suspended)') : '', esc_html($view['size']));
        }
        echo '</tbody></table><h2>' . esc_html__('Last calls', 'anypress-staging') . '</h2><pre style="max-height:30em;overflow:auto;background:#fff;padding:1em">';
        echo esc_html(wp_json_encode(array_reverse((array) get_option(ANYPRESS_STAGING_API_LOG, [])), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo '</pre><form method="post">';
        wp_nonce_field('anypress_staging_api_clear');
        submit_button(__('Clear pretend stores and calls', 'anypress-staging'), 'secondary', 'anypress_staging_api_clear');
        echo '</form></div>';
    });
});

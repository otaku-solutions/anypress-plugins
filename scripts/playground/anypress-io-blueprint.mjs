// A link that opens anypress.io on WordPress in the browser, on demo.anypress.site: a website store as the store
// template's Website blueprint starts it (without its sample business), with the AnyPress Site plugin and anypress.io's
// pages set up by scripts/anypress-io/setup.php. Sign-ups and seller applications are recorded on the site, not sent.
//
//   node anypress-io-blueprint.mjs [branch]
//
// Writes preview-zips/anypress-io.zip (the plugin and the pages) and anypress-io-blueprint.json, which load from the
// branch on raw.githubusercontent.com (default: the current branch), and prints the link. Commit and push both first.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, cpSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const API = process.env.ANYPRESS_API_DIR || resolve(ROOT, '../anypress-api');
const branch = process.argv[2] || execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
const RAW = `https://raw.githubusercontent.com/otaku-solutions/anypress-plugins/${branch}/scripts/playground`;

// The zip unpacks into /wordpress: the must-use plugin, and the setup script with its pages.
const work = mkdtempSync(resolve(tmpdir(), 'anypress-io-'));
const mu = resolve(work, 'wp-content/mu-plugins');
mkdirSync(mu, { recursive: true });
cpSync(resolve(ROOT, 'scripts/anypress-io/plugin'), resolve(mu, 'anypress-io'), { recursive: true });
writeFileSync(resolve(mu, 'anypress-io.php'), "<?php require __DIR__ . '/anypress-io/anypress-io.php';\n");
// Stand-ins for the shop's lead route and the API, so trying the forms or Try It sends nothing anywhere.
writeFileSync(resolve(mu, '1-preview-shop.php'), "<?php add_filter('pre_http_request', function ($pre, $args, $url) { if (!str_starts_with($url, 'https://shop.anypress.io/wp-json/anypress/v1/lead')) return $pre; update_option('fake_shop_leads', array_merge(get_option('fake_shop_leads', []), [json_decode($args['body'], true)])); return ['headers' => [], 'body' => '{\"confirm\":true}', 'response' => ['code' => 200, 'message' => 'OK'], 'cookies' => [], 'filename' => null]; }, 10, 3);\n");
cpSync(resolve(HERE, 'anypress-io/fake-api.php'), resolve(mu, '2-preview-api.php'));
const setup = resolve(work, 'anypress-io-setup');
mkdirSync(setup);
cpSync(resolve(ROOT, 'scripts/anypress-io/setup.php'), resolve(setup, 'setup.php'));
cpSync(resolve(ROOT, 'scripts/anypress-io/pages'), resolve(setup, 'pages'), { recursive: true, filter: (p) => !p.endsWith('.mjs') });
// The price list beside the plugin, for when the browser can't reach the API.
try {
	const res = await fetch('https://api.anypress.io/pricing', { signal: AbortSignal.timeout(15000) });
	if (res.ok) writeFileSync(resolve(mu, 'anypress-io/pricing.json'), `${JSON.stringify(await res.json(), null, 2)}\n`);
} catch {}
const zip = resolve(HERE, 'preview-zips/anypress-io.zip');
rmSync(zip, { force: true });
execFileSync('zip', ['-qr', '-X', zip, 'wp-content', 'anypress-io-setup'], { cwd: work });
rmSync(work, { recursive: true, force: true });

// The store template's Website blueprint, up to its sample business.
const website = JSON.parse(readFileSync(resolve(API, 'templates/anypress-store/playground/website.json'), 'utf8'));
const sample = website.steps.findIndex((s) => s.step === 'mkdir' && s.path === '/wordpress/anypress-sample');
const blueprint = {
	...website,
	meta: { ...website.meta, title: 'anypress.io on WordPress', description: 'anypress.io as a WordPress website store. Runs in your browser; nothing is saved or sent.' },
	landingPage: '/',
	steps: [
		...website.steps.slice(0, sample),
		{ step: 'unzip', zipFile: { resource: 'url', url: `${RAW}/preview-zips/anypress-io.zip`, caption: 'Adding anypress.io' }, extractToPath: '/wordpress' },
		{
			step: 'runPHP',
			progress: { caption: "Setting up anypress.io's pages" },
			code: "<?php require '/wordpress/wp-load.php'; class WP_CLI { public static function log($m) {} public static function warning($m) { error_log($m); } public static function success($m) {} public static function error($m) { throw new RuntimeException($m); } } wp_set_current_user(1); include '/wordpress/anypress-io-setup/setup.php'; flush_rewrite_rules();",
		},
	],
};
writeFileSync(resolve(HERE, 'anypress-io-blueprint.json'), `${JSON.stringify(blueprint, null, '\t')}\n`);
console.log(`https://demo.anypress.site/?blueprint-url=${encodeURIComponent(`${RAW}/anypress-io-blueprint.json`)}`);

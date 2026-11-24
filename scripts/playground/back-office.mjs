// Test of a Back Office store on WordPress Playground: the CRM, emails and support desk behind a website or app built
// somewhere else. The AnyPress theme, the Back Office site type's business plugins from wordpress.org at the store
// template's versions (FluentCRM, Fluent Forms, Fluent Support, FluentSMTP sending simulated emails), FluentBooking as
// a plugin the type leaves off, and AnyPress Client from this checkout with ANYPRESS_TENANT_ROLES=back-office.
// The outside app is played by this script, over HTTP, the way the business's own app would call the store:
//
// - FluentCRM's incoming webhook adds a contact with tags by name ("Trial"), then moves them on ("Customer" added,
//   "Trial" taken off), the way an app passes on a Stripe payment.
// - AnyPress Client's "Tag Applied" trigger (free FluentCRM has none) starts an automation set to "Customer" once,
//   and not for other tags or a second "Customer".
// - Fluent Support's REST API, signed in with a WordPress application password, opens a ticket for the contact.
//
//   cd scripts/playground && npm ci
//   npm run back-office       # exit 1 on a failure
//
// Needs packages/anypress-client/vendor (composer install), an anypress-api checkout next to this repository (its
// store template's roles.json and build.sh; or ANYPRESS_API_DIR), and network access to downloads.wordpress.org.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCLI } from '@wp-playground/cli';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const CLIENT = resolve(ROOT, 'packages/anypress-client');
const API = process.env.ANYPRESS_API_DIR || resolve(ROOT, '../anypress-api');
const TEMPLATE = resolve(API, 'templates/anypress-store');
const THEME = resolve(HERE, 'preview-zips/anypress.zip');
const WP = process.env.PLAYGROUND_WP || '7.1.5';
const PHP = process.env.PLAYGROUND_PHP || '8.3';
const PORT = Number(process.env.PLAYGROUND_PORT || 9431);
const TYPE = 'back-office';

for (const [path, fix] of [[resolve(CLIENT, 'vendor/autoload.php'), 'run composer install in packages/anypress-client'], [resolve(TEMPLATE, 'roles.json'), 'set ANYPRESS_API_DIR to an anypress-api checkout']]) {
    if (!existsSync(path)) {
        console.error(`${path} is missing: ${fix} first.`);
        process.exit(1);
    }
}

// The store template's pins (build.sh lines are "<slug> <version> <sha256>").
const pins = Object.fromEntries([...readFileSync(resolve(TEMPLATE, 'build.sh'), 'utf8').matchAll(/^([a-z0-9-]+) (\S+) [0-9a-f]{64}$/gm)].map((m) => [m[1], m[2]]));
const SLUGS = ['fluent-crm', 'fluentform', 'fluent-support', 'fluent-smtp', 'fluent-booking'];
for (const slug of SLUGS) {
    if (!pins[slug]) {
        console.error(`build.sh has no pin for ${slug}.`);
        process.exit(1);
    }
}
const roles = JSON.parse(readFileSync(resolve(TEMPLATE, 'roles.json'), 'utf8'));
if (!roles[TYPE]) {
    console.error(`roles.json has no ${TYPE} site type.`);
    process.exit(1);
}

const blueprint = {
    features: { networking: true },
    steps: [
        { step: 'defineWpConfigConsts', consts: { WP_DEBUG: true, WP_DEBUG_LOG: true, WP_DEBUG_DISPLAY: false, AUTOMATIC_UPDATER_DISABLED: true, DISABLE_WP_CRON: true, FLUENTMAIL_SIMULATE_EMAILS: true, WP_ENVIRONMENT_TYPE: 'local' } },
        { step: 'installTheme', themeData: { resource: 'literal', name: 'anypress.zip', contents: readFileSync(THEME) }, options: { activate: true } },
        ...SLUGS.map((slug) => ({ step: 'installPlugin', pluginData: { resource: 'url', url: `https://downloads.wordpress.org/plugin/${slug}.${pins[slug]}.zip` }, options: { activate: true } })),
        { step: 'mkdir', path: '/wordpress/wp-content/plugins/anypress-client-data' },
        { step: 'writeFile', path: '/wordpress/wp-content/plugins/anypress-client-data/roles.json', data: readFileSync(resolve(TEMPLATE, 'roles.json'), 'utf8') },
        { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/0-anypress-store-env.php', data: `<?php putenv('ANYPRESS_IS_TENANT=true'); define('ANYPRESS_TENANT_ROLES', '${TYPE}');\n` },
        { step: 'activatePlugin', pluginPath: 'anypress-client/anypress-client.php' },
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
const base = cli.serverUrl.replace(/\/$/, '');
console.log(`WordPress ${WP} on PHP ${PHP}, site type ${TYPE} (FluentCRM ${pins['fluent-crm']}, Fluent Support ${pins['fluent-support']})`);

async function php(code) {
    const out = await cli.playground.run({ code: `<?php require '/wordpress/wp-load.php'; ${code}` });
    const text = out.text.trim();
    const start = text.search(/[[{]/);
    if (start < 0) throw new Error(`no JSON from PHP: ${text.slice(0, 400)}`);
    return JSON.parse(text.slice(start));
}

let failed = 0;
const check = (ok, what, detail = '') => {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${!ok && detail ? `: ${detail}` : ''}`);
    if (!ok) failed++;
};

try {
    // The site type's plugins: the business ones on, FluentBooking (not in Back Office) off.
    const active = await php(`
        echo wp_json_encode([
            'crm' => is_plugin_active('fluent-crm/fluent-crm.php'),
            'forms' => is_plugin_active('fluentform/fluentform.php'),
            'support' => is_plugin_active('fluent-support/fluent-support.php'),
            'smtp' => is_plugin_active('fluent-smtp/fluent-smtp.php'),
            'booking' => is_plugin_active('fluent-booking/fluent-booking.php'),
        ]);
    `);
    check(active.crm && active.forms && active.support && active.smtp, 'FluentCRM, Fluent Forms, Fluent Support and FluentSMTP are on', JSON.stringify(active));
    check(!active.booking, 'FluentBooking, which Back Office leaves out, is off');

    // The owner's set-up: an incoming webhook, and an automation that starts on "Customer" and tags the contact
    // "Welcome Sent", standing in for a welcome email.
    const setup = await php(`
        $customer = \\FluentCrm\\App\\Models\\Tag::firstOrCreate(['slug' => 'customer'], ['title' => 'Customer']);
        $welcomed = \\FluentCrm\\App\\Models\\Tag::firstOrCreate(['slug' => 'welcome-sent'], ['title' => 'Welcome Sent']);
        $hook = (new \\FluentCrm\\App\\Models\\Webhook())->store(['name' => 'Takewon app', 'tags' => [], 'lists' => [], 'status' => 'subscribed']);
        $funnel = \\FluentCrm\\App\\Models\\Funnel::create([
            'type' => 'funnels', 'title' => 'Email: Customer Welcome', 'trigger_name' => 'anypress_crm_tag_applied', 'status' => 'published',
            'settings' => ['tags' => [$customer->id]], 'conditions' => ['run_multiple' => 'no'],
        ]);
        \\FluentCrm\\App\\Models\\FunnelSequence::create([
            'funnel_id' => $funnel->id, 'action_name' => 'add_contact_to_tag', 'title' => 'Tag Welcome Sent', 'type' => 'sequence',
            'sequence' => 1, 'status' => 'published', 'settings' => ['tags' => [$welcomed->id]], 'delay' => 0, 'c_delay' => 0,
        ]);
        // What FluentCRM does when an automation is saved in its editor: note which triggers published automations use.
        (new \\FluentCrm\\App\\Hooks\\Handlers\\FunnelHandler())->resetFunnelIndexes();
        $triggers = apply_filters('fluentcrm_funnel_triggers', []);
        $admin = get_user_by('login', 'admin');
        if (!\\FluentSupport\\App\\Services\\Helper::getAgentByUserId($admin->ID)) {
            FluentSupportApi('agents')->createAgentWithOrWithoutWpUser(['email' => $admin->user_email, 'first_name' => 'Site', 'last_name' => 'Owner', 'user_id' => $admin->ID]);
        }
        [$password] = WP_Application_Passwords::create_new_application_password($admin->ID, ['name' => 'Takewon app']);
        echo wp_json_encode([
            'url' => $hook->value['url'], 'funnel' => $funnel->id, 'trigger' => $triggers['anypress_crm_tag_applied'] ?? null,
            'password' => $password, 'user' => 'admin',
        ]);
    `);
    check(setup.trigger?.label === 'Tag Applied', 'FluentCRM lists the "Tag Applied" trigger without Pro', JSON.stringify(setup.trigger));
    const hookUrl = setup.url.replace(/^https?:\/\/[^/]+/, base);

    const webhook = async (body) => {
        const res = await fetch(hookUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            return { success: false, text: text.slice(0, 300) };
        }
    };
    const contact = () => php(`
        $c = \\FluentCrm\\App\\Models\\Subscriber::where('email', 'ava@anypress.example')->first();
        echo wp_json_encode($c ? [
            'name' => trim($c->first_name . ' ' . $c->last_name),
            'tags' => $c->tags->pluck('title')->toArray(),
            'runs' => \\FluentCrm\\App\\Models\\FunnelSubscriber::where('funnel_id', ${setup.funnel})->where('subscriber_id', $c->id)->count(),
        ] : null);
    `);

    // Sign-up in the app: a new contact on a trial. Tags go by name, as an outside app knows them.
    const signup = await webhook({ email: 'ava@anypress.example', first_name: 'Ava', last_name: 'Reyes', tags: ['Trial'] });
    check(signup.success === true, 'the webhook takes a new contact', JSON.stringify(signup));
    let ava = await contact();
    check(ava?.name === 'Ava Reyes' && ava.tags.includes('Trial'), 'the contact is in FluentCRM, tagged Trial', JSON.stringify(ava));
    check(ava?.runs === 0, 'the Customer automation has not started for a Trial tag', JSON.stringify(ava));

    // Payment in the app (Stripe's checkout.session.completed): Customer added, Trial taken off.
    const paid = await webhook({ email: 'ava@anypress.example', tags: ['Customer'], detach_tags: ['Trial'] });
    check(paid.success === true, 'the webhook updates the contact', JSON.stringify(paid));
    ava = await contact();
    check(ava?.tags.includes('Customer') && !ava.tags.includes('Trial'), 'Customer is added and Trial taken off', JSON.stringify(ava));
    check(ava?.runs === 1, 'the "Tag Applied" automation started for Customer', JSON.stringify(ava));
    check(ava?.tags.includes('Welcome Sent'), "the automation's first step ran", JSON.stringify(ava));

    // A renewal sends Customer again: the automation runs once per contact.
    await webhook({ email: 'ava@anypress.example', tags: ['Customer'] });
    ava = await contact();
    check(ava?.runs === 1, 'a second Customer does not start it again', JSON.stringify(ava));

    // Help in the app: a ticket through Fluent Support's REST API, signed in with the application password.
    const auth = `Basic ${Buffer.from(`${setup.user}:${setup.password}`).toString('base64')}`;
    const res = await fetch(`${base}/wp-json/fluent-support/v2/tickets`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: auth },
        body: JSON.stringify({
            ticket: { title: 'My clips stopped exporting', content: '<p>The export button does nothing since this morning.</p>', priority: 'normal' },
            newCustomer: { first_name: 'Ava', last_name: 'Reyes', email: 'ava@anypress.example' },
        }),
    });
    const made = await res.json().catch(() => ({}));
    check(res.ok && made?.ticket?.id > 0, 'the app opens a ticket through Fluent Support', `${res.status} ${JSON.stringify(made).slice(0, 300)}`);
    const ticket = await php(`
        $t = \\FluentSupport\\App\\Models\\Ticket::with('customer')->orderBy('id', 'desc')->first();
        echo wp_json_encode($t ? ['title' => $t->title, 'email' => $t->customer->email ?? null] : null);
    `);
    check(ticket?.email === 'ava@anypress.example' && ticket.title === 'My clips stopped exporting', "the ticket is in Fluent Support under the contact's email", JSON.stringify(ticket));

    // Nothing a stranger can do: a wrong webhook address and no password are both turned away.
    const wrong = await fetch(hookUrl.replace(/hash=[^&]+/, 'hash=not-a-real-hash'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'x@anypress.example', tags: ['Customer'] }) }).then((r) => r.json()).catch(() => ({}));
    check(wrong.success === false, 'a wrong webhook address is refused', JSON.stringify(wrong));
    const anon = await fetch(`${base}/wp-json/fluent-support/v2/tickets`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ticket: { title: 'x', content: 'x' }, newCustomer: { email: 'x@anypress.example' } }) });
    check(anon.status === 401 || anon.status === 403, 'opening a ticket without the password is refused', String(anon.status));
} catch (error) {
    check(false, 'the test ran to the end', String(error?.stack || error));
}

if (process.argv.includes('--serve')) {
    console.log(`Leaving the site at ${base} (admin / password). Ctrl+C to stop.`);
} else {
    await cli[Symbol.asyncDispose]?.();
    process.exit(failed ? 1 : 0);
}

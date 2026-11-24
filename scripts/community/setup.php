<?php

/**
 * Sets up the AnyPress community (community.anypress.io) on a community store: FluentCommunity's spaces in their
 * groups, the AnyPress Basics course, the Community Guidelines page, the community on the home page, the portal's
 * name and welcome banner, and the first two posts.
 *
 *   wp eval-file setup.php --user=<admin>          # the community itself; safe to run again
 *   wp eval-file setup.php sample --user=<admin>   # plus sample members, posts, comments and events (previews only)
 *
 * Everything goes through FluentCommunity's and FluentEvent's own models and REST routes, as AnyPress Client's
 * community switches do. Spaces, groups, pages and posts are found by slug, so a second run adds only what is missing.
 */

if (!defined('ABSPATH')) {
    exit;
}

use FluentCommunity\App\Models\Comment;
use FluentCommunity\App\Models\Feed;
use FluentCommunity\App\Models\Reaction;
use FluentCommunity\App\Models\Space;
use FluentCommunity\App\Models\SpaceGroup;
use FluentCommunity\App\Models\SpaceUserPivot;
use FluentCommunity\App\Models\User as CommunityUser;

$anypress_sample = in_array('sample', (array) ($args ?? []), true);
$anypress_docs = 'https://shop.anypress.io/docs/';

if (!class_exists(Space::class)) {
    WP_CLI::error('FluentCommunity is not active on this site.');
}
if (!current_user_can('manage_options')) {
    WP_CLI::error('Run this as an administrator: add --user=<admin>.');
}

/** A FluentCommunity or FluentEvent REST call as the current user; the decoded answer, or an error. */
function anypress_community_rest(string $method, string $route, array $body = []): array
{
    $request = new WP_REST_Request($method, $route);
    if ($body) {
        $request->set_body_params($body);
    }
    $response = rest_do_request($request);
    $data = json_decode((string) wp_json_encode(rest_get_server()->response_to_data($response, false)), true) ?: [];
    if ($response->is_error()) {
        WP_CLI::error(sprintf('%s %s refused: %s', $method, $route, wp_json_encode($data)));
    }

    return $data;
}

// The admin running this writes the first posts and the webinars. FluentCommunity and FluentEvent only show posts
// whose author has a community profile, which an admin who never opened the portal doesn't have yet.
if (get_current_user_id()) {
    \FluentCommunity\App\Models\User::find(get_current_user_id())->syncXProfile();
}

// ---- Spaces, in their groups (the Spaces tab of the community plan) ----

$anypress_groups = [
    'start-here' => ['Start Here', [
        ['announcements', 'Announcements', '📣', 'public', true, 'New features on AnyPress sites, webinar dates and anything you need to know. Only the AnyPress team posts here.'],
        ['say-hello', 'Say Hello', '👋', 'public', false, 'Tell us who you are, what your business does and what you are building.'],
    ]],
    'your-site' => ['Your Site', [
        ['websites', 'Websites', '🌐', 'public', false, 'Pages, forms, SEO and email lists on a Website plan.'],
        ['bookings', 'Bookings', '📅', 'public', false, 'FluentBooking: calendars, reminders and paid bookings.'],
        ['online-stores', 'Online Stores', '🛍️', 'public', false, 'FluentCart: products, checkout, subscriptions and offers.'],
        ['communities-and-courses', 'Communities And Courses', '🎓', 'public', false, 'FluentCommunity: spaces, courses, members and events.'],
        ['highlevel-sites', 'HighLevel Sites', '⚡', 'public', false, 'HighLevel sites, WP Fusion and LeadConnector.'],
        ['moving-in', 'Moving In', '📦', 'public', false, 'Moving from Skool, Circle, LearnDash, WooCommerce and the rest. Ask before you move and share how it went.'],
    ]],
    'community' => ['Community', [
        ['show-your-site', 'Show Your Site', '✨', 'public', false, 'Share a finished site, a before and after, or ask for feedback.'],
        ['general', 'General', '💬', 'public', false, 'WordPress, the Fluent plugins and anything else.'],
        ['ideas-and-roadmap', 'Ideas And Roadmap', '💡', 'public', false, 'Ask for a feature. We mark each idea planned or shipped.'],
    ]],
    // Secret spaces: members join them by the groups the shop gives their account when they sign in
    // (wp anypress shop-sign-in connect --space="customer:customers;seller:sellers-and-resellers" ...).
    'members-only' => ['Members Only', [
        ['customers', 'Customers', '⭐', 'secret', false, 'For everyone with a website plan: questions about your plan, early looks at new features, and feedback straight to the AnyPress team.'],
        ['sellers-and-resellers', 'Sellers And Resellers', '🤝', 'secret', false, 'Selling sites, your storefront, pricing for clients and reseller tips. Sellers and resellers only.'],
    ]],
];

$anypress_spaces = [];
$anypress_group_serial = 0;
foreach ($anypress_groups as $group_slug => [$group_title, $spaces]) {
    // Each group keeps its own place, even when an earlier run made only some of them.
    ++$anypress_group_serial;
    $group = SpaceGroup::query()->where('slug', $group_slug)->first();
    if (!$group) {
        $group = SpaceGroup::create(['title' => $group_title, 'slug' => $group_slug, 'serial' => $anypress_group_serial, 'settings' => []]);
        WP_CLI::log("Group: {$group_title}");
    }
    foreach ($spaces as $serial => [$slug, $title, $emoji, $privacy, $team_only, $about]) {
        $space = Space::query()->where('slug', $slug)->first();
        if (!$space) {
            $space = Space::create([
                'title' => $title,
                'slug' => $slug,
                'privacy' => $privacy,
                'description' => $about,
                'settings' => ['restricted_post_only' => $team_only ? 'yes' : 'no', 'emoji' => $emoji],
                'parent_id' => $group->id,
                'serial' => $serial + 1,
            ]);
            WP_CLI::log("Space: {$title}");
        }
        $anypress_spaces[$slug] = $space;
    }
}

// ---- The portal: its name, open sign-in, the welcome banner, the community on the home page ----

/** One of this folder's images in the media library, once; its URL. */
function anypress_community_image(string $file): string
{
    $found = get_posts(['post_type' => 'attachment', 'name' => sanitize_title(pathinfo($file, PATHINFO_FILENAME) . '-anypress-community'), 'numberposts' => 1]);
    if ($found) {
        return (string) wp_get_attachment_url($found[0]->ID);
    }
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $bits = is_readable(__DIR__ . '/' . $file) ? (string) file_get_contents(__DIR__ . '/' . $file) : '';
    if ($bits === '') {
        WP_CLI::error("{$file} is missing next to setup.php.");
    }
    $upload = wp_upload_bits(pathinfo($file, PATHINFO_FILENAME) . '-anypress-community.png', null, $bits);
    if (!empty($upload['error'])) {
        WP_CLI::error($upload['error']);
    }
    $id = wp_insert_attachment(['post_mime_type' => 'image/png', 'post_title' => 'AnyPress Community: ' . pathinfo($file, PATHINFO_FILENAME), 'post_name' => sanitize_title(pathinfo($file, PATHINFO_FILENAME) . '-anypress-community')], $upload['file']);
    wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $upload['file']));

    return (string) $upload['url'];
}

anypress_community_rest('POST', '/fluent-community/v2/admin/general', ['settings' => [
    'site_title' => 'AnyPress Community',
    'logo' => anypress_community_image('logo.png'),
    'white_logo' => anypress_community_image('logo-dark.png'),
    'access' => ['acess_level' => 'public', 'access_roles' => []],
]]);
// HighLevel Sites wears HighLevel's own icon instead of an emoji.
$anypress_highlevel = $anypress_spaces['highlevel-sites'] ?? null;
if ($anypress_highlevel && !$anypress_highlevel->logo) {
    $anypress_highlevel->logo = anypress_community_image('highlevel.png');
    $anypress_highlevel->settings = array_merge((array) $anypress_highlevel->settings, ['emoji' => '']);
    $anypress_highlevel->save();
}
anypress_community_rest('POST', '/fluent-community/v2/admin/welcome-banner', ['settings' => [
    'login' => [
        'enabled' => 'yes',
        'allowClose' => 'yes',
        'title' => 'Welcome to the AnyPress community',
        'description' => "Ask questions, share what you built and tell us what to make next. New here? Say hello, then start the **AnyPress Basics** course.",
        'mediaType' => 'none',
    ],
    'logout' => [
        'enabled' => 'yes',
        'allowClose' => 'no',
        'title' => 'The AnyPress community',
        'description' => 'Website owners, sellers and resellers building on AnyPress. Sign in with your AnyPress account to join in. [What members get](/join/)',
        'mediaType' => 'none',
        'buttonLabel' => 'Sign In',
    ],
]]);
update_option('anypress_community_home', 'yes');
// Event times show in Pacific time, the team's own clock.
if (!get_option('timezone_string')) {
    update_option('timezone_string', 'America/Los_Angeles');
}

// ---- Community Guidelines (one page; Terms and Privacy stay on anypress.io) ----

if (!get_page_by_path('community-guidelines')) {
    $guidelines = <<<'HTML'
<!-- wp:group {"tagName":"main","layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}}} -->
<main class="wp-block-group" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:paragraph {"fontSize":"large"} -->
<p class="has-large-font-size">This is a place for people building on AnyPress to help each other. A few rules keep it useful.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Be kind.</strong> Everyone was new once. Disagree with ideas, not people.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>No selling in posts.</strong> Show your work in Show Your Site, but don't pitch members or send them offers.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Something broken on your site?</strong> Open a support ticket on the shop, so a person can look at your site. Use the community for questions, tips and ideas.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Keep private details private.</strong> No passwords, keys or customer data in posts or screenshots.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Post in the right space.</strong> Moderators may move a post to where it fits.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Moderators remove spam, sales pitches and posts that attack people, and may close the account of anyone who keeps doing it. Use Report on any post that breaks these rules.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Our <a href="https://anypress.io/terms">Terms</a> and <a href="https://anypress.io/privacy">Privacy Policy</a> cover the community too.</p>
<!-- /wp:paragraph --></main>
<!-- /wp:group -->
HTML;
    wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'community-guidelines', 'post_title' => 'Community Guidelines', 'post_content' => $guidelines]);
    WP_CLI::log('Page: Community Guidelines');
}

// ---- The visitor page: /join, from the theme's Chapter community sections, with real screens of the portal ----

if (!get_page_by_path('join')) {
    if (!is_readable(__DIR__ . '/join.html')) {
        WP_CLI::error('join.html is missing next to setup.php.');
    }
    $anypress_join = strtr((string) file_get_contents(__DIR__ . '/join.html'), [
        '{{join-home}}' => esc_url(anypress_community_image('join-home.png')),
        '{{join-events}}' => esc_url(anypress_community_image('join-events.png')),
        '{{shop}}' => 'https://shop.anypress.io',
    ]);
    $anypress_join_id = wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'join', 'post_title' => 'Join the AnyPress Community', 'post_content' => $anypress_join, 'page_template' => 'page-no-title'], true);
    if (is_wp_error($anypress_join_id)) {
        WP_CLI::error('The join page: ' . $anypress_join_id->get_error_message());
    }
    WP_CLI::log('Page: Join the AnyPress Community');
}

// ---- The first two posts, by the admin running this ----

/** A post in a space, found by slug, made if missing; returns it. */
function anypress_community_post(Space $space, int $user_id, string $slug, string $title, string $markdown, bool $sticky = false, string $when = 'now'): Feed
{
    $feed = Feed::query()->where('slug', $slug)->first();
    if ($feed) {
        return $feed;
    }
    $date = gmdate('Y-m-d H:i:s', strtotime($when));
    $feed = new Feed();
    $feed->fill([
        'user_id' => $user_id,
        'title' => $title,
        'slug' => $slug,
        'message' => $markdown,
        'message_rendered' => wp_kses_post(\FluentCommunity\App\Services\FeedsHelper::mdToHtml($markdown)),
        'type' => 'text',
        'content_type' => 'text',
        'privacy' => 'public',
        'status' => 'published',
        'space_id' => $space->id,
        'is_sticky' => $sticky ? 1 : 0,
    ]);
    $feed->created_at = $date;
    $feed->updated_at = $date;
    $feed->save();
    // FluentCommunity's own follow-up for a new post: the activity list and the space's recent activity.
    do_action('fluent_community/feed/created', $feed);

    return $feed;
}

$anypress_admin = get_current_user_id();
anypress_community_post(
    $anypress_spaces['announcements'],
    $anypress_admin,
    'welcome-to-the-anypress-community',
    'Welcome to the AnyPress community',
    "This is the place to ask how to do something on your site, show what you built and tell us what AnyPress should do next.\n\n"
    . "- **Start here:** say hello in Say Hello, then take the AnyPress Basics course.\n"
    . "- **Your kind of site:** each site type has its own space under Your Site.\n"
    . "- **Moving in:** ask in Moving In before you move from Skool, Circle, LearnDash or WooCommerce.\n"
    . "- **Something broken?** Open a support ticket on the shop, so we can look at your site.\n\n"
    . 'Please read the [Community Guidelines](' . home_url('/community-guidelines/') . ') too. They are short.',
    true,
    '-3 days'
);
anypress_community_post(
    $anypress_spaces['say-hello'],
    $anypress_admin,
    'introduce-yourself',
    'Introduce yourself',
    "Tell us your name, what your business does, and what you are building on AnyPress (or thinking about building). Links to your site are welcome here.",
    true,
    '-3 days'
);

// ---- The AnyPress Basics course: six lessons, each pointing to its help doc on the shop ----

if (class_exists(\AnyPressClient\Moving\CourseImport::class)) {
    $course = Space::query()->withoutGlobalScopes()->where('type', 'course')->where('slug', 'anypress-basics')->first();
    if (!$course) {
        $made = \AnyPressClient\Moving\CourseImport::call('POST', '', [
            'title' => 'AnyPress Basics',
            'slug' => 'anypress-basics',
            'description' => 'Six short lessons from your first sign-in to backups and getting help. Each one links to the full guide in the shop\'s Help Docs.',
            'privacy' => 'public',
            'course_type' => 'self_paced',
            'status' => 'published',
        ]);
        $course_id = (int) ($made['course']['id'] ?? 0);
        $lesson = fn (string $title, string $text) => [
            'title' => $title,
            'status' => 'published',
            'body' => '<p>' . esc_html($text) . '</p><p><a href="' . esc_url($anypress_docs) . '">Read the full guide in the Help Docs</a></p>',
            'image' => 0,
            'post' => 0,
        ];
        \AnyPressClient\Moving\CourseImport::build_outline($course_id, [
            ['title' => 'Getting Started', 'lessons' => [
                $lesson('Your dashboard and your site', 'Where your site lives, how to sign in with one click, and what each part of the dashboard does.'),
                $lesson('Editing pages in the Site Editor', 'Change words, pictures and colours on any page, and undo a change you don\'t like.'),
            ]],
            ['title' => 'Growing Your Business', 'lessons' => [
                $lesson('Forms and your email list', 'Add a contact or sign-up form, and send new contacts into your email list.'),
                $lesson('Taking bookings or selling', 'Set up your first booking calendar or your first product, with payments.'),
            ]],
            ['title' => 'Keeping It Running', 'lessons' => [
                $lesson('Domains and email sending', 'Use your own domain, and make sure your emails land in the inbox.'),
                $lesson('Backups, updates and getting help', 'What we back up each night, how updates reach your site, and how to reach us.'),
            ]],
        ]);
        WP_CLI::log('Course: AnyPress Basics');
    }
}

if (!$anypress_sample) {
    WP_CLI::success('The AnyPress community is set up.');
    return;
}

// ---- Sample content, for previews only: members, posts, comments, reactions and events ----

$anypress_people = [
    'maya' => ['Maya Okafor', 'Runs a yoga studio. Moved from Squarespace.', ['say-hello', 'bookings', 'customers']],
    'dev' => ['Dev Patel', 'Web designer. Sells sites to local trades.', ['sellers-and-resellers', 'show-your-site']],
    'lucia' => ['Lucía Herrera', 'Ceramics shop owner.', ['online-stores', 'customers']],
    'sam' => ['Sam Whitfield', 'Course creator, ex-Skool.', ['communities-and-courses', 'moving-in']],
    'ren' => ['Ren Tanaka', 'Bookkeeper with a HighLevel agency account.', ['highlevel-sites']],
    'amara' => ['Amara Nwosu', 'Coach. Building her first website.', ['websites', 'say-hello', 'customers']],
    'jonas' => ['Jonas Berg', 'Reseller in Oslo.', ['sellers-and-resellers', 'ideas-and-roadmap']],
    'priya' => ['Priya Raman', 'Runs a baking class community.', ['communities-and-courses', 'general']],
];
$anypress_users = [];
foreach ($anypress_people as $login => [$name, $bio, $joins]) {
    $user = get_user_by('login', $login);
    $id = $user ? (int) $user->ID : wp_insert_user([
        'user_login' => $login,
        'user_email' => "{$login}@anypress.example",
        'user_pass' => wp_generate_password(24),
        'display_name' => $name,
        'first_name' => strtok($name, ' '),
        'description' => $bio,
        'role' => 'subscriber',
    ]);
    if (is_wp_error($id)) {
        WP_CLI::error("Sample member {$login}: " . $id->get_error_message());
    }
    $id = (int) $id;
    $anypress_users[$login] = $id;
    $community_user = CommunityUser::find($id);
    if ($community_user) {
        $community_user->syncXProfile();
    }
    foreach (array_unique(array_merge($joins, ['announcements', 'say-hello', 'general'])) as $slug) {
        $space = $anypress_spaces[$slug];
        if (!SpaceUserPivot::where('space_id', $space->id)->where('user_id', $id)->exists()) {
            SpaceUserPivot::create(['space_id' => $space->id, 'user_id' => $id, 'role' => 'member', 'status' => 'active']);
        }
    }
}

/** A comment on a post, once. */
function anypress_community_comment(Feed $feed, int $user_id, string $text, string $when): void
{
    if (Comment::where('post_id', $feed->id)->where('user_id', $user_id)->where('message', $text)->exists()) {
        return;
    }
    $date = gmdate('Y-m-d H:i:s', strtotime($when));
    $comment = new Comment();
    $comment->fill(['user_id' => $user_id, 'post_id' => $feed->id, 'message' => $text, 'message_rendered' => wpautop(esc_html($text)), 'type' => 'comment', 'content_type' => 'text', 'status' => 'published']);
    $comment->created_at = $date;
    $comment->updated_at = $date;
    $comment->save();
}

$anypress_posts = [
    ['say-hello', 'maya', 'hello-from-a-yoga-studio', 'Hello from a yoga studio in Leeds', "I run a small studio and just moved my site over from Squarespace. Bookings were the reason. Clients can finally pick a class and pay in one go. Happy to share how the move went if anyone is thinking about it.", '-2 days', [['amara', 'Welcome! How long did the move take you?'], ['maya', 'About an evening for the pages. The booking calendar took another hour.']]],
    ['say-hello', 'amara', 'first-website-ever', 'First website ever, be gentle', "I'm a career coach and this is my first real website. I picked the Website plan and so far the Site Editor makes sense. Next step is a sign-up form for my newsletter.", '-1 day', [['priya', 'The Forms lesson in AnyPress Basics walks through exactly that.']]],
    ['bookings', 'maya', 'reminder-texts-before-a-class', 'Reminder emails before a class: what timing works for you?', "I send one the day before and one an hour before. Getting fewer no-shows already. Does anyone send a follow-up after the class asking for a review?", '-2 days', [['amara', 'I ask for a review two days later. Same day felt pushy.']]],
    ['online-stores', 'lucia', 'selling-one-off-pieces', 'Selling one-off ceramic pieces', "Most of my pieces are one of a kind. I set stock to 1 on each product so it shows Sold Out after it sells. Is there a neater way to show sold pieces as a gallery?", '-4 days', [['dev', 'I keep sold pieces as a Past Work page with a gallery block. Buyers love seeing them.']]],
    ['communities-and-courses', 'priya', 'drip-lessons-weekly', 'Releasing course lessons weekly', "My baking course works better one lesson a week, so people actually bake along. Is anyone doing scheduled lessons in FluentCommunity courses?", '-3 days', [['sam', 'Yes, I set each section to open a week after enrolment. Completion went up a lot.']]],
    ['moving-in', 'sam', 'moved-from-skool', 'Moved 340 members from Skool', "I exported the Members tab as a CSV and used the Skool switch. Members, their answers and their spaces came across. Two things I'd tell anyone moving: send members a heads-up email first, and check the welcome email before you turn it on.", '-5 days', [['priya', 'This is really helpful, thank you.'], ['maya', 'Did your members have to reset their passwords?'], ['sam', 'They signed in with a magic link the first time, so no.']]],
    ['highlevel-sites', 'ren', 'highlevel-contacts-from-forms', 'Sending form sign-ups to HighLevel', "WP Fusion was already connected to my sub-account when the site came up. New users show up as contacts in HighLevel within a minute. Has anyone mapped custom fields yet?", '-2 days', []],
    ['show-your-site', 'dev', 'plumber-site-before-and-after', 'Before and after: a plumber\'s site', "Old site was one page with a phone number. New one has services, a quote form and a booking calendar for callouts. The owner gets quote requests straight into his email list now.", '-1 day', [['jonas', 'Clean. Which kit did you start from?'], ['dev', 'Ridge, with the colours changed to his van colours.']]],
    ['general', 'priya', 'favourite-fluent-plugin', 'Which Fluent plugin surprised you most?', "For me it was FluentCRM. I thought I'd need Mailchimp, but the automations do everything I need.", '-6 hours', [['lucia', 'FluentCart offers. My after-checkout offer pays for the plan on its own.']]],
    ['ideas-and-roadmap', 'jonas', 'idea-norwegian-starter-pages', 'Idea: starter pages in more languages', "My clients are mostly Norwegian. The Languages switch works great, but it would save me hours if the starter pages came in Norwegian too.", '-2 days', [['dev', '+1 for Spanish.']]],
    ['sellers-and-resellers', 'dev', 'pricing-care-for-clients', 'How do you price care for your clients?', "I charge a monthly fee that covers the plan plus an hour of changes. Curious what others do, flat fee or per request?", '-3 days', [['jonas', 'Flat fee with three tiers. Clients like knowing the number.']]],
    ['websites', 'amara', 'newsletter-form-in-footer', 'Newsletter form in the footer?', "Can I put a sign-up form in the footer so it shows on every page?", '-4 hours', [['maya', 'Yes, edit the footer in the Site Editor and add the form block there.']]],
];
foreach ($anypress_posts as [$space, $author, $slug, $title, $text, $when, $replies]) {
    $feed = anypress_community_post($anypress_spaces[$space], $anypress_users[$author], $slug, $title, $text, false, $when);
    foreach ($replies as $i => [$who, $reply]) {
        anypress_community_comment($feed, $anypress_users[$who], $reply, $when . ' +' . (($i + 1) * 3) . ' hours');
    }
    foreach (array_slice(array_values($anypress_users), 0, 2 + (strlen($slug) % 5)) as $fan) {
        if (!Reaction::where('object_id', $feed->id)->where('user_id', $fan)->where('type', 'like')->exists()) {
            Reaction::create(['user_id' => $fan, 'object_id' => $feed->id, 'object_type' => 'feed', 'type' => 'like']);
        }
    }
    $feed->recountStats();
}

// Webinars are event posts in Announcements, as FluentEvent makes them from the portal's composer: the post is
// the event's card in the feed and on the Events page, and the event goes in the space's own calendar.
if (class_exists('FluentEvent\\App\\Models\\Event')) {
    $zone = 'America/Los_Angeles';
    foreach ([
        ['Office Hours: bring your questions', '+9 days 10:00', 'Drop in with anything about your site. We share a screen and fix things live.'],
        ['Webinar: build your site in an hour', '+16 days 11:00', 'From a starter page to a finished home page, contact form and booking calendar.'],
        ['Webinar: moving your community in', '+23 days 11:00', 'Moving members, courses and posts from Skool, Circle and LearnDash, step by step.'],
    ] as [$title, $when, $about]) {
        if (\FluentEvent\App\Models\Event::query()->whereHas('post', fn ($post) => $post->where('post_title', $title))->exists()) {
            continue;
        }
        $start = new DateTimeImmutable($when, new DateTimeZone($zone));
        anypress_community_rest('POST', '/fluent-community/v2/feeds', [
            'space' => 'announcements',
            'content_type' => 'event',
            'message' => $about,
            'event' => [
                'title' => $title,
                'description_md' => $about,
                'start_at' => $start->format('Y-m-d H:i:s'),
                'end_at' => $start->modify('+1 hour')->format('Y-m-d H:i:s'),
                'timezone' => $zone,
                'venue_type' => 'online',
                'online_meeting_url' => 'https://meet.anypress.example/live',
                'entry_type' => 'rsvp',
                'show_guest_count' => 'yes',
            ],
        ]);
        WP_CLI::log('Event: ' . $title);
    }
}

WP_CLI::success('The AnyPress community is set up, with sample content.');

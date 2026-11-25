<?php

namespace AnyPressClient\Features;

/**
 * Two FluentCommunity set-ups that owners otherwise do with code snippets.
 *
 * - The community as the home page: a "Community" choice under Settings > Reading. When it is on, the community opens
 *   at the site's own address instead of /portal, through FluentCommunity's FLUENT_COMMUNITY_PORTAL_SLUG constant (set
 *   to empty), which owners can't add to wp-config.php themselves. Off by default.
 * - Where members land after signing in: FluentAuth's Login Redirects (its own settings screen) send people to a page
 *   by role, but only from WordPress's login page. FluentCommunity's own sign-in sends everyone to the community feed.
 *   When a member signs in there with no particular page asked for, the same FluentAuth rules decide where they land.
 *
 * - The site's own colours: FluentCommunity's portal is grey and blue until an owner with Pro picks a colour scheme.
 *   The site's colour palette (Appearance > Editor > Styles) becomes a "Site Colours" scheme, used while no other is
 *   chosen, so the community matches the rest of the site and follows it when the owner restyles it.
 *
 * Runs on every request (admin-ajax and REST too), since FluentCommunity builds its links and answers its sign-in form
 * there. The work is one autoloaded option read, plus filters that only run when someone signs in or the community's
 * colours are drawn (from the palette WordPress already keeps in memory).
 */
class CommunityPortal
{
    public const OPTION = 'anypress_community_home';
    public const CONSTANT = 'FLUENT_COMMUNITY_PORTAL_SLUG';
    private const HELPER = 'FluentCommunity\App\Services\Helper';
    public const SCHEME = 'anypress_site_colours';

    public function __construct()
    {
        if (self::is_home() && !defined(self::CONSTANT)) {
            define(self::CONSTANT, '');
        }

        add_filter('fluent_community/auth/after_login_redirect_url', [$this, 'landing_page'], 20, 2);
        add_filter('fluent-community/color_schemas', [self::class, 'add_scheme']);
        add_filter('fluent_community/color_schmea_config', [self::class, 'use_scheme'], 5);
        add_action('admin_init', [$this, 'add_setting']);
        add_action('update_option_' . self::OPTION, [self::class, 'rebuild_links'], 10, 0);
        add_action('add_option_' . self::OPTION, [self::class, 'rebuild_links'], 10, 0);
    }

    /** Whether the owner chose to show the community on the home page. */
    public static function is_home(): bool
    {
        return get_option(self::OPTION) === 'yes';
    }

    /**
     * FluentAuth's sign-in rule for this member, when FluentCommunity is about to send them to the feed only because
     * no page was asked for. Any other page (a post, a course the member was on) is kept.
     */
    public function landing_page($url, $user)
    {
        if (!$user instanceof \WP_User || !is_string($url) || !class_exists(self::HELPER)) {
            return $url;
        }

        $feed = call_user_func([self::HELPER, 'baseUrl']);
        if (untrailingslashit($url) !== untrailingslashit((string) $feed)) {
            return $url;
        }

        return self::ruled_page($user, $url);
    }

    /**
     * The page WordPress's own login_redirect filter gives this user for a sign-in that would open wp-admin, which is
     * when FluentAuth applies its Login Redirects (by role, or its default). The feed when no rule sends them elsewhere.
     */
    public static function ruled_page(\WP_User $user, string $feed): string
    {
        $admin = admin_url();
        $ruled = apply_filters('login_redirect', $admin, $admin, $user); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WordPress core's own filter, answered by FluentAuth.

        if (!is_string($ruled) || $ruled === '' || untrailingslashit($ruled) === untrailingslashit($admin)) {
            return $feed;
        }

        return wp_validate_redirect($ruled, $feed);
    }

    /**
     * The site's palette as FluentCommunity colours, or null when the theme lacks the slugs it needs (the AnyPress
     * theme's: base, main, primary and the rest) or a colour isn't a plain one.
     *
     * @return array<string, array<string, string>>|null
     */
    public static function site_colours(?array $palette = null): ?array
    {
        if ($palette === null) {
            $palette = function_exists('wp_get_global_settings') ? (array) wp_get_global_settings(['color', 'palette', 'theme']) : [];
        }

        $colour = [];
        foreach ($palette as $entry) {
            $value = is_array($entry) ? trim((string) ($entry['color'] ?? '')) : '';
            if (isset($entry['slug']) && preg_match('/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i', $value)) {
                $colour[(string) $entry['slug']] = $value;
            }
        }

        foreach (['base', 'main', 'secondary', 'tertiary', 'primary', 'primary-accent', 'border-light', 'main-accent'] as $slug) {
            if (!isset($colour[$slug])) {
                return null;
            }
        }

        $menu = [
            'primary_bg' => $colour['base'],
            'primary_border' => $colour['border-light'],
            'menu_text' => $colour['secondary'],
            'menu_text_active' => $colour['main'],
            'active_bg' => $colour['primary-accent'],
            'menu_text_hover' => $colour['main'],
            'menu_bg_hover' => $colour['tertiary'],
        ];

        return [
            'body' => [
                'primary_bg' => $colour['base'],
                'secondary_bg' => $colour['tertiary'],
                'secondary_content_bg' => $colour['tertiary'],
                'active_bg' => $colour['primary-accent'],
                'light_bg' => $colour['border-light'],
                'deep_bg' => $colour['main'],
                'menu_text' => $colour['secondary'],
                'primary_text' => $colour['main'],
                'secondary_text' => $colour['secondary'],
                'text_off' => $colour['secondary'],
                'primary_button' => $colour['primary'],
                'primary_button_text' => $colour['base'],
                'primary_border' => $colour['border-light'],
                'secondary_border' => $colour['main-accent'],
                'highlight_bg' => $colour['primary-accent'],
                'text_link' => $colour['primary'],
            ],
            'fcom_top_menu' => $menu,
            'spaces' => $menu,
        ];
    }

    /** Adds "Site Colours" to FluentCommunity's light colour schemes. */
    public static function add_scheme($schemas)
    {
        $selectors = is_array($schemas) ? self::site_colours() : null;
        if ($selectors === null) {
            return $schemas;
        }

        $schemas['lightSkins'][self::SCHEME] = ['title' => __('Site Colours', 'anypress-client'), 'selectors' => $selectors];

        return $schemas;
    }

    /**
     * Uses "Site Colours" while the light scheme is FluentCommunity's default. Runs before FluentCommunity Pro reads
     * the owner's saved choice, so a scheme chosen there still wins.
     */
    public static function use_scheme($config)
    {
        if (!is_array($config) || ($config['light_schema'] ?? 'default') !== 'default' || !empty($config['cached_css']) || self::site_colours() === null) {
            return $config;
        }

        $config['light_schema'] = self::SCHEME;

        return $config;
    }

    /** The "Community" choice under Settings > Reading, on sites with FluentCommunity. */
    public function add_setting(): void
    {
        if (!class_exists(self::HELPER)) {
            return;
        }

        register_setting('reading', self::OPTION, [
            'type' => 'string',
            'sanitize_callback' => [self::class, 'sanitize'],
            'default' => 'no',
        ]);
        add_settings_field(self::OPTION, __('Community', 'anypress-client'), [$this, 'render_setting'], 'reading', 'default', ['label_for' => self::OPTION]);
    }

    public static function sanitize($value): string
    {
        return $value === 'yes' ? 'yes' : 'no';
    }

    public function render_setting(): void
    {
        $fixed = defined(self::CONSTANT) && !self::is_home();
        printf(
            '<input type="hidden" name="%1$s" value="no"><label><input type="checkbox" id="%1$s" name="%1$s" value="yes" %2$s %3$s> %4$s</label>',
            esc_attr(self::OPTION),
            checked(self::is_home(), true, false),
            disabled($fixed, true, false),
            esc_html__('Show the community on the home page', 'anypress-client')
        );
        echo '<p class="description">' . esc_html(sprintf(
            /* translators: %s: the site's address */
            __('The community opens at %s, in place of the home page, instead of at its own address. Your other pages keep their addresses.', 'anypress-client'),
            untrailingslashit(home_url())
        )) . '</p>';
        if ($fixed) {
            echo '<p class="description">' . esc_html__('The community\'s address is set in wp-config.php on this site.', 'anypress-client') . '</p>';
        }
    }

    /** WordPress rebuilds its links on the next page load, when FluentCommunity has its new address. */
    public static function rebuild_links(): void
    {
        delete_option('rewrite_rules');
    }
}

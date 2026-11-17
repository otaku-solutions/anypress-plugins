<?php

namespace AnyPressClient\Features;

/**
 * Lets AI apps work on the website over MCP, through WordPress's own MCP Adapter plugin (wordpress.org/plugins/mcp-adapter).
 * Stores come with the adapter installed, and the plan always keeps it on (RolesManager adds it to the plan's plugins).
 *
 * The website has an "AnyPress website" MCP server at /wp-json/mcp/anypress whose tools are the site abilities
 * (SiteAbilities), one tool each, plus AutomatorWP's own abilities (create an automation, add triggers or actions to
 * one, run actions now), so an AI app can set up "when this happens, do that" from a chat. AutomatorWP's abilities
 * check manage_options themselves, and the automations they create start inactive. An app signs in as a WordPress user (an application password) and can only do what
 * that user may: the abilities check the user's own capabilities, and the server only lets in users who can edit pages.
 */
class McpServer
{
    public const PLUGIN = 'mcp-adapter/mcp-adapter.php';
    public const ROUTE_NAMESPACE = 'mcp';
    public const ROUTE = 'anypress';

    /** Ability categories the server lists: AnyPress's site abilities and AutomatorWP's (its AI Assistant module). */
    public const CATEGORIES = [\AnyPressClient\Api\SiteAbilities::CATEGORY, 'automatorwp'];

    public function __construct()
    {
        add_action('mcp_adapter_init', [$this, 'create_server']);
    }

    /** Whether this website has the adapter plugin at all (stores made before it came with the template don't). */
    public static function is_installed(): bool
    {
        return file_exists(WP_PLUGIN_DIR . '/' . self::PLUGIN);
    }

    /**
     * The plan's plugins plus the adapter, which is always on where it is installed.
     *
     * @param string[] $plugins
     * @return string[]
     */
    public static function with_adapter(array $plugins): array
    {
        if (self::is_installed() && !in_array(self::PLUGIN, $plugins, true)) {
            $plugins[] = self::PLUGIN;
        }

        return $plugins;
    }

    public static function url(): string
    {
        return rest_url(self::ROUTE_NAMESPACE . '/' . self::ROUTE);
    }

    /** @param \WP\MCP\Core\McpAdapter $adapter */
    public function create_server($adapter): void
    {
        $tools = [];
        $resources = [];
        foreach (wp_get_abilities() as $ability) {
            if (!in_array($ability->get_category(), self::CATEGORIES, true)) {
                continue;
            }
            if (($ability->get_meta()['mcp']['type'] ?? 'tool') === 'resource') {
                $resources[] = $ability->get_name();
            } else {
                $tools[] = $ability->get_name();
            }
        }

        $adapter->create_server(
            'anypress',
            self::ROUTE_NAMESPACE,
            self::ROUTE,
            sprintf('%s website', \AnyPressClient\Core\Brand::name()),
            'Read and change this website\'s pages, patterns and kits, interactive blocks, looks, colours and fonts, header, footer, menus and images, and set up AutomatorWP automations (when this happens, do that). Every page change keeps a revision; new automations start switched off. To build or redesign the site, read skill://anypress-website/SKILL.md first.',
            ANYPRESS_CLIENT_VERSION,
            [\WP\MCP\Transport\HttpTransport::class],
            \WP\MCP\Infrastructure\ErrorHandling\ErrorLogMcpErrorHandler::class,
            null,
            $tools,
            $resources,
            [],
            fn () => current_user_can('edit_pages')
        );
    }

    /** The "AI apps" section of the "Your plan" page. */
    public static function render_section(): void
    {
        if (!self::is_installed()) {
            return;
        }
?>
        <h2 id="ai-apps"><?php esc_html_e('AI apps (MCP)', 'anypress-client'); ?></h2>
        <p><?php esc_html_e('AI apps can work on this website through WordPress\'s MCP Adapter. They can read and change pages, design, header, footer and menus, add images and set up AutomatorWP automations, and only as far as the WordPress user they sign in as is allowed to. Every page change is saved as a revision you can go back to.', 'anypress-client'); ?></p>
        <p>
            <?php esc_html_e('Server address:', 'anypress-client'); ?>
            <code><?php echo esc_html(self::url()); ?></code>
        </p>
        <p><?php echo wp_kses(sprintf(
            /* translators: %s: link to the user's profile, where application passwords are made */
            __('The app signs in with your username and an application password. Make one for each app in <a href="%s">your profile</a>, and revoke it there to stop that app.', 'anypress-client'),
            esc_url(admin_url('profile.php#application-passwords-section'))
        ), ['a' => ['href' => []]]); ?></p>
<?php
    }
}

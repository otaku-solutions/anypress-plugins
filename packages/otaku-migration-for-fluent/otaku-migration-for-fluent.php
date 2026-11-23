<?php

/*
Plugin Name: Otaku Migration for Fluent
Description: Moves your site's forms, shop, contacts, help desk, affiliates, community, courses and members into the Fluent plugins, with a check first and an undo after. Under Tools, Migrate to Fluent.
Author: Otaku Solutions
Version: 1.6.0
Author URI: https://otakusolutions.io
Requires at least: 6.9
Requires PHP: 8.1
License: GPL-3.0-or-later
License URI: https://www.gnu.org/licenses/gpl-3.0.html
Text Domain: otaku-migration-for-fluent
*/

if (!defined('ABSPATH')) {
    exit;
}

define('OTAKU_MIGRATION_VERSION', '1.6.0');

// Sites hosted by Otaku Solutions already have every switch in their client plugin (it defines this constant);
// this plugin then stays out of the way.
add_action('plugins_loaded', static function () {
    if (defined('ANYPRESS_CLIENT_VERSION')) {
        return;
    }
    if (!is_readable(__DIR__ . '/vendor/autoload.php') || !is_dir(__DIR__ . '/lib')) {
        add_action('admin_notices', static function () {
            if (current_user_can('activate_plugins')) {
                echo '<div class="notice notice-error"><p>' . esc_html__('Otaku Migration for Fluent is missing some of its files. Install it again from its download.', 'otaku-migration-for-fluent') . '</p></div>';
            }
        });
        return;
    }
    require_once __DIR__ . '/vendor/autoload.php';
    \OtakuMigration\Plugin::start();
}, 20);

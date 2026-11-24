<?php

namespace AnyPressClient\Features;

use WP_CLI;

/**
 * Connects this site to an AnyPress shop, so members sign in with their shop account (see ShopSignIn).
 */
class ShopSignInCommand
{
    /**
     * Connects this site to a shop. Register it on the shop first, with this site's sign-in address:
     *
     *     wp anypress-host account-client add "<name>" --redirect-uris=<this site>/wp-login.php?action=anypress-shop-sign-in
     *
     * ## OPTIONS
     *
     * <shop>
     * : The shop's address, e.g. https://shop.anypress.io
     *
     * --client-id=<id>
     * : The client id the shop gave.
     *
     * --client-secret=<secret>
     * : The client secret the shop gave.
     *
     * [--label=<label>]
     * : The button's text. Default: "Sign in with your shop account".
     *
     * [--space=<group:slugs>]
     * : FluentCommunity spaces each account group joins: group:slugs, with commas between spaces and semicolons
     * between groups, e.g. "customer:customers;seller:sellers-and-resellers".
     *
     * @when after_wp_load
     */
    public function connect($args, $assoc_args): void
    {
        $spaces = [];
        $space_args = $assoc_args['space'] ?? [];
        foreach ((array) $space_args as $arg) {
            foreach (explode(';', (string) $arg) as $pair) {
                [$group, $slugs] = array_pad(explode(':', trim($pair), 2), 2, '');
                $spaces[$group] = explode(',', $slugs);
            }
        }
        // Check before saving, so a mistyped address never replaces a working connection.
        if (!ShopSignIn::valid_shop(untrailingslashit((string) $args[0]))) {
            WP_CLI::error('The shop address must start with https://.');
        }

        ShopSignIn::save([
            'shop' => $args[0],
            'client_id' => $assoc_args['client-id'],
            'client_secret' => $assoc_args['client-secret'],
            'label' => $assoc_args['label'] ?? '',
            'spaces' => $spaces,
        ]);
        if (ShopSignIn::settings() === null) {
            WP_CLI::error('The shop address, client id and client secret are all needed.');
        }
        WP_CLI::success('Members can now sign in with their shop account. Sign-in address: ' . ShopSignIn::redirect_uri());
    }

    /**
     * Turns signing in with a shop account off. Members keep their accounts here.
     *
     * @when after_wp_load
     */
    public function disconnect(): void
    {
        delete_option(ShopSignIn::OPTION);
        WP_CLI::success('Signing in with a shop account is off.');
    }

    /**
     * Shows the shop this site is connected to, and the sign-in address to register there.
     *
     * @when after_wp_load
     */
    public function status(): void
    {
        $settings = ShopSignIn::settings();
        WP_CLI::log('Sign-in address: ' . ShopSignIn::redirect_uri());
        WP_CLI::log($settings === null ? 'Not connected.' : 'Connected to ' . $settings['shop'] . ' as client ' . $settings['client_id'] . '.');
    }
}

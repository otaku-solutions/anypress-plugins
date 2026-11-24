<?php

namespace AnyPressClient\Features;

use WP_Error;
use WP_User;

/**
 * "Sign in with your shop account": members of this site sign in with their account on an AnyPress shop (another
 * WordPress site running AnyPress Host), the way a community sits beside the shop that sells to its members.
 *
 * The shop is the OAuth 2.0 authorization server (AnyPress Host's AccountSignIn: authorization code with PKCE). This
 * site is registered there as a client with `wp anypress-host account-client add`, then connected here with
 * `wp anypress shop-sign-in connect`. Signing in:
 *
 * 1. wp-login.php?action=anypress-shop-sign-in sends the visitor to the shop, with a state bound to a cookie here.
 * 2. The visitor signs in on the shop (or already is) and comes back to the same address with a one-time code.
 * 3. This site swaps the code for a token, reads the account (id, email, name, groups), lets the token go, and signs
 *    the visitor in as the user linked to that account: found by the link, else a plain member with the same email,
 *    else a new member. Users who can edit content are never signed in this way; they use their password.
 * 4. FluentCommunity, when active: the member gets a community profile, and joins or leaves the spaces the settings
 *    tie to the account's groups (e.g. sellers).
 *
 * The shop's own routes have no SDK, so the two calls are plain wp_remote_post / wp_remote_get.
 */
class ShopSignIn
{
    public const OPTION = 'anypress_shop_sign_in';
    public const ACTION = 'anypress-shop-sign-in';
    public const LINK_META = 'anypress_shop_account';
    public const COOKIE = 'anypress_shop_sign_in';
    private const STATE_TRANSIENT = 'anypress_ssi_';
    private const STATE_LIFETIME = 600;
    private const HELPER = 'FluentCommunity\App\Services\Helper';

    public function __construct()
    {
        add_action('login_form_' . self::ACTION, [$this, 'handle']);
        if (self::settings() === null) {
            return;
        }
        add_action('login_form', [$this, 'button']);
        // FluentCommunity's Login button and "sign in to join" links go to the shop. wp-login.php keeps the password form.
        add_filter('fluent_community/auth/login_url', [$this, 'community_login_url']);
    }

    /**
     * @return array{shop: string, client_id: string, client_secret: string, label: string, spaces: array<string, string[]>}|null
     */
    public static function settings(): ?array
    {
        $settings = get_option(self::OPTION);
        if (!is_array($settings) || !self::valid_shop((string) ($settings['shop'] ?? '')) || empty($settings['client_id']) || empty($settings['client_secret'])) {
            return null;
        }

        return [
            'shop' => untrailingslashit((string) $settings['shop']),
            'client_id' => (string) $settings['client_id'],
            'client_secret' => (string) $settings['client_secret'],
            'label' => (string) ($settings['label'] ?? '') ?: 'Sign in with your shop account',
            'spaces' => self::clean_spaces($settings['spaces'] ?? []),
        ];
    }

    /**
     * The shop's address takes the client secret and the sign-in codes, so it must be HTTPS. Plain HTTP is allowed only
     * for a shop on this machine (a local test).
     */
    public static function valid_shop(string $shop): bool
    {
        $parts = wp_parse_url($shop);
        if (!is_array($parts) || empty($parts['host']) || empty($parts['scheme'])) {
            return false;
        }

        return $parts['scheme'] === 'https' || ($parts['scheme'] === 'http' && in_array($parts['host'], ['localhost', '127.0.0.1', '[::1]'], true));
    }

    /** @param array<string, mixed> $settings shop, client_id, client_secret, label, spaces (group => space slugs) */
    public static function save(array $settings): void
    {
        $shop = esc_url_raw(untrailingslashit((string) ($settings['shop'] ?? '')), ['https', 'http']);
        update_option(self::OPTION, [
            'shop' => $shop,
            'client_id' => sanitize_text_field((string) ($settings['client_id'] ?? '')),
            'client_secret' => (string) ($settings['client_secret'] ?? ''),
            'label' => sanitize_text_field((string) ($settings['label'] ?? '')),
            'spaces' => self::clean_spaces($settings['spaces'] ?? []),
        ], false);
    }

    /** The address this site is registered with on the shop. */
    public static function redirect_uri(): string
    {
        return site_url('wp-login.php?action=' . self::ACTION, 'login');
    }

    /** Where a "sign in" link sends the visitor: the start of the flow, then back to $redirect_to. */
    public static function start_url(string $redirect_to = ''): string
    {
        $url = self::redirect_uri();

        return $redirect_to !== '' ? add_query_arg('redirect_to', rawurlencode($redirect_to), $url) : $url;
    }

    public function community_login_url($url): string
    {
        return self::start_url();
    }

    public function button(): void
    {
        $settings = self::settings();
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- only read to carry the page along.
        $redirect_to = isset($_REQUEST['redirect_to']) ? esc_url_raw(wp_unslash($_REQUEST['redirect_to'])) : '';
        printf(
            '<p class="anypress-shop-sign-in" style="margin:0 0 16px"><a class="button button-large" style="display:block;width:100%%;text-align:center" href="%s">%s</a></p>',
            esc_url(self::start_url($redirect_to)),
            esc_html($settings['label'] ?? '')
        );
    }

    /** wp-login.php?action=anypress-shop-sign-in: starts the sign-in, or finishes it when the shop sends the visitor back. */
    public function handle(): void
    {
        $settings = self::settings();
        if ($settings === null) {
            wp_die(esc_html__('Signing in with a shop account is not set up on this site.', 'anypress-client'), '', ['response' => 404]);
        }

        // phpcs:disable WordPress.Security.NonceVerification.Recommended -- an OAuth redirect; the state, bound to a cookie, stands in for the nonce.
        $params = wp_unslash($_GET);
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
        if (isset($params['code']) || isset($params['error'])) {
            $cookie_state = (string) ($_COOKIE[self::COOKIE] ?? '');
            $result = $this->finish($settings, (array) $params, $cookie_state);
            // Only the attempt this cookie belongs to clears it, so a sign-in started in another tab still works.
            if ($cookie_state !== '' && hash_equals($cookie_state, (string) ($params['state'] ?? ''))) {
                $this->forget_cookie();
            }
            if (is_wp_error($result)) {
                wp_die(esc_html($result->get_error_message()), esc_html__('Sign-in error', 'anypress-client'), ['response' => 400, 'back_link' => true]);
            }
            wp_safe_redirect($result);
            exit;
        }

        $redirect_to = isset($params['redirect_to']) ? rawurldecode((string) $params['redirect_to']) : '';
        $start = $this->start($settings, $redirect_to);
        setcookie(self::COOKIE, $start['state'], [
            'expires' => time() + self::STATE_LIFETIME,
            'path' => self::cookie_path(),
            'domain' => COOKIE_DOMAIN ?: '',
            'secure' => is_ssl(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        // The shop is another host, set by an admin, so not wp_safe_redirect.
        wp_redirect($start['url']); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
        exit;
    }

    /**
     * Remembers a new state with its PKCE verifier and the page to come back to.
     *
     * @return array{state: string, url: string} the state (for the cookie) and the shop's authorize address
     */
    public function start(array $settings, string $redirect_to): array
    {
        $state = bin2hex(random_bytes(16));
        $verifier = self::base64url(random_bytes(48));
        set_transient(self::STATE_TRANSIENT . $state, [
            'verifier' => $verifier,
            'redirect_to' => wp_validate_redirect($redirect_to, ''),
        ], self::STATE_LIFETIME);

        $url = $settings['shop'] . '/wp-login.php?' . http_build_query([
            'action' => 'anypress-account-authorize',
            'client_id' => $settings['client_id'],
            'redirect_uri' => self::redirect_uri(),
            'response_type' => 'code',
            'state' => $state,
            'code_challenge' => self::base64url(hash('sha256', $verifier, true)),
            'code_challenge_method' => 'S256',
        ], '', '&', PHP_QUERY_RFC3986);

        return ['state' => $state, 'url' => $url];
    }

    /**
     * Checks the shop's answer, signs the member in and returns where to send them.
     *
     * @param array<string, mixed> $params the query the shop sent back
     * @return string|WP_Error
     */
    public function finish(array $settings, array $params, string $cookie_state)
    {
        $state = (string) ($params['state'] ?? '');
        $saved = $state !== '' ? get_transient(self::STATE_TRANSIENT . $state) : false;
        if ($state !== '') {
            delete_transient(self::STATE_TRANSIENT . $state);
        }
        if (!is_array($saved) || $cookie_state === '' || !hash_equals($cookie_state, $state)) {
            return new WP_Error('anypress_shop_sign_in_state', __('This sign-in link has expired. Please try signing in again.', 'anypress-client'));
        }
        if (isset($params['error'])) {
            return new WP_Error('anypress_shop_sign_in_refused', __('The shop did not sign you in. Please try again.', 'anypress-client'));
        }

        $account = $this->fetch_account($settings, (string) ($params['code'] ?? ''), (string) $saved['verifier']);
        if (is_wp_error($account)) {
            return $account;
        }

        $user = $this->member_for($settings, $account);
        if (is_wp_error($user)) {
            return $user;
        }

        $this->sync_spaces($settings, $user, $account['groups']);

        wp_clear_auth_cookie();
        wp_set_current_user($user->ID);
        wp_set_auth_cookie($user->ID, true);
        do_action('wp_login', $user->user_login, $user);

        return (string) $saved['redirect_to'] ?: self::landing_page();
    }

    /**
     * Swaps the code for a token, reads the account with it, then revokes the token: this site keeps no access.
     *
     * @return array{id: int, email: string, name: string, groups: string[]}|WP_Error
     */
    public function fetch_account(array $settings, string $code, string $verifier)
    {
        $failed = new WP_Error('anypress_shop_sign_in_failed', __('We could not reach the shop to sign you in. Please try again in a minute.', 'anypress-client'));
        $base = $settings['shop'] . '/wp-json/anypress-host/v1/account';
        $client = ['client_id' => $settings['client_id'], 'client_secret' => $settings['client_secret']];

        $response = wp_remote_post($base . '/token', ['timeout' => 15, 'redirection' => 0, 'body' => $client + [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => self::redirect_uri(),
            'code_verifier' => $verifier,
        ]]);
        $tokens = is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200 ? null : json_decode(wp_remote_retrieve_body($response), true);
        if (!is_array($tokens) || empty($tokens['access_token'])) {
            return $failed;
        }

        $response = wp_remote_get($base . '/me', ['timeout' => 15, 'redirection' => 0, 'headers' => ['Authorization' => 'Bearer ' . $tokens['access_token']]]);
        $me = is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200 ? null : json_decode(wp_remote_retrieve_body($response), true);

        foreach (['refresh_token', 'access_token'] as $kind) {
            if (!empty($tokens[$kind])) {
                wp_remote_post($base . '/revoke', ['timeout' => 5, 'redirection' => 0, 'blocking' => false, 'body' => $client + ['token' => $tokens[$kind]]]);
            }
        }

        $me = isset($me['data']) && is_array($me['data']) ? $me['data'] : $me;
        if (!is_array($me) || empty($me['id']) || !is_email((string) ($me['email'] ?? ''))) {
            return $failed;
        }

        return [
            'id' => (int) $me['id'],
            'email' => sanitize_email((string) $me['email']),
            'name' => sanitize_text_field((string) ($me['name'] ?? '')),
            'groups' => array_values(array_filter(array_map('sanitize_key', (array) ($me['groups'] ?? [])), 'strlen')),
        ];
    }

    /**
     * The user for this shop account: the one linked to it, else a plain member with its email (then linked), else a
     * new member. A user who can edit content is never signed in with a shop account.
     *
     * @param array{id: int, email: string, name: string, groups: string[]} $account
     * @return WP_User|WP_Error
     */
    public function member_for(array $settings, array $account)
    {
        // The shop's host and folder, so two shops on one host never share links (a shop at the root keeps host:id).
        $link = (string) wp_parse_url($settings['shop'], PHP_URL_HOST) . untrailingslashit((string) wp_parse_url($settings['shop'], PHP_URL_PATH)) . ':' . $account['id'];
        $linked = get_users(['meta_key' => self::LINK_META, 'meta_value' => $link, 'number' => 1]); // phpcs:ignore WordPress.DB.SlowDBQuery -- one lookup by an exact key and value, only when a member signs in.
        $user = $linked ? $linked[0] : get_user_by('email', $account['email']);

        if ($user instanceof WP_User) {
            $other_link = (string) get_user_meta($user->ID, self::LINK_META, true);
            if (user_can($user, 'edit_posts') || ($other_link !== '' && $other_link !== $link)) {
                return new WP_Error('anypress_shop_sign_in_manager', __('This account signs in with its password. Please use the password form.', 'anypress-client'));
            }
        } else {
            $user_id = wp_insert_user([
                'user_login' => self::new_username($account['email']),
                'user_email' => $account['email'],
                'user_pass' => wp_generate_password(32, true, true),
                'display_name' => $account['name'] ?: strstr($account['email'], '@', true),
                'first_name' => (string) strtok($account['name'], ' '),
                // Always a plain member, whatever the site's default role: shop accounts never get editing rights.
                'role' => 'subscriber',
            ]);
            if (is_wp_error($user_id)) {
                return new WP_Error('anypress_shop_sign_in_user', __('We could not set up your membership. Please try again.', 'anypress-client'));
            }
            $user = get_user_by('id', $user_id);
        }

        update_user_meta($user->ID, self::LINK_META, $link);
        if (class_exists('FluentCommunity\App\Models\User')) {
            $member = \FluentCommunity\App\Models\User::find($user->ID);
            if ($member) {
                $member->syncXProfile();
            }
        }

        return $user;
    }

    /**
     * Joins the member to the spaces tied to their groups, and takes them out of tied spaces their groups no longer
     * give. Spaces no group is tied to are left alone.
     *
     * @param string[] $groups
     */
    public function sync_spaces(array $settings, WP_User $user, array $groups): void
    {
        if (!$settings['spaces'] || !class_exists(self::HELPER) || !class_exists('FluentCommunity\App\Models\BaseSpace')) {
            return;
        }

        $wanted = [];
        $tied = [];
        foreach ($settings['spaces'] as $group => $slugs) {
            $tied = array_merge($tied, $slugs);
            if (in_array((string) $group, $groups, true)) {
                $wanted = array_merge($wanted, $slugs);
            }
        }

        foreach (array_unique($tied) as $slug) {
            $space = \FluentCommunity\App\Models\BaseSpace::query()->withoutGlobalScopes()->where('slug', $slug)->first();
            if (!$space) {
                continue;
            }
            $is_member = (bool) call_user_func([self::HELPER, 'isUserInSpace'], $user->ID, $space->id);
            if (in_array($slug, $wanted, true) && !$is_member) {
                call_user_func([self::HELPER, 'addToSpace'], $space, $user->ID, 'member', 'by_admin');
            } elseif (!in_array($slug, $wanted, true) && $is_member) {
                call_user_func([self::HELPER, 'removeFromSpace'], $space, $user->ID, 'by_admin');
            }
        }
    }

    /** The community when FluentCommunity is active, else the home page. */
    private static function landing_page(): string
    {
        return class_exists(self::HELPER) ? (string) call_user_func([self::HELPER, 'baseUrl']) : home_url('/');
    }

    private static function new_username(string $email): string
    {
        // WordPress usernames hold 60 characters; keep room for a number when the name is taken.
        $base = substr(sanitize_user((string) strstr($email, '@', true), true), 0, 50) ?: 'member';
        $name = $base;
        for ($i = 2; username_exists($name); $i++) {
            $name = $base . $i;
        }

        return $name;
    }

    /** @return array<string, string[]> group => space slugs */
    private static function clean_spaces($spaces): array
    {
        $clean = [];
        foreach ((array) $spaces as $group => $slugs) {
            $group = sanitize_key((string) $group);
            $slugs = array_values(array_filter(array_map('sanitize_title', (array) $slugs)));
            if ($group !== '' && $slugs) {
                $clean[$group] = $slugs;
            }
        }

        return $clean;
    }

    private function forget_cookie(): void
    {
        setcookie(self::COOKIE, '', ['expires' => time() - HOUR_IN_SECONDS, 'path' => self::cookie_path(), 'domain' => COOKIE_DOMAIN ?: '']);
    }

    /** The folder wp-login.php is served from, where the shop sends the visitor back, so the state cookie reaches it. */
    private static function cookie_path(): string
    {
        $path = (string) wp_parse_url(site_url('wp-login.php'), PHP_URL_PATH);

        return trailingslashit(dirname($path ?: '/wp-login.php'));
    }

    private static function base64url(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }
}

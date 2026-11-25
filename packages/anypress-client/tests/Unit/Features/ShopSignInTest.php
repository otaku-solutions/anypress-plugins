<?php

namespace Tests\Unit\Features;

use Brain\Monkey\Functions;
use Tests\Unit\TestCase;
use AnyPressClient\Features\ShopSignIn;

/**
 * Signing in with a shop account: the settings, the start of the flow, and the answers it refuses. The whole flow, with
 * a real shop and a real browser, is scripts/playground/shop-sign-in.mjs.
 */
class ShopSignInTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        if (!class_exists('WP_Error')) {
            eval('class WP_Error { public $code; public $message; public $data; public function __construct($code = "", $message = "", $data = "") { $this->code = $code; $this->message = $message; $this->data = $data; } public function get_error_code() { return $this->code; } public function get_error_message() { return $this->message; } }');
        }
    }

    private array $options = [];
    private array $transients = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->options = [];
        $this->transients = [];
        Functions\when('get_option')->alias(fn ($key, $default = false) => $this->options[$key] ?? $default);
        Functions\when('update_option')->alias(function ($key, $value) {
            $this->options[$key] = $value;
            return true;
        });
        Functions\when('get_transient')->alias(fn ($key) => $this->transients[$key] ?? false);
        Functions\when('set_transient')->alias(function ($key, $value) {
            $this->transients[$key] = $value;
            return true;
        });
        Functions\when('delete_transient')->alias(function ($key) {
            unset($this->transients[$key]);
            return true;
        });
        Functions\when('untrailingslashit')->alias(fn ($s) => rtrim((string) $s, '/\\'));
        Functions\when('esc_url_raw')->returnArg();
        Functions\when('sanitize_text_field')->returnArg();
        Functions\when('sanitize_key')->alias(fn ($key) => preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $key)));
        Functions\when('sanitize_title')->alias(fn ($s) => trim(preg_replace('/[^a-z0-9]+/', '-', strtolower((string) $s)), '-'));
        Functions\when('site_url')->alias(fn ($path = '') => 'https://community.test/' . ltrim($path, '/'));
        Functions\when('wp_validate_redirect')->alias(fn ($url, $fallback) => str_starts_with((string) $url, 'https://community.test/') ? $url : $fallback);
        Functions\when('__')->returnArg();
        Functions\when('wp_parse_url')->alias(fn ($url, $component = -1) => parse_url((string) $url, $component));
    }

    private function settings(): array
    {
        ShopSignIn::save([
            'shop' => 'https://shop.test/',
            'client_id' => 'abc',
            'client_secret' => 'secret',
            'spaces' => ['Seller' => ['Sellers And Resellers', ''], 'customer' => ['customers'], 'empty' => []],
        ]);

        return ShopSignIn::settings();
    }

    public function testIsOffUntilConnected(): void
    {
        $this->assertNull(ShopSignIn::settings());
        ShopSignIn::save(['shop' => 'https://shop.test', 'client_id' => 'abc', 'client_secret' => '']);
        $this->assertNull(ShopSignIn::settings());
    }

    public function testOnlyTalksToAShopOverHttps(): void
    {
        $this->assertTrue(ShopSignIn::valid_shop('https://shop.test'));
        $this->assertTrue(ShopSignIn::valid_shop('http://127.0.0.1:9450'));
        $this->assertFalse(ShopSignIn::valid_shop('http://shop.test'));
        $this->assertFalse(ShopSignIn::valid_shop('shop.test'));

        ShopSignIn::save(['shop' => 'http://shop.test', 'client_id' => 'abc', 'client_secret' => 'secret']);
        $this->assertNull(ShopSignIn::settings());
    }

    public function testKeepsTheShopAndTheSpacesEachGroupJoins(): void
    {
        $settings = $this->settings();

        $this->assertSame('https://shop.test', $settings['shop']);
        $this->assertSame('Sign in with your shop account', $settings['label']);
        $this->assertSame(['seller' => ['sellers-and-resellers'], 'customer' => ['customers']], $settings['spaces']);
    }

    public function testStartsOnTheShopWithAStateAndAS256Challenge(): void
    {
        $start = (new ShopSignIn())->start($this->settings(), 'https://community.test/space/say-hello/home');

        $this->assertMatchesRegularExpression('/^[0-9a-f]{32}$/', $start['state']);
        $this->assertStringStartsWith('https://shop.test/wp-login.php?action=anypress-account-authorize&', $start['url']);
        parse_str((string) parse_url($start['url'], PHP_URL_QUERY), $query);
        $this->assertSame('abc', $query['client_id']);
        $this->assertSame('https://community.test/wp-login.php?action=anypress-shop-sign-in', $query['redirect_uri']);
        $this->assertSame('S256', $query['code_challenge_method']);
        $this->assertSame($start['state'], $query['state']);

        $saved = $this->transients['anypress_ssi_' . $start['state']];
        $this->assertSame('https://community.test/space/say-hello/home', $saved['redirect_to']);
        $expected = rtrim(strtr(base64_encode(hash('sha256', $saved['verifier'], true)), '+/', '-_'), '=');
        $this->assertSame($expected, $query['code_challenge']);
    }

    public function testDoesNotSendMembersToAnotherSiteAfterwards(): void
    {
        $start = (new ShopSignIn())->start($this->settings(), 'https://elsewhere.test/');

        $this->assertSame('', $this->transients['anypress_ssi_' . $start['state']]['redirect_to']);
    }

    public function testRefusesAnAnswerFromAnotherBrowser(): void
    {
        $sign_in = new ShopSignIn();
        $settings = $this->settings();
        $start = $sign_in->start($settings, '');

        $result = $sign_in->finish($settings, ['code' => 'c', 'state' => $start['state']], str_repeat('0', 32));

        $this->assertInstanceOf(\WP_Error::class, $result);
        $this->assertSame('anypress_shop_sign_in_state', $result->get_error_code());
        // The state is used up, so the right browser can't use it afterwards either.
        $this->assertArrayNotHasKey('anypress_ssi_' . $start['state'], $this->transients);
    }

    public function testRefusesAStateThisSiteNeverStarted(): void
    {
        $result = (new ShopSignIn())->finish($this->settings(), ['code' => 'c', 'state' => 'made-up'], 'made-up');

        $this->assertSame('anypress_shop_sign_in_state', $result->get_error_code());
    }

    public function testStopsWhenTheShopRefused(): void
    {
        $sign_in = new ShopSignIn();
        $settings = $this->settings();
        $start = $sign_in->start($settings, '');

        $result = $sign_in->finish($settings, ['error' => 'access_denied', 'state' => $start['state']], $start['state']);

        $this->assertSame('anypress_shop_sign_in_refused', $result->get_error_code());
    }
}

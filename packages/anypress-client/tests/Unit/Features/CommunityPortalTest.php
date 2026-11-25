<?php

namespace Tests\Unit\Features;

use Brain\Monkey\Filters;
use Brain\Monkey\Functions;
use Tests\Unit\TestCase;
use AnyPressClient\Features\CommunityPortal;

/**
 * FluentAuth's sign-in rules on FluentCommunity's own sign-in, and the "community on the home page" choice.
 */
class CommunityPortalTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Functions\when('admin_url')->justReturn('https://shop.test/wp-admin/');
        Functions\when('untrailingslashit')->alias(fn ($s) => rtrim((string) $s, '/\\'));
        Functions\when('wp_validate_redirect')->alias(fn ($url, $fallback) => str_starts_with($url, 'https://shop.test/') ? $url : $fallback);
    }

    private function user(): \WP_User
    {
        return \Mockery::mock(\WP_User::class);
    }

    public function testSendsMembersWhereFluentAuthsRuleSays(): void
    {
        Filters\expectApplied('login_redirect')->once()->andReturn('https://shop.test/portal/courses');
        $this->assertSame('https://shop.test/portal/courses', CommunityPortal::ruled_page($this->user(), 'https://shop.test/portal'));
    }

    public function testKeepsTheFeedWithoutARule(): void
    {
        // No rule: the filter hands back the wp-admin address it was given.
        Filters\expectApplied('login_redirect')->once()->andReturnFirstArg();
        $this->assertSame('https://shop.test/portal', CommunityPortal::ruled_page($this->user(), 'https://shop.test/portal'));
    }

    public function testRefusesAnotherSite(): void
    {
        Filters\expectApplied('login_redirect')->once()->andReturn('https://elsewhere.test/');
        $this->assertSame('https://shop.test/portal', CommunityPortal::ruled_page($this->user(), 'https://shop.test/portal'));
    }

    public function testKeepsAPageTheMemberAskedFor(): void
    {
        // FluentCommunity isn't loaded in unit tests, so any address is passed through untouched.
        Filters\expectApplied('login_redirect')->never();
        Functions\when('get_option')->justReturn('no');
        Functions\when('add_filter')->justReturn(true);
        Functions\when('add_action')->justReturn(true);
        $portal = new CommunityPortal();
        $this->assertSame('https://shop.test/portal/space/x', $portal->landing_page('https://shop.test/portal/space/x', $this->user()));
    }

    public function testSettingIsYesOrNo(): void
    {
        $this->assertSame('yes', CommunityPortal::sanitize('yes'));
        $this->assertSame('no', CommunityPortal::sanitize('1'));
        $this->assertSame('no', CommunityPortal::sanitize(null));
    }

    private function palette(): array
    {
        $slugs = ['base' => '#ffffff', 'main' => '#15171c', 'secondary' => '#4b505c', 'tertiary' => '#f4f5f7', 'primary' => '#2747b8', 'primary-accent' => '#e3e9fb', 'border-light' => '#e1e4ea', 'main-accent' => '#d9dce3'];

        return array_map(fn ($slug, $colour) => ['slug' => $slug, 'color' => $colour, 'name' => $slug], array_keys($slugs), $slugs);
    }

    public function testTurnsTheSitePaletteIntoCommunityColours(): void
    {
        $colours = CommunityPortal::site_colours($this->palette());

        $this->assertSame('#2747b8', $colours['body']['primary_button']);
        $this->assertSame('#ffffff', $colours['body']['primary_button_text']);
        $this->assertSame('#15171c', $colours['body']['primary_text']);
        $this->assertSame('#e3e9fb', $colours['spaces']['active_bg']);
    }

    public function testLeavesThemesWithoutThosePaletteSlugsAlone(): void
    {
        $palette = array_filter($this->palette(), fn ($entry) => $entry['slug'] !== 'primary');
        $this->assertNull(CommunityPortal::site_colours($palette));

        $odd = $this->palette();
        $odd[0]['color'] = 'var(--wp--custom--white)';
        $this->assertNull(CommunityPortal::site_colours($odd));
    }

    public function testUsesSiteColoursOnlyWhileTheDefaultSchemeIsOn(): void
    {
        Functions\when('wp_get_global_settings')->justReturn($this->palette());

        $this->assertSame(CommunityPortal::SCHEME, CommunityPortal::use_scheme(['light_schema' => 'default'])['light_schema']);
        $this->assertSame('sunset_sands', CommunityPortal::use_scheme(['light_schema' => 'sunset_sands'])['light_schema']);
    }
}

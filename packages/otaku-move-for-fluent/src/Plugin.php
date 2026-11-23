<?php

namespace OtakuMove;

if (!defined('ABSPATH')) {
    exit;
}

use OtakuMove\Lib\Crm\CrmCommand;
use OtakuMove\Lib\Crm\CrmSwitch;
use OtakuMove\Lib\Forms\ConditionalConfirmations;
use OtakuMove\Lib\Forms\FormsCommand;
use OtakuMove\Lib\Forms\FormsSwitch;
use OtakuMove\Lib\Moving\AffiliateImport;
use OtakuMove\Lib\Moving\CalendlyImport;
use OtakuMove\Lib\Moving\CircleImport;
use OtakuMove\Lib\Moving\CommunityImport;
use OtakuMove\Lib\Moving\CourseImport;
use OtakuMove\Lib\Moving\ImportCommand;
use OtakuMove\Lib\Moving\MemberPressImport;
use OtakuMove\Lib\Moving\SkoolImport;
use OtakuMove\Lib\Moving\SupportImport;
use OtakuMove\Lib\Shop\ShopCommand;
use OtakuMove\Lib\Shop\ShopSwitch;

/**
 * The moving switches, for any WordPress site: the Move to Fluent page under Tools and `wp otaku-move <switch> switch`. It registers no WordPress abilities, so nothing outside the site can run
 * a switch.
 */
class Plugin
{
    public static function start(): void
    {
        // Fluent Forms copies of conditional confirmations need this filter on every request after the forms switch.
        new ConditionalConfirmations();

        $forms = new FormsSwitch();
        $shop = new ShopSwitch();
        $crm = new CrmSwitch();
        $imports = [new SupportImport(), new AffiliateImport(), new CommunityImport(), new CourseImport(), new CircleImport(), new SkoolImport(), new CalendlyImport(), new MemberPressImport()];

        new MovePage($forms, $shop, $crm, ...$imports);

        if (defined('WP_CLI') && WP_CLI) {
            \WP_CLI::add_command('otaku-move forms', FormsCommand::class);
            \WP_CLI::add_command('otaku-move shop', ShopCommand::class);
            \WP_CLI::add_command('otaku-move crm', CrmCommand::class);
            foreach ($imports as $import) {
                \WP_CLI::add_command('otaku-move ' . $import->key(), new ImportCommand($import));
            }
        }
    }
}

<?php

namespace OtakuMigration;

if (!defined('ABSPATH')) {
    exit;
}

use OtakuMigration\Lib\Crm\CrmCommand;
use OtakuMigration\Lib\Crm\CrmSwitch;
use OtakuMigration\Lib\Forms\ConditionalConfirmations;
use OtakuMigration\Lib\Forms\FormsCommand;
use OtakuMigration\Lib\Forms\FormsSwitch;
use OtakuMigration\Lib\Moving\AffiliateImport;
use OtakuMigration\Lib\Moving\CalendlyImport;
use OtakuMigration\Lib\Moving\CircleImport;
use OtakuMigration\Lib\Moving\CommunityImport;
use OtakuMigration\Lib\Moving\CourseImport;
use OtakuMigration\Lib\Moving\ImportCommand;
use OtakuMigration\Lib\Moving\MemberPressImport;
use OtakuMigration\Lib\Moving\SkoolImport;
use OtakuMigration\Lib\Moving\SupportImport;
use OtakuMigration\Lib\Shop\ShopCommand;
use OtakuMigration\Lib\Shop\ShopSwitch;

/**
 * The moving switches, for any WordPress site: the Migrate to Fluent page under Tools and `wp otaku-migration <switch> switch`. It registers no WordPress abilities, so nothing outside the site can run
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
            \WP_CLI::add_command('otaku-migration forms', FormsCommand::class);
            \WP_CLI::add_command('otaku-migration shop', ShopCommand::class);
            \WP_CLI::add_command('otaku-migration crm', CrmCommand::class);
            foreach ($imports as $import) {
                \WP_CLI::add_command('otaku-migration ' . $import->key(), new ImportCommand($import));
            }
        }
    }
}

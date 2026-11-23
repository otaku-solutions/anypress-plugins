<?php

// Otaku Move for Fluent's own copy of the switches' Core/FluentPlugin.php, put in place by scripts/build-move.sh.

namespace OtakuMove\Lib\Core;

if (!defined('ABSPATH')) {
    exit;
}

use WP_Error;

/**
 * On hosted sites the switches turn on the Fluent plugin they copy into. A wordpress.org plugin must not change
 * other plugins' activation, so in Otaku Move for Fluent they never do: each switch's check says which plugin to turn on.
 */
class FluentPlugin
{
    public static function turns_on(): bool
    {
        return false;
    }

    /** Never turns anything on: the switch's own check reports the plugin that is off. */
    public static function turn_on(string $file, string $name, bool $ready): ?WP_Error
    {
        return null;
    }

    /** Never turns anything on. */
    public static function turn_on_quietly(string $file): void
    {
    }
}

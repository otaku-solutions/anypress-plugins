<?php

namespace Tests\Unit\Features;

use Brain\Monkey\Functions;
use Tests\Unit\TestCase;
use AnyPressClient\Features\McpServer;

/**
 * The website's MCP server lists AnyPress's site abilities and AutomatorWP's, and nothing else.
 */
class McpServerTest extends TestCase
{
    public function test_server_lists_anypress_and_automatorwp_abilities_only(): void
    {
        if (!defined('ANYPRESS_CLIENT_VERSION')) {
            define('ANYPRESS_CLIENT_VERSION', '0.0.0-test');
        }
        $ability = fn (string $name, string $category, array $meta = []) => new class ($name, $category, $meta) {
            public function __construct(private string $name, private string $category, private array $meta)
            {
            }
            public function get_name(): string
            {
                return $this->name;
            }
            public function get_category(): string
            {
                return $this->category;
            }
            public function get_meta(): array
            {
                return $this->meta;
            }
        };

        Functions\when('wp_get_abilities')->justReturn([
            $ability('anypress/get-page', 'anypress', ['mcp' => ['public' => true, 'type' => 'tool']]),
            $ability('anypress/guide-build', 'anypress', ['mcp' => ['public' => true, 'type' => 'resource']]),
            $ability('automatorwp/create-automation', 'automatorwp'),
            $ability('automatorwp/run-actions', 'automatorwp'),
            $ability('core/get-site-info', 'site'),
            $ability('fluentcrm/list-contacts', 'fluentcrm'),
        ]);
        Functions\when('get_option')->justReturn('');

        $adapter = new class {
            public array $args = [];
            public function create_server(...$args): void
            {
                $this->args = $args;
            }
        };

        (new McpServer())->create_server($adapter);

        $this->assertSame(['anypress/get-page', 'automatorwp/create-automation', 'automatorwp/run-actions'], $adapter->args[9]);
        $this->assertSame(['anypress/guide-build'], $adapter->args[10]);
    }
}

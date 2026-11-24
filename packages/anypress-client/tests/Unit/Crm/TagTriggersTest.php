<?php

namespace Tests\Unit\Crm;

use AnyPressClient\Crm\TagTriggers;
use Brain\Monkey\Actions;
use Tests\Unit\TestCase;

/**
 * Free FluentCRM's "Tag Applied" trigger: each new tag is passed on as the trigger's own action, and an automation
 * starts only for the tags it was set to.
 */
class TagTriggersTest extends TestCase
{
    public function testPassesNewTagsOnAsTheTriggersAction(): void
    {
        $contact = (object) ['id' => 7, 'email' => 'ava@anypress.example'];
        Actions\expectDone(TagTriggers::ACTION)->once()->with([3, 5], $contact);

        (new TagTriggers())->relay($contact, ['3', 5, 0]);
    }

    public function testPassesNothingOnWithoutTagsOrAContact(): void
    {
        Actions\expectDone(TagTriggers::ACTION)->never();

        $triggers = new TagTriggers();
        $triggers->relay((object) ['id' => 7], []);
        $triggers->relay(null, [3]);
    }

    public function testStartsOnlyForTheChosenTags(): void
    {
        $this->assertTrue(TagTriggers::matches([3, '9'], [9]));
        $this->assertFalse(TagTriggers::matches([3], [4, 5]));
        $this->assertFalse(TagTriggers::matches([], [3]));
    }
}

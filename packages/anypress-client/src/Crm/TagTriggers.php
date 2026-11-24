<?php

namespace AnyPressClient\Crm;

/**
 * "Tag Applied" for free FluentCRM: an automation can start when a contact is given one of its tags. Free FluentCRM
 * only starts automations from a form entry or a new WordPress user; its own tag trigger is a Pro feature. A store
 * whose contacts come in from outside (a website or app built elsewhere, sending them through FluentCRM's incoming
 * webhook or REST API, such as a Back Office store) tags them "Customer", "Cancelled" and so on, and these tags start
 * its welcome and win-back emails.
 *
 * FluentCRM starts an automation by its trigger's WordPress action, so this passes each new tag on as
 * `anypress_crm_tag_applied` and registers the trigger for it once FluentCRM has loaded. It also works beside
 * FluentCRM Pro, as its own trigger next to Pro's.
 */
class TagTriggers
{
    public const ACTION = 'anypress_crm_tag_applied';

    public function __construct()
    {
        add_action('fluent_crm/contact_added_to_tags', [$this, 'relay'], 10, 2);
        // FluentCRM sets its own triggers up at init priority 1 and hooks the ones automations use at 20.
        add_action('init', [$this, 'register'], 5);
    }

    /** Registers the trigger while FluentCRM is active. */
    public function register(): void
    {
        if (class_exists('\FluentCrm\App\Services\Funnel\BaseTrigger')) {
            new TagAppliedTrigger();
        }
    }

    /**
     * FluentCRM's "tags were added" (the contact, then the new tag ids), passed on as the trigger's own action.
     *
     * @param object $contact A FluentCRM contact (Subscriber).
     * @param array  $tagIds  The ids of the tags just added.
     */
    public function relay($contact, $tagIds): void
    {
        $tagIds = array_values(array_filter(array_map('intval', (array) $tagIds)));
        if ($tagIds && is_object($contact)) {
            do_action('anypress_crm_tag_applied', $tagIds, $contact);
        }
    }

    /**
     * Whether an automation set to the tags $chosen starts for a contact who was just given $added.
     *
     * @param array $chosen The tag ids the automation is set to (any of them).
     * @param array $added  The tag ids just added.
     */
    public static function matches(array $chosen, array $added): bool
    {
        $chosen = array_map('intval', $chosen);
        return (bool) array_intersect($chosen, array_map('intval', $added));
    }
}

<?php

namespace AnyPressClient\Crm;

use FluentCrm\App\Services\Funnel\BaseTrigger;
use FluentCrm\App\Services\Funnel\FunnelHelper;
use FluentCrm\App\Services\Funnel\FunnelProcessor;

/**
 * The "Tag Applied" automation trigger (TagTriggers): starts the automation for a contact given any of its chosen
 * tags. Loaded only while FluentCRM is active, since it extends FluentCRM's own trigger class.
 */
class TagAppliedTrigger extends BaseTrigger
{
    public function __construct()
    {
        $this->triggerName = TagTriggers::ACTION;
        $this->actionArgNum = 2;
        $this->priority = 20;
        parent::__construct();
    }

    public function getTrigger()
    {
        return [
            'category'    => __('CRM', 'anypress-client'),
            'label'       => __('Tag Applied', 'anypress-client'),
            'description' => __('Starts when a contact is given one of the chosen tags, from any source: a form, an import, the incoming webhook or the REST API.', 'anypress-client'),
            'icon'        => 'fc-icon-tag_applied',
        ];
    }

    public function getFunnelSettingsDefaults()
    {
        return ['tags' => []];
    }

    public function getSettingsFields($funnel)
    {
        return [
            'title'     => __('Tag Applied', 'anypress-client'),
            'sub_title' => __('Starts when a contact is given one of these tags.', 'anypress-client'),
            'fields'    => [
                'tags' => [
                    'type'        => 'option_selectors',
                    'option_key'  => 'tags',
                    'is_multiple' => true,
                    'creatable'   => true,
                    'label'       => __('Tags', 'anypress-client'),
                    'placeholder' => __('Choose tags', 'anypress-client'),
                ],
            ],
        ];
    }

    public function getFunnelConditionDefaults($funnel)
    {
        return ['run_multiple' => 'no'];
    }

    public function getConditionFields($funnel)
    {
        return [
            'run_multiple' => [
                'type'        => 'yes_no_check',
                'label'       => '',
                'check_label' => __('Start again each time the tag is given (otherwise once per contact)', 'anypress-client'),
            ],
        ];
    }

    /**
     * @param object $funnel       The automation.
     * @param array  $originalArgs The new tag ids, then the contact.
     */
    public function handle($funnel, $originalArgs)
    {
        [$tagIds, $contact] = array_pad((array) $originalArgs, 2, null);
        if (!is_object($contact) || empty($contact->id)) {
            return;
        }
        $settings = (array) ($funnel->settings ?? []);
        if (!TagTriggers::matches((array) ($settings['tags'] ?? []), (array) $tagIds)) {
            return;
        }

        $again = (($funnel->conditions['run_multiple'] ?? 'no') === 'yes');
        if (FunnelHelper::ifAlreadyInFunnel($funnel->id, $contact->id)) {
            if (!$again) {
                return;
            }
            FunnelHelper::removeSubscribersFromFunnel($funnel->id, [$contact->id]);
        }

        (new FunnelProcessor())->startFunnelSequence($funnel, [], [
            'source_trigger_name' => $this->triggerName,
            'source_ref_id'       => (int) $contact->id,
        ], $contact);
    }
}

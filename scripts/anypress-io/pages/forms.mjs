// anypress.io's Fluent Forms forms, as Fluent Forms' own export (Tools > Export), for setup.php to import:
//   - "Tips by email": an email, sent to the shop's customer list (includes/lead.php).
//   - "Beta sign-up": name, email and what they'd build, sent to the customer list tagged for the beta (lead.php).
//   - "Seller application": the /sell application, sent to the AnyPress API (includes/application.php), then to the
//     customer list as a Seller. The kinds of site come from the price list, so they always match the plans.
// Each form's settings and fields are written the way Fluent Forms saves them, so they stay editable in its editor.

let key = 0;
const uniq = (name) => `el_anypress_${name}_${++key}`;
const required = (message) => ({ required: { value: true, message, global: false } });
const optional = () => ({ required: { value: false, message: 'This field is required', global: true } });
const options = (pairs) => pairs.map(([value, label]) => ({ label, value, calc_value: '', image: '' }));
const when = (field, value) => ({ type: 'any', status: true, conditions: [{ field, value, operator: '=' }] });

const settings = (label, { help = '', rules = optional(), placeholder, logic = [] } = {}) => ({
	container_class: '', label, label_placement: '', help_message: help, admin_field_label: label, prefix_label: '', suffix_label: '',
	...(placeholder !== undefined ? { placeholder } : {}),
	validation_rules: rules, conditional_logics: logic,
});

const hidden = (name, value, label) => ({ index: 0, element: 'input_hidden', attributes: { type: 'hidden', name, value }, settings: { admin_field_label: label }, editor_options: { title: 'Hidden Field', icon_class: 'ff-edit-hidden-field', template: 'inputHidden' }, uniqElKey: uniq(name) });

const text = (name, label, { placeholder = '', maxlength = '', autocomplete = '', ...rest } = {}) => ({
	index: 2, element: 'input_text', attributes: { type: 'text', name, value: '', class: '', placeholder, maxlength, autocomplete },
	settings: { ...settings(label, rest), is_unique: 'no' }, editor_options: { title: 'Simple Text', icon_class: 'ff-edit-text', template: 'inputText' }, uniqElKey: uniq(name),
});

const email = (name, label, { placeholder = '', message = 'Please add your email.' } = {}) => ({
	index: 1, element: 'input_email', attributes: { type: 'email', name, value: '', id: '', class: '', placeholder, autocomplete: 'email' },
	settings: { ...settings(label, { rules: { ...required(message), email: { value: true, message: "That doesn't look like an email address.", global: false } } }), is_unique: 'no' },
	editor_options: { title: 'Email Address', icon_class: 'ff-edit-email', template: 'inputText' }, uniqElKey: uniq(name),
});

const textarea = (name, label, { placeholder = '', maxlength = '', ...rest } = {}) => ({
	index: 3, element: 'textarea', attributes: { name, value: '', id: '', class: '', placeholder, rows: 3, cols: 2, maxlength, autocomplete: '' },
	settings: settings(label, rest), editor_options: { title: 'Text Area', icon_class: 'ff-edit-textarea', template: 'inputTextarea' }, uniqElKey: uniq(name),
});

const select = (name, label, pairs, { placeholder = 'Choose one', ...rest } = {}) => ({
	index: 7, element: 'select', attributes: { name, value: '', id: '', class: '', autocomplete: '' },
	settings: { ...settings(label, rest), dynamic_default_value: '', placeholder, advanced_options: options(pairs), calc_value_status: false, enable_image_input: false, values_visible: false, enable_option_groups: 'no', enable_select_2: 'no', randomize_options: 'no' },
	editor_options: { title: 'Dropdown', icon_class: 'ff-edit-dropdown', element: 'select', template: 'select' }, uniqElKey: uniq(name),
});

const checkable = (kind, name, label, pairs, rest = {}) => ({
	index: kind === 'radio' ? 8 : 9, element: `input_${kind}`, attributes: { type: kind, name, value: kind === 'radio' ? '' : [] },
	settings: { ...settings(label, rest), dynamic_default_value: '', display_type: '', advanced_options: options(pairs), calc_value_status: false, enable_image_input: false, values_visible: false, randomize_options: 'no', enable_other_option: 'no', layout_class: '' },
	editor_options: { title: kind === 'radio' ? 'Radio Field' : 'Check Box', icon_class: kind === 'radio' ? 'ff-edit-radio' : 'ff-edit-checkbox-1', element: kind === 'radio' ? 'input-radio' : 'input-checkbox', template: 'inputCheckable' },
	uniqElKey: uniq(name),
});

const button = (label) => ({ uniqElKey: uniq('submit'), element: 'button', attributes: { type: 'submit', class: '' }, settings: { align: 'left', button_style: '', container_class: '', help_message: '', background_color: '', button_size: 'md', color: '', button_ui: { type: 'default', text: label, img_url: '' } }, editor_options: { title: 'Submit Button' } });

const form = (title, fields, submit, message) => ({
	title, status: 'published', type: 'form', has_payment: 0,
	form_fields: { fields, submitButton: button(submit) },
	metas: [{ meta_key: 'formSettings', value: JSON.stringify({
		confirmation: { redirectTo: 'samePage', messageToShow: message, customPage: null, samePageFormBehavior: 'hide_form', customUrl: null },
		restrictions: { limitNumberOfEntries: { enabled: false }, scheduleForm: { enabled: false }, requireLogin: { enabled: false }, denyEmptySubmission: { enabled: false } },
		layout: { labelPlacement: 'top', helpMessagePlacement: 'with_label', errorMessagePlacement: 'inline', asteriskPlacement: 'asterisk-right' },
	}) }],
});

const SOURCES = [['search', 'Search (Google, Bing)'], ['social', 'Social media'], ['friend', 'A friend or colleague'], ['event', 'An event or workshop'], ['video', 'YouTube or a podcast'], ['community', 'An online community or forum'], ['other', 'Somewhere else']];
const AUDIENCES = [['shops', 'Shops and makers'], ['specialty', 'Specialty retailers'], ['courses', 'Course creators'], ['associations', 'Chambers and associations'], ['churches', 'Churches'], ['locations', 'Franchises and multi-location businesses'], ['freelancers', 'Freelancers and studios'], ['software', 'Software companies']];
// The shop's customer list tags interest by its plans' short names (Website, Bookings, Store, Community, Everything).
const INTEREST = { 'online-store': 'Store' };
const SELLER_CALL = 'https://shop.anypress.io/seller-call/';

export default function forms(pricing) {
	key = 0;
	return [
		form('Tips by email', [
			email('email', 'Your email', { placeholder: 'you@yourbusiness.com' }),
			hidden('anypress_lead', '1', 'Send to the shop'),
			hidden('group', '{embed_post.post_name}', 'Page'),
		], 'Send me tips', '<p>Thanks! Check your inbox for one email asking you to confirm.</p>'),
		form('Beta sign-up', [
			text('name', 'Your name', { maxlength: 100, autocomplete: 'name' }),
			email('email', 'Email'),
			select('interest', 'What would you like to build?', [...pricing.siteTypes.map((t) => [INTEREST[t.key] ?? t.name.split(' ')[0], t.name]), ['Seller', 'Sell websites to my clients'], ['Reseller', 'Resell under my own brand']], { placeholder: 'Not sure yet' }),
			hidden('anypress_lead', '1', 'Send to the shop'),
			hidden('beta', '1', 'Beta'),
			hidden('source', 'community', 'How they heard about us'),
		], 'Join the beta', "<p><strong>Thanks, you're on the beta list.</strong></p><p>Check your inbox for one email from us and click the button in it to confirm. We'll email your invite when your place is ready, usually within a few days.</p>"),
		form('Seller application', [
			text('name', 'Your name', { maxlength: 100, autocomplete: 'name', rules: required('Please add your name.') }),
			email('email', 'Email'),
			text('business', 'Business name', { maxlength: 100, autocomplete: 'organization', rules: required('Please add your business name.') }),
			text('website', 'Website (optional)', { maxlength: 300, placeholder: 'example.com', autocomplete: 'url' }),
			textarea('clients', 'Who do you sell websites to?', { maxlength: 1000, placeholder: 'For example: restaurants and salons in our city, or members of our chamber', rules: required('Please tell us who you sell websites to.') }),
			select('expected_sites', 'Websites you expect to sell in your first year', [['1-2', '1-2'], ['3-9', '3-9'], ['10-24', '10-24'], ['25+', '25+']], { rules: required('Please choose how many.') }),
			select('source', 'How did you hear about us? (optional)', SOURCES),
			checkable('checkbox', 'site_types', 'What kinds of websites do you want to sell?', [...pricing.siteTypes.map((t) => [t.key, t.name]), ['not-sure', 'Not sure yet']]),
			text('site_types_other', 'Something else? (optional)', { maxlength: 300, placeholder: 'For example: restaurant menus with online ordering' }),
			checkable('checkbox', 'audiences', 'Who are your customers?', [...AUDIENCES, ['none', 'None of these']]),
			text('audiences_other', 'Something else? (optional)', { maxlength: 300, placeholder: 'For example: dentists and vets' }),
			checkable('radio', 'has_site', 'Do you already have a WordPress site to sell from?', [['yes', "Yes, I'll add our plugin to it"], ['no', 'No, build me a storefront']], { rules: required('Please choose one.') }),
			text('subdomain', "Your storefront's address (optional)", { maxlength: 63, placeholder: 'yourbusiness', help: 'A free, ready-to-sell storefront, included with your account, at yourbusiness.anypress.site. You can use your own domain later.', logic: when('has_site', 'no') }),
			checkable('radio', 'highlevel', 'Do you run a HighLevel agency?', [['yes', 'Yes'], ['no', 'No']], { rules: required('Please choose one.'), help: "If you do, your sub-accounts can make and manage websites from HighLevel workflows with the AnyPress app. We'll set you up for it." }),
			hidden('anypress_application', '1', 'Send to the AnyPress API'),
			hidden('anypress_lead', '1', 'Send to the shop'),
			hidden('interest', 'Seller', 'Interest'),
		], 'Send application', `<p><strong>Thanks, we got your application.</strong></p><p>Next, book a short call with us. We get you set up and agree how billing works, then approve your account and email you a link to sign in. We've also emailed you this link.</p><p><a class="wp-element-button" href="${SELLER_CALL}">Book your call</a></p>`),
	];
}

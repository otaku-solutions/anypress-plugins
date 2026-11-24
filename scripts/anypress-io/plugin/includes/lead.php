<?php
/**
 * Sends sign-ups from anypress.io's Fluent Forms to the shop's customer list (FluentCRM on shop.anypress.io), through
 * the shop's lead route (POST /wp-json/anypress/v1/lead, AnyPress Host). The shop sends new contacts one email asking
 * them to confirm. Only forms with a hidden field named anypress_lead are sent; the form's other fields are matched by
 * name: email, names (or name), interest, group, source, campaign and beta. Each send, and why one failed, shows in
 * the entry's log in Fluent Forms.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

add_action( 'fluentform/submission_inserted', 'anypress_io_send_lead', 10, 3 );

/**
 * Sends one form entry to the shop as a lead.
 *
 * @param int    $entry_id The entry's id.
 * @param array  $data     The submitted fields, by name.
 * @param object $form     The form.
 */
function anypress_io_send_lead( $entry_id, $data, $form ): void {
	if ( empty( $data['anypress_lead'] ) || empty( $data['email'] ) ) {
		return;
	}
	$name = $data['names'] ?? ( $data['name'] ?? '' );
	if ( is_array( $name ) ) {
		$name = trim( ( $name['first_name'] ?? '' ) . ' ' . ( $name['last_name'] ?? '' ) );
	}
	$text = static fn ( string $key ): string => sanitize_text_field( (string) ( $data[ $key ] ?? '' ) );
	$body = array(
		'email'    => sanitize_email( (string) $data['email'] ),
		'name'     => sanitize_text_field( (string) $name ),
		'interest' => $text( 'interest' ),
		'group'    => $text( 'group' ),
		'source'   => '' !== $text( 'source' ) ? $text( 'source' ) : 'anypress.io ' . sanitize_text_field( (string) ( $form->title ?? '' ) ),
		'campaign' => $text( 'campaign' ),
		'beta'     => '1' === $text( 'beta' ) ? '1' : '',
	);
	$res  = wp_remote_post(
		ANYPRESS_IO_SHOP . '/wp-json/anypress/v1/lead',
		array(
			'timeout'     => 10,
			'redirection' => 0,
			'headers'     => array(
				'Content-Type' => 'application/json',
				'Accept'       => 'application/json',
			),
			'body'        => wp_json_encode( $body ),
		)
	);
	$code = is_wp_error( $res ) ? 0 : (int) wp_remote_retrieve_response_code( $res );
	do_action(
		'fluentform/log_data',
		array(
			'parent_source_id' => (int) ( $form->id ?? 0 ),
			'source_type'      => 'submission_item',
			'source_id'        => (int) $entry_id,
			'component'        => 'AnyPress',
			'status'           => $code >= 200 && $code < 300 ? 'success' : 'failed',
			'title'            => __( 'Sent to the shop\'s customer list', 'anypress-io' ),
			'description'      => is_wp_error( $res ) ? $res->get_error_message() : sprintf( 'HTTP %d', $code ),
		)
	);
}

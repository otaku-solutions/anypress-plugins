<?php
/**
 * Sends anypress.io's seller application (the Fluent Forms form with a hidden field named anypress_application) to the
 * AnyPress API (POST /applications), the way the site's application always has. It runs as the form's last check, so
 * the API's answer shows on the form: an application from the same email, or a field the API turned down, is shown
 * next to that field and nothing is saved. Once it's sent, the entry is saved and lead.php adds the person to the
 * shop's customer list as a Seller. Nothing is set up until the application is approved on the dashboard.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

add_filter( 'fluentform/validation_errors', 'anypress_io_send_application', 99, 3 );

/**
 * The application's body for the API, from the form's fields.
 *
 * @param array $data The submitted fields, by name.
 */
function anypress_io_application_body( array $data ): array {
	$text      = static fn ( string $key ): string => sanitize_text_field( (string) ( $data[ $key ] ?? '' ) );
	$list      = static fn ( string $key ): array => array_values( array_map( 'sanitize_key', (array) ( $data[ $key ] ?? array() ) ) );
	$storefront = 'no' === $text( 'has_site' );
	$types     = $list( 'site_types' );
	$audiences = array_values( array_diff( $list( 'audiences' ), array( 'none' ) ) );
	$body      = array(
		'name'             => $text( 'name' ),
		'email'            => sanitize_email( (string) ( $data['email'] ?? '' ) ),
		'business'         => $text( 'business' ),
		'website'          => $text( 'website' ),
		'clients'          => sanitize_textarea_field( (string) ( $data['clients'] ?? '' ) ),
		'expectedSites'    => $text( 'expected_sites' ),
		'wantsStorefront'  => $storefront,
		'storefrontSubdomain' => $storefront ? strtolower( $text( 'subdomain' ) ) : '',
		'highLevelAgency'  => 'yes' === $text( 'highlevel' ),
		// "Not sure yet" leaves the kinds of site out, which keeps every kind on their storefront.
		'siteTypes'        => $types && ! in_array( 'not-sure', $types, true ) ? $types : null,
		'siteTypesOther'   => $text( 'site_types_other' ),
		'audiences'        => $audiences,
		'audiencesOther'   => $text( 'audiences_other' ),
	);
	return array_filter( $body, static fn ( $v ): bool => '' !== $v && null !== $v );
}

/**
 * Sends the application once the form's own checks pass, and turns the API's answer into the form's errors.
 *
 * @param array  $errors The form's errors so far, by field name.
 * @param array  $data   The submitted fields, by name.
 * @param object $form   The form.
 * @return array The errors, with the API's answer added when it turned the application down.
 */
function anypress_io_send_application( $errors, $data, $form ) {
	if ( ! empty( $errors ) || empty( $data['anypress_application'] ) ) {
		return $errors;
	}
	$res  = wp_remote_post(
		anypress_io_api() . '/applications',
		array(
			'timeout'     => 20,
			'redirection' => 0,
			'headers'     => array(
				'Content-Type' => 'application/json',
				'Accept'       => 'application/json',
			),
			'body'        => wp_json_encode( anypress_io_application_body( (array) $data ) ),
		)
	);
	$code = is_wp_error( $res ) ? 0 : (int) wp_remote_retrieve_response_code( $res );
	if ( $code >= 200 && $code < 300 ) {
		return $errors;
	}
	if ( 409 === $code ) {
		$errors['email'] = array( __( "We already have an application from this email address. We'll be in touch soon.", 'anypress-io' ) );
		return $errors;
	}
	if ( 400 === $code ) {
		$answer  = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		$message = is_array( $answer ) ? (string) ( $answer['message'] ?? '' ) : '';
		// The API names the field first ("storefrontSubdomain is taken"): show it on that field, in the form's words.
		$fields  = array(
			'name'                => array( 'name', __( 'Please check your name.', 'anypress-io' ) ),
			'email'               => array( 'email', __( 'Please check your email address.', 'anypress-io' ) ),
			'business'            => array( 'business', __( 'Please check your business name.', 'anypress-io' ) ),
			'website'             => array( 'website', __( "Please enter your website's address, or leave it empty.", 'anypress-io' ) ),
			'clients'             => array( 'clients', __( 'Please check who you sell websites to.', 'anypress-io' ) ),
			'expectedSites'       => array( 'expected_sites', __( 'Please check how many websites you expect to sell.', 'anypress-io' ) ),
			'storefrontSubdomain' => array( 'subdomain', __( 'Your storefront address can only use letters, digits and dashes.', 'anypress-io' ) ),
			'siteTypes'           => array( 'site_types', __( 'Please check the kinds of websites you sell.', 'anypress-io' ) ),
			'siteTypesOther'      => array( 'site_types_other', __( 'Please check the other kinds of websites you sell.', 'anypress-io' ) ),
			'audiences'           => array( 'audiences', __( 'Please check who your customers are.', 'anypress-io' ) ),
			'audiencesOther'      => array( 'audiences_other', __( 'Please check your other customers.', 'anypress-io' ) ),
		);
		foreach ( $fields as $api_name => [ $field, $plain ] ) {
			if ( str_starts_with( $message, $api_name . ' ' ) ) {
				$errors[ $field ] = array( str_contains( $message, 'taken' ) ? sanitize_text_field( $message ) : $plain );
				return $errors;
			}
		}
		$errors['name'] = array( __( 'Please check the form and try again.', 'anypress-io' ) );
		return $errors;
	}
	$errors['email'] = array( __( "We couldn't send your application. Please try again in a minute.", 'anypress-io' ) );
	return $errors;
}

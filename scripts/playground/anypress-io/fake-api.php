<?php
/**
 * Stands in for the AnyPress API's seller applications and public demo routes, and the photo upload links on the Try It checks: answers as
 * the API does and records each call in the fake_api_calls option, so nothing leaves the site.
 */
add_filter(
	'pre_http_request',
	function ( $pre, $args, $url ) {
		$answer = fn( $code, $body ) => array( 'headers' => array(), 'body' => wp_json_encode( $body ), 'response' => array( 'code' => $code, 'message' => '' ), 'cookies' => array(), 'filename' => null );
		$log    = fn( $call ) => update_option( 'fake_api_calls', array_merge( get_option( 'fake_api_calls', array() ), array( $call ) ) );
		$body   = isset( $args['body'] ) && is_string( $args['body'] ) ? $args['body'] : '';
		if ( 'https://api.anypress.io/applications' === $url ) {
			$application = json_decode( $body, true );
			$log( array( 'application', $application ) );
			if ( 'again@anypress.example' === ( $application['email'] ?? '' ) ) {
				return $answer( 409, array( 'message' => 'An application from this email already exists' ) );
			}
			if ( 'taken' === ( $application['storefrontSubdomain'] ?? '' ) ) {
				return $answer( 400, array( 'message' => 'storefrontSubdomain is taken' ) );
			}
			return $answer( 201, array( 'id' => 'app_1' ) );
		}
		if ( 'https://api.anypress.io/demos/assistant' === $url ) {
			$log( array( 'assistant', json_decode( $body, true ) ) );
			return $answer( 201, array( 'token' => 'apdemo_' . str_repeat( 'a', 43 ) ) );
		}
		if ( 'https://api.anypress.io/demos/drafts' === $url ) {
			$draft = json_decode( $body, true );
			$log( array( 'draft', $draft ) );
			if ( 'Too big' === ( $draft['content']['pages'][0]['title'] ?? '' ) ) {
				return $answer( 413, array( 'message' => 'This demo is too large to save.' ) );
			}
			return $answer(
				201,
				array(
					'id'            => 'd_test123',
					'maxImageBytes' => 1000000,
					'uploads'       => array(
						array( 'name' => 'photo.jpg', 'uploadUrl' => 'https://bucket.abc.r2.cloudflarestorage.com/photo.jpg?sig=1' ),
						array( 'name' => 'elsewhere.jpg', 'uploadUrl' => 'https://elsewhere.example/photo.jpg' ),
					),
				)
			);
		}
		if ( str_starts_with( $url, 'https://bucket.abc.r2.cloudflarestorage.com/' ) ) {
			$log( array( 'upload', $args['method'] ?? '', strlen( $body ) ) );
			return $answer( 200, array() );
		}
		if ( 'https://api.anypress.io/demos/prospects/p_AAAAAAAAAAAAAAAA' === $url ) {
			return $answer( 200, array( 'company' => 'Rivera Bakery', 'route' => 'owner', 'siteType' => 'online-store', 'kit' => null, 'brand' => array( 'primary' => '#c33' ) ) );
		}
		if ( str_starts_with( $url, 'https://api.anypress.io/demos/' ) ) {
			return $answer( 404, array( 'message' => 'Not found' ) );
		}
		return $pre;
	},
	10,
	3
);

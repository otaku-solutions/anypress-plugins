<?php
/**
 * The Try It page's calls to the AnyPress API's public demo routes, made from this site so the visitor's browser only
 * talks to anypress.io: a sign-in for the website assistant beside the demo's page editor, "Make This My Site" (a demo
 * draft and its photos), and the demos made for one business. None of these routes needs an API key, and none can
 * create, read or change a store. The PHP SDK covers the keyed routes only, so these use WordPress's HTTP API.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

/** The AnyPress API, as the site's other pieces reach it. */
function anypress_io_api(): string {
	return defined( 'ANYPRESS_IO_API' ) ? untrailingslashit( (string) ANYPRESS_IO_API ) : 'https://api.anypress.io';
}

/**
 * One call to the API, answered as [status, decoded body]. Status 0 when the API couldn't be reached.
 *
 * @param string     $method  GET or POST.
 * @param string     $path    The route, e.g. /demos/drafts.
 * @param array|null $body    JSON body for a POST.
 * @param int        $timeout Seconds.
 * @return array{0: int, 1: mixed}
 */
function anypress_io_api_call( string $method, string $path, ?array $body = null, int $timeout = 10 ): array {
	$args = array(
		'method'  => $method,
		'timeout' => $timeout,
		'headers' => array( 'Accept' => 'application/json' ),
	);
	if ( null !== $body ) {
		$args['headers']['Content-Type'] = 'application/json';
		$args['body']                    = wp_json_encode( $body );
	}
	$res = wp_remote_request( anypress_io_api() . $path, $args );
	if ( is_wp_error( $res ) ) {
		return array( 0, null );
	}
	return array( (int) wp_remote_retrieve_response_code( $res ), json_decode( wp_remote_retrieve_body( $res ), true ) );
}

/** The site types the demo routes take: the store template's names. */
function anypress_io_demo_site_types(): array {
	return array( 'website', 'bookings', 'online-store', 'community', 'everything', 'highlevel' );
}

/** Only the API's upload links: object storage, over https. */
function anypress_io_is_upload_link( string $url ): bool {
	$parts = wp_parse_url( $url );
	return is_array( $parts ) && 'https' === ( $parts['scheme'] ?? '' ) && str_ends_with( (string) ( $parts['host'] ?? '' ), '.r2.cloudflarestorage.com' );
}

/**
 * The visitor's calls carry the page's REST nonce: the page that holds the Try It block is never cached (see
 * anypress_io_try_no_cache()), so the nonce is always fresh.
 */
function anypress_io_demo_permission( WP_REST_Request $request ): bool {
	return (bool) wp_verify_nonce( (string) $request->get_header( 'X-WP-Nonce' ), 'wp_rest' );
}

add_action(
	'rest_api_init',
	static function () {
		$site_type = array(
			'type'     => 'string',
			'required' => true,
			'enum'     => anypress_io_demo_site_types(),
		);

		register_rest_route(
			'anypress-io/v1',
			'/demo/assistant',
			array(
				'methods'             => 'POST',
				'permission_callback' => 'anypress_io_demo_permission',
				'args'                => array( 'siteType' => $site_type ),
				'callback'            => static function ( WP_REST_Request $request ) {
					[ $status, $answer ] = anypress_io_api_call( 'POST', '/demos/assistant', array( 'siteType' => $request['siteType'] ) );
					$token               = is_array( $answer ) ? ( $answer['token'] ?? null ) : null;
					$ok                  = $status >= 200 && $status < 300 && is_string( $token ) && preg_match( '/^apdemo_[A-Za-z0-9_-]{43}$/', $token );
					return array( 'token' => $ok ? $token : null );
				},
			)
		);

		register_rest_route(
			'anypress-io/v1',
			'/demo/draft',
			array(
				'methods'             => 'POST',
				'permission_callback' => 'anypress_io_demo_permission',
				'args'                => array(
					'siteType' => $site_type,
					'content'  => array(
						'type'     => 'object',
						'required' => true,
					),
					'images'   => array(
						'type'     => 'array',
						'items'    => array( 'type' => 'string' ),
						'default'  => array(),
						'maxItems' => 200,
					),
				),
				'callback'            => static function ( WP_REST_Request $request ) {
					$failed = __( 'We couldn’t save your demo. Please try again in a minute.', 'anypress-io' );
					// The API checks the content itself (its size, its pages); this site only passes it on.
					[ $status, $answer ] = anypress_io_api_call(
						'POST',
						'/demos/drafts',
						array(
							'siteType' => $request['siteType'],
							'content'  => $request['content'],
							'images'   => array_map( 'sanitize_file_name', $request['images'] ),
						),
						20
					);
					if ( $status < 200 || $status >= 300 || ! is_array( $answer ) || ! is_string( $answer['id'] ?? null ) ) {
						// The API's 4xx messages are written for the visitor (too large, too many saved right now).
						$message = $status >= 400 && $status < 500 && is_array( $answer ) && is_string( $answer['message'] ?? null ) ? $answer['message'] : $failed;
						return new WP_REST_Response( array( 'message' => $message ), $status >= 400 && $status < 500 ? $status : 502 );
					}
					$uploads = array();
					foreach ( (array) ( $answer['uploads'] ?? array() ) as $upload ) {
						if ( is_string( $upload['name'] ?? null ) && is_string( $upload['uploadUrl'] ?? null ) && anypress_io_is_upload_link( $upload['uploadUrl'] ) ) {
							$uploads[] = array(
								'name'      => $upload['name'],
								'uploadUrl' => $upload['uploadUrl'],
							);
						}
					}
					return array(
						'id'            => $answer['id'],
						'uploads'       => $uploads,
						'maxImageBytes' => (int) ( $answer['maxImageBytes'] ?? 0 ),
					);
				},
			)
		);

		register_rest_route(
			'anypress-io/v1',
			'/demo/image',
			array(
				'methods'             => 'POST',
				'permission_callback' => 'anypress_io_demo_permission',
				'args'                => array(
					'uploadUrl' => array(
						'type'              => 'string',
						'required'          => true,
						'validate_callback' => static fn( $value ) => is_string( $value ) && anypress_io_is_upload_link( $value ),
					),
				),
				'callback'            => static function ( WP_REST_Request $request ) {
					$photo = $request->get_body();
					// One photo of a demo; the API's upload link refuses anything larger than the draft allows.
					if ( '' === $photo || strlen( $photo ) > 20 * MB_IN_BYTES ) {
						return array( 'ok' => false );
					}
					$res = wp_remote_request(
						$request['uploadUrl'],
						array(
							'method'  => 'PUT',
							'timeout' => 30,
							'body'    => $photo,
						)
					);
					return array( 'ok' => ! is_wp_error( $res ) && (int) wp_remote_retrieve_response_code( $res ) < 300 );
				},
			)
		);

		register_rest_route(
			'anypress-io/v1',
			'/demo/prospect/(?P<code>p_[A-Za-z0-9_-]{16})',
			array(
				'methods'             => 'GET',
				'permission_callback' => 'anypress_io_demo_permission',
				'callback'            => static function ( WP_REST_Request $request ) {
					[ $status, $demo ] = anypress_io_api_call( 'GET', '/demos/prospects/' . $request['code'] );
					$ok                = 200 === $status && is_array( $demo ) && is_string( $demo['company'] ?? null );
					return $ok ? $demo : new WP_REST_Response( array( 'demo' => null ), 404 );
				},
			)
		);
	}
);

/** The page with the Try It block is never cached: its REST nonce must be fresh, and the demo runs in the browser anyway. */
function anypress_io_try_no_cache(): void {
	if ( is_singular() && has_block( 'anypress-io/try', get_queried_object() ) ) {
		nocache_headers();
	}
}
add_action( 'template_redirect', 'anypress_io_try_no_cache' );

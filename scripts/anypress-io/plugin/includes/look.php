<?php
/**
 * anypress.io's own look, so the pages look exactly as they did before the site moved to WordPress: the site's
 * stylesheet and fonts (assets/site, copied from anypress-site's build), a page template with the same frame
 * (header, main, footer), and nothing from WordPress or the theme that would change how a page sits.
 *
 * The pages are core blocks (groups, headings, paragraphs, lists and Custom HTML) carrying the site's own class
 * names, so they stay editable while the stylesheet lays them out. Attributes core blocks can't hold (an
 * aria-labelledby on a section, say) ride along in `anypressAttrs` and are put back when the block renders.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

/** The address of a file in assets/. */
function anypress_io_asset( string $path ): string {
	return plugins_url( 'assets/' . ltrim( $path, '/' ), dirname( __DIR__ ) . '/anypress-io.php' );
}

/**
 * Styles the front end keeps. Everything else (global styles, block library, theme, layout supports) is left out,
 * as anypress.io's stylesheet lays every page out by itself.
 *
 * @return string[]
 */
function anypress_io_kept_styles(): array {
	return (array) apply_filters( 'anypress_io_kept_styles', array( 'anypress-io-site', 'admin-bar', 'dashicons' ) );
}

// The page frame: the header and footer template parts around the page, as on anypress.io.
add_action(
	'init',
	static function () {
		if ( function_exists( 'register_block_template' ) ) {
			register_block_template(
				'anypress-io//anypress-io',
				array(
					'title'       => __( 'anypress.io page', 'anypress-io' ),
					'description' => __( 'The site header, the page, and the site footer, laid out as on anypress.io.', 'anypress-io' ),
					'post_types'  => array( 'page' ),
					'content'     => '<!-- wp:template-part {"slug":"header","tagName":"div"} /--><!-- wp:group {"tagName":"main","className":"flex-1"} --><main class="wp-block-group flex-1"><!-- wp:post-content /--></main><!-- /wp:group --><!-- wp:template-part {"slug":"footer","tagName":"div"} /-->',
				)
			);
		}
	}
);

// Every page, the home page too, uses that frame unless a page picks another template.
foreach ( array( 'frontpage_template_hierarchy', 'page_template_hierarchy' ) as $anypress_io_hook ) {
	add_filter(
		$anypress_io_hook,
		static function ( array $templates ): array {
			$picked = is_page() ? get_page_template_slug() : '';
			return $picked && 'anypress-io' !== $picked ? $templates : array_merge( array( 'anypress-io' ), $templates );
		}
	);
}

// Attributes core blocks can't hold, kept in anypressAttrs and put back on the block's outer tag. Its `tag` is the tag
// the piece has on anypress.io, kept on the page while the editor shows a block: a label is a <span> Paragraph, a card is
// an <a> Group, a list of icons and words a <ul> Group of <li> Groups, a picture an Image without its box.
add_filter(
	'register_block_type_args',
	static function ( array $args, string $name ): array {
		if ( in_array( $name, array( 'core/group', 'core/heading', 'core/paragraph', 'core/list', 'core/list-item', 'core/details', 'core/image' ), true ) ) {
			$args['attributes']['anypressAttrs'] = array( 'type' => 'object' );
		}
		return $args;
	},
	10,
	2
);

/** The tags a block can keep on the page: anypress.io's inline and box tags, and none (words on their own). */
function anypress_io_kept_tags(): array {
	return array( '', 'span', 'b', 'strong', 'small', 'em', 'i', 'label', 'time', 'a', 'u', 's', 'mark', 'code', 'kbd', 'sup', 'sub', 'abbr', 'cite', 'q', 'div', 'p', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'nav', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'blockquote', 'details', 'summary', 'img' );
}

/** A block's markup with its outer tag back as anypress.io has it. */
function anypress_io_retag( string $content, string $block_name, string $tag ): string {
	if ( 'core/image' === $block_name && 'img' === $tag ) {
		// The picture without the Image block's box, the box's classes on the picture.
		if ( preg_match( '#^\s*<figure class="([^"]*)"[^>]*>\s*(<img\b[^>]*>)\s*</figure>\s*$#s', $content, $m ) ) {
			$img = new WP_HTML_Tag_Processor( $m[2] );
			$img->next_tag();
			$class = trim( (string) preg_replace( '/(^|\s)wp-block-image(\s|$)/', ' ', html_entity_decode( $m[1] ) ) );
			if ( '' !== $class ) {
				$img->set_attribute( 'class', $class );
			}
			return $img->get_updated_html();
		}
		return $content;
	}
	$from = array(
		'core/paragraph' => 'p',
		'core/group'     => '[a-z0-9]+',
	)[ $block_name ] ?? null;
	if ( null === $from || ! in_array( $tag, anypress_io_kept_tags(), true ) || ( '' === $tag && 'core/paragraph' !== $block_name ) ) {
		return $content;
	}
	if ( ! preg_match( '#^(\s*)<(' . $from . ')\b([^>]*)>(.*)</\2>(\s*)$#s', $content, $m ) ) {
		return $content;
	}
	return '' === $tag ? $m[1] . $m[4] . $m[5] : $m[1] . '<' . $tag . $m[3] . '>' . $m[4] . '</' . $tag . '>' . $m[5];
}

add_filter(
	'render_block',
	static function ( string $content, array $block ): string {
		$attrs = $block['attrs']['anypressAttrs'] ?? null;
		if ( ! is_array( $attrs ) || '' === $content ) {
			return $content;
		}
		$tag = $attrs['tag'] ?? null;
		if ( is_string( $tag ) ) {
			$content = anypress_io_retag( $content, (string) $block['blockName'], $tag );
			if ( '' === $tag ) {
				return $content;
			}
		}
		$tags = new WP_HTML_Tag_Processor( $content );
		if ( $tags->next_tag() ) {
			foreach ( $attrs as $name => $value ) {
				$name = (string) $name;
				if ( 'href' === $name ) {
					$tags->set_attribute( 'href', esc_url( (string) $value ) );
				} elseif ( preg_match( '/^(aria-[a-z]+|role|data-[a-z0-9-]+|style|hidden|open|lang|dir|tabindex|title|target|rel|type|width|height|loading|decoding|scope|colspan|rowspan|datetime)$/', $name ) ) {
					$tags->set_attribute( $name, is_bool( $value ) ? $value : (string) $value );
				}
			}
		}
		return $tags->get_updated_html();
	},
	10,
	2
);

// The header's links: the page you're on is marked, and Start stays on the kind of site you're looking at.
add_filter(
	'render_block_core/template-part',
	static function ( string $content, array $block ): string {
		if ( 'header' !== ( $block['attrs']['slug'] ?? '' ) ) {
			return $content;
		}
		$path = '/' . trim( (string) wp_parse_url( (string) ( $_SERVER['REQUEST_URI'] ?? '/' ), PHP_URL_PATH ), '/' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- only compared.
		$path = '/' === $path ? '/' : untrailingslashit( $path );
		$tags = new WP_HTML_Tag_Processor( $content );
		while ( $tags->next_tag( 'a' ) ) {
			$href  = (string) $tags->get_attribute( 'href' );
			$class = (string) $tags->get_attribute( 'class' );
			if ( str_contains( $class, 'aria-[current=page]' ) && ! str_contains( $href, '#' ) && ( $path === $href || str_starts_with( $path, $href . '/' ) ) ) {
				$tags->set_attribute( 'aria-current', 'page' );
			}
			if ( str_contains( $class, 'btn-ink' ) && '/#sites' === $href ) {
				if ( preg_match( '#^/sites/[^/]+$#', $path ) ) {
					$tags->set_attribute( 'href', '#sizes' );
				} elseif ( str_starts_with( $path, '/who/' ) ) {
					$tags->set_attribute( 'href', '#plans' );
				}
			}
		}
		return $tags->get_updated_html();
	},
	10,
	2
);

// The frame's wrappers (the site blocks, template parts and post content) step aside, so the header, main and
// footer sit straight in the body as on anypress.io, and blocks get no layout classes or gaps from WordPress.
add_action(
	'wp',
	static function () {
		if ( is_admin() ) {
			return;
		}
		remove_filter( 'render_block', 'wp_render_layout_support_flag' );
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		remove_action( 'wp_enqueue_scripts', 'wp_enqueue_block_template_skip_link' );
		remove_action( 'wp_footer', 'the_block_template_skip_link' );
	}
);

// The site's words as written: straight quotes and apostrophes, not curly ones.
add_filter( 'run_wptexturize', '__return_false' );

add_filter(
	'body_class',
	static fn( array $classes ): array => is_admin() ? $classes : array_merge( $classes, array( 'flex', 'min-h-full', 'flex-col', 'font-sans' ) )
);

add_action(
	'wp_enqueue_scripts',
	static function () {
		wp_enqueue_style( 'anypress-io-site', anypress_io_asset( 'site/css/site.css' ), array(), ANYPRESS_IO_VERSION );
		wp_add_inline_style( 'anypress-io-site', 'html{height:100%;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.wp-site-blocks,.wp-site-blocks>.wp-block-template-part,.wp-block-post-content{display:contents}' );
		wp_enqueue_script( 'anypress-io-site', anypress_io_asset( 'site/site.js' ), array(), ANYPRESS_IO_VERSION, array( 'strategy' => 'defer' ) );
		wp_add_inline_script(
			'anypress-io-site',
			'window.anypressIo=' . wp_json_encode(
				array(
					'assets' => untrailingslashit( anypress_io_asset( '' ) ),
					'ajax'   => admin_url( 'admin-ajax.php' ),
					'nonce'  => wp_create_nonce( 'fluentform-submit-form' ),
					'post'   => get_the_ID(),
					'call'   => ANYPRESS_IO_SHOP . '/seller-call/',
				)
			) . ';',
			'before'
		);
	},
	5
);

// Turns the drawings' animation on before the first paint, as anypress.io does, unless motion is reduced.
add_action(
	'wp_head',
	static function () {
		wp_print_inline_script_tag( "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window)document.documentElement.classList.add('anim');setTimeout(function(){document.querySelectorAll('.draw:not(.play)').forEach(function(e){e.classList.add('play')})},12000)}catch(e){}" );
	},
	1
);

/** Leaves out every style but the kept ones; runs before the head's and the footer's styles print. */
function anypress_io_drop_styles(): void {
	$keep = anypress_io_kept_styles();
	foreach ( wp_styles()->queue as $handle ) {
		if ( ! in_array( $handle, $keep, true ) ) {
			wp_dequeue_style( $handle );
		}
	}
}
add_action( 'wp_enqueue_scripts', 'anypress_io_drop_styles', PHP_INT_MAX );
add_action( 'wp_head', 'anypress_io_drop_styles', 7 );
add_action( 'wp_footer', 'anypress_io_drop_styles', 1 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );

// In the editor the blocks look as they do on the page.
add_action(
	'enqueue_block_assets',
	static function () {
		if ( is_admin() ) {
			wp_enqueue_style( 'anypress-io-site', anypress_io_asset( 'site/css/site.css' ), array(), ANYPRESS_IO_VERSION );
			// The page canvas as the page: full width, the site's paper, ink and font, and the hand-made pieces in
			// place (assets/site/editor.js) rather than in boxes of their own.
			wp_add_inline_style(
				'anypress-io-site',
				'.editor-styles-wrapper{background:var(--paper);color:var(--ink);font-family:var(--font-hanken);padding:0}'
				. '.editor-styles-wrapper .is-root-container{display:flex;flex-direction:column;padding:0!important;max-width:none!important}'
				. '.editor-styles-wrapper .is-root-container>*{max-width:none!important;margin-left:0!important;margin-right:0!important}'
				. '.editor-styles-wrapper .anypress-io-in-place{display:contents}'
				// A label is a <span> on the page and a Paragraph here, where a section's rules for its paragraphs would win.
				. '.editor-styles-wrapper p.eyebrow{font-family:var(--font-caveat);font-size:1.4rem;font-weight:700;line-height:1;color:var(--rose)}'
				. '.editor-styles-wrapper .sell p.eyebrow{color:var(--honey)}'
				// Words that sit in a line on the page (a <span>, a <b>, words on their own) sit in a line here too, unless the
				// site's own rules say otherwise; an icon sits in its line as on the page.
				. ':where(.editor-styles-wrapper p:is([data-anypress-tag=""],[data-anypress-tag=span],[data-anypress-tag=b],[data-anypress-tag=strong],[data-anypress-tag=small],[data-anypress-tag=em],[data-anypress-tag=i],[data-anypress-tag=a],[data-anypress-tag=label],[data-anypress-tag=time])){display:inline}'
				. '.editor-styles-wrapper .anypress-io-icon{display:contents}'
				// The editor's own link colour and underline stay off the buttons.
				. '.editor-styles-wrapper a.btn{text-decoration:none}.editor-styles-wrapper a.btn-ink{color:var(--paper)}.editor-styles-wrapper a.btn-paper,.editor-styles-wrapper a.btn-honey{color:var(--ink)}'
			);
			wp_enqueue_style( 'anypress-io-editor', anypress_io_asset( 'site/css/editor.css' ), array( 'anypress-io-site' ), ANYPRESS_IO_VERSION );
			wp_enqueue_script( 'anypress-io-canvas', anypress_io_asset( 'site/canvas.js' ), array(), ANYPRESS_IO_VERSION, true );
			wp_add_inline_script( 'anypress-io-canvas', 'window.anypressIo=' . wp_json_encode( array( 'assets' => untrailingslashit( anypress_io_asset( '' ) ) ) ) . ';', 'before' );
		}
	}
);
add_action(
	'enqueue_block_editor_assets',
	static function () {
		wp_enqueue_script( 'anypress-io-attrs', anypress_io_asset( 'site/editor.js' ), array( 'wp-hooks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-i18n', 'wp-api-fetch', 'wp-data' ), ANYPRESS_IO_VERSION, true );
		$drawings = array_map( static fn( string $file ): string => basename( $file, '.svg' ), (array) glob( dirname( __DIR__ ) . '/assets/drawings/*.svg' ) );
		wp_add_inline_script(
			'anypress-io-attrs',
			'window.anypressIoEditor=' . wp_json_encode(
				array(
					'inline'   => current_user_can( 'unfiltered_html' ),
					'assets'   => untrailingslashit( anypress_io_asset( '' ) ),
					'drawings' => $drawings,
				)
			) . ';',
			'before'
		);
	}
);

// The editor shows a Custom HTML piece in place (assets/site/editor.js); one holding price shortcodes is shown with
// the prices filled in, from here.
add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'anypress-io/v1',
			'/preview',
			array(
				'methods'             => 'POST',
				'permission_callback' => static fn() => current_user_can( 'unfiltered_html' ),
				'args'                => array(
					'contents' => array(
						'type'     => 'array',
						'items'    => array( 'type' => 'string' ),
						'maxItems' => 500,
						'required' => true,
					),
				),
				'callback'            => static fn( WP_REST_Request $request ) => array( 'html' => array_map( static fn( $content ) => do_shortcode( (string) $content ), (array) $request['contents'] ) ),
			)
		);
	}
);

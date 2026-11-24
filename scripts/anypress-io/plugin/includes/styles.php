<?php
/**
 * anypress.io's own touches on core blocks, too particular to its pages to belong in the theme: the hero's crossed-off
 * list of chores and a price-notes list that reads as one line. CSS only, printed only on pages that use them.
 *
 * @package AnyPress_IO
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'init',
	static function () {
		register_block_style(
			'core/list',
			array(
				'name'         => 'crossed',
				'label'        => __( 'Crossed off', 'anypress-io' ),
				'inline_style' => '.wp-block-list.is-style-crossed{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:var(--wp--preset--spacing--small);justify-content:center}'
					. '.wp-block-list.is-style-crossed>li{position:relative;padding:.6em 1em;background:var(--wp--preset--color--primary-accent);border:1.5px solid var(--wp--preset--color--main);border-radius:6px;font-family:var(--wp--preset--font-family--caveat,inherit);font-size:var(--wp--preset--font-size--large);rotate:-2deg}'
					. '.wp-block-list.is-style-crossed>li:nth-child(even){rotate:2deg}'
					. '.wp-block-list.is-style-crossed>li::after{content:"";position:absolute;left:8%;right:8%;top:52%;height:2px;background:#d63c3c;rotate:-4deg}',
			)
		);
		register_block_style(
			'core/list',
			array(
				'name'         => 'inline',
				'label'        => __( 'One line', 'anypress-io' ),
				'inline_style' => '.wp-block-list.is-style-inline{list-style:none;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:.4em 1.5em;font-weight:600}'
					. '.wp-block-list.is-style-inline>li+li::before{content:"·";margin-right:1.5em;opacity:.5}',
			)
		);
	}
);

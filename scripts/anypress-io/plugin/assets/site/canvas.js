// The editor's page canvas shows the drawings and scenes as the page does: the editor draws blocks after the page
// loads and again as they change, so each drawing or scene is filled in as it appears, finished (no draw-in).
( function () {
	var assets = ( window.anypressIo && window.anypressIo.assets ) || '';
	var svgs = {};
	var lottie;
	var loadLottie = function () {
		lottie = lottie || new Promise( function ( done ) {
			var s = document.createElement( 'script' );
			s.src = assets + '/site/lottie_light.min.js';
			s.onload = function () {
				done( window.lottie );
			};
			document.head.appendChild( s );
		} );
		return lottie;
	};
	var fill = function ( root ) {
		root.querySelectorAll( '[data-drawing]:not([data-filled])' ).forEach( function ( el ) {
			var name = el.getAttribute( 'data-drawing' );
			el.setAttribute( 'data-filled', '' );
			el.classList.add( 'play' );
			svgs[ name ] = svgs[ name ] || fetch( assets + '/drawings/' + name + '.svg' ).then( function ( r ) {
				return r.ok ? r.text() : '';
			} );
			svgs[ name ].then( function ( svg ) {
				el.innerHTML = svg;
			} );
		} );
		root.querySelectorAll( '[data-vignette]:not([data-filled])' ).forEach( function ( el ) {
			el.setAttribute( 'data-filled', '' );
			Promise.all( [ loadLottie(), fetch( assets + '/lottie/' + el.getAttribute( 'data-vignette' ) + '.json' ).then( function ( r ) {
				return r.json();
			} ) ] ).then( function ( got ) {
				var anim = got[ 0 ].loadAnimation( { container: el, renderer: 'svg', loop: false, autoplay: false, animationData: got[ 1 ] } );
				anim.goToAndStop( anim.totalFrames - 1, true );
			} );
		} );
	};
	var start = function () {
		fill( document );
		new MutationObserver( function () {
			fill( document );
		} ).observe( document.documentElement, { childList: true, subtree: true } );
	};
	if ( document.body ) {
		start();
	} else {
		document.addEventListener( 'DOMContentLoaded', start );
	}
} )();

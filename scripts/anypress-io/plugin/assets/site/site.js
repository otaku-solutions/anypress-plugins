// anypress.io's moving parts, as the site had them: the hand-drawn pictures (loaded, then drawn in as they scroll
// into view), the little animated scenes, the how-to videos' play buttons and the app logos that take turns.
( function () {
	var assets = ( window.anypressIo && window.anypressIo.assets ) || '';
	var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	var root = document.documentElement;

	// Drawings: one request per drawing, shared by every place on the page that shows it.
	var svgs = {};
	document.querySelectorAll( '[data-drawing]' ).forEach( function ( el ) {
		var name = el.getAttribute( 'data-drawing' );
		svgs[ name ] = svgs[ name ] || fetch( assets + '/drawings/' + name + '.svg' ).then( function ( r ) {
			return r.ok ? r.text() : '';
		} );
		svgs[ name ].then( function ( svg ) {
			el.innerHTML = svg;
		} );
	} );

	var play = function ( el ) {
		el.classList.add( 'play' );
	};
	var waiting = Array.prototype.slice.call( document.querySelectorAll( '.draw:not(.play)' ) );
	if ( reduce || ! ( 'IntersectionObserver' in window ) ) {
		waiting.forEach( play );
	} else {
		root.classList.add( 'anim' );
		var io = new IntersectionObserver(
			function ( entries ) {
				entries.forEach( function ( e ) {
					if ( e.isIntersecting ) {
						play( e.target );
						io.unobserve( e.target );
					}
				} );
			},
			{ rootMargin: '0px 0px -6% 0px' }
		);
		waiting.forEach( function ( el ) {
			io.observe( el );
		} );
	}

	// Animated scenes: the player loads once a scene is near the screen, plays once, and again on hover.
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
	document.querySelectorAll( '[data-vignette]' ).forEach( function ( el ) {
		var anim = null;
		var card = el.closest( '[data-replay]' ) || el;
		var seen = new IntersectionObserver(
			function ( entries ) {
				if ( ! entries[ 0 ].isIntersecting ) {
					return;
				}
				seen.disconnect();
				Promise.all( [ loadLottie(), fetch( assets + '/lottie/' + el.getAttribute( 'data-vignette' ) + '.json' ).then( function ( r ) {
					return r.json();
				} ) ] ).then( function ( got ) {
					anim = got[ 0 ].loadAnimation( { container: el, renderer: 'svg', loop: false, autoplay: false, animationData: got[ 1 ] } );
					if ( reduce ) {
						anim.goToAndStop( anim.totalFrames - 1, true );
					} else {
						anim.goToAndPlay( 0, true );
					}
				} );
			},
			{ rootMargin: '0px 0px -15% 0px' }
		);
		seen.observe( el );
		card.addEventListener( 'mouseenter', function () {
			if ( anim && ! reduce ) {
				anim.goToAndPlay( 0, true );
			}
		} );
	} );

	// How-to videos: the player loads only when someone presses play.
	document.querySelectorAll( '.video-tile > button' ).forEach( function ( button ) {
		button.addEventListener( 'click', function () {
			var poster = button.querySelector( 'img' ).getAttribute( 'src' );
			var video = document.createElement( 'video' );
			video.controls = true;
			video.autoplay = true;
			video.playsInline = true;
			video.poster = poster;
			video.width = 1280;
			video.height = 720;
			var source = document.createElement( 'source' );
			source.src = poster.replace( /\.jpg$/, '.mp4' );
			source.type = 'video/mp4';
			video.appendChild( source );
			button.replaceWith( video );
		} );
	} );

	// App logos taking turns beside the AnyPress mark.
	document.querySelectorAll( '.logo-swap' ).forEach( function ( box ) {
		var logos = box.querySelectorAll( '.swap img' );
		var name = box.querySelector( '.logo-name' );
		var known = { n8n: 'n8n', make: 'Make', zapier: 'Zapier', highlevel: 'HighLevel' };
		var names = Array.prototype.map.call( logos, function ( img ) {
			var m = /\/([a-z0-9]+)-logo\.svg/.exec( img.getAttribute( 'src' ) );
			return m ? known[ m[ 1 ] ] || '' : '';
		} );
		if ( logos.length < 2 || reduce ) {
			return;
		}
		var at = 0;
		setInterval( function () {
			logos[ at ].classList.remove( 'on' );
			at = ( at + 1 ) % logos.length;
			logos[ at ].classList.add( 'on' );
			if ( name && names[ at ] ) {
				name.textContent = names[ at ];
			}
		}, 2200 );
	} );
	// The calculators, worked out again from the price list (includes/widgets.php draws them first).
	var D = window.anypressIoPrices;
	if ( D ) {
		var cents = function ( n ) {
			return Math.round( n * 100 ) / 100;
		};
		var money = function ( n ) {
			return '$' + n.toLocaleString( 'en-US', { minimumFractionDigits: Number.isInteger( cents( n ) ) ? 0 : 2, maximumFractionDigits: 2 } );
		};
		var volume = function ( sites ) {
			var p = 0;
			D.tiers.forEach( function ( t ) {
				if ( sites >= t.sites ) {
					p = t.percent;
				}
			} );
			return p;
		};
		var nextTier = function ( sites ) {
			return D.tiers.filter( function ( t ) {
				return sites < t.sites;
			} )[ 0 ];
		};
		var typeOf = function ( id ) {
			return D.types.filter( function ( t ) {
				return t.id === id;
			} )[ 0 ];
		};
		var sizeOf = function ( name ) {
			return D.sizes.filter( function ( s ) {
				return s.name === name;
			} )[ 0 ];
		};
		var press = function ( group, value ) {
			group.querySelectorAll( 'button' ).forEach( function ( b ) {
				b.setAttribute( 'aria-pressed', b.getAttribute( 'data-value' ) === String( value ) ? 'true' : 'false' );
			} );
		};
		var onPick = function ( box, field, done ) {
			var group = box.querySelector( '[data-pick="' + field + '"]' );
			group.addEventListener( 'click', function ( e ) {
				var b = e.target.closest( 'button' );
				if ( b ) {
					press( group, b.getAttribute( 'data-value' ) );
					done( b.getAttribute( 'data-value' ) );
				}
			} );
		};

		document.querySelectorAll( '[data-calc="price"]' ).forEach( function ( box ) {
			var st = { type: 'store', size: 'Small', count: 1, yearly: false };
			var result = box.querySelector( '.calc-result' );
			var fine = result.querySelector( '.calc-fine' ).outerHTML;
			var draw = function () {
				var t = typeOf( st.type );
				var monthly = t.from * sizeOf( st.size ).times;
				var list = st.yearly ? monthly * D.months : monthly;
				var percent = volume( st.count );
				var each = Math.round( list * ( 1 - percent / 100 ) * 100 ) / 100;
				var total = Math.round( each * st.count * 100 ) / 100;
				var saved = Math.round( ( list * st.count - total ) * 100 ) / 100;
				var next = nextTier( st.count );
				var per = st.yearly ? 'year' : 'month';
				var kind = t.short.toLowerCase();
				box.querySelector( '.calc-count' ).textContent = st.count;
				result.innerHTML = '<span class="eyebrow">your estimate</span>' +
					'<p class="calc-big">' + money( total ) + '<small> / ' + per + '</small></p>' +
					'<p class="calc-line">' + st.count + ' ' + kind + ' ' + ( st.count === 1 ? 'site' : 'sites' ) + ', ' + st.size + ', at ' + money( each ) + ' each' + ( percent > 0 ? ' (you save ' + percent + '%)' : '' ) + '</p>' +
					( saved > 0 ? '<p class="calc-save">You save ' + money( saved ) + ' every ' + per + '.</p>' : '' ) +
					( next ? '<p class="calc-next">' + ( next.sites - st.count ) + ' more ' + ( next.sites - st.count === 1 ? 'site' : 'sites' ) + ' and every site saves ' + next.percent + '%.</p>' : '' ) +
					'<a href="' + D.shop + '/item/' + t.shop + '-' + st.size.toLowerCase() + '/" class="btn btn-ink mt-5 w-full">Start with one ' + ( kind === 'website' ? kind : kind + ' site' ) + ' →</a>' + fine;
			};
			onPick( box, 'type', function ( v ) {
				st.type = v;
				draw();
			} );
			onPick( box, 'size', function ( v ) {
				st.size = v;
				draw();
			} );
			onPick( box, 'yearly', function ( v ) {
				st.yearly = v === '1';
				draw();
			} );
			box.querySelector( 'input[type=range]' ).addEventListener( 'input', function ( e ) {
				st.count = Number( e.target.value );
				draw();
			} );
		} );

		var SUGGESTED = { website: 49, bookings: 79, store: 99, community: 129, everything: 249 };
		document.querySelectorAll( '[data-calc="earnings"]' ).forEach( function ( box ) {
			var st = { account: box.getAttribute( 'data-account' ), type: 'website', size: 'Small', clients: 10, charge: SUGGESTED.website };
			var ranges = box.querySelectorAll( 'input[type=range]' );
			var outs = box.querySelectorAll( '.calc-count' );
			var suggested = function () {
				return SUGGESTED[ st.type ] + typeOf( st.type ).from * ( sizeOf( st.size ).times - 1 );
			};
			var figures = function ( account, list, price ) {
				var percent = account === 'reseller' ? D.wholesale : volume( st.clients );
				var cost = cents( ( list * ( 100 - percent ) ) / 100 );
				return { percent: percent, cost: cost, perSite: cents( price - cost ), month: cents( ( price - cost ) * st.clients ) };
			};
			var draw = function () {
				var t = typeOf( st.type );
				var times = sizeOf( st.size ).times;
				var list = t.from * times;
				var min = Math.ceil( list );
				var max = Math.max( min * 6, 300 * times );
				var price = Math.max( st.charge, min );
				var seller = figures( 'seller', list, price );
				var reseller = figures( 'reseller', list, price );
				var mine = st.account === 'seller' ? seller : reseller;
				var next = st.account === 'seller' ? nextTier( st.clients ) : null;
				box.querySelectorAll( '[data-pick="size"] button small' ).forEach( function ( small, i ) {
					small.textContent = money( t.from * D.sizes[ i ].times ) + ' / month list';
				} );
				outs[ 0 ].textContent = st.clients;
				ranges[ 1 ].min = min;
				ranges[ 1 ].max = max;
				ranges[ 1 ].value = price;
				outs[ 1 ].textContent = money( price );
				var ticks = ranges[ 1 ].parentNode.querySelectorAll( '.calc-ticks span' );
				ticks[ 0 ].textContent = money( min );
				ticks[ 1 ].textContent = money( max );
				var why = mine.percent === 0 ? money( list ) + ' list, no volume saving below ' + D.tiers[ 0 ].sites + ' sites' : money( list ) + ' list, less ' + mine.percent + '% ' + ( st.account === 'reseller' ? 'wholesale' : 'volume saving' );
				var row = function ( id, name, f ) {
					return '<tr' + ( st.account === id ? ' aria-current="true"' : '' ) + '><th scope="row">' + name + '</th><td>' + money( f.cost ) + '</td><td>' + money( f.month ) + '</td></tr>';
				};
				var result = box.querySelector( '.calc-result' );
				var fine = result.querySelector( '.calc-fine' ).outerHTML;
				result.innerHTML = '<span class="eyebrow">what you keep as a ' + st.account + '</span>' +
					'<p class="calc-big">' + money( mine.month ) + '<small> / month</small></p>' +
					'<p class="calc-line">' + money( mine.perSite ) + ' on each site, ' + money( cents( mine.month * 12 ) ) + ' a year.</p>' +
					'<dl class="calc-sum"><div><dt>' + st.clients + ' ' + ( st.clients === 1 ? 'client pays' : 'clients pay' ) + ' you ' + money( price ) + ' each</dt><dd>' + money( cents( price * st.clients ) ) + '</dd></div>' +
					'<div><dt>You pay AnyPress ' + money( mine.cost ) + ' a site<small class="calc-why">' + why + '</small></dt><dd>−' + money( cents( mine.cost * st.clients ) ) + '</dd></div>' +
					'<div class="total"><dt>You keep each month</dt><dd>' + money( mine.month ) + '</dd></div></dl>' +
					( next ? '<p class="calc-next">Reach ' + next.sites + ' sites and every site costs ' + next.percent + '% less.</p>' : '' ) +
					'<table class="calc-compare"><caption>Seller and reseller, at these numbers</caption><thead><tr><th scope="col"></th><th scope="col">You pay a site</th><th scope="col">You keep a month</th></tr></thead><tbody>' +
					row( 'seller', 'Seller', seller ) + row( 'reseller', 'Reseller', reseller ) + '</tbody></table>' + fine;
			};
			onPick( box, 'account', function ( v ) {
				st.account = v;
				draw();
			} );
			onPick( box, 'type', function ( v ) {
				st.type = v;
				st.charge = suggested();
				draw();
			} );
			onPick( box, 'size', function ( v ) {
				st.size = v;
				st.charge = suggested();
				draw();
			} );
			ranges[ 0 ].addEventListener( 'input', function ( e ) {
				st.clients = Number( e.target.value );
				draw();
			} );
			ranges[ 1 ].addEventListener( 'input', function ( e ) {
				st.charge = Number( e.target.value );
				draw();
			} );
		} );

		document.querySelectorAll( '[data-calc="course"]' ).forEach( function ( box ) {
			var community = typeOf( 'community' );
			var dds = box.querySelectorAll( 'dd' );
			box.addEventListener( 'input', function () {
				var v = function ( f ) {
					return Math.max( 0, Number( box.querySelector( '[data-field="' + f + '"]' ).value ) || 0 );
				};
				var platform = 12 * ( v( 'fee' ) + ( v( 'sales' ) * v( 'share' ) ) / 100 );
				var ours = 12 * community.from;
				dds[ 0 ].textContent = money( platform );
				dds[ 1 ].textContent = money( ours );
				dds[ 2 ].textContent = money( platform - ours );
			} );
		} );
	}
	// Sign-up forms and the seller application: anypress.io's own form, sent to the Fluent Forms form with the same
	// fields (data-anypress-form is its id), and the same thank-you the site showed.
	var esc = function ( t ) {
		var d = document.createElement( 'div' );
		d.textContent = t;
		return d.innerHTML;
	};
	document.querySelectorAll( 'form[data-anypress-form]' ).forEach( function ( form ) {
		var cfg = window.anypressIo || {};
		var id = form.getAttribute( 'data-anypress-form' );
		var application = !! form.querySelector( '[name="business"]' );
		var campaign = form.querySelector( '[name="campaign"]' );
		if ( campaign ) {
			campaign.value = ( new URLSearchParams( location.search ).get( 'utm_campaign' ) || '' ).slice( 0, 100 );
		}

		if ( application ) {
			// "Not sure yet" and "None of these" stand for every box; the storefront address only for a new storefront.
			[ [ 'site_types', 'not-sure' ], [ 'audiences', 'none' ] ].forEach( function ( pair ) {
				var all = form.querySelector( '[name="' + pair[ 0 ] + '"][value="' + pair[ 1 ] + '"]' );
				all.addEventListener( 'change', function () {
					form.querySelectorAll( '[name="' + pair[ 0 ] + '"]' ).forEach( function ( box ) {
						if ( box !== all ) {
							box.disabled = all.checked;
						}
					} );
				} );
			} );
			var input = form.querySelector( '[name="website"]' ).className;
			var siteSet = form.querySelector( '[name="has_site"]' ).closest( 'fieldset' );
			var hlSet = form.querySelector( '[name="highlevel"]' ).closest( 'fieldset' );
			var sub = document.createElement( 'label' );
			sub.className = 'mt-4 block font-medium';
			sub.innerHTML = 'Your storefront&#x27;s address <span class="font-normal text-muted">(optional)</span><span class="mt-1 flex items-center gap-2"><input name="subdomain" maxLength="63" pattern="[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?" title="Letters, digits and dashes" placeholder="yourbusiness" class="' + input + ' mt-0 max-w-xs"/><span class="text-muted">.anypress.site</span></span><span class="mt-1 block font-normal text-muted">A free, ready-to-sell storefront, included with your account. You can use your own domain later.</span>';
			var hl = document.createElement( 'p' );
			hl.className = 'mt-2 text-muted';
			hl.textContent = 'Your sub-accounts can make and manage websites from HighLevel workflows with the AnyPress app. We\'ll set you up for it.';
			siteSet.addEventListener( 'change', function () {
				var no = form.querySelector( '[name="has_site"][value="no"]' ).checked;
				if ( no && ! sub.parentNode ) {
					siteSet.appendChild( sub );
				} else if ( ! no && sub.parentNode ) {
					sub.remove();
				}
			} );
			hlSet.addEventListener( 'change', function () {
				var yes = form.querySelector( '[name="highlevel"][value="yes"]' ).checked;
				if ( yes && ! hl.parentNode ) {
					hlSet.appendChild( hl );
				} else if ( ! yes && hl.parentNode ) {
					hl.remove();
				}
			} );
		}

		form.addEventListener( 'submit', function ( e ) {
			e.preventDefault();
			var button = form.querySelector( 'button[type="submit"]' );
			var label = button.textContent;
			var old = form.querySelector( '[role="alert"]' );
			if ( old ) {
				old.remove();
			}
			// Bots fill in the hidden phone field; they get the thank-you and nothing is sent.
			var trap = form.querySelector( '[name="company_phone"]' );
			var fields = new URLSearchParams();
			new FormData( form ).forEach( function ( value, name ) {
				if ( name !== 'company_phone' ) {
					var box = form.querySelector( '[name="' + name + '"][type="checkbox"]' );
					fields.append( box ? name + '[]' : name, value );
				}
			} );
			fields.append( 'anypress_lead', '1' );
			if ( application ) {
				fields.append( 'anypress_application', '1' );
				fields.append( 'interest', 'Seller' );
			}
			fields.append( '__fluent_form_embded_post_id', cfg.post || '' );
			fields.append( '_fluentform_' + id + '_fluentformnonce', cfg.nonce || '' );
			var email = form.querySelector( '[name="email"]' ).value;
			var thanks = function () {
				var box = document.createElement( 'div' );
				box.className = 'mt-4';
				box.setAttribute( 'role', 'status' );
				if ( application ) {
					box.innerHTML = '<p class="font-medium">Thanks, we got your application.</p><p class="mt-2 text-sm text-muted">Next, book a short call with us. We get you set up and agree how billing works, then approve your account and email you a link to sign in. We&#x27;ve also sent this link to ' + esc( email ) + '.</p><a href="' + cfg.call + '" class="btn btn-ink mt-4 inline-flex">Book your call</a>';
				} else {
					var beta = !! form.querySelector( '[name="beta"]' );
					box.innerHTML = '<p class="font-semibold">' + ( beta ? 'Thanks, you&#x27;re on the beta list.' : 'Thanks, you&#x27;re on the list.' ) + '</p><p class="mt-2 text-ink-soft">Check your inbox for one email from us and click the button in it to confirm. ' + ( beta ? 'We&#x27;ll email your invite when your place is ready, usually within a few days.' : 'Then we&#x27;ll send what you asked for.' ) + '</p>';
				}
				form.replaceWith( box );
			};
			if ( trap && trap.value ) {
				thanks();
				return;
			}
			button.disabled = true;
			button.textContent = 'Sending…';
			var body = new URLSearchParams( { action: 'fluentform_submit', form_id: id, data: fields.toString() } );
			fetch( cfg.ajax, { method: 'POST', body: body, credentials: 'same-origin' } )
				.then( function ( r ) {
					return r.json().then( function ( json ) {
						return { ok: r.ok, json: json };
					} );
				} )
				.then( function ( res ) {
					if ( res.ok && res.json && res.json.success !== false ) {
						thanks();
						return;
					}
					var errors = ( res.json && ( res.json.errors || ( res.json.data && res.json.data.errors ) ) ) || {};
					var first = '';
					Object.keys( errors ).some( function ( k ) {
						var v = errors[ k ];
						first = typeof v === 'string' ? v : v[ Object.keys( v )[ 0 ] ];
						return !! first;
					} );
					throw new Error( first || ( res.json && res.json.message ) || '' );
				} )
				.catch( function ( err ) {
					button.disabled = false;
					button.textContent = label;
					var p = document.createElement( 'p' );
					p.className = 'mb-3 text-sm text-red-700';
					p.setAttribute( 'role', 'alert' );
					p.textContent = ( err && err.message ) || 'Something went wrong. Please try again, or email support@anypress.io.';
					button.parentNode.insertBefore( p, button );
				} );
		} );
	} );
	// The storefront diagram starts once it's on screen.
	document.querySelectorAll( 'figure.sys' ).forEach( function ( el ) {
		if ( ! ( 'IntersectionObserver' in window ) ) {
			el.classList.add( 'on' );
			return;
		}
		var io = new IntersectionObserver(
			function ( entries ) {
				if ( entries[ 0 ].isIntersecting ) {
					el.classList.add( 'on' );
					io.disconnect();
				}
			},
			{ rootMargin: '0px 0px -15% 0px' }
		);
		io.observe( el );
	} );

	// Copy buttons: a value to paste elsewhere, and the n8n workflows.
	var copyText = function ( text, button, done, back, failed ) {
		navigator.clipboard.writeText( text ).then(
			function () {
				button.textContent = done;
				setTimeout( function () {
					button.textContent = back;
				}, 3000 );
			},
			function () {
				if ( failed ) {
					button.textContent = failed;
					setTimeout( function () {
						button.textContent = back;
					}, 4000 );
				}
			}
		);
	};
	document.querySelectorAll( '.copyfield' ).forEach( function ( box ) {
		var input = box.querySelector( 'input' );
		input.addEventListener( 'focus', function () {
			input.select();
		} );
		box.querySelector( 'button' ).addEventListener( 'click', function ( e ) {
			copyText( input.value, e.currentTarget, 'Copied', 'Copy' );
		} );
	} );

	// Templates: the tool tabs, and Copy workflow next to each workflow's Download.
	document.querySelectorAll( '.tpl-tabs' ).forEach( function ( tabs ) {
		var list = tabs.nextElementSibling;
		var toolOf = function ( li ) {
			var logo = li.querySelector( '.aflow-pair img' );
			var src = logo ? logo.getAttribute( 'src' ) : '';
			return [ 'n8n', 'Make', 'Zapier', 'HighLevel' ].filter( function ( t ) {
				return src.indexOf( '/' + t.toLowerCase() + '-logo' ) !== -1;
			} )[ 0 ];
		};
		tabs.addEventListener( 'click', function ( e ) {
			var tab = e.target.closest( 'button' );
			if ( ! tab ) {
				return;
			}
			var pick = tab.textContent.trim();
			tabs.querySelectorAll( 'button' ).forEach( function ( b ) {
				b.setAttribute( 'aria-selected', b === tab ? 'true' : 'false' );
				b.className = b === tab ? 'on' : '';
			} );
			list.querySelectorAll( ':scope > li' ).forEach( function ( li ) {
				li.hidden = pick !== 'All' && toolOf( li ) !== pick;
			} );
		} );
	} );
	document.querySelectorAll( '.tpl-actions' ).forEach( function ( actions ) {
		var download = actions.querySelector( 'a[download].btn-paper' );
		var button = actions.querySelector( 'button.btn-ink' );
		if ( download && button ) {
			button.addEventListener( 'click', function () {
				fetch( download.href )
					.then( function ( r ) {
						return r.text();
					} )
					.then( function ( text ) {
						copyText( text, button, 'Copied. Paste it in n8n', 'Copy workflow', 'Couldn\'t copy. Use Download' );
					} )
					.catch( function () {
						button.textContent = 'Couldn\'t copy. Use Download';
					} );
			} );
		}
	} );

	// The changelog: the site-type filter, and a link to one change opening the fold it sits in.
	document.querySelectorAll( '[aria-label="Show changes for"]' ).forEach( function ( group ) {
		var on = 'border-ink bg-ink text-paper';
		var off = 'border-line bg-paper hover:border-ink';
		var shows = function ( item, label ) {
			if ( label === 'All sites' ) {
				return true;
			}
			var tags = Array.prototype.map.call( item.querySelectorAll( ':scope > p:last-of-type > span' ), function ( s ) {
				return s.textContent.trim();
			} );
			return tags.indexOf( 'Every site' ) !== -1 || tags.indexOf( label ) !== -1;
		};
		group.addEventListener( 'click', function ( e ) {
			var b = e.target.closest( 'button' );
			if ( ! b ) {
				return;
			}
			var label = b.textContent.trim();
			group.querySelectorAll( 'button' ).forEach( function ( x ) {
				x.setAttribute( 'aria-pressed', x === b ? 'true' : 'false' );
				x.className = x.className.replace( x === b ? off : on, x === b ? on : off );
			} );
			document.querySelectorAll( 'section[aria-label] > ol > li' ).forEach( function ( dayItem ) {
				var any = false;
				dayItem.querySelectorAll( 'article' ).forEach( function ( a ) {
					a.hidden = ! shows( a, label );
					any = any || ! a.hidden;
				} );
				dayItem.querySelectorAll( 'details' ).forEach( function ( d ) {
					var n = 0;
					d.querySelectorAll( 'li' ).forEach( function ( li ) {
						li.hidden = ! shows( li, label );
						n += li.hidden ? 0 : 1;
					} );
					d.hidden = n === 0;
					d.querySelector( 'summary' ).firstChild.textContent = n === 1 ? '1 smaller improvement' : n + ' smaller improvements';
					any = any || n > 0;
				} );
				dayItem.hidden = ! any;
			} );
			document.querySelectorAll( 'section[aria-label] > ol' ).forEach( function ( ol ) {
				ol.parentNode.hidden = ! ol.querySelector( ':scope > li:not([hidden])' );
			} );
		} );
		var open = function () {
			var hit = location.hash.length > 1 && document.getElementById( location.hash.slice( 1 ) );
			var fold = hit && hit.closest( 'details' );
			if ( fold ) {
				fold.open = true;
			}
		};
		open();
		window.addEventListener( 'hashchange', open );
	} );
	document.querySelectorAll( 'a[aria-label^="Link to "][href^="#"]' ).forEach( function ( a ) {
		a.addEventListener( 'click', function () {
			if ( navigator.clipboard ) {
				navigator.clipboard.writeText( location.origin + location.pathname + a.getAttribute( 'href' ) ).then( function () {
					a.textContent = 'Link copied';
					setTimeout( function () {
						a.textContent = '#';
					}, 1500 );
				}, function () {} );
			}
		} );
	} );
}() );

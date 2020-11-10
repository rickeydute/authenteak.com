import svgIcon from './svgIcon'
import HeaderFlyout from './HeaderFlyout';

export default class Header {
	constructor(el) {
		this.$el = $(el);
		this.$body = $('body');
		this.$wrapper = $('.site-wrapper');
		this.$searchWrap = $('.search-wrap');
		this.$header = $('.site-header');

		this.$topBar = this.$header.find('.top-bar');
		this.$navBar = this.$header.find('.main-nav-bar');

		this.cartOpenClass = 'mini-cart-open';
		this.searchOpenClass = 'search-open';
		this.navOpenClass = 'nav-mobile-open scroll-locked';

		this.$loginRegister = $('.login-register-block');
		this.$forgotPassword = $('.forgot-password-block');

		this.promoBanner = document.getElementById('topHeaderPromo');

		this.headerFlyout = new HeaderFlyout();

		this._bindEvents();
		this._adjustHeights();

		
		this._headerScroll();
		
		this.notPDPCollections = !document.getElementById("buildAndBuyRoot") || !document.getElementById("clickAndBuyRoot");
		
		this._headerPromoBanner();
	}



	// sets the header promo banner on the page when marketing_content JSON has a value
	async _headerPromoBanner() {
		var headerMarketing = await this.headerFlyout.getHeaderMarketingData(),
			promoLink = document.createElement("a");

			
		if( !this.promoBanner ){ return; }
		
		if(window.sessionStorage.getItem("TEAK__dismissPromoBanner")){
			let isDismissed = window.sessionStorage.getItem("TEAK__dismissPromoBanner");
			this.promoBanner.style.display = isDismissed ? "none" : "flex";
			return;
		}

		if( typeof headerMarketing === "undefined" || Object.keys(headerMarketing).length === 0 ){ return; }

		if ( headerMarketing.hasOwnProperty("banner") ) {
			let promo = headerMarketing.banner;

			if( promo.header_promo_link !== ""){
				promoLink.setAttribute("href", promo.header_promo_link);
			}
			
			promoLink.setAttribute("class", "promoBanner__link " + ( promo.hasOwnProperty("header_custom_class") ? promo.header_custom_class : "" ) );
			promoLink.innerHTML = promo.header_promo;

			this.promoBanner.classList.add("promoBanner--" + promo.header_promo_color);
			this.promoBanner.appendChild(promoLink);
			this.promoBanner.style.display = promo.isVisable ? "flex" : "none";
		}
		
		if( headerMarketing.hasOwnProperty("inline") ){
			let promoNode = document.createElement("span"),				
				promoText = headerMarketing.inline.header_promo;

			promoNode.innerHTML = promoText;
			document.getElementById('globalHeaderPromo').appendChild(promoNode);
		}
	}


	_dismissHeaderPromoBanner(e){
		window.sessionStorage.setItem("TEAK__dismissPromoBanner", true);
		this.promoBanner.style.display = "none";

		e.preventDefault();
	}




	_bindEvents() {
		// Toggle mini cart panel
		this.$el.find('.button-cart-toggle').on('click', (event) => {
			this._toggleMiniCart();
			event.preventDefault();
		});

		// Close mini cart panel
		$('.button-cart-close').on('click', () => {
			this._toggleMiniCart(false);
		});

		$('.on-canvas').on('click', () => {
			if ($('.mini-cart-open').length) {
				this._toggleMiniCart(false);
			}
		});


		// Close UI elements with esc key
		$(document)
			.on('keyup', (e) => {
				// Mini cart
				if (e.keyCode === 27 && this.$body.hasClass(this.cartOpenClass)) {
					this._toggleMiniCart(false);
				}

				// Search
				if (e.keyCode === 27 && this.$searchWrap.hasClass(this.searchOpenClass)) {
					this._toggleSearch(false);
				}
			})
			.on("click", ".promoBanner__closeBtn", (e) => {
				this._dismissHeaderPromoBanner(e);
			});



		// Toggle search
		$('.button-search-toggle').on('click', () => {
			this._toggleSearch();

			// Close cart
			if (this.$wrapper.hasClass(this.cartOpenClass)) {
				this._toggleMiniCart(false);
			}
		});

		// Close Search
		$('.button-search-close').on('click', () => {
			this._toggleSearch(false);
		});

		// Toggle mobile nav
		$('.button-mobile-nav-toggle').on('click', () => {
			this._toggleMobileNav();
		});

		// Handle resize events and provide debounce to prevent too much
		this._handleResize = _.debounce(this._handleResize.bind(this), 200);

		$(window).resize(this._handleResize);
	}



	_handleResize() {
		// Reset the mobile panel if window is made larger
		this._adjustHeights();

		// Check header height on resize for class application
		this._headerScroll();
	}

	_toggleMiniCart(open) {
		// Pass "false" to remove the class / close cart
		this.$body.toggleClass(this.cartOpenClass, open);
	}

	_toggleSearch(open) {
		this.$searchWrap.toggleClass(this.searchOpenClass, open);

		if (this.$searchWrap.hasClass(this.searchOpenClass)) {
			this.$searchWrap.find('.search-input').focus();
		}
	}

	_toggleMobileNav(open) {
		this.$body.toggleClass(this.navOpenClass, open);

		if (open === false) {
			$('.navigation-mobile').revealer('hide');
		} else {
			$('.navigation-mobile').revealer('toggle');
		}
	}

	_headerScroll() {
		// determine whether the navigtion has a second row, and disallow "compressed" state if true
		const defaultNavbarHeight = 56;
		const $currentNavBar = this.$navBar.find('.navigation').find('ul:first-child');
		var currentNavBarHeight = $currentNavBar.outerHeight();

		if (currentNavBarHeight > defaultNavbarHeight) {
			this.$navBar.addClass('multi-row');
			$currentNavBar.addClass('enforce-max-width');
			return false;
		} else {
			this.$navBar.removeClass('multi-row');
			$currentNavBar.removeClass('enforce-max-width');
		}

		const $win = $(window);
		const threshold = 50;
		const scrollClass = 'compressed';

		// if we load the page part way down
		if ($win.scrollTop() > threshold) {
			this.$header.addClass(scrollClass);
		}

		$win.on("resize", () => {
			if( this.notPDPCollections ){
				const compressHeader = false;
				currentNavBarHeight = $currentNavBar.outerHeight();

				if (currentNavBarHeight > defaultNavbarHeight) {
					this.$header.toggleClass(scrollClass, compressHeader);
				}
			}
		});


		if( !this.notPDPCollections ){
			this.$header.css({"position": "static", "box-shadow": "none"});
			this.$header.siblings(".site-canvas").css("marginTop", 0);
		}


		$win.on("scroll", () => {
			if( this.notPDPCollections ){
				const st = $win.scrollTop();
				var compressHeader = (st > threshold) ? true : false;

				currentNavBarHeight = $currentNavBar.outerHeight();
				compressHeader = currentNavBarHeight > defaultNavbarHeight ? false : compressHeader;

				this.$header.toggleClass(scrollClass, compressHeader);
			}
		});
	}

	_adjustHeights() {
		const $canvas = this.$body.find('.site-canvas');
		const defaultTopBarHeight = window.TEAK.Utils.isHandheld ? 150 : 90;
		const topBarHeight = this.$topBar.outerHeight();
		const defaultFullHeaderHeight = 170;
		const currentFullHeaderHeight = this.$header.outerHeight();

		if (this.$navBar.is(':hidden')) {
			if (topBarHeight > defaultTopBarHeight) {
				$canvas.css('padding-top', topBarHeight + 'px');
			} else {
				$canvas.css('padding-top', defaultTopBarHeight + 'px');
			}
		} else {
			if (currentFullHeaderHeight > defaultFullHeaderHeight) {
				$canvas.css('padding-top', currentFullHeaderHeight + 'px');
			} else {
				$canvas.css('padding-top', defaultFullHeaderHeight + 'px');
			}
		}

		if (topBarHeight > defaultTopBarHeight) {
			const $mobileNav = this.$body.find('.navigation-mobile');

			$mobileNav.css({ 'top': topBarHeight + 'px' });
		}
	}
}
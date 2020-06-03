import PageManager from '../PageManager';
import Alert from './components/Alert';
import ProductUtils from './product/ProductUtils';
import ProductImages from './product/ProductImages';
import ProductReviews from './product/ProductReviews';
import ColorSwatch from './product/ColorSwatch';
import productViewTemplates from './product/productViewTemplates';
import variationImgPreview from './product/variationImgPreview';
import Tabs from 'bc-tabs';
import fitVids from 'fitvids';
import ScrollLink from 'bc-scroll-link';
import Personalization from './Personalization';
import TabsModule from './product/TabsModule';
import ProductOptions from './product/customizations/ProductOptions';
import AddToCartModal from './product/customizations/AddToCartModal';
import PrintMode from './product/customizations/PrintMode';
import ProductSwatchModal from './product/ProductSwatchModal';
import LazyLoad from 'vanilla-lazyload';
import Yotpo from './thirdparty/Yotpo'

export default class Product extends PageManager {
	constructor() {
		super();

		this.productId = $("#productDetails").data("productId");

		this.el = '[data-product-container]';
		this.$el = $(this.el);
		this.productImgs = '.product-slides-wrap';

		this.tabObj = {};

		this.fitVidsInitialized = false;

		this.lazyLoadInstance = new LazyLoad({
			elements_selector: ".swatch-color, .swatch-pattern-image, .swatchModal__swatchImg"
		});

		new Alert($('[data-alerts]'));

		new ScrollLink({
			selector: '.accordion-title a',
			offset: -117
		});

		new ScrollLink({
			selector: '.reviews-jumplink'
		});

		// Product Images
		new ProductImages(this.productImgs);

		// Product Swatches
		this.swatches = new ColorSwatch(); // Init our color swatches

		// Reviews
		new ProductReviews(this.context);


		// Custom Options
		new ProductOptions();

		// Custom Cart Modal
		new AddToCartModal();


		if( document.getElementById("productInfo") ){
			try{
				this.productInfo = JSON.parse(document.getElementById("productInfo").innerHTML);
			}catch(err){}
		}

		this.yotpo = new Yotpo({
			product: this.productInfo,
			productId: this.productId,
			isProductPage: true,
			dialog: $("#productModal")
		});

		// add product swatch modal
		new ProductSwatchModal(this.productInfo);


		if(document.getElementById("relatedProductIDs")){
			// Recommened Products Yotpo Update
			this.recommended = new Personalization({
				type: "recommended"
			});
			this.initRecommendedProducts({
				// our recommended product id array built in pages > product.html
				productIdArray: JSON.parse( document.getElementById("relatedProductIDs").innerHTML )
			});
			this.recommendedProducts = [];
		}

		// Recently Viewed Module
		this.recentlyViewed = new Personalization({
			type: "recentlyViewed"
		});
		this._initRecentlyViewed();

		// get this product's updtaed reviews from yotpo
		this._getReviews();

		// Product UI
		this._bindEvents();
		
		// init custom PDP tabs
		this.pdpTabs = new TabsModule({
			id: "descTab",
			dataClass: ".tmp-prod-details",
			contentClass: ".descContent"
		});

		this._initTabs();

		this.initAnalytics();

		// Print Mode (Tear Sheet)
		new PrintMode();
	}


	
	loaded(next) {
		// Product Utils
		this.ProductUtils = new ProductUtils(this.el, {
			priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
			priceWithTaxTemplate: productViewTemplates.priceWithTax,
			priceSavedTemplate: productViewTemplates.priceSaved,
			variationPreviewImageTemplate: productViewTemplates.variationPreviewImage,
			callbacks: {
				switchImage: variationImgPreview
			}
		}).init(this.context);

		next();
	}



	_bindEvents() {
		
		// Activate the reviews tab when we jump down to it
		$('.product-reviews-link').on('click', () => {
			this.tabs.displayTabContent('#product-reviews');
			$('.accordion-title').removeClass('is-open');
			$('[href="#product-reviews"]').parent('.accordion-title').addClass('is-open');
		});

		// Show all the reviews
		$('.reviews-show-more-link').on('click', (event) => {
			event.preventDefault();

			$('.review-item.hidden').each((index, el) => {
				setTimeout(() => {
					$(el).revealer('show');
				}, index * 250);
			});

			$(event.currentTarget).hide();
		});

		$('.accordion-title').on('click', (event) => {
			event.preventDefault();
			this._accordionTabToggle(event);
		});

		$(document.body)
			.on("click", "[product-dialog-close]", (e) => { this.closeDialog(e); })
			.on("click", "[product-dialog-open]", (e) => { this.openDialog(e) });

	}


	initAnalytics(){
		TEAK.ThirdParty.heap.init({
			method: 'track',
			event: 'pdp_view',
			location: 'pdp'
		});
	}


	openDialog(e){
		let thisDialog = $(e.currentTarget).attr("rel"), tpl;

		switch(thisDialog){
			case "writeReview":
				tpl = this.yotpo.buildReviewsModal();
				break;
			
			case "askQuestion":
				tpl = this.yotpo.buildQuestionModal();
				break;
		}

		$("#productModal")
			.removeClass("hide")
			.find(".product__modalDialog").removeClass("product__modalDialog--success")
				.end()
			.find(".product__modalDialogCntr").html(tpl);

		$(document.body).addClass("product__freezeBody");

		e.preventDefault();
	}


	closeDialog(e){
		let $this = $(e.currentTarget);
		$this.parents(".product__modal").addClass("hide");
		$(document.body).removeClass("product__freezeBody");
	}



	/**
	 * Build Recommended Products
	 * @param {Array} args.productIdArray arry of recomened product ids 
	 */

	initRecommendedProducts(args){
		this.recommended.makeRecommProductQuery(args.productIdArray)
			.then(data => {
				this.recommendedProducts = this.recommended.normalizeQLResponse(data);
			})
			.then(() => {
				this.getProductRaiting(args.productIdArray);
			})
			.then(() => {
				this.buildRecommendationSlider();

				this.recommended.initProductSlider({
					dotObj: {appendDots: '.product-carousel', infinite: false},
					selector: '.product-carousel',
					context: "#recommendedProducts"
				});
			});
	}





	/**
	 * Yotpo: Fetch Bulk Ratings
	 * @param {Array} productIdArray arry of product ids 
	 */

	getProductRaiting(productIdArray){
		try{
			// get our bulk yotpo rating for recomm products on page
			this.yotpo.fetchBulk(productIdArray)
				.then((data) => {
					this.appendRating(data, productIdArray);
				});

		}catch(err){}
	}



	/**
	 * Bind the fetched yotpo rating field to the corresponding product
	 * @param {Array} dataArray - Data Array of Objects fetched from yotpo
	 * @param {Array} productIdArray - array of product ids
	 */

	appendRating(dataArray, productIdArray){
		for (let i = 0; i < productIdArray.length; i++) {
			Object.assign(this.recommendedProducts[i], {
				total_review: dataArray[i].result.total,
				rating: dataArray[i].result.average_score
			});
		}	
	}




	buildRecommendationSlider(){
		let $recomm = $("#recommendedProducts");

		this.recommendedProducts.forEach((element) => {
			let tpl = this.recommended.buildPersonalizationSlider(element);
			$(tpl).appendTo(".product-carousel", $recomm);
		});

		$recomm.toggleClass("hide");
	}






	_initRecentlyViewed(){
		let $rv = $("#recentlyViewedProducts"),
			recentProducts = this.recentlyViewed.savedProducts;

		if(recentProducts){ 
			recentProducts.forEach((element) => {
				let tpl = this.recentlyViewed.buildPersonalizationSlider(element);
				$(tpl).appendTo(".product-rv-carousel", $rv);
			});

			$rv.addClass("show");
		}

		this.saveViewedProduct();

		this.recentlyViewed.initProductSlider({
			dotObj: {appendDots: '.product-rv-carousel'},
			selector: '.product-rv-carousel',
			context: '#recentlyViewedProducts'
		});
		
	}

	



	// saved this viewed product - include the yotpo rating
	saveViewedProduct(){
		try{			
			this.yotpo.getProductReviews(this.productId)
				.done((dataObj) => {
					let totalScore = dataObj.response.bottomline.average_score;

					totalScore = (totalScore === 0) ? 0 : totalScore.toFixed(1);

					this.productInfo["rating"] = totalScore;
					this.productInfo["total_review"] = dataObj.response.bottomline.total_review;

					this.recentlyViewed.saveViewed(this.productInfo);
				});

		}catch(err){
			console.log(err)
		}
	}




	// build our dynamic schema data
	buildProductSchema(data){
		let script = document.createElement('script');
		let schemaJSON =document.getElementById('schema-product');
		let schema = schemaJSON.innerHTML;
	  
		script.type = 'application/ld+json';
		script.text = JSON.stringify(schema);
		  
		document.querySelector('body').appendChild(script);
		script.parentElement.removeChild(schemaJSON);
	}




	// get and display bespoke yotpo product reviews
	_getReviews(){
		let $ratingCntr = $("#yotpoRating");

		$.when( 
			this.yotpo.getProductReviews(this.productId),
			this.yotpo.getProductQuestions(this.productId)
			
		).then((reviewData, questionData) => {
			this.questionData = questionData[0].response;
			this.reviewData = reviewData[0].response;

			let totalScore = this.reviewData.bottomline.average_score,
				totalReviews = this.reviewData.bottomline.total_review,
				totalQuestions = this.questionData.total_questions;

			totalScore = totalScore === 0 ? 0 : totalScore.toFixed(1);
			
			this.showRaiting($ratingCntr, totalScore, totalQuestions, totalReviews);

			this.buildCustQuestions();
			this.buildCustReviews();
		});

		
	}


	showRaiting($ratingCntr, totalScore, totalQuestions, totalReviews){
		if(totalScore !== 0){
			$ratingCntr.removeClass("hide");
		}else{
			return;
		}

		$ratingCntr
			.find(".yotpo-stars-rating")
				.css({"--rating": totalScore})
				.attr("aria-label", `Rating of ${totalScore} out of 5.`)
					.end()
			.find(".yotpo-reviews-num").text(totalReviews)
				.end()
			.find(".yotpo-questions-num").text(totalQuestions)
				.end()
			.find(".yotpo-questions-text").text(totalQuestions > 1 ? 'Questions' : (totalQuestions === 1 ? 'Question' : (totalQuestions === 0 ? 'Question' : 'Questions') ) )
	}




	buildCustQuestions(){
		let hasQuestions = this.questionData.total_questions > 0;

		$("#noQuestions").toggleClass("hide", hasQuestions);
		$("#questionsTitleBtn").toggleClass("hide", !hasQuestions);
		
		this.questionData.questions.forEach((element) => {
			let tpl = this.yotpo.buildProductQuestions(element);
			$(tpl).appendTo("#productQuestions");
		});
		
		// console.log(this.questionData)		
	}



	buildCustReviews(){
		let hasReviews = this.reviewData.bottomline.total_review > 0;

		$("#noReviews").toggleClass("hide", hasReviews);

		if( hasReviews ){
			let tpl = this.yotpo.buildProductReviews(this.reviewData);
			$(tpl).appendTo("#ratingsBlock");
		}
		
		// console.log(this.reviewData);
	}



	_initTabs() {
		this.tabs = new Tabs({
			afterSetup: (tabId) => {
				this._initVids(tabId);
				$('.tab-content-panel.active').prev('.accordion-title').addClass('is-open');
			},
			afterChange: (tabId) => {
				this._initVids(tabId);
			}
		});
	}



	// Add accordion style buttons to toggle tab panels
	_accordionTabToggle(event) {
		const tab = $(event.currentTarget).find('a').attr('href');
		$(event.currentTarget).addClass('is-open').siblings('.accordion-title').removeClass('is-open');
		this.tabs.displayTabContent(tab);
	}



	// if page loads with tabs hidden, we need to wait until the proper tab is clicked before running fitVids.
	_initVids(tabId) {
		if (tabId == '#product-videos' && !this.fitVidsInitialized) {
			fitVids('.product-videos-list');
			this.fitVidsInitialized = true;
		}
	}


	


}





TEAK.Modules.leadTime = {
	setTip: function(element, isInline){
		let tpl = [
			'<a href="" class="shpping-range--tipLink" data-tool-tip-open data-tool-tip-type="element" data-tool-tip-name="next_bussiness_day" data-tool-tip-id="next_bussiness_day">',
				'<span class="toolTip__iconCntr toolTip__iconCntr--dark">',
					'<svg class="toolTip__icon toolTip__icon--white" enable-background="new 0 0 20 20" version="1.1" viewBox="0 0 20 20" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">',
						'<title>tool tip</title>',
					'<path d="M12.432 0c1.34 0 2.010 0.912 2.010 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-0.75-1.974-1.99 0-1.043 0.881-2.479 2.643-2.479zM8.309 20c-1.058 0-1.833-0.652-1.093-3.524l1.214-5.092c0.211-0.814 0.246-1.141 0-1.141-0.317 0-1.689 0.562-2.502 1.117l-0.528-0.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273 0.705 3.23l-1.391 5.352c-0.246 0.945-0.141 1.271 0.106 1.271 0.317 0 1.357-0.392 2.379-1.207l0.6 0.814c-2.502 2.547-5.235 3.527-6.291 3.527z"></path>',
					'</svg>',
				'</span>',
			'</a>',
			'<span class="toolTip__cntr toolTip__cntr--hide" id="next_bussiness_day"></span>'].join("");

		return isInline ? tpl : document.getElementById(element).innerHTML = tpl;
	}
}










/**
 * Tool Tips
 * Auto runs for every product page
 * keep this in product.js so we can babel compile the es6 code
 * ---------------------------------------
 * 
 * Data: 
 * 	Stored in product.json or in the script manager
 * 
 * Basic HTML:
 *  <div class="toolTip__cntr toolTip__cntr--hide" id="<TRIGGER ID>"></div>
 * 
 * Basic Tip
 * Link rel=""	genericly associated key and ID to open a tip
 * 
 * Trigers: 
 * 	Open tip: 	data-tool-tip-open
 * 	Close tip: 	data-tool-tip-cose
 * 
 * Custom Tip Settings: Use these to fine tune a tip
 * Type:		data-tool-tip-type="" 	// element or brand
 * Name:		data-tool-tip-name=""	// Key in the Product JSON object to pull from. can be comma sepearted to pull multipule
 * Id:			data-tool-tip-id=""		// Targets the element ID to open and close
 * 
 * 	
 * Adding Tabs to Tool Tips
 * -----------------------------------
 * HTML Markup:
 * 
	<div class="toolTip__cntr toolTip__cntr--withTabs toolTip__cntr--hide" id="<TRIGGER ID>">
		<div class="toolTip__tabsCntr">
			// Call to to get the tabs.  Pass in in tab array TEAK.Modules.toolTip.getTabs(ARRAY)
		</div>
	</div>
 * 
 *
 * Tab Object Array
 * 
 * [
		{
			id: "free_white_glove_delivery",	// key in Product JSON
			label: "White Glove Delivery"		// Custom Label. can include lite HTML
		},
		....
	]
 * 
 *	Pass this array in to TEAK.Modules.toolTip.getTabs(ARRAY)
 * 	to get custom tabs
 * 
 */

TEAK.Modules.toolTip = {
	data: TEAK.Utils.getProductJSON(),
	optionKeys: [],
	brandObj: {},
	elementObj: {},
	activeModal: "",

	closeBtn: 	`<button class="toolTip__closeBtn" data-tool-tip-close>
					<svg class="toolTip__closeIcon" enable-background="new 0 0 24 24" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.4 12l5.3-5.3c0.4-0.4 0.4-1 0-1.4s-1-0.4-1.4 0l-5.3 5.3-5.3-5.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4l5.3 5.3-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3l5.3-5.3 5.3 5.3c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4l-5.3-5.3z"></path>
					</svg>
				</button>`,

	getTabs: function(tabArr){
		return `<div class="toolTip__tabsCntr">
			${Object.keys(tabArr).map(key => {
				return `<div class="toolTip__tab">
							<input type="radio" class="toolTip__tabControl" id="toolTipTab_${key}" name="toolTipTabs" ${key === '0' ? 'checked' : '' }>
							<label for="toolTipTab_${key}" class="toolTip__tabLabel">${tabArr[key].label}</label>
							<div class="toolTip__tabContent" id="${tabArr[key].id}">${tabArr[key].tabContent.join("")}</div>
						</div>`}).join("")}
				</div>`;
	},
	
	
	init: function (arg) {
		if( !this.data ){ return; }

		this.key = arg.key;
		this.id = arg.id;

		switch(arg.type){
			case "brand": this.brandTip();
				break;
			case "element": this.elementTip();
				break;
		}
		
		return this;
	},



	brandTip: function(){
		if( !this.data["tool-tips"].brands.hasOwnProperty(this.key) ){ return; }

		this.brandObj = this.data["tool-tips"].brands[this.key];
		this.optionKeys = Object.keys(this.brandObj);

		this.optionKeys.forEach((element, i) => {
			let $optionSelector = $("#productOptions").find("[data-option-title='"+ this.optionKeys[i] +"']"),
				type = this.data["tool-tips"].brands[this.key][this.optionKeys[i]].type;

			switch(type){
				case "tabs": 
					this.tabsTip($optionSelector, this.brandObj[element].tip);
					break;
				default: 
					this.generalTip($optionSelector, this.brandObj[element].tip);
			}
		});
		
		return this;
	},


	// build custom element modal
	elementTip: function(){
		let keys = this.key.replace(/ /g,'').split(",");

		keys.forEach((ele) => {
			if( this.data["tool-tips"].elements.hasOwnProperty(ele) ){ 
				this.elementObj = this.data["tool-tips"].elements;
				$("#" + ele).html(this.elementObj[ele].join("") );
			}
		});

		$("#"+this.id).append(this.closeBtn);

		return this;
	},



	tabsTip($optionSelector, tipArr){
		let tabs = this.getTabs(tipArr);

		$optionSelector
			.find(".toolTip").addClass("toolTip--show")
				.end()
			.find(".toolTip__cntr")
				.addClass("toolTip__cntr--withTabs")
				.append(tabs)
				.append(this.closeBtn);

		return this;
	},



	generalTip($optionSelector, tipObj){
		tipObj = tipObj.join("");

		$optionSelector
			.find(".toolTip").addClass("toolTip--show")
				.end()
			.find(".toolTip__cntr")
				.append(tipObj)
				.append(this.closeBtn);	

		return this;
	},


	// open 
	openTipModal: function(e){
		let tipData = $(this).data();

		e.preventDefault();

		if( tipData.hasOwnProperty("toolTipType") ){
			TEAK.Modules.toolTip.init({
				type: tipData.toolTipType,
				key: tipData.toolTipName,
				id: tipData.toolTipId
			});
		}

		TEAK.Modules.toolTip.activeModal = tipData.hasOwnProperty("toolTipId")  ? tipData.toolTipId : $(this).attr("rel");

		let $activeModal = $("#"+ TEAK.Modules.toolTip.activeModal);
		$activeModal.toggleClass("toolTip__cntr--hide toolTip__cntr--show");

		let modalHeight = $activeModal.outerHeight();
		$activeModal.css({
			height: modalHeight,
			marginTop: -(modalHeight/2)
		});
	},



	// close
	closeTipModal: function(e){
		if ( TEAK.Modules.toolTip.activeModal !== "" ){
			$("#"+ TEAK.Modules.toolTip.activeModal).toggleClass("toolTip__cntr--hide toolTip__cntr--show");
			TEAK.Modules.toolTip.activeModal = "";
		}

		e.preventDefault();
	},


	// on click check to see if the event happend outside or inside the modal, close if the former
	checkClickToCloseModal: function(e){
		let clickedOpenLink = $(e.target).closest("[data-tool-tip-open]").length;

		if ( TEAK.Modules.toolTip.activeModal !== "" ){
			if ( !$(e.target).closest('#'+ TEAK.Modules.toolTip.activeModal).length && !clickedOpenLink ){
				TEAK.Modules.toolTip.closeTipModal(e);
			
			}else{
				if( !$(e.target).closest('.toolTip__tabsCntr').length && $('#'+ TEAK.Modules.toolTip.activeModal).hasClass("toolTip__cntr--withTabs") && !clickedOpenLink ){
					TEAK.Modules.toolTip.closeTipModal(e);
				}
			}
		}
	},


	// on keyup of the ESC key, close the open modal
	checkKeyToCloseModal: function(e){
		if ( TEAK.Modules.toolTip.activeModal !== "" ){
			if( e.which === 27 ){
				TEAK.Modules.toolTip.closeTipModal();
			}
		}
	}
};


$(document.body)
	.on("click", TEAK.Modules.toolTip.checkClickToCloseModal)
	.on("keydown", TEAK.Modules.toolTip.checkKeyToCloseModal)
	.on("click", "[data-tool-tip-open]", TEAK.Modules.toolTip.openTipModal)
	.on("click", "[data-tool-tip-close]", TEAK.Modules.toolTip.closeTipModal);







/* 
	Displays the free shipping text based on price 
	- do want this to run inline as it needs to be shown as the page is shown

	rrp_without_tax: parseInt('{{../../../product.price.rrp_without_tax.value}}'),
	with_tax: parseInt('{{../../../product.price.with_tax.value}}'),
	without_tax: parseInt('{{../../../product.price.without_tax.value}}'),
    custom: parseInt('{{~default ../../../product.price.sale_price_without_tax.value price.without_tax.value~}}')
*/
TEAK.Modules.freeShipping = {
	set: function(args, element){
		let excludedSkus = [
				"LPG-L5000",
				"EL-OFS006",
				"EL-OFS005",
				"EL-OFS014",
				"EL-OFS302",
				"EL-OFS303",
				"EL-OFS304"
			],
			isExcluded = excludedSkus.includes(args.sku),
			
			freeShipping = '<p class="free-shipping-text" data-pricing-free-shipping>Free Shipping</p></p>',
			
			shippingTabs = [
					{
						id: "free_white_glove_delivery",
						label: "White Glove Delivery"
					},
					{
						id: "threshold_delivery",
						label: "First Threshold Delivery"
					}
				],

			freeWhiteGlove = '<p class="free-shipping-text" data-pricing-free-shipping>Free Shipping</p></p>',
				// `<p class="free-shipping-text" data-pricing-free-shipping>
				// 	<a href="" class="free-shipping-text--link" data-tool-tip-open data-tool-tip-type="element" data-tool-tip-name="free_white_glove_delivery, threshold_delivery" data-tool-tip-id="free_delivery">
				// 		<span>This item qualifies for free upgraded delivery</span> &nbsp;
				// 		<span class="toolTip__iconCntr toolTip__iconCntr--dark">
				// 			<svg class="toolTip__icon toolTip__icon--white" enable-background="new 0 0 20 20" version="1.1" viewBox="0 0 20 20" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
				// 				<title>tool tip</title>
				// 				<path d="M12.432 0c1.34 0 2.010 0.912 2.010 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-0.75-1.974-1.99 0-1.043 0.881-2.479 2.643-2.479zM8.309 20c-1.058 0-1.833-0.652-1.093-3.524l1.214-5.092c0.211-0.814 0.246-1.141 0-1.141-0.317 0-1.689 0.562-2.502 1.117l-0.528-0.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273 0.705 3.23l-1.391 5.352c-0.246 0.945-0.141 1.271 0.106 1.271 0.317 0 1.357-0.392 2.379-1.207l0.6 0.814c-2.502 2.547-5.235 3.527-6.291 3.527z"></path>
				// 			</svg>
				// 		</span>
				// 	</a>
				// 	<div class="toolTip__cntr toolTip__cntr--withTabs toolTip__cntr--hide" id="free_delivery">
				// 		${TEAK.Modules.toolTip.getTabs(shippingTabs)}
				// 	</div>
				// </p>`,

				tpl = ( (args.price.without_tax > 2998 || args.price.custom > 2998) && !isExcluded ) ? freeWhiteGlove : freeShipping;
	
		document.getElementById(element).innerHTML = tpl;

		return this;
	}
};
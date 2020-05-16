/**
 * Graph QL Tempatles for Collection pages
 */

export default class GraphQL_Collection_TPL {

    /**
     * @param {Object} product product contrct from graphql
     * 
     *  Save this for later
     *  <button type="button" class="product__clearSwatch hide" title="Clear Swatch">
     *      <svg class="icon icon-minus"><use xlink:href="#icon-minus" /></svg>
     *  </button>
     */

    buildCollectionsPod(product){
        return `<section class="product__row product__row--border" id="${product.entityId}">
                    <form class="form add-to-cart-form" method="post" id="collection_${product.entityId}" name="collection_${product.entityId}" action="/cart.php" enctype="multipart/form-data" data-product-options-count="">
                        <input type="hidden" name="product_id" value="${product.entityId}" data-product-id="${product.entityId}" />
                        <input type="hidden" name="action" value="add" class="">

                        <div class="product__col-1-1">
                            <figure class="product__figure product__col-1-4--lg product__col-1-1">
                                <a href="${product.path}" title="See all details about ${product.name}">
                                    <img data-product-image class="product__img product__img--thumb" src="${product.defaultImage.url}" alt="${product.name}">
                                </a>
                            </figure>

                            <div class="product__col-3-4--lg product__col-1-1">
                                <div class="product__col-6-10--lg product__col-1-1">
                                    <header class="product__nameHeader">
                                        <h1 class="product__name product__name--sm">
                                            <a href="${product.path}" title="See all details about ${product.name}">${product.name}</a>
                                        </h1>
                                    </header>

                                    <p class="product__itemNum">Item #: ${product.sku} &nbsp;&nbsp;&nbsp; Internet #: ${product.entityId}
                                        <a class="product__ratingWrapper yotpo-pdp-wrapper hide" href="${product.path}#yotpoReviews" id="yotpoRating" title="Reviews of ${product.path}">
                                            <span class="yotpo-stars-rating" style="--rating: 0;" aria-label="Rating of 0 out of 5."></span>
                                            (<span class="yotpo-reviews-num">0</span>)
                                            <span class="yotpo-questions">
                                                <span class="yotpo-questions-num">0</span> Questions
                                            </span>
                                        </a>
                                    </p>

                                    <ul class="product__highlights">
                            ${Object.keys(product.customFields.edges).map((key) => {
                                let name = product.customFields.edges[key].node.name, tpl = '';

                                if(name === "Highlight 1" || name === "Highlight 2" || name === "Highlight 3"){
                                    tpl += `<li>${product.customFields.edges[key].node.value}</li>`;
                                }

                                return tpl;
                                
                            }).join('') }
                                    </ul>


                            ${Object.keys(product.customFields.edges).map((key) => {
                                let name = product.customFields.edges[key].node.name, tpl = '';

                                if(name === "Lead-Time"){
                                    tpl += `<p class="product__shippingInfo">`;
                                        
                                    let text = product.customFields.edges[key].node.value.toLowerCase();
                                    if( text.includes("ships next business day") ){
                                        tpl += `<span id="nextBussinessDay" class="shipping-range--tip">
                                                    ${TEAK.Modules.leadTime.setTip("nextBussinessDay", true)}
                                                </span>`;
                                    }

                                    tpl += `${product.customFields.edges[key].node.value} </p>`;
                                }


                                if(name === "Lead-Time 2"){
                                    tpl += `<p class="product__shippingInfo">${product.customFields.edges[key].node.value}</p>`;
                                }


                                if(name === "Promo Text"){
                                    tpl += `<p class="product__promoText">${product.customFields.edges[key].node.value}</p>`;
                                }


                                if(name === "Free Shipping Icon" && product.customFields.edges[key].node.value === "Yes"){
                                    tpl += `<div id="freeShipping">
                                                <p class="free-shipping-text" data-pricing-free-shipping>Free Shipping</p></p>
                                            </div>`;
                                }

                                return tpl;
                                
                            }).join('') }

                                    <div class="form-field">
                                        <label class="product__qtyCntr">
                                            <strong class="product__qtyText">Quantity</strong>
                                            <input type="number" class="product-quantity form-input" required name="qty[]" value="1" min="1" max="999" pattern="[0-9]+">
                                            <div class="product-quantity-toggle-wrapper">
                                                <button type="button" class="product-quantity-toggle product-quantity-decrement">
                                                    <svg class="icon icon-minus"><use xlink:href="#icon-minus" /></svg>
                                                </button>
                                                <button type="button" class="product-quantity-toggle product-quantity-increment">
                                                    <svg class="icon icon-plus"><use xlink:href="#icon-plus" /></svg>
                                                </button>
                                            </div>
                                        </label>
                                    </div>
                                   
                                </div>
                            


                                <div class="product__col-4-10--lg product__col-1-1 no-pad">
                                    <div class="product__price">
                                        <div class="product__priceLine">
                                            <span class="product__priceValue" data-price="${ TEAK.Utils.graphQL.determinePrice(product.prices) }" data-product-price-wrapper="without-tax">
                                                ${TEAK.Utils.formatPrice( TEAK.Utils.graphQL.determinePrice(product.prices) )}
                                            </span>
                                            ${product.prices.retailPrice !== null ? ` <span class="product__priceRrp">${TEAK.Utils.formatPrice( product.prices.retailPrice.value )}</span>` : '' }
                                        </div>              
                                    </div>
                                
                                    <button type="button" button-atc class="product__atcCollectionBtn">
                                        <span class="product__atcCollectionBtnText">Add to Cart</span>
                                        <svg class="icon icon-spinner hide"><use xlink:href="#icon-spinner" /></svg>
                                    </button>
                                
                                    <div class="product__swatchCol">
                                        <ul class="product__swatchList">

                                ${Object.keys(product.productOptions).map((key) => {
                                    let productOption = product.productOptions[key].node;

                                    if(productOption.displayStyle === "Swatch"){
                                        return `<li class="product__swatchItem form-field" id="${product.entityId}.${productOption.entityId}">
                                                    ${this.getToolTip(productOption)}
                                                    <label drawer--open class="product__swatchLabel" data-product-id="${product.entityId}" rel="${productOption.entityId}" data-product-img="${product.defaultImage.url}">
                                                        <div class="product__swatch">
                                                            <input class="product__swatchRadio form-input" id="${productOption.entityId}" type="radio" name="attribute[${productOption.entityId}]" value="" ${productOption.isRequired ? 'required' : ''} data-label="${productOption.displayName}">
                                                            <div class="product__swatchColor" style="background-image: url('https://dummyimage.com/256x256/cccccc/777777.png&text=Choose');">
                                                                <img class="product__swatchImg" src="https://dummyimage.com/256x256/cccccc/777777.png&text=Choose">
                                                            </div>
                                                        </div>
                                                        <div class="product__swatchText">
                                                            <p class="product__swatchOptionText">
                                                                <span class="product__swatchName">
                                                                ${productOption.displayName} 
                                                                
                                                                ${productOption.values.edges.length > 1 ? `
                                                                    <span class="product__swatchOptionIconCntr">
                                                                        &mdash; &nbsp;
                                                                        <svg class="product__swatchOptionIcon" viewBox="0 0 20 20">
                                                                            <path d="M19.398 7.415l-7.444-1.996-1.303-4.861c-0.109-0.406-0.545-0.642-0.973-0.529l-9.076 2.432c-0.428 0.114-0.686 0.538-0.577 0.944l3.23 12.051c0.109 0.406 0.544 0.643 0.971 0.527l3.613-0.967-0.492 1.838c-0.109 0.406 0.149 0.83 0.577 0.943l8.11 2.174c0.428 0.115 0.862-0.121 0.972-0.529l2.97-11.084c0.108-0.406-0.15-0.83-0.578-0.943zM1.633 3.631l7.83-2.096 2.898 10.818-7.83 2.096-2.898-10.818zM15.678 18.463l-6.814-1.863 0.536-2.002 3.901-1.047c0.428-0.113 0.688-0.537 0.578-0.943l-1.508-5.627 5.947 1.631-2.64 9.851z"></path>
                                                                        </svg> ${productOption.values.edges.length} options
                                                                    </span>` : ''
                                                                }
                            
                                                                </span>
                                                                <span class="product__swatchValue"></span>
                                                            </p>
                                                        </div>
                                                        <svg class="icon icon-long-arrow-right"><use xlink:href="#icon-long-arrow-right" /></svg>
                                                    </label>
                                                </li>`;
                                    }


                                    if(productOption.displayStyle === "DropdownList"){
                                        return `<li class="product__swatchItem product__swatchItem--select selectBox form-field" id="${productOption.entityId}" data-option-title="${productOption.displayName} ${productOption.entityId}" set-select data-product-attribute="set-select">
                                                    <label class="selectBox__label form-label" for="attribute-${productOption.entityId}">
                                                        <div class="selectBox__text selectBox__text--right">
                                                            <p class="selectBox__optionText">
                                                                <span class="selectBox__name selectBox__name--labelLeft">${productOption.displayName}</span>
                                                                <span class="selectBox__value">Select one</span>
                                                            </p>
                                                        </div>
                                                        <select class="selectBox__select form-input" id="attribute-${productOption.entityId}"  name="attribute[${productOption.entityId}]" ${productOption.isRequired ? 'required' : ''} aria-required="true">
                                                            <option disabled selected>Select one</option>

                                                            ${Object.keys(productOption.values.edges).map((key) => {
                                                                let dropdown = productOption.values.edges[key].node;
                                                                return `<option value="${dropdown.entityId}" data-product-attribute-value="${dropdown.label}">${dropdown.text !== undefined ? dropdown.text : dropdown.label.split("--")[0]}  ${dropdown.hasOwnProperty("priceAdjust") ? `(${dropdown.priceAdjust})` : '' }</option>
                                                            `}).join('')}
                                                            
                                                        </select>
                                                    </label>
                                                </li>`;
                                    }
                                
                                }).join('')}

                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </section>`;
    }



    getToolTip(productOption){
        return `<div class="toolTip toolTip--option${productOption.displayStyle}">
                    <a href="" title="About the ${productOption.displayName} option" class="toolTip__iconCntr toolTip__iconCntr--dark" data-tool-tip-open rel="${productOption.displayName.replace(/ /g,'')}">
                        <svg class="toolTip__icon toolTip__icon--white" enable-background="new 0 0 20 20" version="1.1" viewBox="0 0 20 20" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
                            <title>tool tip</title>
                            <path d="M12.432 0c1.34 0 2.010 0.912 2.010 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-0.75-1.974-1.99 0-1.043 0.881-2.479 2.643-2.479zM8.309 20c-1.058 0-1.833-0.652-1.093-3.524l1.214-5.092c0.211-0.814 0.246-1.141 0-1.141-0.317 0-1.689 0.562-2.502 1.117l-0.528-0.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273 0.705 3.23l-1.391 5.352c-0.246 0.945-0.141 1.271 0.106 1.271 0.317 0 1.357-0.392 2.379-1.207l0.6 0.814c-2.502 2.547-5.235 3.527-6.291 3.527z"></path>
                        </svg>
                    </a>  
                </div>
                <div class="toolTip__cntr toolTip__cntr--hide" id="${productOption.displayName.replace(/ /g,'')}"></div>`;
    }



    // swatch options
    buildSwatch(swatch){
        return `<div class="product__swatchControls form-field form-field-options form-field-swatch ${swatch.isRequired ? 'form-required' : ''}" data-swatch-selector data-product-attribute="swatch">
                    <div class="form-field-title-cntr" data-option-title="${swatch.displayName}">                    
                        <span class="form-field-title">${swatch.displayName}:</span> &nbsp; <span class="swatch-value" data-swatch-value></span>
                        ${swatch.isRequired ? '<span class="required-text">*</span>' : ''}
                    </div>
                
                    <div class="form-field-control-wrapper" >
                        <div class="form-field-control">

                ${Object.keys(swatch.values.edges).map((key) => {
                    let thisOption = swatch.values.edges[key].node;
                   
                    return `<label class="swatch-wrap" for="attribute-${thisOption.entityId}" data-swatch-value="${thisOption.label}" data-product-attribute-value="${thisOption.entityId}">
                                <input class="form-input swatch-radio"  data-option-title="${swatch.displayName}" data-parent-id="${swatch.entityId}" id="attribute-${thisOption.entityId}" type="radio" name="attribute[${thisOption.entityId}]" value="${thisOption.entityId}" data-label="${thisOption.label}" ${thisOption.isDefault ? 'checked' : ''} ${swatch.isRequired ? ' required' : ''} aria-required="${swatch.isRequired}">
                                <span class="swatch">
                                    <span class="swatch-color swatch-pattern" style="background-image: url('https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisOption.entityId}.preview.jpg');">
                                        <img class="swatch-pattern-image" src="https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisOption.entityId}.preview.jpg" alt="${thisOption.label}">
                                    </span>
                                ${thisOption.hexColors.length !== 0 ? '<span class="swatch-color" style="background-color: #'+thisOption.hexColors[0]+'"></span>' : '' }
                                </span>
                                <span class="form-label-text">${thisOption.label}</span>
                            </label>`}).join('')}

                        </div>
                    </div>
                </div>`;
    }



    // reqeust swatch form
    swatchRequestSwatches(swatch){
        return Object.keys(swatch.values.edges).map((key) => {
                let thisSwatch = swatch.values.edges[key].node;

                return `<li class="swatchModal__listItem" data-request-swatch data-swatch-title="${thisSwatch.label}">
                            <figure class="swatchModal__swatchImgCntr swatch-img">
                                <img class="swatchModal__swatchImg" src="https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisSwatch.entityId}.preview.jpg" alt="${thisSwatch.displayName}" />
                                <figcaption class="swatchModal__swatchTitle">
                                    ${thisSwatch.label}
                                </figcaption>
                            </figure>
                        </li>`;

            }).join('');
    }



    // dropdown options
    buildDropdown(dropdown){
        return `<div class="form-field form-field-options form-field-select ${dropdown.isRequired ? 'form-required' : ''}" data-product-attribute="set-select">
                    <label class="form-label">
                        <span class="form-field-title-cntr" data-option-title="${dropdown.displayName}">
                            <span class="form-field-title">${dropdown.displayName}:</span> &nbsp; ${dropdown.isRequired ? '<span class="required-text">*</span>' : ''}
                        </span>

                        <span class="form-field-control">
                            <div class="form-select-wrapper">
                                <select class="form-input form-select" id="attribute-${dropdown.entityId}" name="attribute[${dropdown.entityId}]" ${dropdown.isRequired ? ' required' : ''} aria-required="${dropdown.isRequired}">
                                <option value="" selected disabled>Pick One...</option>

                        ${Object.keys(dropdown.values.edges).map((key) => {
                            return `
                                <option value="${dropdown.values.edges[key].node.entityId}" data-product-attribute-value="${dropdown.values.edges[key].node.entityId}">${dropdown.values.edges[key].node.label}</option>
                            `}).join('')}

                                </select>
                            </div>
                        </span>
                    </label>
                </div>`;
    }



    getToasterItem(item){
        return `<li class="toaster__item">
                    <img class="toaster__itemImg" src="${item.defaultImage.url}">
                </li>`;
    }


    getAtcModalContent(product, cartDetail){

        return `<h2 class="modal-cart__title">Added to your Cart</h2>
                <div class="modal-cart__cntr">
                    <div class="modal-cart__contents">
                        <div class="modal-cart__item-list">
                            <div class="mini-cart-item" data-product-id="${product.entityId}">
                                <div class="mini-cart-item-wrap">

                                    <a href="${product.path}">
                                        <img class="" src="${product.defaultImage.url}" alt="${product.name}" />
                                    </a>

                                    <div class="mini-cart-item-description">
                                        <a href="${product.path}" class="mini-cart-item-title">${product.name}</a>

                                        <div class="mini-cart-item-options">
                                    ${Object.keys(product.productOptions).map((key) => {
                                        return`<span class="option-value">
                                                    <span class="option-value-label-mc">
                                                        ${product.productOptions[key].node.displayName.replace("Select", "Selected")}
                                                    </span>
                                                    <span class="option-value-wrapper">
                                                        ${product.selected[product.productOptions[key].node.entityId].text}
                                                    </span>
                                                </span>`;
                                    }).join('')}
                                        </div>
                                        
                                    </div>
                                    <div class="mini-cart-item-price">
                                        <span data-quantity></span> &times;
                                        <span data-price></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-cart__summary">
                        <div class="modal-cart__subtotal">
                            <span class="modal-cart__subtotal-label">Order Subtotal</span>
                            <span class="modal-cart__subtotal-value" data-value="${cartDetail.cartAmount}">
                                ${TEAK.Utils.formatPrice(cartDetail.cartAmount)}
                            </span>
                        </div>
                        
                        <a class="button button-primary button-primary--greenTrans button-cart" href="/cart.php" onclick="TEAK.ThirdParty.heap.init({method: 'track', event:'proceed_to_cart', location: 'collections_modal' })">
                            <span class="button-text">View Cart</span>
                        </a>
                        <div class="modal-cart__marketing modal-cart__marketing--summary"></div>
                    </div>
                </div>`;
    }


}
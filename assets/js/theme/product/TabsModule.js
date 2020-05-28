/**
 * Custom PDP Tabs Module
 * ----------------------------
 * Builds the PDP tabs based on data added to the PDP via ShoGun by content team
 * 
 */

export default class TabsModule {
    constructor(firsTabSettings) {
        this.tabObj = JSON.parse(document.getElementById("tabJSON").innerHTML);

        this.bindListners();
        this.buildTabObj();
        this.initTabContent();
    }



    buildTabObj(){
        this.tabObj.forEach((element) => {
            element["type"] = document.getElementById(element.id);
        });
    }


    bindListners(){
        $("#productMetaTabs").on("click", "a[product-meta-tab]", (e) => {
            e.preventDefault();
            this.toggleMetaTab(e);
        });
    }


    toggleMetaTab(e){
        let $target = $(e.currentTarget),
            anchor = $target.attr("href");
        
        $target.toggleClass("product__titleLink--active");

        $(anchor)
            .slideToggle("fast")
            .parents(".product__tabSection").toggleClass("product__tabSection--active");
    }

	
    //Initialize tabbed content
    initTabContent() {

        // itterate over our tabs object and build out each tab skipping any tabs that have no content
        this.tabObj.forEach((element) => {
            if (element.type !== null && document.getElementById(element.id).innerHTML.trim() !== "") {
                let content = document.getElementById(element.id).innerHTML;

                $("#" + element.contentCntr).parents(".product__tabSection").removeClass("hide");
                
                document.getElementById(element.contentCntr).innerHTML = content;
                document.querySelector('#' + element.id).parentNode.removeChild(document.querySelector('#' + element.id))

                this.setCustomContent(element);
            }
        });
    }

    setCustomContent(element){
        if(element.hasOwnProperty("customContent")){
            let customNode = document.createElement('p');
            customNode.innerHTML = element.customContent;
            document.getElementById(element.id).appendChild(customNode);
        }
    }

}
  


/**
 * Sets custom pdp tab content
 * 
 * 	document.addEventListener("DOMContentLoaded", function(){
		window.TEAK.Modules.tabs.getTabContent({
			key: "",	// json key
			mobileCntr: "" // mobile content selector class
		});
	});
 */
TEAK.Modules.tabs = {
	data: TEAK.Utils.getProductJSON(),

	// fetch tab content
	getTabContent: function(tabElement){
        if( !this.data ){ return; }
        
        if( document.getElementById(tabElement.cntr) ){
            let content = this.data.tabs[tabElement.key].join("");
            document.getElementById(tabElement.cntr).innerHTML = content;
        }
        
		return this;
	}
};
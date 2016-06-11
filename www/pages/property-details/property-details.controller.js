(function(app){
    'use strict';

    app.controller('PropertyDetailsPageController', PropertyDetailsPageController);

    PropertyDetailsPageController.$inject = ['PropertiesService']

    function PropertyDetailsPageController(PropertiesService) {
        var vm = this;
        
        // properties
        vm.property = {};

        activate();
        ////////////////////////
        
        function activate() {
            // navi is global from onsen-navigator
            vm.property = prepareProperty(navi.topPage.data.selectedProperty);
        }

        function prepareProperty(property) {
            var splitTitle = property.title.split(',');

            if (splitTitle.length > 1) {
                property.title = splitTitle[0] + ', ' + splitTitle[1];
            } else {
                property.title = splitTitle[0];
            }

            return property;
        }
    }
})(window.app);
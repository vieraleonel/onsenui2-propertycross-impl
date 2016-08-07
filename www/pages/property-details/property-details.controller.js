(function(app){
    'use strict';

    app.controller('PropertyDetailsPageController', PropertyDetailsPageController);

    PropertyDetailsPageController.$inject = ['PropertiesService', 'FavouritesService', '$timeout']

    function PropertyDetailsPageController(PropertiesService, FavouritesService, $timeout) {
        var vm = this;
        
        // properties
        vm.property = {};

        // methods
        vm.toggleFav = toggleFav;

        activate();
        ////////////////////////
        
        function activate() {
            // navi is global from onsen-navigator
            vm.property = prepareProperty(navi.topPage.data.selectedProperty);
        }

        function prepareProperty(property) {
            property.title = formatTitle(property.title);

            FavouritesService.isFav(property)
                .then(function(isFav) {
                    // workarount to force $digest cycle
                    $timeout(function() {
                        vm.property.isFav = isFav;
                    }, 0)
                });

            return property;
        }

        function formatTitle(title) {
            var splitTitle = title.split(',');

            if (splitTitle.length > 1) {
                title = splitTitle[0] + ', ' + splitTitle[1];
            } else {
                title = splitTitle[0];
            }

            return title;
        }

        function toggleFav() {
            if (vm.property.isFav) {
                FavouritesService.remove(vm.property);
            } else {
                FavouritesService.store(vm.property);
            }

            vm.property.isFav = !vm.property.isFav;

        }
    }
})(window.app);
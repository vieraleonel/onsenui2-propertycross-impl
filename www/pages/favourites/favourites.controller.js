(function(app){
    'use strict';

    app.controller('FavouritesPageController', FavouritesPageController);

    FavouritesPageController.$inject = ['FavouritesService']

    function FavouritesPageController(FavouritesService) {
        var vm = this;
        
        // properties
        vm.faves = [];

        // methods
        vm.goToPropertyDetails = goToPropertyDetails;

        activate();
        ////////////////////////
        
        function activate() {
            console.log('activate');
            FavouritesService.getAll()
                .then(function(faves) {
                    vm.faves = faves;
                });
        }

        function goToPropertyDetails(property) {
            // navi is global from onsen-navigator
            navi.pushPage('pages/property-details/property-details.html', {
                data: {
                    selectedProperty: property
                }
            });
        }
    }
})(window.app);
(function(app){
    'use strict';

    app.controller('MainPageController', MainPageController);

    MainPageController.$inject = ['PropertiesService']

    function MainPageController(PropertiesService) {
        var vm = this;
        
        // properties
        vm.searchTerm = '';
        vm.loading = false;

        // methods
        vm.searchByTerm = searchByTerm;

        ////////////////////////
        
        function searchByTerm() {
            vm.loading = true;

            PropertiesService.searchByTerm(vm.searchTerm)
                .then(function(){
                    // navi is global from onsen-navigator
                    navi.pushPage('pages/results/results.html')
                        .then(function(){
                            vm.loading = false;
                        });
                })
                .catch(function(){
                    vm.loading = false;
                });
        }
    }
})(window.app);
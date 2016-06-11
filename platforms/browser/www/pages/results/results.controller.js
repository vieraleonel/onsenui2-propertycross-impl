(function(app){
    'use strict';

    app.controller('ResultsPageController', ResultsPageController);

    ResultsPageController.$inject = ['PropertiesService']

    function ResultsPageController(PropertiesService) {
        var vm = this;
        
        // properties
        vm.queryData = {};
        vm.loadMore = {};

        // methods
        vm.getMoreProperties = getMoreProperties;
        vm.goToPropertyDetails = goToPropertyDetails;

        activate();
        ////////////////////////
        
        function activate() {
            vm.queryData = PropertiesService.getLastQueryResults();

            vm.loadMore = {
                loading: false,
                label: 'Load more ...',
                canLoad: vm.queryData.page < vm.queryData.pages
            };
        }

        function toggleLoadMore() {
            if (vm.loadMore.loading) {
                vm.loadMore.loading = false;
                vm.loadMore.label = 'Load more ...';
            } else {
                vm.loadMore.loading = true;
                vm.loadMore.label = 'Loading ...';
            }

            vm.loadMore.canLoad = vm.queryData.page < vm.queryData.pages;
        }

        function goToPropertyDetails(property) {
            // navi is global from onsen-navigator
            navi.pushPage('pages/property-details/property-details.html', {
                data: {
                    selectedProperty: property
                }
            });
        }

        function getMoreProperties() {
            toggleLoadMore();

            PropertiesService.loadMore()
                .then(function(){
                    toggleLoadMore();
                    vm.queryData = PropertiesService.getLastQueryResults();
                }).
                catch(function(){
                   toggleLoadMore();
                });
        }
    }
})(window.app);
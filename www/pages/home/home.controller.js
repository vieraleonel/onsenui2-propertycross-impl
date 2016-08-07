(function(app){
    'use strict';

    app.controller('HomePageController', HomePageController);

    HomePageController.$inject = ['PROPERTY_API',  'PropertiesService', 'RecentSearchesService', '$window', '$timeout']

    function HomePageController(PROPERTY_API, PropertiesService, RecentSearchesService, $window, $timeout) {
        var vm = this;
        
        // properties
        vm.searchTerm     = '';
        vm.loading        = false;
        vm.recentSearches = [];
        vm.state          = 1;
        vm.errorMessage   = '';
        vm.locations      = [];

        // methods
        vm.searchByTerm     = searchByTerm;
        vm.searchByPosition = searchByPosition;
        vm.doSearchWith     = doSearchWith;
        vm.goToFaves        = goToFaves;

        activate();
        ////////////////////////
        
        function activate() {
            // listener for getting recent searches every time
            // home page is shown
            $window.document
                .addEventListener('show', function(event){
                    if (event.srcElement.id === 'home-page') {
                        getRecentSearches();
                    } 
                });
        }

        function getRecentSearches() {
            RecentSearchesService.get()
                .then(function(data) {
                    // workarount to force $digest cycle
                    $timeout(function() {
                        vm.recentSearches = data;
                    }, 0)
                });
        }

        function toggleModal() {
            $window.document
                .getElementById('home-modal')
                .toggle();
        }
                
        function searchByTerm() {
            toggleModal();
            
            PropertiesService.searchByTerm(vm.searchTerm)
                .then(function(data) {
                    processResponse(data);
                })
                .catch(function(){
                    showErrorState({message: 'Other error'});
                });
        }

        function processResponse(data) {
            if (data.status === PROPERTY_API.status.SUCCESS) {
                showResultsPage(data);
            }
            else if (data.status === PROPERTY_API.status.AMBIGUOUS) {
                showLocationsState(data);
            }
            // error
            else {
                showErrorState(data);
            }
        }

        function searchByPosition() {
            vm.searchTerm = '';

            toggleModal();

            PropertiesService.searchByPosition()
                .then(function(data){
                    processResponse(data);
                })
                .catch(function(error){
                    showErrorState(error);
                });
        }

        function showResultsPage(data) {
            vm.state        = 1;
            vm.locations    = [];
            vm.errorMessage = '';

            if (vm.searchTerm !== '') {
                RecentSearchesService.store({
                    term: vm.searchTerm,
                    results: data.results 
                });
            }

            $window.navi
                .pushPage('pages/results/results.html')
                .then(function(){
                    toggleModal();
                });
        }

        function showLocationsState(data) {
            vm.state     = 2; // ambiguous
            vm.locations = data.locations;

            toggleModal();
        }

        function showErrorState(data) {
            vm.state        = 0; // error
            vm.errorMessage = data.message;

            toggleModal();
        }

        function doSearchWith(location) {
            vm.state        = 1;
            vm.locations    = [];
            vm.errorMessage = '';
            vm.searchTerm   = location;

            searchByTerm();
        }

        function goToFaves() {
            $window.navi.pushPage('pages/favourites/favourites.html');
        }
    } // function HomePageController
})(window.app);
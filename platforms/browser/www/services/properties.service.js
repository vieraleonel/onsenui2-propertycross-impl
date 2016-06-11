(function(app){
    'use strict';

    app.service('PropertiesService', PropertiesService);

    PropertiesService.$inject = ['$http']

    function PropertiesService($http) {
        var lastQueryResults = {};

        var service = {
            searchByTerm: searchByTerm,
            getLastQueryResults: getLastQueryResults,
            loadMore: loadMore
        }

        return service;
        //////////////////////////////
        
        function composeTermUrl(term, page) {
            return 'http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=' + page + '&place_name=' + term;
        }

        function searchByTerm(term) {
            return $http.get(composeTermUrl(term, 1))
                .then(searchByTermComplete)
                .catch(searchByTermFailed);

            function searchByTermComplete(response) {
                lastQueryResults = {
                    searchTerm: term,
                    page: response.data.response.page,
                    pages: response.data.response.total_pages + 1,
                    showing: response.data.response.listings.length,
                    results: response.data.response.total_results,
                    properties: response.data.response.listings
                };

                return response.data;
            }

            function searchByTermFailed(error) {
                console.error(error)
            }
        }

        function loadMore() {
            return $http.get(composeTermUrl(lastQueryResults.searchTerm, lastQueryResults.page +1))
                .then(loadMoreComplete)
                .catch(loadMoreFailed);

            function loadMoreComplete(response) {
                lastQueryResults.page++;
                lastQueryResults.properties = lastQueryResults.properties.concat(response.data.response.listings);
                lastQueryResults.showing    = lastQueryResults.properties.length;

                return response.data;
            }

            function loadMoreFailed(error) {
                console.error(error)
            }
        }

        function getLastQueryResults() {
            return lastQueryResults;
        }
    }
})(window.app);
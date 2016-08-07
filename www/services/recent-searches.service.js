(function(app){
    'use strict';

    app.factory('RecentSearchesService', RecentSearchesService);

    RecentSearchesService.$inject = ['$log', '$q', '_', 'localforage', '$timeout']

    function RecentSearchesService($log, $q, _, localforage) {
        var searches = null;

        var service = {
            get: getRecentSearches,
            store: storeSearch
        };

        return service;

        //////////////////////////////
 
        function init() {
            return localforage.getItem('recentSearches')
                .then(initComplete)
                .catch(initFailed);

            function initComplete(value) {
                searches = value;

                return searches;
            }

            function initFailed(error) {
                $log.error(error);
            }
        }

        function getRecentSearches() {

            if (searches !== null) {
                return $q.resolve(searches);
            } else {
                return init();
            }
        }

        function storeSearch(searchInfo) {
            var search = {
                term: searchInfo.term,
                results: searchInfo.results,
                date: new Date().toISOString()
            }

            if (searches === null) {
                searches = [search];
            }
            else {
                // try to find term
                var index = _.findIndex(searches, ['term', search.term]);

                // update date or insert
                if (index > -1) {
                    searches[index] = search;
                }
                else {
                    searches.push(search);
                }

                // order
                searches = _.reverse(_.sortBy(searches, ['date']));

                // only 6 elements
                searches = _.slice(searches, 0, 6);
            }

            localforage.setItem('recentSearches', searches);
        }
    }
})(window.app);
(function(app){
    'use strict';

    app.factory('FavouritesService', FavouritesService);

    FavouritesService.$inject = ['$log', '$q', '_', 'localforage', '$window']

    function FavouritesService($log, $q, _, localforage, $window) {
        var favourites = null;

        var service = {
            getAll: getFavourites,
            store: storeFav,
            remove: removeFav,
            isFav: isFav
        };

        return service;

        //////////////////////////////
 
        function init() {
            return localforage.getItem('favouriteProperties')
                .then(initComplete)
                .catch(initFailed);

            function initComplete(value) {
                favourites = value;
                return favourites;
            }

            function initFailed(error) {
                $log.error(error);
            }
        }

        function getFavourites() {

            if (favourites !== null) {
                return $q.resolve(favourites);
            } else {
                return init();
            }
        }

        function getPropertyKey(property) {
            return $window.btoa(property.lister_url);
        }

        function isFav(property) {

            return getFavourites().then(isFavComplete)
                .catch(isFavFailed);

            function isFavComplete(favourites) {
                return _.findIndex(favourites, ['key', getPropertyKey(property)]) > -1;                
            }

            function isFavFailed(error) {
                $log.error(error);
                return false;
            }
        }

        function storeFav(property) {
            property.key = getPropertyKey(property);

            if (favourites === null || _.isEmpty(favourites)) {
                favourites = [property];
            }
            else {
                // try to find term
                var index = _.findIndex(favourites, ['key', property.key]);

                // update date or insert
                if (index > -1) {
                    favourites[index] = property;
                }
                else {
                    favourites.push(property);
                }
            }
            
            localforage.setItem('favouriteProperties', favourites);
        }

        function removeFav(property) {

            // try to find property
            var index = _.findIndex(favourites, ['key', getPropertyKey(property)]);

            // delete element from favourites
            if (index > -1) {
                _.pull(favourites, favourites[index]);
            }
            
            localforage.setItem('favouriteProperties', favourites);
        }
    }
})(window.app);
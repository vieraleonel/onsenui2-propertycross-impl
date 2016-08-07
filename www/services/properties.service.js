(function(app){
    'use strict';

    app.factory('PropertiesService', PropertiesService);

    PropertiesService.$inject = ['$log', '$http', '$window', '$q', 'PROPERTY_API']

    function PropertiesService($log, $http, $window, $q, PROPERTY_API) {
        var lastQueryResults  = {};
        var searchTerm        = '';
        var searchCoordinates = null;

        var service = {
            searchByTerm: searchByTerm,
            searchByPosition: searchByPosition,
            loadMore: loadMore,
            getLastQueryResults: getLastQueryResults
        };

        return service;
        //////////////////////////////
        
        function composeTermUrl(term, page) {
            return 'http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=' + 
                    page + '&place_name=' + term;
        }

        function composePositionUrl(coordinates, page) {
            return 'http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=' +
                    page + '&centre_point=' + coordinates.lat + ',' + coordinates.lng;
        }

        function searchByTerm(term) {
            searchCoordinates = null;
            searchTerm        = term;

            return $http.get(composeTermUrl(term, 1), {timeout: 5000})
                .then(searchByTermComplete)
                .catch(searchByTermFailed);

            function searchByTermComplete(response) {
                return processResponse(response.data);
            }

            function searchByTermFailed(error) {
                return processFailedResponse(error, PROPERTY_API.error.messages.GENERIC_ERROR);
            }
        }

        function searchByPosition() {
            searchCoordinates = null;
            searchTerm        = '';

            return $q(function(resolve, reject){
                $window.navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true, timeout: 5000 });

                function positionSuccess(position) {
                    searchCoordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    $http.get(composePositionUrl(searchCoordinates, 1), {timeout: 5000})
                        .then(searchByPositionComplete)
                        .catch(positionError);

                    function searchByPositionComplete(response) {
                        var info = processResponse(response.data);
                        resolve(info);
                    }
                }

                function positionError(error) {
                    var msg = '';

                    if (error.code === error.PERMISSION_DENIED) {
                        msg = PROPERTY_API.error.messages.LOCATION_DISABLED;
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        msg = PROPERTY_API.error.messages.LOCATION_UNAVAILABLE;
                    }  
                    else {
                        msg = PROPERTY_API.error.messages.GENERIC_ERROR
                    }

                    var err = processFailedResponse(error, msg);
                    reject(err);
                }
            });
        }

        function processResponse(data) {

            switch (data.response.application_response_code) {
                case '100':
                case '101':
                case '110':
                    if (data.response.listings.length) {
                        lastQueryResults = {
                            status: PROPERTY_API.status.SUCCESS,
                            message: '',
                            searchTerm: searchTerm,
                            searchCoordinates: searchCoordinates,
                            page: data.response.page,
                            pages: data.response.total_pages + 1,
                            showing: data.response.listings.length,
                            results: data.response.total_results,
                            properties: data.response.listings
                        };
                    }
                    else {
                        lastQueryResults = {
                            status: PROPERTY_API.status.ERROR, 
                            message: 'There were no properties found for the given location.',
                            searchTerm: searchTerm,
                            searchCoordinates: searchCoordinates
                        };
                    }

                    break;
                case '200':
                case '202':
                    lastQueryResults = {
                        status: PROPERTY_API.status.AMBIGUOUS, 
                        message: '',
                        searchCoordinates: searchCoordinates,
                        searchTerm: searchTerm,
                        locations: data.response.locations
                    };
                    break;
                default:
                    lastQueryResults = processFailedResponse(null, PROPERTY_API.error.messages.GENERIC_ERROR);
            } // switch

            return lastQueryResults;
        }

        function processFailedResponse(error, msg) {
            $log.error(error);

            lastQueryResults = {
                status: PROPERTY_API.status.ERROR, // error
                message: msg,
                searchCoordinates: searchCoordinates,
                searchTerm: searchTerm
            };

            return lastQueryResults;
        }

        function loadMore() {
            if (lastQueryResults.searchCoordinates === null) {
                return $http.get(composeTermUrl(lastQueryResults.searchTerm, lastQueryResults.page +1))
                    .then(loadMoreComplete)
                    .catch(loadMoreFailed);    
            }
            else {
                return $http.get(composePositionUrl(lastQueryResults.searchCoordinates, lastQueryResults.page +1))
                    .then(loadMoreComplete)
                    .catch(loadMoreFailed);
            }
            

            function loadMoreComplete(response) {
                lastQueryResults.page++;
                lastQueryResults.properties = lastQueryResults.properties.concat(response.data.response.listings);
                lastQueryResults.showing    = lastQueryResults.properties.length;

                return response.data;
            }

            function loadMoreFailed(error) {
                return processFailedResponse(error, PROPERTY_API.error.messages.GENERIC_ERROR);
            }
        }

        function getLastQueryResults() {
            return lastQueryResults;
        }
    }
})(window.app);
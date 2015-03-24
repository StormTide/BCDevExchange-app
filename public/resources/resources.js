/*
 Copyright 2015 Province of British Columbia

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

angular.module('bcdevxApp.resources', ['ngRoute', 'ngSanitize', 'ui.highlight'])

    .config(['$routeProvider', function($routeProvider) {

    }])

    .factory('ResourceList', ['$resource', function($resource) {
        return $resource('/resources');
    }])

    .factory('SourceList', ['$resource', function($resource) {
        return $resource('/resources-sources');
    }])


    .controller('ResourcesCtrl', ['$rootScope', '$scope', '$location', '$window',
                'usSpinnerService', 'ResourceList', 'SourceList', '$q', '$resource',

        function($rootScope, $scope, $location, $window, usSpinnerService, ResourceList, SourceList, $q, $resource) {

        // Filter vars
        $scope.selectedSource = '';
        $scope.selectedSourceTitle = '';
        $scope.predicateTitle = '';

        // Array of resources
        $scope.resources = [];

        // Array of alerts
        $scope.alerts = [];

        $scope.startSpin = function(){
            usSpinnerService.spin("spinner-1");
        }
        $scope.stopSpin = function(){
            usSpinnerService.stop("spinner-1");
        }

        var resourceListDeferred = $q.defer();
        var resourcePromise = resourceListDeferred.promise;

        var sourceListDeferred = $q.defer();
        var sourcePromise = sourceListDeferred.promise;

        resourcePromise.then(
            function(value){
                console.log("resolution value: " + value);
            }
        );
        sourcePromise.then(
            function(value){
                console.log("resolution value: " + value);
            }
        );

        $q.all([resourcePromise,sourcePromise]).then(
            function(){
                $scope.stopSpin();
            }
        );

        SourceList.get({}, function(data) {
            $scope.sources = data.sources;
            for(var i in data.sources) {
                var source = data.sources[i];
                var sourceData = $resource('/resources/:source', {}, { timeout: 10 });
                sourceData.get({ source: source.short_name.toLowerCase() }, function(data) {
                    for(var j in data.resources) {
                        $scope.resources.push(data.resources[j]);
                    }
                    resourceListDeferred.resolve("resource list length: " + data.resources.length);
                }, function(error) {
                    $scope.alerts.push({ type: 'warning', msg: 'There was an error accessing data from <strong>' + error.config.url + '</strong>.' });
                    resourceListDeferred.resolve("error retrieving resources for  " + error.config.url);
                });
            }
            sourceListDeferred.resolve("source list length: " + data.sources.length);
        });

        $scope.hasMatchingSource = function(actual, expected) {
            if(expected.short_name == "") return true; // Filtering by null should show all results
            if(!actual.short_name || !expected.short_name) return false;
            return actual.short_name == expected.short_name;
        }

        $scope.selectSource = function(event, newSource, newSourceTitle) {
            event.preventDefault();
            $scope.selectedSource = newSource;
            $scope.selectedSourceTitle = newSourceTitle;
        }

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };


    }]);
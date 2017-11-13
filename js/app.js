/**
*  app.js
*  
*/

// Create the main application module
var app = angular.module("appname", ["ngRoute", "controller"]);

// Set up routing for single-page application
app.config(function($routeProvider, $locationProvider) {
    // Added $locationProvider to solve "#!" routing issue
    $locationProvider.hashPrefix('');
    $routeProvider

        .when("/", {
            templateUrl: "views/mainview.html",
            controller: "controller"
        })
        .when("/editTask/:listID/:taskID", {
            templateUrl: "views/inputTask.html",
            controller: "TaskController"
        })
/*
        .when("/ANOTHERPAGE", {
            templateUrl: "views/ANOTHERPAGE.html",
            controller: "ANOTHERCTRL"
        })
*/
        // Any other link
        .otherwise({
            redirectTo: "/"
        });

});

/**
*  app.js
*  
*/

// Create the main application module
var app = angular.module("PrioriTask", ["ngRoute", "controller"]);

// Set up routing for single-page application
app.config(function($routeProvider, $locationProvider) {
    // Added $locationProvider to solve "#!" routing issue
    $locationProvider.hashPrefix('');
    $routeProvider

        .when("/", {
            templateUrl: "views/mainview.html",
            controller: "controller"
        })
        .when("/dash", {
            templateUrl: "views/dashboard.html",
            controller: "controller"
        })
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "LoginController"
        })
        .when("/signup", {
            templateUrl: "views/signuppage.html",
            controller: "RegistrationController"
        })
        .when("/list/:listID", {
            templateUrl: "views/mainview.html",
            controller: "controller"
        })
        .when("/addList/:userID/:prevListID", {
            templateUrl: "views/inputList.html",
            controller: "ListController"
        })
        .when("/editList/:userID/:listID", {
            templateUrl: "views/inputList.html",
            controller: "ListController"
        })
        .when("/addTask/:listID", {
            templateUrl: "views/inputTask.html",
            controller: "TaskController"
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

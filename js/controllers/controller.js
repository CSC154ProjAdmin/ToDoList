/*
*  controller.js
* 
*/

angular.module("controller", [])

// Create a (MVC) controller passing its name and array of dependencies starting with $scope
.controller("controller", ["$scope", "UsersService", "ListsService", "TasksService",
    function($scope, UsersService, ListsService, TasksService) {
    // Always create an object first and add properties/methods to it instead of $scope
    $scope.vm = {};

    $scope.vm.tasks = TasksService.Tasks;

    $scope.toggleComplete = function(task){
        TasksService.toggleComplete(task);
    }
    
    $scope.deleteTask = function(task){
        TasksService.deleteTask(task);
    }

    $scope.prettyDatetime = function(ugly, useSeconds){
        // Adapted from https://gist.github.com/hurjas/2660489

        var date = [ ugly.getMonth() + 1, ugly.getDate(), ugly.getFullYear() ];
        if (useSeconds) {
            var time = [ ugly.getHours(), ugly.getMinutes(), ugly.getSeconds() ];
        } else {
            var time = [ ugly.getHours(), ugly.getMinutes() ];            
        }
        var suffix = ( time[0] < 12 ) ? "AM" : "PM";

        // Convert hour from military time
        time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

        // If hour is 0, set it to 12
        time[0] = time[0] || 12;

        // If seconds and minutes are less than 10, add a zero
        for ( var i = 1; i < time.length; i++ ) {
            if ( time[i] < 10 ) {
                time[i] = "0" + time[i];
            }
        }

        var pretty = date.join("/") + " " + time.join(":") + " " + suffix;
        return pretty;
    }    
}])
.controller("TaskController", ["$scope", "$routeParams", "$location", "TasksService", 
    function($scope, $routeParams, $location, TasksService){
        $scope.vm = {};
        if (!$routeParams.taskID){
            // TODO: Create new task for listID
            //console.log("No taskID sent");
        } else {
            var taskToEdit = TasksService.findById(parseInt($routeParams.taskID));
            if (taskToEdit && taskToEdit.listID === parseInt($routeParams.listID)) {
                //console.log("Task found: Cloning for edit");
                $scope.vm.task = TasksService.cloneTask(taskToEdit);
            } else {
                //console.log("Invalid list or task ID. Redirecting home.");
                $location.path("/");
            }
        }

        $scope.save = function(){
            TasksService.save($scope.vm.task);
            $location.path("/");
        }
}])
.service("UsersService", function(){
    var usersService = {};
    return usersService;
})
.service("ListsService", function(){
    var listsService = {};
    return listsService;
})
.service("TasksService", function(){
    var tasksService = {};

    tasksService.Tasks = [
        // Dummy / test data
        // Table fields: TaskID, ListID, sTaskName, bComplete, dDue, dCreated, dUpdated, dDeleted
        {
            taskID: 1001, listID: 100, taskName: "DUMMY1001", isComplete: false, 
            dateDue: new Date("Dec 01, 2017"),
            dateCreated: new Date("Nov 01, 2017"),
            dateUpdated: new Date("Nov 01, 2017")
        },
        {
            taskID: 1002, listID: 100, taskName: "DUMMY1002", isComplete: true, 
            dateDue: new Date("Dec 02, 2017"),
            dateCreated: new Date("Nov 02, 2017"),
            dateUpdated: new Date("Nov 02, 2017")
        },
        {
            taskID: 1003, listID: 100, taskName: "DUMMY1003", isComplete: false, 
            dateDue: new Date("Dec 03, 2017"),
            dateCreated: new Date("Nov 03, 2017"),
            dateUpdated: new Date("Nov 03, 2017")
        },
        {
            taskID: 1004, listID: 100, taskName: "DUMMY1004", isComplete: true, 
            dateDue: new Date("Dec 04, 2017"),
            dateCreated: new Date("Oct 01, 2017"),
            dateUpdated: new Date("Oct 01, 2017")
        },
        {
            taskID: 1005, listID: 100, taskName: "DUMMY1005", isComplete: false, 
            dateDue: new Date("Dec 05, 2017"),
            dateCreated: new Date("Oct 01, 2017"),
            dateUpdated: new Date("Nov 01, 2017")
        },
        {
            taskID: 1006, listID: 100, taskName: "DUMMY1006", isComplete: true, 
            dateDue: new Date("2017-12-06T23:59:59"),
            dateCreated: new Date("2017-11-01T12:00:00"),
            dateUpdated: new Date("2017-11-01T18:00:00")
        }
    ];

    tasksService.toggleComplete = function(task){
        if (task) {
            task.isComplete = !task.isComplete;
        }
    }

    tasksService.deleteTask = function(task){
        var idx = tasksService.Tasks.indexOf(task);
        var wasFound = (idx != -1);
        if (wasFound) {
            //console.log("Deleting taskID: " + task.taskID);
            tasksService.Tasks.splice(idx, 1);
        }
    }

    tasksService.findById = function(taskID){
        for (var idx in tasksService.Tasks) {
            if (tasksService.Tasks[idx].taskID === taskID) {
                return tasksService.Tasks[idx];
            }
        }
    }

    tasksService.cloneTask = function(taskToClone){
        var clonedTask = JSON.parse(JSON.stringify(taskToClone));
        restoreDates(taskToClone);
        return clonedTask;
    }

    var restoreDates = function(taskWithStringDates){
        taskWithStringDates.dateDue = new Date(taskWithStringDates.dateDue);
        taskWithStringDates.dateCreated = new Date(taskWithStringDates.dateCreated);
        taskWithStringDates.dateUpdated = new Date(taskWithStringDates.dateUpdated);
    }

    tasksService.save = function(task){
        if (task.taskID == null) {
            // TODO: Handle saving new task
        } else {
            var taskToEdit = tasksService.findById(task.taskID);
            if (taskToEdit) {
                // TODO: Set to new values
                taskToEdit.taskName = task.taskName;
            }
        }
    }
    return tasksService;
});

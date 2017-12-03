/*
*  controller.js
* 
*/

angular.module("controller", [])

// Create a (MVC) controller passing its name and array of dependencies starting with $scope
.controller("controller", ["$scope", "$routeParams", "$location", "UsersService", "ListsService", "TasksService",
    function($scope, $routeParams, $location, UsersService, ListsService, TasksService) {
    // Always create an object first and add properties/methods to it instead of $scope
    $scope.vm = {};

    $scope.vm.lists = ListsService.Lists;
    $scope.vm.tasks = TasksService.Tasks;

    if (!$routeParams || !$routeParams.listID) {
        $location.path('/list/'+ $scope.vm.lists[0].listID);
    } else {
        $scope.vm.currentList = ListsService.findById(parseInt($routeParams.listID));
        if (!$scope.vm.currentList) {
            $location.path('/');
        }
    }

    var countAndFilterTasks = function(){
        //console.log("Counting and filtering tasks.");
        if ($scope.vm.currentList) {
            $scope.vm.currentTasks = [];
            $scope.vm.taskCounts = [];
            for (var idx in $scope.vm.lists) {
                $scope.vm.taskCounts[$scope.vm.lists[idx].listID] = 0;
            }
            for (var idx in $scope.vm.tasks) {
                var task = $scope.vm.tasks[idx];
                $scope.vm.taskCounts[task.listID]++;
                if (task.listID === $scope.vm.currentList.listID) {
                    $scope.vm.currentTasks.push(task);
                }
            }
        }
    }();

    $scope.toggleComplete = function(task){
        TasksService.toggleComplete(task);
    }
    
    $scope.deleteTask = function(task){
        TasksService.deleteTask(task);
        //console.log("Removing deleted task from current tasklist and updating count.");
        var idx = $scope.vm.currentTasks.indexOf(task);
        var wasFound = (idx != -1);
        if (wasFound) {
            $scope.vm.currentTasks.splice(idx, 1);
            $scope.vm.taskCounts[task.listID]--;
        }
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
            // TODO: Handle invalid listID. Likely just need to search task list.
            //console.log("No taskID sent. Creating new task.");
            $scope.vm.task = TasksService.createTask(parseInt($routeParams.listID));
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
            $location.path("/list/"+$scope.vm.task.listID);
        }
}])
.controller("ListController", ["$scope", "$routeParams", "$location", "ListsService", 
    function($scope, $routeParams, $location, ListsService){
        $scope.vm = {};
        $scope.vm.prevListID = $routeParams.prevListID || $routeParams.listID || '';
        if (!$routeParams.listID){
            // TODO: Create new list for userID
            //console.log("No listID sent. Creating new list.");
        } else {
            var listToEdit = ListsService.findById(parseInt($routeParams.listID));
            if (listToEdit && listToEdit.userID === parseInt($routeParams.userID)) {
                //console.log("List found: Cloning for edit");
                $scope.vm.list = ListsService.cloneList(listToEdit);
            } else {
                //console.log("Invalid user or list ID. Redirecting home.");
                $location.path("/");
            }
        }
 
        $scope.save = function(){
            ListsService.save($scope.vm.list);
            $location.path("/list/" + $scope.vm.list.listID);
        }
}])
.service("UsersService", function(){
    var usersService = {};
    return usersService;
})
.service("ListsService", function(){
    var listsService = {};

    listsService.Lists = [
        {
            listID:100, userID: 10, listName:"dummy tasks", 
            dateCreated: new Date("Jan 01 2017"),
            dateUpdated: new Date("Jan 01 2017")
        },
        {
            listID:101, userID: 10, listName:"groceries",
            dateCreated: new Date("Feb 01 2017"),
            dateUpdated: new Date("Feb 01 2017")
        },
        {
            listID:102, userID: 10, listName:"chores",
            dateCreated: new Date("Mar 01 2017"),
            dateUpdated: new Date("Mar 01 2017")
        },
        {
            listID:103, userID: 10, listName:"homework",
            dateCreated: new Date("Apr 01 2017"),
            dateUpdated: new Date("Apr 01 2017")
        }
    ];

    listsService.findById = function(id) {
        for (var idx in listsService.Lists) {
            if (listsService.Lists[idx].listID === id) {
                return listsService.Lists[idx];
            }
        }
    }

    listsService.cloneList = function(listToClone){
        var clonedList = JSON.parse(JSON.stringify(listToClone));
        restoreDates(clonedList);
        return clonedList;
    }

    var restoreDates = function(listWithStringDates){
        listWithStringDates.dateCreated = new Date(listWithStringDates.dateCreated);
        listWithStringDates.dateUpdated = new Date(listWithStringDates.dateUpdated);
    }

    listsService.save = function(list){
        if (list.listID == null) {
            // TODO: Handle saving new list
        } else {
            var listToEdit = listsService.findById(list.listID);
            if (listToEdit) {
                // TODO: Set to new values
            }
        }
    }

    return listsService;
})
.service("TasksService", function(){
    var tasksService = {};
    tasksService.createTask = function(listID) {
        return {
            taskID: null, listID: listID, taskName:"", isComplete: false, 
            dateDue: new Date(),
            dateCreated: new Date(),
            dateUpdated: new Date()
        };
    }

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
        restoreDates(clonedTask);
        return clonedTask;
    }

    var restoreDates = function(taskWithStringDates){
        taskWithStringDates.dateDue = new Date(taskWithStringDates.dateDue);
        taskWithStringDates.dateCreated = new Date(taskWithStringDates.dateCreated);
        taskWithStringDates.dateUpdated = new Date(taskWithStringDates.dateUpdated);
    }

    // Client-side ID generator (temporary; for pre-server/db integration)
    var getNewID = function() {
        var maxID = function() {
            var max = -1;
            for (var idx in tasksService.Tasks) {
                if (tasksService.Tasks[idx].taskID > max) {
                    max = tasksService.Tasks[idx].taskID;
                }
            }
            return max;
        }

        if (tasksService.newID) {
            tasksService.newID++;
        } else {
            tasksService.newID = maxID() + 1;
        }

        return tasksService.newID;
    }

    tasksService.save = function(task){
        if (task.taskID == null) {
            //console.log("Saving new task.");
            task.taskID = getNewID();
            tasksService.Tasks.push(task);
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

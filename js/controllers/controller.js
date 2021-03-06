/*
*  controller.js
* 
*/

angular.module("controller", [])

// Create a (MVC) controller passing its name and array of dependencies starting with $scope
.controller("controller", ["$scope", "$routeParams", "$location", "$q", "UsersService", "ListsService", "TasksService",
    function($scope, $routeParams, $location, $q, UsersService, ListsService, TasksService) {
    // Always create an object first and add properties/methods to it instead of $scope
    $scope.vm = {};

    if (!UsersService.loggedUser) {
        $location.path('/login');
        return;
    } else {
        $scope.vm.loggedUser = UsersService.loggedUser;
    }

    //$scope.vm.lists = ListsService.Lists;
    //$scope.vm.tasks = TasksService.Tasks;

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
    };

    var init = function(){
        $scope.vm.tasks = TasksService.Tasks;
        $scope.vm.lists = ListsService.Lists;

        if ($location.url() == "/dash") {
            $scope.vm.currentTasks = [];
            var today = new Date();
            var nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7);
            for (var idx in $scope.vm.tasks) {
                var task = $scope.vm.tasks[idx];
                if (task.dateDue < nextWeek) {
                    $scope.vm.currentTasks.push(task);
                }
            }
            return;
        }

        if (!$routeParams || !$routeParams.listID) {
            //console.log("Redirecting to first list in array");
            $location.path('/list/'+ $scope.vm.lists[0].listID);
        } else {
            $scope.vm.currentList = ListsService.findById(parseInt($routeParams.listID));
            if (!$scope.vm.currentList) {
                //console.log("Could not find listID " + $routeParams.listID + ". Sending home");
                $location.path('/');
            } else {
                //console.log("ListID found: " + $scope.vm.currentList.listID);
                countAndFilterTasks();
            }
        }
    }

    // if (!ListsService.Lists) {
    //     ListsService.readLists()
    //     .then(function success(){
    //         //console.log("Succeeded in reading lists from server");
    //         init();
    //     }, function error(){
    //     //console.log("Failure");
    //     });
    // } else {
    //     console.log("Lists already in memory");
    //     init();
    // }
    // if (!TasksService.Tasks) {
    //     TasksService.readTasks()
    //     .then(function success(){
    //         console.log("Succeeded in reading tasks from server");
    //         init();
    //     }, function error(){
    //     console.log("Failure");
    //     });
    // } else {
    //     console.log("Tasks already in memory");
    //     init();
    // }
    var promises = [];
    if (!ListsService.Lists) {
        promises.push(ListsService.readLists($scope.vm.loggedUser));
    }
    if (!TasksService.Tasks) {
        promises.push(TasksService.readTasks($scope.vm.loggedUser));
    }
    $q.all(promises).then(function success(){ init(); });

    $scope.toggleComplete = function(task){
        TasksService.toggleComplete(task);
    }
    
    $scope.deleteTask = function(task){
        TasksService.deleteTask(task)
        .then(function success(){
            //console.log("Removing deleted task from current tasklist and updating count.");
            var idx = $scope.vm.currentTasks.indexOf(task);
            var wasFound = (idx != -1);
            if (wasFound) {
                $scope.vm.currentTasks.splice(idx, 1);
                $scope.vm.taskCounts[task.listID]--;
            }
        });
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

    $scope.deleteList = function(list) {
        if ($scope.vm.lists.length > 1) {
            confirm2Btn("Delete List", "Are you sure you want to delete \"" +
                list.listName.toUpperCase() + "\"?", "No", "Yes",
                function(){
                    ListsService.deleteList(list)
                    .then(function success(){
                        $location.path('/');
                    });
                });
        }
    }

    function confirm2Btn(heading, question, cancelButtonTxt, okButtonTxt, callback) {
        var confirmModal = 
          $('<div class="modal fade" tabindex="-1" role="dialog">' +    
                '<div class="modal-dialog" role="document">' +
                    '<div class="modal-content">'+
                        '<div class="modal-header">' +
                            '<a class="close" data-dismiss="modal" >&times;</a>' +
                            '<h4 class="modal-title">' + heading +'</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<p>' + question + '</p>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                            '<a href="#" class="btn btn-default" data-dismiss="modal">' + 
                                cancelButtonTxt + 
                            '</a>' +
                            '<button id="okButton" class="btn btn-primary">' + 
                                okButtonTxt + 
                            '</a>' +
                        '</div>' +
                    '</div>'+
                '</div>' +
            '</div>');

        confirmModal.find('#okButton').click(function(event) {
          callback();
          confirmModal.modal('hide');
        });

        confirmModal.modal('show');
    };

}])
.controller("TaskController", ["$scope", "$routeParams", "$location", "TasksService", 
    function($scope, $routeParams, $location, TasksService){
        $scope.vm = {};

        if (!$routeParams.taskID){
            // TODO: Handle invalid listID. Likely just need to search task list.
            //console.log("No taskID sent. Creating new task.");
            $scope.vm.task = TasksService.createTask(parseInt($routeParams.listID));
            $scope.vm.day = new Date();
            $scope.vm.time = new Date("1970-01-01T12:00:00.000");
        } else {
            var taskToEdit = TasksService.findById(parseInt($routeParams.taskID));
            if (taskToEdit && taskToEdit.listID === parseInt($routeParams.listID)) {
                //console.log("Task found: Cloning for edit");
                $scope.vm.task = TasksService.cloneTask(taskToEdit);
                $scope.vm.day = new Date($scope.vm.task.dateDue);
                $scope.vm.time = new Date($scope.vm.task.dateDue);
                $scope.vm.time.setSeconds(0);
            } else {
                //console.log("Invalid list or task ID. Redirecting home.");
                $location.path("/");
            }
        }

        $scope.save = function(){
            $scope.vm.task.dateDue = combineDateAndTime($scope.vm.day, $scope.vm.time);
            TasksService.save($scope.vm.task)
            .then(function success(){
                $location.path("/list/"+$scope.vm.task.listID);
            });
        }

        var combineDateAndTime = function(date, time) {
            var combined = new Date(date);
            combined.setHours(time.getHours());
            combined.setMinutes(time.getMinutes());
            combined.setSeconds(0);
            return combined;
        }
}])
.controller("ListController", ["$scope", "$routeParams", "$location", "ListsService", 
    function($scope, $routeParams, $location, ListsService){
        $scope.vm = {};
        $scope.vm.prevListID = $routeParams.prevListID || $routeParams.listID || '';
        if (!$routeParams.listID){
            // TODO: Handle invalid userID.
            //console.log("No listID sent. Creating new list.");
            $scope.vm.list = ListsService.createList(parseInt($routeParams.userID));
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
            ListsService.save($scope.vm.list)
            .then(function success(){
                $location.path("/list/" + $scope.vm.list.listID);
            });
        }
}])
.controller("navController", ["$scope", "$location", "UsersService", "ListsService", "TasksService",
function($scope, $location, UsersService, ListsService, TasksService){
    $scope.vm = {};
    $scope.isLoggedIn = function(){
        if (UsersService.loggedUser != null){
            $scope.vm.username = UsersService.loggedUser.userName;
            return true;
        }
        return false;
    }

    $scope.logout = function(){
        //console.log("Logging out userID: " + UsersService.loggedUser.userID);
        UsersService.loggedUser = null;
        $scope.vm.username = null;
        ListsService.Lists = null;
        TasksService.Tasks = null;
        $location.path('/login');
    }

    $scope.toggleView = function(){
        var isListview = ($location.url().indexOf('/list') != -1);
        if (isListview) {
            $location.path('/dash');
        } else {
            $location.path('/');
        }
    }
}])
.controller("LoginController", ["$scope", "$routeParams", "$location", "UsersService",
    function($scope, $routeParams, $location, UsersService){
        $scope.vm = {};
        $scope.vm.loginInfo = { identifier:"", password:"" };

        $scope.login = function(){
            /* Client-side user login
            if (UsersService.login($scope.vm.loginInfo)){
                $location.path("/");
            } else {
                $scope.vm.hasFailedLogin = true;
            }
            // */
            //* Server-side user login
            UsersService.login($scope.vm.loginInfo)
            .then(function success(){
                if (UsersService.loggedUser) {
                    $location.path("/");                    
                } else {
                    $scope.vm.hasFailedLogin = true;
                }
            });
            // */
        }
}])
.controller("RegistrationController", ["$scope", "$routeParams", "$location", "UsersService", "ListsService", "TasksService",
    function($scope, $routeParams, $location, UsersService, ListsService, TasksService){
        $scope.vm = {};
        $scope.vm.newUser = UsersService.createUser();

        $scope.save = function(){
            UsersService.save($scope.vm.newUser)
            .then(function success(){
                if (UsersService.loggedUser) {
                    // TODO: Create new list and task for new user.  ALL USERS MUST HAVE AT LEAST ONE LIST
                    var newList = ListsService.createList(UsersService.loggedUser.userID);
                    newList.listName = "My First List";
                    ListsService.save(newList)
                    .then(function success(){
                        var newTask = TasksService.createTask(newList.listID);
                        newTask.taskName = "My First Task";
                        TasksService.save(newTask)
                        .then(function success(){
                            $location.path("/");                            
                        });
                    });
                } else {
                    alert("Could not create user. Perhaps try a different username or email address.");
                }
            });
        }
}])
.service("UsersService", ["$http", function($http){
    var urlRoot = "";
    //var urlRoot = "CSC154ToDoList/";
    //var urlReadUser = urlRoot + "data/user_data.json";
    //var urlCreateUser = urlRoot + "data/user_added.json";
    var urlUpdateUser = urlRoot + "data/user_updated.json";
    var urlDeleteUser = urlRoot + "data/user_deleted.json";

    var urlReadUser = urlRoot + "php/user_read.php";
    var urlCreateUser = urlRoot + "php/user_create.php";
    // var urlUpdateUser = urlRoot + "php/user_update.php";
    // var urlDeleteUser = urlRoot + "php/user_delete.php";

    var usersService = {};

    usersService.createUser = function() {
        return {
            userID: null, userName: "", email:"", password:"",
            dateCreated: new Date(),
            dateUpdated: new Date()
        };
    }

    usersService.login = function(loginInfo){
        /* Client-side user login
        for (var idx in usersService.Users) {
            var user = usersService.Users[idx];
            if (loginInfo.password == user.password &&
                (loginInfo.identifier == user.userName || 
                 loginInfo.identifier == user.email)) {
                return user;
            }
        }
        // */
        //* Server-side user login
        return $http.post(urlReadUser, loginInfo)
        .then(function success(response){
            if (response.data.status === 1) {
                //console.log("Successful login");
                usersService.loggedUser = response.data.user;
            } else {
                //console.log("Failed login");
            }
        }, function error(response){
            //console.log("Server Failure");
            alert(response.status);
        });
        // */
    }
/*
    usersService.Users = [
        {
            userID: 10, userName:"bob", email:"bob@email", password:"pw_bob",
            dateCreated: new Date("Jan 01 2017"),
            dateUpdated: new Date("Jan 01 2017")
        },
        {
            userID: 20, userName:"jim", email:"jim@email", password:"pw_jim",
            dateCreated: new Date("Feb 01 2017"),
            dateUpdated: new Date("Feb 01 2017")
        },
        {
            userID: 30, userName:"joe", email:"joe@email", password:"pw_joe",
            dateCreated: new Date("Mar 01 2017"),
            dateUpdated: new Date("Mar 01 2017")
        }
    ];
*/
    var restoreDates = function(userWithStringDates){
        userWithStringDates.dateCreated = new Date(userWithStringDates.dateCreated);
        userWithStringDates.dateUpdated = new Date(userWithStringDates.dateUpdated);
    }
/*
    var readUsers = function(){
        $http.get(urlReadUser)
        .then(function success(response){
            usersService.Users = response.data;
            for (var idx in usersService.Users) {
                restoreDates(usersService.Users[idx]);
            }
        }, function error(response){
            alert(response.status);
        });
    }();
*/
    var getNewID = function(){
        var maxID = function(){
            var max = -1;
            for (var idx in usersService.Users){
                if (usersService.Users[idx].userID > max) {
                    max = usersService.Users[idx].userID;
                }
            }
            return max;
        }

        if (usersService.newID) {
            usersService.newID++;
        } else {
            usersService.newID = maxID() + 1;
        }

        return usersService.newID;
    }

    usersService.save = function(user){
        if (user.userID == null) {
            //console.log("Saving new user.");

            /* Client-side user creation
            user.userID = getNewID();
            usersService.Users.push(user);
            // */

            //* Server-side user creation
            // Return promise for post-creation needs
            return $http.post(urlCreateUser, user)
            .then(function success(response){
                //console.log("Success - user added on server");
                if (response.data.newId) {
                    /* Client-side user creation
                    //console.log("Pushing user to array");
                    user.userID = response.data.newId;
                    usersService.Users.push(user);
                    // */
                    //* Server-side user creation
                    user.userID = response.data.newId;
                    usersService.loggedUser = user;
                    // */
                }
            }, function error(response){
                // TODO: Handle failure to create user
                //console.log("Failure - user not added on server");
                alert(response.status);
            });
            // */
        } else {
            // TODO: Handle updating existing user
        }
    }

    return usersService;
}])
.service("ListsService", ["$http", function($http){
    var urlRoot = "";
    //var urlRoot = "CSC154ToDoList/";
    //var urlReadList = urlRoot + "data/list_data.json";
    //var urlCreateList = urlRoot + "data/list_added.json";
    //var urlUpdateList = urlRoot + "data/list_updated.json";
    //var urlDeleteList = urlRoot + "data/list_deleted.json";

    var urlReadList = urlRoot + "php/list_read.php";
    var urlCreateList = urlRoot + "php/list_create.php";
    var urlUpdateList = urlRoot + "php/list_update.php";
    var urlDeleteList = urlRoot + "php/list_delete.php";

    var listsService = {};
    listsService.createList = function(userID) {
        return {
            listID: null, userID: userID, listName:"",
            dateCreated: new Date(),
            dateUpdated: new Date()
        };
    }

    listsService.deleteList = function(list){
        var idx = listsService.Lists.indexOf(list);
        var wasFound = (idx != -1);
        if (wasFound) {
            //console.log("Deleting listID: " + list.listID);
            /* Client-side list deletion
            listsService.Lists.splice(idx, 1);
            // */

            //* Server-side list deletion
            return $http.post(urlDeleteList, list)
            .then(function success(response){
                if (response.data.status === 1) {
                    //console.log("Delete successful for listID: " + list.listID);
                    listsService.Lists.splice(idx, 1);
                } else {
                    //console.log("Delete failed");
                }
            }, function error(response){
                //console.log("Server Failure");
                alert(response.status);
            });
            // */
        }
    }
/*
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
// */
    listsService.readLists = function(user){
        return $http.post(urlReadList, user)
        .then(function success(response){
            //console.log("Lists read from server");
            if (response.data == -1) {
             alert("No lists found for user.");
             listsService.Lists = [];
             return;
            }
            listsService.Lists = response.data;
            for (var idx in listsService.Lists) {
                restoreDates(listsService.Lists[idx]);
                //console.log(listsService.Lists[idx]);
            }
        }, function error(response){
            //console.log("Server Failure");
            alert(response.status);
        });
    };

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
        var isServerTime = (listWithStringDates.dateCreated.indexOf('T') == -1);
        if (isServerTime) {
            listWithStringDates.dateCreated += ' UTC';
            listWithStringDates.dateUpdated += ' UTC';
        }
        listWithStringDates.dateCreated = new Date(listWithStringDates.dateCreated);
        listWithStringDates.dateUpdated = new Date(listWithStringDates.dateUpdated);
    }

    // Client-side ID generator (temporary; for pre-server/db integration)
    var getNewID = function() {
        var maxID = function() {
            var max = -1;
            for (var idx in listsService.Lists) {
                if (listsService.Lists[idx].listID > max) {
                    max = listsService.Lists[idx].listID;
                }
            }
            return max;
        }

        if (listsService.newID) {
            listsService.newID++;
        } else {
            listsService.newID = maxID() + 1;
        }

        return listsService.newID;
    }

    listsService.save = function(list){
        if (list.listID == null) {
            //console.log("Saving new list.");
            /* Client-side list creation
            list.listID = getNewID();
            listsService.Lists.push(list);
            // */
            //* Server-side list creation
            return $http.post(urlCreateList, list)
            .then(function success(response){
                if (response.data.status == 0) {
                 alert("Unable to add list");
                 return;
                }
                if (response.data.newId) {
                    //console.log("Successful list creation");
                    list.listID = response.data.newId;
                    if (!listsService.Lists) {
                        listsService.Lists = [];
                    }
                    listsService.Lists.push(list);
                } else {
                    //console.log("Failed to create new list");
                }
            }, function error(response){
                //console.log("Server Failure");
                alert(response.status);
            });
            // */
        } else {
            var listToEdit = listsService.findById(list.listID);
            /* Client-side list update
            if (listToEdit) {
                listToEdit.listName = list.listName;
            }
            // */
            //* Server-side list update
            if (listToEdit) {
                return $http.post(urlUpdateList, list)
                .then(function success(response){
                    if (response.data.status === 1) {
                        //console.log("Successful list update");
                        var idx = listsService.Lists.indexOf(listToEdit);
                        var wasFound = (idx != -1);
                        if (wasFound) {
                            listsService.Lists.splice(idx, 1, list);
                        }
                    } else {
                        //console.log("Failed to update list");
                    }
                }, function error(response){
                    //console.log("Server Failure");
                    alert(response.status);
                });
            }
            // */
        }
    }

    return listsService;
}])
.service("TasksService", ["$http", function($http){
    var urlRoot = "";
    //var urlRoot = "CSC154ToDoList/";
    //var urlReadTask = urlRoot + "data/task_data.json";
    //var urlCreateTask = urlRoot + "data/task_added.json";
    //var urlUpdateTask = urlRoot + "data/task_updated.json";
    //var urlDeleteTask = urlRoot + "data/task_deleted.json";

    var urlReadTask = urlRoot + "php/task_read.php";
    var urlCreateTask = urlRoot + "php/task_create.php";
    var urlUpdateTask = urlRoot + "php/task_update.php";
    var urlDeleteTask = urlRoot + "php/task_delete.php";

    var tasksService = {};
    tasksService.createTask = function(listID) {
        return {
            taskID: null, listID: listID, taskName:"", isComplete: false, 
            dateDue: new Date(),
            dateCreated: new Date(),
            dateUpdated: new Date()
        };
    }
/*
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
// */
    tasksService.readTasks = function(user){
        return $http.post(urlReadTask, user)
        .then(function success(response){
            //console.log("Tasks read from server");
            if (response.data == -1) {
             //console.log("No tasks found for user.");
             tasksService.Tasks = [];
             return;
            }
            tasksService.Tasks = response.data;
            for (var idx in tasksService.Tasks) {
                restoreDates(tasksService.Tasks[idx]);
                //console.log(tasksService.Tasks[idx]);
            }
        }, function error(response){
            //console.log("Server Failure");
            alert(response.status);
        });
    };

    tasksService.toggleComplete = function(task){
        if (task) {
            task.isComplete = !task.isComplete;
            tasksService.save(task);
        }
    }

    tasksService.deleteTask = function(task){
        var idx = tasksService.Tasks.indexOf(task);
        var wasFound = (idx != -1);
        if (wasFound) {
            //console.log("Deleting taskID: " + task.taskID);
            /* Client-side task deletion
            tasksService.Tasks.splice(idx, 1);
            // */

            //* Server-side task deletion
            return $http.post(urlDeleteTask, task)
            .then(function success(response){
                if (response.data.status === 1) {
                    //console.log("Delete successful for taskID: " + task.taskID);
                    tasksService.Tasks.splice(idx, 1);
                } else {
                    //console.log("Failed to delete task");
                }
            }, function error(response){
                //console.log("Server Failure");
                alert(response.status);
            });
            // */
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
        var isServerTime = (taskWithStringDates.dateCreated.indexOf('T') == -1);
        if (isServerTime) {
            taskWithStringDates.dateDue += ' UTC';
            taskWithStringDates.dateCreated += ' UTC';
            taskWithStringDates.dateUpdated += ' UTC';
        }
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
            /* Client-side task creation
            task.taskID = getNewID();
            tasksService.Tasks.push(task);
            // */
            //* Server-side task creation
            return $http.post(urlCreateTask, task)
            .then(function success(response){
                if (response.data.status == 0) {
                 alert("Unable to add task");
                 return;
                }
                if (response.data.newId) {
                    //console.log("Successful task creation");
                    task.taskID = response.data.newId;
                    if (!tasksService.Tasks) {
                        tasksService.Tasks = [];
                    }
                    tasksService.Tasks.push(task);
                } else {
                    //console.log("Failed to create task");
                }
            }, function error(response){
                //console.log("Server Failure");
                alert(response.status);
            });
            // */
         } else {
            var taskToEdit = tasksService.findById(task.taskID);
            /* Client-side task update
            if (taskToEdit) {
                taskToEdit.taskName = task.taskName;
                taskToEdit.dateDue = task.dateDue;
            }
            // */
            //* Server-side task update
            if (taskToEdit) {
                return $http.post(urlUpdateTask, task)
                .then(function success(response){
                    if (response.data.status === 1) {
                        //console.log("Successful task update");
                        var idx = tasksService.Tasks.indexOf(taskToEdit);
                        var wasFound = (idx != -1);
                        if (wasFound) {
                            tasksService.Tasks.splice(idx, 1, task);
                        }
                    } else {
                        //console.log("Failed to update task");
                    }
                }, function error(response){
                    //console.log("Server Failure");
                    alert(response.status);
                });
            }
            // */
        }
    }
    return tasksService;
}])
.directive('autofocus', ['$timeout', function($timeout) {
    // Taken from https://gist.github.com/mlynch/dd407b93ed288d499778
    // MIT license
    return {
        restrict: 'A',
        link : function($scope, $element) {
            $timeout(function() {
                $element[0].focus();
            });
        }
    }
}]);

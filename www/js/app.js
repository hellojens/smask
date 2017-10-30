// Ionic Starter App

var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

angular.module('starter', [
  'ionic',
  'ionic.cloud',
  'starter.controllers',
  'ngCordova',
  'ngStorage',
  'angular.filter',
  'underscore',
  'ionic-native-transitions',
  'ngAnimate',
  'toastr',
])
.run(function($ionicPlatform, $state, $rootScope) {
  $rootScope.$state = $state;
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.overlaysWebView(true);
    }

  });
})
.factory('playerService', function ($localStorage) {

  $localStorage = $localStorage.$default({
    gameplayers: []
  });

  var _getAll = function () {
    return $localStorage.gameplayers;
  };

  var _add = function (player) {
    $localStorage.gameplayers.push(player);
  }

  var _remove = function (player) {
    $localStorage.gameplayers.splice($localStorage.gameplayers.indexOf(player), 1);
  }

  return {
    getAll: _getAll,
    add: _add,
    remove: _remove
  };
})
.factory('playThroughService', function ($localStorage) {

  $localStorage = $localStorage.$default({
    playThrough: []
  });

  var _getAll = function () {
    return $localStorage.playThrough;
  };

  var _add = function (playedSets) {
    $localStorage.playThrough.push(playedSets);
  }

  var _remove = function (playedSets) {
    $localStorage.playThrough.splice($localStorage.playThrough.indexOf(playedSets), 1);
  }

  return {
    getAll: _getAll,
    add: _add,
    remove: _remove
  };
})
.directive('something', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
            });
        }
    };
}])
.config(function($stateProvider, $urlRouterProvider, $ionicCloudProvider, $ionicNativeTransitionsProvider, toastrConfig) {
  // $ionicNativeTransitionsProvider.setDefaultTransition({
  //     type: 'slide',
  //     direction: 'left'
  // })

  angular.extend(toastrConfig, {
    autoDismiss: false,
    containerId: 'toast-container',
    maxOpened: 1,
    newestOnTop: true,
    positionClass: 'toast-bottom-center',
    preventDuplicates: false,
    preventOpenDuplicates: false,
    allowHtml: true,
    closeButton: false,
    messageClass: 'toast-message',
    progressBar: false,
    tapToDismiss: true,
    templates: {
	  toast: 'directives/toast/toast.html',
	  progressbar: 'directives/progressbar/progressbar.html'
	},
    timeOut: 500000,
    titleClass: 'toast-title',
    toastClass: 'toast'
  });

  $ionicCloudProvider.init({
    "core": {
      "app_id": "2b66832a"
    }
  })

  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.iap', {
    url: '/iap',
    views: {
      'menuContent': {
        templateUrl: 'templates/iap-test.html',
        controller: 'AppCtrl'
      }
    }
  })
  .state('app.intro', {
    url: '/intro',
    views: {
      'menuContent': {
        templateUrl: 'templates/intro.html',
        controller: 'IntroCtrl'
      }
    }
  })
  .state('app.collections', {
    url: '/collections',
    views: {
      'menuContent': {
        templateUrl: 'templates/collections.html',
        controller: 'CollectionsCtrl'
      }
    }
  })
  .state('app.categories', {
    url: '/categories',
    params: {
      categoriesInCollection: null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/categories.html',
        controller: 'CategoriesCtrl'
      }
    }
  })
  .state('app.gameboard', {
    url: '/gameboard',
    params: {
      startGameData: null
    },
    nativeTransitions: {
        "type": "slide",
        "direction": "up"
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/gameboard.html',
        controller: 'GameBoardCtrl'
      }
    }
  })
  .state('app.question', {
    cache: false,
    url: '/categories/gameboard/:questionId',
    params: {
      questionData: null,
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/questions.html',
        controller: 'QuestionsCtrl'
      }
    }
  })
  .state('app.blob', {
    cache: false,
    url: '/blob',
    views: {
      'menuContent': {
        templateUrl: 'templates/blob.html',
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/intro');
});

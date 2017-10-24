angular.module('starter.controllers', ['ngCordova','ngStorage', 'ionic-native-transitions', 'ngAnimate', 'toastr'])

.controller('AppCtrl', function($scope, $http, $stateParams, $state, $ionicModal, $timeout, $http, $filter, $ionicSlideBoxDelegate, playerService, playThroughService, $ionicHistory, $ionicNativeTransitions, toastr, $ionicPlatform) {
  $http.defaults.headers.common['Authorization'] = "Bearer " + 'keynHfCb7Qp6svdyV';
  $scope.baseUrl = 'https://api.airtable.com/v0/app04N9yQPQZLwC8T';
  $ionicNativeTransitions.enable(true);

  $scope.closeModal = function() {
    $('.category-view').removeClass('slideUp');
    $('.category-view').addClass('slideDown');
    $timeout(function () {
      $scope.modal.hide();
      $('.category-view').removeClass('slideDown');
    }, 300);
  };

  // Player management
  $scope.players = playerService.getAll();
  $scope.addNewPlayer = function (addPlayer) {
    playerService.add({
      playerId: Date.now(),
      name: addPlayer,
      points: 0,
      totalWins: 0
    });
  };

  // Update player points
  $scope.backToScoreBoard = function(player) {
    $ionicHistory.goBack();
    toastr.info('<b>' + player.name + '</b> skal vælge næste spørgsmål', {
      iconClass: 'toast-info choose-question'
    });
  };
  $scope.updatePlayerPoints = function (player, points) {
    player.points = (player.points + points)
    toastr.info('<b>Send telefonen til venstre...</b>', {
      iconClass: 'toast-info send-left',
      onTap: function() {
        $scope.backToScoreBoard(player)
      }
    });
  };
  $scope.resetPlayer = function (player) {
    player.points = 0
    player.totalWins = 0
  };
  // Remove player
  $scope.remove = function (player) {
    playerService.remove(player);
  };

  // Reorder player list
  $scope.moveItem = function(item, fromIndex, toIndex) {
    $scope.players.splice(fromIndex, 1);
    $scope.players.splice(toIndex, 0, item);
  };
  $scope.onItemDelete = function(item) {
    $scope.players.splice($scope.items.indexOf(item), 1);
  };

  // Player Modal Controls
  $scope.openPlayerModal = function() {
    $ionicModal.fromTemplateUrl('./templates/players.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.selected = null
  $scope.select = function(index) {
    console.log(index)
    $scope.selected = index;
    $timeout(function(){
      $scope.selected = null;
    }, 1000);
  };

  // Select game categories
  $scope.selectedCategories = []
  $scope.selectCategorie = function (cats, index) {
    if($scope.selectedCategories.indexOf(cats, index) !== -1) {
      $scope.selectedCategories.splice($scope.selectedCategories.indexOf(cats, index), 1);
    } else {
      $scope.selectedCategories.push(cats)
    }
    $scope.startGameCategories = $scope.selectedCategories
  }

  $scope.playThroughValue = 0

  $scope.gameStarted = false

  // Restart game
  $scope.startOver = function(players, index) {
    // Add Total Wins to winner
    var winner = _.max(players, function(pl){ return pl.points; });
    var index = $scope.players.indexOf(winner);
    if (index !== -1) {
      $scope.players[index].totalWins = $scope.players[index].totalWins + 1;
    }
    // Display Winner and go to collections
    $scope.openScoreBoard()
    $scope.gameStarted = false

    // angular.forEach(recordData.id, function(sets, index){
    //   console.log(sets)
    //
    //   _.findWhere($scope.PlayThroughs, {setId: sets});
    // })

    // PlayThrough management

    // Select Next Question Set
    // if($scope.playThroughValue == 4)
    //   $scope.playThroughValue = 0;
    // else {
    //   $scope.playThroughValue += 1;
    // }

    $scope.updatePlayerPoints = function (player, points) {
      player.points = (player.points + points)
      // $ionicHistory.goBack();
    };

    angular.forEach($scope.selectedCategories, function(eachCategory, index){
      eachCategory.played = false
      eachCategory.progress = eachCategory.progress += 1

      // $scope.alreadyExist = _.findWhere(playThroughService.getAll(), {categoryId: eachCategory.categoryTitle});
      // if($scope.alreadyExist == undefined) {
      //   playThroughService.add({
      //     categoryId: eachCategory.categoryTitle,
      //     progress: eachCategory.progress
      //   });
      // } else {
      //   console.log(playedSets.progress)
      // }


    });

    console.log('service:', playThroughService.getAll())
    console.log($scope.selectedCategories)

    $scope.selectedCategories = []

  }
  // Play again button on scoreBoard
  $scope.plagAgain = function() {
    $state.go('app.collections',{cache: false})
    // $ionicNativeTransitions.stateGo('app.collections', {}, {}, {
    //     "type": "slide",
    //     "direction": "left", // 'left|right|up|down', default 'left' (which is like 'next')
    // });
  }

  // Score Board Modal
  $scope.openScoreBoard = function() {
    $ionicModal.fromTemplateUrl('./templates/scoreBoard.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.categoryDetails = []
  // View Category
  $scope.openViewCategorie = function(data) {
    $scope.categoryDetails = data
    $ionicModal.fromTemplateUrl('./templates/category-view.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.skipIntro = function() {
    app.collections

  }

  // Start Game
  $scope.startGame = function(startRecordIds) {
    if($scope.players.length < 1) {
      $timeout(function() {
        $('.openInGamMenuButton').trigger('click');
      });
    } else {
      $scope.gameStarted = true
      angular.forEach($scope.players, function(eachPlayer, eachPlayerIndex){
        $scope.players[eachPlayerIndex].points = 0
      })
      $ionicHistory.clearCache().then(function(){
        $state.go('app.gameboard', {startGameData: $scope.startGameCategories});
      });
      // Shuffle who starts
      $scope.shufflePlayers = _.sample($scope.players);
      $scope.shufflePlayersAgain = function() {
        $scope.newShuffle = _.sample($scope.players)
        if($scope.newShuffle.name == $scope.shufflePlayers.name) {
          console.log("SAME SHIT")
          // $scope.newShuffleAgain = _.sample($scope.players)
          $scope.whoStarts = _.sample($scope.players)
        } else {
          console.log("not - -- SAME SHIT")
          $scope.whoStarts = $scope.shufflePlayers.name
        }
      }
      toastr.info('<b>' + $scope.shufflePlayers.name + '</b> starter som oplæser, og skal have telefonen.', {
        iconClass: 'toast-info',
        onTap: function() {
          $scope.shufflePlayersAgain()
          toastr.info('<b>' + $scope.whoStarts.name + '</b> skal vælge første spørgsmål.', {
            iconClass: 'toast-info choose-question',
          });
        }
      });
      $scope.displayInGameMenu = true
    }
  }

})


.controller('IntroCtrl', ['$scope', '$state', '$timeout', '$ionicSlideBoxDelegate', '$ionicGesture', '$ionicModal', function($scope, $state, $timeout, $ionicSlideBoxDelegate, $ionicGesture, $ionicModal){


  // for default isLastSlide value to set to false
  $scope.$on("$ionicView.enter", function(event, data){
     // handle event
    $scope.firstSlide = true; // for screen 7
     $scope.isLastSlide = false; // for screen 8
  });

  $scope.cardDestroyed = function(index) {
    $scope.cards.active.splice(index, 1);
  };

  $scope.addCard = function() {
    var newCard = cardTypes[0];
    $scope.cards.active.push(angular.extend({}, newCard));
  }

  $scope.refreshCards = function() {
    // Set $scope.cards to null so that directive reloads
    $scope.cards.active = null;
    $timeout(function() {
      $scope.cards.active = Array.prototype.slice.call($scope.cards.master, 0);

    });
  }

  $scope.$on('removeCard', function(event, element, card) {
    var discarded = $scope.cards.master.splice($scope.cards.master.indexOf(card), 1);
    console.log(card);
    $scope.cards.discards.push(discarded);
  });

  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    var card = $scope.cards.active[index];
    console.log(card);
    //$scope.cards.disliked.push(card);
  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    var card = $scope.cards.active[index];
     console.log(card);
    //$scope.cards.liked.push(card);
  };

  $scope.refreshAndGo = function(){
    $state.go('app');
    $scope.refreshCards();
  }

  $scope.options = {
    loop: true,
    effect: 'fade',
    speed: 200,
  }

  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    // data.slider is the instance of Swiper
    $scope.slider = data.slider;
  });

  $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
    console.log('Slide change is beginning');
  });

  $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
    // note: the indexes are 0-based
    $scope.activeIndex = data.activeIndex;
    $scope.previousIndex = data.previousIndex;
  });
  var slide = angular.element(document.querySelector('#slide'));


}])

.controller('CollectionsCtrl', function($scope, $timeout, $ionicSlideBoxDelegate, $http, $stateParams, $state, $ionicHistory, playThroughService) {
  $scope.displaySlider = true

  $scope.groups = []
  $scope.collections = []
  $scope.collectionsReady = true

  $http.get($scope.baseUrl + '/groups' + '?&view=Grid%20view'
  ).then( function(groups) {
    angular.forEach(groups.data.records, function(data, groupsIndex){
      $scope.groups.push({
        name: data.fields.Name,
        description: data.fields.description,
        color: data.fields.color,
        included_collections: []
      })
      angular.forEach(data.fields.collection_id, function(data, collectionsIndex){
        $http.get($scope.baseUrl + '/collections' + '?&filterByFormula=(id="'+ data +'")&view=Grid%20view'
        ).then( function(collections) {
          angular.forEach(collections.data.records, function(data){
            // Collection Start Random Bacground Color
            $scope.randomColor = Math.floor(Math.random()*16777215).toString(16);
            $scope.groups[groupsIndex].included_collections.push({
              id: data.id,
              name: data.fields.Name,
              description: data.fields.description,
              icon: data.fields.icon[0].url,
              randomColor: $scope.randomColor,
              included_categories: []
            })
            angular.forEach(data.fields.included_categories, function(data,i){
              $http.get($scope.baseUrl + '/categories' + '?&filterByFormula=(categorie_id="'+ data +'")&view=Grid%20view'
              ).then( function(resp) {
                // $scope.categoryData = resp.data.records[0].fields
                $scope.categoryDataSets = resp.data.records[0].fields.Sets

                // $scope.findProgress = _.findWhere(playThroughService.getAll(), {categoryId: resp.data.records[0].fields.Name});
                // if($scope.findProgress == undefined) {
                //   $scope.getProgress = 0
                // } else {
                //   $scope.getProgress = $scope.findProgress.progress
                // }
                console.log(resp.data.records[0].fields)
                $scope.groups[groupsIndex].included_collections[collectionsIndex].included_categories.push({
                  id: $scope.categoryDataSets,
                  categoryTitle: resp.data.records[0].fields.Name,
                  description: resp.data.records[0].fields.description,
                  cover_image: resp.data.records[0].fields.cover_image[0].thumbnails.large.url,
                  icon: resp.data.records[0].fields.icon[0].thumbnails.small.url,
                  progress: 0
                });
                $scope.collectionsReady = true
              })
            });
          });
        });
      });
      console.log($scope.groups)
    });
    // ionic Sliders
    $scope.sliderDelegate = null
    $scope.collectionsSliderSettings = {
      slidesPerView: 2,
      slidesToShow: 2,
      centeredSlides: false,
      pagination: false,
      spaceBetween: 10,
      initialSlide: 0,
      slidesOffsetAfter: 20,
      slidesOffsetBefore: 20,
    }
    $scope.collectionsSliderSettingsOnlyOne = {
      slidesPerView: 1,
      slidesToShow: 2,
      draggable: false,
      touchMove: false,
      centeredSlides: true,
      pagination: false,
      spaceBetween: 10,
      initialSlide: 0,
      slidesOffsetAfter: 20,
      slidesOffsetBefore: 20
    }
    $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
      $scope.slider = data.slider;
    });

  });

  $scope.selectCollection = function (selectedCollectionData) {
    $state.go('app.categories', {categoriesInCollection: selectedCollectionData });
  }

  $scope.$on('$ionicView.afterEnter', function (event) {
    if($scope.players.length < 1) {
      $timeout(function() {
        $('.openInGamMenuButton').trigger('click');
      });
    }
  });

})
.controller('CategoriesCtrl', function($scope, $http, $stateParams, $state) {

  $scope.categories = $state.params.categoriesInCollection

})

.controller('GameBoardCtrl', function($scope, $http, $timeout, $state, $stateParams, $ionicHistory, playThroughService, toastr) {

  $scope.setRecordData = $state.params.startGameData
  $scope.selectedGameboard = []
  $scope.questionsLoaded = false

  angular.forEach($scope.setRecordData, function(recordData, index){

    // Random category - NOT IN USE
    // $scope.randomSet = recordData.id[Math.floor(Math.random() * recordData.id.length)];
    // $scope.shuffledSetList = _.shuffle(recordData.id)

    $http.get($scope.baseUrl + '/questions' + '?&filterByFormula=(set_id="'+ recordData.id[recordData.progress] +'")&view=Grid%20view'
    ).then( function(resp) {
      angular.forEach(resp.data.records, function(questionData, index){
        $scope.selectedGameboard.push({
          name: recordData.categoryTitle,
          categoryImage: recordData.cover_image,
          points: questionData.fields.Points,
          id: questionData.fields.Name,
          played: false
        })
      });
      $scope.questionsLoaded = true
    });
  });

  // Watch when all Questions has been played
  $scope.$on('$ionicView.enter', function() {
    var checkIfAnyFalse = _.findWhere($scope.selectedGameboard, {played: false});
    if($scope.questionsLoaded == true && checkIfAnyFalse == undefined) {
      $scope.startOver();
    }
  })

  $scope.selectQuestion = function(selectedQuestion) {
    if(selectedQuestion.played != true) {
      $state.go('app.question', {questionData: selectedQuestion });
    }
    selectedQuestion.played = true
    // toastr.clear();
  }

})

.controller('QuestionsCtrl', function($scope, $http, $state, $stateParams) {
  $scope.theQuestionData = $state.params.questionData
  $scope.questions = []
  if($scope.theQuestionData != null) {
    $http.get($scope.baseUrl + '/questions' + '?&filterByFormula=(Name="'+ $scope.theQuestionData.id +'")'
    ).then( function(resp) {
      angular.forEach(resp.data.records, function(data, index){
        $scope.questions.push({
          name: $scope.theQuestionData.name,
          points: data.fields.Points,
          question: data.fields.Question,
          hint: data.fields.hint,
          answer: data.fields.Answer,
        })
      });
    });
  }

  $scope.displayAnswerState = false
  $scope.$on('$ionicView.beforeEnter', function (event) {
    $scope.showAnswer = function() {
      $scope.displayAnswerState = true
    }
  });
  $scope.$on('$ionicView.beforeLeave', function (event) {
    $scope.displayAnswerState = false
  });

});

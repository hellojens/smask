angular.module('starter.controllers', ['ngCordova','ngStorage', 'ionic-native-transitions', 'ngAnimate', 'toastr', 'ngCordova.plugins.nativeStorage'])

.controller('AppCtrl', function($ionicPlatform, $scope, $cordovaNativeStorage, $http, $stateParams, $state, $ionicModal, $timeout, $http, $filter, $ionicSlideBoxDelegate, playerService, $ionicHistory, $ionicNativeTransitions, toastr, $ionicPlatform, $q, $ionicLoading, $ionicPopup) {
  $http.defaults.headers.common['Authorization'] = "Bearer " + 'keynHfCb7Qp6svdyV';
  $scope.baseUrl = 'https://api.airtable.com/v0/app04N9yQPQZLwC8T';
  $ionicNativeTransitions.enable(false);
  


  // IAP SETTINGS
  // Items for Sale: External App Store Ref
  var productIds = [
    'free_product',
    'unlock',
    'iap_hot_collection_v1.4',
    'iap_underholdning_v1',
    'iap_personlig_collection_v1',
    'iap_mime_collection_v1',
    'iap_forklare_dette_collection_v1',
    'iap_nynne_collection_v1',
    'iap_tegne_collection_v1'
  ];
  // Items for Sale: Internal Aittable ref
  $scope.productList = [
    'free_product',
    'unlock',
    'iap_hot_collection_v1.4',
    'iap_underholdning_v1',
    'iap_personlig_collection_v1',
    'iap_mime_collection_v1',
    'iap_forklare_dette_collection_v1',
    'iap_nynne_collection_v1',
    'iap_tegne_collection_v1'
  ];

  // Items already purchased
  $scope.restoreCollectionList = []

  
  var spinner = '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';

  $scope.restoreCollections = function () {
    inAppPurchase
      .restorePurchases()
      .then(function (purchases) {
        // console.log(JSON.stringify(purchases));
        angular.forEach(purchases, function(data) {
          $scope.restoreCollectionList.push(data.productId)
          console.log(data)
        })
      })
      .catch(function (err) {
        console.log(err);
        alert(err)
        $ionicPopup.alert({
          title: 'Something went wrong',
          template: 'Check your console log for the error details'
        });
      });
  };

  $scope.loadProducts = function () {
    inAppPurchase
      .getProducts(productIds)
      .then(function (products) {
        console.log("procuts" + products)
        $scope.products = products;
        $scope.restoreCollections()

      })
      .catch(function (err) {
        console.log(err);
      });
  };
  $scope.buy = function (productId) {
    console.log(productId)
    // var productIdConverted =  "'" + productId + "'"
    // console.log(productIdConverted)
    if(window.cordova && productId != undefined) {
      $ionicLoading.show({ template: spinner + 'Purchasing...' });
      inAppPurchase
        .buy(productId)
        .then(function (data) {
          console.log(JSON.stringify(data));
          console.log('consuming transactionId: ' + data.transactionId);
          return inAppPurchase.consume(data.type, data.receipt, data.signature);
        })
        .then(function () {
          var alertPopup = $ionicPopup.alert({
            title: 'Purchase was successful!',
            template: 'Check your console log for the transaction data'
          });
          alert("Purchase was successful!");
          console.log('consume done!');
          $ionicLoading.hide();
        })
        .catch(function (err) {
          $ionicLoading.hide();
          console.log("ERROER" + err.data);
          alert("Something went wrong" + err)
          $ionicPopup.alert({
            title: 'Something went wrong' + err,
            template: 'Check your console log for the error details'
          });
        });
    }
  };


  $scope.closeModal = function() {
    $scope.modal.remove()
    .then(function() {
      $scope.modal = null;
    });
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

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
    // toastr.info('<b>' + player.name + '</b> skal vælge næste spørgsmål', {
    //   iconClass: 'toast-info choose-question'
    // });
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

    angular.forEach($scope.selectedCategories, function(eachCategory, index){
      eachCategory.played = false

      if(eachCategory.progress == 4) {
        var updatedProgress = 0
      } else {
        var updatedProgress = eachCategory.progress += 1
      }

      $ionicPlatform.ready(function () {
        $cordovaNativeStorage.setItem(eachCategory.categoryTitle, updatedProgress).then(function (value) {
          console.log(value);
        });
      })

      // $scope.alreadyExist = _.findWhere(playThroughService.getAll(), {categoryId: eachCategory.categoryTitle});
      // if($scope.alreadyExist == undefined) {
      //   playThroughService.add({
      //     categoryId: eachCategory.categoryTitle,
      //     progress: eachCategory.progress
      //   });
      // } else {
      //   console.log(playedSets)
      //   console.log("Already thehere ")
      // }

    });


    console.log($scope.selectedCategories)

    $scope.selectedCategories = []

  }

  // Show intro from in game
  $scope.showIntroInGame = function() {
    $ionicModal.fromTemplateUrl('./templates/rules.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  // Play again button on scoreBoard
  $scope.plagAgain = function() {
    $state.go('app.collections',{cache: false})
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


  $scope.skipIntro = function() {
    $state.go('app.collections');
    $ionicPlatform.ready(function () {
      $cordovaNativeStorage.setItem("skip-intro", true)
    });
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
      toastr.info('<b>' + $scope.shufflePlayers.name + '</b> starter som oplæser, og skal have telefonen.', {
        iconClass: 'toast-info',
        onTap: function() {
          toastr.info('<b>' + $scope.shufflePlayers.name + '</b> skal vælge første spørgsmål.', {
            iconClass: 'toast-info choose-question',
          });
        }
      });
      $scope.displayInGameMenu = true
    }
  }

})


.controller('IntroCtrl', ['$scope', '$ionicPlatform', '$cordovaNativeStorage', '$state', '$timeout', '$ionicSlideBoxDelegate', '$ionicGesture', '$ionicModal', function($scope, $ionicPlatform, $cordovaNativeStorage, $state, $timeout, $ionicSlideBoxDelegate, $ionicGesture, $ionicModal){

  $scope.introSlideChange = function(index) {
    $scope.slideIndex = index;
  };

  // If intro skipped
  $ionicPlatform.ready(function () {
    $cordovaNativeStorage.getItem("skip-intro").then(function(value) {
      if(value == true) {
        $state.go('app.collections');
      }
    });
  });
  

}])

.controller('CollectionsCtrl', function($scope, $ionicModal, $ionicPlatform, $timeout, $cordovaNativeStorage, $ionicSlideBoxDelegate, $http, $stateParams, $state, $ionicHistory, $q, $ionicSlideBoxDelegate) {
  $scope.displaySlider = true

  // $scope.openCollectionView = function(selectedCollectionData) {
  //   $scope.collectionDetails = selectedCollectionData
  //   $ionicModal.fromTemplateUrl('./templates/collection-view.html', {
  //     scope: $scope,
  //     animation: 'slide-in-up'
  //   }).then(function(modal) {
  //     $scope.modal = modal;
  //     $scope.modal.show();
  //   });

  // };

  $scope.groups = []
  $scope.collectionsReady = false

  $scope.loadCollections = function() {
  
    $http.get($scope.baseUrl + '/groups' + '?&view=Grid%20view'
    ).then( function(groups) {
      angular.forEach(groups.data.records, function(data, groupsIndex){
        $scope.groups.push({
          name: data.fields.Name,
          description: data.fields.description,
          color: data.fields.color,
          included_collections: data.fields.inclueded_collections_id,
        })
      })
    }).finally(function() {
      $scope.loadingCollections = true
      $scope.collections = []
      $scope.categories = []

      var itemsProcessed = 0;

      angular.forEach($scope.groups, function(g) {
        angular.forEach(g.included_collections, function(included_ids, indsssI, array) {
          $http.get($scope.baseUrl + '/collections' + '?&filterByFormula=(id="'+ included_ids +'")&view=Grid%20view'
          ).then( function(collections) {
            angular.forEach(collections.data.records, function(data, collectionIndex){
              if(data.fields.hasOwnProperty('icon')) {
                var validCollecionIconUrl = data.fields.icon[0].thumbnails.large.url
              } else {
                var validCollecionIconUrl = ''
              }
              $scope.collections.push({
                date: data.createdTime,
                id: data.id,
                name: data.fields.Name,
                order: data.fields.order,
                description: data.fields.description,
                icon: validCollecionIconUrl,
                included_categories: data.fields.included_categories,
                isLocked: data.fields.locked,
                iapId: data.fields.iap_id,
                price: data.fields.price,
                hidden: data.fields.show,
              })
            })
          }).finally(function() {
            itemsProcessed++;
            if(itemsProcessed === array.length) {
              $scope.getCategories($scope.collections)
              // Check if user already purchased a collection
              console.log("Feed done")            
              if (window.cordova) {
                $scope.loadProducts()
                console.log("Feed done cordova")            
                
              }
            }
          })
        })
      });

      $scope.getCategories = function(collectionsData) {
        $http.get($scope.baseUrl + '/categories').then( function(resp) {
          angular.forEach(resp.data.records, function(data, i, array2) {
            if(data.fields.hasOwnProperty('Name')) {
              if(data.fields.hasOwnProperty('cover_image')) {
                var validCoverImage = data.fields.cover_image[0].thumbnails.large.url
              } else {
                var validCoverImage = ''
              }
              if(data.fields.hasOwnProperty('icon')) {
                var validIconUrl = data.fields.icon[0].thumbnails.small.url
              } else {
                var validIconUrl = ''
              }
              var formatCollectionId = data.fields.collection_id
              var categoryDataSets = data.fields.Sets
              $ionicPlatform.ready(function () {
                $cordovaNativeStorage.getItem(data.fields.Name).then(function (progressValue) {
                  $scope.categories.push({
                    publishedAt: data.createdTime,
                    id: categoryDataSets,
                    collectionId: formatCollectionId,
                    categoryTitle: data.fields.Name,
                    description: data.fields.description,
                    cover_image: validCoverImage,
                    icon: validIconUrl, 
                    progress: progressValue
                  })
                }, function (error) {
                  $scope.categories.push({
                    publishedAt: data.createdTime,
                    id: categoryDataSets,
                    collectionId: formatCollectionId,
                    categoryTitle: data.fields.Name,
                    description: data.fields.description,
                    cover_image: validCoverImage,
                    icon: validIconUrl, 
                    progress: 0
                  })
                });
              });

            }
          })
        }).finally(function() {
          $timeout(function() {
            $scope.collectionsReady = true
          }, 1000);
        })
      }

    });

  }

  $scope.loadCollections()

  $timeout(function() {
    if($scope.collectionsReady != true) {
      $scope.loadCollections()
    }
  }, 8000);





    // angular.forEach($scope.collections, function(data,i){
    //   console.log(data)
    //
    //   $http.get($scope.baseUrl + '/categories' + '?&filterByFormula=(categorie_id="'+ data.id +'")&view=Grid%20view'
    //   ).then( function(resp) {
    //
    //     $scope.categoryDataSets = resp.data.records[0].fields.Sets
    //
    //     console.log(resp.data.records[0].fields)
    //     $scope.groups[groupsIndex].included_collections[collectionsIndex].included_categories.push({
    //       id: $scope.categoryDataSets,
    //       categoryTitle: resp.data.records[0].fields.Name,
    //       description: resp.data.records[0].fields.description,
    //       cover_image: resp.data.records[0].fields.cover_image[0].thumbnails.large.url,
    //       icon: resp.data.records[0].fields.icon[0].thumbnails.small.url,
    //       progress: 0
    //     });
    //     $scope.collectionsReady = true
    //   })
    // });

    // var allGroups = $scope.groups
    // angular.forEach(allGroups, function(data2, collectionsIndex){
    //
    //   console.log(collectionsIndex)
    //   angular.forEach(groups, function(inclId){
    //
    //     console.log(inclId)
    //     $http.get($scope.baseUrl + '/collections' + '?&filterByFormula=(id="'+ data.id +'")&view=Grid%20view'
    //     ).then( function(collections) {
    //       angular.forEach(collections.data.records, function(data){
    //         // Collection Start Random Bacground Color
    //         $scope.randomColor = Math.floor(Math.random()*16777215).toString(16);
    //         $scope.groups[groupsIndex].included_collections.push({
    //           id: data.id,
    //           name: data.fields.Name,
    //           description: data.fields.description,
    //           icon: data.fields.icon[0].url,
    //           randomColor: $scope.randomColor,
    //           included_categories: []
    //         })
    //         angular.forEach(data.fields.included_categories, function(data,i){
    //           $http.get($scope.baseUrl + '/categories' + '?&filterByFormula=(categorie_id="'+ data +'")&view=Grid%20view'
    //           ).then( function(resp) {
    //             // $scope.categoryData = resp.data.records[0].fields
    //             $scope.categoryDataSets = resp.data.records[0].fields.Sets
    //
    //             // $scope.findProgress = _.findWhere(playThroughService.getAll(), {categoryId: resp.data.records[0].fields.Name});
    //             // if($scope.findProgress == undefined) {
    //             //   $scope.getProgress = 0
    //             // } else {
    //             //   $scope.getProgress = $scope.findProgress.progress
    //             // }
    //             console.log(resp.data.records[0].fields)
    //             $scope.groups[groupsIndex].included_collections[collectionsIndex].included_categories.push({
    //               id: $scope.categoryDataSets,
    //               categoryTitle: resp.data.records[0].fields.Name,
    //               description: resp.data.records[0].fields.description,
    //               cover_image: resp.data.records[0].fields.cover_image[0].thumbnails.large.url,
    //               icon: resp.data.records[0].fields.icon[0].thumbnails.small.url,
    //               progress: 0
    //             });
    //             $scope.collectionsReady = true
    //           })
    //         });
    //       });
    //     });
    //   });
    // });
  // })

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

  // View Category
  $scope.openViewCategorie = function(data) {
    $scope.selectedCollection = data
    $scope.selectedCate = data
    $ionicModal.fromTemplateUrl('./templates/category-view.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.data = {};

      // angular.forEach($scope.categories, function(value) {
      //   console.log(value)
      // })

      // // $scope.collection = $scope.collections
      $scope.categories = $scope.categories
      // var selectedCategoryInCollection = _.findWhere($scope.categories, {collectionId: $scope.selectedCollection.id});

      $scope.modal.show();

      // Category Modal Slider 
      $scope.categoryViewSliderOptions = {
        // effect: 'slide'
      }
      $scope.data.sliderDelegate2 = null;
      $scope.gotoSlide = function(index) {
        $timeout(function(){
          $scope.data.sliderDelegate2.slideTo(index);
        },100)
      }
    });
  };

  $scope.closeModal = function() {
    $scope.modal.remove()
    .then(function() {
      $scope.modal = null;
    });
  };

})
.controller('CategoriesCtrl', function($scope, $http, $stateParams, $state) {

  $scope.categories = $state.params.categoriesInCollection

})

.controller('GameBoardCtrl', function($scope, $http, $timeout, $state, $stateParams, $ionicHistory, toastr) {

  $scope.setRecordData = $state.params.startGameData
  $scope.selectedGameboard = []
  $scope.questionsLoaded = false

  // fetchAllQustions.getAll().then(function(data) {
  //   console.log('getAll',data);
  // })

  angular.forEach($scope.setRecordData, function(recordData, index){
    var fetchProgress = recordData.progress
    $http.get($scope.baseUrl + '/questions' + '?&filterByFormula=(set_id="'+ recordData.id[fetchProgress] +'")&view=Grid%20view'
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
      $state.go('app.question', {questionData: selectedQuestion, cache:false});
    }
    selectedQuestion.played = true
    // toastr.clear();
  }

})

.controller('QuestionsCtrl', function($scope, $http, $state, $stateParams, $ionicHistory) {
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

  $scope.noOnKnow = function() {
    $ionicHistory.goBack();
  };

});

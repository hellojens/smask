angular.module('starter.controllers', ['ngCordova','ngStorage', 'ionic-native-transitions', 'ngAnimate', 'toastr', 'ngCordova.plugins.nativeStorage'])

.controller('AppCtrl', function($ionicPlatform, $scope, $cordovaNativeStorage, $http, $stateParams, $state, $ionicModal, $timeout, $http, $filter, $ionicSlideBoxDelegate, playerService, $ionicHistory, $ionicNativeTransitions, toastr, $ionicPlatform, $q, $ionicLoading, $ionicPopup, $ionicSideMenuDelegate, moment, $cordovaGoogleAnalytics) {
  $http.defaults.headers.common['Authorization'] = "Bearer " + 'keynHfCb7Qp6svdyV';
  $scope.baseUrl = 'https://api.airtable.com/v0/app04N9yQPQZLwC8T';
  $ionicNativeTransitions.enable(false);
  $ionicSideMenuDelegate.canDragContent(false)

  // IAP SETTINGS
  // Items for Sale: External App Store Ref
  var productIds = [
    'iap_hot_collection_v1.4',
    'iap_personlig_collection_v1.4',
    'iap_mime_collection_v1.4',
    'iap_forklare_dette_collection_v1.4',
    'iap_nynne_collection_v1.4',
    'iap_voksen_collection_v1.6.8'
  ];
  // Items for Sale: Internal Aittable ref
  $scope.productList = [
    'iap_hot_collection_v1.4',
    'iap_personlig_collection_v1.4',
    'iap_mime_collection_v1.4',
    'iap_forklare_dette_collection_v1.4',
    'iap_nynne_collection_v1.4',
    'iap_voksen_collection_v1.6.8'
  ];

  $http.get($scope.baseUrl + '/collections' 
  ).then( function(collections) {
    angular.forEach(collections.data.records, function(eachCollection, collectionIndex){
      if(eachCollection.fields.iap_id != undefined) {
        console.log(eachCollection.fields.iap_id);
        $scope.updatedIAPVersionList = eachCollection.fields.iap_id
      }
    })
    $scope.productList.push($scope.updatedIAPVersionList)
    console.log($scope.productList);
  })

  // Items already purchased
  $scope.restoreCollectionList = []

  $scope.getAndSetRestoreCollectionList = function() {
    $ionicPlatform.ready(function () {
      $cordovaNativeStorage.getItem("Purchases").then(function(purchases) {
        console.log("Restoring Purchases from LocalStorage")
        angular.forEach(purchases, function(data) {
          console.log(data)
          $scope.restoreCollectionList.push(data.productId)
        })
      });
    });
  }
  $scope.getAndSetRestoreCollectionList()

  var spinner = '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';

  $scope.restoreCollections = function () {
    console.log("Fetching Purcheses from Apple")
    if(window.cordova) {
      $ionicLoading.show({ template: spinner + 'Vent venligst' });
      inAppPurchase
      .restorePurchases()
      .then(function (purchases) {
        $ionicPlatform.ready(function () {
          $cordovaNativeStorage.setItem("Purchases", purchases).then(function (purchaseList) {
            console.log("Update LocalStorage: " + purchaseList);
          });
        })
        $scope.getAndSetRestoreCollectionList()
        $ionicLoading.hide()
      })
      .catch(function (err) {
        console.log(err);
        $ionicLoading.hide()
      });
    } else {
      // TESTING
      var purchases = []
      $ionicPlatform.ready(function () {
        $cordovaNativeStorage.setItem("Purchases", purchases).then(function (purchaseList) {
          console.log("Local Storage Set: " + purchaseList);
        });
      })
      $scope.getAndSetRestoreCollectionList()
    }
  };

  $scope.loadProducts = function () {
    inAppPurchase
      .getProducts(productIds)
      .then(function (products) {
        console.log("App Store Products" + products)
        $scope.products = products;
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  $scope.buy = function (productId) {
    console.log(productId)
    var internVersionControle = _.contains($scope.productList, productId);
    // if(window.cordova && productId != undefined) {
    if(productId != undefined) {
      if(internVersionControle != true) {
        console.log("Out");
        // Player Modal Controls

        $ionicModal.fromTemplateUrl('./templates/update.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });

      } else {
        $ionicLoading.show({ template: spinner + 'Vent venligst' });
        inAppPurchase
          .buy(productId)
          .then(function (data) {
            console.log(JSON.stringify(data));
            return inAppPurchase.consume(data.type, data.receipt, data.signature);
          })
          .then(function () {
            $scope.restoreCollections()
            console.log('consume done!');
            $ionicLoading.hide()
          })
          .catch(function (err) {
            console.log("ERROER" + err.data);
            $ionicLoading.hide()
          });
        $timeout(function(){
          $ionicLoading.hide()
        }, 8000)
      }
    } else {
      // TESTING
      // $scope.restoreCollectionList.push(productId)
      // $scope.restoreCollections()

    }
  };

  // $scope.justPurchased = false
  // $scope.$watch($scope.restoreCollectionList, function(val){

  // });

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
    console.log("Go gamebaor");
    // toastr.info('<b>' + player.name + '</b> skal vælge næste spørgsmål', {
    //   iconClass: 'toast-info choose-question'
    // });
  };
  $scope.updatePlayerPoints = function (player, points) {
    player.points = (player.points + points)
    toastr.info('<b>Send telefonen til venstre...</b>', {
      iconClass: 'toast-info send-left',
      tapToDismiss: true,
      onHidden: function() {
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
    // GA TRACKING
    $ionicPlatform.ready(function() {
      if(window.cordova){
        $cordovaGoogleAnalytics.trackView('Player Board');
      }
    })
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
    } else if($scope.selectedCategories.length >= 5) {
      console.log("TOO MANY");
    } else {
      $scope.selectedCategories.push(cats)
      // GA TRACKING
      $ionicPlatform.ready(function() {
        if(window.cordova){
          $cordovaGoogleAnalytics.trackEvent('Category', 'Selected', cats.categoryTitle, 100);
        }
      })
    }
    $scope.startGameCategories = $scope.selectedCategories
  }

  $scope.gameStarted = false

  // GA TRACKING
  $scope.gaTrackEnded = function() {
    angular.forEach($scope.selectedCategories, function(eachCategory, index){
      $ionicPlatform.ready(function() {
        if(window.cordova){
          $cordovaGoogleAnalytics.trackEvent('Category', 'Ended', eachCategory.categoryTitle, 100);
        }
      })
    })
  }

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
      if(eachCategory.progress < 5) {
        var updatedProgress = eachCategory.progress += 1
      } else {
        var updatedProgress = 0
      }
      var utc = new Date()
      $ionicPlatform.ready(function () {
        $cordovaNativeStorage.setItem(eachCategory.categoryTitle, {progress: updatedProgress, lastplayed: utc}).then(function (value) {
          eachCategory.lastplayed = value.lastplayed
          eachCategory.progress = value.progress
        });
      })
    });
    $scope.selectedCategories = []
  }


  // Start Game
  $scope.startGame = function(startRecordIds) {
    if($scope.players.length < 1) {
      $timeout(function() {
        $('.openInGamMenuButton').trigger('click');
      });
    } else if($scope.selectedCategories.length == 0) {
      $('.chooseFive').addClass("pulse");
      $timeout(function(e){
        $(".chooseFive").removeClass("pulse");
      }, 2000)
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

      // GA TRACKING
      $ionicPlatform.ready(function() {
        if(window.cordova){
          angular.forEach($scope.startGameCategories, function(eachCategoryName){
            $cordovaGoogleAnalytics.trackEvent('Category', 'Started', eachCategoryName.categoryTitle, 100);
          })        
        }
      })
    }
  }

  // Show intro from in game
  $scope.openSettings = function() {
    $ionicModal.fromTemplateUrl('./templates/settings.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
    // GA TRACKING
    $ionicPlatform.ready(function() {
      if(window.cordova){
        $cordovaGoogleAnalytics.trackView('Settings Modal');
      }
    })
  };

  // Show intro from in game
  $scope.showIntroInGame = function() {
    $ionicModal.fromTemplateUrl('./templates/rules.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
    // GA TRACKING
    $ionicPlatform.ready(function() {
      if(window.cordova){
        $cordovaGoogleAnalytics.trackView('Rules Modal');
      }
    })
  };

  // Play again button on scoreBoard
  $scope.plagAgain = function() {
    $state.go('app.collections',{cache: false})
  }

  // Score Board Modal
  $scope.openScoreBoard = function() {
    $ionicModal.fromTemplateUrl('./templates/scoreBoard.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose: false
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
    // GA TRACKING
    $ionicPlatform.ready(function() {
      if(window.cordova){
        $cordovaGoogleAnalytics.trackView('Score Board');
      }
    })
  };


  $scope.skipIntro = function() {
    $state.go('app.collections');
    $ionicPlatform.ready(function () {
      $cordovaNativeStorage.setItem("skip-intro", true)
    });
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

.controller('CollectionsCtrl', function($scope, $ionicModal, $ionicPlatform, $timeout, $cordovaNativeStorage, $ionicSlideBoxDelegate, $http, $stateParams, $state, $ionicHistory, $q, $ionicSlideBoxDelegate, moment, $cordovaGoogleAnalytics) {
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
      console.log("Groups Done");
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
            console.log("Collection Done");
            itemsProcessed++;
            if(itemsProcessed === included_ids.length) {
              $scope.getCategories($scope.collection)
              // Check if user already purchased a collection
              console.log("Feed done")            
              if (window.cordova) {
                console.log("Feed done cordova")            
                $scope.loadProducts()
              }
              

            }

          })
        })
      });

      $scope.getCategories = function(collectionsData) {
        console.log('Categories - Fetch');

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
              if(data.fields.hasOwnProperty('emblem')) {
                var validEmblemUrl = data.fields.emblem[0].thumbnails.large.url
              } else {
                var validEmblemUrl = ''
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
                    emblem: validEmblemUrl,
                    progress: progressValue.progress,
                    lastplayed: progressValue.lastplayed
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
                    emblem: validEmblemUrl,
                    progress: 0,
                    lastplayed: ''
                  })
                });
              });
            }
          })
        }).finally(function() {
          console.log('Categories - Done');
          $timeout(function() {
            $scope.collectionsReady = true
            $scope.showSlowMsg = false  
          }, 100);
        })
      }
    });
  }
  $scope.loadCollections()

  $scope.showSlowMsg = false
  $timeout(function() {
    if($scope.collectionsReady != true) {
      $scope.showSlowMsg = true
    }
  }, 10000);

  $scope.manuallyLoadCollections = function() {
    console.log("Load again!")
    $scope.loadCollections()
  }



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
  $scope.openViewCategorie = function(data, index) {

    $timeout(function(e){
      $(".categoryImage").removeClass("pulse");
    }, 2000)
    $scope.selectedCollection = data
    $scope.selectedCate = data
    $ionicModal.fromTemplateUrl('./templates/category-view.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.data = {};

      $scope.categories = $scope.categories
      $scope.categories.lastplayed
      // var selectedCategoryInCollection = _.findWhere($scope.categories, {collectionId: $scope.selectedCollection.id});
      $(function() {
        $(".meter > span").each(function() {
          $(this)
            .data("origWidth", $(this).width())
            .width(0)
            .animate({
              width: $(this).data("origWidth")
            }, 1200);
        });
      });
      $scope.modal.show();
      // Category Modal Slider 
      $scope.data.sliderDelegate2 = null;
      $scope.categoryViewSliderOptions = {
      }
      $timeout(function(){
        $scope.data.sliderDelegate2.slideTo(index);
      },100)

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

.controller('GameBoardCtrl', function($scope, $http, $timeout, $state, $stateParams, $ionicHistory, toastr, $cordovaGoogleAnalytics) {

  $scope.setRecordData = $state.params.startGameData
  $scope.selectedGameboard = []
  $scope.questionsLoaded = false

  // fetchAllQustions.getAll().then(function(data) {
  //   console.log('getAll',data);
  // })

  angular.forEach($scope.setRecordData, function(recordData, index){
    console.log(fetchProgress);
    if(recordData.progress == 5) {
      var fetchProgress = 0 
    } else {
      var fetchProgress = recordData.progress
    }
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
      $ionicPlatform.ready(function() {
        if(window.cordova){
          $cordovaGoogleAnalytics.trackEvent('Category', 'Completed', eachCategory.categoryTitle, 100);
        }
      })
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

.controller('QuestionsCtrl', function($scope, $http, $state, $stateParams, $ionicHistory,toastr,$timeout, $cordovaGoogleAnalytics) {
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
    toastr.info('<b>Send telefonen til venstre...</b>', {
      iconClass: 'toast-info send-left',
      tapToDismiss: true,
      onHidden: function() {
        $ionicHistory.goBack();
      }
    });

  };

});

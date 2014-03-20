'use strict';

var app = angular.module('ngQconApp', []);

app.factory('seatService', function($http) {
  var seatService = {
    async: function () {
      console.log('--- start seatService async ---');
      var jsonURL = 'http://i.alexmeswarb.com/test.json';
      var promise = $http.get(jsonURL).then(function (response) {
        return response.data;
      });
      return promise;
    }
  };
  return seatService;
});

app.directive('seats', ['$rootScope', function ($rootScope) {

  var seatsAsync = function (group, startRow, endRow, scope, element) {
    $rootScope.$on('seatsReady', function (event, message) {
      console.log('broadcast caught');
      drawSeats(message, group, startRow, endRow, scope, element);
    });
  };

  var drawSeats = function (seats, group, startRow, endRow, scope, element) {
    var seatsPerRow;
    switch (group) {
      case 'a':
        seatsPerRow = 10;
        break;
      case 'b':
        seatsPerRow = 22;
        break;
      case 'c':
        seatsPerRow = 12;
        break;
    }

    for (var row = startRow; row <= endRow; row++) {
      scope.markup += '<div class="seat-row';
      if (row % 2 === 0) {
        scope.markup += ' aisle';
      }
      scope.markup += '" ' +
                'row-group="' + group + '" ' +
                'row-nr="' + row + '">';
      for (var seat = seatsPerRow; seat > 0; seat--) {
        var seatIdent = group.toUpperCase() + row + '-' + seat;
        var seatObj = seats[seatIdent];
        if (seatObj) {
          scope.markup += '<div class="seat ' + seatObj.state + '" ';
        } else {
          scope.markup += '<div class="seat blank" ';
        }
        scope.markup += 'seat-group="' + group + '" ' +
                  'seat-row="' + row + '" ' +
                  'seat-nr="' + seat + '" ' +
                  'seat-ident="' + seatIdent + '" ';
        if (seatObj) {
          if (seatObj.username) {
            scope.markup += 'seat-user="' + seatObj.username + '" ';
          }
          if (seatObj.clan) {
            scope.markup += 'seat-user="' + seatObj.clan + '" ';
          }
        }
        scope.markup += '></div>';
      }
      scope.markup += '</div><!-- row -->';
    }
    scope.markup += '<div class="clear"></div>';
    element.html(scope.markup);
  };

  return {
    restrict: 'A',
    scope: {},
    template: '',
    link: function (scope, element, attrs) {
        seatsAsync(attrs.group, attrs.startRow, attrs.endRow, scope, element);
      }
  };
}]);

app.controller('MainCtrl',
               ['$scope', '$rootScope', 'seatService',
                function ($scope, $rootScope, seatService) {
  seatService.async().then(function (d) {
    $scope.data = d.seats;
    console.log('~~~ broadcast ~~~');
    $rootScope.$broadcast('seatsReady', d.seats);
  });
}]);
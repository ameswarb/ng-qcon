'use strict';

var app = angular.module('ngQconApp');

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

app.directive('singleseat', function () {
  var showTooltip = function () {
    console.log('show tooltip!');
  };
  return {
    restrict: 'A',
    scope: {},
    template: '',
    link: function (scope, element, attrs) {
      if (attrs.seatState !== 'taken') { return; }
      element.hover(function () {
        var options = {
          'animation': false,
          'html': true,
          'delay': {
            show: 0,
            hide: 0
          }
        };
        options.title = attrs.seatIdent;
        if (attrs.seatRow > 37) {
          options.placement = 'left';
        } else {
          options.placement = 'right';
        }
        options.content = '';
        if (attrs.seatUser) {
          options.content += '<strong>' + attrs.seatUser + '</strong><br />';
        }
        if (attrs.seatClan) {
          options.content +=  attrs.seatClan;
        }
        element.popover(options);
        element.popover('show');
        window.jQuery('[seat-nr="' + attrs.seatNr +'"]' +
                    '[seat-group="' + attrs.seatGroup + '"]')
                    .addClass('focus');
      }, function () {
        element.popover('destroy');
        window.jQuery('[seat-nr="' + attrs.seatNr +'"]' +
                    '[seat-group="' + attrs.seatGroup + '"]')
                    .removeClass('focus');
      });
    }
  };
});

app.directive('seats', ['$rootScope', '$compile', function ($rootScope, $compile) {

  var seatsAsync = function (group, startRow, endRow, scope, element) {
    $rootScope.$on('seatsReady', function (event, message) {
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

    scope.markup = '';
    for (var row = startRow; row <= endRow; row++) {
      scope.markup += '<div ng-mouseenter="tooltip()" class="seat-row';
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
                  'seat-ident="' + seatIdent + '" ' +
                  'singleseat="" ';
        if (seatObj) {
          if (seatObj.username) {
            scope.markup += 'seat-user="' + seatObj.username + '" ';
          }
          if (seatObj.clan) {
            scope.markup += 'seat-clan="' + seatObj.clan + '" ';
          }
          if (seatObj.state) {
            scope.markup += 'seat-state="' + seatObj.state + '" ';
          }
        }
        scope.markup += '></div>';
      }
      scope.markup += '</div><!-- row -->';
    }
    scope.markup += '<div class="clear"></div>';
    element.html(scope.markup);
    $compile(element.contents())(scope);
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
      $rootScope.$broadcast('seatsReady', d.seats);
    });
  }]);
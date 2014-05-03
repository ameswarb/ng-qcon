angular.module( 'qcon.seats', [
  'lodash',
  'templates-app',
  'templates-common'
])

.factory('seatService', function($http) {
  var seatService = {
    async: function () {
      var jsonURL = 'http://i.alexmeswarb.com/test.json';
      var promise = $http.get(jsonURL).then(function (response) {
        return response.data;
      });
      return promise;
    }
  };
  return seatService;
})

.directive('singleseat', function () {
  var showTooltip = function () {
    console.log('show tooltip!');
  }; 
  return {
    restrict: 'A',
    scope: {
      seatIdent: '@',
      seatRow: '@',
      seatUser: '@',
      seatClan: '@',
      seatGroup: '@',
      seatNr: '@',
      seatState: '@'
    },
    template: '',
    link: function (scope, element, attrs) {
      scope.$on('highlight:' + scope.seatIdent, function () {
        element.addClass('highlighted');
      });
      scope.$on('highlight:reset', function () {
        element.removeClass('highlighted');
      });
      var appCtrl = scope.$parent.$parent;
      if (scope.seatState !== 'taken') { return; }
      element.hover(function () {
        var options = {
          'animation': false,
          'html': true,
          'delay': {
            show: 0,
            hide: 0
          }
        };
        options.title = scope.seatIdent;
        if (scope.seatRow > 37) {
          options.placement = 'left';
        } else {
          options.placement = 'right';
        }
        options.content = '';
        if (scope.seatUser) {
          options.content += '<strong>' + appCtrl.data[scope.seatIdent].username + '</strong><br />';
        }
        if (scope.seatClan) {
          options.content +=  appCtrl.data[scope.seatIdent].clan;
        }
        element.popover(options);
        element.popover('show');
        window.jQuery('[seat-nr="' + scope.seatNr +'"]' +
                    '[seat-group="' + scope.seatGroup + '"]')
                    .addClass('focus');
      }, function () {
        element.popover('destroy');
        window.jQuery('[seat-nr="' + scope.seatNr +'"]' +
                    '[seat-group="' + scope.seatGroup + '"]')
                    .removeClass('focus');
      });
    }
  };
})

.directive('seats', ['$compile', function ($compile) {

  var seatsAsync = function (group, startRow, endRow, scope, element) {
    scope.$on('seatsReady', function (event, message) {
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
            scope.markup += 'seat-user="' + scope.$parent.data[seatIdent].username + '" ';
          }
          if (seatObj.clan) {
            scope.markup += 'seat-clan="' + scope.$parent.data[seatIdent].clan + '" ';
          }
          if (seatObj.state) {
            scope.markup += 'seat-state="' + scope.$parent.data[seatIdent].state + '" ';
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
}])

;
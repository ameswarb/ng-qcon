var lodash = angular.module('lodash', []);
lodash.factory('_', function() {
  return window._;
});

angular.module( 'qcon', [
  'lodash',
  'templates-app',
  'templates-common',
  'qcon.seats'
])

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ($scope, $element, seatService) {
  seatService.async().then(function (d) {
    $scope.data = d.seats;
    $scope.seats = _.map(d.seats, function (value) {
      if (value.username || value.clan) {
        return value;
      }
    });
    $scope.$broadcast('seatsReady', d.seats);
  });
  $scope.userFilter = "";
  $scope.usersPerPage = 20;
  $scope.$watch('filteredItems', function (newVal, oldVal, scope) {
    scope.$broadcast('highlight:reset');
    _.each(newVal, function (seat) {
      scope.$broadcast('highlight:' + seat.seat);
    });
  }, true);
})

;


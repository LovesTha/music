/**
 * ownCloud - Music app
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Pauli Järvinen <pauli.jarvinen@gmail.com>
 * @copyright Pauli Järvinen 2018 - 2020
 */


angular.module('Music').controller('SidebarController', [
	'$rootScope', '$scope', '$timeout',
	function ($rootScope, $scope, $timeout) {

		$scope.follow = Cookies.get('oc_music_details_follow_playback') == 'true';

		$scope.contentType = null;
		$scope.contentId = null;

		$scope.adjustFixedPositions = function() {
			$timeout(function() {
				var sidebarWidth = $('#app-sidebar').outerWidth();
				var contentWidth = $('#app-sidebar .sidebar-content').outerWidth();
				var offset = sidebarWidth - contentWidth;
				$('#app-sidebar .close').css('right', offset);
				$('#app-sidebar #follow-playback').css('right', offset);

				$('#app-sidebar .close').css('top', $('#header').outerHeight());
			});
		};

		function showSidebar(type, id) {
			OC.Apps.showAppSidebar();
			$('#app-content').addClass('with-app-sidebar');
			$scope.contentType = type;
			$scope.contentId = id;
			$scope.adjustFixedPositions();
		}

		function showTrackDetails(trackId) {
			showSidebar('track', trackId);
		}

		$rootScope.$on('showTrackDetails', function(event, trackId) {
			showTrackDetails(trackId);
		});

		$rootScope.$on('showAlbumDetails', function(event, albumId) {
			showSidebar('album', albumId);
		});

		$rootScope.$on('showArtistDetails', function(event, artistId) {
			showSidebar('artist', artistId);
		});

		$rootScope.$on('showPlaylistDetails', function(event, playlistId) {
			showSidebar('playlist', playlistId);
		});

		$rootScope.$on('showRadioHint', function() {
			showSidebar('radio', null);
		});

		$rootScope.$on('hideDetails', function() {
			OC.Apps.hideAppSidebar();
			$('#app-content').removeClass('with-app-sidebar');
			$('#app-content').css('margin-right', '');
		});

		$rootScope.$on('resize', $scope.adjustFixedPositions);

		$scope.$parent.$watch('currentTrack', function(track) {
			// show details for the current track if the feature is enabled
			if ($scope.follow && track && !$('#app-sidebar').hasClass('disappear')) {
				showTrackDetails(track.id);
			}
		});

		$scope.toggleFollow = function() {
			$scope.follow = !$scope.follow;
			Cookies.set('oc_music_details_follow_playback', $scope.follow.toString(), { expires: 3650 });

			// If "follow playback" was enabled and the currently shown track doesn't match currently
			// playing track, then immediately switch to the details of the playing track.
			if ($scope.follow && $scope.$parent.currentTrack
					&& ($scope.$parent.currentTrack.id != $scope.contentId || $scope.contentType != 'track')) {
				showTrackDetails($scope.$parent.currentTrack.id);
			}
		};

		$scope.formatLastfmTags = function(tags) {
			// Filter out the tags intended to be used on Last.fm as personal tags. These make no sense
			// for us as we are not aware of the user's Last.fm account and we only show global tags.
			tags = _.reject(tags, {name: 'seen live'});
			tags = _.reject(tags, {name: 'albums I own'});
			tags = _.reject(tags, {name: 'vinyls i own'});
			tags = _.reject(tags, {name: 'favorite albums'});
			tags = _.reject(tags, {name: 'favourite albums'});
			return $scope.formatLinkList(tags);
		};

		$scope.formatLinkList = function(linkArray) {
			var htmlLinks = _.map(linkArray, function(item) {
				return '<a href="' + item.url + '" target="_blank">' + item.name + '</a>';
			});
			return htmlLinks.join(', ');
		};
	}
]);

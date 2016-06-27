var _ = require('underscore');
var User = Parse.Object.extend("User");

var kUserFirstNameKey           = "first_name";
var kUserLastNameKey            = "last_name";
var kUserCountryKey             = "country";
var kUserCityKey                = "city";
var kUserUsernameKey            = "username";
var kUserDisplayNameKey         = "display_name";
var kUserPasswordKey            = "password";
var kUserEmailKey               = "email";
var kUserProfilePictureKey      = "profile_picture";
var kUserProfileCoverKey        = "profile_cover";
var kUserSettingsKey            = "settings";
var kUserCounterFollowingKey    = "counter_following";
var kUserCounterFollowerKey     = "counter_follower";
var kUserCounterLikesKey        = "counter_likes";
var kUserCounterRecordsKey      = "counter_records";
var kUserCounterFollowingTagsKey = "counter_following_tags";
var kUserDateOfBirthKey         = "date_of_birth";

Parse.Cloud.beforeSave("User", function ( request, response ) {
    if (request.object.isNew()) {
        var user = request.object;
        user.set(kUserLastNameKey, 				"");
        user.set(kUserFirstNameKey, 			"");
        user.set(kUserCountryKey, 				"");
        user.set(kUserCityKey, 					"");
        user.set(kUserCounterFollowerKey, 		0);
        user.set(kUserCounterFollowingKey, 		0);
        user.set(kUserCounterLikesKey,			0);
        user.set(kUserCounterRecordsKey,		0);
        user.set(kUserCounterFollowingTagsKey, 	0);
    }

    response.success();
})

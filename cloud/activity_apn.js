var kActivityTypeFollow = "follow";

// Only send push notifications for new activities
var handler = function( activity ) {
    var type = activity.get("type");

    if (type === "new_record") {
        return sendPushTypeNewRecord(activity);
    } else {
        return  sendPushType(activity);
    }
};

var sendPushType = function ( activity ) {
    var fromUser  = activity.get("from_user");
    var toUser = activity.get("to_user");
    var type = activity.get("type");

    if ( !toUser ) {
        return;
    }

    if (toUser.id === fromUser.id) {
        return;
    }

    var query = new Parse.Query(Parse.Installation);
    query.equalTo('user', toUser);
    query.equalTo('events', type);

    Parse.Push.send({
        where : query, // Set our Installation query.
        data  : alertPayload(activity)
    }).then(function () {
        // Push was successful
        console.log('Sent push.');
    }, function ( error ) {
        throw "Push Error " + error.code + " : " + error.message;
    });
}

var sendPushTypeNewRecord = function( activity ) {
    var user  = activity.get("from_user");
    var type  = activity.get("type");

    var followers = new Parse.Query("Activity");
    followers.equalTo("type", "follow");
    followers.equalTo("to_user", user);
    followers.include("from_user");

    var query = new Parse.Query(Parse.Installation);
    query.matchesKeyInQuery("user", "from_user", followers);
    query.equalTo("events", type);

    Parse.Push.send({
        where : query, // Set our Installation query.
        data  : alertPayload(activity)
    }).then(function () {
        console.log('Sent push.');
    }, function ( error ) {
        throw "Push Error " + error.code + " : " + error.message;
    });

}

var alertMessage = function ( activity ) {
    var message 	= "";
    var type 		= activity.get("type")
    var user 		= activity.get("from_user");

    if ( type === "comment" ) {
        if ( user.get('display_name') ) {
            message = user.get('display_name') + ': ' + activity.get('body').trim();
        } else {
            message = "Someone commented on your post.";
        }
    } else if ( type === "like" ) {
        if ( user.get('display_name') ) {
            message = user.get('display_name') + ' likes your post.';
        } else {
            message = 'Someone likes your post.';
        }
    } else if ( type === "follow" ) {
        if ( user.get('display_name') ) {
            message = user.get('display_name') + ' is now following you.';
        } else {
            message = "You have a new follower.";
        }
    } else if (type === "new_record") {
        if ( user.get('display_name') ) {
            message = user.get('display_name') + ' shared new record.';
        } else {
            message = "Someone shared new record.";
        }
    }

    // Trim our message to 140 characters.
    if ( message.length > 140 ) {
        message = message.substring(0, 140);
    }

    return message;
}

var alertPayload = function ( activity ) {
    var type = activity.get("type");

    if ( type === "comment" ) {
        return {
            alert : alertMessage(activity), // Set our alert message.
            //badge : 'Increment', // Increment the target device's badge count.
            // The following keys help Anypic load the correct photo in response to this push notification.
            p     : 'a', // Payload Type: Activity
            t     : 'c', // Activity Type: Comment
            fu    : activity.get('from_user').id, // From User
            pid   : activity.id // Photo Id
        };
    } else if ( type === "like" ) {
        return {
            alert : alertMessage(activity), // Set our alert message.
            //badge : 'Increment', // Increment the target device's badge count.
            // The following keys help Anypic load the correct photo in response to this push notification.
            p     : 'a', // Payload Type: Activity
            t     : 'l', // Activity Type: Like
            fu    : activity.get('from_user').id, // From User
            pid   : activity.id // Photo Id
        };
    } else if ( type === "follow" ) {
        return {
            alert : alertMessage(activity), // Set our alert message.
            //badge : 'Increment', // Increment the target device's badge count.
            // The following keys help Anypic load the correct photo in response to this push notification.
            p     : 'a', // Payload Type: Activity
            t     : 'f', // Activity Type: Follow
            fu    : activity.get('from_user').id // From User
        };
    } else if (type === "new_record") {
        return {
            alert : alertMessage(activity), // Set our alert message.
            //badge : 'Increment', // Increment the target device's badge count.
            // The following keys help Anypic load the correct photo in response to this push notification.
            p     : 'a', // Payload Type: Activity
            t     : 'n', // Activity Type: Follow
            fu    : activity.get('from_user').id // From User
        };
    }
}

module.exports = {
    afterSave : function (activity) {
        handler(activity);
    }
}

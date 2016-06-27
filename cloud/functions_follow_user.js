var Content 			= Parse.Object.extend("Content");
var Activity 			= Parse.Object.extend("Activity");
var kActivityTypeFollow = "follow";

Parse.Cloud.define("followUser", function(request, response) {

    var user_id 		= request.params.user_id;
    var current_user 	= request.user;
    if (user_id == null || current_user == null) {
        throw JSON.stringify({code: 102, message: "Warning: Missing required field \"user_id or user\""});
    }

    var query = new Parse.Query(Parse.User);
    query.get(user_id)
        .then(function(to_user) {
            if (to_user) {
                var activity = new Activity();
                activity.set("type", 		kActivityTypeFollow);
                activity.set("from_user", 	current_user);
                activity.set("to_user", 	to_user);

                var newACL = new Parse.ACL();
                newACL.setWriteAccess(current_user.id, true);
                newACL.setPublicReadAccess(true);
                newACL.setPublicWriteAccess(false);

                activity.setACL(newACL);

                return activity.save(null, { useMasterKey: true });
            }

            throw JSON.stringify({code: 102, message: "User not found"});
        }).then(function(activity) {
        response.success(activity);
    }, function(error) {
        response.error(error);
    })
});

Parse.Cloud.define("unfollowUser", function(request, response) {

    var user_id = request.params.user_id;
    var current_user = request.user;
    //заменить на assert
    if (user_id == null || current_user == null) {
        throw JSON.stringify({code: 102, message: "Warning: Missing required field \"user_id or user\""});
    }

    var query = new Parse.Query(Activity);

    var to_user = new Parse.User();
    to_user.id = user_id;

    query.equalTo("from_user", 	current_user);
    query.equalTo("to_user", 	to_user);
    query.equalTo("type", 		kActivityTypeFollow);

    query.include("from_user");
    query.include("to_user");

    query.first({ useMasterKey: true })
        .then(function(activity){
            if (activity) {
                return activity.destroy({ useMasterKey: true })
            }

            throw JSON.stringify({code: 102, message: "Activity not found"});
        }).then(function(){
        response.success();
    },function(error){
        response.error(error);
    })
});

var Content 			= Parse.Object.extend("Content");
var Activity 			= Parse.Object.extend("Activity");
var kActivityTypeLike 	= "like";

Parse.Cloud.define("likeRecord", function(request, response) {

    var content_id 		= request.params.content_id;
    var current_user 	= request.user;
    if (content_id == null || current_user == null) {
        throw JSON.stringify({code: 102, message: "Warning: Missing required field \"content_id or user\""});
    }

    var query = new Parse.Query(Content);
    query.select("owner");
    query.get(content_id)
        .then(function(content) {
            if (content) {
                var activity = new Activity();
                activity.set("type", 		kActivityTypeLike);
                activity.set("from_user", 	current_user);
                activity.set("record_id", 	content_id);
                activity.set("record", 		content);
                activity.set("to_user", 	content.get("owner"));

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

Parse.Cloud.define("dislikeRecord", function(request, response) {

    var content_id = request.params.content_id;
    var current_user = request.user;
    //заменить на assert
    if (content_id == null || current_user == null) {
        throw JSON.stringify({code: 102, message: "Warning: Missing required field \"content_id or user\""});
    }

    var query = new Parse.Query(Activity);
    query.equalTo("record_id", 	content_id);
    query.equalTo("from_user", 	current_user);
    query.equalTo("type", 		kActivityTypeLike);

    query.include("from_user");
    query.include("record");
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

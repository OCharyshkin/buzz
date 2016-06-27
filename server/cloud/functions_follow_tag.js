var Content 			= Parse.Object.extend("Content");
var Activity 			= Parse.Object.extend("Activity");
var Tags 				= Parse.Object.extend("Tags");
var kActivityTypeFollow = "follow_tag";

Parse.Cloud.define("followTag", function(request, response) {

    var tag_id 			= request.params.tag_id;
    var current_user 	= request.user;
    if (tag_id == null || current_user == null) {
        throw JSON.stringify({code: 102, message: "Warning: Missing required field \"tag_id or user\""});
    }

    var query = new Parse.Query(Tags);
    query.get(tag_id)
        .then(function(tag) {
            if (tag) {
                var activity = new Activity();
                activity.set("type", 		kActivityTypeFollow);
                activity.set("from_user", 	current_user);
                activity.set("tag", 		tag);

                var newACL = new Parse.ACL();
                newACL.setWriteAccess(current_user.id, true);
                newACL.setPublicReadAccess(true);
                newACL.setPublicWriteAccess(false);

                activity.setACL(newACL);

                return activity.save(null, { useMasterKey: true });
            }

            throw JSON.stringify({code: 102, message: "Tag not found"});
        }).then(function(activity) {
        response.success(activity);
    }, function(error) {
        response.error(error);
    })
});

Parse.Cloud.define("unfollowTag", function(request, response) {

    var tag_id 			= request.params.tag_id;
    var current_user 	= request.user;
    //заменить на assert
    if (tag_id == null || current_user == null) {
        throw JSON.stringify({code: 102, message: "Warning: Missing required field \"tag_id or user\""});
    }

    var tag = new Tags();
    tag.id = tag_id;

    var query = new Parse.Query(Activity);

    query.equalTo("from_user", 	current_user);
    query.equalTo("tag", 		tag);
    query.equalTo("type", 		kActivityTypeFollow);

    query.include("from_user");
    query.include("tag");

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

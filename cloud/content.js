var _ = require('underscore');
var Content 	= Parse.Object.extend("Content");
var Tags 		= Parse.Object.extend("Tags");
var Places 		= Parse.Object.extend("Places");
var Activity 	= Parse.Object.extend("Activity");

var kActivityTypeNewRecord = "new_record";

Parse.Cloud.beforeDelete("Content", function(request, response) {

    var content 		= request.object;
    var content_id 		= content.id;

    var query = new Parse.Query(Activity);
    query.equalTo("record_id", content_id);
    query.equalTo("type", kActivityTypeNewRecord);

    query.first({ useMasterKey: true })
        .then(function(activity){
            if (activity) {
                return activity.destroy({ useMasterKey: true })
            }
        }).then(function(){
        response.success();
    },function(error){
        console.error(error);
        response.success();
    })
});

Parse.Cloud.afterSave("Content", function (request) {
    if (request.object.updatedAt.getTime() == request.object.createdAt.getTime()) {
        var content 		= request.object;
        var current_user 	= request.user;

        var newACL = new Parse.ACL();
        newACL.setWriteAccess(current_user.id, true);
        newACL.setPublicReadAccess(true);
        newACL.setPublicWriteAccess(false);

        var activity = new Activity();
        activity.set("from_user", 	current_user);
        activity.set("type", 		kActivityTypeNewRecord);
        activity.set("record", 		content);
        activity.set("record_id", 	content.id);

        activity.setACL(newACL);
        activity.save(null, { useMasterKey: true });
    }
});

Parse.Cloud.beforeSave("Content", function ( request, response ) {
    if (request.object.isNew()) {
        var current_user 	= request.user;
        var content 		= request.object
        var content_id 		= content.id;
        var cover 			= content.get("cover");
        var tags 			= content.get("tags");
        var location 		= content.get("location");

        if (tags) {
            for(var i = 0, l = tags.length; i < l; i++) {
                var newACL = new Parse.ACL();
                newACL.setPublicReadAccess(true);
                newACL.setPublicWriteAccess(false);

                var tag = new Tags();
                if (cover) {
                    tag.set("cover", cover);
                }
                tag.set("tag", tags[i]);
                tag.set("owner", current_user)
                tag.setACL(newACL);
                tag.increment("points", 1);
                tag.save(null, { useMasterKey: true });
            }
        }

        if (location) {
            var settings = content.get("settings")


            if (settings && settings["address"]) {
                var newACL = new Parse.ACL();
                newACL.setPublicReadAccess(true);
                newACL.setPublicWriteAccess(false);

                var place = new Places();
                if (cover) {
                    tag.set("cover", cover);
                }
                place.set("position", location);
                place.set("place", settings["address"])
                place.setACL(newACL);
                place.increment("points", 1);
                place.save(null, { useMasterKey: true });
            }
        }
    }

    response.success();
});

Parse.Cloud.beforeSave("Tags", function(request, response) {

    if (request.object.isNew()) {
        var cover = request.object.get("cover");
        var query = new Parse.Query(Tags);
        query.equalTo("tag", request.object.get("tag"));
        query.first({
            success: function(object) {
                if (object) {
                    if (!object.get("cover") && cover) {
                        object.set("cover", cover);
                    }

                    object.increment("points", 1);
                    object.save(null, { useMasterKey: true });
                    response.error("Failing on purpose");
                }
                else {
                    response.success();
                }

            },
            error: function(error) {
                response.error("Could not validate uniqueness for this Countdown object.");
            }
        });
    } else {
        response.success();
    }

});

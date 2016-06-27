var Content = Parse.Object.extend("Content");
var User 	= Parse.Object.extend("User");

var handler = function (isDelete, activity) {
    var currentUser = activity.get("from_user");
    var toUser 		= activity.get("to_user");
    var type 		= activity.get("type");
    var count 		= isDelete ? -1 : 1
    var content 	= activity.get("record");

    switch(type) {
        case "like" :
            if (content) {
                content.increment("counter_likes", count);
                content.save(null, { useMasterKey: true }).then(function(){}, function(error){ console.error(error) });
                currentUser.increment("counter_likes", count);
                currentUser.save(null, { useMasterKey: true });
            }
            break;
        case "comment":
            if (content) {
                if (!isDelete) {
                    addComment(content.id, activity)
                }
                content.increment("counter_comments", count);
                content.save(null, { useMasterKey: true });
            }
            break;
        case "follow":
            currentUser.increment("counter_following", count);
            currentUser.save(null, { useMasterKey: true });
            toUser.increment("counter_follower", count);
            toUser.save(null, { useMasterKey: true });
            break;
        case "new_record":
            currentUser.increment("counter_records", count);
            currentUser.save(null, { useMasterKey: true });
            break;
        case "follow_tag":
            currentUser.increment("counter_following_tags", count);
            currentUser.save(null, { useMasterKey: true });
            break;
    }
}

var addComment = function (content_id, activity) {
    var query = new Parse.Query(Content);
    query.include("comments");

    query.get(content_id, {
        success : function (content) {
            var comments = content.get("comments");
            if (!comments) comments = [];
            comments.push(activity);
            content.set("comments", comments.slice(-3));
            content.save();
        },
        error : function () {
        }
    });

}

module.exports = {
    afterSave :  function(activity) {
        handler(false, activity);
    },
    afterDelete: function (activity) {
        handler(true, activity);
    }
}

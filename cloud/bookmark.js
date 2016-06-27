var Bookmark = Parse.Object.extend("Bookmark");

Parse.Cloud.beforeSave("Bookmark", function ( request, response ) {
    var content = request.object.get("record")
    var user = request.object.get("user")

    var query = new Parse.Query(Bookmark);
    query.equalTo("user", user);
    query.equalTo("post", post);
    query.first({
        success : function ( object ) {
            if ( object ) {
                response.error("A Bookmark with this postId already exists.");
            } else {
                response.success();
            }
        },
        error   : function ( error ) {
            response.error("Could not validate uniqueness for this Bookmark object.");
        }
    });
});


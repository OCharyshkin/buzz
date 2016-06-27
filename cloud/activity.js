var Activity 			= Parse.Object.extend("Activity");
var handlerApn 			= require('./activity_apn.js');
var handlerCounter 		= require('./activity_counter.js');


//после сохранениея
//увеличить счетчик у пользователя
Parse.Cloud.afterSave("Activity", function(request) {
    if (request.object.updatedAt.getTime() == request.object.createdAt.getTime()) {
        var activity_id = request.object.id;

        var query = new Parse.Query(Activity);
        query.select("from_user", "to_user", "record", "record_id", "type");
        query.include("from_user");
        query.include("to_user");
        query.include("record");
        query.get(activity_id, { useMasterKey: true })
            .then(function (activity) {
                if (activity) {
                    handlerApn.afterSave(activity);
                    handlerCounter.afterSave(activity);
                }
            });
    }
});

//уменьшить счетчик
Parse.Cloud.afterDelete("Activity", function(request) {
    var activity 	= request.object;
    var activity_id = activity.id;

    handlerCounter.afterDelete(activity);
});


//до сохранения
Parse.Cloud.beforeSave("Activity", function ( request, response ) {
    if (request.object.isNew()) {
        var activity 		= request.object;
        var type 		 	= activity.get("type");
        var from_user 		= activity.get("from_user");
        var query 			= new Parse.Query(Activity);

        if (type == "follow") {
            var to_user = activity.get("to_user");
            query.equalTo("to_user", to_user);
        } else if (type == "like") {
            var content_id 	= activity.get("record_id");
            var to_user 	= activity.get("to_user");
            query.equalTo("record_id", 	content_id);
            query.equalTo("to_user", 	to_user);
        } else {
            return response.success();
        }

        query.equalTo("from_user", 	from_user);
        query.equalTo("type", 		type);

        query.first({ useMasterKey: true })
            .then(function(object){
                if ( object ) {
                    response.error(JSON.stringify({code: 137, message: "Custom Error Message"}));
                } else {
                    response.success(object);
                }
            },function(error){
                response.error(error);
            })
    }
})

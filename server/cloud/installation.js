var validEvents = ["like", "follow", "comment", "new_record"];
var _ = require('underscore');

//ассоциируем устройство с пользователем для отправки ему пушеей
Parse.Cloud.beforeSave(Parse.Installation, function ( request, response ) {
    var user = request.object.get("user");

    if ( user ) {
        request.object.set('user', request.user);
    } else {
        request.object.unset('user');
    }

    var events = request.object.get("events");
    events = _.intersection(events, validEvents);
    request.object.set('events', events);

    response.success();
});


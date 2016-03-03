module.exports = function(Person) {
    
	Person.status = function(cb) {
        var currentDate = new Date();
        var currentHour = currentDate.getHours();
        
        var WORK_BEGINS_HOUR = 9;
        var WORK_ENDS_HOUR = 18;
        
        console.log('Current hour is ' + currentHour);
        
        var response;
        if(currentHour > WORK_BEGINS_HOUR && currentHour < WORK_ENDS_HOUR) {
            response = 'Working.';
        } else {
            response = 'Not working.';
        }
        cb(null, response);
    };
    Person.remoteMethod('status', {
        http: {path: '/status', verb: 'get'},
        returns: {arg: 'status', type: 'string'}
    });
};

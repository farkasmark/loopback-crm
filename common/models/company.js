module.exports = function(Company) {
	Company.getOwnerName = function(id, cb) {
		var response;
		Company.findById(id, function(err, company) {
			company.owner(function(err, person) {
				response = person.firstName + ', ' + person.lastName;
				cb(null, response);
				console.log(response);
			});
		});
	};
	Company.remoteMethod ('getOwnerName', {
        http: {path: '/getOwnerName', verb: 'get'},
        accepts: {arg: 'id', type: 'number', http: { source: 'query' } },
        returns: {arg: 'name', type: 'string'}
    });	
};

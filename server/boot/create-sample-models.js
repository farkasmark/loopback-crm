
module.exports = function(app) {
  app.dataSources.mssqlDS.automigrate('Person', function(err) {
    if (err) throw err;
 
    app.models.Person.create([
      {firstName: 'Mark', lastName: 'Farkas'},
      {firstName: 'Andras', lastName: 'Kovacs'},
      {firstName: 'Ferenc', lastName: 'Halanyi'},
    ], function(err, people) {
      if (err) throw err;
 
      console.log('Models created: \n', people);
    });
  });
  app.dataSources.mssqlDS.automigrate('Company', function(err) {
    if (err) throw err;
 
    app.models.Company.create([
      {name: 'NEXOGEN', ownerId: 1}
    ], function(err, companies) {
      if (err) throw err;
 
      console.log('Models created: \n', companies);
    });
  });
};
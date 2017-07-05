const neo4jDriver = require('neo4j-driver').v1;
const logger = require('./../../applogger');
const config = require('./../../config');
const graphConsts = require('./../common/graphConstants');

let driver = neo4jDriver.driver(config.NEO4J.neo4jURL,
  neo4jDriver.auth.basic(config.NEO4J.usr, config.NEO4J.pwd), {encrypted: false});

/**********************************************
************ Candidate management *************
**********************************************/

// Add cadet

let addCadet = function(cadetObj, successCB, errorCB) {

  let cadet = {};

  cadet.EmployeeID = cadetObj.EmployeeID || '';
  cadet.EmployeeName = cadetObj.EmployeeName || '';
  cadet.EmailID = cadetObj.EmailID || '';
  cadet.AltEmail = cadetObj.AltEmail || '';
  cadet.Contact = cadetObj.Contact || '';
  cadet.DigiThonQualified = cadetObj.DigiThonQualified || '';
  cadet.DigiThonPhase = cadetObj.DigiThonPhase || '';
  cadet.DigiThonScore = cadetObj.DigiThonScore || '';
  cadet.CareerBand = cadetObj.CareerBand || '';
  cadet.WorkExperience = cadetObj.WorkExperience || '';
  cadet.Billability = cadetObj.Billability || '';
  cadet.PrimarySupervisor = cadetObj.PrimarySupervisor || '';
  cadet.ProjectSupervisor = cadetObj.ProjectSupervisor || '';
  cadet.Selected = cadetObj.Selected || '';
  cadet.Remarks = cadetObj.Remarks || '';

  let session = driver.session();

  let query  =
  	`CREATE (n: ${graphConsts.NODE_CANDIDATE}
  	{
  		EmployeeID: '${cadet.EmployeeID}',
  		EmployeeName: '${cadet.EmployeeName}',
  		EmailID: '${cadet.EmailID}',
  		AltEmail: '${cadet.AltEmail}',
  		Contact: '${cadet.Contact}',
  		DigiThonQualified: '${cadet.DigiThonQualified}',
  		DigiThonPhase: '${cadet.DigiThonPhase}',
  		DigiThonScore: '${cadet.DigiThonScore}',
  		CareerBand: '${cadet.CareerBand}',
  		WorkExperience: '${cadet.WorkExperience}',
      Billability: '${cadet.Billability}',
  		PrimarySupervisor: '${cadet.PrimarySupervisor}',
  		ProjectSupervisor: '${cadet.ProjectSupervisor}',
  		Selected: '${cadet.Selected}',
  		Remarks: '${cadet.Remarks}'
  	}) return n`;

  session.run(query)
    .then(function(result) {
      logger.debug('Result from the neo4j', result)

      // Completed!
      session.close();
      successCB(cadetObj);
    })
    .catch(function(err) {
      errorCB(err);
    });
}

// Update cadet

let updateCadet = function(cadetObj, successCB, errorCB) {
  
  let cadet = {};

  cadet.EmployeeID = cadetObj.EmployeeID || '';
  cadet.AltEmail = cadetObj.AltEmail || '';
  cadet.Contact = cadetObj.Contact || '';
  cadet.CareerBand = cadetObj.CareerBand || '';
  cadet.WorkExperience = cadetObj.WorkExperience || '';
  cadet.Billability = cadetObj.Billability || '';
  cadet.PrimarySupervisor = cadetObj.PrimarySupervisor || '';
  cadet.ProjectSupervisor = cadetObj.ProjectSupervisor || '';
  cadet.Selected = cadetObj.Selected || '';
  cadet.Remarks = cadetObj.Remarks || '';

  let session = driver.session();

  let query  =
    `MATCH (n: ${graphConsts.NODE_CANDIDATE}{EmployeeID: '${cadet.EmployeeID}'})
    SET 
      n.AltEmail = '${cadet.AltEmail}',
      n.Contact = '${cadet.Contact}',
      n.CareerBand = '${cadet.CareerBand}',
      n.WorkExperience = '${cadet.WorkExperience}',
      n.Billability = '${cadet.Billability}',
      n.PrimarySupervisor = '${cadet.PrimarySupervisor}',
      n.ProjectSupervisor = '${cadet.ProjectSupervisor}',
      n.Selected = '${cadet.Selected}',
      n.Remarks = '${cadet.Remarks}'
    return n`;

    session.run(query)
    .then(function(result) {
      logger.debug('Result from the neo4j', result)

      // Completed!
      session.close();
      successCB(cadetObj);
    })
    .catch(function(err) {
      errorCB(err);
    });
}

// Update cadets

let updateCadets = function (cadetArr, successCB, errorCB) {
  let count = 0;
  cadetArr.map(function(cadet) {
    updateCadet(cadet, function (cadetObj) {
      count = count+1;
      if(count == cadetArr.length) {
        successCB()
      }
    }, function (err) {
      errorCB(err);
    })
  })
}

// Get all the cadets

let getCadets = function(successCB, errorCB) {
  let session = driver.session();
  let query  = `MATCH (n: ${graphConsts.NODE_CANDIDATE}) return n`;
  session.run(query)
    .then(function(resultObj) {
      session.close();
      let cadets = [];

      for(let i = 0; i < resultObj.records.length; i++) {
        let result = resultObj.records[i];
        logger.debug('Result obj from neo4j', result._fields);
          cadets.push(result._fields[0].properties);
      }
      successCB(cadets);
    })
    .catch(function (err) {
      errorCB(err);
    })
}

// Get all the new cadets

let getNewCadets = function(successCB, errorCB) {
  let session = driver.session();
  let query  = `MATCH (n: ${graphConsts.NODE_CANDIDATE}) WHERE NOT
    (n)-[:${graphConsts.REL_BELONGS_TO}]->(:${graphConsts.NODE_WAVE})
    return n`;
  session.run(query)
    .then(function(resultObj) {
      session.close();
      let cadets = [];
      
      for(let i = 0; i < resultObj.records.length; i++) {
        let result = resultObj.records[i];
        logger.debug('Result obj from neo4j', result._fields);
          cadets.push(result._fields[0].properties);
      }
      successCB(cadets);
    })
    .catch(function (err) {
      errorCB(err);
    })
}


/**********************************************
************** Course management **************
**********************************************/

let addCourse = function (CourseObj, successCB, errorCB) {
  logger.info(CourseObj);
  let query = `MERGE (c:Course{ID:'${CourseObj.ID}',Name:'${CourseObj.Name}',
  Mode:'${CourseObj.Mode}',Duration:${CourseObj.Duration},History:'${CourseObj.History}',
  Removed:${CourseObj.Removed}}) with c as course
  UNWIND ${JSON.stringify(CourseObj.Skills)} as skill
  MERGE (n:Skill{Name:skill})
  create (n)<-[:includes_a]-(course);`;
    let session = driver.session();
       session.run(query).then(function (resultObj, err) {
           session.close();
           if(resultObj) {
           logger.debug(resultObj);
            successCB();
         } else {
             errorCB(err);
           }
         });
  };

let getCourses = function (successCB, errorCB) {
  let query = `MATCH (courses:Course),(courses)-[:includes_a]->(s:Skill) return courses, collect(s.Name) as skills`;
    let session = driver.session();
       session.run(query).then(function (resultObj, err) {
           session.close();
           let courseArray = [];
           for(let i = 0; i < resultObj.records.length; i++) {
                let result = resultObj.records[i];
                if(result._fields.length === 2)
                {
                courseArray.push(result._fields[0].properties);
                courseArray[i].Skills = result._fields[1];
                courseArray[i].Assignments = [];
                courseArray[i].Schedule = [];
                }
            }
         if(err) {
           errorCB('Error');
         } else {
           logger.debug(courseArray);
           successCB(courseArray);
          }
         });
};

  let updateCourse = function (CourseObj, successCB, errorCB) {
  let query = `MATCH (c:Course{ID:'${CourseObj.ID}'})-[r:includes_a]->()
      delete r
      set c.Name = '${CourseObj.Name}',
      c.Mode = '${CourseObj.Mode}',c.Duration = ${CourseObj.Duration},
      c.History = '${CourseObj.History}',
      c.Removed = ${CourseObj.Removed}
      with c as course
      UNWIND ${JSON.stringify(CourseObj.Skills)} as skill
      MERGE (n:Skill{Name:skill})
      MERGE (n)<-[:includes_a]-(course);`
      let session = driver.session();
         session.run(query).then(function (resultObj, err) {
             session.close();
           if(err) {
             errorCB('Error');
           } else {
             successCB('success');
            }
           });
  };

/**********************************************
************ Product management *************
**********************************************/

// adding a new product
let addProduct = function (projectObj, successCB, errorCB) {

   let product = {};
   product.product = projectObj.product;
   product.description = projectObj.description || '';

   let version = {};
   version.name = projectObj.version[0].name;
   version.description = projectObj.version[0].description || '';
   // version.wave = projectObj.version[0].wave;
   // version.members = projectObj.version[0].members;
   version.skills = projectObj.version[0].skills;
   version.addedBy = projectObj.version[0].addedBy;
   version.addedOn = projectObj.version[0].addedOn;
   version.updated = projectObj.version[0].updated;

   let session = driver.session();

   logger.debug("obtained connection with neo4j");

   let query  =
     `CREATE
     (p:${graphConsts.NODE_PRODUCT}
       {
        name: '${product.product}',
        description: '${product.description}'
       }
     )
     -[:${graphConsts.REL_HAS}]->
     (v:${graphConsts.NODE_VERSION}
       {
        name: '${version.name}',
        description: '${version.description}',
        addedOn: '${version.addedOn}',
        addedBy: '${version.addedBy}',
        updated: '${version.updated}'
       }
     )
     WITH p AS product
     UNWIND ${JSON.stringify(version.skills)} AS skillname
     MERGE (product) -[:${graphConsts.REL_INCLUDES}]-> (skill:${graphConsts.NODE_SKILL} {Name: skillname})
     `;

   session.run(query)
     .then(function(result) {
       logger.debug('Result from the neo4j', result)

       // Completed!
       session.close();
       successCB(projectObj);
     })
     .catch(function(err) {
       errorCB(err);
     });
  };

  module.exports = {
    addCadet,
    updateCadet,
    updateCadets,
    getCadets,
    getNewCadets,
    addCourse,
    getCourses,
    updateCourse,
    addProduct
  }

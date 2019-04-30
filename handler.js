'use strict';

const VersionChangeHandler = require('./version_change_hander');
const versionChangeHandler = new VersionChangeHandler('DynamoDB');

module.exports.processVersion = async (event, context, callback) => {
  console.log(`Successfully received ${event.Records.length} records.`);

  event.Records.forEach((record) => {
    console.log('Stream record: ', JSON.stringify(record, null, 2));
    console.log(`Event: ${record.eventName}, Event ID: ${record.eventID}`);
    
    if ('INSERT' == record.eventName) {
      console.log('INSERT: DynamoDB NEW Record: %j', record.dynamodb.NewImage);
    }
    else if ('MODIFY' == record.eventName || 'REMOVE' == record.eventName) {
      if ('MODIFY' == record.eventName) {
        console.log('UPDATE: DynamoDB OLD Record: %j', record.dynamodb.OldImage);
        console.log('UPDATE: DynamoDB NEW Record: %j', record.dynamodb.NewImage);
      } else {
        console.log('DELETE: DynamoDB OLD Record: %j', record.dynamodb.OldImage);
      }

      var oldRecordJson = record.dynamodb.OldImage;
      var newRecordJson;

      // insertedDatetime and insertedBy is only available for MODIFY
      var insertedTimestamp, insertedBy;
      
      if ('MODIFY' == record.eventName) {
        newRecordJson = record.dynamodb.NewImage;
        
        insertedTimestamp = newRecordJson.insertedDatetime;
        insertedBy = newRecordJson.insertedBy;
      }
      
      console.log('insertedTimestamp==='+ JSON.stringify(insertedTimestamp));
      oldRecordJson.expiredOn = getDDBJsonForDatetime(insertedTimestamp);

      console.log('insertedBy==='+ JSON.stringify(insertedBy));
      oldRecordJson.expiredBy = getDDBJsonForUser(insertedBy);

      // console.log("Type of oldRecordJson="+ (typeof oldRecordJson));

      // fire VersionChange event
      versionChangeHandler.versionChanged(oldRecordJson);
    }
  });

  callback(null, `Successfully processed ${event.Records.length} records.`);
};

function getDDBJsonForDatetime(insertedTimestamp) {
  ;
  if (insertedTimestamp == undefined) {
    var placeholder = getFormattedDatetime();
    var jsonStr = `{"S":"${placeholder}"}`;
    return JSON.parse(jsonStr);
  } else {
    return insertedTimestamp;
  }
}

function getDDBJsonForUser(insertedBy) {
  if (insertedBy == undefined) {
    var placeholder = getCurrentUser();
    var jsonStr = `{"S":"${placeholder}"}`;
    return JSON.parse(jsonStr);
  } else {
    return insertedBy;
  }
}

// TODO: PLACEHOLDER. User currentDate to format
function getFormattedDatetime() {
  var currentDate = new Date();
  console.log("TODO: using default date...");
  return "2019-04-29 11:30:13.123 CST";
}

// TODO: PLACEHOLDER. Extract current user
function getCurrentUser() {
  console.log("TODO: using default user...");
  return "VersioningSystem";
}
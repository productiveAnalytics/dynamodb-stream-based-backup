const EventEmitter = require('events');

const VERSION_CHANGE_EVENT = 'recordChanged';

const AWS = require('aws-sdk');
AWS.config.update({
  region: "us-east-1"
});

/*
Run following inside /hds/hds folder:
aws cloudformation create-stack \
    --stack-name hds-ddb-hds-payer-history-stack \
    --template-body file://dataload/src/main/CloudFormation/hds_payer_history_DDB.yml \
    --parameters ParameterKey=TABLENAME,ParameterValue=hds_payer_history
*/
const HDS_PAYER_HISTORY_TABLE = "hds_payer_history"; // TODO: use stage to customize the table

/**
 * Even handler for Payer Configuration DDB record change
 * Pass implType = DDB or DynamoDB to use DynamoDB
 * 
 * @author LChawathe
 */
class VersionChangeHandler extends EventEmitter {
    constructor(implType) {
      super();
      console.log(`Using implementation ${implType}...`);
      
      // var docClient = new AWS.DynamoDB.DocumentClient();
      var ddbClient = new AWS.DynamoDB();

      this.on(VERSION_CHANGE_EVENT, (eventArgs) => {
        var oldImageJson = /*JSON.stringify(eventArgs)*/eventArgs;
        var putRequestParams = {
          TableName: HDS_PAYER_HISTORY_TABLE,
          Item: oldImageJson 
          // NOTE: Image provided by DDB Stream has DynamoDB raw format
          //       Either use DynamoDB client 
          //       Or use "dynamoDb-marshaler" 
          //          Refer: https://github.com/CascadeEnergy/dynamoDb-marshaler
        }
        console.log("JSON to Put "+ JSON.stringify(putRequestParams));
        if (implType == 'DDB' || implType == 'DynamoDB')
        {
        //docClient.put(putRequestParams, (err, data) => {
          ddbClient.putItem(putRequestParams, (err, data) => {
            if (err) {
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
              console.log("Added item:", JSON.stringify(data, null, 2));
            }
          });
        }
      });
    }

    versionChanged(eventParams) {
        this.emit(VERSION_CHANGE_EVENT, eventParams)
    }
};

module.exports = VersionChangeHandler;
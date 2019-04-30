const VersionChangeHandler = require('../version_change_hander');
const verChangeHandler = new VersionChangeHandler('TestImpl');

console.log(verChangeHandler);

verChangeHandler.versionChanged('{"payer_id": "MYPYR", "msg": "This is test event"}');
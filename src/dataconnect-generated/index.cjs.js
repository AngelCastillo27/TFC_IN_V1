const { queryRef, executeQuery, validateArgsWithOptions, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'tfcinv1',
  location: 'europe-west1'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const listAllMenuItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllMenuItems');
}
listAllMenuItemsRef.operationName = 'ListAllMenuItems';
exports.listAllMenuItemsRef = listAllMenuItemsRef;

exports.listAllMenuItems = function listAllMenuItems(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllMenuItemsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

import { queryRef, executeQuery, validateArgsWithOptions, validateArgs, makeMemoryCacheProvider } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'tfcinv1',
  location: 'europe-west1'
};
export const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
export const listAllMenuItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllMenuItems');
}
listAllMenuItemsRef.operationName = 'ListAllMenuItems';

export function listAllMenuItems(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllMenuItemsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}


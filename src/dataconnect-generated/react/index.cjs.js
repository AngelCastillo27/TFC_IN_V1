const { listAllMenuItemsRef, connectorConfig } = require('../index.cjs.js');
const { CallerSdkTypeEnum } = require('firebase/data-connect');
const { useDataConnectQuery, validateReactArgs } = require('@tanstack-query-firebase/react/data-connect');


exports.useListAllMenuItems = function useListAllMenuItems(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts } = validateReactArgs(connectorConfig, dcOrOptions, options);
  const ref = listAllMenuItemsRef(dcInstance);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}
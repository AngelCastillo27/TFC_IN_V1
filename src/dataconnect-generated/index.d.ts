import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ListAllMenuItemsData {
  menuItems: ({
    id: UUIDString;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string | null;
    allergens?: string[] | null;
  } & MenuItem_Key)[];
}

export interface MenuItem_Key {
  id: UUIDString;
  __typename?: 'MenuItem_Key';
}

export interface Reservation_Key {
  id: UUIDString;
  __typename?: 'Reservation_Key';
}

export interface RestaurantInfo_Key {
  id: UUIDString;
  __typename?: 'RestaurantInfo_Key';
}

export interface Table_Key {
  id: UUIDString;
  __typename?: 'Table_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllMenuItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllMenuItemsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllMenuItemsData, undefined>;
  operationName: string;
}
export const listAllMenuItemsRef: ListAllMenuItemsRef;

export function listAllMenuItems(options?: ExecuteQueryOptions): QueryPromise<ListAllMenuItemsData, undefined>;
export function listAllMenuItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllMenuItemsData, undefined>;


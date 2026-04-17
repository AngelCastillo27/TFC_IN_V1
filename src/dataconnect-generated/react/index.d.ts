import { ListAllMenuItemsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListAllMenuItems(options?: useDataConnectQueryOptions<ListAllMenuItemsData>): UseDataConnectQueryResult<ListAllMenuItemsData, undefined>;
export function useListAllMenuItems(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllMenuItemsData>): UseDataConnectQueryResult<ListAllMenuItemsData, undefined>;

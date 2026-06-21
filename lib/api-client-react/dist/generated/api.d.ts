import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { EndpointInput, Execution, ExecutionDetail, HealthStatus, HistoryPoint, MonitoredEndpoint, OverviewStats, Settings, SettingsInput, TestResult } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListEndpointsUrl: () => string;
/**
 * @summary List all monitored endpoints
 */
export declare const listEndpoints: (options?: RequestInit) => Promise<MonitoredEndpoint[]>;
export declare const getListEndpointsQueryKey: () => readonly ["/api/endpoints"];
export declare const getListEndpointsQueryOptions: <TData = Awaited<ReturnType<typeof listEndpoints>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEndpoints>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listEndpoints>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListEndpointsQueryResult = NonNullable<Awaited<ReturnType<typeof listEndpoints>>>;
export type ListEndpointsQueryError = ErrorType<unknown>;
/**
 * @summary List all monitored endpoints
 */
export declare function useListEndpoints<TData = Awaited<ReturnType<typeof listEndpoints>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEndpoints>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEndpointUrl: () => string;
/**
 * @summary Add a new endpoint to monitor
 */
export declare const createEndpoint: (endpointInput: EndpointInput, options?: RequestInit) => Promise<MonitoredEndpoint>;
export declare const getCreateEndpointMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEndpoint>>, TError, {
        data: BodyType<EndpointInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEndpoint>>, TError, {
    data: BodyType<EndpointInput>;
}, TContext>;
export type CreateEndpointMutationResult = NonNullable<Awaited<ReturnType<typeof createEndpoint>>>;
export type CreateEndpointMutationBody = BodyType<EndpointInput>;
export type CreateEndpointMutationError = ErrorType<void>;
/**
* @summary Add a new endpoint to monitor
*/
export declare const useCreateEndpoint: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEndpoint>>, TError, {
        data: BodyType<EndpointInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEndpoint>>, TError, {
    data: BodyType<EndpointInput>;
}, TContext>;
export declare const getDeleteEndpointUrl: (id: number) => string;
/**
 * @summary Remove a monitored endpoint
 */
export declare const deleteEndpoint: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteEndpointMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEndpoint>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEndpoint>>, TError, {
    id: number;
}, TContext>;
export type DeleteEndpointMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEndpoint>>>;
export type DeleteEndpointMutationError = ErrorType<void>;
/**
* @summary Remove a monitored endpoint
*/
export declare const useDeleteEndpoint: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEndpoint>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEndpoint>>, TError, {
    id: number;
}, TContext>;
export declare const getUpdateEndpointUrl: (id: number) => string;
/**
 * @summary Update a monitored endpoint
 */
export declare const updateEndpoint: (id: number, endpointInput: EndpointInput, options?: RequestInit) => Promise<MonitoredEndpoint>;
export declare const getUpdateEndpointMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEndpoint>>, TError, {
        id: number;
        data: BodyType<EndpointInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateEndpoint>>, TError, {
    id: number;
    data: BodyType<EndpointInput>;
}, TContext>;
export type UpdateEndpointMutationResult = NonNullable<Awaited<ReturnType<typeof updateEndpoint>>>;
export type UpdateEndpointMutationBody = BodyType<EndpointInput>;
export type UpdateEndpointMutationError = ErrorType<void>;
/**
* @summary Update a monitored endpoint
*/
export declare const useUpdateEndpoint: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEndpoint>>, TError, {
        id: number;
        data: BodyType<EndpointInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateEndpoint>>, TError, {
    id: number;
    data: BodyType<EndpointInput>;
}, TContext>;
export declare const getGetEndpointHistoryUrl: (id: number) => string;
/**
 * @summary Get response time history for a single endpoint (last 100 data points)
 */
export declare const getEndpointHistory: (id: number, options?: RequestInit) => Promise<HistoryPoint[]>;
export declare const getGetEndpointHistoryQueryKey: (id: number) => readonly [`/api/endpoints/${number}/history`];
export declare const getGetEndpointHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getEndpointHistory>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEndpointHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEndpointHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEndpointHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getEndpointHistory>>>;
export type GetEndpointHistoryQueryError = ErrorType<void>;
/**
 * @summary Get response time history for a single endpoint (last 100 data points)
 */
export declare function useGetEndpointHistory<TData = Awaited<ReturnType<typeof getEndpointHistory>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEndpointHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetOverviewUrl: () => string;
/**
 * @summary Get aggregate overview stats
 */
export declare const getOverview: (options?: RequestInit) => Promise<OverviewStats>;
export declare const getGetOverviewQueryKey: () => readonly ["/api/overview"];
export declare const getGetOverviewQueryOptions: <TData = Awaited<ReturnType<typeof getOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOverview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOverviewQueryResult = NonNullable<Awaited<ReturnType<typeof getOverview>>>;
export type GetOverviewQueryError = ErrorType<unknown>;
/**
 * @summary Get aggregate overview stats
 */
export declare function useGetOverview<TData = Awaited<ReturnType<typeof getOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListExecutionsUrl: () => string;
/**
 * @summary List health check execution runs
 */
export declare const listExecutions: (options?: RequestInit) => Promise<Execution[]>;
export declare const getListExecutionsQueryKey: () => readonly ["/api/executions"];
export declare const getListExecutionsQueryOptions: <TData = Awaited<ReturnType<typeof listExecutions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listExecutions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listExecutions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListExecutionsQueryResult = NonNullable<Awaited<ReturnType<typeof listExecutions>>>;
export type ListExecutionsQueryError = ErrorType<unknown>;
/**
 * @summary List health check execution runs
 */
export declare function useListExecutions<TData = Awaited<ReturnType<typeof listExecutions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listExecutions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetExecutionUrl: (id: number) => string;
/**
 * @summary Get detailed results for a single execution run
 */
export declare const getExecution: (id: number, options?: RequestInit) => Promise<ExecutionDetail>;
export declare const getGetExecutionQueryKey: (id: number) => readonly [`/api/executions/${number}`];
export declare const getGetExecutionQueryOptions: <TData = Awaited<ReturnType<typeof getExecution>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getExecution>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getExecution>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetExecutionQueryResult = NonNullable<Awaited<ReturnType<typeof getExecution>>>;
export type GetExecutionQueryError = ErrorType<void>;
/**
 * @summary Get detailed results for a single execution run
 */
export declare function useGetExecution<TData = Awaited<ReturnType<typeof getExecution>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getExecution>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSettingsUrl: () => string;
/**
 * @summary Get current dashboard settings
 */
export declare const getSettings: (options?: RequestInit) => Promise<Settings>;
export declare const getGetSettingsQueryKey: () => readonly ["/api/settings"];
export declare const getGetSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSettings>>>;
export type GetSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get current dashboard settings
 */
export declare function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateSettingsUrl: () => string;
/**
 * @summary Update dashboard settings
 */
export declare const updateSettings: (settingsInput: SettingsInput, options?: RequestInit) => Promise<Settings>;
export declare const getUpdateSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SettingsInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SettingsInput>;
}, TContext>;
export type UpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSettings>>>;
export type UpdateSettingsMutationBody = BodyType<SettingsInput>;
export type UpdateSettingsMutationError = ErrorType<unknown>;
/**
* @summary Update dashboard settings
*/
export declare const useUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SettingsInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SettingsInput>;
}, TContext>;
export declare const getTestEndpointUrl: () => string;
/**
 * @summary Test a curl command without saving the endpoint
 */
export declare const testEndpoint: (endpointInput: EndpointInput, options?: RequestInit) => Promise<TestResult>;
export declare const getTestEndpointMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof testEndpoint>>, TError, {
        data: BodyType<EndpointInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof testEndpoint>>, TError, {
    data: BodyType<EndpointInput>;
}, TContext>;
export type TestEndpointMutationResult = NonNullable<Awaited<ReturnType<typeof testEndpoint>>>;
export type TestEndpointMutationBody = BodyType<EndpointInput>;
export type TestEndpointMutationError = ErrorType<unknown>;
/**
* @summary Test a curl command without saving the endpoint
*/
export declare const useTestEndpoint: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof testEndpoint>>, TError, {
        data: BodyType<EndpointInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof testEndpoint>>, TError, {
    data: BodyType<EndpointInput>;
}, TContext>;
export declare const getTriggerCheckUrl: () => string;
/**
 * @summary Trigger an immediate health check of all endpoints
 */
export declare const triggerCheck: (options?: RequestInit) => Promise<ExecutionDetail>;
export declare const getTriggerCheckMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof triggerCheck>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof triggerCheck>>, TError, void, TContext>;
export type TriggerCheckMutationResult = NonNullable<Awaited<ReturnType<typeof triggerCheck>>>;
export type TriggerCheckMutationError = ErrorType<unknown>;
/**
* @summary Trigger an immediate health check of all endpoints
*/
export declare const useTriggerCheck: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof triggerCheck>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof triggerCheck>>, TError, void, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map
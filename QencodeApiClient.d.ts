export type ConstructorOptions =
  | string
  | {
  key: string;
  endpoint?: string;
  version?: string;
};

declare class QencodeApiClient {
  constructor(options: ConstructorOptions);

  /**
   * {@link https://docs.qencode.com/api-reference/transcoding/#getting-access-token | Getting Access Token}
   */
  getAccessToken(): Promise<void>;

  /**
   * MISSING API DOCS
   */
  getTemplates(): Promise<any>;

  CreateTask(): Promise<TranscodingTask>;

  Request(path: string, parameters?: any, statusUrl?: string): Promise<any>;
}

export type CustomTaskResponse = {
  status_url: string;
  error: number;
};

export type GetStatusResponse = {
  status: 'downloading' | 'queued' | 'encoding' | 'saving' | 'completed';
  status_url: string;
  percent: number;
  error: 0 | 1;
  error_description: null | string;
  videos?: unknown[];
  audios?: unknown[];
  images?: unknown[];
};

/**
 * TODO: define query conform docs
 *
 * {@link https://docs.qencode.com/api-reference/transcoding/#start_encode2___query__attributes | Query Attributes}
 */
export type TaskQuery = unknown;

declare class TranscodingTask {
  api: QencodeApiClient;
  taskToken: string;
  uploadUrl: string;
  lastStatus: GetStatusResponse;

  constructor(api: QencodeApiClient, taskToken: string, uploadUrl: string);

  /**
   * {@link https://docs.qencode.com/api-reference/transcoding/#starting-a-task | Starting a Task}
   */
  StartCustom(taskParams: TaskQuery, payload?: any): Promise<CustomTaskResponse>;

  /**
   * TODO: complete status response
   *
   * {@link https://docs.qencode.com/api-reference/transcoding/#getting-status-of-tasks | Getting Status of Tasks}
   */
  GetStatus(): Promise<GetStatusResponse>;
}

export default QencodeApiClient;

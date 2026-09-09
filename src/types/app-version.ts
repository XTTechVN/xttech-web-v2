export interface AppVersionItem {
  id: number;
  platform: string;
  versionCode: number;
  versionName: string;
  apkUrl: string;
  forceUpdate: boolean;
  changelog: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AppVersionQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  platform?: string;
}

export interface LatestAppVersionResponse {
  platform: string;
  versionCode: number;
  versionName: string;
  apkUrl: string;
  forceUpdate: boolean;
  changelog: string[];
  releaseDate?: string | null;
}

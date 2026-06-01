import { Project } from './project';

export type Zone = {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  project?: Project;
};

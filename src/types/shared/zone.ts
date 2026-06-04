import { Project } from './project';

export type Zone = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  project?: Project;
};

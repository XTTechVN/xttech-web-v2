export interface Position {
  id: number;
  name: string;
  departmentId: number;
  department?: { id: number; name: string } | null;
  createdAt: string;
}
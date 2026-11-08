export interface DocumentSummary {
  id: string;
  filename: string;
  relative_path: string;
  extension: string | null;
  category?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  project?: string;
  documents?: DocumentSummary[];
  created_at?: string;
  updated_at?: string;
}

export interface FileItem {
  name: string;
  relative_path: string;
  is_dir: boolean;
  size_bytes: number;
  modified_at: string;
  extension?: string | null;
}

export interface AgentResponse {
  type: string;
  message: string;
  data?: any;
  action_taken?: string | null;
}

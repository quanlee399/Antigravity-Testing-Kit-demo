export interface TodoistTask {
  id?: string;
  project_id?: string;
  section_id?: string | null;
  content?: string;
  description?: string;
  is_completed?: boolean;
  labels?: string[];
  priority?: number;
  comment_count?: number;
  creator_id?: string;
  created_at?: string;
  due?: {
    date?: string;
    is_recurring?: boolean;
    datetime?: string;
    string?: string;
    timezone?: string;
  } | null;
  url?: string;
}

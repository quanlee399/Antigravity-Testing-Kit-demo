export interface TodoistProject {
  id?: string;
  name?: string;
  color?: string;
  parent_id?: string | null;
  order?: number;
  comment_count?: number;
  is_shared?: boolean;
  is_favorite?: boolean;
  is_inbox_project?: boolean;
  is_team_inbox?: boolean;
  is_archived?: boolean;
  view_style?: string;
  url?: string;
}

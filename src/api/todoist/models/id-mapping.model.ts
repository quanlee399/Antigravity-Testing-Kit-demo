export type ObjNameType = 
  | 'sections' 
  | 'tasks' 
  | 'comments' 
  | 'reminders' 
  | 'location_reminders' 
  | 'projects';

export interface IdMapping {
  old_id: string;
  new_id: string;
}

export type IdMappingResponse = IdMapping[];

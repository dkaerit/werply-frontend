export interface MutualData {
  _id: string;
  id1: string;
  id2: string;
  relationshipType: string;
  status: string;
 }

 export interface MutualState {
  mutuals: MutualData[]
 }
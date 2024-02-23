export interface PostData {
  _id: string;
   authorId: string;
   authorType: string;
   content: string;
   referencedUsers?: string[];
   diceResult?: Record<string, number>;
   comments?: string[];
 }
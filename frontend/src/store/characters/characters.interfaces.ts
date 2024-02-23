export interface CharacterField {
   fieldname: string;
   data: string;
 }

export interface Character {
   _id: string;
   ownerId: string;
   avatar: string;
   bio: string;
   nickname: string;
   pjname: string;
   shortFields?: CharacterField[];
   longFields?: CharacterField[];
 }
 
 export interface RootCharacterState {
   characters: Record<string, Character>;
   currentCharacter: Character;
 }
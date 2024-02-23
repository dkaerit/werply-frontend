// create-post.dto.ts

import { IsString, IsArray, IsOptional, ValidateNested, ValidateIf, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
   @ApiProperty() @IsString() readonly authorId: string;
   @ApiProperty() @IsString() readonly content: string;
   @ApiProperty() @IsArray() @IsOptional() readonly referencedUsers?: string[];
   @ApiProperty() @IsArray() @IsOptional() readonly diceResult?: Record<string, number>;
   @ApiProperty() @IsArray() @IsOptional() readonly comments?: string[];
}

export class AuthorDto {
   @IsString() @ValidateIf((o) => o.authorId === undefined) authorName: string;
   @IsString() @ValidateIf((o) => o.authorName === undefined) authorId: string;
   @IsString() authorType: string;
 }

 export class GetPostsFilterDto {
   @IsOptional() @IsString() globalAuthorType?: string;
   @IsOptional() @IsArray() @ValidateNested({ each: true }) authors?: AuthorDto[];
   @IsOptional() loadSide?: string;
   @IsOptional() @IsDate() referenceDate?: Date;
 }
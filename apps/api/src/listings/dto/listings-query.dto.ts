import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListingsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}

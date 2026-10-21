import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsBoolean,
  IsIn,
  IsNumber,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListingsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_rent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_rent?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value : ''))
  housing_type?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_surface?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'available_by must be YYYY-MM-DD' })
  available_by?: string;

  @IsOptional()
  @IsIn(['recent', 'price_asc', 'price_desc'])
  sort?: string;
}

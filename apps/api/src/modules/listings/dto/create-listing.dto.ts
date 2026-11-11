import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNumber,
  Matches,
  IsIn,
} from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @IsEnum(['studio', 't1', 't2', 't3_plus', 'shared_room'])
  housing_type: string;

  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @IsInt()
  @Min(0)
  @Max(10_000_000)
  rent_cents: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  charges_cents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  deposit_cents?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(9999)
  surface_m2?: number;

  @IsString()
  @MinLength(1)
  address_line: string;

  @IsString()
  @MinLength(1)
  city: string;

  @IsString()
  @MinLength(1)
  postal_code: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'available_from must be YYYY-MM-DD' })
  available_from: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'available_until must be YYYY-MM-DD' })
  available_until?: string;

  @IsOptional()
  @IsIn(['A', 'B', 'C', 'D', 'E', 'F'], { message: 'DPE grade G is not allowed' })
  dpe_grade?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;
}

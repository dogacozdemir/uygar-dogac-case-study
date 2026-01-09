import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsInt()
  @Min(1)
  @Max(3)
  urgency: number;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}


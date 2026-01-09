import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsObject, IsArray } from 'class-validator';

export class SendNotificationDto {
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}


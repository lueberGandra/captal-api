import { IsString, IsNumber, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsNumber()
    @Min(0)
    landArea: number;

    @IsNumber()
    @Min(0)
    estimatedCost: number;

    @IsNumber()
    @Min(0)
    expectedRevenue: number;

    @IsString()
    @IsOptional()
    description?: string;
} 

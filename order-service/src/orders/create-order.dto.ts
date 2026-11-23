import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  item: string;

  @IsInt()
  @Min(1)
  amount: number;
}
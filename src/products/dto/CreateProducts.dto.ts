import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProductsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber() 
  quantity: number;  

  @IsNumber()
  price: number;
}
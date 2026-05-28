export class GetProductsDto {
  constructor(readonly id: string, readonly name: string, readonly description: string, readonly quantity: number, readonly price: number) { }
}
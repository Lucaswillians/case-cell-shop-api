import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { ProductsEntity } from "src/products/products.entity";

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OrderEntity, (order) => order.items)
  order!: OrderEntity;

  @ManyToOne(() => ProductsEntity, { eager: true })
  product!: ProductsEntity;

  @Column()
  productName!: string;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;
}
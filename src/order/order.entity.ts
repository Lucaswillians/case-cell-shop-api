import { CheckoutStatus } from "src/enums/checkoutStatus";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItemEntity } from "./orderItem.entity";

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  customerName!: string;

  @Column()
  street!: string;

  @Column()
  city!: string;

  @Column()
  zipCode!: string;

  @Column({
    type: 'enum',
    enum: CheckoutStatus,
    default: CheckoutStatus.PENDING,
  })
  status!: CheckoutStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => OrderItemEntity, (item) => item.order, {
    cascade: true,
  })
  items!: OrderItemEntity[];
}
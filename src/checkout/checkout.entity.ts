import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductsEntity } from '../products/products.entity';
import { CheckoutStatus } from 'src/enums/checkoutStatus';

@Entity('checkouts')
export class CheckoutEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(
    () => ProductsEntity,
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  product!: ProductsEntity;

  @Column()
  productName!: string;

  @Column({
    type: 'integer',
  })
  quantity!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitPrice!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice!: number;

  @Column({
    type: 'enum',
    enum: CheckoutStatus,
    default: CheckoutStatus.PENDING,
  })
  status!: CheckoutStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
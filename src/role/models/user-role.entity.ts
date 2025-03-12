import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { AccountEntity } from '../../account/models/account.entity';
import { RoleEntity } from './role.entity';

@Entity({ schema: 'account', name: 'user_roles' })
@Index(['user_id', 'code'], { unique: true })
export class UserRoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('uuid')
  user_id: string;
  @Column('text')
  code: string;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;

  @ManyToOne(() => RoleEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'code',
    referencedColumnName: 'code',
  })
  role: RoleEntity;
}

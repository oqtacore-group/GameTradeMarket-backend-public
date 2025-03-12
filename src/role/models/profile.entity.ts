import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity({ schema: 'roles', name: 'profiles' })
export class ProfileEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('text')
  code: string;
  @Column('ltree')
  path: string;
  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({
    name: 'code',
    referencedColumnName: 'code',
  })
  role: RoleEntity;
}

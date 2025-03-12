import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProfileEntity } from './profile.entity';

@Entity({ schema: 'roles', name: 'roles' })
export class RoleEntity extends BaseEntity {
  @PrimaryColumn('text')
  code: string;
  @Column({ type: 'varchar', length: 128 })
  name: string;
  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  update_time: Date;

  @OneToMany(() => ProfileEntity, (p) => p.role)
  profiles: ProfileEntity[];
}

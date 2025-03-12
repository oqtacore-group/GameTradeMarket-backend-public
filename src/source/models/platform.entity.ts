import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'inventory', name: 'platforms' })
export class PlatformEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true })
  name: string;
}

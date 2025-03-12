import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'inventory', name: 'modes' })
export class ModeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true })
  name: string;
}

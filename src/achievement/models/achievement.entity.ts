import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'inventory', name: 'achievements' })
export class AchievementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  game_code: string;

  @Column('varchar')
  name: string;

  @Column('text')
  description: string;

  @Column('varchar')
  image_url: string;

  @Column('integer')
  score: number;
}

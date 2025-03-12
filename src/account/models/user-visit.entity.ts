import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity({ schema: 'account', name: 'user_visits' })
@Unique(['user_id', 'visited_at'])
export class UserVisitEntity extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', primary: false })
  user_id: string;

  @CreateDateColumn({ type: 'date' })
  visited_at: Date;
}

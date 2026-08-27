import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CompetencyEntity } from '../../competency/entities/competency.entity';
import { ToolEntity } from '../../tool/entities/tool.entity';
import { MethodEntity } from '../../method/entities/method.entity';
import { SkillEntity } from '../../skill/entities/skill.entity';

@Entity('subcompetency')
export class SubCompetencyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  title!: string;

  @Column({ type: 'int', nullable: false })
  weight!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  input?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  output?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  action?: string;

  @Column({ type: 'int', nullable: false })
  competency_id!: number;

  // Una sub_competency si riferisce a una competency
  @ManyToOne(
    () => CompetencyEntity,
    (competency) => competency.subcompetencies,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'competency_id' })
  competency?: Relation<CompetencyEntity>;

  // Molti a molti con tool
  @ManyToMany(() => ToolEntity)
  @JoinTable({
    name: 'tool_subcompetency',
    joinColumn: {
      name: 'subcompetency_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tool_id',
      referencedColumnName: 'id',
    },
  })
  tools?: Relation<ToolEntity>[];

  // Molti a molti con method
  @ManyToMany(() => MethodEntity)
  @JoinTable({
    name: 'method_subcompetency',
    joinColumn: {
      name: 'subcompetency_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'method_id',
      referencedColumnName: 'id',
    },
  })
  methods?: Relation<MethodEntity>[];

  // Molti a molti con skill
  @ManyToMany(() => SkillEntity)
  @JoinTable({
    name: 'skill_subcompetency',
    joinColumn: {
      name: 'subcompetency_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id',
    },
  })
  skills?: Relation<SkillEntity>[];
}

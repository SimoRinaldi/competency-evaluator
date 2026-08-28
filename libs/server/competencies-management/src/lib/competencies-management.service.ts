import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import {
  CreateCompetencyChainDto,
  CreateObservationObjectChainDto,
  CreateSubCompetencyChainDto,
  CreateIndicatorChainDto,
} from './dto/create-chain.dto';

import { CompetencyEntity } from './competency/entities/competency.entity';
import { SubCompetencyEntity } from './subcompetency/entities/subcompetency.entity';
import { ObservationObjectEntity } from './observation-object/entities/observation-object.entity';
import { IndicatorEntity } from './indicator/entities/indicator.entity';
import { RubricSetEntity } from './rubric/entities/rubric-set.entity';
import { RubricLevelEntity } from './rubric/entities/rubric-level.entity';
import { ToolEntity } from './tool/entities/tool.entity';
import { MethodEntity } from './method/entities/method.entity';
import { SkillEntity } from './skill/entities/skill.entity';
import { CreateRubricLevelDto } from './rubric/dto/create-rubric.dto';

@Injectable()
export class CompetenciesManagementService {
  constructor(private readonly dataSource: DataSource) {}

  // Salva in transazione tutta la catena delle competenze
  async handleCreateCompetencyChain(dto: CreateCompetencyChainDto): Promise<CompetencyEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // Creo la competenza
      const saved_competency = await this.createCompetencyChain(manager, dto);

      for (const subcompetency_dto of dto.subcompetencies) {
        const tools = await this.createToolsChain(manager, subcompetency_dto);
        const methods = await this.createMethodsChain(manager, subcompetency_dto);
        const skills = await this.createSkillsChain(manager, subcompetency_dto);

        const saved_subcompetency = await this.createSubCompetencyChain(
          manager,
          subcompetency_dto,
          saved_competency,
          tools,
          methods,
          skills,
        );

        // observation object
        const observation_object_dto = subcompetency_dto.observationObject;
        const saved_observation_object = await this.createObservationObjectsChain(
          manager,
          observation_object_dto,
          saved_subcompetency,
        );

        // Rubric e Indicatori
        saved_observation_object.indicators = await this.createIndicatorsChain(
          manager,
          observation_object_dto,
          saved_observation_object,
        );
      }

      await queryRunner.commitTransaction();
      return saved_competency;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Errore durante il salvataggio della catena di competenze. Operazione annullata.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Crea e salva l'entità principale della competenza
  async createCompetencyChain(
    manager: EntityManager,
    dto: CreateCompetencyChainDto,
  ): Promise<CompetencyEntity> {
    const competency = manager.create(CompetencyEntity, {
      title: dto.title,
      weight: dto.weight,
      threshold: dto.threshold,
    });

    return await manager.save(competency);
  }

  // Crea la subcompetency collegando tools, methods e skills
  async createSubCompetencyChain(
    manager: EntityManager,
    dto: CreateSubCompetencyChainDto,
    savedCompetency: CompetencyEntity,
    tools: ToolEntity[],
    methods: MethodEntity[],
    skills: SkillEntity[],
  ): Promise<SubCompetencyEntity> {
    const subcompetency = manager.create(SubCompetencyEntity, {
      title: dto.title,
      weight: dto.weight,
      input: dto.input,
      action: dto.action,
      output: dto.output,
      threshold: dto.threshold,
      competency: savedCompetency,
      tools,
      methods,
      skills,
    });
    return await manager.save(subcompetency);
  }

  // Recupera i tools esistenti tramite id o ne crea di nuovi
  async createToolsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
  ): Promise<ToolEntity[]> {
    const allTools = [];
    if (subcompetency_dto.tool_ids?.length) {
      const existingTools = await manager.findBy(ToolEntity, {
        id: In(subcompetency_dto.tool_ids),
      });
      allTools.push(...existingTools);
    }
    if (subcompetency_dto.tools?.length) {
      for (const tDto of subcompetency_dto.tools) {
        allTools.push(await manager.save(manager.create(ToolEntity, { name: tDto.name })));
      }
    }
    return allTools;
  }

  // Recupera i methods esistenti tramite id o ne crea di nuovi
  async createMethodsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
  ): Promise<MethodEntity[]> {
    const allMethods = [];
    if (subcompetency_dto.method_ids?.length) {
      const existingMethods = await manager.findBy(MethodEntity, {
        id: In(subcompetency_dto.method_ids),
      });
      allMethods.push(...existingMethods);
    }
    if (subcompetency_dto.methods?.length) {
      for (const mDto of subcompetency_dto.methods) {
        allMethods.push(await manager.save(manager.create(MethodEntity, { name: mDto.name })));
      }
    }
    return allMethods;
  }

  // Recupera le skills esistenti tramite id o ne crea di nuove
  async createSkillsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
  ): Promise<SkillEntity[]> {
    const allSkills = [];
    if (subcompetency_dto.skill_ids?.length) {
      const existingSkills = await manager.findBy(SkillEntity, {
        id: In(subcompetency_dto.skill_ids),
      });
      allSkills.push(...existingSkills);
    }
    if (subcompetency_dto.skills?.length) {
      for (const sDto of subcompetency_dto.skills) {
        allSkills.push(await manager.save(manager.create(SkillEntity, { name: sDto.name })));
      }
    }
    return allSkills;
  }

  // Crea l'observation object e lo associa alla subcompetency
  async createObservationObjectsChain(
    manager: EntityManager,
    objservation_object_dto: CreateObservationObjectChainDto,
    saved_subcompetency: SubCompetencyEntity,
  ): Promise<ObservationObjectEntity> {
    const obj = manager.create(ObservationObjectEntity, {
      description: objservation_object_dto.description,
      subcompetency: saved_subcompetency,
    });
    return await manager.save(obj);
  }

  // Crea gli indicatori associando l'observation object e il rubric set
  async createIndicatorsChain(
    manager: EntityManager,
    observation_object_dto: CreateObservationObjectChainDto,
    saved_observation_object: ObservationObjectEntity,
  ): Promise<IndicatorEntity[]> {
    const allIndicators = [];
    for (const indicator_dto of observation_object_dto.indicators) {
      const saved_rubric_set = await this.createRubricSetChain(manager, indicator_dto);

      const indicator = manager.create(IndicatorEntity, {
        description: indicator_dto.description,
        weight: indicator_dto.weight,
        rubric_set: saved_rubric_set,
        observation_object: saved_observation_object,
      });
      allIndicators.push(await manager.save(indicator));
    }
    return allIndicators;
  }

  // Recupera o crea il rubric set con i relativi livelli
  async createRubricSetChain(
    manager: EntityManager,
    indicator_dto: CreateIndicatorChainDto,
  ): Promise<RubricSetEntity> {
    if (indicator_dto.rubric_set_id) {
      // Usa esistente
      const savedRubricSet = await manager.findOneBy(RubricSetEntity, {
        id: indicator_dto.rubric_set_id,
      });
      if (!savedRubricSet) {
        throw new BadRequestException(`RubricSet ID ${indicator_dto.rubric_set_id} non trovato`);
      }
      return savedRubricSet;
    } else if (indicator_dto.rubricSet) {
      // Crea nuovo
      const rubricSet = manager.create(RubricSetEntity, { yes_no: indicator_dto.rubricSet.yes_no });
      const savedRubricSet = await manager.save(rubricSet);

      await this.createRubricLevelsChain(manager, indicator_dto.rubricSet.levels, savedRubricSet);
      return savedRubricSet;
    } else {
      throw new BadRequestException('Devi fornire rubric_set_id oppure rubricSet');
    }
  }

  // Crea e salva i singoli livelli associati al rubric set
  async createRubricLevelsChain(
    manager: EntityManager,
    levels_dto: CreateRubricLevelDto[],
    savedRubricSet: RubricSetEntity,
  ): Promise<RubricLevelEntity[]> {
    const savedLevels = [];
    for (const levelDto of levels_dto) {
      const level = await manager.save(
        manager.create(RubricLevelEntity, {
          description: levelDto.description,
          rank: levelDto.rank,
          rubric_set: savedRubricSet,
        }),
      );
      savedLevels.push(level);
    }
    return savedLevels;
  }
}

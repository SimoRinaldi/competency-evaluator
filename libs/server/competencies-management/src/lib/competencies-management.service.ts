import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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

import { RubricService } from './rubric/rubric.service';

@Injectable()
export class CompetenciesManagementService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly rubricService: RubricService,
  ) {}

  // Salva in transazione tutta la catena delle competenze
  async handleCreateCompetencyChain(dto: CreateCompetencyChainDto): Promise<CompetencyEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Cache di sessione per evitare duplicati all'interno della stessa richiesta
    const toolsCache = new Map<string, ToolEntity>();
    const methodsCache = new Map<string, MethodEntity>();
    const skillsCache = new Map<string, SkillEntity>();
    const rubricSetsCache: RubricSetEntity[] = [];

    try {
      const manager = queryRunner.manager;

      // Creo la competenza
      const saved_competency = await this.createCompetencyChain(manager, dto);

      for (const subcompetency_dto of dto.subcompetencies) {
        const tools = await this.createToolsChain(manager, subcompetency_dto, toolsCache);
        const methods = await this.createMethodsChain(manager, subcompetency_dto, methodsCache);
        const skills = await this.createSkillsChain(manager, subcompetency_dto, skillsCache);

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
          rubricSetsCache,
        );
      }

      await queryRunner.commitTransaction();
      return saved_competency;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
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

  // Recupera i tools esistenti tramite id o ne cerca/crea di nuovi senza duplicati
  async createToolsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
    toolsCache: Map<string, ToolEntity>,
  ): Promise<ToolEntity[]> {
    const allTools: ToolEntity[] = [];
    if (subcompetency_dto.tool_ids?.length) {
      const existingTools = await manager.findBy(ToolEntity, {
        id: In(subcompetency_dto.tool_ids),
      });
      allTools.push(...existingTools);
    }
    if (subcompetency_dto.tools?.length) {
      for (const tool_dto of subcompetency_dto.tools) {
        if (toolsCache.has(tool_dto.name)) {
          allTools.push(toolsCache.get(tool_dto.name)!);
          continue;
        }

        let tool = await manager.findOne(ToolEntity, { where: { name: tool_dto.name } });
        if (!tool) {
          tool = await manager.save(manager.create(ToolEntity, { name: tool_dto.name }));
        }
        toolsCache.set(tool_dto.name, tool);
        allTools.push(tool);
      }
    }
    return allTools;
  }

  // Recupera i methods esistenti tramite id o ne cerca/crea di nuovi senza duplicati
  async createMethodsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
    methodsCache: Map<string, MethodEntity>,
  ): Promise<MethodEntity[]> {
    const allMethods: MethodEntity[] = [];
    if (subcompetency_dto.method_ids?.length) {
      const existingMethods = await manager.findBy(MethodEntity, {
        id: In(subcompetency_dto.method_ids),
      });
      allMethods.push(...existingMethods);
      for (const m of existingMethods) {
        methodsCache.set(m.name, m);
      }
    }
    if (subcompetency_dto.methods?.length) {
      for (const mDto of subcompetency_dto.methods) {
        if (methodsCache.has(mDto.name)) {
          allMethods.push(methodsCache.get(mDto.name)!);
          continue;
        }

        let method = await manager.findOne(MethodEntity, { where: { name: mDto.name } });
        if (!method) {
          method = await manager.save(manager.create(MethodEntity, { name: mDto.name }));
        }
        methodsCache.set(mDto.name, method);
        allMethods.push(method);
      }
    }
    return allMethods;
  }

  // Recupera le skills esistenti tramite id o ne cerca/crea di nuove senza duplicati
  async createSkillsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
    skillsCache: Map<string, SkillEntity>,
  ): Promise<SkillEntity[]> {
    const allSkills: SkillEntity[] = [];
    if (subcompetency_dto.skill_ids?.length) {
      const existingSkills = await manager.findBy(SkillEntity, {
        id: In(subcompetency_dto.skill_ids),
      });
      allSkills.push(...existingSkills);
      for (const s of existingSkills) {
        skillsCache.set(s.name, s);
      }
    }
    if (subcompetency_dto.skills?.length) {
      for (const sDto of subcompetency_dto.skills) {
        if (skillsCache.has(sDto.name)) {
          allSkills.push(skillsCache.get(sDto.name)!);
          continue;
        }

        let skill = await manager.findOne(SkillEntity, { where: { name: sDto.name } });
        if (!skill) {
          skill = await manager.save(manager.create(SkillEntity, { name: sDto.name }));
        }
        skillsCache.set(sDto.name, skill);
        allSkills.push(skill);
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
    rubricSetsCache: RubricSetEntity[],
  ): Promise<IndicatorEntity[]> {
    const allIndicators = [];
    for (const indicator_dto of observation_object_dto.indicators) {
      const saved_rubric_set = await this.createRubricSetChain(
        manager,
        indicator_dto,
        rubricSetsCache,
      );

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

  // Recupera o crea il rubric set con i relativi livelli (find-or-create)
  async createRubricSetChain(
    manager: EntityManager,
    indicator_dto: CreateIndicatorChainDto,
    rubricSetsCache: RubricSetEntity[],
  ): Promise<RubricSetEntity> {
    if (indicator_dto.rubric_set_id) {
      // Usa esistente
      const savedRubricSet = await manager.findOne(RubricSetEntity, {
        where: { id: indicator_dto.rubric_set_id },
        relations: ['levels'],
      });
      if (!savedRubricSet) {
        throw new BadRequestException(`RubricSet ID ${indicator_dto.rubric_set_id} non trovato`);
      }
      return savedRubricSet;
    } else if (indicator_dto.rubricSet) {
      const levels = indicator_dto.rubricSet.levels;

      // 1. Controlla prima nella cache dei rubric set creati/usati in questa transazione
      const cached = rubricSetsCache.find((set) => {
        if (!set.levels || set.levels.length !== levels.length) return false;
        return set.levels.every((existingLevel) =>
          levels.some(
            (newLevel) =>
              newLevel.description === existingLevel.description &&
              newLevel.rank === existingLevel.rank,
          ),
        );
      });
      if (cached) {
        return cached;
      }

      // 2. Controlla nel DB se esiste già un rubric set corrispondente
      const existingInDb = await this.rubricService.findMatchingRubricSet(levels);
      if (existingInDb) {
        rubricSetsCache.push(existingInDb);
        return existingInDb;
      }

      // 3. Altrimenti crea nuovo
      const rubricSet = manager.create(RubricSetEntity, { yes_no: indicator_dto.rubricSet.yes_no });
      const savedRubricSet = await manager.save(rubricSet);

      const savedLevels = await this.createRubricLevelsChain(
        manager,
        indicator_dto.rubricSet.levels,
        savedRubricSet,
      );
      savedRubricSet.levels = savedLevels;
      rubricSetsCache.push(savedRubricSet);

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

import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import {
  CreateCompetencyChainDto,
  CreateObservationObjectChainDto,
  CreateSubCompetencyChainDto,
  CreateIndicatorChainDto,
} from './dto/create-chain.dto';
import { UpdateCompetencyChainDto } from './dto/update-chain.dto';

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

  // Salva l'intera catena di competenze dentro una singola transazione (o tutto o niente)
  async handleCreateCompetencyChain(dto: CreateCompetencyChainDto): Promise<CompetencyEntity> {
    if (!dto.subcompetencies || dto.subcompetencies.length === 0) {
      throw new BadRequestException('La competenza deve contenere almeno una sotto-competenza');
    }

    const query_runner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();

    try {
      const manager = query_runner.manager;

      // 1. Creiamo al volo la competenza principale
      const saved_competency = await this.createCompetencyChain(manager, dto);

      // 2. Creiamo ricorsivamente tutte le sotto-competenze e i loro figli
      await this.syncSubCompetenciesChain(manager, saved_competency, dto.subcompetencies);

      // 3. Ricarichiamo l'albero completo pulito per restituirlo al client
      const result = await manager.findOne(CompetencyEntity, {
        where: { id: saved_competency.id },
        relations: {
          subcompetencies: {
            observation_object: {
              indicators: {
                rubric_set: {
                  levels: true,
                },
              },
            },
            tools: true,
            methods: true,
            skills: true,
          },
        },
      });

      await query_runner.commitTransaction();
      return result ?? saved_competency;
    } catch (error) {
      await query_runner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Errore durante il salvataggio della catena di competenze: ${
          (error as Error).message || 'Operazione annullata.'
        }`,
      );
    } finally {
      await query_runner.release();
    }
  }

  // Aggiorna la catena in modo intelligente (diffing/upsert): non distrugge tutto ma aggiorna chi esiste già
  async handleUpdateCompetencyChain(
    id: number,
    dto: CreateCompetencyChainDto | UpdateCompetencyChainDto,
  ): Promise<CompetencyEntity> {
    const query_runner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();

    try {
      const manager = query_runner.manager;
      const existing_competency = await manager.findOne(CompetencyEntity, {
        where: { id },
        relations: {
          subcompetencies: {
            observation_object: {
              indicators: true,
            },
            tools: true,
            methods: true,
            skills: true,
          },
        },
      });

      if (!existing_competency) {
        throw new NotFoundException(`Competenza con id ${id} non trovata`);
      }

      // Se l'utente ha cambiato il titolo, controlliamo che non vada in conflitto con un'altra competenza
      if (dto.title && dto.title !== existing_competency.title) {
        const conflict = await manager.findOne(CompetencyEntity, {
          where: { title: dto.title },
        });
        if (conflict && conflict.id !== id) {
          throw new ConflictException(`Competenza con titolo "${dto.title}" già esistente`);
        }
        existing_competency.title = dto.title;
      }

      if (dto.weight !== undefined) {
        existing_competency.weight = dto.weight;
      }

      // Se nel payload ci sono le sotto-competenze facciamo il diffing/upsert gerarchico
      if (dto.subcompetencies) {
        if (dto.subcompetencies.length === 0) {
          throw new BadRequestException(
            'La competenza deve contenere almeno una sotto-competenza',
          );
        }
        await this.syncSubCompetenciesChain(
          manager,
          existing_competency,
          dto.subcompetencies as CreateSubCompetencyChainDto[],
        );
      } else {
        // Se abbiamo modificato solo titolo/peso della competenza radice, aggiorniamo solo lei
        await manager.update(CompetencyEntity, existing_competency.id, {
          title: existing_competency.title,
          weight: existing_competency.weight,
        });
      }

      // Recuperiamo l'albero aggiornato dal database prima di inviarlo al client
      const updated_competency = await manager.findOne(CompetencyEntity, {
        where: { id },
        relations: {
          subcompetencies: {
            observation_object: {
              indicators: {
                rubric_set: {
                  levels: true,
                },
              },
            },
            tools: true,
            methods: true,
            skills: true,
          },
        },
      });

      await query_runner.commitTransaction();
      return updated_competency ?? existing_competency;
    } catch (error) {
      await query_runner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Errore durante l'aggiornamento della catena di competenze: ${
          (error as Error).message || 'Operazione annullata.'
        }`,
      );
    } finally {
      await query_runner.release();
    }
  }

  // Crea l'entità principale per la competenza (controllando che il titolo non esista già)
  async createCompetencyChain(
    manager: EntityManager,
    dto: CreateCompetencyChainDto,
  ): Promise<CompetencyEntity> {
    const existing_competency = await manager.findOne(CompetencyEntity, {
      where: { title: dto.title },
    });
    if (existing_competency) {
      throw new ConflictException(`Competenza con titolo "${dto.title}" già esistente`);
    }

    const competency = manager.create(CompetencyEntity, {
      title: dto.title,
      weight: dto.weight,
      threshold: 0,
    });

    return await manager.save(competency);
  }

  // Sincronizza le sotto-competenze: aggiorna quelle con ID, crea quelle nuove e cancella quelle omesse
  async syncSubCompetenciesChain(
    manager: EntityManager,
    competency: CompetencyEntity,
    subcompetency_dtos: CreateSubCompetencyChainDto[],
  ): Promise<void> {
    // Controllo rapido per evitare titoli duplicati all'interno della stessa richiesta
    const seen_sub_titles = new Set<string>();
    for (const sub_dto of subcompetency_dtos) {
      if (seen_sub_titles.has(sub_dto.title)) {
        throw new BadRequestException(
          `Titolo sotto-competenza duplicato nella richiesta: "${sub_dto.title}"`,
        );
      }
      seen_sub_titles.add(sub_dto.title);
    }

    // Cache temporanee per non fare mille query identiche a DB nella stessa transazione
    const tools_cache = new Map<string, ToolEntity>();
    const methods_cache = new Map<string, MethodEntity>();
    const skills_cache = new Map<string, SkillEntity>();
    const rubric_sets_cache: RubricSetEntity[] = [];

    // Carichiamo le sotto-competenze attualmente presenti a DB per questa competenza
    const existing_subs =
      competency.subcompetencies ??
      (await manager.find(SubCompetencyEntity, {
        where: { competency_id: competency.id },
        relations: {
          observation_object: {
            indicators: true,
          },
          tools: true,
          methods: true,
          skills: true,
        },
      }));

    const existing_sub_map = new Map<number, SubCompetencyEntity>(
      existing_subs.map((s) => [s.id, s]),
    );
    const handled_sub_ids = new Set<number>();

    // Usiamo un oggetto leggero (solo id) per evitare che TypeORM vada in loop ricorsivo durante i save
    const shallow_competency = { id: competency.id } as CompetencyEntity;

    for (const sub_dto of subcompetency_dtos) {
      // Risolviamo (o creiamo) gli strumenti, metodi e abilità collegati
      const tools = await this.createToolsChain(manager, sub_dto, tools_cache);
      const methods = await this.createMethodsChain(manager, sub_dto, methods_cache);
      const skills = await this.createSkillsChain(manager, sub_dto, skills_cache);

      let saved_sub: SubCompetencyEntity;

      if (sub_dto.id) {
        // --- CASO UPDATE: La sotto-competenza ha un ID, quindi la aggiorniamo in-place ---
        const existing_sub = existing_sub_map.get(sub_dto.id);
        if (!existing_sub) {
          throw new NotFoundException(
            `Sotto-competenza con ID ${sub_dto.id} non trovata per questa competenza`,
          );
        }

        // Se il titolo è cambiato, verifichiamo che non collida con un'altra sotto-competenza
        if (sub_dto.title !== existing_sub.title) {
          const conflict = await manager.findOne(SubCompetencyEntity, {
            where: { title: sub_dto.title },
          });
          if (conflict && conflict.id !== existing_sub.id) {
            throw new ConflictException(
              `Sotto-competenza con titolo "${sub_dto.title}" già esistente`,
            );
          }
        }

        existing_sub.title = sub_dto.title;
        existing_sub.weight = sub_dto.weight;
        existing_sub.input = sub_dto.input;
        existing_sub.output = sub_dto.output;
        existing_sub.action = sub_dto.action;
        existing_sub.threshold = sub_dto.threshold;
        existing_sub.competency = shallow_competency;
        existing_sub.competency_id = competency.id;
        existing_sub.tools = tools;
        existing_sub.methods = methods;
        existing_sub.skills = skills;

        saved_sub = await manager.save(existing_sub);
      } else {
        // Creo nuovo
        const conflict = await manager.findOne(SubCompetencyEntity, {
          where: { title: sub_dto.title },
        });
        if (conflict) {
          throw new ConflictException(
            `Sotto-competenza con titolo "${sub_dto.title}" già esistente`,
          );
        }

        const new_sub = manager.create(SubCompetencyEntity, {
          title: sub_dto.title,
          weight: sub_dto.weight,
          input: sub_dto.input,
          output: sub_dto.output,
          action: sub_dto.action,
          threshold: sub_dto.threshold,
          competency: shallow_competency,
          competency_id: competency.id,
          tools,
          methods,
          skills,
        });

        saved_sub = await manager.save(new_sub);
      }

      handled_sub_ids.add(saved_sub.id);

      // Scendiamo di un livello: sincronizziamo l'oggetto di osservazione e i suoi indicatori
      await this.syncObservationObjectChain(
        manager,
        sub_dto.observationObject,
        saved_sub,
        rubric_sets_cache,
      );
    }

    // Quelle che erano nel DB ma non sono state inviate nel payload vengono rimosse
    const subs_to_remove = existing_subs.filter((s) => !handled_sub_ids.has(s.id));
    if (subs_to_remove.length > 0) {
      await manager.remove(subs_to_remove);
    }

    // Ricalcoliamo al volo la soglia totale della competenza come somma delle sotto-competenze
    const comp_threshold = subcompetency_dtos.reduce((sum, sub) => sum + sub.threshold, 0);
    competency.threshold = comp_threshold;
    await manager.update(CompetencyEntity, competency.id, {
      title: competency.title,
      weight: competency.weight,
      threshold: comp_threshold,
    });
  }

  // Sincronizza l'oggetto di osservazione associato alla sotto-competenza (1 a 1)
  async syncObservationObjectChain(
    manager: EntityManager,
    observation_object_dto: CreateObservationObjectChainDto,
    subcompetency: SubCompetencyEntity,
    rubric_sets_cache: RubricSetEntity[],
  ): Promise<ObservationObjectEntity> {
    if (!observation_object_dto) {
      throw new BadRequestException('Oggetto di osservazione mancante per la sotto-competenza');
    }

    const shallow_sub = { id: subcompetency.id } as SubCompetencyEntity;

    let observation_object =
      subcompetency.observation_object ??
      (await manager.findOne(ObservationObjectEntity, {
        where: { subcompetency_id: subcompetency.id },
        relations: ['indicators'],
      }));

    if (observation_object) {
      observation_object.description = observation_object_dto.description;
      observation_object.subcompetency = shallow_sub;
      observation_object.subcompetency_id = subcompetency.id;
      observation_object = await manager.save(observation_object);
    } else {
      observation_object = manager.create(ObservationObjectEntity, {
        description: observation_object_dto.description,
        subcompetency: shallow_sub,
        subcompetency_id: subcompetency.id,
      });
      observation_object = await manager.save(observation_object);
    }

    // Sincronizziamo tutti gli indicatori collegati a questo oggetto di osservazione
    observation_object.indicators = await this.syncIndicatorsChain(
      manager,
      observation_object_dto.indicators,
      observation_object,
      rubric_sets_cache,
    );

    return observation_object;
  }

  // Sincronizza gli indicatori: aggiorna quelli con ID, inserisce i nuovi e cancella i rimossi
  async syncIndicatorsChain(
    manager: EntityManager,
    indicator_dtos: CreateIndicatorChainDto[],
    observation_object: ObservationObjectEntity,
    rubric_sets_cache: RubricSetEntity[],
  ): Promise<IndicatorEntity[]> {
    if (!indicator_dtos || indicator_dtos.length === 0) {
      throw new BadRequestException(
        "L'oggetto di osservazione deve contenere almeno un indicatore",
      );
    }

    const shallow_obs = { id: observation_object.id } as ObservationObjectEntity;

    const existing_indicators =
      observation_object.indicators ??
      (await manager.findBy(IndicatorEntity, {
        observation_object_id: observation_object.id,
      }));

    const existing_ind_map = new Map<number, IndicatorEntity>(
      existing_indicators.map((i) => [i.id, i]),
    );
    const handled_ind_ids = new Set<number>();
    const saved_indicators: IndicatorEntity[] = [];

    for (const ind_dto of indicator_dtos) {
      // Risolviamo o creiamo la rubrica associata
      const rubric_set = await this.createRubricSetChain(manager, ind_dto, rubric_sets_cache);
      const shallow_rubric = { id: rubric_set.id } as RubricSetEntity;

      if (ind_dto.id) {
        // Modifica indicatore esistente
        const existing_ind = existing_ind_map.get(ind_dto.id);
        if (!existing_ind) {
          throw new NotFoundException(
            `Indicatore con ID ${ind_dto.id} non trovato per questo oggetto di osservazione`,
          );
        }

        existing_ind.description = ind_dto.description;
        existing_ind.weight = ind_dto.weight;
        existing_ind.rubric_set = shallow_rubric;
        existing_ind.rubric_set_id = rubric_set.id;
        existing_ind.observation_object = shallow_obs;
        existing_ind.observation_object_id = observation_object.id;

        const saved = await manager.save(existing_ind);
        handled_ind_ids.add(saved.id);
        saved_indicators.push(saved);
      } else {
        // Creazione nuovo indicatore
        const new_ind = manager.create(IndicatorEntity, {
          description: ind_dto.description,
          weight: ind_dto.weight,
          rubric_set: shallow_rubric,
          rubric_set_id: rubric_set.id,
          observation_object: shallow_obs,
          observation_object_id: observation_object.id,
        });
        const saved = await manager.save(new_ind);
        handled_ind_ids.add(saved.id);
        saved_indicators.push(saved);
      }
    }

    // Pulizia: eliminiamo gli indicatori che non compaiono più nel payload
    const inds_to_remove = existing_indicators.filter((i) => !handled_ind_ids.has(i.id));
    if (inds_to_remove.length > 0) {
      await manager.remove(inds_to_remove);
    }

    return saved_indicators;
  }

  // Funzione generica DRY per risolvere Tools, Metodi o Skills (sia tramite ID esistente che tramite nome)
  private async resolveEntitiesChain<T extends { id: number; name: string }>(
    manager: EntityManager,
    entity_class: new () => T,
    entity_label: string,
    ids?: number[],
    dtos?: { name: string }[],
    cache?: Map<string, T>,
  ): Promise<T[]> {
    const result: T[] = [];
    const local_cache = cache ?? new Map<string, T>();

    // 1. Se ci hanno passato degli ID numerici, li andiamo a pescare dal DB
    if (ids?.length) {
      const existing = (await manager.findBy(entity_class as unknown as { new (): T }, {
        id: In(ids),
      } as never)) as unknown as T[];

      if (existing.length !== ids.length) {
        const found_ids = new Set(existing.map((e) => e.id));
        const missing_ids = ids.filter((id) => !found_ids.has(id));
        throw new NotFoundException(
          `${entity_label} non trovati per gli ID: ${missing_ids.join(', ')}`,
        );
      }
      result.push(...existing);
      for (const e of existing) {
        local_cache.set(e.name, e);
      }
    }

    // 2. Se ci hanno passato oggetti inline con il nome, facciamo un find-or-create con cache locale
    if (dtos?.length) {
      for (const dto of dtos) {
        const cached = local_cache.get(dto.name);
        if (cached) {
          result.push(cached);
          continue;
        }

        let entity = (await manager.findOne(entity_class as unknown as { new (): T }, {
          where: { name: dto.name } as never,
        })) as unknown as T | null;

        if (!entity) {
          entity = (await manager.save(
            manager.create(entity_class as unknown as { new (): T }, { name: dto.name } as never),
          )) as unknown as T;
        }

        local_cache.set(dto.name, entity);
        result.push(entity);
      }
    }

    return result;
  }

  // Wrapper per gestire gli strumenti (Tools)
  async createToolsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
    tools_cache: Map<string, ToolEntity>,
  ): Promise<ToolEntity[]> {
    return this.resolveEntitiesChain(
      manager,
      ToolEntity,
      'Strumenti (tools)',
      subcompetency_dto.tool_ids,
      subcompetency_dto.tools,
      tools_cache,
    );
  }

  // Wrapper per gestire i metodi (Methods)
  async createMethodsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
    methods_cache: Map<string, MethodEntity>,
  ): Promise<MethodEntity[]> {
    return this.resolveEntitiesChain(
      manager,
      MethodEntity,
      'Metodi (methods)',
      subcompetency_dto.method_ids,
      subcompetency_dto.methods,
      methods_cache,
    );
  }

  // Wrapper per gestire le abilità/conoscenze (Skills)
  async createSkillsChain(
    manager: EntityManager,
    subcompetency_dto: CreateSubCompetencyChainDto,
    skills_cache: Map<string, SkillEntity>,
  ): Promise<SkillEntity[]> {
    return this.resolveEntitiesChain(
      manager,
      SkillEntity,
      'Abilità (skills)',
      subcompetency_dto.skill_ids,
      subcompetency_dto.skills,
      skills_cache,
    );
  }

  // Recupera o crea il rubric set corrispondente (cerca prima in cache, poi a DB, altrimenti crea nuovo)
  async createRubricSetChain(
    manager: EntityManager,
    indicator_dto: CreateIndicatorChainDto,
    rubric_sets_cache: RubricSetEntity[],
  ): Promise<RubricSetEntity> {
    if (indicator_dto.rubric_set_id) {
      // Se l'ID è già fornito, lo carichiamo direttamente
      const saved_rubric_set = await manager.findOne(RubricSetEntity, {
        where: { id: indicator_dto.rubric_set_id },
        relations: ['levels'],
      });
      if (!saved_rubric_set) {
        throw new NotFoundException(`RubricSet con ID ${indicator_dto.rubric_set_id} non trovato`);
      }
      return saved_rubric_set;
    } else if (indicator_dto.rubricSet) {
      const levels = indicator_dto.rubricSet.levels;
      if (!levels || levels.length === 0) {
        throw new BadRequestException('Il set di rubriche deve contenere almeno un livello');
      }

      // 1. Controlliamo se un set identico è già stato istanziato in questa transazione
      const cached = rubric_sets_cache.find((set) => {
        if (!set.levels || set.levels.length !== levels.length) return false;
        return set.levels.every((existing_level) =>
          levels.some(
            (new_level) =>
              new_level.description === existing_level.description &&
              new_level.rank === existing_level.rank,
          ),
        );
      });
      if (cached) {
        return cached;
      }

      // 2. Verifichiamo se esiste già a database un set con gli stessi identici livelli
      const existing_in_db = await this.rubricService.findMatchingRubricSet(levels);
      if (existing_in_db) {
        rubric_sets_cache.push(existing_in_db);
        return existing_in_db;
      }

      // 3. Se non esiste da nessuna parte, ne creiamo uno nuovo con i suoi livelli
      const rubric_set = manager.create(RubricSetEntity, {
        yes_no: indicator_dto.rubricSet.yes_no,
      });
      const saved_rubric_set = await manager.save(rubric_set);

      const saved_levels = await this.createRubricLevelsChain(
        manager,
        indicator_dto.rubricSet.levels,
        saved_rubric_set,
      );
      saved_rubric_set.levels = saved_levels;
      rubric_sets_cache.push(saved_rubric_set);

      return saved_rubric_set;
    } else {
      throw new BadRequestException(
        "È necessario fornire 'rubric_set_id' oppure 'rubricSet' per ciascun indicatore",
      );
    }
  }

  // Salva singolarmente i livelli di una nuova rubrica
  async createRubricLevelsChain(
    manager: EntityManager,
    levels_dto: CreateRubricLevelDto[],
    saved_rubric_set: RubricSetEntity,
  ): Promise<RubricLevelEntity[]> {
    const saved_levels = [];
    for (const level_dto of levels_dto) {
      const level = await manager.save(
        manager.create(RubricLevelEntity, {
          description: level_dto.description,
          rank: level_dto.rank,
          rubric_set: saved_rubric_set,
        }),
      );
      saved_levels.push(level);
    }
    return saved_levels;
  }
}

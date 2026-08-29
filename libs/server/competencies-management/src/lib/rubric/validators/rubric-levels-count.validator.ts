import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const YES_NO_LEVELS_COUNT = 2;
export const STANDARD_LEVELS_COUNT = 5;

/**
 * Valida la conformità strutturale dei livelli della rubrica.
 * Ritorna null se valido, oppure la stringa con il messaggio di errore se non valido.
 */
export function validateRubricLevelsStructure(
  yes_no: boolean | undefined,
  levels: Array<{ rank?: number }> | unknown,
): string | null {
  if (!Array.isArray(levels)) {
    return 'I livelli devono essere un array.';
  }

  const ranks = levels
    .map((l) => (l && typeof l.rank === 'number' ? l.rank : null))
    .filter((r): r is number => r !== null)
    .sort((a, b) => a - b);

  if (levels.length !== ranks.length) {
    return 'Ogni livello deve avere un rank numerico valido.';
  }

  if (yes_no === true) {
    if (ranks.length !== YES_NO_LEVELS_COUNT || ranks[0] !== 1 || ranks[1] !== 5) {
      return `Se yes_no è true, devono esserci esattamente ${YES_NO_LEVELS_COUNT} livelli con rank 1 e 5.`;
    }
  } else if (yes_no === false) {
    if (ranks.length !== STANDARD_LEVELS_COUNT || ranks.join(',') !== '1,2,3,4,5') {
      return `Se yes_no è false, devono esserci esattamente ${STANDARD_LEVELS_COUNT} livelli con rank da 1 a 5.`;
    }
  } else {
    return 'Il campo yes_no è obbligatorio.';
  }

  return null;
}

export function IsRubricLevelsCountValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRubricLevelsCountValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(levels: unknown, args: ValidationArguments) {
          const { yes_no } = args.object as { yes_no?: boolean };
          return validateRubricLevelsStructure(yes_no, levels) === null;
        },
        defaultMessage(args: ValidationArguments) {
          const { yes_no } = args.object as { yes_no?: boolean };
          return (
            validateRubricLevelsStructure(yes_no, args.value) ??
            'Livelli della rubrica non validi.'
          );
        },
      },
    });
  };
}

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const YES_NO_LEVELS_COUNT = 2;
export const STANDARD_LEVELS_COUNT = 5;

export function IsRubricLevelsCountValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRubricLevelsCountValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(levels: unknown, args: ValidationArguments) {
          if (!Array.isArray(levels)) return false;
          const { yes_no } = args.object as { yes_no?: boolean };
          if (yes_no === true) return levels.length === YES_NO_LEVELS_COUNT;
          if (yes_no === false) return levels.length === STANDARD_LEVELS_COUNT;
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const { yes_no } = args.object as { yes_no?: boolean };
          return yes_no === true
            ? `Se yes_no è true, devono esserci esattamente ${YES_NO_LEVELS_COUNT} livelli.`
            : `Se yes_no è false, devono esserci esattamente ${STANDARD_LEVELS_COUNT} livelli.`;
        },
      },
    });
  };
}

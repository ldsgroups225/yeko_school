/**
 * Supported case types for conversion.
 */
export type CaseType =
  | 'camelCase'
  | 'snakeCase'
  | 'kebabCase'
  | 'pascalCase'
  | 'screamingSnakeCase'
  | 'dotCase'

/**
 * Options for case conversion.
 *
 * @property {boolean} [preserveConsecutiveUppercase=false] - Whether to preserve consecutive uppercase letters as a group.
 * @property {string[]} [preserveSpecificKeys=[]] - Array of keys to exclude from case conversion.
 */
export interface ConvertCaseOptions {
  preserveConsecutiveUppercase?: boolean
  preserveSpecificKeys?: string[]
}

const defaultConverters: Record<CaseType, (str: string) => string> = {
  camelCase: str => str.replace(/[-_.](\w)/g, (_, c) => c.toUpperCase()),
  snakeCase: str =>
    str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/[-.]/g, '_'),
  kebabCase: str =>
    str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')
      .replace(/[_.]/g, '-'),
  pascalCase: str =>
    str
      .split(/[-_.]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(''),
  screamingSnakeCase: str =>
    str
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '')
      .replace(/[-.]/g, '_'),
  dotCase: str =>
    str
      .replace(/([A-Z])/g, '.$1')
      .toLowerCase()
      .replace(/^\./, '')
      .replace(/[-_]/g, '.'),
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

/**
 * Converts keys of the object `T` to the specified case type.
 */
export type ConvertCase<T> = T extends Record<string, any>
  ? { [K in keyof T as ConvertKey<K & string>]: ConvertCase<T[K]> }
  : T

// Helper type to convert individual keys

type ConvertKey<Key extends string> =
// Add specific case conversions here as needed
    Key // Here you would add more logic to handle case conversion if necessary

/**
 * Class for performing case conversion on objects.
 */
class CaseConverter {
  private readonly options: Required<ConvertCaseOptions>

  /**
   * Creates an instance of CaseConverter.
   *
   * @param toCaseType - The target case type for conversion.
   * @param options - Options for case conversion.
   */
  constructor(
    private toCaseType: CaseType,
      options: ConvertCaseOptions = {},
  ) {
    this.options = {
      preserveConsecutiveUppercase: false,
      preserveSpecificKeys: [],
      ...options,
    }
  }

  /**
   * Converts a single string to the target case.
   *
   * @private
   * @param str - The string to convert.
   * @returns The converted string.
   */
  private convert(str: string): string {
    if (this.options.preserveConsecutiveUppercase) {
      str = str
        .replace(/([A-Z]+)/g, match => `_${match.toLowerCase()}_`)
        .replace(/^_|_$/g, '')
    }
    return defaultConverters[this.toCaseType](str)
  }

  /**
   * Recursively converts the keys of an object to the target case.
   *
   * @private
   * @param obj - The object to convert.
   * @returns The converted object.
   */
  private convertObject(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        this.options.preserveSpecificKeys.includes(key)
          ? key
          : this.convert(key),
        isObject(value) ? this.convertObject(value) : value,
      ]),
    )
  }

  /**
   * Executes the case conversion on the provided data.
   *
   * @param data - The object to convert.
   * @returns The converted object.
   * @throws {Error} If the input is not an object.
   */
  public execute<T extends Record<string, unknown>>(data: T): ConvertCase<T> {
    if (!isObject(data)) {
      throw new Error('Input must be an object')
    }

    return this.convertObject(data) as ConvertCase<T>
  }
}

/**
 * Converts the case of keys in an object.
 *
 * @param data - The object to convert.
 * @param toCaseType - The target case type for conversion.
 * @param options - Options for case conversion.
 * @returns The converted object with typed keys.
 */
export function convertCase<T>(
  data: T,
  toCaseType: CaseType,
  options: ConvertCaseOptions = {},
): ConvertCase<T> {
  const converter = new CaseConverter(toCaseType, options)
  return converter.execute(data as any) as ConvertCase<T>
}

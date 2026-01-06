
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model HealthTip
 * 
 */
export type HealthTip = $Result.DefaultSelection<Prisma.$HealthTipPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more HealthTips
 * const healthTips = await prisma.healthTip.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more HealthTips
   * const healthTips = await prisma.healthTip.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.healthTip`: Exposes CRUD operations for the **HealthTip** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HealthTips
    * const healthTips = await prisma.healthTip.findMany()
    * ```
    */
  get healthTip(): Prisma.HealthTipDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.2.0
   * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    HealthTip: 'HealthTip'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "healthTip"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      HealthTip: {
        payload: Prisma.$HealthTipPayload<ExtArgs>
        fields: Prisma.HealthTipFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HealthTipFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HealthTipFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>
          }
          findFirst: {
            args: Prisma.HealthTipFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HealthTipFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>
          }
          findMany: {
            args: Prisma.HealthTipFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>[]
          }
          create: {
            args: Prisma.HealthTipCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>
          }
          createMany: {
            args: Prisma.HealthTipCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HealthTipCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>[]
          }
          delete: {
            args: Prisma.HealthTipDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>
          }
          update: {
            args: Prisma.HealthTipUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>
          }
          deleteMany: {
            args: Prisma.HealthTipDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HealthTipUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.HealthTipUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>[]
          }
          upsert: {
            args: Prisma.HealthTipUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HealthTipPayload>
          }
          aggregate: {
            args: Prisma.HealthTipAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHealthTip>
          }
          groupBy: {
            args: Prisma.HealthTipGroupByArgs<ExtArgs>
            result: $Utils.Optional<HealthTipGroupByOutputType>[]
          }
          count: {
            args: Prisma.HealthTipCountArgs<ExtArgs>
            result: $Utils.Optional<HealthTipCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    healthTip?: HealthTipOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model HealthTip
   */

  export type AggregateHealthTip = {
    _count: HealthTipCountAggregateOutputType | null
    _avg: HealthTipAvgAggregateOutputType | null
    _sum: HealthTipSumAggregateOutputType | null
    _min: HealthTipMinAggregateOutputType | null
    _max: HealthTipMaxAggregateOutputType | null
  }

  export type HealthTipAvgAggregateOutputType = {
    id: number | null
  }

  export type HealthTipSumAggregateOutputType = {
    id: number | null
  }

  export type HealthTipMinAggregateOutputType = {
    id: number | null
    header: string | null
    iconName: string | null
    advice: string | null
    details: string | null
    moreDetails: string | null
  }

  export type HealthTipMaxAggregateOutputType = {
    id: number | null
    header: string | null
    iconName: string | null
    advice: string | null
    details: string | null
    moreDetails: string | null
  }

  export type HealthTipCountAggregateOutputType = {
    id: number
    header: number
    iconName: number
    advice: number
    details: number
    moreDetails: number
    _all: number
  }


  export type HealthTipAvgAggregateInputType = {
    id?: true
  }

  export type HealthTipSumAggregateInputType = {
    id?: true
  }

  export type HealthTipMinAggregateInputType = {
    id?: true
    header?: true
    iconName?: true
    advice?: true
    details?: true
    moreDetails?: true
  }

  export type HealthTipMaxAggregateInputType = {
    id?: true
    header?: true
    iconName?: true
    advice?: true
    details?: true
    moreDetails?: true
  }

  export type HealthTipCountAggregateInputType = {
    id?: true
    header?: true
    iconName?: true
    advice?: true
    details?: true
    moreDetails?: true
    _all?: true
  }

  export type HealthTipAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HealthTip to aggregate.
     */
    where?: HealthTipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HealthTips to fetch.
     */
    orderBy?: HealthTipOrderByWithRelationInput | HealthTipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HealthTipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HealthTips from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HealthTips.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HealthTips
    **/
    _count?: true | HealthTipCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: HealthTipAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: HealthTipSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HealthTipMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HealthTipMaxAggregateInputType
  }

  export type GetHealthTipAggregateType<T extends HealthTipAggregateArgs> = {
        [P in keyof T & keyof AggregateHealthTip]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHealthTip[P]>
      : GetScalarType<T[P], AggregateHealthTip[P]>
  }




  export type HealthTipGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HealthTipWhereInput
    orderBy?: HealthTipOrderByWithAggregationInput | HealthTipOrderByWithAggregationInput[]
    by: HealthTipScalarFieldEnum[] | HealthTipScalarFieldEnum
    having?: HealthTipScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HealthTipCountAggregateInputType | true
    _avg?: HealthTipAvgAggregateInputType
    _sum?: HealthTipSumAggregateInputType
    _min?: HealthTipMinAggregateInputType
    _max?: HealthTipMaxAggregateInputType
  }

  export type HealthTipGroupByOutputType = {
    id: number
    header: string
    iconName: string
    advice: string
    details: string
    moreDetails: string
    _count: HealthTipCountAggregateOutputType | null
    _avg: HealthTipAvgAggregateOutputType | null
    _sum: HealthTipSumAggregateOutputType | null
    _min: HealthTipMinAggregateOutputType | null
    _max: HealthTipMaxAggregateOutputType | null
  }

  type GetHealthTipGroupByPayload<T extends HealthTipGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HealthTipGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HealthTipGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HealthTipGroupByOutputType[P]>
            : GetScalarType<T[P], HealthTipGroupByOutputType[P]>
        }
      >
    >


  export type HealthTipSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    header?: boolean
    iconName?: boolean
    advice?: boolean
    details?: boolean
    moreDetails?: boolean
  }, ExtArgs["result"]["healthTip"]>

  export type HealthTipSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    header?: boolean
    iconName?: boolean
    advice?: boolean
    details?: boolean
    moreDetails?: boolean
  }, ExtArgs["result"]["healthTip"]>

  export type HealthTipSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    header?: boolean
    iconName?: boolean
    advice?: boolean
    details?: boolean
    moreDetails?: boolean
  }, ExtArgs["result"]["healthTip"]>

  export type HealthTipSelectScalar = {
    id?: boolean
    header?: boolean
    iconName?: boolean
    advice?: boolean
    details?: boolean
    moreDetails?: boolean
  }

  export type HealthTipOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "header" | "iconName" | "advice" | "details" | "moreDetails", ExtArgs["result"]["healthTip"]>

  export type $HealthTipPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HealthTip"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      header: string
      iconName: string
      advice: string
      details: string
      moreDetails: string
    }, ExtArgs["result"]["healthTip"]>
    composites: {}
  }

  type HealthTipGetPayload<S extends boolean | null | undefined | HealthTipDefaultArgs> = $Result.GetResult<Prisma.$HealthTipPayload, S>

  type HealthTipCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HealthTipFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HealthTipCountAggregateInputType | true
    }

  export interface HealthTipDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HealthTip'], meta: { name: 'HealthTip' } }
    /**
     * Find zero or one HealthTip that matches the filter.
     * @param {HealthTipFindUniqueArgs} args - Arguments to find a HealthTip
     * @example
     * // Get one HealthTip
     * const healthTip = await prisma.healthTip.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HealthTipFindUniqueArgs>(args: SelectSubset<T, HealthTipFindUniqueArgs<ExtArgs>>): Prisma__HealthTipClient<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one HealthTip that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HealthTipFindUniqueOrThrowArgs} args - Arguments to find a HealthTip
     * @example
     * // Get one HealthTip
     * const healthTip = await prisma.healthTip.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HealthTipFindUniqueOrThrowArgs>(args: SelectSubset<T, HealthTipFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HealthTipClient<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HealthTip that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HealthTipFindFirstArgs} args - Arguments to find a HealthTip
     * @example
     * // Get one HealthTip
     * const healthTip = await prisma.healthTip.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HealthTipFindFirstArgs>(args?: SelectSubset<T, HealthTipFindFirstArgs<ExtArgs>>): Prisma__HealthTipClient<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HealthTip that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HealthTipFindFirstOrThrowArgs} args - Arguments to find a HealthTip
     * @example
     * // Get one HealthTip
     * const healthTip = await prisma.healthTip.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HealthTipFindFirstOrThrowArgs>(args?: SelectSubset<T, HealthTipFindFirstOrThrowArgs<ExtArgs>>): Prisma__HealthTipClient<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more HealthTips that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HealthTipFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HealthTips
     * const healthTips = await prisma.healthTip.findMany()
     * 
     * // Get first 10 HealthTips
     * const healthTips = await prisma.healthTip.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const healthTipWithIdOnly = await prisma.healthTip.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HealthTipFindManyArgs>(args?: SelectSubset<T, HealthTipFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a HealthTip.
     * @param {HealthTipCreateArgs} args - Arguments to create a HealthTip.
     * @example
     * // Create one HealthTip
     * const HealthTip = await prisma.healthTip.create({
     *   data: {
     *     // ... data to create a HealthTip
     *   }
     * })
     * 
     */
    create<T extends HealthTipCreateArgs>(args: SelectSubset<T, HealthTipCreateArgs<ExtArgs>>): Prisma__HealthTipClient<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many HealthTips.
     * @param {HealthTipCreateManyArgs} args - Arguments to create many HealthTips.
     * @example
     * // Create many HealthTips
     * const healthTip = await prisma.healthTip.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HealthTipCreateManyArgs>(args?: SelectSubset<T, HealthTipCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many HealthTips and returns the data saved in the database.
     * @param {HealthTipCreateManyAndReturnArgs} args - Arguments to create many HealthTips.
     * @example
     * // Create many HealthTips
     * const healthTip = await prisma.healthTip.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many HealthTips and only return the `id`
     * const healthTipWithIdOnly = await prisma.healthTip.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HealthTipCreateManyAndReturnArgs>(args?: SelectSubset<T, HealthTipCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a HealthTip.
     * @param {HealthTipDeleteArgs} args - Arguments to delete one HealthTip.
     * @example
     * // Delete one HealthTip
     * const HealthTip = await prisma.healthTip.delete({
     *   where: {
     *     // ... filter to delete one HealthTip
     *   }
     * })
     * 
     */
    delete<T extends HealthTipDeleteArgs>(args: SelectSubset<T, HealthTipDeleteArgs<ExtArgs>>): Prisma__HealthTipClient<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one HealthTip.
     * @param {HealthTipUpdateArgs} args - Arguments to update one HealthTip.
     * @example
     * // Update one HealthTip
     * const healthTip = await prisma.healthTip.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HealthTipUpdateArgs>(args: SelectSubset<T, HealthTipUpdateArgs<ExtArgs>>): Prisma__HealthTipClient<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more HealthTips.
     * @param {HealthTipDeleteManyArgs} args - Arguments to filter HealthTips to delete.
     * @example
     * // Delete a few HealthTips
     * const { count } = await prisma.healthTip.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HealthTipDeleteManyArgs>(args?: SelectSubset<T, HealthTipDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HealthTips.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HealthTipUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HealthTips
     * const healthTip = await prisma.healthTip.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HealthTipUpdateManyArgs>(args: SelectSubset<T, HealthTipUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HealthTips and returns the data updated in the database.
     * @param {HealthTipUpdateManyAndReturnArgs} args - Arguments to update many HealthTips.
     * @example
     * // Update many HealthTips
     * const healthTip = await prisma.healthTip.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more HealthTips and only return the `id`
     * const healthTipWithIdOnly = await prisma.healthTip.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends HealthTipUpdateManyAndReturnArgs>(args: SelectSubset<T, HealthTipUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one HealthTip.
     * @param {HealthTipUpsertArgs} args - Arguments to update or create a HealthTip.
     * @example
     * // Update or create a HealthTip
     * const healthTip = await prisma.healthTip.upsert({
     *   create: {
     *     // ... data to create a HealthTip
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HealthTip we want to update
     *   }
     * })
     */
    upsert<T extends HealthTipUpsertArgs>(args: SelectSubset<T, HealthTipUpsertArgs<ExtArgs>>): Prisma__HealthTipClient<$Result.GetResult<Prisma.$HealthTipPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of HealthTips.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HealthTipCountArgs} args - Arguments to filter HealthTips to count.
     * @example
     * // Count the number of HealthTips
     * const count = await prisma.healthTip.count({
     *   where: {
     *     // ... the filter for the HealthTips we want to count
     *   }
     * })
    **/
    count<T extends HealthTipCountArgs>(
      args?: Subset<T, HealthTipCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HealthTipCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HealthTip.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HealthTipAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HealthTipAggregateArgs>(args: Subset<T, HealthTipAggregateArgs>): Prisma.PrismaPromise<GetHealthTipAggregateType<T>>

    /**
     * Group by HealthTip.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HealthTipGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HealthTipGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HealthTipGroupByArgs['orderBy'] }
        : { orderBy?: HealthTipGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HealthTipGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHealthTipGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HealthTip model
   */
  readonly fields: HealthTipFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HealthTip.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HealthTipClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HealthTip model
   */
  interface HealthTipFieldRefs {
    readonly id: FieldRef<"HealthTip", 'Int'>
    readonly header: FieldRef<"HealthTip", 'String'>
    readonly iconName: FieldRef<"HealthTip", 'String'>
    readonly advice: FieldRef<"HealthTip", 'String'>
    readonly details: FieldRef<"HealthTip", 'String'>
    readonly moreDetails: FieldRef<"HealthTip", 'String'>
  }
    

  // Custom InputTypes
  /**
   * HealthTip findUnique
   */
  export type HealthTipFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * Filter, which HealthTip to fetch.
     */
    where: HealthTipWhereUniqueInput
  }

  /**
   * HealthTip findUniqueOrThrow
   */
  export type HealthTipFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * Filter, which HealthTip to fetch.
     */
    where: HealthTipWhereUniqueInput
  }

  /**
   * HealthTip findFirst
   */
  export type HealthTipFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * Filter, which HealthTip to fetch.
     */
    where?: HealthTipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HealthTips to fetch.
     */
    orderBy?: HealthTipOrderByWithRelationInput | HealthTipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HealthTips.
     */
    cursor?: HealthTipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HealthTips from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HealthTips.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HealthTips.
     */
    distinct?: HealthTipScalarFieldEnum | HealthTipScalarFieldEnum[]
  }

  /**
   * HealthTip findFirstOrThrow
   */
  export type HealthTipFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * Filter, which HealthTip to fetch.
     */
    where?: HealthTipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HealthTips to fetch.
     */
    orderBy?: HealthTipOrderByWithRelationInput | HealthTipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HealthTips.
     */
    cursor?: HealthTipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HealthTips from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HealthTips.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HealthTips.
     */
    distinct?: HealthTipScalarFieldEnum | HealthTipScalarFieldEnum[]
  }

  /**
   * HealthTip findMany
   */
  export type HealthTipFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * Filter, which HealthTips to fetch.
     */
    where?: HealthTipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HealthTips to fetch.
     */
    orderBy?: HealthTipOrderByWithRelationInput | HealthTipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HealthTips.
     */
    cursor?: HealthTipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HealthTips from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HealthTips.
     */
    skip?: number
    distinct?: HealthTipScalarFieldEnum | HealthTipScalarFieldEnum[]
  }

  /**
   * HealthTip create
   */
  export type HealthTipCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * The data needed to create a HealthTip.
     */
    data: XOR<HealthTipCreateInput, HealthTipUncheckedCreateInput>
  }

  /**
   * HealthTip createMany
   */
  export type HealthTipCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HealthTips.
     */
    data: HealthTipCreateManyInput | HealthTipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HealthTip createManyAndReturn
   */
  export type HealthTipCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * The data used to create many HealthTips.
     */
    data: HealthTipCreateManyInput | HealthTipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HealthTip update
   */
  export type HealthTipUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * The data needed to update a HealthTip.
     */
    data: XOR<HealthTipUpdateInput, HealthTipUncheckedUpdateInput>
    /**
     * Choose, which HealthTip to update.
     */
    where: HealthTipWhereUniqueInput
  }

  /**
   * HealthTip updateMany
   */
  export type HealthTipUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HealthTips.
     */
    data: XOR<HealthTipUpdateManyMutationInput, HealthTipUncheckedUpdateManyInput>
    /**
     * Filter which HealthTips to update
     */
    where?: HealthTipWhereInput
    /**
     * Limit how many HealthTips to update.
     */
    limit?: number
  }

  /**
   * HealthTip updateManyAndReturn
   */
  export type HealthTipUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * The data used to update HealthTips.
     */
    data: XOR<HealthTipUpdateManyMutationInput, HealthTipUncheckedUpdateManyInput>
    /**
     * Filter which HealthTips to update
     */
    where?: HealthTipWhereInput
    /**
     * Limit how many HealthTips to update.
     */
    limit?: number
  }

  /**
   * HealthTip upsert
   */
  export type HealthTipUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * The filter to search for the HealthTip to update in case it exists.
     */
    where: HealthTipWhereUniqueInput
    /**
     * In case the HealthTip found by the `where` argument doesn't exist, create a new HealthTip with this data.
     */
    create: XOR<HealthTipCreateInput, HealthTipUncheckedCreateInput>
    /**
     * In case the HealthTip was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HealthTipUpdateInput, HealthTipUncheckedUpdateInput>
  }

  /**
   * HealthTip delete
   */
  export type HealthTipDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
    /**
     * Filter which HealthTip to delete.
     */
    where: HealthTipWhereUniqueInput
  }

  /**
   * HealthTip deleteMany
   */
  export type HealthTipDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HealthTips to delete
     */
    where?: HealthTipWhereInput
    /**
     * Limit how many HealthTips to delete.
     */
    limit?: number
  }

  /**
   * HealthTip without action
   */
  export type HealthTipDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HealthTip
     */
    select?: HealthTipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HealthTip
     */
    omit?: HealthTipOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const HealthTipScalarFieldEnum: {
    id: 'id',
    header: 'header',
    iconName: 'iconName',
    advice: 'advice',
    details: 'details',
    moreDetails: 'moreDetails'
  };

  export type HealthTipScalarFieldEnum = (typeof HealthTipScalarFieldEnum)[keyof typeof HealthTipScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type HealthTipWhereInput = {
    AND?: HealthTipWhereInput | HealthTipWhereInput[]
    OR?: HealthTipWhereInput[]
    NOT?: HealthTipWhereInput | HealthTipWhereInput[]
    id?: IntFilter<"HealthTip"> | number
    header?: StringFilter<"HealthTip"> | string
    iconName?: StringFilter<"HealthTip"> | string
    advice?: StringFilter<"HealthTip"> | string
    details?: StringFilter<"HealthTip"> | string
    moreDetails?: StringFilter<"HealthTip"> | string
  }

  export type HealthTipOrderByWithRelationInput = {
    id?: SortOrder
    header?: SortOrder
    iconName?: SortOrder
    advice?: SortOrder
    details?: SortOrder
    moreDetails?: SortOrder
  }

  export type HealthTipWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: HealthTipWhereInput | HealthTipWhereInput[]
    OR?: HealthTipWhereInput[]
    NOT?: HealthTipWhereInput | HealthTipWhereInput[]
    header?: StringFilter<"HealthTip"> | string
    iconName?: StringFilter<"HealthTip"> | string
    advice?: StringFilter<"HealthTip"> | string
    details?: StringFilter<"HealthTip"> | string
    moreDetails?: StringFilter<"HealthTip"> | string
  }, "id">

  export type HealthTipOrderByWithAggregationInput = {
    id?: SortOrder
    header?: SortOrder
    iconName?: SortOrder
    advice?: SortOrder
    details?: SortOrder
    moreDetails?: SortOrder
    _count?: HealthTipCountOrderByAggregateInput
    _avg?: HealthTipAvgOrderByAggregateInput
    _max?: HealthTipMaxOrderByAggregateInput
    _min?: HealthTipMinOrderByAggregateInput
    _sum?: HealthTipSumOrderByAggregateInput
  }

  export type HealthTipScalarWhereWithAggregatesInput = {
    AND?: HealthTipScalarWhereWithAggregatesInput | HealthTipScalarWhereWithAggregatesInput[]
    OR?: HealthTipScalarWhereWithAggregatesInput[]
    NOT?: HealthTipScalarWhereWithAggregatesInput | HealthTipScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"HealthTip"> | number
    header?: StringWithAggregatesFilter<"HealthTip"> | string
    iconName?: StringWithAggregatesFilter<"HealthTip"> | string
    advice?: StringWithAggregatesFilter<"HealthTip"> | string
    details?: StringWithAggregatesFilter<"HealthTip"> | string
    moreDetails?: StringWithAggregatesFilter<"HealthTip"> | string
  }

  export type HealthTipCreateInput = {
    header: string
    iconName: string
    advice: string
    details: string
    moreDetails: string
  }

  export type HealthTipUncheckedCreateInput = {
    id?: number
    header: string
    iconName: string
    advice: string
    details: string
    moreDetails: string
  }

  export type HealthTipUpdateInput = {
    header?: StringFieldUpdateOperationsInput | string
    iconName?: StringFieldUpdateOperationsInput | string
    advice?: StringFieldUpdateOperationsInput | string
    details?: StringFieldUpdateOperationsInput | string
    moreDetails?: StringFieldUpdateOperationsInput | string
  }

  export type HealthTipUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    header?: StringFieldUpdateOperationsInput | string
    iconName?: StringFieldUpdateOperationsInput | string
    advice?: StringFieldUpdateOperationsInput | string
    details?: StringFieldUpdateOperationsInput | string
    moreDetails?: StringFieldUpdateOperationsInput | string
  }

  export type HealthTipCreateManyInput = {
    id?: number
    header: string
    iconName: string
    advice: string
    details: string
    moreDetails: string
  }

  export type HealthTipUpdateManyMutationInput = {
    header?: StringFieldUpdateOperationsInput | string
    iconName?: StringFieldUpdateOperationsInput | string
    advice?: StringFieldUpdateOperationsInput | string
    details?: StringFieldUpdateOperationsInput | string
    moreDetails?: StringFieldUpdateOperationsInput | string
  }

  export type HealthTipUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    header?: StringFieldUpdateOperationsInput | string
    iconName?: StringFieldUpdateOperationsInput | string
    advice?: StringFieldUpdateOperationsInput | string
    details?: StringFieldUpdateOperationsInput | string
    moreDetails?: StringFieldUpdateOperationsInput | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type HealthTipCountOrderByAggregateInput = {
    id?: SortOrder
    header?: SortOrder
    iconName?: SortOrder
    advice?: SortOrder
    details?: SortOrder
    moreDetails?: SortOrder
  }

  export type HealthTipAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type HealthTipMaxOrderByAggregateInput = {
    id?: SortOrder
    header?: SortOrder
    iconName?: SortOrder
    advice?: SortOrder
    details?: SortOrder
    moreDetails?: SortOrder
  }

  export type HealthTipMinOrderByAggregateInput = {
    id?: SortOrder
    header?: SortOrder
    iconName?: SortOrder
    advice?: SortOrder
    details?: SortOrder
    moreDetails?: SortOrder
  }

  export type HealthTipSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
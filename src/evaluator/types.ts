/**
 * @fileoverview The types for the entire pipeline from start to finish of the evaluator live here.
 *               When you change this file, make sure to create any relevant constructors in constructors.ts.
 *               When you change this file, make sure to create any relevant predicates in predicates.ts.
 *               When you change this file, make sure to create any relevant examples for tests in tests/examples.ts.
 * 
 * @author Alice Russell
 */

'use strict';

export type Token
  = TokenError | {
    type: TokenType
    token: string,
  };

export enum TokenType {
  OpenParen='OpenParen',
  OpenSquareParen='OpenSquareParen',
  OpenBraceParen='OpenBraceParen',
  CloseParen='CloseParen',
  CloseSquareParen='CloseSquareParen',
  CloseBraceParen='CloseBraceParen',
  Number='Number',
  String='String',
  Identifier='Identifier',
  Whitespace='Whitespace',
  Boolean='Boolean',
  Newline='Newline',
  Comment='Comment'
};

export type TokenError
  = {
    tokenError: string,
    string: string
  };

// ----------------------------------------------------------------------------

export type ReadResult<T>
  = {
    thing: T,
    remain: Token[]
  };

export type SExp
  = ReadError | {
    type: 'SExp Array',
    sexp: SExp[]
  } | {
    type: 'String'
    sexp: string
  } | {
    type: 'Num'
    sexp: number
  } | {
    type: 'Id',
    sexp: string
  } | {
    type: 'Bool',
    sexp: boolean
  };

export type ReadError
  =  {
    readError: string,
    tokens: Token[]
  } | TokenError;

// ----------------------------------------------------------------------------

export type TopLevel
  = TopLevelError | Expr | {
    type: 'define-constant',
    name: string,
    body: Expr
  } | {
    type: 'define-function',
    name: string,
    params: string[]
    body: Expr
  } | {
    type: 'define-struct',
    name: string,
    fields: string[]
  } | {
    type: 'check-expect',
    actual: Expr,
    expected: Expr
  } | {
    type: 'check-within'
    actual: Expr,
    expected: Expr,
    margin: Expr
  } | {
    type: 'check-error',
    expression: Expr,
    expectedErrorMessage?: string
  };

export type Expr
  = ExprError | {
    typeOfExpression: 'String',
    const: string
  } | {
    typeOfExpression: 'Number',
    const: number
  } | {
    typeOfExpression: 'VariableUsage',
    const: string
  } | {
    typeOfExpression: 'Boolean',
    const: boolean
  } | {
    typeOfExpression: 'Call',
    op: string,
    args: Expr[],
  } | {
    typeOfExpression: 'if',
    predicate: Expr,
    consequent: Expr,
    alternative: Expr
  } | {
    typeOfExpression: 'cond',
    clauses: [Expr, Expr][]
  } | {
    typeOfExpression: 'and',
    arguments: Expr[]
  } | {
    typeOfExpression: 'or',
    arguments: Expr[]
  } | {
    typeOfExpression: 'TemplatePlaceholder',
    sexp: SExp
  };

export type TopLevelError
  = ReadError | {
    topLevelError: string,
    sexps: SExp[]
  };

export type ExprError
  = ReadError | {
    exprError: string,
    sexps: SExp[]
  };

// ----------------------------------------------------------------------------

export type Result
  = ResultError | ExprResult | {
    type: 'define',
    defined: string,
    toBe: ExprResult | null
  } | {
    type: 'check-success'
  } | {
    type: 'check-failure',
    actual: ExprResult,
    expected: Value
  } | { 
    type: 'check-expected-error',
    expected: ValueError
  };

export type ExprResult
  = ValueError | Value;
 
export type Value
  = {
    type: 'Atomic',
    value: string | number | boolean
  } | {
    type: 'BuiltinFunction',
    value: ((vs: Value[]) => ExprResult)
  } | {
    type: 'Closure',
    value: Closure
  } | {
    type: 'StructType',
    name: string
  } | {
    type: 'Struct',
    struct: StructType
    values: ExprResult[]
  } | {
    type: 'StructureConstructor',
    struct: StructType
  } | {
    type: 'StructureAccessor',
    struct: StructType,
    index: number
  } | {
    type: 'StructurePredicate',
    struct: StructType
  };

export type StructType
  = {
    name: string,
    fields: string[]
  };

export type Nothing
  = { type: 'nothing' };
 
export type Just<T>
  = { type: 'just', thing: T};
 
export type Maybe<T>
  = Nothing | Just<T>;

export type Closure
  = {
    args: string[],
    env: Env,
    body: Expr
  };

export type ResultError
 = TopLevelError | {
   resultError: string,
   toplevel: TopLevel
 };

export type ValueError
   = ExprError | {
    valueError: string,
    expr?: Expr
  };


/**
 * The Maybe object is needed for the first pass/second pass system in the evaluator
 * (to fill the first pass with holes, and the second pass with Just objects)
 */
export type Env = Map<String, Maybe<ExprResult>>;

export type ParseEnv
  = Map<String, 
    [() => TopLevel, (sexps: SExp[]) => TopLevel]
  >;

// Every templated part should be a field in the errors
// Types used in the student language evaluator.

import { isTokenError } from "./predicates";

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
    tokenError: 'Unidentified Token',
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
    readError: 'No Valid SExp'
             | 'No Closing Paren'
             | 'No Open Paren'
             | 'Mismatched Parens'
             | 'Invalid token found while reading SExp',
    tokens: Token[]
  } | TokenError;

// ----------------------------------------------------------------------------

export type DefOrExpr
  = Definition | Expr;

export type Definition
  = DefinitionError | {
    type: 'define-constant',
    name:  string,
    body: Expr
  } | {
    type: 'define-function',
    name: string,
    params: string[]
    body: Expr
  };


export type Expr
  = ExprError | {
    type: 'String',
    const: string
  } | {
    type: 'Num',
    const: number
  } | {
    type: 'Id',
    const: string
  } | {
    type: 'Bool',
    const: boolean
  } | {
    type: 'Call',
    op: string,
    args: Expr[],
  };

export type DefinitionError
  = ReadError | {
    defnError: 'Invalid expression passed where function name was expected'
             | 'Invalid expression passed where function argument was expected'
             | 'A definition requires two parts, but found none'
             | 'A definition requires two parts, but found one'
             | 'Passed a non-definition as definition'
             | 'Expected a variable name, or a function header'
             | 'Expected a function header with parameters in parentheses, received nothing in parentheses'
             | 'Expected a function header with parameters in parentheses, received a function name with no parameters'
             | 'A function in BSL cannot have zero parameters'
             | 'A definition can\'t have more than 3 parts'
             | 'Cannot have a definition as the body of a definition'
             | 'The body given is not a valid Expr',
    sexps: SExp[]
  };

export type ExprError
  = ReadError | {
    exprError: 'Empty Expr'
             | 'Defn inside Expr'
             | 'No function name after open paren'
             | 'Function call with no arguments',
    sexps: SExp[]
  };

// ----------------------------------------------------------------------------

export type Result
  = DefinitionResult | ExprResult;

export type DefinitionResult
  = BindingError | Binding;

export type ExprResult
  = ValueError | Value;

export type Nothing
 = { type: 'nothing' };

export type Just<T>
 = { type: 'just', thing: T};

export type Maybe<T>
 = Nothing | Just<T>;

export type Binding
  = {
    type: 'define',
    defined: string,
    toBe: ExprResult | null
  };

export type Value
  = {
    type: 'NonFunction',
    value: string | number | boolean
  } | {
    type: 'BuiltinFunction',
    value: ((vs: Value[]) => ExprResult)
  } | {
    type: 'Closure',
    value: Closure
  };

export type BindingError
 = DefinitionError | {
   bindingError: 'Repeated definition of the same name',
   definition: Definition
 }; // ...

export type ValueError
   = ExprError | {
    valueError: 'Id not in environment'
              | 'Id referenced before definition'
              | 'Arity mismatch'
              | 'Function used as a predicate'
              | 'Non-boolean value used as a predicate'
              | 'Expression undefined in program'
              | 'Expression defined later in program'
              | 'Nonfunction applied as a function'
    expr: Expr // put identifier for expr in this thing
  };

export type Closure
  = {
    args: string[],
    env: Env,
    body: Expr
  };

export type Env = Map<String, Maybe<ExprResult>>;



// Every templated part should be a field in the errors
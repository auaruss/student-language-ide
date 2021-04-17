import {
  Token, TokenError,
  SExp, ReadError,
  TopLevel, Definition, Expr, DefinitionError, ExprError,
  Value, Result, DefinitionResult, ExprResult, 
  Binding, BindingError, Closure, Env, Check, ValueError, CheckError
} from './types';

export const isToken = (x: any): x is Token => {
  return (x && typeof x === 'object'
    && ( x.type === 'OpenParen'
      || x.type === 'OpenSquareParen'
      || x.type === 'OpenBraceParen'
      || x.type === 'CloseParen'
      || x.type === 'CloseSquareParen'
      || x.type === 'CloseBraceParen'
      || x.type === 'Number'
      || x.type === 'String'
      || x.type === 'Identifier'
      || x.type === 'Whitespace'
      || x.type === 'Boolean')
    && typeof x.token === 'string') || isTokenError(x);
}

export const isTokenError = (x: any): x is TokenError => {
  return x && typeof x === 'object'
    && typeof x.tokenError === 'string'
    && typeof x.string === 'string';
}

// ----------------------------------------------------------------------------

export const isSExp = (x: any): x is SExp => {
  return (x && typeof x === 'object'
    && ( x.type === 'SExp Array'
      && Array.isArray(x.sexp)
      && x.sexp.every(isSExp) 
    )
    || ( x.type === 'String'
      && typeof x.sexp === 'string'
    )
    || ( x.type === 'Num'
      && typeof x.sexp === 'number'
    )
    || ( x.type === 'Id'
      && typeof x.sexp === 'string'
    )
    || ( x.type === 'Bool'
      && typeof x.sexp === 'boolean'
    )) || isReadError(x);
}

export const isReadError = (x: any): x is ReadError => {
  return (x && typeof x === 'object'
    && typeof x.readError === 'string'
    && Array.isArray(x.tokens)
    && x.tokens.every(isToken))
    || isTokenError(x);
}

// ----------------------------------------------------------------------------

export const isDefOrExpr = (x: any): x is TopLevel => {
  return isDefinition(x) || isExpr(x);
}


export const isDefinition = (x: any): x is Definition => {
  return (x && typeof x === 'object'
    && (   x.type === 'define-constant' 
       || (   x.type === 'define-function'
           && x.params && x.params.every((_: any) => typeof _ === 'string')))
    && isExpr(x.body)) || isDefinitionError(x);
}

export const isExpr = (x: any): x is Expr => {
  return (x && typeof x === 'object'
  && x.type ||
  (
    x.type === 'String'
    && typeof x.const === 'string'
  )
  || (
    x.type === 'Num'
    && typeof x.const === 'number'
  )
  || (
    x.type === 'Id'
    && typeof x.const === 'string'
  )
  || (
    x.type === 'Bool'
    && typeof x.const === 'boolean'
  )
  || (
    x.type === 'Call'
    && typeof x.op === 'string'
    && Array.isArray(x.args)
    && x.args.every(isExpr)
  )) || isExprError(x);
}

export const isExprArray = (x: any): x is Expr[] => {
  return Array.isArray(x) && x.every(isExpr);
}

const isCall = (x: any): boolean => {
  return x && typeof x === 'object'
    && typeof x.op === 'string'
    && Array.isArray(x.args)
    && x.args.every(isExpr);
}


export const isCheck = (x: any): x is Check => {
  return (x && typeof x === 'object'
    && x.type === 'check-expect'
    && isExpr(x.actual)
    && isExpr(x.expected)
  );
}

export const isDefinitionError = (x: any): x is DefinitionError => {
  return (x && typeof x === 'object'
    && typeof x.defnError === 'string'
    && Array.isArray(x.sexps)
    && x.sexps.every(isSExp))
    || isReadError(x);
}

export const isExprError = (x: any): x is ExprError => {
  return (x && typeof x === 'object'
    && typeof x.exprError === 'string'
    && Array.isArray(x.sexps)
    && x.sexps.every(isSExp))
    || isReadError(x);
}

export const isCheckError = (x: any): x is CheckError => {
  return (x && typeof x === 'object'
    && typeof x.checkError === 'string'
    && Array.isArray(x.sexps)
    && x.sexps.every(isSExp))
    || isReadError(x);
}

// ----------------------------------------------------------------------------

export const isResult = (x: any): x is Result => {
  return isDefinitionResult(x) || isExprResult(x);
}

export const isDefinitionResult = (x: any): x is DefinitionResult => {
  return isBinding(x) || isBindingError(x);
}

export const isExprResult = (x: any): x is ExprResult => {
  return isValue(x) || isValueError(x);
}

export const isValue = (x: any): x is Value => {
  return x && typeof x === 'object'
    && (( x.type === 'NonFunction'
        && (typeof x.value === 'string'
        ||  typeof x.value === 'number'
        ||  typeof x.value === 'boolean'))
      || ( x.type === 'BuiltinFunction'
        && typeof x.value === 'function' )
      || ( x.type === 'Closure'
        && isClos(x.value)));
}

export const isValueArray = (x: any): x is Value[] => {
  return Array.isArray(x) && x.every(isValue);
}

export const isClos = (x: any): x is Closure => {
  return x && typeof x === 'object'
    && Array.isArray(x.args)
    && x.args.every((_: any) => typeof _ === 'string')
    && isEnv(x.env)
    && isExpr(x.body);
}

export const isBinding = (x: any): x is Binding => {
  return x && typeof x === 'object'
    && x.type === 'define'
    && typeof x.defined === 'string'
    && (isExprResult(x.toBe) || x.toBe === null);
}

export const isEnv = (x: any): x is Env => {
  return x instanceof Map;
}

export const isValueError = (x: any): x is ValueError => {
  return (x && typeof x === 'object'
    && typeof x.valueError === 'string'
    && (x.expr === undefined || isExpr(x.expr)))
  || isExprError(x);
}

export const isBindingError = (x: any): x is BindingError => {
  return (x && typeof x === 'object'
    && typeof x.bindingError === 'string'
    && isDefinition(x.definition))
  || isDefinitionError(x);
}
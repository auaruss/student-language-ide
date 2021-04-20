import {
  Token, TokenError,
  SExp, ReadError,
  TopLevel, Expr, TopLevelError, ExprError,
  Value, Result, ExprResult, ResultError, Closure, Env, ValueError, StructType
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

export const isTopLevel = (x: any): x is TopLevel => {
  return (x && typeof x === 'object'
  && ((
    x.type === 'define-constant'
    && typeof x.name === 'string'
    && isExpr(x.body)
  ) || (
    x.type === 'define-function'
    && typeof x.name === 'string'
    && Array.isArray(x.params)
    && x.params.every(s => typeof s === 'string')
    && isExpr(x.body)
  ) || (
    x.type === 'define-struct'
    && typeof x.name === 'string'
    && Array.isArray(x.fields)
    && x.fields.every(s => typeof s === 'string')
  ) || (
    x.type === 'check-expect'
    && isExpr(x.actual)
    && isExpr(x.expected)
  ) || (
    x.type === 'check-within'
    && isExpr(x.actual)
    && isExpr(x.expected)
    && isExpr(x.margin)
  ) || (
    x.type === 'check-error'
    && isExpr(x.expression)
  ) || (
    x.type === 'check-error'
    && isExpr(x.expression)
    && typeof x.expectedErrorMessage === 'string'
  ))) || isExpr(x) || isTopLevelError(x);
}

export const isExpr = (x: any): x is Expr => {
  return (x && typeof x === 'object'
  && ((
    x.typeOfExpression === 'String'
    && typeof x.const === 'string'
  ) || (
    x.typeOfExpression === 'Number'
    && typeof x.const === 'number'
  ) || (
    x.typeOfExpression === 'VariableUsage'
    && typeof x.const === 'string'
  ) || (
    x.typeOfExpression === 'Boolean'
    && typeof x.const === 'boolean'
  ) || (
    x.typeOfExpression === 'Call'
    && typeof x.op === 'string'
    && Array.isArray(x.args)
    && x.args.every(isExpr)
  ) || (
    x.typeOfExpression === 'if'
    && isExpr(x.predicate)
    && isExpr(x.consequent)
    && isExpr(x.alternative)
  ) || (
    x.typeOfExpression === 'cond'
    && Array.isArray(x.clauses)
    && x.clauses.every(c => {
      return Array.isArray(c)
      && c.length === 2
      && isExpr(c[0])
      && isExpr(c[1])
    })
  ) || (
    x.typeOfExpression === 'and'
    && Array.isArray(x.arguments)
    && x.arguments.every(isExpr)
  ) || (
    x.typeOfExpression === 'or'
    && Array.isArray(x.arguments)
    && x.arguments.every(isExpr)
  ) || (
    x.typeOfExpression === 'TemplatePlaceholder'
    && isSExp(x.sexp)
  ))) || isExprError(x);
}

export const isExprArray = (x: any): x is Expr[] => {
  return Array.isArray(x) && x.every(isExpr);
}

export const isTopLevelError = (x: any): x is TopLevelError => {
  return (x && typeof x === 'object'
    && typeof x.topLevelError === 'string'
    && Array.isArray(x.sexps)
    && x.sexps.every(isSExp)
  ) || isReadError(x);
}

export const isExprError = (x: any): x is ExprError => {
  return (x && typeof x === 'object'
    && typeof x.exprError === 'string'
    && Array.isArray(x.sexps)
    && x.sexps.every(isSExp)
  ) || isReadError(x);
}

// ----------------------------------------------------------------------------

export const isResult = (x: any): x is Result => {
  return (x && typeof x === 'object'
    && ((
      x.type === 'define'
      && typeof x.defined === 'string'
      && (isExprResult(x.toBe) || x.toBe === null)
    ) || (
      x.type === 'check-success'
    ) || (
      x.type === 'check-failure'
      && isExprResult(x.actual)
      && isValue(x.expected)
    ) || (
      x.type === 'check-expected-error'
      && isValueError(x.expected)
    )
  )) || isExprResult(x) || isResultError(x);
}

export const isExprResult = (x: any): x is ExprResult => {
  return isValue(x) || isValueError(x);
}

export const isValue = (x: any): x is Value => {
  return (x && typeof x === 'object'
    && ((
      x.type === 'Atomic'
        && (typeof x.value === 'string'
        ||  typeof x.value === 'number'
        ||  typeof x.value === 'boolean')
    ) || (
      x.type === 'BuiltinFunction'
      && typeof x.value === 'function' 
    ) || (
      x.type === 'Closure' && isClos(x.value)
    ) || (
      x.type === 'Struct'
      && isStructType(x.struct)
      && Array.isArray(x.values)
      && x.values.every(isExprResult)
    ) || (
      x.type === 'StructureConstructor'
      && isStructType(x.struct)
    ) || (
      x.type === 'StructureAccessor'
      && isStructType(x.struct)
    ) || (
      x.type === 'StructurePredicate'
      && isStructType(x.struct)
    )
  ));
}

export const isStructType = (x: any): x is StructType => {
  return (x && typeof x === 'object'
    && typeof x.name === 'string'
    && Array.isArray(x.fields)
    && x.fields.every(s => typeof s === 'string')
  );
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

export const isEnv = (x: any): x is Env => {
  return x instanceof Map;
}

export const isResultError = (x: any): x is ResultError => {
  return (x && typeof x === 'object'
    && typeof x.resultError === 'string'
    && isTopLevel(x.toplevel)
  ) || isExprError(x);
}

export const isValueError = (x: any): x is ValueError => {
  return (x && typeof x === 'object'
    && typeof x.valueError === 'string'
    && (x.expr === undefined || isExpr(x.expr)))
  || isExprError(x);
}
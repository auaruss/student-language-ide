import {
  Token, TokenError,
  SExp, ReadError,
  DefOrExpr, Definition, Expr, DefinitionError, ExprError,
  Value, Result, DefinitionResult, ExprResult, 
  Binding, BindingError, Closure, Env, ValueError
} from './types';

export const isToken = (x: any): x is Token => {
  return (typeof x === 'object'
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
  return typeof x === 'object'
    && x.tokenError === 'Unidentified Token'
    && typeof x.string === 'string';
}

// ----------------------------------------------------------------------------

export const isSExp = (x: any): x is SExp => {
  return (typeof x === 'object'
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
  return (typeof x === 'object'
    && ( x.readError === 'No Valid SExp'
      || x.readError === 'No Closing Paren'
      || x.readError === 'No Open Paren'
      || x.readError === 'Mismatched Parens'
    )
    && Array.isArray(x.tokens)
    && x.tokens.every(isToken))
    || isTokenError(x);
}

// ----------------------------------------------------------------------------

export const isDefOrExpr = (x: any): x is DefOrExpr => {
  return isDefinition(x) || isExpr(x);
}


export const isDefinition = (x: any): x is Definition => {
  return (typeof x === 'object'
    && (   x.type === 'define-constant' 
       || (   x.type === 'define-function'
           && x.params && x.params.every((_: any) => typeof _ === 'string')))
    && isExpr(x.body)) || isDefinitionError(x);
}

export const isExpr = (x: any): x is Expr => {
  return (typeof x === 'object'
  && x.type
  || (
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
  return typeof x === 'object'
    && typeof x.op === 'string'
    && Array.isArray(x.args)
    && x.args.every(isExpr);
}

export const isDefinitionError = (x: any): x is DefinitionError => {
  return (typeof x === 'object'
    && ( x.defnError === 'Invalid expression passed where function name was expected'
      || x.defnError === 'Invalid expression passed where function argument was expected'
      || x.defnError === 'A definition requires two parts, but found none'
      || x.defnError === 'A definition requires two parts, but found one'
      || x.defnError === 'Passed a non-definition as definition'
      || x.defnError === 'Expected a variable name, or a function header'
      || x.defnError === 'Expected a function header with parameters in parentheses, received nothing in parentheses'
      || x.defnError === 'Expected a function header with parameters in parentheses, received a function name with no parameters'
      || x.defnError === 'A function in BSL cannot have zero parameters'
      || x.defnError === 'A definition can\'t have more than 3 parts'
      || x.defnError === 'Cannot have a definition as the body of a definition'
      || x.defnError === 'The body given is not a valid Expr')
    && Array.isArray(x.sexps)
    && x.sexps.every(isSExp))
    || isReadError(x);
}

export const isExprError = (x: any): x is ExprError => {
  return (typeof x === 'object'
    && ( x.exprError === 'Empty Expr'
      || x.exprError === 'Defn inside Expr'
      || x.exprError === 'No function name after open paren'
      || x.exprError === 'Function call with no arguments')
    && Array.isArray(x.sexps)
    && x.sexps.every(isSExp))
    || isReadError(x);
}

// ----------------------------------------------------------------------------

export const isResult = (x: any): x is Result => {
  return isDefinitionResult(x) || isExprValue(x);
}

export const isDefinitionResult = (x: any): x is DefinitionResult => {
  return isBinding(x) || isBindingError(x);
}

export const isExprValue = (x: any): x is ExprResult => {
  return isValue(x) || isValueError(x);
}

export const isValue = (x: any): x is ValueError => {
  return typeof x === 'object'
    && (( x.type === 'NonFunction'
        && (typeof x.value === 'string'
        ||  typeof x.value === 'number'
        ||  typeof x.value === 'boolean'))
      || ( x.type === 'BuiltinFunction'
        && typeof x.value === 'function' )
      || ( x.type === 'Closure'
        && isClos(x.value)));
}

export const isClos = (x: any): x is Closure => {
  return typeof x === 'object'
    && Array.isArray(x.args)
    && x.args.every((_: any) => typeof _ === 'string')
    && isEnv(x.env)
    && isExpr(x.body);
}

export const isBinding = (x: any): x is Binding => {
  return typeof x === 'object'
    && x.type === 'define'
    && typeof x.defined === 'string'
    && isExprValue(x.toBe);
}

export const isEnv = (x: any): x is Env => {
  return x instanceof Map;
}

export const isValueError = (x: any): x is ValueError => {
  return (typeof x === 'object'
    && (   x.valueError === 'Id not in environment'
        || x.valueError === 'Id referenced before definition'
        || x.valueError === 'Arity mismatch'
        || x.valueError === 'Function used as a predicate'
        || x.valueError === 'Non-boolean value used as a predicate'
        || x.valueError === 'Expression undefined in program'
        || x.valueError === 'Expression defined later in program'
        || x.valueError === 'Nonfunction applied as a function'
    )
    && isExpr(x.expr))
  || isExprError(x);
}

export const isBindingError = (x: any): x is BindingError => {
  return (typeof x === 'object'
    && x.bindingError === 'Repeated definition of the same name'
    && isDefinition(x.definition))
  || isDefinitionError(x);
}
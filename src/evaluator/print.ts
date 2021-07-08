import {
  isTokenError, isReadError, isValueError, isExprError,
  isExprResult, isResultError, isTopLevelError, isExpr } from './predicates';
import {
  ExprResult, Result, ResultError, ValueError, TokenError, 
  ReadError, Token, SExp, TopLevel, Expr,
  Value, TopLevelError, ExprError, TokenType
} from './types';

import { evaluate } from './eval';

export const print = (exp: string): string => {
  return printResults(evaluate(exp));
}

export const printResults = (rs: Result[]): string => {
    if (rs.length === 0)
        return '\n';

    return rs.slice(1).reduce(
        (acc, elem) => {
            return `${acc}${printResult(elem)}\n`;
        },
        printResult(rs[0]) + '\n'
    );
}

// ----------------------------------------------------------------------------

const printTokens = (ts: Token[]): string => {
  return ts.reduce(
    (acc, elem) => {
      if (isTokenError(elem))
        return printTokenError(elem) + '\n';
      else if (elem.type === TokenType.OpenParen
              || elem.type === TokenType.OpenSquareParen
              || elem.type === TokenType.OpenBraceParen)
        return acc + elem.token;
      else if (elem.type === TokenType.CloseParen
              || elem.type === TokenType.CloseSquareParen
              || elem.type === TokenType.CloseBraceParen)
        return acc.trim() + elem.token + ' ';
      else return acc + elem.token + ' ';
    },
    ''
  ).trim();
}

const printTokenError = (te: TokenError): string => {
  return `Token Error: ${te.tokenError} in ${te.string}`;
}

// ----------------------------------------------------------------------------

const printSexps = (sexps: SExp[]): string => {
  return sexps.reduce(
    (acc, elem) => {
      if (isReadError(elem)) 
        return printReadError(elem);
      else if (elem.type === 'SExp Array') 
        return acc + '(' + printSexps(elem.sexp) + ') ';
      else
        return acc + elem.sexp.toString() + ' ';
    },
    ''
  ).trim();
}

const printReadError = (re: ReadError): string => {
  if (isTokenError(re)) {
    return printTokenError(re);
  } else {
    return `Read Error: ${re.readError} for ${printTokens(re.tokens)}`;
  }
}

// ----------------------------------------------------------------------------

const printTopLevel = (tl: TopLevel): string => {
  if (isTopLevelError(tl)) return printTopLevelError(tl);
  if (isExpr(tl)) return printExpr(tl);

  switch (tl.type) {
    case 'define-constant':
      return `(define ${tl.name} ${printExpr(tl.body)})`;

    case 'define-function':
      const params = tl.params.reduce((acc, elem) => `${acc} `.concat(elem))
      return `(define (${tl.name}${tl.params}) ${printExpr(tl.body)})`;

    case 'define-struct':
      const fields = tl.fields.reduce((elem, acc) => `${elem} `.concat(acc))
      return `(define-struct ${tl.name} (${tl.fields.reduce((a, b) => a + ' ' + b ) }))`;

    case 'check-expect':
      return `(check-expect ${printExpr(tl.actual)} ${printExpr(tl.expected)})`;
    
    case 'check-within':
      return `(check-within ${printExpr(tl.actual)} ${printExpr(tl.expected)} ${printExpr(tl.margin)})`;

    case 'check-error':
      return `(check-error ${printExpr(tl.expression)} ${tl.expectedErrorMessage})`;
  }
}

const printExpr = (e: Expr): string => {
  if (isExprError(e)) return printExprError(e);

  switch (e.typeOfExpression) {
    case 'String':
      return `"${e.const}"`;

    case 'Number':
      return e.const.toString();

    case 'VariableUsage':
      return e.const;

    case 'Boolean':
      return e.const ? '#true' : '#false';

    case 'Call':
      return (
        `(${
          e.op.concat(
            e.args.reduce(
              (acc, elem) => acc + printExpr(elem) + ' ',
              ' '
            )
          ).trim()})`
      );

    case 'if':
      return `(if ${ printExpr(e.predicate) } ${ printExpr(e.consequent) } ${ printExpr(e.alternative) })`;
    
    case 'cond': 
      let clauses = '';
    
      for (let clause of e.clauses) {
        clauses += ` [${ printExpr(clause[0]) } ${ printExpr(clause[1]) }]`
      }

      if (e.final !== undefined) clauses += ` [else ${ printExpr(e.final) }]`
    
      return `(cond ${ clauses.trim() })`

    case 'and':
      const andArgs = e.arguments.reduce((acc, elem) => `${acc} `.concat(printExpr(elem)), '');
      return `(and ${andArgs})`;

    case 'or':
      const orArgs = e.arguments.reduce((acc, elem) => `${acc} `.concat(printExpr(elem)), '');
      return `(or ${orArgs})`;

    case 'TemplatePlaceholder':
      return printSexps([e.sexp]);
  }
}

const printTopLevelError = (te: TopLevelError): string => {
  if (isReadError(te)) return printReadError(te);
  return `${te.topLevelError}`; 
}

const printExprError = (ee: ExprError): string => {
  if (isReadError(ee)) return printReadError(ee);
  return `${ee.exprError}`;
}

// ----------------------------------------------------------------------------

export const printResult = (r: Result): string => {
  if (isResultError(r))
    return printResultError(r);
  if (isExprResult(r))
    return printExprResult(r);
  
  switch (r.type) {
    case 'define':
      if (isValueError(r.toBe)) return printValueError(r.toBe);
      if (r.toBe === null) return `Defined ${r.defined}.`
      if (r.toBe.type === 'Closure'){
        const args = r.toBe.value.args.reduce((acc, elem) => `${acc} `.concat(elem), '')
        return `Defined (${r.defined}${args}) to be ${printExprResult(r.toBe)}.`;
      }
      return `Defined ${r.defined} to be ${printExprResult(r.toBe)}.`;
  
    case 'check-success':
      return '🎉';

    case 'check-failure':
      return `Actual value ${printExprResult(r.actual)} differs from ${printExprResult(r.expected)}, the expected value.`;

    case 'check-expected-error':
      return printValueError(r.expected);
  }
}

const printExprResult = (er: ExprResult): string => {
  if (isValueError(er))
    return printValueError(er);
  else 
    return printValue(er);
}

export const printValue = (v: Value): string => {
  if (v.type === 'Atomic') {
    if (v.value === true) return "#true";
    if (v.value === false) return "#false";
    if (typeof v.value === 'string') return `"${v.value}"`
    return v.value.toString();
  } 
  
  switch (v.type) {
    case 'BuiltinFunction':
      return 'Builtin function.';

    case 'Closure':
      return  printExpr(v.value.body);
    
    case 'Struct': 
      const fields = v.values.reduce((acc, elem) => `${acc} `.concat(printExprResult(elem)), '')
      return `(make-${v.struct.name}${fields})`;

    case 'StructureConstructor':
      return `make-${v.struct.name}`;

    case 'StructureAccessor':
      return `${v.struct.name}-${v.struct.fields[v.index]}`;
  
    case 'StructurePredicate':
      return `${v.struct.name}?`;
    
    case 'StructType':
      return `a structure type named ${v.name}`;
  }
}

export const printResultError = (re: ResultError): string => {
  if (isTopLevelError(re)) return printTopLevelError(re);
  return `${printTopLevel(re.toplevel)}: ${ re.resultError }`
}

const printValueError = (ve: ValueError): string => {
  if (isTokenError(ve))
    return printTokenError(ve);
  if (isReadError(ve))
    return printReadError(ve);
  if (isExprError(ve))
    return printExprError(ve);
  else 
    return `${ ve.expr
               ? printExpr(ve.expr) + ': '
               : ''
            }${ve.valueError}`;
}
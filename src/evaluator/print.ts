import { isTokenError, isReadError, isValueError, isExprError, isExprResult, isResultError, isTopLevelError } from './predicates';
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

const printResult = (r: Result): string => {
  if (isResultError(r))
    return printResultError(r);
  if (isExprResult(r))
    return printExprResult(r);
  
  switch (r.type) {
    case 'define':
    case 'check-success':
    case 'check-failure':
    case 'check-expected-error':
      // TODO
      return '';
  }
}

const printResultError = (re: ResultError): string => {
  // TODO
  return '';
}

const printExprResult = (er: ExprResult): string => {
  if (isValueError(er))
    return printValueError(er);
  else 
    return printValue(er);
}

const printValue = (v: Value): string => {
  if (v.type === 'Atomic') {
    if (v.value === true) return "#true";
    if (v.value === false) return "#false";
    if (typeof v.value === 'string') return `"${v.value}"`
    return v.value.toString();
  } else if (v.type === 'BuiltinFunction') {
    return 'Builtin function.'
  } else if (v.type === 'Struct'
             || v.type === 'StructureAccessor'
             || v.type === 'StructureConstructor'
             || v.type === 'StructurePredicate') {
      return '';
    } else {
    return printExpr(v.value.body);
  }
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

const printTokenError = (te: TokenError): string => {
  return `Token Error: ${te.tokenError} in ${te.string}`;
}

const printReadError = (re: ReadError): string => {
  if (isTokenError(re)) {
    return printTokenError(re);
  } else {
    return `Read Error: ${re.readError} for ${printTokens(re.tokens)}`;
  }
}

const printTopLevelError = (te: TopLevelError): string => {
  if (isReadError(te)) return printReadError(te);
  return `TopLevel Error: ${te.topLevelError} in (${printSexps(te.sexps)})`; 
}

const printExprError = (ee: ExprError): string => {
  if (isReadError(ee)) return printReadError(ee);
  if (ee.exprError === 'Empty Expr') return 'Expression Error: Empty Expr in ()';
  return `Expression Error: ${ee.exprError} in (${printSexps(ee.sexps)})`;
}

const printTokens = (ts: Token[]): string => {
  return ts.reduce(
    (acc, elem) => {
      if (isTokenError(elem)) {
        return printTokenError(elem) + '\n';
      } else if (    elem.type === TokenType.OpenParen
                  || elem.type === TokenType.OpenSquareParen
                  || elem.type === TokenType.OpenBraceParen) {
        return acc + elem.token;
      } else return acc + elem.token + ' ';
    },
    ''
  ).trim();
}

const printSexps = (sexps: SExp[]): string => {
  return sexps.reduce(
    (acc, elem) => {
      if (isReadError(elem)) 
        return printReadError(elem);
      else if (Array.isArray(elem.sexp)) 
        return acc + '(' + printSexps(elem.sexp) + ')';
      else
        return acc + elem.sexp.toString() + ' ';
    },
    ''
  ).trim();
}

const printExpr = (e: Expr): string => {
  if (isExprError(e)) return printExprError(e);

  switch (e.typeOfExpression) {
    case 'String': break;
    case 'Number': break;
    case 'VariableUsage': break;
    case 'Boolean': break;
    case 'Call':
      return (
        `(${e.op} ${
          e.args.reduce(
            (acc, elem) => acc + printExpr(elem) + ' ',
            ''
          ).trim()})`
      );
    case 'if':
      return printIf(e);
    case 'cond': 
      return printCond(e);
    case 'and': break;
    case 'or': break;
    case 'TemplatePlaceholder': break;
  }

  return '';
}

const printIf = (i: {
  typeOfExpression: 'if',
  predicate: Expr,
  consequent: Expr,
  alternative: Expr
}): string => {
  return ( 
`(if ${ printExpr(i.predicate) } ${ printExpr(i.consequent) } ${ printExpr(i.alternative) })`
  );
}

const printCond = (c: {
  typeOfExpression: 'cond',
  clauses: [Expr, Expr][]
}): string => {
  let clauses = '';
  
  for (let clause of c.clauses) {
    clauses += `[${ printExpr(clause[0]) } ${ printExpr(clause[1]) }]`
  }

  return `(cond ${clauses})`
}
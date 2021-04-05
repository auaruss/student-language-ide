import { BindingErr } from './constructors';
import { isTokenError, isBindingError, isDefinitionError, isDefinitionResult, isReadError, isValueError, isExprError, isExprResult, isCheckError, isExpr } from './predicates';
import {
  DefinitionResult, ExprResult, Result, Binding, BindingError,
  ValueError, TokenError, ReadError, Token, SExp, Definition, Expr,
  Value, DefinitionError, ExprError, TokenType, CheckResult
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
  if (isDefinitionResult(r)) {
    return printDefinitionResult(r);
  } else if (isExprResult(r)) {
    return printExprResult(r);
  } else {
    return printCheckResult(r);
  }
}

const printDefinitionResult = (dr: DefinitionResult): string => {
  if (isBindingError(dr)) {
    return printBindingError(dr);
  } else {
    return printBinding(dr);
  }
}


const printExprResult = (er: ExprResult): string => {
  if (isValueError(er)) {
    return printValueError(er);
  } else {
    return printValue(er);
  }
}

const printBinding = (b: Binding): string => {
    if (b.toBe) {
	if (!(isValueError(b.toBe)) && b.toBe.type === 'Closure') {
	    let c = b.toBe.value;
	    return `Defined (${b.defined} ${c.args.join(" ")}) to be ${printExpr(c.body)}.`;
	}
	return `Defined ${b.defined} to be ${printExprResult(b.toBe)}.`;
    }
    else return `Defined ${b.defined}.`;
}

const printValue = (v: Value): string => {
  if (v.type === 'NonFunction') {
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

const printBindingError = (be: BindingError): string => {
  if (isTokenError(be)) {
    return printTokenError(be);
  } else if (isReadError(be)) {
    return printReadError(be);
  } else if (isDefinitionError(be)) {
    return printDefinitionError(be);
  } else {
    return `Binding Error: ${be.bindingError} in ${printDefinition(be.definition)}`;
  }
}

const printValueError = (ve: ValueError): string => {
  if (isTokenError(ve)) {
    return printTokenError(ve);
  } else if (isReadError(ve)) {
    return printReadError(ve);
  } else if (isExprError(ve)) {
    return printExprError(ve);
  } else {
    return `${ isExpr(ve.expr)
               ? printExpr(ve.expr) 
               : ve.expr.map(printValue).reduce((a, b) => a.concat(b))
            }: ${ve.valueError}.`;
  }
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

const printDefinitionError = (de: DefinitionError): string => {
  if (isReadError(de)) return printReadError(de);
  return `Definition Error: ${de.defnError} in (${printSexps(de.sexps)})`; 
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

const printDefinition = (d: Definition): string => {
  if (isDefinitionError(d)) return printDefinitionError(d);
  else if (d.type === 'define-constant')
    return '(define' + ' ' + d.name + ' ' + printExpr(d.body) + ')';
  else
    return (
      `(define (${d.name} ${ 
        d.params.reduce(
          (acc, elem) => acc.concat(elem).concat(' '),
          ''
        ).trim()
      }) ${printExpr(d.body)})`
    );
}

const printExpr = (e: Expr): string => {
  if (isExprError(e)) return printExprError(e);
  else if (e.type === 'Call')
    return (
      `(${e.op} ${
        e.args.reduce(
          (acc, elem) => acc + printExpr(elem) + ' ',
          ''
        ).trim()})`
    );
  else return e.const.toString();
}

const printCheckResult = (c: CheckResult): string => {
  if (isCheckError(c)) {
    return '';
  } else if (c.type === 'check-success') {
    return '🎉';
  } else if (c.type === 'check-failure') {
    if (isValueError(c.actual)) {
      return printValueError(c.actual);
    } else {
      return `Actual value ${ printExprResult(c.actual) } differs from ${ printExprResult(c.expected) }, the expected value.`
    }
  } else {
    return printValueError(c.expected);
  }
}
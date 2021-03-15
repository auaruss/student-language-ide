import { SExp, TopLevel, Expr, Definition } from './types';
import { read } from './read';

import {
  isReadError, isExpr, isExprArray, 
} from './predicates';

import {
  IdAtom, StringExpr, NumExpr, IdExpr, BooleanExpr,
  ExprErr, Call, DefnErr, FnDefn, VarDefn, SExps
} from './constructors';

/**
 * Given a program, parses the string into a set of definitions and expressions.
 * @param exp program to be parsed
 */
export const parse = (exp: string): TopLevel[] => {
  return parseSexps(read(exp));
}

/**
 * Given a program's SExp form, parses the string into a set of definitions and expressions.
 * @param sexps program to be parsed
 */
export const parseSexps = (sexps: SExp[]): TopLevel[] => {
  return sexps.map(sexps => parseSexp(sexps));
}

/**
 * Parses a single S-Expression into a definition or expression.
 * @param sexp
 */
export const parseSexp = (sexp: SExp): TopLevel => {
  if (isReadError(sexp)) { 
    return sexp;
  } else switch (sexp.type) {
    case 'SExp Array':
      let sexps = sexp.sexp;
      if (sexps.length === 0)  return ExprErr('Empty Expr', [ SExps() ]);
      let firstSexp = sexps[0];
      if (isReadError(firstSexp) || Array.isArray(firstSexp)) {
        return ExprErr('No function name after open paren', sexps);
      } else if (firstSexp.type === 'Id') {
        if (firstSexp.sexp === 'define') {
          return parseDefinition({type: 'Id', sexp: 'define'}, sexps.slice(1));
        }
        if (sexps.length === 1) return ExprErr('Function call with no arguments', sexps);
        let parseRest = parseSexps(sexps.slice(1));
        if (isExprArray(parseRest))
          return Call(firstSexp.sexp, parseRest);
        return ExprErr('Defn inside Expr', sexps);
      } else {
        return ExprErr('No function name after open paren', sexps);
      }
    case 'String':
      return StringExpr(sexp.sexp)
    case 'Num':
      return NumExpr(sexp.sexp);
    case 'Id':
      return IdExpr(sexp.sexp);
    case 'Bool':
      return BooleanExpr(sexp.sexp);  
  }
}

/**
 * Parses some SExps into a Definition.
 * @param d definition Id (only one exists currently, define-struct can exist later)
 * @param sexps array of SExp after definition
 */
export const parseDefinition = (d: {type: 'Id', sexp: 'define'}, sexps: SExp[]): Definition => {
  if (sexps.length === 0) {
    return DefnErr('A definition requires two parts, but found none', [d, ...sexps]);
  } else if (sexps.length === 1) {
    return DefnErr('A definition requires two parts, but found one', [d, ...sexps]);
  } else if (sexps.length === 2) {
    let varOrHeader = sexps[0], body = parseSexp(sexps[1]);
    if (isExpr(body)) {
      if (isReadError(varOrHeader)) {
        sexps.unshift(d);
        return DefnErr('Expected a variable name, or a function header', sexps);
      } else switch (varOrHeader.type) {
        case 'SExp Array':
          let header = varOrHeader.sexp;
          if (header.length === 0) {
            sexps.unshift(d);
            return DefnErr(
              'Expected a function header with parameters in parentheses, received nothing in parentheses',
              sexps
            );
          } else if (header.length === 1) {
            sexps.unshift(d);
            return DefnErr(
              'Expected a function header with parameters in parentheses, received a function name with no parameters',
              sexps
            );
          } else {
            let functionNameSExp = header[0];
            let functionArgsSExp = header.slice(1);

            if (isReadError(functionNameSExp)) {
              return DefnErr('Invalid expression passed where function name was expected', [d, ...sexps]);
            } else switch (functionNameSExp.type) {
              case 'SExp Array':
                return DefnErr('Invalid expression passed where function name was expected', [d, ...sexps]);
              case 'Id':
                let functionArgs: string[] = [];

                for (let s of functionArgsSExp) {
                  if (isReadError(s)) { 
                    return DefnErr('Invalid expression passed where function argument was expected', [d, ...sexps]);
                  } else if (Array.isArray(s)) {
                    return DefnErr('Invalid expression passed where function argument was expected', [d, ...sexps]);
                  } else if (s.type === 'Id') {
                    functionArgs.push(s.sexp);
                  } else {
                    return DefnErr('Invalid expression passed where function argument was expected', [d, ...sexps]);
                  }
                }
          
                return FnDefn(functionNameSExp.sexp, functionArgs, body);
              case 'String':
              case 'Num':
              case 'Bool':
                return DefnErr('Invalid expression passed where function name was expected', [d, ...sexps]);
            }
          }
        case 'Id':
          let x = varOrHeader.sexp;
          return VarDefn(varOrHeader.sexp, body);
        case 'Num':
          case 'String':
        case 'Bool':
          return DefnErr('Expected a variable name, or a function header', [d, ...sexps]);
      }
    } else {
      return DefnErr('Cannot have a definition as the body of a definition', [d, ...sexps]);
    }
  } else {
    return DefnErr('A definition can\'t have more than 3 parts', [d, ...sexps]);
  }
}
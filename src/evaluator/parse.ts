import { MakeCond, MakeIf } from './constructors';
/**
 * @fileoverview An AST parser for the student languages.
 *               Generally, produces types from the third section of types.ts given types
 *               from the second section of types.ts.
 * 
 * @author Alice Russell
 */

'use strict';

import { SExp, TopLevel, TopLevel, Check, Expr, Cond } from './types';

import {
  MakeStringExpr, MakeNumberExpr, MakeVariableUsageExpr, MakeBooleanExpr, ExprErr, MakeCall,
  DefnErr, MakeFunctionDefinition, MakeVariableDefinition, SExps, MakeCheckExpect, MakeCheckError
} from './constructors';

import { isReadError, isExpr, isExprArray } from './predicates';

import { read } from './read';

/**
 * Given a program, parses the string into a set of definitions and expressions.
 * @param exp program to be parsed
 * @returns a list of top level syntactical objects
 */
export const parse = (exp: string): TopLevel[] => {
  return parseSexps(read(exp));
}

/**
 * Given a program's read s-expression form, parses it into a set of definitions and expressions.
 * @param sexps program to be parsed
 * @returns a list of top level syntactical objects
 */
export const parseSexps = (sexps: SExp[]): TopLevel[] => {
  return sexps.map(sexps => parseSexp(sexps));
}

/**
 * Parses a single s-expression into a top level syntactical object.
 * @param sexp a single s-expression from the reader
 * @returns a single top level syntactical object
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
        } else if (firstSexp.sexp === 'check-expect') {
          return parseCheck({type: 'Id', sexp: 'check-expect'}, sexps.slice(1));
        } else if (firstSexp.sexp === 'if') {
          return parseIf({type: 'Id', sexp: 'if'}, sexps.slice(1));
        } else if (firstSexp.sexp === 'cond') {
          return parseCond({type: 'Id', sexp: 'cond'}, sexps.slice(1));
        }

        if (sexps.length === 1) return ExprErr('Function call with no arguments', sexps);

        let parseRest = parseSexps(sexps.slice(1));

        if (isExprArray(parseRest))
          return MakeCall(firstSexp.sexp, parseRest);
        return ExprErr('Defn inside Expr', sexps);

      } else {

        return ExprErr('function call: expected a function after the open parenthesis, but found a part', sexps);

      }
    case 'String':
      return MakeStringExpr(sexp.sexp)
    case 'Num':
      return MakeNumberExpr(sexp.sexp);
    case 'Id':
      
      return MakeVariableUsageExpr(sexp.sexp);
    case 'Bool':
      return MakeBooleanExpr(sexp.sexp);  
  }
}

/**
 * Parses some SExps into a Definition.
 * @param d definition identifier
 * @param sexps array of s-expressions determined to be either a definition or an error
 * @returns a top level definition or definition error
 */
export const parseDefinition = (d: {type: 'Id', sexp: 'define'}, sexps: SExp[]): TopLevel => {
  if (sexps.length === 0) {
    return DefnErr('A definition requires two parts, but found none', [d, ...sexps]);
  } else if (sexps.length === 1) {
    return DefnErr('A definition requires two parts, but found one', [d, ...sexps]);
  } else if (sexps.length === 2) {
    //disallow keywords here in headers and variables

    let varOrHeader = sexps[0], body = parseSexp(sexps[1]);
    if (isExpr(body)) {
      if (isReadError(varOrHeader)) 
        return DefnErr('Expected a variable name, or a function header', [d, ...sexps]);
      switch (varOrHeader.type) {
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
          
                return MakeFunctionDefinition(functionNameSExp.sexp, functionArgs, body);
              case 'String':
              case 'Num':
              case 'Bool':
                return DefnErr('Invalid expression passed where function name was expected', [d, ...sexps]);
            }
          }
        case 'Id':
          return MakeVariableDefinition(varOrHeader.sexp, body);
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

const parseCheck = (c: {type: 'Id', sexp: 'check-expect'}, sexps: SExp[]): Check => {
  if (sexps.length === 0) {
    return MakeCheckError('A check-expect requires two expressions, but found none', [c, ...sexps]);
  } else if (sexps.length === 1) {
    return MakeCheckError('A check-expect requires two expressions, but found one', [c, ...sexps]);
  } else if (sexps.length === 2) {
    const maybeExprs = sexps.map(parseSexp);
    if (! isExpr(sexps[0]))
      return MakeCheckError('First part of check-expect must be an expression.',  [c, ...sexps]);
    if (! isExpr(sexps[1]))
      return MakeCheckError('Second part of check-expect must be an expression.',  [c, ...sexps]);
    
    if (! isExprArray(maybeExprs)) {
      throw new Error('Somehow, parseCheck and isExprArray disagree on whether this check-expect is an Expr array.');
    } else {
      return MakeCheckExpect(maybeExprs[0], maybeExprs[1]);
    }

  } else {
    return MakeCheckError('A check-expect can\'t have more than 3 parts.', [c, ...sexps]);
  }
}

const parseIf = (i: {type: 'Id', sexp: 'if'}, sexps: SExp[]): Expr => {
  if (sexps.length === 0) {
    return ExprErr('An if requires three expressions, but found none', [i, ...sexps]);
  } else if (sexps.length === 1) {
    return ExprErr('An if requires three expressions, but found one', [i, ...sexps]);
  } else if (sexps.length === 2) {
    return ExprErr('An if requires three expressions, but found two', [i, ...sexps]);
  } else if (sexps.length === 3) {

    const maybeExprs = sexps.map(parseSexp);

    if (! isExpr(sexps[0]))
      return ExprErr('First argument to if must be an expression.',  [i, ...sexps]);
    if (! isExpr(sexps[1]))
      return ExprErr('Second argument to if must be an expression.',  [i, ...sexps]);
    if (! isExpr(sexps[1]))
      return ExprErr('Third argument to if must be an expression.',  [i, ...sexps]);

    if (! isExprArray(maybeExprs)) {
      throw new Error('Somehow, parseIf and isExprArray disagree on whether these are is an Exprs.');
    } else {
      return MakeIf(maybeExprs[0], maybeExprs[1], maybeExprs[2]);
    }
  } else {
    return ExprErr('if cannot take more than three expressions.', [i, ...sexps]);
  }
}

const parseCond = (c: {type: 'Id', sexp: 'cond'}, sexps: SExp[]): Expr => {
  let clauses: [Expr, Expr][] = [];

  for (let s of sexps) {
    if (isReadError(s))
      return ExprErr('All arguments to cond must be clauses.',  [c, ...sexps]);
    if (s.type !== 'SExp Array')
      return ExprErr('All arguments to cond must be clauses.',  [c, ...sexps]);
    if (s.sexp.length !== 2)
      return ExprErr('All clauses must have exactly 2 expressions.',  [c, ...sexps]);
    const pred = parseSexp(s.sexp[0]);
    const conseq = parseSexp(s.sexp[1]);

    if (! isExpr(pred))
      return ExprErr('All clauses must have exactly 2 expressions.',  [c, ...sexps]);
    if (! isExpr(conseq))
      return ExprErr('All clauses must have exactly 2 expressions.',  [c, ...sexps]);
    
    clauses.push([pred, conseq]);
  }

  return MakeCond(clauses);
}
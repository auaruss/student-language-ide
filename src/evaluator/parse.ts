import { parseTopLevel } from './parse';
import { IdAtom, MakeBooleanExpr, MakeCond, MakeIf, MakeNumberExpr, MakeStringExpr, MakeVariableUsageExpr, TopLevelErr, MakeTemplatePlaceholder, SExps, MakeFunctionDefinition } from './constructors';
import { isExpr, isReadError, isTopLevel, isTopLevelError, isExprError } from './predicates';
/**
 * @fileoverview An AST parser for the student languages.
 *               Generally, produces types from the third section of types.ts given types
 *               from the second section of types.ts.
 * 
 * @author Alice Russell
 */

'use strict';

import { read } from './read';
import { Expr, SExp, TopLevel, TopLevelError } from './types';


// dictionary of strings to two separate functions (standalone or called)

const KEYWORDS = [
  'define', 'define-struct',
  'if', 'cond', 'λ', 'lambda', 'and', 'or',
  '..', '...', '....', '.....', '......',
  'check-expect', 'check-within', 'check-error'
];

const setBuiltinParseEnv = ():
  Map<
    String, 
    [() => TopLevel, (sexps: SExp[]) => TopLevel]
  > => {

  const parseEnv = new Map<
    String, 
    [() => TopLevel, (sexps: SExp[]) => TopLevel]
  >();

  parseEnv.set('define', [
    () => TopLevelErr('define: expected an open parenthesis before define, but found none', []),
    (sexps: SExp[]) => {
      if (sexps.length === 0)
        return TopLevelErr('define: expected a variable name, or a function name and its variables (in parentheses), but nothing\'s there', []);
      if (isReadError(sexps[0])) return sexps[0];
      switch (sexps[0].type) {
        case 'String':
          return TopLevelErr('define: expected a variable name, or a function name and its variables (in parentheses), but found a string', []);
        case 'Num':
          TopLevelErr('define: expected a variable name, or a function name and its variables (in parentheses), but found a number', []);
        case 'Bool':
          TopLevelErr('define: expected a variable name, or a function name and its variables (in parentheses), but found something else', []);
        case 'Id':
          return parseVariableDefinition(sexps);
        case 'SExp Array':
          return parseFunctionDefinition(sexps);
      }
    }
  ]);

  parseEnv.set('define-struct', [
    () => TopLevelErr('define-struct: expected an open parenthesis before define-struct, but found none', []),
    (sexps: SExp[]) => {
      if (isReadError(sexps[0])) return sexps[0];
      switch (sexps[0].type) {
        case 'String':
          return TopLevelErr('define-struct: expected the structure name after define-struct, but found a string', []);
        case 'Num':
          return TopLevelErr('define-struct: expected the structure name after define-struct, but found a number', []);
        case 'Bool':
          return TopLevelErr('define-struct: expected the structure name after define-struct, but found something else', []);
        case 'Id':
          return parseStructureDefinition(sexps);
        case 'SExp Array':
          return TopLevelErr('define-struct: expected the structure name after define-struct, but found a part', []);
      }
    }
  ]);

  parseEnv.set('if', [
    () => TopLevelErr('if: expected an open parenthesis before if, but found none', []),
    (sexps: SExp[]) => {
      if (isReadError(sexps[0])) return sexps[0];
      if (sexps.length === 0)
        return TopLevelErr('if: expected a question and two answers, but nothing\'s there', []);
      if (sexps.length === 1)
        return TopLevelErr('if: expected a question and two answers, but found only 1 part', []);
      if (sexps.length > 3)
        return TopLevelErr(`if: expected a question and two answers, but found ${ sexps.length } parts`, []);
      
      const maybeExprs = parseTopLevels(sexps);
      const exprs: Expr[] = [];

      for (let maybeExpr of maybeExprs) {
        if (isTopLevelError(maybeExpr) || isExprError(maybeExpr)) return maybeExpr;
        if (isTopLevel(maybeExpr) && (! isExpr(maybeExpr))) {
          switch (maybeExpr.type) {
            case 'check-error':
              return TopLevelErr('check-error: found a test that is not at the top level', sexps);
            case 'check-expect':
              return TopLevelErr('check-expect: found a test that is not at the top level', sexps);
            case 'check-within':
              return TopLevelErr('check-within: found a test that is not at the top level', sexps);
            case 'define-constant':
              return TopLevelErr('define: found a definition that is not at the top level', sexps);
            case 'define-function':
              return TopLevelErr('define: found a definition that is not at the top level', sexps);
            case 'define-struct':
              return TopLevelErr('define-struct: found a definition that is not at the top level', sexps);
          }
        } else {
          exprs.push(maybeExpr);
        }
      }

      return MakeIf(exprs[0], exprs[1], exprs[2]);
    }
  ]);

  parseEnv.set('cond', [
    () => TopLevelErr('cond: expected an open parenthesis before cond, but found none', []),
    (sexps: SExp[]) => {
      // ....
    }
  ]);

  return parseEnv;
}
/**
 * Given a program, parses the string into a set of definitions and expressions.
 * @param exp program to be parsed
 * @returns a list of top level syntactical objects
 */
export const parse = (exp: string): TopLevel[] => {
  return parseTopLevels(read(exp));
}

export const parseTopLevels = (sexps: SExp[]): TopLevel[] => {
  return sexps.map(parseTopLevel);
}

export const parseTopLevel = (sexp: SExp): TopLevel => {
  if (isReadError(sexp)) return sexp;

  switch (sexp.type) {
    case 'String':
      return MakeStringExpr(sexp.sexp);

    case 'Num':
      return MakeNumberExpr(sexp.sexp);

    case 'Bool':
      return MakeBooleanExpr(sexp.sexp);

    case 'Id':
      let maybeValidId = checkValidIdentifier(sexp.sexp);
      if (! maybeValidId)
        return maybeValidId;
      if (sexp.sexp === '...') return MakeTemplatePlaceholder(sexp);
      return MakeVariableUsageExpr(sexp.sexp);

    case 'SExp Array':
      return parseList(sexp.sexp);
  }
}

export const checkValidIdentifier = (s: string): TopLevelError | true => {
  if (KEYWORDS.includes(s))
    return TopLevelErr(
      `${ s }: Expected an open parenthesis before ${ s }, but found none`,
      [ IdAtom(s) ]
    );

  return true;
}


export const parseList = (sexps: SExp[]): TopLevel => {
  if (sexps.length === 0)
    return TopLevelErr('function call: expected a function after the open parenthesis, but nothing\'s there', sexps)
  
  if (isReadError(sexps[0])) return sexps[0]; // should we change this now?
  
  switch (sexps[0].type) {
    case 'String':
    case 'Num':
    case 'Bool':
      return TopLevelErr(`function call: expected a function after the open parenthesis, but found a ${sexps[0].type}`, sexps);
    case 'Id':
      if (KEYWORDS.includes(sexps[0].sexp))
        return parseBuiltinExpression(sexps[0].sexp, sexps.slice(1));
      return parseCall(sexps[0].sexp, sexps.slice(1));

    case 'SExp Array':
      return TopLevelErr(`function call: expected a function after the open parenthesis, but found a part`, sexps);
  }
}

const parseBuiltinExpression = (keyword: string, sexps: SExp[]): TopLevel => {
  switch (keyword) {
    case '..':
    case '...':
    case '....':
    case '.....':
    case '......':
      return MakeTemplatePlaceholder(SExps(IdAtom(keyword), ...sexps));
    case 'define':
      parseVariableDefinition
      parseFunctionDefinition
    case 'if':
      parseIf
    case 'and':
      parseAnd
    case 'or':
      parseOr
    case 
  }
}

// call parseTopLevel recursively then build a call...
// complain if we get a non-expr toplevel


const parseCall = (fname: string, sexps: SExp[]): Expr => {

}

const parseVariableDefinition = (sexps: SExp[]): TopLevel => {

}

const parseFunctionDefinition = (sexps: SExp[]): TopLevel => {
  
}

const parseStructureDefinition = (sexps: SExp[]): TopLevel => {

}
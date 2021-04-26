import { IdAtom, MakeBooleanExpr, MakeCond, MakeIf, MakeNumberExpr, MakeStringExpr, MakeVariableUsageExpr, TopLevelErr, MakeTemplatePlaceholder, SExps } from './constructors';
import { isReadError } from './predicates';
/**
 * @fileoverview An AST parser for the student languages.
 *               Generally, produces types from the third section of types.ts given types
 *               from the second section of types.ts.
 * 
 * @author Alice Russell
 */

'use strict';

import { read } from './read';
import { SExp, TopLevel, TopLevelError } from './types';


const KEYWORDS = [
  'define', 'define-struct',
  'if', 'cond', 'λ', 'lambda', 'and', 'or',
  '..', '...', '....', '.....', '......'
  ,
];

/**
 * Given a program, parses the string into a set of definitions and expressions.
 * @param exp program to be parsed
 * @returns a list of top level syntactical objects
 */
export const parse = (exp: string): TopLevel[] => {
  return parseTopLevels(read(exp));
}

export const parseTopLevels = (sexps: SExp[]): TopLevel[] => {
  let names: string[] = [];

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

const parseCall = (fname: string, sexps: SExp[]): TopLevel => {

}
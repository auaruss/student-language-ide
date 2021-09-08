/**
 * @fileoverview An AST parser for the student languages.
 *               Generally, produces types from the third section of types.ts given types
 *               from the second section of types.ts.
 * 
 * @author Alice Russell
 */

'use strict';

import {
  IdAtom, MakeBooleanExpr, MakeCond, MakeIf, MakeNumberExpr,
  MakeStringExpr, MakeVariableUsageExpr, TopLevelErr, MakeTemplatePlaceholder,
  SExps, MakeFunctionDefinition, MakeAnd, MakeOr, MakeCheckExpect, 
  MakeCheckWithin, MakeCall
} from './constructors';
import { isExpr, isReadError, isTopLevel, isTopLevelError, isExprError, isExprArray } from './predicates';
import { read } from './read';
import { Expr, ParseEnv, SExp, TopLevel, TopLevelError } from './types';
import { MakeVariableDefinition, MakeStructureDefinition } from './constructors';


/**
 * Contains a mapping of built in keywords (strings) their implemented behaviors.
 * These behaviors are stored as a two-function 2-tuple.
 * The first element takes no arguments and is what to do when the keyword is found at the top level
 * without parenthesis.
 * The second element takes an array of S-Expressions and is the behavior for when an S-Expression array
 * starts with a keyword, and the rest of the S-Expression is passed as the argument to the function.
 */
const parseEnv: ParseEnv
  = new Map<
    String, 
    [() => TopLevel, (sexps: SExp[]) => TopLevel]
  >();

parseEnv.set('define', [
  () => TopLevelErr('define: expected an open parenthesis before define, but found none', [IdAtom('define')]),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('define: expected a variable name, or a function name and its variables (in parentheses), but nothing\'s there', [SExps(IdAtom('define'), ...sexps)]);
    
    if (isReadError(sexps[0])) return sexps[0];

    if (sexps[0].type === 'SExp Array') {
      if (sexps[0].sexp.length === 0)
        return TopLevelErr('define: expected a name for the function, but nothing\'s there', [SExps(IdAtom('define'), ...sexps)]);

      const maybeFnName = checkForNonKeywordIdentifier(
        sexps[0].sexp[0],
        'define: expected the name of the function, but found ',
        [SExps(IdAtom('define'), ...sexps)]
      );

      if (isTopLevelError(maybeFnName)) return maybeFnName;
      let fnName: string = maybeFnName;

      const params: string[] = [];

      for (const sexp of sexps[0].sexp.slice(1)) {
        const maybeVar = checkForNonKeywordIdentifier(
          sexp,
          'define: expected a variable, but found ',
          [SExps(IdAtom('define'), ...sexps)]
        );

        if (isTopLevelError(maybeVar)) return maybeVar;
        params.push(maybeVar);
      }

      // This is here because if we place it before the loop keywords are checked after
      // length of the header, which is not intended behavior in DrRacket BSL.
      if (sexps[0].sexp.length === 1)
        return TopLevelErr('define: expected at least one variable after the function name, but found none', [SExps(IdAtom('define'), ...sexps)]);

      if (sexps.length > 2)
        return TopLevelErr(`define: expected only one expression for the function body, but found ${ sexps.length - 2 } extra part ${ (sexps.length === 3) ? '' : 's'}`, [SExps(IdAtom('define'), ...sexps)]);

      const body = parseExpression(sexps[1]);

      if (! isExpr(body))
        return body;

      return MakeFunctionDefinition(fnName, params, body);
    }

    const maybeNonKeywordIdentifier = checkForNonKeywordIdentifier(
      sexps[0],
      'define: expected a variable name, or a function name and its variables (in parentheses), but found ',
      [SExps(IdAtom('define'), ...sexps)]
    );

    if (isTopLevelError(maybeNonKeywordIdentifier)) return maybeNonKeywordIdentifier;
    let varName: string = maybeNonKeywordIdentifier;

    if (sexps.length === 1)
      return TopLevelErr(
        `define: expected an expression after the variable name ${ sexps[0].sexp }, but nothing's there`,
        [SExps(IdAtom('define'), ...sexps)]
      );
    if (sexps.length > 2)
      return TopLevelErr(
        `define: expected only one expression after the variable name ${ sexps[0].sexp }, but found 1 extra part`,
        [SExps(IdAtom('define'), ...sexps)]
      );
    
    const maybeBody = parseExpression(sexps[1]);

    if (! isExpr(maybeBody))
        return maybeBody;

    return MakeVariableDefinition(varName, maybeBody);
  }
]);

parseEnv.set('define-struct', [
  () => TopLevelErr('define-struct: expected an open parenthesis before define-struct, but found none', [IdAtom('define-struct')]),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('define-struct: expected the structure name after define-struct, but nothing\'s there', [SExps(IdAtom('define-struct'), ...sexps)]);

    const maybeStructureName = checkForNonKeywordIdentifier(
      sexps[0],
      'define-struct: expected the structure name after define-struct, but found ',
      [SExps(IdAtom('define-struct'), ...sexps)]
    );
    
    if (isTopLevelError(maybeStructureName)) return maybeStructureName;
    let structureName: string = maybeStructureName;

    if (sexps.length === 1)
      return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but nothing\'s there', [SExps(IdAtom('define-struct'), ...sexps)]);

    if (isReadError(sexps[1])) return sexps[1];

    switch (sexps[1].type) {
      case 'String':
        return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but found a string', [SExps(IdAtom('define-struct'), ...sexps)]);
      case 'Num':
        return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but found a number', [SExps(IdAtom('define-struct'), ...sexps)]);
      case 'Bool':
        return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but found a boolean', [SExps(IdAtom('define-struct'), ...sexps)]);
      case 'Id':
        return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but found something else', [SExps(IdAtom('define-struct'), ...sexps)]);
      case 'SExp Array':
        const fields: string[] = [];

        for (const sexp of sexps[1].sexp) {
          const maybeFieldName = checkForNonKeywordIdentifier(
            sexp,
            'define-struct: expected a field name, but found ',
            [SExps(IdAtom('define-struct'), ...sexps)]
          );
          
          if (isTopLevelError(maybeFieldName)) return maybeFieldName;
          fields.push(maybeFieldName);
        }

        if (sexps.length > 2)
          return TopLevelErr(
            `define-struct: expected nothing after the field names, but found ${ sexps.length - 2 } extra parts`,
            sexps
          );

        return MakeStructureDefinition(structureName, fields);
    }
  }
]);

parseEnv.set('if', [
  () => TopLevelErr('if: expected an open parenthesis before if, but found none', [IdAtom('if')]),
  (sexps: SExp[]) => {
    if (isReadError(sexps[0])) return sexps[0];
    if (sexps.length === 0)
      return TopLevelErr('if: expected a question and two answers, but nothing\'s there', [SExps(IdAtom('if'), ...sexps)]);
    if (sexps.length === 1)
      return TopLevelErr('if: expected a question and two answers, but found only 1 part', [SExps(IdAtom('if'), ...sexps)]);
    if (sexps.length > 3)
      return TopLevelErr(`if: expected a question and two answers, but found ${ sexps.length } parts`, [SExps(IdAtom('if'), ...sexps)]);
    
    const maybeExprs = sexps.map(parseExpression);

    if (isExprArray(maybeExprs))
      return MakeIf(maybeExprs[0], maybeExprs[1], maybeExprs[2]);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);

parseEnv.set('cond', [
  () => TopLevelErr('cond: expected an open parenthesis before cond, but found none', [IdAtom('cond')]),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('cond: expected a clause after cond, but nothing\'s there', [SExps(IdAtom('cond'), ...sexps)]);

    const clauses: [Expr, Expr][] = [];

    for (let i = 0; i < sexps.length; i++) {
      let sexp = sexps[i];

      if (isReadError(sexp))
        return sexp;
      switch (sexp.type) {
        case 'Bool':
          return TopLevelErr('cond: expected an open parenthesis before cond, but found a boolean', [SExps(IdAtom('cond'), ...sexps)]);
        case 'Id':
          return TopLevelErr('cond: expected a clause with a question and an answer, but found something else', [SExps(IdAtom('cond'), ...sexps)]);
        case 'Num':
          return TopLevelErr('cond: expected an open parenthesis before cond, but found a number', [SExps(IdAtom('cond'), ...sexps)]);
        case 'String':
          return TopLevelErr('cond: expected a clause with a question and an answer, but found a string', [SExps(IdAtom('cond'), ...sexps)]);
        case 'SExp Array':
          if (sexp.sexp.length < 1)
            return TopLevelErr('cond: expected a clause with a question and an answer, but found an empty part', [SExps(IdAtom('cond'), ...sexps)]);
          else if (sexp.sexp.length === 2) {

            // Handles the else case
            if (isReadError(sexp.sexp[0])) return sexp.sexp[0];
            if (
              sexp.sexp[0].type === 'Id'
              && sexp.sexp[0].sexp === 'else'
              && i === sexps.length - 1
            ) {
              const answer = parseExpression(sexp.sexp[1]);
              if (! (isExpr(answer))) return answer;
              return MakeCond(clauses, answer);
            }

            const question = parseExpression(sexp.sexp[0]);
            if (! (isExpr(question))) return question;

            const answer = parseExpression(sexp.sexp[1]);
            if (! (isExpr(answer))) return answer;

            clauses.push([question, answer]);
          } else {
            return TopLevelErr(
              `cond: expected a clause with a question and an answer, but found a clause with ${ sexp.sexp.length } parts`,
              [SExps(IdAtom('cond'), ...sexps)]
            );
          }
      }
    }

    return MakeCond(clauses);
  }
]);

parseEnv.set('else', [
  () => TopLevelErr('else: not allowed here, because this is not a question in a clause', [IdAtom('cond')]),
  (sexps: SExp[]) => TopLevelErr('else: not allowed here, because this is not a question in a clause', [IdAtom('cond')])
]);

parseEnv.set('and', [
  () => TopLevelErr('and: expected an open parenthesis before and, but found none', [IdAtom('and')]),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('and: expects at least 2 arguments, but found none', [SExps(IdAtom('and'), ...sexps)]);
    if (sexps.length === 1)
      return TopLevelErr('and: expects at least 2 arguments, but found only 1', [SExps(IdAtom('and'), ...sexps)]);

    const maybeExprs = sexps.map(parseExpression);

    if (isExprArray(maybeExprs))
      return MakeAnd(maybeExprs);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);

parseEnv.set('or', [
  () => TopLevelErr('or: expected an open parenthesis before and, but found none', [IdAtom('or')]),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('or: expects at least 2 arguments, but found none', [SExps(IdAtom('or'), ...sexps)]);
    if (sexps.length === 1)
      return TopLevelErr('or: expects at least 2 arguments, but found only 1', [SExps(IdAtom('or'), ...sexps)]);

    const maybeExprs = sexps.map(parseExpression);

    if (isExprArray(maybeExprs))
      return MakeOr(maybeExprs);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);


function dots_msg(d: string): [() => TopLevel, (sexps: SExp[]) => TopLevel] {
  return [
    (() => MakeTemplatePlaceholder(IdAtom(d))),
  (sexps: SExp[]) => {
    for (const sexp of sexps) {
      if (isReadError(sexp)) return sexp;
    }
    return MakeTemplatePlaceholder(SExps(IdAtom(d), ...sexps));
  }];
}

['..', '...', '....', '.....', '......'].map((d) => parseEnv.set(d, dots_msg(d)));

parseEnv.set('check-expect', [
  () => TopLevelErr('check-expect: expects 2 arguments, but found none', [IdAtom('check-expect')]),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('check-expect: expects 2 arguments, but found none', [SExps(IdAtom('check-expect'), ...sexps)]);
    if (sexps.length === 1)
      return TopLevelErr('check-expect: expects 2 arguments, but found only 1', [SExps(IdAtom('check-expect'), ...sexps)]);
    if (sexps.length >= 3)
      return TopLevelErr(
        `check-expect: expects only 2 arguments, but found ${ sexps.length }`,
        [SExps(IdAtom('check-expect'), ...sexps)]
      );
    
    const maybeExprs = sexps.map(parseExpression);

    if (isExprArray(maybeExprs))
      return MakeCheckExpect(maybeExprs[0], maybeExprs[1]);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);

parseEnv.set('check-within', [
  () => TopLevelErr('check-within: expects 3 arguments, but found none', [IdAtom('check-within')]),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('check-within: expects 3 arguments, but found none', [SExps(IdAtom('check-within'), ...sexps)]);
    if (sexps.length <= 2)
      return TopLevelErr(`check-within: expects 3 arguments, but found only ${ sexps.length }`, [SExps(IdAtom('check-within'), ...sexps)]);
    if (sexps.length > 3)
      return TopLevelErr(`check-within: expects 3 arguments, but found ${ sexps.length }`, [SExps(IdAtom('check-within'), ...sexps)]);
    
    const maybeExprs = sexps.map(parseExpression);

    if (isExprArray(maybeExprs))
      return MakeCheckWithin(maybeExprs[0], maybeExprs[1], maybeExprs[2]);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);

parseEnv.set('check-error', [
  () => { return TopLevelErr('Unimplemented keyword', [IdAtom('check-error')]) },
  (sexps) => { return TopLevelErr('Unimplemented keyword', [SExps(IdAtom('check-error'), ...sexps)]) }
]);

parseEnv.set('check-random', [
  () => { return TopLevelErr('Unimplemented keyword', [IdAtom('check-random')]) },
  (sexps) => { return TopLevelErr('Unimplemented keyword', [SExps(IdAtom('check-random'), ...sexps)]) }
]);

parseEnv.set('check-satisfied', [
  () => { return TopLevelErr('Unimplemented keyword', [IdAtom('check-satisfied')]) },
  (sexps) => { return TopLevelErr('Unimplemented keyword', [SExps(IdAtom('check-satisfied'), ...sexps)]) }
]);

parseEnv.set('check-member-of', [
  () => { return TopLevelErr('Unimplemented keyword', [IdAtom('check-member-of')]) },
  (sexps) => { return TopLevelErr('Unimplemented keyword', [SExps(IdAtom('check-member-of'), ...sexps)]) }
]);

parseEnv.set('check-range', [
  () => { return TopLevelErr('Unimplemented keyword', [IdAtom('check-range')]) },
  (sexps) => { return TopLevelErr('Unimplemented keyword', [SExps(IdAtom('check-range'), ...sexps)]) }
]);

parseEnv.set('lambda', [
  () => { return TopLevelErr('Unimplemented keyword', [IdAtom('lambda')]) },
  (sexps) => { return TopLevelErr('Unimplemented keyword', [SExps(IdAtom('lambda'), ...sexps)]) }
]);

parseEnv.set('λ', [
  () => { return TopLevelErr('Unimplemented keyword', [IdAtom('λ')]) },
  (sexps) => { return TopLevelErr('Unimplemented keyword', [SExps(IdAtom('λ'), ...sexps)]) }
]);

/**
 * Given a program, parses the string into a set of top level syntactical objects
 * @param exp program to be parsed
 * @returns a list of top level syntactical objects
 */
export const parse = (exp: string): TopLevel[] => {
  return parseTopLevels(read(exp));
}

/**
 * Given a program, parses the S-Expressions into a set of top level syntactical objects
 * @param sexps program to be parsed
 * @returns a list of top level syntactical objects
 */
export const parseTopLevels = (sexps: SExp[]): TopLevel[] => {
  return sexps.map(parseTopLevel);
}

/**
 * Parses an expression specifically not at the top level (nested within something).
 * @param sexp nested expression
 * @returns A properly formed expression or an error explaining why this S-Expression must be at the top level
 */
export const parseExpression = (sexp: SExp): Expr | TopLevelError => {
  const maybeExpr = parseTopLevel(sexp)

  if (isTopLevelError(maybeExpr) || isExprError(maybeExpr)) return maybeExpr;
  if (isTopLevel(maybeExpr) && (! isExpr(maybeExpr))) {
    switch (maybeExpr.type) {
      case 'check-error':
        return TopLevelErr('check-error: found a test that is not at the top level', [sexp]);
      case 'check-expect':
        return TopLevelErr('check-expect: found a test that is not at the top level', [sexp]);
      case 'check-within':
        return TopLevelErr('check-within: found a test that is not at the top level', [sexp]);
      case 'define-constant':
        return TopLevelErr('define: found a definition that is not at the top level', [sexp]);
      case 'define-function':
        return TopLevelErr('define: found a definition that is not at the top level', [sexp]);
      case 'define-struct':
        return TopLevelErr('define-struct: found a definition that is not at the top level', [sexp]);
    }
  }

  return maybeExpr;
}

/**
 * Parses an S-Expression at the top level of the program.
 * @param sexp S-Expression to be parsed
 * @returns A top level syntactical object
 */
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
      const maybeBuiltin = parseEnv.get(sexp.sexp);
      if (maybeBuiltin !== undefined)
        return maybeBuiltin[0]();
      return MakeVariableUsageExpr(sexp.sexp);

    case 'SExp Array':
      return parseList(sexp.sexp);
  }
}

/**
 * Parses an S-Expression array.
 * @param sexps An S-Expression array at the top level
 * @returns A top level syntactical object
 */
export const parseList = (sexps: SExp[]): TopLevel => {
  if (sexps.length === 0)
    return TopLevelErr('function call: expected a function after the open parenthesis, but nothing\'s there', sexps)
  
  if (isReadError(sexps[0])) return sexps[0];
  
  switch (sexps[0].type) {
    case 'String':
    case 'Num':
    case 'Bool':
      return TopLevelErr(`function call: expected a function after the open parenthesis, but found a ${
        sexps[0].type === 'String' ? 'string'
        : sexps[0].type === 'Num' ? 'number'
        : 'boolean'
      }`, sexps);
    case 'Id':
      const maybeBuiltin = parseEnv.get(sexps[0].sexp);
      if (maybeBuiltin !== undefined)
        return maybeBuiltin[1](sexps.slice(1));
      return parseCall(sexps[0].sexp, sexps.slice(1));

    case 'SExp Array':
      return TopLevelErr(`function call: expected a function after the open parenthesis, but found something else`, sexps);
  }
}

/**
 * Parses an S-Expression array that doesn't start with a keyword.
 * @param fname function name
 * @param sexps function argument S-Expressions
 * @returns A parsed call or error explaining why the call was invalid
 */
const parseCall = (fname: string, sexps: SExp[]): Expr | TopLevelError => {
  const parsedArgs: Expr[] = []

  for (const sexp of sexps) {
    const maybeArg = parseExpression(sexp);

    if (isTopLevelError(maybeArg) || isExprError(maybeArg) || (! isExpr(maybeArg)))
      return maybeArg;

    parsedArgs.push(maybeArg);
  }

  return MakeCall(fname, parsedArgs);
}

/**
 * Checks to see if an S-Expression is a non-keyword identifier. Returns an error if it's not.
 * @param sexp S-Expression to be checked
 * @param err Error message (except the type of S-Expression that sexp is, to be determined by this function)
 * @param sexpsForErr S-Expressions to pass forward to the printer
 * @returns either the identifier as a string, or a top level error
 */
const checkForNonKeywordIdentifier = (
  sexp: SExp, err: string,
  sexpsForErr: SExp[]
): string | TopLevelError => {
  if (isReadError(sexp)) return sexp;

  switch (sexp.type) {
    case 'String':
      return TopLevelErr(err + 'a string', sexpsForErr);

    case 'Num':
      return TopLevelErr(err + 'a number', sexpsForErr);

    case 'Bool':
      return TopLevelErr(err + 'a boolean', sexpsForErr);

    case 'Id':
      if (parseEnv.has(sexp.sexp))
        return TopLevelErr(err + 'a keyword', sexpsForErr);
      return sexp.sexp;

    case 'SExp Array':
      return TopLevelErr(err + 'something else', sexpsForErr);
  }
}
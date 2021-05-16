import { MakeVariableDefinition, MakeStructureDefinition } from './constructors';
/**
 * @fileoverview An AST parser for the student languages.
 *               Generally, produces types from the third section of types.ts given types
 *               from the second section of types.ts.
 * 
 * @author Alice Russell
 */

'use strict';

import { IdAtom, MakeBooleanExpr, MakeCond, MakeIf, MakeNumberExpr, MakeStringExpr, MakeVariableUsageExpr, TopLevelErr, MakeTemplatePlaceholder, SExps, MakeFunctionDefinition, MakeAnd, MakeOr, MakeCheckExpect, MakeCheckWithin, MakeCall } from './constructors';
import { isExpr, isReadError, isTopLevel, isTopLevelError, isExprError } from './predicates';
import { read } from './read';
import { Expr, ParseEnv, SExp, TopLevel, TopLevelError } from './types';

const parseEnv: ParseEnv
  = new Map<
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
        return TopLevelErr('define: expected a variable name, or a function name and its variables (in parentheses), but found a number', []);
      
      case 'Bool':
        return TopLevelErr('define: expected a variable name, or a function name and its variables (in parentheses), but found something else', []);
    
      case 'Id':
        if (sexps.length === 1)
          return TopLevelErr(
            `define: expected an expression after the variable name ${ sexps[0].sexp }, but nothing's there`,
            sexps
          );
        if (sexps.length > 2)
          return TopLevelErr(
            `define: expected only one expression after the variable name ${ sexps[0].sexp }, but found 1 extra part`,
            sexps
          );

        const maybeBody = parseExpression(sexps[1]);

        if (! isExpr(maybeBody))
            return maybeBody;

        return MakeVariableDefinition(sexps[0].sexp, maybeBody);

      case 'SExp Array':
        if (sexps[0].sexp.length === 0)
            return TopLevelErr('define: expected a name for the function, but nothing\'s there', sexps); 
        if (sexps[0].sexp.length === 1)
          return TopLevelErr('define: expected at least one variable after the function name, but found none', sexps);

        const firstItemInFunctionHeader = sexps[0].sexp[0];

        if (isReadError(firstItemInFunctionHeader)) return firstItemInFunctionHeader;
        if (firstItemInFunctionHeader.type !== 'Id')
          return TopLevelErr(`define: expected the name of the function, but found a ${ firstItemInFunctionHeader.type }`, sexps);
        
        

        const params: string[] = [];

        for (const sexp of sexps[0].sexp.slice(1)) {
          if (isReadError(sexp)) return sexp;
          if (! (sexp.type === 'Id'))
            return TopLevelErr(`define: expected a variable, but found a ${ sexp.type }`, sexps);
          
          params.push(sexp.sexp);
        }

        if (sexps.length > 2)
          return TopLevelErr(`define: expected only one expression for the function body, but found ${ sexps.length - 2 } extra part ${ (sexps.length === 3) ? '' : 's'}`, sexps);

        const body = parseExpression(sexps[1]);

        if (! isExpr(body))
          return body;

        return MakeFunctionDefinition(firstItemInFunctionHeader.sexp, params, body);
    }
  }
]);

parseEnv.set('define-struct', [
  () => TopLevelErr('define-struct: expected an open parenthesis before define-struct, but found none', []),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('define: expected only one expression for the function body, but found 1 extra part', sexps);

    if (isReadError(sexps[0])) return sexps[0];

    switch (sexps[0].type) {
      case 'String':
        return TopLevelErr('define-struct: expected the structure name after define-struct, but found a string', sexps);
      case 'Num':
        return TopLevelErr('define-struct: expected the structure name after define-struct, but found a number', sexps);
      case 'Bool':
        return TopLevelErr('define-struct: expected the structure name after define-struct, but found a boolean', sexps);

      case 'Id':
        if (sexps.length === 1)
          return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but nothing\'s there', sexps);
        if (isReadError(sexps[1])) return sexps[1];

        switch (sexps[1].type) {
          case 'String':
            return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but found a string', sexps);
          case 'Num':
            return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but found a number', sexps);
          case 'Bool':
            return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but found a boolean', sexps);
          case 'Id':
            return TopLevelErr('define-struct: expected at least one field name (in parentheses) after the structure name, but found something else', sexps);
          case 'SExp Array':
            const fields: string[] = [];

            for (const sexp of sexps[1].sexp) {
              if (isReadError(sexp)) return sexp;
              switch (sexp.type) {
                case 'String':
                  return TopLevelErr('define-struct: expected a field name, but found a string', sexps);
                case 'Num':
                  return TopLevelErr('define-struct: expected a field name, but found a number', sexps);
                case 'Bool':
                  return TopLevelErr('define-struct: expected a field name, but found a boolean', sexps);
                case 'Id':
                  fields.push(sexp.sexp);
                case 'SExp Array':
                  return TopLevelErr('define-struct: expected a field name, but found a part', sexps);
              }
            }

            if (sexps.length > 2)
              return TopLevelErr(
                `define-struct: expected nothing after the field names, but found ${ sexps.length - 2 } extra parts`,
                sexps
              );

            return MakeStructureDefinition(sexps[0].sexp, fields);
        }

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
    
    const maybeExprs = sexps.map(parseExpression);

    if (maybeExprs.every(isExpr))
      return MakeIf(maybeExprs[0], maybeExprs[1], maybeExprs[2]);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);

parseEnv.set('cond', [
  () => TopLevelErr('cond: expected an open parenthesis before cond, but found none', []),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('cond: expected a clause after cond, but nothing\'s there', sexps);

    const clauses: [Expr, Expr][] = [];

    for (const sexp of sexps) {
      if (isReadError(sexp))
        return sexp;
      switch (sexp.type) {
        case 'Bool':
          return TopLevelErr('cond: expected an open parenthesis before cond, but found a boolean', sexps);
        case 'Id':
          return TopLevelErr('cond: expected a clause with a question and an answer, but found something else', sexps);
        case 'Num':
          return TopLevelErr('cond: expected an open parenthesis before cond, but found a number', sexps);
        case 'String':
          return TopLevelErr('cond: expected a clause with a question and an answer, but found a string', sexps);
        case 'SExp Array':
          if (sexp.sexp.length < 1)
            return TopLevelErr('cond: expected a clause with a question and an answer, but found an empty part', sexps);
          else if (sexp.sexp.length === 2) {
            const question = parseExpression(sexp.sexp[0]);
            if (! (isExpr(question))) return question;

            const answer = parseExpression(sexp.sexp[0]);
            if (! (isExpr(answer))) return answer;

            clauses.push([question, answer]);
          } else {
            return TopLevelErr(
              `cond: expected a clause with a question and an answer, but found a clause with ${ sexp.sexp.length } parts`,
              sexps
            );
          }
      }
    }

    return MakeCond(clauses);
  }
]);


parseEnv.set('and', [
  () => TopLevelErr('and: expected an open parenthesis before and, but found none', []),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('and: expects at least 2 arguments, but found none', sexps);
    if (sexps.length === 1)
      return TopLevelErr('and: expects at least 2 arguments, but found only 1', sexps);

    const maybeExprs = sexps.map(parseExpression);

    if (maybeExprs.every(isExpr))
      return MakeAnd(maybeExprs);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);

parseEnv.set('or', [
  () => TopLevelErr('or: expected an open parenthesis before and, but found none', []),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('or: expects at least 2 arguments, but found none', sexps);
    if (sexps.length === 1)
      return TopLevelErr('or: expects at least 2 arguments, but found only 1', sexps);

    const maybeExprs = sexps.map(parseExpression);

    if (maybeExprs.every(isExpr))
      return MakeOr(maybeExprs);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);


parseEnv.set('..', [
  () => TopLevelErr('..: expected a finished expression, but found a template', []),
  (sexps: SExp[]) => {
    for (const sexp of sexps) {
      if (isReadError(sexp)) return sexp;
    }
    return MakeTemplatePlaceholder(SExps(IdAtom('..'), ...sexps));
  }
]);

parseEnv.set('...', [
  () => TopLevelErr('...: expected a finished expression, but found a template', []),
  (sexps: SExp[]) => {
    for (const sexp of sexps) {
      if (isReadError(sexp)) return sexp;
    }
    return MakeTemplatePlaceholder(SExps(IdAtom('...'), ...sexps));
  }
]);

parseEnv.set('....', [
  () => TopLevelErr('....: expected a finished expression, but found a template', []),
  (sexps: SExp[]) => {
    for (const sexp of sexps) {
      if (isReadError(sexp)) return sexp;
    }
    return MakeTemplatePlaceholder(SExps(IdAtom('....'), ...sexps));
  }
]);

parseEnv.set('.....', [
  () => TopLevelErr('.....: expected a finished expression, but found a template', []),
  (sexps: SExp[]) => {
    for (const sexp of sexps) {
      if (isReadError(sexp)) return sexp;
    }
    return MakeTemplatePlaceholder(SExps(IdAtom('.....'), ...sexps));
  }
]);

parseEnv.set('......', [
  () => TopLevelErr('......: expected a finished expression, but found a template', []),
  (sexps: SExp[]) => {
    for (const sexp of sexps) {
      if (isReadError(sexp)) return sexp;
    }
    return MakeTemplatePlaceholder(SExps(IdAtom('......'), ...sexps));
  }
]);

parseEnv.set('check-expect', [
  () => TopLevelErr('check-expect: expects 2 arguments, but found none', []),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('check-expect: expects 2 arguments, but found none', sexps);
    if (sexps.length === 1)
      return TopLevelErr('check-expect: expects 2 arguments, but found only 1', sexps);
    if (sexps.length >= 3)
      return TopLevelErr(
        `check-expect: expects only 2 arguments, but found ${ sexps.length }`,
        sexps
      );
    
    const maybeExprs = sexps.map(parseExpression);

    if (maybeExprs.every(isExpr))
      return MakeCheckExpect(maybeExprs[0], maybeExprs[1]);

    // returns the first error encountered
    return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);

parseEnv.set('check-within', [
  () => TopLevelErr('check-within: expects 3 arguments, but found none', []),
  (sexps: SExp[]) => {
    if (sexps.length === 0)
      return TopLevelErr('check-within: expects 3 arguments, but found none', sexps);
    if (sexps.length <= 2)
      return TopLevelErr(`check-within: expects 3 arguments, but found only ${ sexps.length }`, sexps);
    if (sexps.length > 3)
      return TopLevelErr(`check-within: expects 3 arguments, but found ${ sexps.length }`, sexps);
    
      const maybeExprs = sexps.map(parseExpression);

      if (maybeExprs.every(isExpr))
        return MakeCheckWithin(maybeExprs[0], maybeExprs[1], maybeExprs[2]);
  
      // returns the first error encountered
      return maybeExprs.filter(x => (! isExpr(x)))[0];
  }
]);

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

export const parseList = (sexps: SExp[]): TopLevel => {
  if (sexps.length === 0)
    return TopLevelErr('function call: expected a function after the open parenthesis, but nothing\'s there', sexps)
  
  if (isReadError(sexps[0])) return sexps[0];
  
  switch (sexps[0].type) {
    case 'String':
    case 'Num':
    case 'Bool':
      return TopLevelErr(`function call: expected a function after the open parenthesis, but found a ${ sexps[0].type }`, sexps);
    case 'Id':
      const maybeBuiltin = parseEnv.get(sexps[0].sexp);
      if (maybeBuiltin !== undefined)
        return maybeBuiltin[1](sexps.slice(1));
      return parseCall(sexps[0].sexp, sexps.slice(1));

    case 'SExp Array':
      return TopLevelErr(`function call: expected a function after the open parenthesis, but found a part`, sexps);
  }
}

// call parseTopLevel recursively then build a call...
// complain if we get a non-expr toplevel
const parseCall = (fname: string, sexps: SExp[]): Expr | TopLevelError => {
  const parsedArgs: Expr[] = []

  for (const sexp of sexps) {
    const maybeArg = parseExpression(sexp);

    if (! isExpr(maybeArg))
      return maybeArg;

    parsedArgs.push(maybeArg);
  }

  return MakeCall(fname, parsedArgs);
}
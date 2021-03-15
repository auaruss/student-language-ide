/**
 * @fileoverview An S-Expression reader for the student languages.
 *               Generally, produces types from the second section of types.ts from types
 *               from the first section of types.ts.
 * 
 * @author Alice Russell
 */

'use strict';

import {
  ReadError, ReadResult,
  SExp, Token, TokenType
} from './types';

import {
  NumAtom, IdAtom, StringAtom, BooleanAtom, ReadErr, SExpsFromArray, Res,
} from './constructors';

import {
  isTokenError, isReadError
} from './predicates';

import { tokenize } from './tokenize';

/**
 * Attempts to read the first SExp from a list of tokens.
 * @param tokens a list of tokens from the tokenizer
 * @returns a read result intended to be processed by the readTokens function
 */
export const readSexp = (tokens: Token[]): ReadResult<SExp> | ReadResult<ReadError> => {
  if (tokens.length === 0)
    return Res(ReadErr('No Valid SExp', []),[]);

  const firstToken = tokens[0];

  if (isTokenError(firstToken)) {
    return Res(ReadErr('Invalid token found while reading SExp', [firstToken]), tokens.slice(1));;
  } else {
    switch(firstToken.type) {
      case TokenType.OpenParen:
      case TokenType.OpenSquareParen:
      case TokenType.OpenBraceParen:
        const readRest = readSexps(tokens.slice(1));
        // this means parseRest is the rest of the current SExp. so for
        // '(define hello 1) (define x 10)'
        // parseRest should be equal to
        // {
        //   thing: [Id('define'), Id('hello'), Num('1').
        //   remain: tokenize(') (define x 10)')
        // } (ignoring whitespace in the tokenization)

        // Note that parseRest always returns a success, so we can assume that an SExp exists at the
        // start of the expression if and only if the remain from parsing the rest starts with a closing paren
        // which matches our current open paren.

        // This also means if the remain is empty we return a failure.
        if (readRest.remain.length === 0) 
          return Res(ReadErr('No Closing Paren', tokens), []);
        else {
          const firstUnprocessedToken = readRest.remain[0];
          if (isTokenError(firstUnprocessedToken)) {
            // Here, we know that there may be a matching paren but the expression is malformed because we have a token error.
            // We want to isolate the malformed expression. For example: (define x #10) is malformed but we should be able to evaluate definitions
            // and expressions before and after this.

            // We intentionally swallow mismatched parens when there's a token here!
            // Example: (+ #1 2]]) is considered a single SExp.
            let x: Token[] = [firstUnprocessedToken];
            let search = readRest.remain.slice(1);
            let closingParenType;
            if (firstToken.type === TokenType.OpenParen)
              closingParenType = TokenType.CloseParen;
            else if (firstToken.type === TokenType.OpenSquareParen)
              closingParenType = TokenType.CloseSquareParen;
            else 
              closingParenType = TokenType.CloseBraceParen;
            while (search.length !== 0) {
              let nextTok = search[0];
              search = search.slice(1);
              x.push(nextTok);
              if ((! isTokenError(nextTok)) && nextTok.type === closingParenType)
                return Res(ReadErr('Invalid token found while reading SExp', x), search);
            }
            return Res(ReadErr('No Closing Paren', x), []);
          } else if (firstUnprocessedToken.type === TokenType.CloseParen
                  || firstUnprocessedToken.type === TokenType.CloseSquareParen
                  || firstUnprocessedToken.type === TokenType.CloseBraceParen) {
            if (parensMatch(firstToken.type, firstUnprocessedToken.type))
              return Res(SExpsFromArray(readRest.thing), readRest.remain.slice(1));
            return Res(ReadErr('Mismatched Parens', tokens), []);
          } else {
            return { thing: {readError: 'No Valid SExp', tokens: []}, remain: [] }
          }
        }
      case TokenType.CloseParen:
      case TokenType.CloseSquareParen:
      case TokenType.CloseBraceParen:
        return { thing: ReadErr('No Open Paren', [firstToken]), remain: tokens.slice(1) }
      case TokenType.Number:
        return {
          thing: NumAtom(Number(firstToken.token)),
          remain: tokens.slice(1)
        };
      case TokenType.String:
        return {
          thing: StringAtom(firstToken.token.slice(1,-1)),
          remain: tokens.slice(1)
        };
      case TokenType.Identifier:
        return {
          thing: IdAtom(firstToken.token),
          remain: tokens.slice(1)
        };
      case TokenType.Boolean:
        return {
          thing: BooleanAtom(firstToken.token),
          remain: tokens.slice(1)
        };
      case TokenType.Whitespace:
        return readSexp(tokens.slice(1));
    }
  }

  throw new Error('Could not find a proper return statement in readSexps.');
}

/**
 * Reads as many SExp as possible from the start of the list of tokens.
 * @param tokens a list of tokens from the tokenizer
 * @returns a read result intended to be processed by readTokens
 */
export const readSexps = (tokens: Token[]): ReadResult<SExp[]> => {
  if (tokens.length === 0) return { thing: [], remain: [] };
  
  let firstToken = tokens[0];
  
  if (isTokenError(firstToken)) {
    let thingToReturn = readSexps(tokens.slice(1));
    thingToReturn.thing.unshift(firstToken);
    return { thing: thingToReturn.thing, remain: thingToReturn.remain };
  } else if (firstToken.type === TokenType.Whitespace) {
    return readSexps(tokens.slice(1));
  }
  
  let readFirst = readSexp(tokens);

  if (isReadError(readFirst.thing)) {
    return { thing: [], remain: tokens };
  }

  let readRest = readSexps(readFirst.remain);

  if (isReadError(readRest.thing)) {
    return { thing: [readFirst.thing], remain: readFirst.remain };
  } else {
    readRest.thing.unshift(readFirst.thing);
    return readRest;
  }
}

/**
 * Reads as many SExp as possible from the start of an expression represented as tokens.
 * @param ts a list of tokens from the tokenizer
 * @returns a list of as many s-expressions as possible read from the beginning of the list of tokens 
 */
export const readTokens = (ts: Token[]): SExp[] => {
  let tokens: Token[] = ts.slice().filter((t: Token) => isTokenError(t) || t.type !== TokenType.Whitespace); 
  let sexps: SExp[] = [];
  
  while (tokens.length !== 0) {
    let next = readSexp(tokens);
    if (isReadError(next.thing))
      if (isTokenError(next.thing)) {}
      else if (next.thing.readError === 'No Valid SExp') {
        sexps.push(ReadErr('No Valid SExp', tokens));
        return sexps;
      }
    sexps.push(next.thing);
    tokens = next.remain;
  }

  return sexps;
}

/**
 * Reads as many SExp as possible from the start of an expression string.
 * @param exp an expression as a string
 */
export const read = (exp:string): SExp[] => {
  return readTokens(tokenize(exp));
}

/**
 * Given two token types, if the first is an opening paren token and the second a closing paren token,
 * determines whether they are matching paren types.
 * 
 * @param op open paren token type
 * @param cp close paren token type
 * @returns True if the types in the correct order and the paren types match,
 *          False if given any other token types, or given the types in the wrong order.
 */
const parensMatch = (
  op: TokenType, cp: TokenType): boolean => {
  if (op === TokenType.OpenParen) {
    return cp === TokenType.CloseParen;
  } else if (op === TokenType.OpenSquareParen) {
    return cp === TokenType.CloseSquareParen;
  } else if (op === TokenType.OpenBraceParen) {
    return cp === TokenType.CloseBraceParen;
  }
  return false;
}
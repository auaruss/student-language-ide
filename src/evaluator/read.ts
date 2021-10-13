import { isToken } from './predicates';
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
  NumAtom, IdAtom, StringAtom, BooleanAtom, ReadErr, SExpsFromArray, Res, Tok, SExps,
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

  if (isTokenError(firstToken))
    return Res(ReadErr('Invalid token found while reading SExp', [firstToken]), tokens.slice(1));
  else switch(firstToken.type) {
    case TokenType.OpenParen:
    case TokenType.OpenSquareParen:
    case TokenType.OpenBraceParen:
      const firstTokenCastedToOpenParen: OpenParen = {
        type: firstToken.type,
        token: firstToken.token
      };

      return handleOpenParen([firstTokenCastedToOpenParen, ...tokens.slice(1)]);

    case TokenType.CloseParen:
    case TokenType.CloseSquareParen:
    case TokenType.CloseBraceParen:
      return Res(ReadErr('No Open Paren', [firstToken]),tokens.slice(1));
    case TokenType.Number:
      return Res(NumAtom(Number(firstToken.token)), tokens.slice(1));

    case TokenType.String:
      return Res(StringAtom(firstToken.token.slice(1,-1)), tokens.slice(1));

    case TokenType.Identifier:
      return Res(IdAtom(firstToken.token), tokens.slice(1));

    case TokenType.Boolean:
      return Res(BooleanAtom(firstToken.token), tokens.slice(1));

    case TokenType.Whitespace:
    case TokenType.Newline:
    case TokenType.Comment:
      return readSexp(tokens.slice(1));
  }
}

/**
 * Reads as many SExp as possible from the start of the list of tokens.
 * @param tokens a list of tokens from the tokenizer
 * @returns a read result intended to be processed by readTokens
 */
export const readSexps = (tokens: Token[]): ReadResult<SExp[]> => {
  if (tokens.length === 0) return Res([], []);
  
  let firstToken = tokens[0];
  
  if (isTokenError(firstToken)) {
    let thingToReturn = readSexps(tokens.slice(1));
    thingToReturn.thing.unshift(firstToken);
    return Res(thingToReturn.thing, thingToReturn.remain);
  } else if (firstToken.type === TokenType.Whitespace) {
    return readSexps(tokens.slice(1));
  }
  
  let readPrefixExpression = readSexp(tokens);

  if (isReadError(readPrefixExpression.thing)) {
    return Res([], tokens);
  }

  let readRest = readSexps(readPrefixExpression.remain);

  if (isReadError(readRest.thing)) {
    return Res([readPrefixExpression.thing], readPrefixExpression.remain);
  } else {
    readRest.thing.unshift(readPrefixExpression.thing);
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
  op: TokenType, cp: TokenType
): boolean => (
  (op === TokenType.OpenParen)
  ? cp === TokenType.CloseParen
  : (op === TokenType.OpenSquareParen)
  ? cp === TokenType.CloseSquareParen
  : (op === TokenType.OpenBraceParen) 
  ? cp === TokenType.CloseBraceParen
  : false
);

type OpenParen = { 
  type: TokenType.OpenParen
      | TokenType.OpenSquareParen
      | TokenType.OpenBraceParen,
  token: string
};

const handleOpenParen = (
  tokens: [OpenParen, ...Token[]]
): ReadResult<SExp> | ReadResult<ReadError> => {
  const readRest = readSexps(tokens.slice(1));

  let thingy: Token[] = [];
  let foundMismatchedParen = false;

  while (readRest.remain.length !== 0) {
    let nextUnprocessedToken = readRest.remain.shift();
    if (nextUnprocessedToken === undefined)
      return Res(ReadErr('No Closing Paren', tokens), []);

    if (isTokenError(nextUnprocessedToken)) {
      thingy.push(nextUnprocessedToken);
    } else switch (nextUnprocessedToken.type) {
      case TokenType.CloseParen:
      case TokenType.CloseSquareParen:
      case TokenType.CloseBraceParen:
        if (parensMatch(tokens[0].type, nextUnprocessedToken.type)) {
          if (thingy.length === 0) return Res(SExps(...readRest.thing), readRest.remain);
          return Res(ReadErr('No Valid SExp', [tokens[0], ...thingy, nextUnprocessedToken]), readRest.remain);
        }
        foundMismatchedParen = true;
        //fallthrough to the next case is intentional.
      
      case TokenType.OpenParen:
      case TokenType.OpenSquareParen:
      case TokenType.OpenBraceParen:
      case TokenType.Number:
      case TokenType.String:
      case TokenType.Identifier:
      case TokenType.Whitespace:
      case TokenType.Newline:
      case TokenType.Comment:
        thingy.push(nextUnprocessedToken);
    }
  }
  
  return Res(
    ReadErr((foundMismatchedParen) ? 'No Valid SExp' : 'No Closing Paren', tokens),
    []
  );
}

/**
 * @fileoverview A tokenizer for the student languages.
 *               Generally, produces types from the first section of types.ts given strings.
 * 
 * @author Alice Russell
 */

'use strict';

import {
  Token, TokenType
} from './types';

import { Tok, TokErr } from './constructors';

/**
 * A association of token types to Regexp definitions.
 */
export const tokenExpressions: [TokenType, RegExp][] = [
  [TokenType.OpenParen, /^\(/],
  [TokenType.OpenSquareParen, /^\[/],
  [TokenType.OpenBraceParen, /^\{/],
  [TokenType.CloseParen, /^\)/],
  [TokenType.CloseSquareParen, /^]/],
  [TokenType.CloseBraceParen, /^}/],
  [TokenType.Number, /^\-?\d+\.\d+|^\-?\d+/],
  [TokenType.String, /^"[^"]*"/],
  [TokenType.Identifier, /^[^",'`\(\)\[\]{};#\s]+/],
  [TokenType.Boolean, /^#t\b|^#T\b|^#f\b|^#F\b|^#true\b|^#false\b/],
  [TokenType.Whitespace, /^\s+|^;.*\n|^;.*$/],
];



/**
 * Transforms a string into a list of tokens.
 * @param exp expression as a string
 * @returns a list of tokens
 */
export const tokenize = (exp: string): Token[] => {
  if (exp == '') {
    return [];
  }
  for (let [tokenType, expression] of tokenExpressions) {
    const result = expression.exec(exp);
    if (result) {
      let firstToken: Token[] = [Tok(tokenType,result[0])];

      if (tokenType === TokenType.Identifier) {
        if (result[0] === '.')
          firstToken = [TokErr('`.` is disallowed.')];
        if (result[0][0] === '#')
          firstToken = [TokErr(`read-syntax: bad syntax ${result[0]}`)];
      }

      const restString: string = exp.slice(result[0].length);
      return firstToken.concat(tokenize(restString));
    }
  }

  const firstToken: Token[] = [TokErr(exp[0])];
  const restString = exp.slice(1);
  return firstToken.concat(tokenize(restString));
}

// https://github.com/tlaceby/guide-to-interpreters-series
// -----------------------------------------------------------
// ---------------          LEXER          -------------------
// ---  Responsible for producing tokens from the source   ---
// -----------------------------------------------------------

// Represents tokens that our language understands in parsing.
export enum TokenType {
    // Literal Types
    Number,
    Identifier,
    String,
    // Keywords
    Let,
    Const,
    Fn,
    If,
    Else,
    For,

    // Grouping * Operators
    BinaryOperator,
    Equals, // =
    Comma, // ,
    Colon, // :
    Semicolon, // ;
    Dot, // .
    OpenParen, // (
    CloseParen, // )
    OpenBrace, // {
    CloseBrace, // }
    OpenBracket, // [
    CloseBracket, // ]
    Quotation, // "
    Greater, // >
    Lesser, // <
    EqualsCompare, // ==
    NotEqualsCompare, // !=
    Exclamation, // !
    And, // &&
    Ampersand, // &
    Bar, // |
    Optional, // ?

    EOF, // Signified the end of file.
    NewLine, // newline
}

/**
 * Constant lookup for keywords and known identifiers + symbols.
 */
const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    fn: TokenType.Fn,
    if: TokenType.If,
    else: TokenType.Else,
    for: TokenType.For,
};

/**
 * Constant lookup for token characters (remove switch case repetition)
 */
const TOKEN_CHARS: Record<string, TokenType> = {
    "(": TokenType.OpenParen,
    ")": TokenType.CloseParen,
    "{": TokenType.OpenBrace,
    "}": TokenType.CloseBrace,
    "[": TokenType.OpenBracket,
    "]": TokenType.CloseBracket,
    "+": TokenType.BinaryOperator,
    "-": TokenType.BinaryOperator,
    "*": TokenType.BinaryOperator,
    "%": TokenType.BinaryOperator,
    "/": TokenType.BinaryOperator,
    "<": TokenType.Lesser,
    ">": TokenType.Greater,
    ".": TokenType.Dot,
    ";": TokenType.Semicolon,
    ":": TokenType.Colon,
    ",": TokenType.Comma,
    "|": TokenType.Bar,
    "?": TokenType.Optional,
    "\n": TokenType.NewLine,
};

/**
 * A list of all escapable characters in strings
 */
const ESCAPED: Record<string, string> = {
    n: "\n",
    t: "\t",
    r: "\r",
};

// Represents a single token from the source-code.
export interface Token {
    value: string; // contains the raw value as seen inside the source code.
    type: TokenType; // tagged structure.
}

// Returns a token of a given type and value
function token(value = "", type: TokenType): Token {
    return { value, type };
}

/**
 * Returns whether the character passed in alphabetic -> [a-zA-Z] and _
 */
function isalpha(src: string, isFirstChar: boolean = false) {
    if (isFirstChar) {
        return /^[A-Za-z_]+$/.test(src);
    }
    return /^[A-Za-z0-9_]+$/.test(src);
}

/**
 * Returns true if the character is whitespace like -> [\s, \t, \n]
 */
function isskippable(str: string) {
    return str == " " || str == "\n" || str == "\t" || str == '\r';
}

/**
 * Return whether the character is a valid integer -> [0-9]
 */
function isint(str: string) {
    const c = str.charCodeAt(0);
    const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return c >= bounds[0] && c <= bounds[1];
}

/**
 * Given a string representing source code: Produce tokens and handles
 * possible unidentified characters.
 *
 * - Returns a array of tokens.
 * - Does not modify the incoming string.
 */
export function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    // produce tokens until the EOF is reached.
    while (src.length > 0) {

        const char = src[0];

        const tokenType = TOKEN_CHARS[char];
        if (isint(char) || (char == "-" && isint(src[1]))) {
            let num = src.shift();
            let period = false;
            while (src.length > 0) {
                if(src[0] == "." && !period) {
                    period = true;
                    num += src.shift()!;
                } else if (isint(src[0])) {
                    num += src.shift()!;
                } else break;
            }

            // append new numeric token.
            tokens.push(token(num, TokenType.Number));
        } else {

            switch(char) {
                case "=":
                    src.shift()
                    if (src[0] == '=') {
                        src.shift()
                        tokens.push(token('==', TokenType.EqualsCompare));
                    } else {
                        tokens.push(token("=", TokenType.Equals));
                    }
                    break;
                case "&":
                    src.shift()
                    if (src[0] == '&') {
                        src.shift()
                        tokens.push(token('&&', TokenType.And));
                    } else {
                        tokens.push(token("&", TokenType.Ampersand));
                    }
                    break;
                case "!":
                    src.shift();
                    if (String(src[0]) == '=') {
                        src.shift()
                        tokens.push(token("!=", TokenType.NotEqualsCompare));
                    } else {
                        tokens.push(token("!", TokenType.Exclamation));
                    }
                    break;
                case '"': {
                    let str = "";
                    src.shift();
        
                    let escaped = false;
                    while (src.length > 0) {
                        const key = src.shift();
                        if(key == "\\") {
                            escaped = !escaped;
                            if(escaped)continue;
                        } else if (key == '"') {
                            if(!escaped) {
                                break;
                            }
                            escaped = false;
                        } else if (escaped) {
                            escaped = false;
                            if(ESCAPED[key]) {
                                str += ESCAPED[key];
                                continue;
                            } else {
                                str += `\\`;
                            }
                        }
                        str += key;
                    }
        
                    // append new string token.
                    tokens.push(token(str, TokenType.String));
                    break;
                }
                case "-":
                case "+":
                    if(src[1] == src[0]) {
                        const prevtoken = tokens[tokens.length - 1];
                        if(prevtoken == null) break;

                        tokens.push(token("=", TokenType.Equals));
                        tokens.push(token(prevtoken.value, prevtoken.type));
                        tokens.push(token(src.shift(), TokenType.BinaryOperator));
                        tokens.push(token("1", TokenType.Number));
                        src.shift();
                        break;
                    }
                // eslint-disable-next-line no-fallthrough
                case "*":
                case "/":
                    if (src[1] == "=") {
                        const prevtoken = tokens[tokens.length - 1];
                        if(prevtoken == null) break;

                        tokens.push(token("=", TokenType.Equals));
                        tokens.push(token(prevtoken.value, prevtoken.type));
                        tokens.push(token(src.shift(), TokenType.BinaryOperator));
                        src.shift();
                        break;
                    } else if (src[0] == "/") {
                        if(src[1] == "*") {
                            let lastVal = "";
                            while(src.length > 0) {
                                const nextVal = src.shift();

                                if(lastVal == "*" && nextVal == "/") {
                                    break;
                                }

                                lastVal = nextVal;
                            }
                            break;
                        } else if (src[1] == "/") {
                            do {
                                src.shift();
                            } while (src.length > 0 && (src[0] as string) != "\n"); // fuck off typescript
                            src.shift();
                            break;
                        }
                    }
                // eslint-disable-next-line no-fallthrough
                default:

                    if(tokenType) {
                        tokens.push(token(src.shift(), tokenType));
                    } else if (isalpha(char, true)) {
                        let ident = "";
                        ident += src.shift();  // Add first character which is alphabetic or underscore
                    
                        while (src.length > 0 && isalpha(src[0])) {
                            ident += src.shift();  // Subsequent characters can be alphanumeric or underscore
                        }
                        
                        // CHECK FOR RESERVED KEYWORDS
                        const reserved = KEYWORDS[ident];
                        // If value is not undefined then the identifier is
                        // recognized keyword
                        if (typeof reserved == "number") {
                            tokens.push(token(ident, reserved));
                        } else {
                            // Unrecognized name must mean user-defined symbol.
                            tokens.push(token(ident, TokenType.Identifier));
                        }
                    } else if (isskippable(src[0])) {
                        // Skip unneeded chars.
                        src.shift();
                    } else {
                        // Handle unrecognized characters.
                        // TODO: Implement better errors and error recovery.

                        console.error(
                            "Unrecognized character found in source: ",
                            src[0].charCodeAt(0),
                            src[0]
                        );
                        process.exit(1);
                    }
                    break;
            }
        }
    }

    tokens.push({ type: TokenType.EOF, value: 'EndOfFile' })

    return tokens;
}
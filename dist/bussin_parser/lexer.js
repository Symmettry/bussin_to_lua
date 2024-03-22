"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Number"] = 0] = "Number";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["String"] = 2] = "String";
    TokenType[TokenType["Let"] = 3] = "Let";
    TokenType[TokenType["Const"] = 4] = "Const";
    TokenType[TokenType["Fn"] = 5] = "Fn";
    TokenType[TokenType["If"] = 6] = "If";
    TokenType[TokenType["Else"] = 7] = "Else";
    TokenType[TokenType["For"] = 8] = "For";
    TokenType[TokenType["BinaryOperator"] = 9] = "BinaryOperator";
    TokenType[TokenType["Equals"] = 10] = "Equals";
    TokenType[TokenType["Comma"] = 11] = "Comma";
    TokenType[TokenType["Colon"] = 12] = "Colon";
    TokenType[TokenType["Semicolon"] = 13] = "Semicolon";
    TokenType[TokenType["Dot"] = 14] = "Dot";
    TokenType[TokenType["OpenParen"] = 15] = "OpenParen";
    TokenType[TokenType["CloseParen"] = 16] = "CloseParen";
    TokenType[TokenType["OpenBrace"] = 17] = "OpenBrace";
    TokenType[TokenType["CloseBrace"] = 18] = "CloseBrace";
    TokenType[TokenType["OpenBracket"] = 19] = "OpenBracket";
    TokenType[TokenType["CloseBracket"] = 20] = "CloseBracket";
    TokenType[TokenType["Quotation"] = 21] = "Quotation";
    TokenType[TokenType["Greater"] = 22] = "Greater";
    TokenType[TokenType["Lesser"] = 23] = "Lesser";
    TokenType[TokenType["EqualsCompare"] = 24] = "EqualsCompare";
    TokenType[TokenType["NotEqualsCompare"] = 25] = "NotEqualsCompare";
    TokenType[TokenType["Exclamation"] = 26] = "Exclamation";
    TokenType[TokenType["And"] = 27] = "And";
    TokenType[TokenType["Ampersand"] = 28] = "Ampersand";
    TokenType[TokenType["Bar"] = 29] = "Bar";
    TokenType[TokenType["EOF"] = 30] = "EOF";
    TokenType[TokenType["NewLine"] = 31] = "NewLine";
})(TokenType || (exports.TokenType = TokenType = {}));
var KEYWORDS = {
    let: TokenType.Let,
    const: TokenType.Const,
    fn: TokenType.Fn,
    if: TokenType.If,
    else: TokenType.Else,
    for: TokenType.For,
};
var TOKEN_CHARS = {
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
    "\n": TokenType.NewLine,
};
var ESCAPED = {
    n: "\n",
    t: "\t",
    r: "\r",
};
function token(value, type) {
    if (value === void 0) { value = ""; }
    return { value: value, type: type };
}
function isalpha(src, isFirstChar) {
    if (isFirstChar === void 0) { isFirstChar = false; }
    if (isFirstChar) {
        return /^[A-Za-z_]+$/.test(src);
    }
    return /^[A-Za-z0-9_]+$/.test(src);
}
function isskippable(str) {
    return str == " " || str == "\n" || str == "\t" || str == '\r';
}
function isint(str) {
    var c = str.charCodeAt(0);
    var bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return c >= bounds[0] && c <= bounds[1];
}
function tokenize(sourceCode) {
    var tokens = new Array();
    var src = sourceCode.split("");
    while (src.length > 0) {
        var char = src[0];
        var tokenType = TOKEN_CHARS[char];
        if (isint(char) || (char == "-" && isint(src[1]))) {
            var num = src.shift();
            var period = false;
            while (src.length > 0) {
                if (src[0] == "." && !period) {
                    period = true;
                    num += src.shift();
                }
                else if (isint(src[0])) {
                    num += src.shift();
                }
                else
                    break;
            }
            tokens.push(token(num, TokenType.Number));
        }
        else {
            switch (char) {
                case "=":
                    src.shift();
                    if (src[0] == '=') {
                        src.shift();
                        tokens.push(token('==', TokenType.EqualsCompare));
                    }
                    else {
                        tokens.push(token("=", TokenType.Equals));
                    }
                    break;
                case "&":
                    src.shift();
                    if (src[0] == '&') {
                        src.shift();
                        tokens.push(token('&&', TokenType.And));
                    }
                    else {
                        tokens.push(token("&", TokenType.Ampersand));
                    }
                    break;
                case "!":
                    src.shift();
                    if (String(src[0]) == '=') {
                        src.shift();
                        tokens.push(token("!=", TokenType.NotEqualsCompare));
                    }
                    else {
                        tokens.push(token("!", TokenType.Exclamation));
                    }
                    break;
                case '"':
                    var str = "";
                    src.shift();
                    var escaped = false;
                    while (src.length > 0) {
                        var key = src.shift();
                        if (key == undefined)
                            throw "The world is over.";
                        if (key == "\\") {
                            escaped = !escaped;
                            if (escaped)
                                continue;
                        }
                        else if (key == '"') {
                            if (!escaped) {
                                break;
                            }
                            escaped = false;
                        }
                        else if (escaped) {
                            if (ESCAPED[key]) {
                                escaped = false;
                                str += ESCAPED[key];
                                continue;
                            }
                        }
                        str += key;
                    }
                    tokens.push(token(str, TokenType.String));
                    break;
                case "-":
                case "+":
                    if (src[1] == src[0]) {
                        var prevtoken = tokens[tokens.length - 1];
                        if (prevtoken == null)
                            break;
                        tokens.push(token("=", TokenType.Equals));
                        tokens.push(token(prevtoken.value, prevtoken.type));
                        tokens.push(token(src.shift(), TokenType.BinaryOperator));
                        tokens.push(token("1", TokenType.Number));
                        src.shift();
                        break;
                    }
                case "*":
                case "/":
                    if (src[1] == "=") {
                        var prevtoken = tokens[tokens.length - 1];
                        if (prevtoken == null)
                            break;
                        tokens.push(token("=", TokenType.Equals));
                        tokens.push(token(prevtoken.value, prevtoken.type));
                        tokens.push(token(src.shift(), TokenType.BinaryOperator));
                        src.shift();
                        break;
                    }
                default:
                    if (tokenType) {
                        tokens.push(token(src.shift(), tokenType));
                    }
                    else if (isalpha(char, true)) {
                        var ident = "";
                        ident += src.shift();
                        while (src.length > 0 && isalpha(src[0])) {
                            ident += src.shift();
                        }
                        var reserved = KEYWORDS[ident];
                        if (typeof reserved == "number") {
                            tokens.push(token(ident, reserved));
                        }
                        else {
                            tokens.push(token(ident, TokenType.Identifier));
                        }
                    }
                    else if (isskippable(src[0])) {
                        src.shift();
                    }
                    else {
                        console.error("Unrecognized character found in source: ", src[0].charCodeAt(0), src[0]);
                        process.exit(1);
                    }
                    break;
            }
        }
    }
    tokens.push({ type: TokenType.EOF, value: 'EndOfFile' });
    return tokens;
}
exports.tokenize = tokenize;
//# sourceMappingURL=lexer.js.map
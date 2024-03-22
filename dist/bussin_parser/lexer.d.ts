export declare enum TokenType {
    Number = 0,
    Identifier = 1,
    String = 2,
    Let = 3,
    Const = 4,
    Fn = 5,
    If = 6,
    Else = 7,
    For = 8,
    BinaryOperator = 9,
    Equals = 10,
    Comma = 11,
    Colon = 12,
    Semicolon = 13,
    Dot = 14,
    OpenParen = 15,
    CloseParen = 16,
    OpenBrace = 17,
    CloseBrace = 18,
    OpenBracket = 19,
    CloseBracket = 20,
    Quotation = 21,
    Greater = 22,
    Lesser = 23,
    EqualsCompare = 24,
    NotEqualsCompare = 25,
    Exclamation = 26,
    And = 27,
    Ampersand = 28,
    Bar = 29,
    EOF = 30,
    NewLine = 31
}
export interface Token {
    value: string;
    type: TokenType;
}
export declare function tokenize(sourceCode: string): Token[];

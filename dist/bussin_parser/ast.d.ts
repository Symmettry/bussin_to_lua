export type NodeType = "Program" | "VarDeclaration" | "FunctionDeclaration" | "IfStatement" | "ForStatement" | "TryCatchStatement" | "AssignmentExpr" | "MemberExpr" | "CallExpr" | "Property" | "ObjectLiteral" | "NumericLiteral" | "Identifier" | "StringLiteral" | "BinaryExpr" | "NewLine";
export interface Stmt {
    kind: NodeType;
}
export interface Program extends Stmt {
    kind: "Program";
    body: Stmt[];
}
export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    constant: boolean;
    identifier: string;
    value?: Expr;
}
export interface IfStatement extends Stmt {
    kind: "IfStatement";
    test: Expr;
    body: Stmt[];
    alternate?: Stmt[];
}
export interface TryCatchStatement extends Stmt {
    kind: "TryCatchStatement";
    body: Stmt[];
    alternate: Stmt[];
}
export interface FunctionDeclaration extends Stmt {
    kind: "FunctionDeclaration";
    parameters: string[];
    name: string;
    body: Stmt[];
}
export interface ForStatement extends Stmt {
    kind: "ForStatement";
    init: VarDeclaration;
    test: Expr;
    update: AssignmentExpr;
    body: Stmt[];
}
export interface Expr extends Stmt {
}
export interface BinaryExpr extends Expr {
    kind: "BinaryExpr";
    left: Expr;
    right: Expr;
    operator: string;
}
export interface CallExpr extends Expr {
    kind: "CallExpr";
    args: Expr[];
    caller: Expr;
}
export interface MemberExpr extends Expr {
    kind: "MemberExpr";
    object: Expr;
    property: Expr;
    computed: boolean;
}
export interface AssignmentExpr extends Expr {
    kind: "AssignmentExpr";
    assigne: Expr;
    value: Expr;
}
export interface Identifier extends Expr {
    kind: "Identifier";
    symbol: string;
}
export interface NumericLiteral extends Expr {
    kind: "NumericLiteral";
    value: number;
}
export interface StringLiteral extends Expr {
    kind: "StringLiteral";
    value: string;
}
export interface Property extends Expr {
    kind: "Property";
    key: string;
    value?: Expr;
}
export interface ObjectLiteral extends Expr {
    kind: "ObjectLiteral";
    properties: Property[];
}

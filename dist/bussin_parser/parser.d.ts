import { Stmt, Program } from "./ast";
export default class Parser {
    private tokens;
    private not_eof;
    private at;
    private eat;
    private expect;
    produceAST(sourceCode: string): Program;
    private parse_stmt;
    parse_block_statement(): Stmt[];
    parse_for_statement(): Stmt;
    parse_if_statement(): Stmt;
    parse_function_declaration(): Stmt;
    parse_var_declaration(): Stmt;
    private parse_expr;
    private parse_assignment_expr;
    private parse_and_statement;
    private parse_try_catch_expr;
    private parse_object_expr;
    private parse_additive_expr;
    private parse_multiplicative_expr;
    private parse_call_member_expr;
    private parse_call_expr;
    private parse_args;
    private parse_args_list;
    private parse_member_expr;
    private parse_primary_expr;
}

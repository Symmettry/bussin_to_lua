import { Program } from "../../../bussin/dist/frontend/ast";
export declare class Transcriber {
    private trycatchCounter;
    private beginCode;
    private math_sqrt;
    private math_round;
    private error;
    private exec;
    private charat;
    private input;
    private strcon;
    private format;
    private setTimeout;
    private setInterval;
    private fetch;
    private fs_read;
    private fs_write;
    private fs_exists;
    private fs_rmdir;
    private objects_hasKey;
    private objects_get;
    private objects_set;
    transcribe(ast: Program): string;
    private defaultFunctionFix;
    private defaultVariableFix;
    private transcribeStmt;
}

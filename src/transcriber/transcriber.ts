import { Program } from "../../../bussin/dist/frontend/ast";
import { ArrayLiteral, AssignmentExpr, BinaryExpr, CallExpr, ForStatement, FunctionDeclaration, Identifier, IfStatement, MemberExpr, NodeType, NumericLiteral, ObjectLiteral, Stmt, StringLiteral, TryCatchStatement, VarDeclaration } from "../bussin_parser/ast";

export class Transcriber {

    private trycatchCounter: number = 0;

    private beginCode: string = "";

    private math_sqrt: boolean = false;
    private math_round: boolean = false;
    private error: boolean = false;
    private exec: boolean = false;
    private charat: boolean = false;
    private input: boolean = false;
    private strcon: boolean = false;
    private format: boolean = false;
    private setTimeout: boolean = false;
    private setInterval: boolean = false;
    private fetch: boolean = false;
    private fs_read: boolean = false;
    private fs_write: boolean = false;
    private fs_exists: boolean = false;
    private fs_rmdir: boolean = false;
    private objects_hasKey: boolean = false;
    private objects_get: boolean = false;
    private objects_set: boolean = false;

    transcribe(ast: Program): string {
        let program = this.transcribeStmt(ast, 0)
        if(this.beginCode != "") {
            program = `--begin bstolua data--\n\n${this.beginCode}\n--end bstolua data--\n\n${program}`;
        }
        return program;
    }

    private defaultFunctionFix(functionName: string): string {
        switch(functionName) {

            // 2 characters !!!
            case "println":
                return "print";

            // string stuff
            case "len":
                return "string.len";
            case "charat":
                if(!this.charat) {
                    this.charat = true;
                    this.beginCode += `function bstolua_charat(s,n)\nreturn string.sub(s,n-1,n-1)\nend\n`;
                }
                return "bstolua_charat";
            case "input":
                if(!this.input) {
                    this.input = true;
                    this.beginCode += `function bstolua_input(s)\io.write(s)\nio.flush()\nreturn io.read()\nend\n`;
                }
                return "bstolua_input";
            case "strcon":
                if(!this.strcon) {
                    this.strcon = true;
                    this.beginCode += `function bstolua_strcon(...)\nlocal result=""\nfor i,v in ipairs({...}) do\nresult=result..v\nend\nreturn result\nend\n`;
                }
                return "bstolua_strcon";
            case "format":
                if(!this.format) {
                    this.format = true;
                    this.beginCode += `function bstolua_format(f, ...)\nlocal a={...}\nlocal r=f:gsub("%\${}","%%s")\nreturn string.format(r,unpack(a))\nend\n`;
                }
                return "bstolua_format";

            // face made his math stuff the same as lua! well, except for the fact that lua doesn't have sqrt or round though. WHY!?!?!
            case "math.sqrt":
                if(!this.math_sqrt) {
                    this.math_sqrt = true;
                    this.beginCode += `function bstolua_math_sqrt(n)\nreturn n^0.5\nend\n`;
                }
                return "bstolua_math_sqrt";
            case "math.round":
                if(!this.math_round) {
                    this.math_round = true;
                    this.beginCode += `function bstolua_math_round(n)\nreturn math.floor(n+0.5)\nend\n`;
                }
                return "bstolua_math_round"

            // time
            case "time":
                return "os.time";

            // exec
            case "exec":
                if(!this.exec) {
                    this.exec = true;
                    this.beginCode += `function bstolua_exec(c)\nlocal h=io.popen(c)\nlocal r=h:read("*a")\nh:close()\nreturn r\nend\n`;
                }
                return "bstolua_exec";

            // surprisingly i didnt have to change much for these to work. yay to lua?
            case "setTimeout":
                if(!this.setTimeout) {
                    this.setTimeout = true;
                    this.beginCode += `function bstolua_setTimeout(c,t)\nlocal s=os.clock()\nrepeat until os.clock()>s+(t/1000)\nc()\nend\n`;
                }
                return "bstolua_setTimeout";
            case "setInterval":
                if(!this.setInterval) {
                    this.setInterval = true;
                    this.beginCode += `function bstolua_setInterval(c,t)\nlocal s=os.clock()\nrepeat until os.clock()>s+(t/1000)\nc()\nbstolua_setInterval(c,t)\nend\n`;
                }
                return "bstolua_setInterval";

            // wtf
            case "fetch":
                if(!this.fetch) {
                    this.fetch = true;
                    this.beginCode += `function bstolua_fetch(p, o)\n\to = o or {}\n\tlocal h\n\tlocal m = o.method or "GET"\n\tlocal b = o.body or ""\nlocal t = "Content-Type: " .. (o.content_type or "text/plain")\n\tlocal c = "curl -s -X " .. m .. " " .. p .. ' -H "' .. t .. '"'\n\tif b ~= "" then\n\t\tc = c .. ' -d "' .. string.gsub(b, '"', '\\\\"') .. '"'\n\tend\n\th = io.popen(c)\n\tif not h then\n\t\treturn nil, "Failed to execute command: " .. c\n\tend\n\tlocal c = h:read("*a")\n\th:close()\n\treturn c\nend\n`;
                }
                return "bstolua_fetch";

            // nevermind kys lua
            case "fs.read":
                if(!this.fs_read) {
                    this.fs_read = true;
                    this.beginCode += `function bstolua_fs_read(f)\nlocal g=io.open(f, "r")\nlocal c=g:read("*a")\nio.close(g)\nreturn c\nend\n`;
                }
                return "bstolua_fs_read";
            case "fs.write":
                if(!this.fs_write) {
                    this.fs_write = true;
                    this.beginCode += `function bstolua_fs_write(f,d)\nlocal g=io.open(f, "w")\ng:write(d)\nio.close(g)\nend\n`;
                }
                return "bstolua_fs_write";
            case "fs.exists":
                if(!this.fs_exists) {
                    this.fs_exists = true;
                    this.beginCode += `function bstolua_fs_exists(f)\nlocal g=io.open(f, "r")\nif g then\nio.close(g)\nreturn true\nreturn false\nend\n`
                }
                return "bstolua_fs_exists";
            case "fs.rmdir":
                if(!this.fs_rmdir) {
                    this.fs_rmdir = true;
                    this.beginCode += `function bstolua_fs_rmdir(f)\nif package.config:sub(1,1)=="\\\\" then\nos.execute("rmdir /s /q \\""..f.."\\"")\nelse\nos.execute("rm -r \\""..f.."\\"")\nend\n`;
                }
                return "bstolua_fs_rmdir";
            case "fs.rm":
                return "os.remove";

            // these are very simple but since this just changes function name i gotta include it :sob:
            case "objects.hasKey":
                if(!this.objects_hasKey) {
                    this.objects_hasKey = true;
                    this.beginCode += `function bstolua_objects_hasKey(o,k)\nreturn o[k]~=nil\nend\n`;
                }
                return "bstolua_objects_hasKey";
            case "objects.get":
                if(!this.objects_get) {
                    this.objects_get = true;
                    this.beginCode += `function bstolua_objects_get(o,k)\nreturn o[k]\nend\n`;
                }
                return "bstolua_objects_get";
            case "objects.set":
                if(!this.objects_set) {
                    this.objects_set = true;
                    this.beginCode += `function bstolua_objects_set(o,k,v)\no[k]=v\nend\n`;
                }
                return "bstolua_objects_set";

            // silly billy exit command :3
            case "exit":
                return "os.exit";

            // possible but i'd have to transcribe every file imported into lua and then also make a bstolua_import() for lua import and change .bs to lua and ahahhahashdhsfhsdahf it's so late
            case "import":
                throw "import() is not supported by this transcriber. This is because.. I'm too tired right now.";

            default:
                return functionName;
        }
    }

    private defaultVariableFix(variableName: string): string {
        switch(variableName) {
            case "null":
                return "nil";
            case "args":
                return "arg";
            case "break":
                return "_break";
            case "return":
                return "_return";
            default:
                return variableName;
        }
    }

    private transcribeStmt(value: Stmt, depthInfo: number): string {
        switch(value.kind) {
            case "Program":
                let res = "";
                (value as Program).body.forEach(value => {
                    res += this.transcribeStmt(value, 0);
                })
                return res;
            case "NumericLiteral":
                return (value as NumericLiteral).value.toString();
            case "FunctionDeclaration": {
                const expr = (value as FunctionDeclaration);
                let fn = `function${depthInfo != Number.MIN_VALUE ? " " + expr.name : ""}(${expr.parameters.join(",")})`;
                let returnedAlready = false;
                expr.body.forEach((value, index) => {
                    if(!returnedAlready && this.canReturn(value.kind)) {
                        let addReturn = true;
                        for (let i = index + 1; i < expr.body.length; i++) {
                            if (expr.body[i].kind !== "NewLine") {
                                addReturn = false;
                                break;
                            }
                        }
                        if(addReturn) {
                            fn += "return ";
                            returnedAlready = true;
                        }
                    }
                    fn += this.transcribeStmt(value, 0);
                });                
                return `${fn}end`;
            }
            case "CallExpr": {
                const expr = (value as CallExpr);
                return `${this.defaultFunctionFix(this.transcribeStmt(expr.caller, 0))}(${expr.args.map((val) => this.transcribeStmt(val, Number.MIN_VALUE)).join(", ")})`;
            }
            case "StringLiteral":
                return `"${(value as StringLiteral).value.replace(/"/g, `"..'"'.."`).split("\n").join("\\n")}"`;
            case "Identifier":
                return this.defaultVariableFix((value as Identifier).symbol);
            case "VarDeclaration": {
                const expr = (value as VarDeclaration);
                return `local ${this.defaultVariableFix(expr.identifier)} = ${this.transcribeStmt(expr.value, 0)};`;
            }
            case "NewLine":
                return "\n";
            case "IfStatement": {
                const expr = (value as IfStatement);
                let ifVal = `if ${this.transcribeStmt(expr.test, 0)} then`;
                expr.body.forEach((value) => {
                    ifVal += this.transcribeStmt(value, depthInfo);
                });
                let alternate = "end";
                if(expr.alternate.length > 0) {
                    let first;
                    do {
                        first = expr.alternate.shift();
                    } while(first.kind == "NewLine");
                    if(first.kind == "IfStatement") {
                        alternate = `else${this.transcribeStmt(first, 0)}`;
                    } else {
                        expr.alternate.push(first);
                        // WHY DO I HAVE TO REVERSE THIS.WHTA THE FUCK FACE
                        alternate = `else\n${expr.alternate.reverse().map(val => this.transcribeStmt(val, 0)).join("")}\nend`;
                    }
                }
                return `${ifVal}${alternate}`;
            }
            case "BinaryExpr": {
                const expr = (value as BinaryExpr);
                let operator;
                switch(expr.operator) {
                    case "&&":
                        operator = "and";
                        break;
                    case "|":
                        operator = "or";
                        break;
                    case "!=":
                        operator = "~=";
                        break;
                    default:
                        operator = expr.operator;
                        break;
                }
                // idk it works
                let left = `${this.transcribeStmt(expr.left, 0)}`;
                let right = `${this.transcribeStmt(expr.right, 0)}`;
                if(expr.right.kind == "BinaryExpr") {
                    if(expr.left.kind == "BinaryExpr") left = `(${left})`;
                    if(operator == "*" || operator == "/") right = `(${right})`;
                }
                return `${left} ${operator} ${right}`;
            }
            case "ObjectLiteral": {
                const expr = (value as ObjectLiteral);
                return `{ ${expr.properties.map(val => val.value ? `${val.key} = ${this.transcribeStmt(val.value, 0)}` : `${val.key} = ${val.key}`).join(", ")} }`;
            }
            case "ArrayLiteral": {
                const expr = (value as ArrayLiteral);
                return `{ ${expr.values.map(val => this.transcribeStmt(val, 0))} }`;
            }
            case "TryCatchStatement": {
                const expr = (value as TryCatchStatement);
                const res = `local bstolua_success_${this.trycatchCounter}, bstolua_err_${this.trycatchCounter} = pcall(function()`.concat(
                    expr.body.map(val => this.transcribeStmt(val, 0)).join(""),
                    `end)\nif not bstolua_success_${this.trycatchCounter} then\nerror = bstolua_err_${this.trycatchCounter};`,
                    expr.alternate.map(val => this.transcribeStmt(val, 0)).join(""),
                    `end`
                );
                if(!this.error) {
                    this.error = true;
                    this.beginCode += `local error = "";\n`;
                }
                this.trycatchCounter++;
                return res;
            }
            case "MemberExpr": {
                const expr = (value as MemberExpr);
                const symbol = this.transcribeStmt(expr.object, 0);
                const prop = this.transcribeStmt(expr.property, 0);
                return expr.property.kind == "NumericLiteral" ? `${symbol}[${prop}]` : `${symbol}.${prop}`;
            }
            case "ForStatement": {
                const expr = (value as ForStatement);
                return `${this.transcribeStmt(expr.init, 0)}\nwhile ${this.transcribeStmt(expr.test, 0)} do\n${expr.body.map(val => this.transcribeStmt(val, 0)).join("")}\n${this.transcribeStmt(expr.update, 0)}\nend`;
            }
            case "AssignmentExpr": {
                const expr = (value as AssignmentExpr);
                return `${this.defaultVariableFix(this.transcribeStmt(expr.assigne, 0))} = ${this.transcribeStmt(expr.value, 0)}`;
            }
            default:
                return `<No transcription for "${value.kind}">`;
        }
    }
    canReturn(kind: NodeType): boolean {
        switch(kind) {
            case "ArrayLiteral":
            case "BinaryExpr":
            case "CallExpr":
            case "Identifier":
            case "FunctionDeclaration":
            case "MemberExpr":
            case "NumericLiteral":
            case "ObjectLiteral":
            case "StringLiteral":
                return true;
            default:
                return false;
        }
    }
}
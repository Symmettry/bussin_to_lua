import { Program } from "../../../bussin/dist/frontend/ast";
import { ArrayLiteral, AssignmentExpr, BinaryExpr, CallExpr, ForStatement, FunctionDeclaration, Identifier, IfStatement, MemberExpr, NodeType, NumericLiteral, ObjectLiteral, Stmt, StringLiteral, TryCatchStatement, VarDeclaration } from "../bussin_parser/ast";

export class Transcriber {

    private trycatchCounter: number = 0;

    private beginCode: string = "";

    private added: string[] = [];

    private bstolua_code: {[key: string]: string} = {
        "println": `function bstolua_println(t)\nif bstolua_tryfixprint ~= t then\nprint(t)\nend\nbstolua_tryfixprint = ""\nend\n`,
        "tryfixprint": `local bstolua_tryfixprint=""\n`,
        "charat": `function bstolua_charat(s,n)\nreturn string.sub(s,n-1,n-1)\nend\n`,
        "input": `function bstolua_input(s)\io.write(s)\nio.flush()\nbstolua_tryfixprint = io.read()\nreturn bstolua_tryfixprint\nend\n`,
        "strcon": `function bstolua_strcon(...)\nlocal result=""\nfor i,v in ipairs({...}) do\nresult=result..v\nend\nreturn result\nend\n`,
        "format": `function bstolua_format(f, ...)\nlocal a={...}\nlocal r=f:gsub("%\${}","%%s")\nreturn string.format(r,unpack(a))\nend\n`,
        "math.sqrt": `function bstolua_math_sqrt(n)\nreturn n^0.5\nend\n`,
        "math.round": `function bstolua_math_round(n)\nreturn math.floor(n+0.5)\nend\n`,
        "exec": `function bstolua_exec(c)\nlocal h=io.popen(c)\nlocal r=h:read("*a")\nh:close()\nreturn r\nend\n`,
        "setTimeout": `function bstolua_setTimeout(c,t)\nlocal s=os.clock()\nrepeat until os.clock()>s+(t/1000)\nc()\nend\n`,
        "setInterval": `function bstolua_setInterval(c,t)\nlocal s=os.clock()\nrepeat until os.clock()>s+(t/1000)\nc()\nbstolua_setInterval(c,t)\nend\n`,
        "fetch": `function bstolua_fetch(p, o)\n\to = o or {}\n\tlocal h\n\tlocal m = o.method or "GET"\n\tlocal b = o.body or ""\nlocal t = "Content-Type: " .. (o.content_type or "text/plain")\n\tlocal c = "curl -s -X " .. m .. " " .. p .. ' -H "' .. t .. '"'\n\tif b ~= "" then\n\t\tc = c .. ' -d "' .. string.gsub(b, '"', '\\\\"') .. '"'\n\tend\n\th = io.popen(c)\n\tif not h then\n\t\treturn nil, "Failed to execute command: " .. c\n\tend\n\tlocal c = h:read("*a")\n\th:close()\n\treturn c\nend\n`,
        "fs.read": `function bstolua_fs_read(f)\nlocal g=io.open(f, "r")\nlocal c=g:read("*a")\nio.close(g)\nreturn c\nend\n`,
        "fs.write": `function bstolua_fs_write(f,d)\nlocal g=io.open(f, "w")\ng:write(d)\nio.close(g)\nend\n`,
        "fs.exists": `function bstolua_fs_exists(f)\nlocal g=io.open(f, "r")\nif g then\nio.close(g)\nreturn true\nreturn false\nend\n`,
        "fs.rmdir": `function bstolua_fs_rmdir(f)\nif package.config:sub(1,1)=="\\\\" then\nos.execute("rmdir /s /q \\""..f.."\\"")\nelse\nos.execute("rm -r \\""..f.."\\"")\nend\n`,
        "objects.hasKey": `function bstolua_objects_hasKey(o,k)\nreturn o[k]~=nil\nend\n`,
        "objects.get": `function bstolua_objects_get(o,k)\nreturn o[k]\nend\n`,
        "objects.set": `function bstolua_objects_set(o,k,v)\no[k]=v\nend\n`,
        "error": `local error = "";\n`,
    };

    transcribe(ast: Program): string {
        let program = this.transcribeStmt(ast, 0)
        if(this.beginCode != "") {
            program = `--begin bstolua data--\n\n${this.beginCode}\n--end bstolua data--\n\n${program}`;
        }
        return program;
    }

    private addBC(key: string): void {
        if(this.added.includes(key)) return;
        if(!this.bstolua_code[key]) throw "Transcriber error: No code for " + key;

        this.added.push(key);
        this.beginCode += this.bstolua_code[key];
    }

    private defaultFunctionFix(functionName: string): string {
        switch(functionName) {

            // print with input() fix
            case "println":
                this.addBC("tryfixprint");
                this.addBC("println");
                return "bstolua_println";

            // string stuff
            case "len":
                return "string.len";
            case "charat":
                this.addBC("charat");
                return "bstolua_charat";
            case "input":
                this.addBC("tryfixprint");
                this.addBC("input");
                return "bstolua_input";
            case "strcon":
                this.addBC("strcon");
                return "bstolua_strcon";
            case "format":
                this.addBC("format");
                return "bstolua_format";

            // face made his math stuff the same as lua! well, except for the fact that lua doesn't have sqrt or round though. WHY!?!?!
            case "math.sqrt":
                this.addBC("math.sqrt");
                return "bstolua_math_sqrt";
            case "math.round":
                this.addBC("math.round");
                return "bstolua_math_round"
            case "math.toNumber":
                return "tonumber";
            case "math.toString":
                return "tostring";

            // time
            case "time":
                return "os.time";

            // exec
            case "exec":
                this.addBC("exec");
                return "bstolua_exec";

            // surprisingly i didnt have to change much for these to work. yay to lua?
            case "setTimeout":
                this.addBC("setTimeout");
                return "bstolua_setTimeout";
            case "setInterval":
                this.addBC("setInterval");
                return "bstolua_setInterval";

            // wtf
            case "fetch":
                this.addBC("fetch");
                return "bstolua_fetch";

            // nevermind kys lua
            case "fs.read":
                this.addBC("fs.read");
                return "bstolua_fs_read";
            case "fs.write":
                this.addBC("fs.write");
                return "bstolua_fs_write";
            case "fs.exists":
                this.addBC("fs.exists");
                return "bstolua_fs_exists";
            case "fs.rmdir":
                this.addBC("fs.rmdir");
                return "bstolua_fs_rmdir";
            case "fs.rm":
                return "os.remove";

            // these are very simple but since this just changes function name i gotta include it :sob:
            case "objects.hasKey":
                this.addBC("objects.hasKey");
                return "bstolua_objects_hasKey";
            case "objects.get":
                this.addBC("objects.get");
                return "bstolua_objects_get";
            case "objects.set":
                this.addBC("objects.set");
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
                        expr.alternate.unshift(first);
                        alternate = `else\n${expr.alternate.map(val => this.transcribeStmt(val, 0)).join("")}\nend`;
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
                this.addBC("error");
                this.trycatchCounter++;
                return res;
            }
            case "MemberExpr": {
                const expr = (value as MemberExpr);
                const symbol = this.transcribeStmt(expr.object, 0);
                let prop = this.transcribeStmt(expr.property, 0);
                return expr.computed ? `${symbol}[${prop} + 1]` : `${symbol}.${prop}`;
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
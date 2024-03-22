"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transcriber = void 0;
var Transcriber = (function () {
    function Transcriber() {
        this.trycatchCounter = 0;
        this.beginCode = "";
        this.math_sqrt = false;
        this.math_round = false;
        this.error = false;
        this.exec = false;
        this.charat = false;
        this.input = false;
        this.strcon = false;
        this.format = false;
        this.setTimeout = false;
        this.setInterval = false;
        this.fetch = false;
        this.fs_read = false;
        this.fs_write = false;
        this.fs_exists = false;
        this.fs_rmdir = false;
        this.objects_hasKey = false;
        this.objects_get = false;
        this.objects_set = false;
    }
    Transcriber.prototype.transcribe = function (ast) {
        var _this = this;
        var program = "";
        ast.body.forEach(function (value) {
            program += _this.transcribeStmt(value, 0);
        });
        if (this.beginCode != "") {
            program = "--begin bstolua data--\n\n".concat(this.beginCode, "\n--end bstolua data--\n\n").concat(program);
        }
        return program;
    };
    Transcriber.prototype.defaultFunctionFix = function (functionName) {
        switch (functionName) {
            case "println":
                return "print";
            case "len":
                return "string.len";
            case "charat":
                if (!this.charat) {
                    this.charat = true;
                    this.beginCode += "function bstolua_charat(s,n)\nreturn string.sub(s,n-1,n-1)\nend\n";
                }
                return "bstolua_charat";
            case "input":
                if (!this.input) {
                    this.input = true;
                    this.beginCode += "function bstolua_input(s)io.write(s)\nio.flush()\nreturn io.read()\nend\n";
                }
                return "bstolua_input";
            case "strcon":
                if (!this.strcon) {
                    this.strcon = true;
                    this.beginCode += "function bstolua_strcon(...)\nlocal result=\"\"\nfor i,v in ipairs({...}) do\nresult=result..v\nend\nreturn result\nend\n";
                }
                return "bstolua_strcon";
            case "format":
                if (!this.format) {
                    this.format = true;
                    this.beginCode += "function bstolua_format(f, ...)\nlocal a={...}\nlocal r=f:gsub(\"%${}\",\"%%s\")\nreturn string.format(r,unpack(a))\nend\n";
                }
                return "bstolua_format";
            case "math.sqrt":
                if (!this.math_sqrt) {
                    this.math_sqrt = true;
                    this.beginCode += "function bstolua_math_sqrt(n)\nreturn n^0.5\nend\n";
                }
                return "bstolua_math_sqrt";
            case "math.round":
                if (!this.math_round) {
                    this.math_round = true;
                    this.beginCode += "function bstolua_math_round(n)\nreturn math.floor(n+0.5)\nend\n";
                }
                return "bstolua_math_round";
            case "time":
                return "os.time";
            case "exec":
                if (!this.exec) {
                    this.exec = true;
                    this.beginCode += "function bstolua_exec(c)\nlocal h=io.popen(c)\nlocal r=h:read(\"*a\")\nh:close()\nreturn r\nend\n";
                }
                return "bstolua_exec";
            case "setTimeout":
                if (!this.setTimeout) {
                    this.setTimeout = true;
                    this.beginCode += "function bstolua_setTimeout(c,t)\nlocal s=os.clock()\nrepeat until os.clock()>s+(t/1000)\nc()\nend\n";
                }
                return "bstolua_setTimeout";
            case "setInterval":
                if (!this.setInterval) {
                    this.setInterval = true;
                    this.beginCode += "function bstolua_setInterval(c,t)\nlocal s=os.clock()\nrepeat until os.clock()>s+(t/1000)\nc()\nbstolua_setInterval(c,t)\nend\n";
                }
                return "bstolua_setInterval";
            case "fetch":
                if (!this.fetch) {
                    this.fetch = true;
                    this.beginCode += "function bstolua_fetch(p, o)\no = o or {}\nlocal h\nlocal m = o.method or \"GET\"\nlocal b = o.body or \"\"\nlocal w = package.config:sub(1, 1) == \"\\\\\"\nlocal c\nif w then\nc = \"certutil -urlcache -split -f \" .. p\nelse\nc = \"curl -X \" .. m .. \" -d \" .. b .. \" \" .. p\nend\nh = io.popen(c)\nif not h then\nreturn nil, \"Failed to execute command: \" .. c\nend\nlocal c = h:read(\"*a\")\nh:close()\nreturn c\nend\n";
                }
                return "bstolua_fetch";
            case "fs.read":
                if (!this.fs_read) {
                    this.fs_read = true;
                    this.beginCode += "function bstolua_fs_read(f)\nlocal g=io.open(f, \"r\")\nlocal c=g:read(\"*a\")\nio.close(g)\nreturn c\nend\n";
                }
                return "bstolua_fs_read";
            case "fs.write":
                if (!this.fs_write) {
                    this.fs_write = true;
                    this.beginCode += "function bstolua_fs_write(f,d)\nlocal g=io.open(f, \"w\")\ng:write(d)\nio.close(g)\nend\n";
                }
                return "bstolua_fs_write";
            case "fs.exists":
                if (!this.fs_exists) {
                    this.fs_exists = true;
                    this.beginCode += "function bstolua_fs_exists(f)\nlocal g=io.open(f, \"r\")\nif g then\nio.close(g)\nreturn true\nreturn false\nend\n";
                }
                return "bstolua_fs_exists";
            case "fs.rmdir":
                if (!this.fs_rmdir) {
                    this.fs_rmdir = true;
                    this.beginCode += "function bstolua_fs_rmdir(f)\nif package.config:sub(1,1)==\"\\\\\" then\nos.execute(\"rmdir /s /q \\\"\"..f..\"\\\"\")\nelse\nos.execute(\"rm -r \\\"\"..f..\"\\\"\")\nend\n";
                }
                return "bstolua_fs_rmdir";
            case "fs.rm":
                return "os.remove";
            case "objects.hasKey":
                if (!this.objects_hasKey) {
                    this.objects_hasKey = true;
                    this.beginCode += "function bstolua_objects_hasKey(o,k)\nreturn o[k]~=nil\nend\n";
                }
                return "bstolua_objects_hasKey";
            case "objects.get":
                if (!this.objects_get) {
                    this.objects_get = true;
                    this.beginCode += "function bstolua_objects_get(o,k)\nreturn o[k]\nend\n";
                }
                return "bstolua_objects_get";
            case "objects.set":
                if (!this.objects_set) {
                    this.objects_set = true;
                    this.beginCode += "function bstolua_objects_set(o,k,v)\no[k]=v\nend\n";
                }
                return "bstolua_objects_set";
            case "exit":
                return "os.exit";
            case "import":
                throw "import() is not supported by this transcriber. This is because.. I'm too tired right now.";
            default:
                return functionName;
        }
    };
    Transcriber.prototype.defaultVariableFix = function (variableName) {
        switch (variableName) {
            case "null":
                return "nil";
            case "args":
                return "arg";
            default:
                return variableName;
        }
    };
    Transcriber.prototype.transcribeStmt = function (value, scopeIndex) {
        var _this = this;
        var response = "";
        switch (value.kind) {
            case "NumericLiteral":
                response = value.value.toString();
                break;
            case "FunctionDeclaration": {
                var expr_1 = value;
                var fn_1 = "function".concat(scopeIndex != Number.MIN_VALUE ? " " + expr_1.name : "", "(").concat(expr_1.parameters.join(","), ")");
                expr_1.body.forEach(function (value, index) {
                    fn_1 += "".concat(index + 1 == expr_1.body.length && value.kind != "NewLine" ? "return " : "").concat(_this.transcribeStmt(value, 0));
                });
                response = "".concat(fn_1, "end");
                break;
            }
            case "CallExpr": {
                var expr = value;
                response = "".concat(this.defaultFunctionFix(this.transcribeStmt(expr.caller, 0)), "(").concat(expr.args.map(function (val) { return _this.transcribeStmt(val, Number.MIN_VALUE); }).join(", "), ")");
                break;
            }
            case "StringLiteral":
                return "\"".concat(value.value, "\"");
            case "Identifier":
                return this.defaultVariableFix(value.symbol);
            case "VarDeclaration": {
                var expr = value;
                response = "local ".concat(expr.identifier, " = ").concat(this.transcribeStmt(expr.value, 0), ";");
                break;
            }
            case "NewLine":
                return "\n";
            case "IfStatement": {
                var expr = value;
                var ifVal_1 = "if ".concat(this.transcribeStmt(expr.test, 0), " then");
                expr.body.forEach(function (value) {
                    ifVal_1 += _this.transcribeStmt(value, scopeIndex + 1);
                });
                var alternate = "end";
                if (expr.alternate.length > 0) {
                    var first = void 0;
                    do {
                        first = expr.alternate.shift();
                    } while (first.kind == "NewLine");
                    if (first.kind == "IfStatement") {
                        alternate = "else".concat(this.transcribeStmt(first, 0));
                    }
                    else {
                        expr.alternate.push(first);
                        alternate = "else".concat(expr.alternate.map(function (val) { return _this.transcribeStmt(val, Math.abs(scopeIndex + 1)); }).join(""), "\nend");
                    }
                }
                response = "".concat(ifVal_1).concat(alternate);
                break;
            }
            case "BinaryExpr": {
                var expr = value;
                var operator = void 0;
                switch (expr.operator) {
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
                return "".concat(this.transcribeStmt(expr.left, 0), " ").concat(operator, " ").concat(this.transcribeStmt(expr.right, 0));
            }
            case "ObjectLiteral": {
                var expr = value;
                return "{ ".concat(expr.properties.map(function (val) { return val.value ? "".concat(val.key, " = ").concat(_this.transcribeStmt(val.value, 0)) : "".concat(val.key, " = ").concat(val.key); }).join(", "), " }");
            }
            case "TryCatchStatement": {
                var expr = value;
                response = response.concat("local bstolua_success_".concat(this.trycatchCounter, ", bstolua_err_").concat(this.trycatchCounter, " = pcall(function()"), expr.body.map(function (val) { return _this.transcribeStmt(val, Math.abs(scopeIndex + 1)); }).join(""), "end)\nif not bstolua_success_".concat(this.trycatchCounter, " then\nerror = bstolua_err_").concat(this.trycatchCounter, ";"), expr.alternate.map(function (val) { return _this.transcribeStmt(val, Math.abs(scopeIndex + 1)); }).join(""), "end");
                if (!this.error) {
                    this.error = true;
                    this.beginCode += "local error = \"\";\n";
                }
                this.trycatchCounter++;
                break;
            }
            case "MemberExpr": {
                var expr = value;
                var symbol = this.transcribeStmt(expr.object, 0);
                var prop = this.transcribeStmt(expr.property, 0);
                return "".concat(symbol, ".").concat(prop);
            }
            case "ForStatement": {
                var expr = value;
                response = "".concat(this.transcribeStmt(expr.init, 0), "\nwhile ").concat(this.transcribeStmt(expr.test, 0), " do\n").concat(expr.body.map(function (val) { return _this.transcribeStmt(val, Math.abs(scopeIndex + 1)); }).join(""), "\n").concat(this.transcribeStmt(expr.update, Math.abs(scopeIndex + 1)), "\nend");
                break;
            }
            case "AssignmentExpr": {
                var expr = value;
                response = "".concat(this.transcribeStmt(expr.assigne, 0), " = ").concat(this.transcribeStmt(expr.value, 0));
                break;
            }
            default:
                response = "<No transcription for \"".concat(value.kind, "\">");
                break;
        }
        return "".concat(response);
    };
    return Transcriber;
}());
exports.Transcriber = Transcriber;
//# sourceMappingURL=transcriber.js.map
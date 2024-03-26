import * as fs from 'fs';
import { get_currency, bsx_transcribe } from "./bussin_parser/bussinx/bsx_transcriber";
import { Transcriber } from "./transcriber/transcriber";
import Parser from "./bussin_parser/parser"
const luamin = require('lua-format');

const args = process.argv;
    args.shift();
    args.shift();

(async () => {
    
    if(!args[0]) return console.log("File path required.");
    
    const file = args[0];
    if(!fs.existsSync(file)) return console.log("Nonexistent file.");

    let input;
    if(file.endsWith(".bs")) {
        input = fs.readFileSync(file, "utf-8");
    } else if (file.endsWith(".bsx")) {
        const currencies = JSON.parse(fs.readFileSync(__dirname + "/../src/bussin_parser/bussinx/currencies.json", "utf-8")); // should work for /src/ and /dist/
        const currency = await get_currency(currencies);
        input = bsx_transcribe(fs.readFileSync(file, "utf-8"), currency);
    }

    const parser = new Parser();
    const program = parser.produceAST(input);

    fs.writeFileSync("./ast.json", JSON.stringify(program, null, 4));

    // @ts-ignore
    const transcribed = new Transcriber().transcribe(program);

    const newPath = file.substring(0, file.lastIndexOf(".")) + ".lua";

    fs.writeFileSync(newPath, transcribed);

    // if luamin throws an error, it will keep non-beautified.
    fs.writeFileSync(newPath, luamin.Beautify(transcribed, {RenameVariables: false, RenameGlobals: false, SolveMath: true}).substring(58));

})();
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bsx_transcribe = exports.get_currency = void 0;
var axios_1 = require("axios");
var geoip = require('geoip-lite');
String.prototype.replace_fr = function (target, replacement) {
    var pattern = new RegExp("\\b".concat(target, "\\b(?=(?:(?:[^\"]*\"){2})*[^\"]*$)"), 'g');
    return this.replace(pattern, replacement);
};
var rightsideCurrencies = [
    "€",
    "£",
    "CHF",
    "kr",
    "zł",
    "Ft",
    "Kč",
    "kn",
    "RSD",
    "лв",
    "lei",
    "₽",
    "₺",
    "₴"
];
String.prototype.replace_currency = function (currency) {
    var pattern = new RegExp("".concat(rightsideCurrencies.includes(currency) ? "{}" + currency : currency + "{}"), 'g');
    return this.replace(pattern, "${}");
};
function get_currency(currencies) {
    return __awaiter(this, void 0, void 0, function () {
        var country, currency;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, get_country()];
                case 1:
                    country = (_a.sent()).country;
                    currency = currencies.find(function (el) { return el.code === country; });
                    return [2, currency.currency.symbol];
            }
        });
    });
}
exports.get_currency = get_currency;
function get_country() {
    return __awaiter(this, void 0, void 0, function () {
        var response, ip, geo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, axios_1.default.get('https://api64.ipify.org?format=json')];
                case 1:
                    response = _a.sent();
                    ip = response.data.ip;
                    return [4, geoip.lookup(ip)];
                case 2:
                    geo = _a.sent();
                    return [2, geo];
            }
        });
    });
}
function bsx_transcribe(code, currency) {
    return code
        .replace_fr(";", '!')
        .replace_fr("rn", ';')
        .replace_fr("be", '=')
        .replace_fr("lit", 'let')
        .replace_fr("mf", 'const')
        .replace_fr("waffle", 'println')
        .replace_fr("sus", 'if')
        .replace_fr("fake", 'null')
        .replace_fr("impostor", 'else')
        .replace_fr("nah", '!=')
        .replace_fr("fr", '==')
        .replace_fr("btw", '&&')
        .replace_fr("carenot", '|')
        .replace_fr("bruh", 'fn')
        .replace_fr("nerd", 'math')
        .replace_fr("yall", 'for')
        .replace_fr("smol", '<')
        .replace_fr("thicc", '>')
        .replace_fr("nocap", 'true')
        .replace_fr("cap", 'false')
        .replace_fr("fuck_around", 'try')
        .replace_fr("find_out", 'catch')
        .replace_fr("clapback", 'exec')
        .replace_fr("yap", 'input')
        .replace_fr("minus", "-")
        .replace_fr("plus", "+")
        .replace_fr("minusminus", "--")
        .replace_fr("plusplus", "++")
        .replace_fr("times", "*")
        .replace_fr("divided by", "/")
        .replace_fr("bye", "exit")
        .replace_fr("hollup", "setTimeout")
        .replace_fr("yappacino", "setInterval")
        .replace_fr("beplus", "+=")
        .replace_fr("beminus", "-=")
        .replace_fr("betimes", "*=")
        .replace_fr("bedivided", "/=")
        .replace(/\: number/g, '')
        .replace(/\: string/g, '')
        .replace(/\: object/g, '')
        .replace(/\: boolean/g, '')
        .replace_currency(currency);
}
exports.bsx_transcribe = bsx_transcribe;
//# sourceMappingURL=bsx_transcriber.js.map
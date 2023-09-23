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
var fs = require("fs");
//Test Path
var file = 'browserify_info.json';
var jsonpath = 'lodash_lodash_info.json';
//const jsonpath = 'nullivex_nodist_info.json';
var readJSON = function (jsonPath, callback) {
    fs.readFile(jsonPath, 'utf-8', function (err, data) {
        if (err) {
            console.error('Error reading file:', err);
            callback(null); // Pass null to the callback to indicate an error
            return;
        }
        try {
            var jsonData = JSON.parse(data);
            callback(jsonData); // Pass the parsed JSON data to the callback
        }
        catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            callback(null); // Pass null to the callback to indicate an error
        }
    });
};
function check_npm_for_open_source(filePath) {
    return new Promise(function (resolve) {
        readJSON(filePath, function (jsonData) {
            if (jsonData !== null) {
                if (jsonData.repository.type == 'git') {
                    var gitUrl = jsonData.repository.url;
                    console.log('ssh url:', gitUrl);
                    var httpsUrl = 'https://' + gitUrl.substring(10, gitUrl.length);
                    console.log('https url:', httpsUrl);
                    //return github url
                    console.log('JSON:', jsonData);
                    resolve(httpsUrl);
                }
                else {
                    console.log('No git repository found.');
                    resolve("Invalid");
                }
            }
            else {
                console.error('Failed to read or parse JSON.');
                resolve(null);
            }
        });
    });
}
//count number of contributors by checking each unique usernames(login)
function countContributors(data) {
    var uniqueLogins = new Set();
    data.forEach(function (item) {
        if (item.login) {
            uniqueLogins.add(item.login);
        }
    });
    return uniqueLogins.size;
}
// Function to calculate the bus factor score
function calculateBusFactor(x) {
    var result = Math.pow((Math.log(x + 1) / (Math.log(1000) + 1)), 1.22);
    return result;
}
//function to parse for number of contributors
function parseContributors(filePath) {
    var fs = require('fs');
    try {
        // Read the JSON data from the file
        var jsonData = fs.readFileSync(filePath, 'utf8');
        var data = JSON.parse(jsonData);
        // Access the contributors URL
        var contributorsUrl = data.contributors_url;
        // Fetch contributors data
        // to get past api rate limit, really jank since my github pat is included in plaintext lmfao
        // DELETE THIS PART IN FINAL
        var token = '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';
        var headers = {
            Authorization: "token ".concat(token),
        };
        //end of jank
        fetch(contributorsUrl, { headers: headers }) //this line when api rate limit
            //fetch(contributorsUrl) //this line when normal
            .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(function (contributorsData) {
            // Handle contributors data 
            var numContributors = countContributors(contributorsData);
            var busFactor = calculateBusFactor(numContributors);
            //console.log('Contributors:', contributorsData);
            console.log('numConstributors:', numContributors);
            console.log('busFactor:', busFactor);
        })
            .catch(function (error) {
            console.error('Error:', error);
        });
    }
    catch (error) {
        console.error('Error reading or parsing JSON:', error);
    }
}
function findResponsiveTime(data) {
    var createdAt = new Date(data.created_at);
    var closedAt = new Date(data.closed_at);
    //console.log('Created At:', createdAt);
    //console.log('Closed At:', closedAt);
    var difference = closedAt.valueOf() - createdAt.valueOf();
    //console.log('difference:', difference);
    return difference;
}
function parseResponsiveness(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, timeDifference, jsonData, data, baseUrl, issueUrl, i, url, token, headers, _i, issueUrl_1, url, response, issueData, time, error_1, sum, avg, score, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = require('fs');
                    timeDifference = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    jsonData = fs.readFileSync(filePath, 'utf8');
                    data = JSON.parse(jsonData);
                    baseUrl = data.issues_url;
                    issueUrl = [];
                    //console.log("BASE URL:", baseUrl);
                    for (i = 1; i <= 20; i++) {
                        url = baseUrl.replace('{/number}', "/".concat(i));
                        issueUrl.push(url);
                    }
                    token = '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';
                    headers = {
                        Authorization: "token ".concat(token),
                    };
                    _i = 0, issueUrl_1 = issueUrl;
                    _a.label = 2;
                case 2:
                    if (!(_i < issueUrl_1.length)) return [3 /*break*/, 8];
                    url = issueUrl_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, fetch(url, { headers: headers })];
                case 4:
                    response = _a.sent();
                    //const response = await fetch(url); //this line normally
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    issueData = _a.sent();
                    time = findResponsiveTime(issueData);
                    //console.log("test:", time);
                    timeDifference.push(time);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error getting URL:', error_1);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    console.log("time differences:", timeDifference);
                    sum = timeDifference.reduce(function (acc, value) { return acc + value; }, 0);
                    avg = sum / timeDifference.length;
                    score = 1 - (avg / 31536000000);
                    console.log("avg time difference:", avg);
                    console.log("normalized score:", score);
                    return [3 /*break*/, 10];
                case 9:
                    error_2 = _a.sent();
                    console.error('Error reading or parsing JSON:', error_2);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
//check_npm_for_open_source(file);
parseContributors(jsonpath);
parseResponsiveness(jsonpath);

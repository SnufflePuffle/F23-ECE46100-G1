"use strict";
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~/
/ NPM/GITHUB URL-to-JSON                    /
/     Program takes in text file of URLS,   /
/     we return output files of JSON data   /
/     from each npm/github url.             /
/~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// setup
const fs = __importStar(require("fs")); // use filesystem
const child_process_1 = require("child_process"); // to execute shell cmds
let npmRegex = /https:\/\/www\.npmjs\.com\/package\/([\w-]+)/i; // regex to get package name from npm url
let gitRegex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/i; // regex to get user/repo name  from git url
var arg = process.argv[2]; // this is the url(s).txt arguement passed to the js executable
let pkgName = []; // setup array for package names
let gitDetails = []; // setup array for git user/repo name 
// sleep function to avoid rate limit
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// read urls from file
const url_list = (filename) => {
    try {
        return fs.readFileSync(filename, 'utf8').split(/\r?\n/).filter(Boolean);
    }
    catch (error) {
        console.error(`File does not exist`);
        process.exit(0);
    }
};
// gets npm package names
const get_npm_package_name = (npmUrl) => {
    const npm_match = npmUrl.match(npmRegex);
    if (npm_match) { // if url is found with proper regex (package identifier)
        return npm_match[1]; // return this package name
    }
    return null;
};
// gets github username and repo
const get_github_info = (gitUrl) => {
    const gitMatch = gitUrl.match(gitRegex);
    if (gitMatch) {
        return {
            username: gitMatch[1],
            repo: gitMatch[2]
        };
    }
    return null;
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~/
// we could probably stick the below into a function, but for now it works :3 
if (!arg || typeof arg !== 'string') {
    console.log("No URL argument provided");
    process.exit(1);
}
if (arg.length > 2) { // string at least have .txt, if we dont see more than 2 characters we havent gotten a proper file name
    const filename = arg;
    const urls = url_list(filename); // grab urls from file. 
    if (urls.length === 0) {
        console.log("No URLS found");
        process.exit(0);
    }
    urls.forEach(url => {
        const npmPackageName = get_npm_package_name(url); // get package name 
        const gitInfo = get_github_info(url); // get github info
        if (npmPackageName) {
            pkgName.push(npmPackageName); // push to package name array
        }
        else if (gitInfo) {
            gitDetails.push(gitInfo); // push to github details array
        }
        else {
            console.error("Error, invalid contents of file"); // non git or npm url
        }
    });
}
else {
    process.exit(0); // no file name passed
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~/
function get_npm_package_json(pkgName) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < pkgName.length; i++) {
            const pkg = pkgName[i];
            try {
                const output = (0, child_process_1.execSync)(`npm view ${pkg} --json`, { encoding: 'utf8' }); // shell cmd to get json
                fs.writeFileSync(`./${pkg}_info.json`, output); // write json to file
                yield sleep(2000); // sleep to avoid rate limit
            }
            catch (error) {
                console.error(`Failed to get npm info for package: ${pkg}`);
                //process.exit(0); // exit if we fail to get github info
            }
        }
    });
}
function get_github_package_json(gitDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let detail of gitDetails) {
            let repoURL = `https://api.github.com/repos/${detail.username}/${detail.repo}`; // api url for github
            try {
                const output = yield fetch(repoURL); // fetch json from url
                if (!output.ok) {
                    throw new Error(`Error: ${output.status} ${output.statusText}`);
                }
                const data = yield output.json(); // convert to json
                const prettyData = JSON.stringify(data, null, 4); // pretty print json
                fs.writeFileSync(`./${detail.username}_${detail.repo}_info.json`, prettyData); // write pretty print json to file
                yield sleep(2000); // sleep to avoid rate limit
            }
            catch (error) {
                console.error(`Failed to get github info for user: ${detail.username} and repo: ${detail.repo}`); // throw error for now, might need to exit on error instead for no console outputs other than desired *we can ask*
                //process.exit(0); // exit if we fail to get github info
            }
        }
    });
}
get_npm_package_json(pkgName);
get_github_package_json(gitDetails);

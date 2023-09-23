import * as fs from 'fs';

//Test Path
const file = 'browserify_info.json';
const jsonpath = 'lodash_lodash_info.json';
//const jsonpath = 'nullivex_nodist_info.json';

const readJSON = (jsonPath: string, callback: (data: Record<string, any> | null) => void) => {
  fs.readFile(jsonPath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      callback(null); // Pass null to the callback to indicate an error
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      callback(jsonData); // Pass the parsed JSON data to the callback
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      callback(null); // Pass null to the callback to indicate an error
    }
  });
};

function check_npm_for_open_source(filePath: string): Promise<string | null> {
  return new Promise((resolve) => {
    readJSON(filePath, (jsonData) => {
      if (jsonData !== null) {
        if (jsonData.repository.type == 'git') {
          let gitUrl: string = jsonData.repository.url;
          console.log('ssh url:', gitUrl);
          let httpsUrl: string = 'https://' + gitUrl.substring(10, gitUrl.length);
          console.log('https url:', httpsUrl);
          //return github url
          console.log('JSON:', jsonData);
          resolve(httpsUrl);
        } else {
          console.log('No git repository found.');
          resolve("Invalid");
        }
      } else {
        console.error('Failed to read or parse JSON.');
        resolve(null);
      }
    });
  });
}

//count number of contributors by checking each unique usernames(login)
function countContributors(data: any[]): number {
  const uniqueLogins = new Set<string>();

  data.forEach(item => {
    if (item.login) {
      uniqueLogins.add(item.login);
    }
  });

  return uniqueLogins.size;
}
// Function to calculate the bus factor score
function calculateBusFactor(x: number): number {
  const result = Math.pow((Math.log(x + 1) / (Math.log(1000) + 1)), 1.22);
  return result;
}

//function to parse for number of contributors
function parseContributors(filePath: string) {
  const fs = require('fs');
  try {
    // Read the JSON data from the file
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(jsonData);
    // Access the contributors URL
    const contributorsUrl = data.contributors_url;
    // Fetch contributors data

    // to get past api rate limit, really jank since my github pat is included in plaintext lmfao
    // DELETE THIS PART IN FINAL
    const token = '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';
    const headers = {
      Authorization: `token ${token}`,
    };
    //end of jank

    fetch(contributorsUrl, { headers }) //this line when api rate limit
    //fetch(contributorsUrl) //this line when normal
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((contributorsData) => {
        // Handle contributors data 
        const numContributors = countContributors(contributorsData);
        const busFactor = calculateBusFactor(numContributors);
        //console.log('Contributors:', contributorsData);
        console.log('numConstributors:', numContributors);
        console.log('busFactor:', busFactor);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  } catch (error) {
    console.error('Error reading or parsing JSON:', error);
  }

}

function findResponsiveTime(data: any) : number {

  var createdAt = new Date(data.created_at);
  var closedAt = new Date(data.closed_at);
  //console.log('Created At:', createdAt);
  //console.log('Closed At:', closedAt);
  var difference = closedAt.valueOf() - createdAt.valueOf();
  //console.log('difference:', difference);
  return difference;
}


async function parseResponsiveness(filePath: string) {
  var fs = require('fs');
  const timeDifference: number[] = []; //list to keep track of time differences for avg
  try {
    // Read the JSON data from the file
    var jsonData = fs.readFileSync(filePath, 'utf8');
    var data = JSON.parse(jsonData);

    // get the issues URLs
    //console.log(data);
    const baseUrl = data.issues_url;
    const issueUrl: string[] = [];
    //console.log("BASE URL:", baseUrl);
    for (let i = 1; i <= 20; i++) {
      const url = baseUrl.replace('{/number}', `/${i}`);
      issueUrl.push(url);
    }
    //console.log("ISSUE URL:", issueUrl);

    // to get past api rate limit, really jank since my github pat is included in plaintext lmfao
    // DELETE THIS PART IN FINAL
    const token = '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';
    const headers = {
      Authorization: `token ${token}`,
    };
    //end of jank


    for (const url of issueUrl) {
      try {
        const response = await fetch(url, { headers }); //this line when caring about api rate
        //const response = await fetch(url); //this line normally
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const issueData = await response.json();
        const time = findResponsiveTime(issueData);
        //console.log("test:", time);
        timeDifference.push(time);
      } catch (error) {
        console.error('Error getting URL:', error);
      }
    }

    console.log("time differences:", timeDifference);
    var sum = timeDifference.reduce((acc, value) => acc + value, 0);
    var avg = sum/timeDifference.length;
    //const score = 1 - (avg - Math.min(...timeDifference)) / (Math.max(...timeDifference) - Math.min(...timeDifference));
    const score = 1 - (avg / 31536000000);
    console.log("avg time difference:", avg);
    console.log("normalized score:", score);
  } catch (error) {
    console.error('Error reading or parsing JSON:', error);
  }
}

//check_npm_for_open_source(file);
parseContributors(jsonpath);
parseResponsiveness(jsonpath);

import { Octokit } from "octokit"
var blessed = require('blessed')
var screen  = blessed.screen({ fastSCR: true })
screen.title = 'Results'
var box = blessed.box({
  top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: '',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0'
      },
      hover: {
        bg: 'green'
      }
    }
})
screen.append(box)

const auth_file = "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"

const octokit = new Octokit ({
  auth: auth_file
})

console.clear()
const input = prompt("Search Github: ")

const searches = await octokit.request('GET /search/repositories', {
  q: input,
  headers: {
    'X-Github-Api-Version': '2022-11-28'
  }
})

var licStack = []
var contentStack = [] // This will be huge



/*
 * The structure is:
 *  searches
 *    - data
 *      - total_count
 *      - items
 *        - full name
 *        - owner
 *        - html_url
 *        - description
 *        - clone_url
 *        - ssh_url
 *        - size
 *        - stargazers
 *        - watchers
 *        - language
 *        - forks_count
 *        - open_issues_count
 *        - license
 *          - spdx_id
 *        - topics
 *        - visibility
 *        - default_branch
 *
 *
 * When parsed, it should be like this:
 * searches['data']['items'][NUMBER][DATAS]
*/

const search = searches['data']['items']
const result = searches['data']['total_count']
let i = 0
console.clear()
console.log(`Search results (${result}): `)
while (i < search.length) {
  var name = search[i]['full_name']
  var url = search[i]['html_url']
  var desc = search[i]['description']
  var http_url = search[i]['clone_url']
  var ssh_url = search[i]['ssh_url']
  var size = search[i]['size']
  var stars = search[i]['stargazers_count']
  var watch = search[i]['watchers_count']
  var lang = search[i]['language']
  var forks = search[i]['forks_count']
  var issues = search[i]['open_issues_count']
  var license = search[i]['license']
  var topics = search[i]['topics']
  if (license == null) {
    // console.log("There is no license. Reaching Here.")
    license = "none"
    licStack.push(license)
  } else {
    license = license['spdx_id']
    licStack.push(license)
  }
  var vis = search[i]['visibility']
  var main_branch = search[i]['default_branch']
  

  
  var text = `Name: ${name} (${vis})\nURL: ${url}\nStars: ${stars}\nForks: ${forks}\nWatchers: ${watch}\nDescription: ${desc}\nOpen Issues: ${issues}\nProgramming Language: ${lang}\nCode:\n\tHTTPS: ${http_url}\n\tSSH: ${ssh_url}\n\tGithub CLI: gh repo clone ${name}\nLicense: ${licStack.pop()}\nRepository Size: ${size}\nDefault branch: ${main_branch}\n\nTopics: ${topics}\n================================================================`
  console.log(text)
  box.setContent(text)
  
  i++
}

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0)
})

box.focus()
screen.render()

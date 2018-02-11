const fs = require("fs");
const path = require("path");

const Discord = require("discord.js");
const client = new Discord.Client();


const hasURI = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");

const Behaviors = [
  require("./behaviors/MusicOnly.behavior.js")(client),
];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  for (rule of Behaviors) {
    rule.handleOnMessage && rule.handleOnMessage(msg);
  }
});

const AUTH_TOKEN_PATH = path.join(__dirname, "AUTH_TOKEN");
const AUTH_TOKEN = fs.readFileSync(AUTH_TOKEN_PATH, {encoding: "utf8"});
client.login(AUTH_TOKEN.trim());

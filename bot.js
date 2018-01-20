const fs = require("fs");

const Discord = require("discord.js");
const client = new Discord.Client();

const hasURI = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");

const Behaviors = [
  {
    name: "Not Music Warning",
    _perps: new Set(),
    _perpMercies: 4,
    handleOnMessage: function(msg) {
      if(
        msg.author.id === client.user.id ||
        msg.channel.topic !== "music" ||
        hasURI.test(msg.content)
      ) {
        return;
      }

      this._perps.add(msg.author);
      if (--this._perpMercies > 0) {
        return;
      }
      this._perpMercies = 4;

      let address = "";
      for (const [i, perp] of this._perps.entries()) {
        address += `${perp}: `;
      }
      this._perps = new Set();
      msg.channel.send(
        address
        + " this is a dedicated music channel."
        + " Please share something fresh or switch channels."
      ).catch(console.error);
    },
  },
];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  for (rule of Behaviors) {
    rule.handleOnMessage && rule.handleOnMessage(msg);
  }
});

const AUTH_TOKEN = fs.readFileSync("AUTH_TOKEN", {encoding: "utf8"});
client.login(AUTH_TOKEN.trim());

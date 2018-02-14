const fs = require("fs");
const uuidv4 = require('uuid/v4');
const sqlite3 = require("sqlite3").verbose();
const dbPath = __dirname + '/mcledger.sqlite';
const dbExistsAtStart = fs.existsSync(dbPath);
const db = new sqlite3.Database(dbPath);
if (!dbExistsAtStart) {
  db.run("CREATE TABLE coords (x REAL, y REAL, z, REAL, desc BLOB, owner BLOB)");
}

function getAll(callback) {
  db.all("SELECT x, y, z, desc, owner FROM coords", (e, data) => {
    callback(data);
  });
}

cmds = [
  {
    regex: /\/help/g,
    capturegroups: 0,
    execute: function (msg) {
      msg.channel.send(
        "Minecraft Ledger Commands\n"
        + "Add a coord\n"
        + "\t /xyz <x> <y> <z> <description>\n\n"
        + "Print all coords\n"
        + "\t /xyz all\n\n"
        + "Seach for coords\n"
        + "\t /xyz [search expression]"
      ).catch(console.error);  
    },
  },
  {
    regex: /\/xyz\s+([+-]?\d*\.?\d*)\s+([+-]?\d*\.?\d*)\s+([+-]?\d*\.?\d*)\s+([a-zA-Z\s]+)/g,
    capturegroups: 4,
    execute: function (msg, x, y, z, desc) {
      db.run("INSERT INTO coords (x, y, z, desc, owner) VALUES (?, ?, ?, ?, ?);", x, y, z, desc, msg.author.tag, function(e) {
        if (e) {
          msg.channel.send(
            "I didn't quite catch that. try.../\n /xyz <x> <y> <z> <description>"
          ).catch(console.error);
          return;
        }
        msg.channel.send(":ok_hand:").catch(console.error);
      });
    },
  },
  {
    regex: /\/xz\s+([+-]?\d*\.?\d*)\s+([+-]?\d*\.?\d*)\s+([a-zA-Z\s]+)/g,
    capturegroups: 3,
    execute: function (msg, x, z, desc) {
      db.run("INSERT INTO coords (x, y, z, desc, owner) VALUES (?, null, ?, ?, ?);", x, z, desc, msg.author.tag, function(e) {
        if (e) {
          msg.channel.send(
            "I didn't quite catch that. try.../\n /xz <x> <z> <description>"
          ).catch(console.error);
          return;
        }
        msg.channel.send(":ok_hand:").catch(console.error);
      });
    },
  },
  {
    regex: /xyz\s+([a-zA-Z\s]+)/g,
    capturegroups: 1,
    execute: function (msg, search) {
     console.log(search);
      if (search == "all") {
        return;
      }
      db.all("SELECT * FROM coords WHERE UPPER(desc) LIKE UPPER('%"+search+"%')", (e, rows) => {
        if (e || !rows) console.log(e, rows);
        let print = `Coord results for search: [${search}]...\n`;
        for (row of rows) {
          print += `${row.desc} \tXYZ:(${row.x}, ${row.y}, ${row.z}) by @${row.owner}\n`;
        }
        msg.channel.send(print).catch(console.error);
      });
    }
  },
  {
    regex: /xyz\s+all/g,
    capturegroups: 0,
    execute: function (msg) {
      getAll(function (rows) {
        let print = "Remarkable coords:\n";
        for (row of rows) {
          print += `${row.desc} \tXYZ:(${row.x}, ${row.y}, ${row.z}) by @${row.owner}\n`;
        }
        msg.channel.send(print).catch(console.error);
      }.bind(this));
    }
  }
]


module.exports = function(client) {
  return {
    db: db,
    handleOnMessage: function(msg) {
      if (
        msg.author.id == client.user.id ||
        msg.channel.topic.indexOf("minecraft") < 0
      ) {
        return;
      }

      for (cmd of cmds) {
        matches = cmd.regex.exec(msg.content);
        if (matches && matches.length === cmd.capturegroups + 1) {
          cmd.execute.bind(this)(msg, ...matches.splice(1));
        }
      }
    },
  };
};

Links = new Meteor.Collection("links");

if (Meteor.is_client) {
  Template.links.links = function() {
    return Links.find({}, {sort: {timestamp: 1}});
  }
}

if (Meteor.is_server) {

  var fs = __meteor_bootstrap__.require("fs");
  var log_file = "/home/alx/.weechat/logs/irc.bitlbee.barbabot.weechatlog";

  var LogMonitor = {
    initialize: function() {
      fs.watchFile(log_file, LogMonitor.watch);
    },

    watch: function(curr, prev) {
      if (curr.mtime <= prev.mtime) {
        return;
      }

      fs.readFile(log_file, "utf8", function(err, data) {
        var lines = data.split("\n");

        lines.pop(); // empty line

        lines.pop().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\s+(.[^\s]*)\s+(.*)$/);
        var user = RegExp.$1;
        var content = RegExp.$2;
        if ((user == "alx") && (content.match(/(http:.[^\s]*) (.*)/) != null)) {
          Fiber(function() {Links.insert({url: RegExp.$1, description: RegExp.$2, timestamp: new Date()});}).run();
        }
      });
    }
  };

  Meteor.startup(function () {
    LogMonitor.initialize();
  });
}

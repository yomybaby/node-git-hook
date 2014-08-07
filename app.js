var app, config, exec, express;

express = require('express');
exec = require('child_process').exec;
config = require('./config.json');
var bodyParser = require('body-parser');

var _s = require('underscore.string');
var _ = require('underscore');

app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/*', function(req, res) {
  return res.send('Hello!');
});

app.post('/', function(req, res) {
  var bburl, local, payload, _ref;

  payload = JSON.parse(req.body.payload);
  var targetRepo;
  
  if(payload.canon_url.indexOf('bitbucket')>-1){ //bitbucket
    targetRepo = config.repository['bitbucket'][_s.trim(payload.repository.absolute_url,'/')];
    //console.log(targetRepo);
    if(targetRepo){  //branch, local, commands
      // console.log(payload);
      var shouldPull = _.find(payload.commits, function(commit){
        return commit.branch == targetRepo.branch;
      });

      shouldPull & exec('git pull', {
        cwd: targetRepo.local
      }, function(err, stdout, stderr) {
        if (err) {
          return res.send('deployment has been failed');
        } else {
          return res.send('ok');
          _.each(targetRepo.commands,function(command){
            exec(command, {cwd: targetRepo.local});
          });
        }
      });

    }
  }
});

app.listen(10101, config.ip || '127.0.0.1');

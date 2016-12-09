var repo = process.argv[2];
var sha = process.argv[3];
var name = process.argv[4];
var smallSha = sha.slice(0, 7);
var url = 'https://codeload.github.com/mapbox/'+repo+'/legacy.tar.gz/'+sha;

var exec = require('child_process').exec;

var path = require('path');

var nodeModules = path.join(__dirname, 'node_modules');
var dest = path.join(nodeModules, name);
var src = path.join(nodeModules, 'mapbox-geobuf-'+smallSha);

exec('curl '+url+' | tar xz -C '+nodeModules, function(err) {
  if (err) throw err;
  exec('rm -rf '+dest+' && mv '+src+' '+dest, function(err) {
    if (err) throw err;
    exec('npm install', {cwd: dest}, function(err) {
      if (err) throw err;
      console.log('downloaded and installed '+name);
    });
  });
});

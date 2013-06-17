var util = require('util'),
  stream = require('stream'),
  exec = require('child_process').exec;

util.inherits(Driver,stream);
util.inherits(Device,stream);

function Driver(opts,app) {
  var self = this;

  app.on('client::up',function(){
    self.emit('register', new Device(app));
  });

}

function Device(app) {
  var self = this;

  this._app = app;
  this.writeable = false;
  this.readable = true;
  this.V = 0;
  this.D = 8;
  this.G = 'Battery';
  this.name = 'Battery - ' + require('os').hostname();

  setInterval(function() {
    self.emitTemperature();
  }, 30000);
  this.emitTemperature();

}

Device.prototype.emitTemperature = function() {
  var self = this;
  exec('ioreg -l | grep -i LegacyBatteryInfo', function(error, stdout, stderr) {
    if (!error && !stderr) {
      var current = parseInt(stdout.match(/Current"=(\d+)/)[1], 10);
      var capacity = parseInt(stdout.match(/Capacity"=(\d+)/)[1], 10);
      self.emit('data', current / capacity * 100);
    }

  });

};

module.exports = Driver;

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
  this.D = 551;
  this.G = 'Battery';
  this.name = 'Battery - ' + require('os').hostname();

  setInterval(function() {
    self.emitValue();
  }, 30000);
  this.emitValue();

}

Device.prototype.emitValue = function() {
  var self = this;
  exec('ioreg -l | grep -i LegacyBatteryInfo', function(error, stdout, stderr) {
    if (!error && !stderr) {
      var data = stdout.replace(/=/g,':').toLowerCase();

      data = JSON.parse(data.substr(data.indexOf('{')));
      data.value = data.current / data.capacity * 100;
      data.charging = (data.flags == 7);
      data.cycleCount = data['cycle count'];

      delete(data['cycle count']);
      delete(data.flags);
      self.emit('data', data);
    }

  });

};

module.exports = Driver;

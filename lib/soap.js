/*
 * Copyright (c) 2011 Vinay Pulim <vinay@milewise.com>
 * MIT Licensed
 */

"use strict";

var Client = require('./client').Client,
  Server = require('./server').Server,
  HttpClient = require('./http'),
  security = require('./security'),
  passwordDigest = require('./utils').passwordDigest,
  open_wsdl = require('./wsdl').open_wsdl,
  WSDL = require('./wsdl').WSDL;

var WSDL = require('./wsdl').WSDL;
var _wsdlCache = {};

function _requestWSDL(url, options, callback) {
  // console.log("\n url in _requestWSDL --->",url);
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var wsdl = _wsdlCache[url];
  if (wsdl) {
    process.nextTick(function() {
      callback(null, wsdl);
    });
  }
  else {
    open_wsdl(url, options, function(err, wsdl) {
      if (err)
        return callback(err);
      else
        _wsdlCache[url] = wsdl;
      callback(null, wsdl);
    });
  }
}

function createClient(url, options, callback, endpoint) {
  // console.log("\n url in createClient --->",url);
  if (typeof options === 'function') {
    endpoint = callback;
    callback = options;
    options = {};
  }
  endpoint = options.endpoint || endpoint;
  _requestWSDL(url, options, function(err, wsdl) {
    // console.log("\nerror -->",err);
    // console.log("\nwsdl -->",wsdl);
    callback(err, wsdl && new Client(wsdl, endpoint, options));
  });
}

function listen(server, pathOrOptions, services, xml) {
  var options = {},
    path = pathOrOptions;

  if (typeof pathOrOptions === 'object') {
    options = pathOrOptions;
    path = options.path;
    services = options.services;
    xml = options.xml;
  }

  var wsdl = new WSDL(xml || services, null, options);
  return new Server(server, path, services, wsdl);
}

exports.security = security;
exports.BasicAuthSecurity = security.BasicAuthSecurity;
exports.WSSecurity = security.WSSecurity;
exports.ClientSSLSecurity = security.ClientSSLSecurity;
exports.ClientSSLSecurityPFX = security.ClientSSLSecurityPFX;
exports.BearerSecurity = security.BearerSecurity;
exports.createClient = createClient;
exports.passwordDigest = passwordDigest;
exports.listen = listen;
exports.WSDL = WSDL;

// Export Client and Server to allow customization
exports.Server = Server;
exports.Client = Client;
exports.HttpClient = HttpClient;

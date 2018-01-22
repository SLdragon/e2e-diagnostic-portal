/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(3);


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var bodyParser = __webpack_require__(4);
var cors = __webpack_require__(5);

var device = __webpack_require__(6);
var metric = __webpack_require__(9);

var app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/device', device);
app.use('/api/metric', metric);

app.listen(process.env.PORT || 3001, null, null, function () {
  console.log('listening on ' + (process.env.PORT || 3001));
});

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("cors");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var router = express.Router();
var uuid = __webpack_require__(7);
// var Util = require('../util/util');

var device = express();
router.get('/', function (req, res) {
    var connectionString = 'HostName=iot-mj-prod.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=uoTBPzhU8UeUzaiOzmuUmXa/oT1Kr2O+t8FSPUSOOFU=';
    if (!connectionString) {
        res.sendStatus(400);
    }
    var Registry = __webpack_require__(8).Registry.fromConnectionString(connectionString);
    Registry.list(function (err, deviceList) {
        if (err) {
            res.status(500).send('Could not trigger job: ' + err.message);
        } else {
            var connectedNum = 0;
            deviceList.forEach(function (device) {
                if (device.connectionState === "Connected") connectedNum++;
            });
            res.send({
                registered: deviceList.length,
                connected: connectedNum
            });
        }
    });
});

module.exports = router;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("uuid");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("azure-iothub");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var router = express.Router();
var request = __webpack_require__(10);
var node_util = __webpack_require__(11);
var config = __webpack_require__(12);
// var Util = require('../util/util');
// var apicache = require('apicache');

var startOfTimestamp = new Date(config.startTime);
var kustoQuery = 'customEvents | where name == \'E2EDIAGNOSTICS\' and timestamp >= ago(7d) and todatetime(tostring(customDimensions[\'time\'])) >= datetime(\'%s\') and todatetime(tostring(customDimensions[\'time\'])) <= datetime(\'%s\') | project customDimensions';
var restUrl = "https://api.applicationinsights.io/v1/apps/%s/query?timespan=P7D&query=%s";
// var e2ePath = 'customEvents/E2EDIAGNOSTICS';
// var kustoPath = 'https://analytics.applicationinsights.io%s/components/%s';
/* GET home page. */

// router.get('/kusto', function(req, res) {
//     res.redirect(node_util.format(kustoPath,process.env.RESOURCE_GROUP_NAME,process.env.APPLICATION_INSIGHTS_NAME));
// });

router.get('/', function (req, res) {
  var appId = '28192abf-e335-4044-ae29-47bbfac72ddd'; //Util.getAppId();
  if (!appId) {
    res.status(500).send("App id missing");
  }
  var start = parseInt(req.query.start);
  var end = parseInt(req.query.end);
  if (start == undefined || end == undefined) {
    res.status(500).send("start or end is not provided");
  }
  var key = 'q5170hcg0hfz13zsngxxcykrezfvpvosrj7pzwll';
  var startDate = new Date(startOfTimestamp.getTime());
  var endDate = new Date(startOfTimestamp.getTime());
  startDate.setSeconds(startDate.getSeconds() + start);
  endDate.setSeconds(endDate.getSeconds() + end);
  request(node_util.format(restUrl, appId, encodeURIComponent(node_util.format(kustoQuery, startDate.toISOString(), endDate.toISOString()))), {
    headers: {
      "x-api-key": key
    }
  }, function (err, response, body) {
    if (err) {
      res.status(500).send(err.message);
    }
    console.log(body);
    try {
      body = JSON.parse(body);
      var result = {};
      // result.count = body['@odata.count'];
      result.value = body.tables[0].rows.length === 0 ? [] : body.tables[0].rows.map(function (row) {
        return JSON.parse(row[0]);
      });
      res.json(result);
    } catch (e) {
      res.json({
        value: [],
        error: e.message
      });
    }
  });

  // var result = {};
  // var counter = 5;
  // request(node_util.format(restUrl, appId, d2cPath, param,'avg,count,max'), {
  //     headers: {
  //         "x-api-key": keys[0]
  //     }
  // }, apiCallback.bind(this, resolve, reject, 'd2c_success',d2cPath,'avg,count,max'));

  // request(node_util.format(restUrl, appId, saPath, param,'avg,count,max'), {
  //     headers: {
  //         "x-api-key": keys[1]
  //     }
  // }, apiCallback.bind(this, resolve, reject, 'sa_success',saPath,'avg,count,max'));

  // request(node_util.format(restUrl, appId, funcPath, param,'avg,count,max'), {
  //     headers: {
  //         "x-api-key": keys[2]
  //     }
  // }, apiCallback.bind(this, resolve, reject, 'func_success',funcPath,'avg,count,max'));

  // request(node_util.format(restUrl, appId, saFailurePath, param,'sum'), {
  //     headers: {
  //         "x-api-key": keys[3]
  //     }
  // }, apiCallback.bind(this, resolve, reject, 'sa_failure_count',saFailurePath,'sum'));

  // request(node_util.format(restUrl, appId, funcFailurePath, param,'sum'), {
  //     headers: {
  //         "x-api-key": keys[4]
  //     }
  // }, apiCallback.bind(this, resolve, reject, 'func_failure_count',funcFailurePath,'sum'));

  //   function apiCallback(resolve, reject, key, path, type, error, response, body) {
  //     console.log('callback called');
  //     body = JSON.parse(body);
  //     if (error) {
  //       reject(error);
  //     } else if (response.statusCode != 200) {
  //       reject("Invalid status code " + response.statusCode);
  //     } else {
  //       var types = type.split(",");
  //       result[key] = {};
  //       for (var i in types) {
  //         result[key][types[i]] = body.value[path][types[i]];
  //       }
  //     }
  //     counter--;
  //     if (counter == 0) {
  //       resolve(result);
  //     }
  //   }
  // }).then((result) => {
  //   res.send(result);
  // }).catch((error) => {
  //   res.status(500).send(error);
  // });
});

module.exports = router;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("request");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    api: 'https://e2e-portal-api.azurewebsites.net',
    startTime: '2018-01-19T07:17:00Z'
};

/***/ })
/******/ ]);
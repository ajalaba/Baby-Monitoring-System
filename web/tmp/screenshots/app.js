var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": " test all the error messages in regitseration page|Protractor Baby Monitoring System register App testing",
        "passed": true,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://code.jquery.com/jquery-3.5.1.min.js 1 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1601518941587,
                "type": ""
            }
        ],
        "screenShotFile": "00050048-005d-0003-0075-005b00970097.png",
        "timestamp": 1601518939359,
        "duration": 8518
    },
    {
        "description": " test all the register button diabled features when username is empty, password is empty, confirm is empty or password!=confirm or password is less than 8 characters.|Protractor Baby Monitoring System register App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: Angular could not be found on the page http://localhost:3000/registration. If this is not an Angular application, you may need to turn off waiting for Angular.\n                          Please see \n                          https://github.com/angular/protractor/blob/master/docs/timeouts.md#waiting-for-angular-on-page-load"
        ],
        "trace": [
            "Error: Angular could not be found on the page http://localhost:3000/registration. If this is not an Angular application, you may need to turn off waiting for Angular.\n                          Please see \n                          https://github.com/angular/protractor/blob/master/docs/timeouts.md#waiting-for-angular-on-page-load\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:718:27\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" test all the register button diabled features when username is empty, password is empty, confirm is empty or password!=confirm or password is less than 8 characters.\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:27:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:1:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "00a400d6-0015-004a-0040-007600a80069.png",
        "timestamp": 1601518948260,
        "duration": 10594
    },
    {
        "description": "Trying to Register an existing user to the application|Protractor Baby Monitoring System register App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: Cannot read property 'ver' of null"
        ],
        "trace": [
            "TypeError: Cannot read property 'ver' of null\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:714:56\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"Trying to Register an existing user to the application\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:70:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:1:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518959102,
        "duration": 8642
    },
    {
        "description": "should have a title|Protractor Baby Monitoring System login App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.manage().window().maximize()\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Window.maximize (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1686:25)\n    at UserContext.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:90:35)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25\nFrom: Task: Run it(\"should have a title\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:89:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:88:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518967820,
        "duration": 19
    },
    {
        "description": "should redirect any page to login |Protractor Baby Monitoring System login App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"should redirect any page to login \") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:95:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:88:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968028,
        "duration": 15
    },
    {
        "description": "Login button should be disabled if username and Password field are empty |Protractor Baby Monitoring System login App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"Login button should be disabled if username and Password field are empty \") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:102:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:88:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968072,
        "duration": 18
    },
    {
        "description": " Not Login to application and also will check error message|Protractor Baby Monitoring System login App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" Not Login to application and also will check error message\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:115:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:88:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968113,
        "duration": 12
    },
    {
        "description": "Login to application|Protractor Baby Monitoring System login App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"Login to application\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:129:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:88:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968143,
        "duration": 10
    },
    {
        "description": "Username display feature|Protractor Baby Monitoring System login App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"Username display feature\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:140:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:88:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968168,
        "duration": 14
    },
    {
        "description": "Testing Logout|Protractor Baby Monitoring System login App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"Testing Logout\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:154:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:88:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968197,
        "duration": 11
    },
    {
        "description": "redirect to register-device page error free |Protractor Baby Monitoring System register device App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"redirect to register-device page error free \") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:172:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:171:3)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968223,
        "duration": 13
    },
    {
        "description": " Save button should not work untill device name and user name is filled and it should work after|Protractor Baby Monitoring System register device App testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" Save button should not work untill device name and user name is filled and it should work after\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:186:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:171:3)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968254,
        "duration": 24
    },
    {
        "description": "redirect to send-command page error free |Protractor Baby Monitoring System send command page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"redirect to send-command page error free \") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:215:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:214:3)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968296,
        "duration": 40
    },
    {
        "description": " Send Command button should not work untill device name and command is filled and should ouput Command Sent message after successfully save button click|Protractor Baby Monitoring System send command page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.manage().window().maximize()\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Window.maximize (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1686:25)\n    at UserContext.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:230:35)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25\nFrom: Task: Run it(\" Send Command button should not work untill device name and command is filled and should ouput Command Sent message after successfully save button click\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:229:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:214:3)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968351,
        "duration": 18
    },
    {
        "description": "redirect to notification page error free |Protractor Baby Monitoring System Notification page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"redirect to notification page error free \") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:258:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:257:3)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968411,
        "duration": 22
    },
    {
        "description": " Testing notification close button|Protractor Baby Monitoring System Notification page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" Testing notification close button\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:272:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:257:3)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968457,
        "duration": 16
    },
    {
        "description": "redirect to device-list page error free |Protractor Baby Monitoring System device-list page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\"redirect to device-list page error free \") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:308:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:307:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968522,
        "duration": 26
    },
    {
        "description": " Testing sound button|Protractor Baby Monitoring System device-list page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" Testing sound button\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:323:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:307:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968578,
        "duration": 14
    },
    {
        "description": " Testing temp button|Protractor Baby Monitoring System device-list page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" Testing temp button\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:345:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:307:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968652,
        "duration": 21
    },
    {
        "description": " Testing infrared button|Protractor Baby Monitoring System device-list page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" Testing infrared button\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:361:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:307:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968730,
        "duration": 19
    },
    {
        "description": " Testing accelerometer button|Protractor Baby Monitoring System device-list page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" Testing accelerometer button\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:377:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:307:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968779,
        "duration": 17
    },
    {
        "description": " Testing humid button|Protractor Baby Monitoring System device-list page testing",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 81104,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.121"
        },
        "message": [
            "Failed: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: chrome not reachable\n  (Session info: chrome=85.0.4183.121)\n  (Driver info: chromedriver=85.0.4183.87 (cd6713ebf92fa1cacc0f1a598df280093af0c5d7-refs/branch-heads/4183@{#1689}),platform=Linux 5.4.0-48-generic x86_64)\n    at Object.checkLegacyResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/built/browser.js:673:32\n    at ManagedPromise.invokeCallback_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\nFrom: Task: Run it(\" Testing humid button\") in control flow\n    at UserContext.<anonymous> (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:393:5)\n    at addSpecsToSuite (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/deol/.nvm/versions/node/v14.4.0/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/deol/code/SIT209/groupproject/web/test-spec.js:307:1)\n    at Module._compile (internal/modules/cjs/loader.js:1200:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)\n    at Module.load (internal/modules/cjs/loader.js:1049:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:937:14)"
        ],
        "browserLogs": [],
        "timestamp": 1601518968831,
        "duration": 24
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });

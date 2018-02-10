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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var MonoPlatform_1 = __webpack_require__(5);
exports.platform = MonoPlatform_1.monoPlatform;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var InternalRegisteredFunction_1 = __webpack_require__(6);
var registeredFunctions = {};
function registerFunction(identifier, implementation) {
    if (InternalRegisteredFunction_1.internalRegisteredFunctions.hasOwnProperty(identifier)) {
        throw new Error("The function identifier '" + identifier + "' is reserved and cannot be registered.");
    }
    if (registeredFunctions.hasOwnProperty(identifier)) {
        throw new Error("A function with the identifier '" + identifier + "' has already been registered.");
    }
    registeredFunctions[identifier] = implementation;
}
exports.registerFunction = registerFunction;
function getRegisteredFunction(identifier) {
    // By prioritising the internal ones, we ensure you can't override them
    var result = InternalRegisteredFunction_1.internalRegisteredFunctions[identifier] || registeredFunctions[identifier];
    if (result) {
        return result;
    }
    else {
        throw new Error("Could not find registered function with name '" + identifier + "'.");
    }
}
exports.getRegisteredFunction = getRegisteredFunction;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function getAssemblyNameFromUrl(url) {
    var lastSegment = url.substring(url.lastIndexOf('/') + 1);
    var queryStringStartPos = lastSegment.indexOf('?');
    var filename = queryStringStartPos < 0 ? lastSegment : lastSegment.substring(0, queryStringStartPos);
    return filename.replace(/\.dll$/, '');
}
exports.getAssemblyNameFromUrl = getAssemblyNameFromUrl;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Environment_1 = __webpack_require__(0);
var RenderBatch_1 = __webpack_require__(8);
var BrowserRenderer_1 = __webpack_require__(9);
var browserRenderers = {};
function attachComponentToElement(browserRendererId, elementSelector, componentId) {
    var elementSelectorJs = Environment_1.platform.toJavaScriptString(elementSelector);
    var element = document.querySelector(elementSelectorJs);
    if (!element) {
        throw new Error("Could not find any element matching selector '" + elementSelectorJs + "'.");
    }
    var browserRenderer = browserRenderers[browserRendererId];
    if (!browserRenderer) {
        browserRenderer = browserRenderers[browserRendererId] = new BrowserRenderer_1.BrowserRenderer(browserRendererId);
    }
    browserRenderer.attachComponentToElement(componentId, element);
    clearElement(element);
}
exports.attachComponentToElement = attachComponentToElement;
function renderBatch(browserRendererId, batch) {
    var browserRenderer = browserRenderers[browserRendererId];
    if (!browserRenderer) {
        throw new Error("There is no browser renderer with ID " + browserRendererId + ".");
    }
    var updatedComponents = RenderBatch_1.renderBatch.updatedComponents(batch);
    var updatedComponentsLength = RenderBatch_1.arrayRange.count(updatedComponents);
    var updatedComponentsArray = RenderBatch_1.arrayRange.array(updatedComponents);
    var referenceFramesStruct = RenderBatch_1.renderBatch.referenceFrames(batch);
    var referenceFrames = RenderBatch_1.arrayRange.array(referenceFramesStruct);
    for (var i = 0; i < updatedComponentsLength; i++) {
        var diff = Environment_1.platform.getArrayEntryPtr(updatedComponentsArray, i, RenderBatch_1.renderTreeDiffStructLength);
        var componentId = RenderBatch_1.renderTreeDiff.componentId(diff);
        var editsArraySegment = RenderBatch_1.renderTreeDiff.edits(diff);
        var edits = RenderBatch_1.arraySegment.array(editsArraySegment);
        var editsOffset = RenderBatch_1.arraySegment.offset(editsArraySegment);
        var editsLength = RenderBatch_1.arraySegment.count(editsArraySegment);
        browserRenderer.updateComponent(componentId, edits, editsOffset, editsLength, referenceFrames);
    }
    var disposedComponentIds = RenderBatch_1.renderBatch.disposedComponentIds(batch);
    var disposedComponentIdsLength = RenderBatch_1.arrayRange.count(disposedComponentIds);
    var disposedComponentIdsArray = RenderBatch_1.arrayRange.array(disposedComponentIds);
    for (var i = 0; i < disposedComponentIdsLength; i++) {
        var componentIdPtr = Environment_1.platform.getArrayEntryPtr(disposedComponentIdsArray, i, 4);
        var componentId = Environment_1.platform.readInt32Field(componentIdPtr);
        browserRenderer.disposeComponent(componentId);
    }
}
exports.renderBatch = renderBatch;
function clearElement(element) {
    var childNode;
    while (childNode = element.firstChild) {
        element.removeChild(childNode);
    }
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Environment_1 = __webpack_require__(0);
var DotNet_1 = __webpack_require__(2);
__webpack_require__(3);
__webpack_require__(12);
function boot() {
    return __awaiter(this, void 0, void 0, function () {
        var allScriptElems, thisScriptElem, entryPoint, entryPointAssemblyName, referenceAssembliesCommaSeparated, referenceAssemblies, loadAssemblyUrls, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allScriptElems = document.getElementsByTagName('script');
                    thisScriptElem = allScriptElems[allScriptElems.length - 1];
                    entryPoint = thisScriptElem.getAttribute('main');
                    if (!entryPoint) {
                        throw new Error('Missing "main" attribute on Blazor script tag.');
                    }
                    entryPointAssemblyName = DotNet_1.getAssemblyNameFromUrl(entryPoint);
                    referenceAssembliesCommaSeparated = thisScriptElem.getAttribute('references') || '';
                    referenceAssemblies = referenceAssembliesCommaSeparated
                        .split(',')
                        .map(function (s) { return s.trim(); })
                        .filter(function (s) { return !!s; });
                    loadAssemblyUrls = [entryPoint]
                        .concat(referenceAssemblies)
                        .map(function (filename) { return "/_framework/_bin/" + filename; });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Environment_1.platform.start(loadAssemblyUrls)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    ex_1 = _a.sent();
                    throw new Error("Failed to start platform. Reason: " + ex_1);
                case 4:
                    // Start up the application
                    Environment_1.platform.callEntryPoint(entryPointAssemblyName, []);
                    return [2 /*return*/];
            }
        });
    });
}
boot();


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DotNet_1 = __webpack_require__(2);
var RegisteredFunction_1 = __webpack_require__(1);
var assembly_load;
var find_class;
var find_method;
var invoke_method;
var mono_string_get_utf8;
var mono_string;
exports.monoPlatform = {
    start: function start(loadAssemblyUrls) {
        return new Promise(function (resolve, reject) {
            // mono.js assumes the existence of this
            window['Browser'] = {
                init: function () { },
                asyncLoad: asyncLoad
            };
            // Emscripten works by expecting the module config to be a global
            window['Module'] = createEmscriptenModuleInstance(loadAssemblyUrls, resolve, reject);
            addScriptTagsToDocument();
        });
    },
    findMethod: function findMethod(assemblyName, namespace, className, methodName) {
        // TODO: Cache the assembly_load outputs?
        var assemblyHandle = assembly_load(assemblyName);
        if (!assemblyHandle) {
            throw new Error("Could not find assembly \"" + assemblyName + "\"");
        }
        var typeHandle = find_class(assemblyHandle, namespace, className);
        if (!typeHandle) {
            throw new Error("Could not find type \"" + className + "'\" in namespace \"" + namespace + "\" in assembly \"" + assemblyName + "\"");
        }
        var methodHandle = find_method(typeHandle, methodName, -1);
        if (!methodHandle) {
            throw new Error("Could not find method \"" + methodName + "\" on type \"" + namespace + "." + className + "\"");
        }
        return methodHandle;
    },
    callEntryPoint: function callEntryPoint(assemblyName, args) {
        // TODO: There should be a proper way of running whatever counts as the entrypoint without
        // having to specify what method it is, but I haven't found it. The code here assumes
        // that the entry point is "<assemblyname>.Program.Main" (i.e., namespace == assembly name).
        var entryPointMethod = exports.monoPlatform.findMethod(assemblyName, assemblyName, 'Program', 'Main');
        exports.monoPlatform.callMethod(entryPointMethod, null, args);
    },
    callMethod: function callMethod(method, target, args) {
        if (args.length > 4) {
            // Hopefully this restriction can be eased soon, but for now make it clear what's going on
            throw new Error("Currently, MonoPlatform supports passing a maximum of 4 arguments from JS to .NET. You tried to pass " + args.length + ".");
        }
        var stack = Module.Runtime.stackSave();
        try {
            var argsBuffer = Module.Runtime.stackAlloc(args.length);
            var exceptionFlagManagedInt = Module.Runtime.stackAlloc(4);
            for (var i = 0; i < args.length; ++i) {
                Module.setValue(argsBuffer + i * 4, args[i], 'i32');
            }
            Module.setValue(exceptionFlagManagedInt, 0, 'i32');
            var res = invoke_method(method, target, argsBuffer, exceptionFlagManagedInt);
            if (Module.getValue(exceptionFlagManagedInt, 'i32') !== 0) {
                // If the exception flag is set, the returned value is exception.ToString()
                throw new Error(exports.monoPlatform.toJavaScriptString(res));
            }
            return res;
        }
        finally {
            Module.Runtime.stackRestore(stack);
        }
    },
    toJavaScriptString: function toJavaScriptString(managedString) {
        // Comments from original Mono sample:
        //FIXME this is wastefull, we could remove the temp malloc by going the UTF16 route
        //FIXME this is unsafe, cuz raw objects could be GC'd.
        var utf8 = mono_string_get_utf8(managedString);
        var res = Module.UTF8ToString(utf8);
        Module._free(utf8);
        return res;
    },
    toDotNetString: function toDotNetString(jsString) {
        return mono_string(jsString);
    },
    getArrayLength: function getArrayLength(array) {
        return Module.getValue(getArrayDataPointer(array), 'i32');
    },
    getArrayEntryPtr: function getArrayEntryPtr(array, index, itemSize) {
        // First byte is array length, followed by entries
        var address = getArrayDataPointer(array) + 4 + index * itemSize;
        return address;
    },
    getObjectFieldsBaseAddress: function getObjectFieldsBaseAddress(referenceTypedObject) {
        // The first two int32 values are internal Mono data
        return (referenceTypedObject + 8);
    },
    readInt32Field: function readHeapInt32(baseAddress, fieldOffset) {
        return Module.getValue(baseAddress + (fieldOffset || 0), 'i32');
    },
    readObjectField: function readHeapObject(baseAddress, fieldOffset) {
        return Module.getValue(baseAddress + (fieldOffset || 0), 'i32');
    },
    readStringField: function readHeapObject(baseAddress, fieldOffset) {
        var fieldValue = Module.getValue(baseAddress + (fieldOffset || 0), 'i32');
        return fieldValue === 0 ? null : exports.monoPlatform.toJavaScriptString(fieldValue);
    },
    readStructField: function readStructField(baseAddress, fieldOffset) {
        return (baseAddress + (fieldOffset || 0));
    },
};
// Bypass normal type checking to add this extra function. It's only intended to be called from
// the JS code in Mono's driver.c. It's never intended to be called from TypeScript.
exports.monoPlatform.monoGetRegisteredFunction = RegisteredFunction_1.getRegisteredFunction;
function addScriptTagsToDocument() {
    // Load either the wasm or asm.js version of the Mono runtime
    var browserSupportsNativeWebAssembly = typeof WebAssembly !== 'undefined' && WebAssembly.validate;
    var monoRuntimeUrlBase = '/_framework/' + (browserSupportsNativeWebAssembly ? 'wasm' : 'asmjs');
    var monoRuntimeScriptUrl = monoRuntimeUrlBase + "/mono.js";
    if (!browserSupportsNativeWebAssembly) {
        // In the asmjs case, the initial memory structure is in a separate file we need to download
        var meminitXHR = Module['memoryInitializerRequest'] = new XMLHttpRequest();
        meminitXHR.open('GET', monoRuntimeUrlBase + "/mono.js.mem");
        meminitXHR.responseType = 'arraybuffer';
        meminitXHR.send(null);
    }
    document.write("<script defer src=\"" + monoRuntimeScriptUrl + "\"></script>");
}
function createEmscriptenModuleInstance(loadAssemblyUrls, onReady, onError) {
    var module = {};
    module.print = function (line) { return console.log("WASM: " + line); };
    module.printErr = function (line) { return console.error("WASM: " + line); };
    module.wasmBinaryFile = '/_framework/wasm/mono.wasm';
    module.asmjsCodeFile = '/_framework/asmjs/mono.asm.js';
    module.preRun = [];
    module.postRun = [];
    module.preloadPlugins = [];
    module.preRun.push(function () {
        // By now, emscripten should be initialised enough that we can capture these methods for later use
        assembly_load = Module.cwrap('mono_wasm_assembly_load', 'number', ['string']);
        find_class = Module.cwrap('mono_wasm_assembly_find_class', 'number', ['number', 'string', 'string']);
        find_method = Module.cwrap('mono_wasm_assembly_find_method', 'number', ['number', 'string', 'number']);
        invoke_method = Module.cwrap('mono_wasm_invoke_method', 'number', ['number', 'number', 'number']);
        mono_string_get_utf8 = Module.cwrap('mono_wasm_string_get_utf8', 'number', ['number']);
        mono_string = Module.cwrap('mono_wasm_string_from_js', 'number', ['string']);
        Module.FS_createPath('/', 'appBinDir', true, true);
        loadAssemblyUrls.forEach(function (url) {
            return FS.createPreloadedFile('appBinDir', DotNet_1.getAssemblyNameFromUrl(url) + ".dll", url, true, false, undefined, onError);
        });
    });
    module.postRun.push(function () {
        var load_runtime = Module.cwrap('mono_wasm_load_runtime', null, ['string']);
        load_runtime('appBinDir');
        onReady();
    });
    return module;
}
function asyncLoad(url, onload, onerror) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', url, /* async: */ true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function xhr_onload() {
        if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
            var asm = new Uint8Array(xhr.response);
            onload(asm);
        }
        else {
            onerror(xhr);
        }
    };
    xhr.onerror = onerror;
    xhr.send(null);
}
function getArrayDataPointer(array) {
    return array + 12; // First byte from here is length, then following bytes are entries
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var InvokeWithJsonMarshalling_1 = __webpack_require__(7);
var Renderer_1 = __webpack_require__(3);
/**
 * The definitive list of internal functions invokable from .NET code.
 * These function names are treated as 'reserved' and cannot be passed to registerFunction.
 */
exports.internalRegisteredFunctions = {
    attachComponentToElement: Renderer_1.attachComponentToElement,
    invokeWithJsonMarshalling: InvokeWithJsonMarshalling_1.invokeWithJsonMarshalling,
    renderBatch: Renderer_1.renderBatch,
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Environment_1 = __webpack_require__(0);
var RegisteredFunction_1 = __webpack_require__(1);
function invokeWithJsonMarshalling(identifier) {
    var argsJson = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        argsJson[_i - 1] = arguments[_i];
    }
    var identifierJsString = Environment_1.platform.toJavaScriptString(identifier);
    var funcInstance = RegisteredFunction_1.getRegisteredFunction(identifierJsString);
    var args = argsJson.map(function (json) { return JSON.parse(Environment_1.platform.toJavaScriptString(json)); });
    var result = funcInstance.apply(null, args);
    if (result !== null && result !== undefined) {
        var resultJson = JSON.stringify(result);
        return Environment_1.platform.toDotNetString(resultJson);
    }
    else {
        return null;
    }
}
exports.invokeWithJsonMarshalling = invokeWithJsonMarshalling;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Environment_1 = __webpack_require__(0);
// Keep in sync with the structs in .NET code
exports.renderBatch = {
    updatedComponents: function (obj) { return Environment_1.platform.readStructField(obj, 0); },
    referenceFrames: function (obj) { return Environment_1.platform.readStructField(obj, arrayRangeStructLength); },
    disposedComponentIds: function (obj) { return Environment_1.platform.readStructField(obj, arrayRangeStructLength + arrayRangeStructLength); },
};
var arrayRangeStructLength = 8;
exports.arrayRange = {
    array: function (obj) { return Environment_1.platform.readObjectField(obj, 0); },
    count: function (obj) { return Environment_1.platform.readInt32Field(obj, 4); },
};
var arraySegmentStructLength = 12;
exports.arraySegment = {
    array: function (obj) { return Environment_1.platform.readObjectField(obj, 0); },
    offset: function (obj) { return Environment_1.platform.readInt32Field(obj, 4); },
    count: function (obj) { return Environment_1.platform.readInt32Field(obj, 8); },
};
exports.renderTreeDiffStructLength = 4 + arraySegmentStructLength;
exports.renderTreeDiff = {
    componentId: function (obj) { return Environment_1.platform.readInt32Field(obj, 0); },
    edits: function (obj) { return Environment_1.platform.readStructField(obj, 4); },
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var RenderTreeEdit_1 = __webpack_require__(10);
var RenderTreeFrame_1 = __webpack_require__(11);
var Environment_1 = __webpack_require__(0);
var raiseEventMethod;
var renderComponentMethod;
var BrowserRenderer = /** @class */ (function () {
    function BrowserRenderer(browserRendererId) {
        this.browserRendererId = browserRendererId;
        this.childComponentLocations = {};
    }
    BrowserRenderer.prototype.attachComponentToElement = function (componentId, element) {
        this.childComponentLocations[componentId] = element;
    };
    BrowserRenderer.prototype.updateComponent = function (componentId, edits, editsOffset, editsLength, referenceFrames) {
        var element = this.childComponentLocations[componentId];
        if (!element) {
            throw new Error("No element is currently associated with component " + componentId);
        }
        this.applyEdits(componentId, element, 0, edits, editsOffset, editsLength, referenceFrames);
    };
    BrowserRenderer.prototype.disposeComponent = function (componentId) {
        delete this.childComponentLocations[componentId];
    };
    BrowserRenderer.prototype.applyEdits = function (componentId, parent, childIndex, edits, editsOffset, editsLength, referenceFrames) {
        var currentDepth = 0;
        var childIndexAtCurrentDepth = childIndex;
        var maxEditIndexExcl = editsOffset + editsLength;
        for (var editIndex = editsOffset; editIndex < maxEditIndexExcl; editIndex++) {
            var edit = RenderTreeEdit_1.getRenderTreeEditPtr(edits, editIndex);
            var editType = RenderTreeEdit_1.renderTreeEdit.type(edit);
            switch (editType) {
                case RenderTreeEdit_1.EditType.prependFrame: {
                    var frameIndex = RenderTreeEdit_1.renderTreeEdit.newTreeIndex(edit);
                    var frame = RenderTreeFrame_1.getTreeFramePtr(referenceFrames, frameIndex);
                    var siblingIndex = RenderTreeEdit_1.renderTreeEdit.siblingIndex(edit);
                    this.insertFrame(componentId, parent, childIndexAtCurrentDepth + siblingIndex, referenceFrames, frame, frameIndex);
                    break;
                }
                case RenderTreeEdit_1.EditType.removeFrame: {
                    var siblingIndex = RenderTreeEdit_1.renderTreeEdit.siblingIndex(edit);
                    removeNodeFromDOM(parent, childIndexAtCurrentDepth + siblingIndex);
                    break;
                }
                case RenderTreeEdit_1.EditType.setAttribute: {
                    var frameIndex = RenderTreeEdit_1.renderTreeEdit.newTreeIndex(edit);
                    var frame = RenderTreeFrame_1.getTreeFramePtr(referenceFrames, frameIndex);
                    var siblingIndex = RenderTreeEdit_1.renderTreeEdit.siblingIndex(edit);
                    var element = parent.childNodes[childIndexAtCurrentDepth + siblingIndex];
                    this.applyAttribute(componentId, element, frame);
                    break;
                }
                case RenderTreeEdit_1.EditType.removeAttribute: {
                    var siblingIndex = RenderTreeEdit_1.renderTreeEdit.siblingIndex(edit);
                    removeAttributeFromDOM(parent, childIndexAtCurrentDepth + siblingIndex, RenderTreeEdit_1.renderTreeEdit.removedAttributeName(edit));
                    break;
                }
                case RenderTreeEdit_1.EditType.updateText: {
                    var frameIndex = RenderTreeEdit_1.renderTreeEdit.newTreeIndex(edit);
                    var frame = RenderTreeFrame_1.getTreeFramePtr(referenceFrames, frameIndex);
                    var siblingIndex = RenderTreeEdit_1.renderTreeEdit.siblingIndex(edit);
                    var domTextNode = parent.childNodes[childIndexAtCurrentDepth + siblingIndex];
                    domTextNode.textContent = RenderTreeFrame_1.renderTreeFrame.textContent(frame);
                    break;
                }
                case RenderTreeEdit_1.EditType.stepIn: {
                    var siblingIndex = RenderTreeEdit_1.renderTreeEdit.siblingIndex(edit);
                    parent = parent.childNodes[childIndexAtCurrentDepth + siblingIndex];
                    currentDepth++;
                    childIndexAtCurrentDepth = 0;
                    break;
                }
                case RenderTreeEdit_1.EditType.stepOut: {
                    parent = parent.parentElement;
                    currentDepth--;
                    childIndexAtCurrentDepth = currentDepth === 0 ? childIndex : 0; // The childIndex is only ever nonzero at zero depth
                    break;
                }
                default: {
                    var unknownType = editType; // Compile-time verification that the switch was exhaustive
                    throw new Error("Unknown edit type: " + unknownType);
                }
            }
        }
    };
    BrowserRenderer.prototype.insertFrame = function (componentId, parent, childIndex, frames, frame, frameIndex) {
        var frameType = RenderTreeFrame_1.renderTreeFrame.frameType(frame);
        switch (frameType) {
            case RenderTreeFrame_1.FrameType.element:
                this.insertElement(componentId, parent, childIndex, frames, frame, frameIndex);
                break;
            case RenderTreeFrame_1.FrameType.text:
                this.insertText(parent, childIndex, frame);
                break;
            case RenderTreeFrame_1.FrameType.attribute:
                throw new Error('Attribute frames should only be present as leading children of element frames.');
            case RenderTreeFrame_1.FrameType.component:
                this.insertComponent(parent, childIndex, frame);
                break;
            default:
                var unknownType = frameType; // Compile-time verification that the switch was exhaustive
                throw new Error("Unknown frame type: " + unknownType);
        }
    };
    BrowserRenderer.prototype.insertElement = function (componentId, parent, childIndex, frames, frame, frameIndex) {
        var tagName = RenderTreeFrame_1.renderTreeFrame.elementName(frame);
        var newDomElement = document.createElement(tagName);
        insertNodeIntoDOM(newDomElement, parent, childIndex);
        // Apply attributes
        var descendantsEndIndexExcl = frameIndex + RenderTreeFrame_1.renderTreeFrame.subtreeLength(frame);
        for (var descendantIndex = frameIndex + 1; descendantIndex < descendantsEndIndexExcl; descendantIndex++) {
            var descendantFrame = RenderTreeFrame_1.getTreeFramePtr(frames, descendantIndex);
            if (RenderTreeFrame_1.renderTreeFrame.frameType(descendantFrame) === RenderTreeFrame_1.FrameType.attribute) {
                this.applyAttribute(componentId, newDomElement, descendantFrame);
            }
            else {
                // As soon as we see a non-attribute child, all the subsequent child frames are
                // not attributes, so bail out and insert the remnants recursively
                this.insertFrameRange(componentId, newDomElement, 0, frames, descendantIndex, descendantsEndIndexExcl);
                break;
            }
        }
    };
    BrowserRenderer.prototype.insertComponent = function (parent, childIndex, frame) {
        // Currently, to support O(1) lookups from render tree frames to DOM nodes, we rely on
        // each child component existing as a single top-level element in the DOM. To guarantee
        // that, we wrap child components in these 'blazor-component' wrappers.
        // To improve on this in the future:
        // - If we can statically detect that a given component always produces a single top-level
        //   element anyway, then don't wrap it in a further nonstandard element
        // - If we really want to support child components producing multiple top-level frames and
        //   not being wrapped in a container at all, then every time a component is refreshed in
        //   the DOM, we could update an array on the parent element that specifies how many DOM
        //   nodes correspond to each of its render tree frames. Then when that parent wants to
        //   locate the first DOM node for a render tree frame, it can sum all the frame counts for
        //   all the preceding render trees frames. It's O(N), but where N is the number of siblings
        //   (counting child components as a single item), so N will rarely if ever be large.
        //   We could even keep track of whether all the child components happen to have exactly 1
        //   top level frames, and in that case, there's no need to sum as we can do direct lookups.
        var containerElement = document.createElement('blazor-component');
        insertNodeIntoDOM(containerElement, parent, childIndex);
        // All we have to do is associate the child component ID with its location. We don't actually
        // do any rendering here, because the diff for the child will appear later in the render batch.
        var childComponentId = RenderTreeFrame_1.renderTreeFrame.componentId(frame);
        this.attachComponentToElement(childComponentId, containerElement);
    };
    BrowserRenderer.prototype.insertText = function (parent, childIndex, textFrame) {
        var textContent = RenderTreeFrame_1.renderTreeFrame.textContent(textFrame);
        var newDomTextNode = document.createTextNode(textContent);
        insertNodeIntoDOM(newDomTextNode, parent, childIndex);
    };
    BrowserRenderer.prototype.applyAttribute = function (componentId, toDomElement, attributeFrame) {
        var attributeName = RenderTreeFrame_1.renderTreeFrame.attributeName(attributeFrame);
        var browserRendererId = this.browserRendererId;
        var eventHandlerId = RenderTreeFrame_1.renderTreeFrame.attributeEventHandlerId(attributeFrame);
        // TODO: Instead of applying separate event listeners to each DOM element, use event delegation
        // and remove all the _blazor*Listener hacks
        switch (attributeName) {
            case 'onclick': {
                toDomElement.removeEventListener('click', toDomElement['_blazorClickListener']);
                var listener = function () { return raiseEvent(browserRendererId, componentId, eventHandlerId, 'mouse', { Type: 'click' }); };
                toDomElement['_blazorClickListener'] = listener;
                toDomElement.addEventListener('click', listener);
                break;
            }
            case 'onkeypress': {
                toDomElement.removeEventListener('keypress', toDomElement['_blazorKeypressListener']);
                var listener = function (evt) {
                    // This does not account for special keys nor cross-browser differences. So far it's
                    // just to establish that we can pass parameters when raising events.
                    // We use C#-style PascalCase on the eventInfo to simplify deserialization, but this could
                    // change if we introduced a richer JSON library on the .NET side.
                    raiseEvent(browserRendererId, componentId, eventHandlerId, 'keyboard', { Type: evt.type, Key: evt.key });
                };
                toDomElement['_blazorKeypressListener'] = listener;
                toDomElement.addEventListener('keypress', listener);
                break;
            }
            default:
                // Treat as a regular string-valued attribute
                toDomElement.setAttribute(attributeName, RenderTreeFrame_1.renderTreeFrame.attributeValue(attributeFrame));
                break;
        }
    };
    BrowserRenderer.prototype.insertFrameRange = function (componentId, parent, childIndex, frames, startIndex, endIndexExcl) {
        for (var index = startIndex; index < endIndexExcl; index++) {
            var frame = RenderTreeFrame_1.getTreeFramePtr(frames, index);
            this.insertFrame(componentId, parent, childIndex, frames, frame, index);
            childIndex++;
            // Skip over any descendants, since they are already dealt with recursively
            var subtreeLength = RenderTreeFrame_1.renderTreeFrame.subtreeLength(frame);
            if (subtreeLength > 1) {
                index += subtreeLength - 1;
            }
        }
    };
    return BrowserRenderer;
}());
exports.BrowserRenderer = BrowserRenderer;
function insertNodeIntoDOM(node, parent, childIndex) {
    if (childIndex >= parent.childNodes.length) {
        parent.appendChild(node);
    }
    else {
        parent.insertBefore(node, parent.childNodes[childIndex]);
    }
}
function removeNodeFromDOM(parent, childIndex) {
    parent.removeChild(parent.childNodes[childIndex]);
}
function removeAttributeFromDOM(parent, childIndex, attributeName) {
    var element = parent.childNodes[childIndex];
    element.removeAttribute(attributeName);
}
function raiseEvent(browserRendererId, componentId, eventHandlerId, eventInfoType, eventInfo) {
    if (!raiseEventMethod) {
        raiseEventMethod = Environment_1.platform.findMethod('Microsoft.AspNetCore.Blazor.Browser', 'Microsoft.AspNetCore.Blazor.Browser.Rendering', 'BrowserRendererEventDispatcher', 'DispatchEvent');
    }
    var eventDescriptor = {
        BrowserRendererId: browserRendererId,
        ComponentId: componentId,
        EventHandlerId: eventHandlerId,
        EventArgsType: eventInfoType
    };
    Environment_1.platform.callMethod(raiseEventMethod, null, [
        Environment_1.platform.toDotNetString(JSON.stringify(eventDescriptor)),
        Environment_1.platform.toDotNetString(JSON.stringify(eventInfo))
    ]);
}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Environment_1 = __webpack_require__(0);
var renderTreeEditStructLength = 16;
function getRenderTreeEditPtr(renderTreeEdits, index) {
    return Environment_1.platform.getArrayEntryPtr(renderTreeEdits, index, renderTreeEditStructLength);
}
exports.getRenderTreeEditPtr = getRenderTreeEditPtr;
exports.renderTreeEdit = {
    // The properties and memory layout must be kept in sync with the .NET equivalent in RenderTreeEdit.cs
    type: function (edit) { return Environment_1.platform.readInt32Field(edit, 0); },
    siblingIndex: function (edit) { return Environment_1.platform.readInt32Field(edit, 4); },
    newTreeIndex: function (edit) { return Environment_1.platform.readInt32Field(edit, 8); },
    removedAttributeName: function (edit) { return Environment_1.platform.readStringField(edit, 12); },
};
var EditType;
(function (EditType) {
    EditType[EditType["prependFrame"] = 1] = "prependFrame";
    EditType[EditType["removeFrame"] = 2] = "removeFrame";
    EditType[EditType["setAttribute"] = 3] = "setAttribute";
    EditType[EditType["removeAttribute"] = 4] = "removeAttribute";
    EditType[EditType["updateText"] = 5] = "updateText";
    EditType[EditType["stepIn"] = 6] = "stepIn";
    EditType[EditType["stepOut"] = 7] = "stepOut";
})(EditType = exports.EditType || (exports.EditType = {}));


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Environment_1 = __webpack_require__(0);
var renderTreeFrameStructLength = 28;
// To minimise GC pressure, instead of instantiating a JS object to represent each tree frame,
// we work in terms of pointers to the structs on the .NET heap, and use static functions that
// know how to read property values from those structs.
function getTreeFramePtr(renderTreeEntries, index) {
    return Environment_1.platform.getArrayEntryPtr(renderTreeEntries, index, renderTreeFrameStructLength);
}
exports.getTreeFramePtr = getTreeFramePtr;
exports.renderTreeFrame = {
    // The properties and memory layout must be kept in sync with the .NET equivalent in RenderTreeFrame.cs
    frameType: function (frame) { return Environment_1.platform.readInt32Field(frame, 4); },
    subtreeLength: function (frame) { return Environment_1.platform.readInt32Field(frame, 8); },
    componentId: function (frame) { return Environment_1.platform.readInt32Field(frame, 12); },
    elementName: function (frame) { return Environment_1.platform.readStringField(frame, 16); },
    textContent: function (frame) { return Environment_1.platform.readStringField(frame, 16); },
    attributeName: function (frame) { return Environment_1.platform.readStringField(frame, 16); },
    attributeValue: function (frame) { return Environment_1.platform.readStringField(frame, 24); },
    attributeEventHandlerId: function (frame) { return Environment_1.platform.readInt32Field(frame, 8); },
};
var FrameType;
(function (FrameType) {
    // The values must be kept in sync with the .NET equivalent in RenderTreeFrameType.cs
    FrameType[FrameType["element"] = 1] = "element";
    FrameType[FrameType["text"] = 2] = "text";
    FrameType[FrameType["attribute"] = 3] = "attribute";
    FrameType[FrameType["component"] = 4] = "component";
})(FrameType = exports.FrameType || (exports.FrameType = {}));


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Environment_1 = __webpack_require__(0);
var RegisteredFunction_1 = __webpack_require__(1);
if (typeof window !== 'undefined') {
    // When the library is loaded in a browser via a <script> element, make the
    // following APIs available in global scope for invocation from JS
    window['Blazor'] = {
        platform: Environment_1.platform,
        registerFunction: RegisteredFunction_1.registerFunction,
    };
}


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZmRiOGE2MjczOTNiNjI3NjI4MDIiLCJ3ZWJwYWNrOi8vLy4vc3JjL0Vudmlyb25tZW50LnRzIiwid2VicGFjazovLy8uL3NyYy9JbnRlcm9wL1JlZ2lzdGVyZWRGdW5jdGlvbi50cyIsIndlYnBhY2s6Ly8vLi9zcmMvUGxhdGZvcm0vRG90TmV0LnRzIiwid2VicGFjazovLy8uL3NyYy9SZW5kZXJpbmcvUmVuZGVyZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0Jvb3QudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1BsYXRmb3JtL01vbm8vTW9ub1BsYXRmb3JtLnRzIiwid2VicGFjazovLy8uL3NyYy9JbnRlcm9wL0ludGVybmFsUmVnaXN0ZXJlZEZ1bmN0aW9uLnRzIiwid2VicGFjazovLy8uL3NyYy9JbnRlcm9wL0ludm9rZVdpdGhKc29uTWFyc2hhbGxpbmcudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1JlbmRlcmluZy9SZW5kZXJCYXRjaC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvUmVuZGVyaW5nL0Jyb3dzZXJSZW5kZXJlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvUmVuZGVyaW5nL1JlbmRlclRyZWVFZGl0LnRzIiwid2VicGFjazovLy8uL3NyYy9SZW5kZXJpbmcvUmVuZGVyVHJlZUZyYW1lLnRzIiwid2VicGFjazovLy8uL3NyYy9HbG9iYWxFeHBvcnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixF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RSxFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLDJFQUEyRTtJQUMzRSxrRUFBa0U7SUFDbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHO1FBQ2pCLFFBQVE7UUFDUixnQkFBZ0I7S0FDakIsQ0FBQztBQUNKLENBQUMiLCJmaWxlIjoiYmxhem9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZmRiOGE2MjczOTNiNjI3NjI4MDIiLCIvLyBFeHBvc2UgYW4gZXhwb3J0IGNhbGxlZCAncGxhdGZvcm0nIG9mIHRoZSBpbnRlcmZhY2UgdHlwZSAnUGxhdGZvcm0nLFxuLy8gc28gdGhhdCBjb25zdW1lcnMgY2FuIGJlIGFnbm9zdGljIGFib3V0IHdoaWNoIGltcGxlbWVudGF0aW9uIHRoZXkgdXNlLlxuLy8gQmFzaWMgYWx0ZXJuYXRpdmUgdG8gaGF2aW5nIGFuIGFjdHVhbCBESSBjb250YWluZXIuXG5pbXBvcnQgeyBQbGF0Zm9ybSB9IGZyb20gJy4vUGxhdGZvcm0vUGxhdGZvcm0nO1xuaW1wb3J0IHsgbW9ub1BsYXRmb3JtIH0gZnJvbSAnLi9QbGF0Zm9ybS9Nb25vL01vbm9QbGF0Zm9ybSc7XG5leHBvcnQgY29uc3QgcGxhdGZvcm06IFBsYXRmb3JtID0gbW9ub1BsYXRmb3JtO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL0Vudmlyb25tZW50LnRzIiwiaW1wb3J0IHsgaW50ZXJuYWxSZWdpc3RlcmVkRnVuY3Rpb25zIH0gZnJvbSAnLi9JbnRlcm5hbFJlZ2lzdGVyZWRGdW5jdGlvbic7XG5cbmNvbnN0IHJlZ2lzdGVyZWRGdW5jdGlvbnM6IHsgW2lkZW50aWZpZXI6IHN0cmluZ106IEZ1bmN0aW9uIHwgdW5kZWZpbmVkIH0gPSB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRnVuY3Rpb24oaWRlbnRpZmllcjogc3RyaW5nLCBpbXBsZW1lbnRhdGlvbjogRnVuY3Rpb24pIHtcbiAgaWYgKGludGVybmFsUmVnaXN0ZXJlZEZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShpZGVudGlmaWVyKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGZ1bmN0aW9uIGlkZW50aWZpZXIgJyR7aWRlbnRpZmllcn0nIGlzIHJlc2VydmVkIGFuZCBjYW5ub3QgYmUgcmVnaXN0ZXJlZC5gKTtcbiAgfVxuXG4gIGlmIChyZWdpc3RlcmVkRnVuY3Rpb25zLmhhc093blByb3BlcnR5KGlkZW50aWZpZXIpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBBIGZ1bmN0aW9uIHdpdGggdGhlIGlkZW50aWZpZXIgJyR7aWRlbnRpZmllcn0nIGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZC5gKTtcbiAgfVxuXG4gIHJlZ2lzdGVyZWRGdW5jdGlvbnNbaWRlbnRpZmllcl0gPSBpbXBsZW1lbnRhdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlZ2lzdGVyZWRGdW5jdGlvbihpZGVudGlmaWVyOiBzdHJpbmcpOiBGdW5jdGlvbiB7XG4gIC8vIEJ5IHByaW9yaXRpc2luZyB0aGUgaW50ZXJuYWwgb25lcywgd2UgZW5zdXJlIHlvdSBjYW4ndCBvdmVycmlkZSB0aGVtXG4gIGNvbnN0IHJlc3VsdCA9IGludGVybmFsUmVnaXN0ZXJlZEZ1bmN0aW9uc1tpZGVudGlmaWVyXSB8fCByZWdpc3RlcmVkRnVuY3Rpb25zW2lkZW50aWZpZXJdO1xuICBpZiAocmVzdWx0KSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIHJlZ2lzdGVyZWQgZnVuY3Rpb24gd2l0aCBuYW1lICcke2lkZW50aWZpZXJ9Jy5gKTtcbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL0ludGVyb3AvUmVnaXN0ZXJlZEZ1bmN0aW9uLnRzIiwiZXhwb3J0IGZ1bmN0aW9uIGdldEFzc2VtYmx5TmFtZUZyb21VcmwodXJsOiBzdHJpbmcpIHtcbiAgY29uc3QgbGFzdFNlZ21lbnQgPSB1cmwuc3Vic3RyaW5nKHVybC5sYXN0SW5kZXhPZignLycpICsgMSk7XG4gIGNvbnN0IHF1ZXJ5U3RyaW5nU3RhcnRQb3MgPSBsYXN0U2VnbWVudC5pbmRleE9mKCc/Jyk7XG4gIGNvbnN0IGZpbGVuYW1lID0gcXVlcnlTdHJpbmdTdGFydFBvcyA8IDAgPyBsYXN0U2VnbWVudCA6IGxhc3RTZWdtZW50LnN1YnN0cmluZygwLCBxdWVyeVN0cmluZ1N0YXJ0UG9zKTtcbiAgcmV0dXJuIGZpbGVuYW1lLnJlcGxhY2UoL1xcLmRsbCQvLCAnJyk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvUGxhdGZvcm0vRG90TmV0LnRzIiwiaW1wb3J0IHsgU3lzdGVtX09iamVjdCwgU3lzdGVtX1N0cmluZywgU3lzdGVtX0FycmF5LCBNZXRob2RIYW5kbGUsIFBvaW50ZXIgfSBmcm9tICcuLi9QbGF0Zm9ybS9QbGF0Zm9ybSc7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gJy4uL0Vudmlyb25tZW50JztcbmltcG9ydCB7IHJlbmRlckJhdGNoIGFzIHJlbmRlckJhdGNoU3RydWN0LCBhcnJheVJhbmdlLCBhcnJheVNlZ21lbnQsIHJlbmRlclRyZWVEaWZmU3RydWN0TGVuZ3RoLCByZW5kZXJUcmVlRGlmZiwgUmVuZGVyQmF0Y2hQb2ludGVyLCBSZW5kZXJUcmVlRGlmZlBvaW50ZXIgfSBmcm9tICcuL1JlbmRlckJhdGNoJztcbmltcG9ydCB7IEJyb3dzZXJSZW5kZXJlciB9IGZyb20gJy4vQnJvd3NlclJlbmRlcmVyJztcblxudHlwZSBCcm93c2VyUmVuZGVyZXJSZWdpc3RyeSA9IHsgW2Jyb3dzZXJSZW5kZXJlcklkOiBudW1iZXJdOiBCcm93c2VyUmVuZGVyZXIgfTtcbmNvbnN0IGJyb3dzZXJSZW5kZXJlcnM6IEJyb3dzZXJSZW5kZXJlclJlZ2lzdHJ5ID0ge307XG5cbmV4cG9ydCBmdW5jdGlvbiBhdHRhY2hDb21wb25lbnRUb0VsZW1lbnQoYnJvd3NlclJlbmRlcmVySWQ6IG51bWJlciwgZWxlbWVudFNlbGVjdG9yOiBTeXN0ZW1fU3RyaW5nLCBjb21wb25lbnRJZDogbnVtYmVyKSB7XG4gIGNvbnN0IGVsZW1lbnRTZWxlY3RvckpzID0gcGxhdGZvcm0udG9KYXZhU2NyaXB0U3RyaW5nKGVsZW1lbnRTZWxlY3Rvcik7XG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnRTZWxlY3RvckpzKTtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhbnkgZWxlbWVudCBtYXRjaGluZyBzZWxlY3RvciAnJHtlbGVtZW50U2VsZWN0b3JKc30nLmApO1xuICB9XG5cbiAgbGV0IGJyb3dzZXJSZW5kZXJlciA9IGJyb3dzZXJSZW5kZXJlcnNbYnJvd3NlclJlbmRlcmVySWRdO1xuICBpZiAoIWJyb3dzZXJSZW5kZXJlcikge1xuICAgIGJyb3dzZXJSZW5kZXJlciA9IGJyb3dzZXJSZW5kZXJlcnNbYnJvd3NlclJlbmRlcmVySWRdID0gbmV3IEJyb3dzZXJSZW5kZXJlcihicm93c2VyUmVuZGVyZXJJZCk7XG4gIH1cbiAgYnJvd3NlclJlbmRlcmVyLmF0dGFjaENvbXBvbmVudFRvRWxlbWVudChjb21wb25lbnRJZCwgZWxlbWVudCk7XG4gIGNsZWFyRWxlbWVudChlbGVtZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckJhdGNoKGJyb3dzZXJSZW5kZXJlcklkOiBudW1iZXIsIGJhdGNoOiBSZW5kZXJCYXRjaFBvaW50ZXIpIHtcbiAgY29uc3QgYnJvd3NlclJlbmRlcmVyID0gYnJvd3NlclJlbmRlcmVyc1ticm93c2VyUmVuZGVyZXJJZF07XG4gIGlmICghYnJvd3NlclJlbmRlcmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSBpcyBubyBicm93c2VyIHJlbmRlcmVyIHdpdGggSUQgJHticm93c2VyUmVuZGVyZXJJZH0uYCk7XG4gIH1cbiAgXG4gIGNvbnN0IHVwZGF0ZWRDb21wb25lbnRzID0gcmVuZGVyQmF0Y2hTdHJ1Y3QudXBkYXRlZENvbXBvbmVudHMoYmF0Y2gpO1xuICBjb25zdCB1cGRhdGVkQ29tcG9uZW50c0xlbmd0aCA9IGFycmF5UmFuZ2UuY291bnQodXBkYXRlZENvbXBvbmVudHMpO1xuICBjb25zdCB1cGRhdGVkQ29tcG9uZW50c0FycmF5ID0gYXJyYXlSYW5nZS5hcnJheSh1cGRhdGVkQ29tcG9uZW50cyk7XG4gIGNvbnN0IHJlZmVyZW5jZUZyYW1lc1N0cnVjdCA9IHJlbmRlckJhdGNoU3RydWN0LnJlZmVyZW5jZUZyYW1lcyhiYXRjaCk7XG4gIGNvbnN0IHJlZmVyZW5jZUZyYW1lcyA9IGFycmF5UmFuZ2UuYXJyYXkocmVmZXJlbmNlRnJhbWVzU3RydWN0KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHVwZGF0ZWRDb21wb25lbnRzTGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBkaWZmID0gcGxhdGZvcm0uZ2V0QXJyYXlFbnRyeVB0cih1cGRhdGVkQ29tcG9uZW50c0FycmF5LCBpLCByZW5kZXJUcmVlRGlmZlN0cnVjdExlbmd0aCk7XG4gICAgY29uc3QgY29tcG9uZW50SWQgPSByZW5kZXJUcmVlRGlmZi5jb21wb25lbnRJZChkaWZmKTtcblxuICAgIGNvbnN0IGVkaXRzQXJyYXlTZWdtZW50ID0gcmVuZGVyVHJlZURpZmYuZWRpdHMoZGlmZik7XG4gICAgY29uc3QgZWRpdHMgPSBhcnJheVNlZ21lbnQuYXJyYXkoZWRpdHNBcnJheVNlZ21lbnQpO1xuICAgIGNvbnN0IGVkaXRzT2Zmc2V0ID0gYXJyYXlTZWdtZW50Lm9mZnNldChlZGl0c0FycmF5U2VnbWVudCk7XG4gICAgY29uc3QgZWRpdHNMZW5ndGggPSBhcnJheVNlZ21lbnQuY291bnQoZWRpdHNBcnJheVNlZ21lbnQpO1xuXG4gICAgYnJvd3NlclJlbmRlcmVyLnVwZGF0ZUNvbXBvbmVudChjb21wb25lbnRJZCwgZWRpdHMsIGVkaXRzT2Zmc2V0LCBlZGl0c0xlbmd0aCwgcmVmZXJlbmNlRnJhbWVzKTtcbiAgfVxuXG4gIGNvbnN0IGRpc3Bvc2VkQ29tcG9uZW50SWRzID0gcmVuZGVyQmF0Y2hTdHJ1Y3QuZGlzcG9zZWRDb21wb25lbnRJZHMoYmF0Y2gpO1xuICBjb25zdCBkaXNwb3NlZENvbXBvbmVudElkc0xlbmd0aCA9IGFycmF5UmFuZ2UuY291bnQoZGlzcG9zZWRDb21wb25lbnRJZHMpO1xuICBjb25zdCBkaXNwb3NlZENvbXBvbmVudElkc0FycmF5ID0gYXJyYXlSYW5nZS5hcnJheShkaXNwb3NlZENvbXBvbmVudElkcyk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGlzcG9zZWRDb21wb25lbnRJZHNMZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNvbXBvbmVudElkUHRyID0gcGxhdGZvcm0uZ2V0QXJyYXlFbnRyeVB0cihkaXNwb3NlZENvbXBvbmVudElkc0FycmF5LCBpLCA0KTtcbiAgICBjb25zdCBjb21wb25lbnRJZCA9IHBsYXRmb3JtLnJlYWRJbnQzMkZpZWxkKGNvbXBvbmVudElkUHRyKTtcbiAgICBicm93c2VyUmVuZGVyZXIuZGlzcG9zZUNvbXBvbmVudChjb21wb25lbnRJZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgbGV0IGNoaWxkTm9kZTogTm9kZSB8IG51bGw7XG4gIHdoaWxlIChjaGlsZE5vZGUgPSBlbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZSk7XG4gIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9SZW5kZXJpbmcvUmVuZGVyZXIudHMiLCJpbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gJy4vRW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgZ2V0QXNzZW1ibHlOYW1lRnJvbVVybCB9IGZyb20gJy4vUGxhdGZvcm0vRG90TmV0JztcbmltcG9ydCAnLi9SZW5kZXJpbmcvUmVuZGVyZXInO1xuaW1wb3J0ICcuL0dsb2JhbEV4cG9ydHMnO1xuXG5hc3luYyBmdW5jdGlvbiBib290KCkge1xuICAvLyBSZWFkIHN0YXJ0dXAgY29uZmlnIGZyb20gdGhlIDxzY3JpcHQ+IGVsZW1lbnQgdGhhdCdzIGltcG9ydGluZyB0aGlzIGZpbGVcbiAgY29uc3QgYWxsU2NyaXB0RWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0Jyk7XG4gIGNvbnN0IHRoaXNTY3JpcHRFbGVtID0gYWxsU2NyaXB0RWxlbXNbYWxsU2NyaXB0RWxlbXMubGVuZ3RoIC0gMV07XG4gIGNvbnN0IGVudHJ5UG9pbnQgPSB0aGlzU2NyaXB0RWxlbS5nZXRBdHRyaWJ1dGUoJ21haW4nKTtcbiAgaWYgKCFlbnRyeVBvaW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIFwibWFpblwiIGF0dHJpYnV0ZSBvbiBCbGF6b3Igc2NyaXB0IHRhZy4nKTtcbiAgfVxuICBjb25zdCBlbnRyeVBvaW50QXNzZW1ibHlOYW1lID0gZ2V0QXNzZW1ibHlOYW1lRnJvbVVybChlbnRyeVBvaW50KTtcbiAgY29uc3QgcmVmZXJlbmNlQXNzZW1ibGllc0NvbW1hU2VwYXJhdGVkID0gdGhpc1NjcmlwdEVsZW0uZ2V0QXR0cmlidXRlKCdyZWZlcmVuY2VzJykgfHwgJyc7XG4gIGNvbnN0IHJlZmVyZW5jZUFzc2VtYmxpZXMgPSByZWZlcmVuY2VBc3NlbWJsaWVzQ29tbWFTZXBhcmF0ZWRcbiAgICAuc3BsaXQoJywnKVxuICAgIC5tYXAocyA9PiBzLnRyaW0oKSlcbiAgICAuZmlsdGVyKHMgPT4gISFzKTtcblxuICAvLyBEZXRlcm1pbmUgdGhlIFVSTHMgb2YgdGhlIGFzc2VtYmxpZXMgd2Ugd2FudCB0byBsb2FkXG4gIGNvbnN0IGxvYWRBc3NlbWJseVVybHMgPSBbZW50cnlQb2ludF1cbiAgICAuY29uY2F0KHJlZmVyZW5jZUFzc2VtYmxpZXMpXG4gICAgLm1hcChmaWxlbmFtZSA9PiBgL19mcmFtZXdvcmsvX2Jpbi8ke2ZpbGVuYW1lfWApO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgcGxhdGZvcm0uc3RhcnQobG9hZEFzc2VtYmx5VXJscyk7XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc3RhcnQgcGxhdGZvcm0uIFJlYXNvbjogJHtleH1gKTtcbiAgfVxuXG4gIC8vIFN0YXJ0IHVwIHRoZSBhcHBsaWNhdGlvblxuICBwbGF0Zm9ybS5jYWxsRW50cnlQb2ludChlbnRyeVBvaW50QXNzZW1ibHlOYW1lLCBbXSk7XG59XG5cbmJvb3QoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9Cb290LnRzIiwiaW1wb3J0IHsgTWV0aG9kSGFuZGxlLCBTeXN0ZW1fT2JqZWN0LCBTeXN0ZW1fU3RyaW5nLCBTeXN0ZW1fQXJyYXksIFBvaW50ZXIsIFBsYXRmb3JtIH0gZnJvbSAnLi4vUGxhdGZvcm0nO1xuaW1wb3J0IHsgZ2V0QXNzZW1ibHlOYW1lRnJvbVVybCB9IGZyb20gJy4uL0RvdE5ldCc7XG5pbXBvcnQgeyBnZXRSZWdpc3RlcmVkRnVuY3Rpb24gfSBmcm9tICcuLi8uLi9JbnRlcm9wL1JlZ2lzdGVyZWRGdW5jdGlvbic7XG5cbmxldCBhc3NlbWJseV9sb2FkOiAoYXNzZW1ibHlOYW1lOiBzdHJpbmcpID0+IG51bWJlcjtcbmxldCBmaW5kX2NsYXNzOiAoYXNzZW1ibHlIYW5kbGU6IG51bWJlciwgbmFtZXNwYWNlOiBzdHJpbmcsIGNsYXNzTmFtZTogc3RyaW5nKSA9PiBudW1iZXI7XG5sZXQgZmluZF9tZXRob2Q6ICh0eXBlSGFuZGxlOiBudW1iZXIsIG1ldGhvZE5hbWU6IHN0cmluZywgdW5rbm93bkFyZzogbnVtYmVyKSA9PiBNZXRob2RIYW5kbGU7XG5sZXQgaW52b2tlX21ldGhvZDogKG1ldGhvZDogTWV0aG9kSGFuZGxlLCB0YXJnZXQ6IFN5c3RlbV9PYmplY3QsIGFyZ3NBcnJheVB0cjogbnVtYmVyLCBleGNlcHRpb25GbGFnSW50UHRyOiBudW1iZXIpID0+IFN5c3RlbV9PYmplY3Q7XG5sZXQgbW9ub19zdHJpbmdfZ2V0X3V0Zjg6IChtYW5hZ2VkU3RyaW5nOiBTeXN0ZW1fU3RyaW5nKSA9PiBNb25vLlV0ZjhQdHI7XG5sZXQgbW9ub19zdHJpbmc6IChqc1N0cmluZzogc3RyaW5nKSA9PiBTeXN0ZW1fU3RyaW5nO1xuXG5leHBvcnQgY29uc3QgbW9ub1BsYXRmb3JtOiBQbGF0Zm9ybSA9IHtcbiAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KGxvYWRBc3NlbWJseVVybHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIG1vbm8uanMgYXNzdW1lcyB0aGUgZXhpc3RlbmNlIG9mIHRoaXNcbiAgICAgIHdpbmRvd1snQnJvd3NlciddID0ge1xuICAgICAgICBpbml0OiAoKSA9PiB7IH0sXG4gICAgICAgIGFzeW5jTG9hZDogYXN5bmNMb2FkXG4gICAgICB9O1xuXG4gICAgICAvLyBFbXNjcmlwdGVuIHdvcmtzIGJ5IGV4cGVjdGluZyB0aGUgbW9kdWxlIGNvbmZpZyB0byBiZSBhIGdsb2JhbFxuICAgICAgd2luZG93WydNb2R1bGUnXSA9IGNyZWF0ZUVtc2NyaXB0ZW5Nb2R1bGVJbnN0YW5jZShsb2FkQXNzZW1ibHlVcmxzLCByZXNvbHZlLCByZWplY3QpO1xuXG4gICAgICBhZGRTY3JpcHRUYWdzVG9Eb2N1bWVudCgpO1xuICAgIH0pO1xuICB9LFxuXG4gIGZpbmRNZXRob2Q6IGZ1bmN0aW9uIGZpbmRNZXRob2QoYXNzZW1ibHlOYW1lOiBzdHJpbmcsIG5hbWVzcGFjZTogc3RyaW5nLCBjbGFzc05hbWU6IHN0cmluZywgbWV0aG9kTmFtZTogc3RyaW5nKTogTWV0aG9kSGFuZGxlIHtcbiAgICAvLyBUT0RPOiBDYWNoZSB0aGUgYXNzZW1ibHlfbG9hZCBvdXRwdXRzP1xuICAgIGNvbnN0IGFzc2VtYmx5SGFuZGxlID0gYXNzZW1ibHlfbG9hZChhc3NlbWJseU5hbWUpO1xuICAgIGlmICghYXNzZW1ibHlIYW5kbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYXNzZW1ibHkgXCIke2Fzc2VtYmx5TmFtZX1cImApO1xuICAgIH1cblxuICAgIGNvbnN0IHR5cGVIYW5kbGUgPSBmaW5kX2NsYXNzKGFzc2VtYmx5SGFuZGxlLCBuYW1lc3BhY2UsIGNsYXNzTmFtZSk7XG4gICAgaWYgKCF0eXBlSGFuZGxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIHR5cGUgXCIke2NsYXNzTmFtZX0nXCIgaW4gbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgaW4gYXNzZW1ibHkgXCIke2Fzc2VtYmx5TmFtZX1cImApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGhvZEhhbmRsZSA9IGZpbmRfbWV0aG9kKHR5cGVIYW5kbGUsIG1ldGhvZE5hbWUsIC0xKTtcbiAgICBpZiAoIW1ldGhvZEhhbmRsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBtZXRob2QgXCIke21ldGhvZE5hbWV9XCIgb24gdHlwZSBcIiR7bmFtZXNwYWNlfS4ke2NsYXNzTmFtZX1cImApO1xuICAgIH1cblxuICAgIHJldHVybiBtZXRob2RIYW5kbGU7XG4gIH0sXG5cbiAgY2FsbEVudHJ5UG9pbnQ6IGZ1bmN0aW9uIGNhbGxFbnRyeVBvaW50KGFzc2VtYmx5TmFtZTogc3RyaW5nLCBhcmdzOiBTeXN0ZW1fT2JqZWN0W10pOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBUaGVyZSBzaG91bGQgYmUgYSBwcm9wZXIgd2F5IG9mIHJ1bm5pbmcgd2hhdGV2ZXIgY291bnRzIGFzIHRoZSBlbnRyeXBvaW50IHdpdGhvdXRcbiAgICAvLyBoYXZpbmcgdG8gc3BlY2lmeSB3aGF0IG1ldGhvZCBpdCBpcywgYnV0IEkgaGF2ZW4ndCBmb3VuZCBpdC4gVGhlIGNvZGUgaGVyZSBhc3N1bWVzXG4gICAgLy8gdGhhdCB0aGUgZW50cnkgcG9pbnQgaXMgXCI8YXNzZW1ibHluYW1lPi5Qcm9ncmFtLk1haW5cIiAoaS5lLiwgbmFtZXNwYWNlID09IGFzc2VtYmx5IG5hbWUpLlxuICAgIGNvbnN0IGVudHJ5UG9pbnRNZXRob2QgPSBtb25vUGxhdGZvcm0uZmluZE1ldGhvZChhc3NlbWJseU5hbWUsIGFzc2VtYmx5TmFtZSwgJ1Byb2dyYW0nLCAnTWFpbicpO1xuICAgIG1vbm9QbGF0Zm9ybS5jYWxsTWV0aG9kKGVudHJ5UG9pbnRNZXRob2QsIG51bGwsIGFyZ3MpO1xuICB9LFxuXG4gIGNhbGxNZXRob2Q6IGZ1bmN0aW9uIGNhbGxNZXRob2QobWV0aG9kOiBNZXRob2RIYW5kbGUsIHRhcmdldDogU3lzdGVtX09iamVjdCwgYXJnczogU3lzdGVtX09iamVjdFtdKTogU3lzdGVtX09iamVjdCB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gNCkge1xuICAgICAgLy8gSG9wZWZ1bGx5IHRoaXMgcmVzdHJpY3Rpb24gY2FuIGJlIGVhc2VkIHNvb24sIGJ1dCBmb3Igbm93IG1ha2UgaXQgY2xlYXIgd2hhdCdzIGdvaW5nIG9uXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEN1cnJlbnRseSwgTW9ub1BsYXRmb3JtIHN1cHBvcnRzIHBhc3NpbmcgYSBtYXhpbXVtIG9mIDQgYXJndW1lbnRzIGZyb20gSlMgdG8gLk5FVC4gWW91IHRyaWVkIHRvIHBhc3MgJHthcmdzLmxlbmd0aH0uYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhY2sgPSBNb2R1bGUuUnVudGltZS5zdGFja1NhdmUoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBhcmdzQnVmZmVyID0gTW9kdWxlLlJ1bnRpbWUuc3RhY2tBbGxvYyhhcmdzLmxlbmd0aCk7XG4gICAgICBjb25zdCBleGNlcHRpb25GbGFnTWFuYWdlZEludCA9IE1vZHVsZS5SdW50aW1lLnN0YWNrQWxsb2MoNCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgTW9kdWxlLnNldFZhbHVlKGFyZ3NCdWZmZXIgKyBpICogNCwgYXJnc1tpXSwgJ2kzMicpO1xuICAgICAgfVxuICAgICAgTW9kdWxlLnNldFZhbHVlKGV4Y2VwdGlvbkZsYWdNYW5hZ2VkSW50LCAwLCAnaTMyJyk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGludm9rZV9tZXRob2QobWV0aG9kLCB0YXJnZXQsIGFyZ3NCdWZmZXIsIGV4Y2VwdGlvbkZsYWdNYW5hZ2VkSW50KTtcblxuICAgICAgaWYgKE1vZHVsZS5nZXRWYWx1ZShleGNlcHRpb25GbGFnTWFuYWdlZEludCwgJ2kzMicpICE9PSAwKSB7XG4gICAgICAgIC8vIElmIHRoZSBleGNlcHRpb24gZmxhZyBpcyBzZXQsIHRoZSByZXR1cm5lZCB2YWx1ZSBpcyBleGNlcHRpb24uVG9TdHJpbmcoKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobW9ub1BsYXRmb3JtLnRvSmF2YVNjcmlwdFN0cmluZyg8U3lzdGVtX1N0cmluZz5yZXMpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGZpbmFsbHkge1xuICAgICAgTW9kdWxlLlJ1bnRpbWUuc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgICB9XG4gIH0sXG5cbiAgdG9KYXZhU2NyaXB0U3RyaW5nOiBmdW5jdGlvbiB0b0phdmFTY3JpcHRTdHJpbmcobWFuYWdlZFN0cmluZzogU3lzdGVtX1N0cmluZykge1xuICAgIC8vIENvbW1lbnRzIGZyb20gb3JpZ2luYWwgTW9ubyBzYW1wbGU6XG4gICAgLy9GSVhNRSB0aGlzIGlzIHdhc3RlZnVsbCwgd2UgY291bGQgcmVtb3ZlIHRoZSB0ZW1wIG1hbGxvYyBieSBnb2luZyB0aGUgVVRGMTYgcm91dGVcbiAgICAvL0ZJWE1FIHRoaXMgaXMgdW5zYWZlLCBjdXogcmF3IG9iamVjdHMgY291bGQgYmUgR0MnZC5cblxuICAgIGNvbnN0IHV0ZjggPSBtb25vX3N0cmluZ19nZXRfdXRmOChtYW5hZ2VkU3RyaW5nKTtcbiAgICBjb25zdCByZXMgPSBNb2R1bGUuVVRGOFRvU3RyaW5nKHV0ZjgpO1xuICAgIE1vZHVsZS5fZnJlZSh1dGY4IGFzIGFueSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfSxcblxuICB0b0RvdE5ldFN0cmluZzogZnVuY3Rpb24gdG9Eb3ROZXRTdHJpbmcoanNTdHJpbmc6IHN0cmluZyk6IFN5c3RlbV9TdHJpbmcge1xuICAgIHJldHVybiBtb25vX3N0cmluZyhqc1N0cmluZyk7XG4gIH0sXG5cbiAgZ2V0QXJyYXlMZW5ndGg6IGZ1bmN0aW9uIGdldEFycmF5TGVuZ3RoKGFycmF5OiBTeXN0ZW1fQXJyYXk8YW55Pik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1vZHVsZS5nZXRWYWx1ZShnZXRBcnJheURhdGFQb2ludGVyKGFycmF5KSwgJ2kzMicpO1xuICB9LFxuXG4gIGdldEFycmF5RW50cnlQdHI6IGZ1bmN0aW9uIGdldEFycmF5RW50cnlQdHI8VFB0ciBleHRlbmRzIFBvaW50ZXI+KGFycmF5OiBTeXN0ZW1fQXJyYXk8VFB0cj4sIGluZGV4OiBudW1iZXIsIGl0ZW1TaXplOiBudW1iZXIpOiBUUHRyIHtcbiAgICAvLyBGaXJzdCBieXRlIGlzIGFycmF5IGxlbmd0aCwgZm9sbG93ZWQgYnkgZW50cmllc1xuICAgIGNvbnN0IGFkZHJlc3MgPSBnZXRBcnJheURhdGFQb2ludGVyKGFycmF5KSArIDQgKyBpbmRleCAqIGl0ZW1TaXplO1xuICAgIHJldHVybiBhZGRyZXNzIGFzIGFueSBhcyBUUHRyO1xuICB9LFxuXG4gIGdldE9iamVjdEZpZWxkc0Jhc2VBZGRyZXNzOiBmdW5jdGlvbiBnZXRPYmplY3RGaWVsZHNCYXNlQWRkcmVzcyhyZWZlcmVuY2VUeXBlZE9iamVjdDogU3lzdGVtX09iamVjdCk6IFBvaW50ZXIge1xuICAgIC8vIFRoZSBmaXJzdCB0d28gaW50MzIgdmFsdWVzIGFyZSBpbnRlcm5hbCBNb25vIGRhdGFcbiAgICByZXR1cm4gKHJlZmVyZW5jZVR5cGVkT2JqZWN0IGFzIGFueSBhcyBudW1iZXIgKyA4KSBhcyBhbnkgYXMgUG9pbnRlcjtcbiAgfSxcblxuICByZWFkSW50MzJGaWVsZDogZnVuY3Rpb24gcmVhZEhlYXBJbnQzMihiYXNlQWRkcmVzczogUG9pbnRlciwgZmllbGRPZmZzZXQ/OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBNb2R1bGUuZ2V0VmFsdWUoKGJhc2VBZGRyZXNzIGFzIGFueSBhcyBudW1iZXIpICsgKGZpZWxkT2Zmc2V0IHx8IDApLCAnaTMyJyk7XG4gIH0sXG5cbiAgcmVhZE9iamVjdEZpZWxkOiBmdW5jdGlvbiByZWFkSGVhcE9iamVjdDxUIGV4dGVuZHMgU3lzdGVtX09iamVjdD4oYmFzZUFkZHJlc3M6IFBvaW50ZXIsIGZpZWxkT2Zmc2V0PzogbnVtYmVyKTogVCB7XG4gICAgcmV0dXJuIE1vZHVsZS5nZXRWYWx1ZSgoYmFzZUFkZHJlc3MgYXMgYW55IGFzIG51bWJlcikgKyAoZmllbGRPZmZzZXQgfHwgMCksICdpMzInKSBhcyBhbnkgYXMgVDtcbiAgfSxcblxuICByZWFkU3RyaW5nRmllbGQ6IGZ1bmN0aW9uIHJlYWRIZWFwT2JqZWN0KGJhc2VBZGRyZXNzOiBQb2ludGVyLCBmaWVsZE9mZnNldD86IG51bWJlcik6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGZpZWxkVmFsdWUgPSBNb2R1bGUuZ2V0VmFsdWUoKGJhc2VBZGRyZXNzIGFzIGFueSBhcyBudW1iZXIpICsgKGZpZWxkT2Zmc2V0IHx8IDApLCAnaTMyJyk7XG4gICAgcmV0dXJuIGZpZWxkVmFsdWUgPT09IDAgPyBudWxsIDogbW9ub1BsYXRmb3JtLnRvSmF2YVNjcmlwdFN0cmluZyhmaWVsZFZhbHVlIGFzIGFueSBhcyBTeXN0ZW1fU3RyaW5nKTtcbiAgfSxcblxuICByZWFkU3RydWN0RmllbGQ6IGZ1bmN0aW9uIHJlYWRTdHJ1Y3RGaWVsZDxUIGV4dGVuZHMgUG9pbnRlcj4oYmFzZUFkZHJlc3M6IFBvaW50ZXIsIGZpZWxkT2Zmc2V0PzogbnVtYmVyKTogVCB7XG4gICAgcmV0dXJuICgoYmFzZUFkZHJlc3MgYXMgYW55IGFzIG51bWJlcikgKyAoZmllbGRPZmZzZXQgfHwgMCkpIGFzIGFueSBhcyBUO1xuICB9LFxufTtcblxuLy8gQnlwYXNzIG5vcm1hbCB0eXBlIGNoZWNraW5nIHRvIGFkZCB0aGlzIGV4dHJhIGZ1bmN0aW9uLiBJdCdzIG9ubHkgaW50ZW5kZWQgdG8gYmUgY2FsbGVkIGZyb21cbi8vIHRoZSBKUyBjb2RlIGluIE1vbm8ncyBkcml2ZXIuYy4gSXQncyBuZXZlciBpbnRlbmRlZCB0byBiZSBjYWxsZWQgZnJvbSBUeXBlU2NyaXB0LlxuKG1vbm9QbGF0Zm9ybSBhcyBhbnkpLm1vbm9HZXRSZWdpc3RlcmVkRnVuY3Rpb24gPSBnZXRSZWdpc3RlcmVkRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGFkZFNjcmlwdFRhZ3NUb0RvY3VtZW50KCkge1xuICAvLyBMb2FkIGVpdGhlciB0aGUgd2FzbSBvciBhc20uanMgdmVyc2lvbiBvZiB0aGUgTW9ubyBydW50aW1lXG4gIGNvbnN0IGJyb3dzZXJTdXBwb3J0c05hdGl2ZVdlYkFzc2VtYmx5ID0gdHlwZW9mIFdlYkFzc2VtYmx5ICE9PSAndW5kZWZpbmVkJyAmJiBXZWJBc3NlbWJseS52YWxpZGF0ZTtcbiAgY29uc3QgbW9ub1J1bnRpbWVVcmxCYXNlID0gJy9fZnJhbWV3b3JrLycgKyAoYnJvd3NlclN1cHBvcnRzTmF0aXZlV2ViQXNzZW1ibHkgPyAnd2FzbScgOiAnYXNtanMnKTtcbiAgY29uc3QgbW9ub1J1bnRpbWVTY3JpcHRVcmwgPSBgJHttb25vUnVudGltZVVybEJhc2V9L21vbm8uanNgO1xuXG4gIGlmICghYnJvd3NlclN1cHBvcnRzTmF0aXZlV2ViQXNzZW1ibHkpIHtcbiAgICAvLyBJbiB0aGUgYXNtanMgY2FzZSwgdGhlIGluaXRpYWwgbWVtb3J5IHN0cnVjdHVyZSBpcyBpbiBhIHNlcGFyYXRlIGZpbGUgd2UgbmVlZCB0byBkb3dubG9hZFxuICAgIGNvbnN0IG1lbWluaXRYSFIgPSBNb2R1bGVbJ21lbW9yeUluaXRpYWxpemVyUmVxdWVzdCddID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgbWVtaW5pdFhIUi5vcGVuKCdHRVQnLCBgJHttb25vUnVudGltZVVybEJhc2V9L21vbm8uanMubWVtYCk7XG4gICAgbWVtaW5pdFhIUi5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIG1lbWluaXRYSFIuc2VuZChudWxsKTtcbiAgfVxuXG4gIGRvY3VtZW50LndyaXRlKGA8c2NyaXB0IGRlZmVyIHNyYz1cIiR7bW9ub1J1bnRpbWVTY3JpcHRVcmx9XCI+PC9zY3JpcHQ+YCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVtc2NyaXB0ZW5Nb2R1bGVJbnN0YW5jZShsb2FkQXNzZW1ibHlVcmxzOiBzdHJpbmdbXSwgb25SZWFkeTogKCkgPT4gdm9pZCwgb25FcnJvcjogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkge1xuICBjb25zdCBtb2R1bGUgPSB7fSBhcyB0eXBlb2YgTW9kdWxlO1xuXG4gIG1vZHVsZS5wcmludCA9IGxpbmUgPT4gY29uc29sZS5sb2coYFdBU006ICR7bGluZX1gKTtcbiAgbW9kdWxlLnByaW50RXJyID0gbGluZSA9PiBjb25zb2xlLmVycm9yKGBXQVNNOiAke2xpbmV9YCk7XG4gIG1vZHVsZS53YXNtQmluYXJ5RmlsZSA9ICcvX2ZyYW1ld29yay93YXNtL21vbm8ud2FzbSc7XG4gIG1vZHVsZS5hc21qc0NvZGVGaWxlID0gJy9fZnJhbWV3b3JrL2FzbWpzL21vbm8uYXNtLmpzJztcbiAgbW9kdWxlLnByZVJ1biA9IFtdO1xuICBtb2R1bGUucG9zdFJ1biA9IFtdO1xuICBtb2R1bGUucHJlbG9hZFBsdWdpbnMgPSBbXTtcblxuICBtb2R1bGUucHJlUnVuLnB1c2goKCkgPT4ge1xuICAgIC8vIEJ5IG5vdywgZW1zY3JpcHRlbiBzaG91bGQgYmUgaW5pdGlhbGlzZWQgZW5vdWdoIHRoYXQgd2UgY2FuIGNhcHR1cmUgdGhlc2UgbWV0aG9kcyBmb3IgbGF0ZXIgdXNlXG4gICAgYXNzZW1ibHlfbG9hZCA9IE1vZHVsZS5jd3JhcCgnbW9ub193YXNtX2Fzc2VtYmx5X2xvYWQnLCAnbnVtYmVyJywgWydzdHJpbmcnXSk7XG4gICAgZmluZF9jbGFzcyA9IE1vZHVsZS5jd3JhcCgnbW9ub193YXNtX2Fzc2VtYmx5X2ZpbmRfY2xhc3MnLCAnbnVtYmVyJywgWydudW1iZXInLCAnc3RyaW5nJywgJ3N0cmluZyddKTtcbiAgICBmaW5kX21ldGhvZCA9IE1vZHVsZS5jd3JhcCgnbW9ub193YXNtX2Fzc2VtYmx5X2ZpbmRfbWV0aG9kJywgJ251bWJlcicsIFsnbnVtYmVyJywgJ3N0cmluZycsICdudW1iZXInXSk7XG4gICAgaW52b2tlX21ldGhvZCA9IE1vZHVsZS5jd3JhcCgnbW9ub193YXNtX2ludm9rZV9tZXRob2QnLCAnbnVtYmVyJywgWydudW1iZXInLCAnbnVtYmVyJywgJ251bWJlciddKTtcbiAgICBtb25vX3N0cmluZ19nZXRfdXRmOCA9IE1vZHVsZS5jd3JhcCgnbW9ub193YXNtX3N0cmluZ19nZXRfdXRmOCcsICdudW1iZXInLCBbJ251bWJlciddKTtcbiAgICBtb25vX3N0cmluZyA9IE1vZHVsZS5jd3JhcCgnbW9ub193YXNtX3N0cmluZ19mcm9tX2pzJywgJ251bWJlcicsIFsnc3RyaW5nJ10pO1xuXG4gICAgTW9kdWxlLkZTX2NyZWF0ZVBhdGgoJy8nLCAnYXBwQmluRGlyJywgdHJ1ZSwgdHJ1ZSk7XG4gICAgbG9hZEFzc2VtYmx5VXJscy5mb3JFYWNoKHVybCA9PlxuICAgICAgRlMuY3JlYXRlUHJlbG9hZGVkRmlsZSgnYXBwQmluRGlyJywgYCR7Z2V0QXNzZW1ibHlOYW1lRnJvbVVybCh1cmwpfS5kbGxgLCB1cmwsIHRydWUsIGZhbHNlLCB1bmRlZmluZWQsIG9uRXJyb3IpKTtcbiAgfSk7XG5cbiAgbW9kdWxlLnBvc3RSdW4ucHVzaCgoKSA9PiB7XG4gICAgY29uc3QgbG9hZF9ydW50aW1lID0gTW9kdWxlLmN3cmFwKCdtb25vX3dhc21fbG9hZF9ydW50aW1lJywgbnVsbCwgWydzdHJpbmcnXSk7XG4gICAgbG9hZF9ydW50aW1lKCdhcHBCaW5EaXInKTtcbiAgICBvblJlYWR5KCk7XG4gIH0pO1xuXG4gIHJldHVybiBtb2R1bGU7XG59XG5cbmZ1bmN0aW9uIGFzeW5jTG9hZCh1cmwsIG9ubG9hZCwgb25lcnJvcikge1xuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB4aHIub3BlbignR0VUJywgdXJsLCAvKiBhc3luYzogKi8gdHJ1ZSk7XG4gIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICB4aHIub25sb2FkID0gZnVuY3Rpb24geGhyX29ubG9hZCgpIHtcbiAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDAgfHwgeGhyLnN0YXR1cyA9PSAwICYmIHhoci5yZXNwb25zZSkge1xuICAgICAgdmFyIGFzbSA9IG5ldyBVaW50OEFycmF5KHhoci5yZXNwb25zZSk7XG4gICAgICBvbmxvYWQoYXNtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb25lcnJvcih4aHIpO1xuICAgIH1cbiAgfTtcbiAgeGhyLm9uZXJyb3IgPSBvbmVycm9yO1xuICB4aHIuc2VuZChudWxsKTtcbn1cblxuZnVuY3Rpb24gZ2V0QXJyYXlEYXRhUG9pbnRlcjxUPihhcnJheTogU3lzdGVtX0FycmF5PFQ+KTogbnVtYmVyIHtcbiAgcmV0dXJuIDxudW1iZXI+PGFueT5hcnJheSArIDEyOyAvLyBGaXJzdCBieXRlIGZyb20gaGVyZSBpcyBsZW5ndGgsIHRoZW4gZm9sbG93aW5nIGJ5dGVzIGFyZSBlbnRyaWVzXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvUGxhdGZvcm0vTW9uby9Nb25vUGxhdGZvcm0udHMiLCJpbXBvcnQgeyBpbnZva2VXaXRoSnNvbk1hcnNoYWxsaW5nIH0gZnJvbSAnLi9JbnZva2VXaXRoSnNvbk1hcnNoYWxsaW5nJztcbmltcG9ydCB7IGF0dGFjaENvbXBvbmVudFRvRWxlbWVudCwgcmVuZGVyQmF0Y2ggfSBmcm9tICcuLi9SZW5kZXJpbmcvUmVuZGVyZXInO1xuXG4vKipcbiAqIFRoZSBkZWZpbml0aXZlIGxpc3Qgb2YgaW50ZXJuYWwgZnVuY3Rpb25zIGludm9rYWJsZSBmcm9tIC5ORVQgY29kZS5cbiAqIFRoZXNlIGZ1bmN0aW9uIG5hbWVzIGFyZSB0cmVhdGVkIGFzICdyZXNlcnZlZCcgYW5kIGNhbm5vdCBiZSBwYXNzZWQgdG8gcmVnaXN0ZXJGdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IGludGVybmFsUmVnaXN0ZXJlZEZ1bmN0aW9ucyA9IHtcbiAgYXR0YWNoQ29tcG9uZW50VG9FbGVtZW50LFxuICBpbnZva2VXaXRoSnNvbk1hcnNoYWxsaW5nLFxuICByZW5kZXJCYXRjaCxcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvSW50ZXJvcC9JbnRlcm5hbFJlZ2lzdGVyZWRGdW5jdGlvbi50cyIsImltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSAnLi4vRW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgU3lzdGVtX1N0cmluZyB9IGZyb20gJy4uL1BsYXRmb3JtL1BsYXRmb3JtJztcbmltcG9ydCB7IGdldFJlZ2lzdGVyZWRGdW5jdGlvbiB9IGZyb20gJy4vUmVnaXN0ZXJlZEZ1bmN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGludm9rZVdpdGhKc29uTWFyc2hhbGxpbmcoaWRlbnRpZmllcjogU3lzdGVtX1N0cmluZywgLi4uYXJnc0pzb246IFN5c3RlbV9TdHJpbmdbXSkge1xuICBjb25zdCBpZGVudGlmaWVySnNTdHJpbmcgPSBwbGF0Zm9ybS50b0phdmFTY3JpcHRTdHJpbmcoaWRlbnRpZmllcik7XG4gIGNvbnN0IGZ1bmNJbnN0YW5jZSA9IGdldFJlZ2lzdGVyZWRGdW5jdGlvbihpZGVudGlmaWVySnNTdHJpbmcpO1xuICBjb25zdCBhcmdzID0gYXJnc0pzb24ubWFwKGpzb24gPT4gSlNPTi5wYXJzZShwbGF0Zm9ybS50b0phdmFTY3JpcHRTdHJpbmcoanNvbikpKTtcbiAgY29uc3QgcmVzdWx0ID0gZnVuY0luc3RhbmNlLmFwcGx5KG51bGwsIGFyZ3MpO1xuICBpZiAocmVzdWx0ICE9PSBudWxsICYmIHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgcmVzdWx0SnNvbiA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdCk7XG4gICAgcmV0dXJuIHBsYXRmb3JtLnRvRG90TmV0U3RyaW5nKHJlc3VsdEpzb24pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvSW50ZXJvcC9JbnZva2VXaXRoSnNvbk1hcnNoYWxsaW5nLnRzIiwiaW1wb3J0IHsgUG9pbnRlciwgU3lzdGVtX0FycmF5IH0gZnJvbSAnLi4vUGxhdGZvcm0vUGxhdGZvcm0nO1xuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tICcuLi9FbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBSZW5kZXJUcmVlRnJhbWVQb2ludGVyIH0gZnJvbSAnLi9SZW5kZXJUcmVlRnJhbWUnO1xuaW1wb3J0IHsgUmVuZGVyVHJlZUVkaXRQb2ludGVyIH0gZnJvbSAnLi9SZW5kZXJUcmVlRWRpdCc7XG5cbi8vIEtlZXAgaW4gc3luYyB3aXRoIHRoZSBzdHJ1Y3RzIGluIC5ORVQgY29kZVxuXG5leHBvcnQgY29uc3QgcmVuZGVyQmF0Y2ggPSB7XG4gIHVwZGF0ZWRDb21wb25lbnRzOiAob2JqOiBSZW5kZXJCYXRjaFBvaW50ZXIpID0+IHBsYXRmb3JtLnJlYWRTdHJ1Y3RGaWVsZDxBcnJheVJhbmdlUG9pbnRlcjxSZW5kZXJUcmVlRGlmZlBvaW50ZXI+PihvYmosIDApLFxuICByZWZlcmVuY2VGcmFtZXM6IChvYmo6IFJlbmRlckJhdGNoUG9pbnRlcikgPT4gcGxhdGZvcm0ucmVhZFN0cnVjdEZpZWxkPEFycmF5UmFuZ2VQb2ludGVyPFJlbmRlclRyZWVGcmFtZVBvaW50ZXI+PihvYmosIGFycmF5UmFuZ2VTdHJ1Y3RMZW5ndGgpLFxuICBkaXNwb3NlZENvbXBvbmVudElkczogKG9iajogUmVuZGVyQmF0Y2hQb2ludGVyKSA9PiBwbGF0Zm9ybS5yZWFkU3RydWN0RmllbGQ8QXJyYXlSYW5nZVBvaW50ZXI8bnVtYmVyPj4ob2JqLCBhcnJheVJhbmdlU3RydWN0TGVuZ3RoICsgYXJyYXlSYW5nZVN0cnVjdExlbmd0aCksXG59O1xuXG5jb25zdCBhcnJheVJhbmdlU3RydWN0TGVuZ3RoID0gODtcbmV4cG9ydCBjb25zdCBhcnJheVJhbmdlID0ge1xuICBhcnJheTogPFQ+KG9iajogQXJyYXlSYW5nZVBvaW50ZXI8VD4pID0+IHBsYXRmb3JtLnJlYWRPYmplY3RGaWVsZDxTeXN0ZW1fQXJyYXk8VD4+KG9iaiwgMCksXG4gIGNvdW50OiA8VD4ob2JqOiBBcnJheVJhbmdlUG9pbnRlcjxUPikgPT4gcGxhdGZvcm0ucmVhZEludDMyRmllbGQob2JqLCA0KSxcbn07XG5cbmNvbnN0IGFycmF5U2VnbWVudFN0cnVjdExlbmd0aCA9IDEyO1xuZXhwb3J0IGNvbnN0IGFycmF5U2VnbWVudCA9IHtcbiAgYXJyYXk6IDxUPihvYmo6IEFycmF5U2VnbWVudFBvaW50ZXI8VD4pID0+IHBsYXRmb3JtLnJlYWRPYmplY3RGaWVsZDxTeXN0ZW1fQXJyYXk8VD4+KG9iaiwgMCksXG4gIG9mZnNldDogPFQ+KG9iajogQXJyYXlTZWdtZW50UG9pbnRlcjxUPikgPT4gcGxhdGZvcm0ucmVhZEludDMyRmllbGQob2JqLCA0KSxcbiAgY291bnQ6IDxUPihvYmo6IEFycmF5U2VnbWVudFBvaW50ZXI8VD4pID0+IHBsYXRmb3JtLnJlYWRJbnQzMkZpZWxkKG9iaiwgOCksXG59O1xuXG5leHBvcnQgY29uc3QgcmVuZGVyVHJlZURpZmZTdHJ1Y3RMZW5ndGggPSA0ICsgYXJyYXlTZWdtZW50U3RydWN0TGVuZ3RoO1xuZXhwb3J0IGNvbnN0IHJlbmRlclRyZWVEaWZmID0ge1xuICBjb21wb25lbnRJZDogKG9iajogUmVuZGVyVHJlZURpZmZQb2ludGVyKSA9PiBwbGF0Zm9ybS5yZWFkSW50MzJGaWVsZChvYmosIDApLFxuICBlZGl0czogKG9iajogUmVuZGVyVHJlZURpZmZQb2ludGVyKSA9PiBwbGF0Zm9ybS5yZWFkU3RydWN0RmllbGQ8QXJyYXlTZWdtZW50UG9pbnRlcjxSZW5kZXJUcmVlRWRpdFBvaW50ZXI+PihvYmosIDQpLCAgXG59O1xuXG4vLyBOb21pbmFsIHR5cGVzIHRvIGVuc3VyZSBvbmx5IHZhbGlkIHBvaW50ZXJzIGFyZSBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9ucyBhYm92ZS5cbi8vIEF0IHJ1bnRpbWUgdGhlIHZhbHVlcyBhcmUganVzdCBudW1iZXJzLlxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJCYXRjaFBvaW50ZXIgZXh0ZW5kcyBQb2ludGVyIHsgUmVuZGVyQmF0Y2hQb2ludGVyX19ET19OT1RfSU1QTEVNRU5UOiBhbnkgfVxuZXhwb3J0IGludGVyZmFjZSBBcnJheVJhbmdlUG9pbnRlcjxUPiBleHRlbmRzIFBvaW50ZXIgeyBBcnJheVJhbmdlUG9pbnRlcl9fRE9fTk9UX0lNUExFTUVOVDogYW55IH1cbmV4cG9ydCBpbnRlcmZhY2UgQXJyYXlTZWdtZW50UG9pbnRlcjxUPiBleHRlbmRzIFBvaW50ZXIgeyBBcnJheVNlZ21lbnRQb2ludGVyX19ET19OT1RfSU1QTEVNRU5UOiBhbnkgfVxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJUcmVlRGlmZlBvaW50ZXIgZXh0ZW5kcyBQb2ludGVyIHsgUmVuZGVyVHJlZURpZmZQb2ludGVyX19ET19OT1RfSU1QTEVNRU5UOiBhbnkgfVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1JlbmRlcmluZy9SZW5kZXJCYXRjaC50cyIsImltcG9ydCB7IFN5c3RlbV9BcnJheSwgTWV0aG9kSGFuZGxlIH0gZnJvbSAnLi4vUGxhdGZvcm0vUGxhdGZvcm0nO1xuaW1wb3J0IHsgZ2V0UmVuZGVyVHJlZUVkaXRQdHIsIHJlbmRlclRyZWVFZGl0LCBSZW5kZXJUcmVlRWRpdFBvaW50ZXIsIEVkaXRUeXBlIH0gZnJvbSAnLi9SZW5kZXJUcmVlRWRpdCc7XG5pbXBvcnQgeyBnZXRUcmVlRnJhbWVQdHIsIHJlbmRlclRyZWVGcmFtZSwgRnJhbWVUeXBlLCBSZW5kZXJUcmVlRnJhbWVQb2ludGVyIH0gZnJvbSAnLi9SZW5kZXJUcmVlRnJhbWUnO1xuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tICcuLi9FbnZpcm9ubWVudCc7XG5sZXQgcmFpc2VFdmVudE1ldGhvZDogTWV0aG9kSGFuZGxlO1xubGV0IHJlbmRlckNvbXBvbmVudE1ldGhvZDogTWV0aG9kSGFuZGxlO1xuXG5leHBvcnQgY2xhc3MgQnJvd3NlclJlbmRlcmVyIHtcbiAgcHJpdmF0ZSBjaGlsZENvbXBvbmVudExvY2F0aW9uczogeyBbY29tcG9uZW50SWQ6IG51bWJlcl06IEVsZW1lbnQgfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYnJvd3NlclJlbmRlcmVySWQ6IG51bWJlcikge1xuICB9XG5cbiAgcHVibGljIGF0dGFjaENvbXBvbmVudFRvRWxlbWVudChjb21wb25lbnRJZDogbnVtYmVyLCBlbGVtZW50OiBFbGVtZW50KSB7XG4gICAgdGhpcy5jaGlsZENvbXBvbmVudExvY2F0aW9uc1tjb21wb25lbnRJZF0gPSBlbGVtZW50O1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZUNvbXBvbmVudChjb21wb25lbnRJZDogbnVtYmVyLCBlZGl0czogU3lzdGVtX0FycmF5PFJlbmRlclRyZWVFZGl0UG9pbnRlcj4sIGVkaXRzT2Zmc2V0OiBudW1iZXIsIGVkaXRzTGVuZ3RoOiBudW1iZXIsIHJlZmVyZW5jZUZyYW1lczogU3lzdGVtX0FycmF5PFJlbmRlclRyZWVGcmFtZVBvaW50ZXI+KSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuY2hpbGRDb21wb25lbnRMb2NhdGlvbnNbY29tcG9uZW50SWRdO1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBlbGVtZW50IGlzIGN1cnJlbnRseSBhc3NvY2lhdGVkIHdpdGggY29tcG9uZW50ICR7Y29tcG9uZW50SWR9YCk7XG4gICAgfVxuXG4gICAgdGhpcy5hcHBseUVkaXRzKGNvbXBvbmVudElkLCBlbGVtZW50LCAwLCBlZGl0cywgZWRpdHNPZmZzZXQsIGVkaXRzTGVuZ3RoLCByZWZlcmVuY2VGcmFtZXMpO1xuICB9XG5cbiAgcHVibGljIGRpc3Bvc2VDb21wb25lbnQoY29tcG9uZW50SWQ6IG51bWJlcikge1xuICAgIGRlbGV0ZSB0aGlzLmNoaWxkQ29tcG9uZW50TG9jYXRpb25zW2NvbXBvbmVudElkXTtcbiAgfVxuXG4gIGFwcGx5RWRpdHMoY29tcG9uZW50SWQ6IG51bWJlciwgcGFyZW50OiBFbGVtZW50LCBjaGlsZEluZGV4OiBudW1iZXIsIGVkaXRzOiBTeXN0ZW1fQXJyYXk8UmVuZGVyVHJlZUVkaXRQb2ludGVyPiwgZWRpdHNPZmZzZXQ6IG51bWJlciwgZWRpdHNMZW5ndGg6IG51bWJlciwgcmVmZXJlbmNlRnJhbWVzOiBTeXN0ZW1fQXJyYXk8UmVuZGVyVHJlZUZyYW1lUG9pbnRlcj4pIHtcbiAgICBsZXQgY3VycmVudERlcHRoID0gMDtcbiAgICBsZXQgY2hpbGRJbmRleEF0Q3VycmVudERlcHRoID0gY2hpbGRJbmRleDtcbiAgICBjb25zdCBtYXhFZGl0SW5kZXhFeGNsID0gZWRpdHNPZmZzZXQgKyBlZGl0c0xlbmd0aDtcbiAgICBmb3IgKGxldCBlZGl0SW5kZXggPSBlZGl0c09mZnNldDsgZWRpdEluZGV4IDwgbWF4RWRpdEluZGV4RXhjbDsgZWRpdEluZGV4KyspIHtcbiAgICAgIGNvbnN0IGVkaXQgPSBnZXRSZW5kZXJUcmVlRWRpdFB0cihlZGl0cywgZWRpdEluZGV4KTtcbiAgICAgIGNvbnN0IGVkaXRUeXBlID0gcmVuZGVyVHJlZUVkaXQudHlwZShlZGl0KTtcbiAgICAgIHN3aXRjaCAoZWRpdFR5cGUpIHtcbiAgICAgICAgY2FzZSBFZGl0VHlwZS5wcmVwZW5kRnJhbWU6IHtcbiAgICAgICAgICBjb25zdCBmcmFtZUluZGV4ID0gcmVuZGVyVHJlZUVkaXQubmV3VHJlZUluZGV4KGVkaXQpO1xuICAgICAgICAgIGNvbnN0IGZyYW1lID0gZ2V0VHJlZUZyYW1lUHRyKHJlZmVyZW5jZUZyYW1lcywgZnJhbWVJbmRleCk7XG4gICAgICAgICAgY29uc3Qgc2libGluZ0luZGV4ID0gcmVuZGVyVHJlZUVkaXQuc2libGluZ0luZGV4KGVkaXQpO1xuICAgICAgICAgIHRoaXMuaW5zZXJ0RnJhbWUoY29tcG9uZW50SWQsIHBhcmVudCwgY2hpbGRJbmRleEF0Q3VycmVudERlcHRoICsgc2libGluZ0luZGV4LCByZWZlcmVuY2VGcmFtZXMsIGZyYW1lLCBmcmFtZUluZGV4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIEVkaXRUeXBlLnJlbW92ZUZyYW1lOiB7XG4gICAgICAgICAgY29uc3Qgc2libGluZ0luZGV4ID0gcmVuZGVyVHJlZUVkaXQuc2libGluZ0luZGV4KGVkaXQpO1xuICAgICAgICAgIHJlbW92ZU5vZGVGcm9tRE9NKHBhcmVudCwgY2hpbGRJbmRleEF0Q3VycmVudERlcHRoICsgc2libGluZ0luZGV4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIEVkaXRUeXBlLnNldEF0dHJpYnV0ZToge1xuICAgICAgICAgIGNvbnN0IGZyYW1lSW5kZXggPSByZW5kZXJUcmVlRWRpdC5uZXdUcmVlSW5kZXgoZWRpdCk7XG4gICAgICAgICAgY29uc3QgZnJhbWUgPSBnZXRUcmVlRnJhbWVQdHIocmVmZXJlbmNlRnJhbWVzLCBmcmFtZUluZGV4KTtcbiAgICAgICAgICBjb25zdCBzaWJsaW5nSW5kZXggPSByZW5kZXJUcmVlRWRpdC5zaWJsaW5nSW5kZXgoZWRpdCk7XG4gICAgICAgICAgY29uc3QgZWxlbWVudCA9IHBhcmVudC5jaGlsZE5vZGVzW2NoaWxkSW5kZXhBdEN1cnJlbnREZXB0aCArIHNpYmxpbmdJbmRleF0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgdGhpcy5hcHBseUF0dHJpYnV0ZShjb21wb25lbnRJZCwgZWxlbWVudCwgZnJhbWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgRWRpdFR5cGUucmVtb3ZlQXR0cmlidXRlOiB7XG4gICAgICAgICAgY29uc3Qgc2libGluZ0luZGV4ID0gcmVuZGVyVHJlZUVkaXQuc2libGluZ0luZGV4KGVkaXQpO1xuICAgICAgICAgIHJlbW92ZUF0dHJpYnV0ZUZyb21ET00ocGFyZW50LCBjaGlsZEluZGV4QXRDdXJyZW50RGVwdGggKyBzaWJsaW5nSW5kZXgsIHJlbmRlclRyZWVFZGl0LnJlbW92ZWRBdHRyaWJ1dGVOYW1lKGVkaXQpISk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBFZGl0VHlwZS51cGRhdGVUZXh0OiB7XG4gICAgICAgICAgY29uc3QgZnJhbWVJbmRleCA9IHJlbmRlclRyZWVFZGl0Lm5ld1RyZWVJbmRleChlZGl0KTtcbiAgICAgICAgICBjb25zdCBmcmFtZSA9IGdldFRyZWVGcmFtZVB0cihyZWZlcmVuY2VGcmFtZXMsIGZyYW1lSW5kZXgpO1xuICAgICAgICAgIGNvbnN0IHNpYmxpbmdJbmRleCA9IHJlbmRlclRyZWVFZGl0LnNpYmxpbmdJbmRleChlZGl0KTtcbiAgICAgICAgICBjb25zdCBkb21UZXh0Tm9kZSA9IHBhcmVudC5jaGlsZE5vZGVzW2NoaWxkSW5kZXhBdEN1cnJlbnREZXB0aCArIHNpYmxpbmdJbmRleF0gYXMgVGV4dDtcbiAgICAgICAgICBkb21UZXh0Tm9kZS50ZXh0Q29udGVudCA9IHJlbmRlclRyZWVGcmFtZS50ZXh0Q29udGVudChmcmFtZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBFZGl0VHlwZS5zdGVwSW46IHtcbiAgICAgICAgICBjb25zdCBzaWJsaW5nSW5kZXggPSByZW5kZXJUcmVlRWRpdC5zaWJsaW5nSW5kZXgoZWRpdCk7XG4gICAgICAgICAgcGFyZW50ID0gcGFyZW50LmNoaWxkTm9kZXNbY2hpbGRJbmRleEF0Q3VycmVudERlcHRoICsgc2libGluZ0luZGV4XSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICBjdXJyZW50RGVwdGgrKztcbiAgICAgICAgICBjaGlsZEluZGV4QXRDdXJyZW50RGVwdGggPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgRWRpdFR5cGUuc3RlcE91dDoge1xuICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnRFbGVtZW50ITtcbiAgICAgICAgICBjdXJyZW50RGVwdGgtLTtcbiAgICAgICAgICBjaGlsZEluZGV4QXRDdXJyZW50RGVwdGggPSBjdXJyZW50RGVwdGggPT09IDAgPyBjaGlsZEluZGV4IDogMDsgLy8gVGhlIGNoaWxkSW5kZXggaXMgb25seSBldmVyIG5vbnplcm8gYXQgemVybyBkZXB0aFxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zdCB1bmtub3duVHlwZTogbmV2ZXIgPSBlZGl0VHlwZTsgLy8gQ29tcGlsZS10aW1lIHZlcmlmaWNhdGlvbiB0aGF0IHRoZSBzd2l0Y2ggd2FzIGV4aGF1c3RpdmVcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZWRpdCB0eXBlOiAke3Vua25vd25UeXBlfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0RnJhbWUoY29tcG9uZW50SWQ6IG51bWJlciwgcGFyZW50OiBFbGVtZW50LCBjaGlsZEluZGV4OiBudW1iZXIsIGZyYW1lczogU3lzdGVtX0FycmF5PFJlbmRlclRyZWVGcmFtZVBvaW50ZXI+LCBmcmFtZTogUmVuZGVyVHJlZUZyYW1lUG9pbnRlciwgZnJhbWVJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgZnJhbWVUeXBlID0gcmVuZGVyVHJlZUZyYW1lLmZyYW1lVHlwZShmcmFtZSk7XG4gICAgc3dpdGNoIChmcmFtZVR5cGUpIHtcbiAgICAgIGNhc2UgRnJhbWVUeXBlLmVsZW1lbnQ6XG4gICAgICAgIHRoaXMuaW5zZXJ0RWxlbWVudChjb21wb25lbnRJZCwgcGFyZW50LCBjaGlsZEluZGV4LCBmcmFtZXMsIGZyYW1lLCBmcmFtZUluZGV4KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEZyYW1lVHlwZS50ZXh0OlxuICAgICAgICB0aGlzLmluc2VydFRleHQocGFyZW50LCBjaGlsZEluZGV4LCBmcmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBGcmFtZVR5cGUuYXR0cmlidXRlOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dHJpYnV0ZSBmcmFtZXMgc2hvdWxkIG9ubHkgYmUgcHJlc2VudCBhcyBsZWFkaW5nIGNoaWxkcmVuIG9mIGVsZW1lbnQgZnJhbWVzLicpO1xuICAgICAgY2FzZSBGcmFtZVR5cGUuY29tcG9uZW50OlxuICAgICAgICB0aGlzLmluc2VydENvbXBvbmVudChwYXJlbnQsIGNoaWxkSW5kZXgsIGZyYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zdCB1bmtub3duVHlwZTogbmV2ZXIgPSBmcmFtZVR5cGU7IC8vIENvbXBpbGUtdGltZSB2ZXJpZmljYXRpb24gdGhhdCB0aGUgc3dpdGNoIHdhcyBleGhhdXN0aXZlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBmcmFtZSB0eXBlOiAke3Vua25vd25UeXBlfWApO1xuICAgIH1cbiAgfVxuXG4gIGluc2VydEVsZW1lbnQoY29tcG9uZW50SWQ6IG51bWJlciwgcGFyZW50OiBFbGVtZW50LCBjaGlsZEluZGV4OiBudW1iZXIsIGZyYW1lczogU3lzdGVtX0FycmF5PFJlbmRlclRyZWVGcmFtZVBvaW50ZXI+LCBmcmFtZTogUmVuZGVyVHJlZUZyYW1lUG9pbnRlciwgZnJhbWVJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IHJlbmRlclRyZWVGcmFtZS5lbGVtZW50TmFtZShmcmFtZSkhO1xuICAgIGNvbnN0IG5ld0RvbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICAgIGluc2VydE5vZGVJbnRvRE9NKG5ld0RvbUVsZW1lbnQsIHBhcmVudCwgY2hpbGRJbmRleCk7XG5cbiAgICAvLyBBcHBseSBhdHRyaWJ1dGVzXG4gICAgY29uc3QgZGVzY2VuZGFudHNFbmRJbmRleEV4Y2wgPSBmcmFtZUluZGV4ICsgcmVuZGVyVHJlZUZyYW1lLnN1YnRyZWVMZW5ndGgoZnJhbWUpO1xuICAgIGZvciAobGV0IGRlc2NlbmRhbnRJbmRleCA9IGZyYW1lSW5kZXggKyAxOyBkZXNjZW5kYW50SW5kZXggPCBkZXNjZW5kYW50c0VuZEluZGV4RXhjbDsgZGVzY2VuZGFudEluZGV4KyspIHtcbiAgICAgIGNvbnN0IGRlc2NlbmRhbnRGcmFtZSA9IGdldFRyZWVGcmFtZVB0cihmcmFtZXMsIGRlc2NlbmRhbnRJbmRleCk7XG4gICAgICBpZiAocmVuZGVyVHJlZUZyYW1lLmZyYW1lVHlwZShkZXNjZW5kYW50RnJhbWUpID09PSBGcmFtZVR5cGUuYXR0cmlidXRlKSB7XG4gICAgICAgIHRoaXMuYXBwbHlBdHRyaWJ1dGUoY29tcG9uZW50SWQsIG5ld0RvbUVsZW1lbnQsIGRlc2NlbmRhbnRGcmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcyBzb29uIGFzIHdlIHNlZSBhIG5vbi1hdHRyaWJ1dGUgY2hpbGQsIGFsbCB0aGUgc3Vic2VxdWVudCBjaGlsZCBmcmFtZXMgYXJlXG4gICAgICAgIC8vIG5vdCBhdHRyaWJ1dGVzLCBzbyBiYWlsIG91dCBhbmQgaW5zZXJ0IHRoZSByZW1uYW50cyByZWN1cnNpdmVseVxuICAgICAgICB0aGlzLmluc2VydEZyYW1lUmFuZ2UoY29tcG9uZW50SWQsIG5ld0RvbUVsZW1lbnQsIDAsIGZyYW1lcywgZGVzY2VuZGFudEluZGV4LCBkZXNjZW5kYW50c0VuZEluZGV4RXhjbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGluc2VydENvbXBvbmVudChwYXJlbnQ6IEVsZW1lbnQsIGNoaWxkSW5kZXg6IG51bWJlciwgZnJhbWU6IFJlbmRlclRyZWVGcmFtZVBvaW50ZXIpIHtcbiAgICAvLyBDdXJyZW50bHksIHRvIHN1cHBvcnQgTygxKSBsb29rdXBzIGZyb20gcmVuZGVyIHRyZWUgZnJhbWVzIHRvIERPTSBub2Rlcywgd2UgcmVseSBvblxuICAgIC8vIGVhY2ggY2hpbGQgY29tcG9uZW50IGV4aXN0aW5nIGFzIGEgc2luZ2xlIHRvcC1sZXZlbCBlbGVtZW50IGluIHRoZSBET00uIFRvIGd1YXJhbnRlZVxuICAgIC8vIHRoYXQsIHdlIHdyYXAgY2hpbGQgY29tcG9uZW50cyBpbiB0aGVzZSAnYmxhem9yLWNvbXBvbmVudCcgd3JhcHBlcnMuXG4gICAgLy8gVG8gaW1wcm92ZSBvbiB0aGlzIGluIHRoZSBmdXR1cmU6XG4gICAgLy8gLSBJZiB3ZSBjYW4gc3RhdGljYWxseSBkZXRlY3QgdGhhdCBhIGdpdmVuIGNvbXBvbmVudCBhbHdheXMgcHJvZHVjZXMgYSBzaW5nbGUgdG9wLWxldmVsXG4gICAgLy8gICBlbGVtZW50IGFueXdheSwgdGhlbiBkb24ndCB3cmFwIGl0IGluIGEgZnVydGhlciBub25zdGFuZGFyZCBlbGVtZW50XG4gICAgLy8gLSBJZiB3ZSByZWFsbHkgd2FudCB0byBzdXBwb3J0IGNoaWxkIGNvbXBvbmVudHMgcHJvZHVjaW5nIG11bHRpcGxlIHRvcC1sZXZlbCBmcmFtZXMgYW5kXG4gICAgLy8gICBub3QgYmVpbmcgd3JhcHBlZCBpbiBhIGNvbnRhaW5lciBhdCBhbGwsIHRoZW4gZXZlcnkgdGltZSBhIGNvbXBvbmVudCBpcyByZWZyZXNoZWQgaW5cbiAgICAvLyAgIHRoZSBET00sIHdlIGNvdWxkIHVwZGF0ZSBhbiBhcnJheSBvbiB0aGUgcGFyZW50IGVsZW1lbnQgdGhhdCBzcGVjaWZpZXMgaG93IG1hbnkgRE9NXG4gICAgLy8gICBub2RlcyBjb3JyZXNwb25kIHRvIGVhY2ggb2YgaXRzIHJlbmRlciB0cmVlIGZyYW1lcy4gVGhlbiB3aGVuIHRoYXQgcGFyZW50IHdhbnRzIHRvXG4gICAgLy8gICBsb2NhdGUgdGhlIGZpcnN0IERPTSBub2RlIGZvciBhIHJlbmRlciB0cmVlIGZyYW1lLCBpdCBjYW4gc3VtIGFsbCB0aGUgZnJhbWUgY291bnRzIGZvclxuICAgIC8vICAgYWxsIHRoZSBwcmVjZWRpbmcgcmVuZGVyIHRyZWVzIGZyYW1lcy4gSXQncyBPKE4pLCBidXQgd2hlcmUgTiBpcyB0aGUgbnVtYmVyIG9mIHNpYmxpbmdzXG4gICAgLy8gICAoY291bnRpbmcgY2hpbGQgY29tcG9uZW50cyBhcyBhIHNpbmdsZSBpdGVtKSwgc28gTiB3aWxsIHJhcmVseSBpZiBldmVyIGJlIGxhcmdlLlxuICAgIC8vICAgV2UgY291bGQgZXZlbiBrZWVwIHRyYWNrIG9mIHdoZXRoZXIgYWxsIHRoZSBjaGlsZCBjb21wb25lbnRzIGhhcHBlbiB0byBoYXZlIGV4YWN0bHkgMVxuICAgIC8vICAgdG9wIGxldmVsIGZyYW1lcywgYW5kIGluIHRoYXQgY2FzZSwgdGhlcmUncyBubyBuZWVkIHRvIHN1bSBhcyB3ZSBjYW4gZG8gZGlyZWN0IGxvb2t1cHMuXG4gICAgY29uc3QgY29udGFpbmVyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JsYXpvci1jb21wb25lbnQnKTtcbiAgICBpbnNlcnROb2RlSW50b0RPTShjb250YWluZXJFbGVtZW50LCBwYXJlbnQsIGNoaWxkSW5kZXgpO1xuXG4gICAgLy8gQWxsIHdlIGhhdmUgdG8gZG8gaXMgYXNzb2NpYXRlIHRoZSBjaGlsZCBjb21wb25lbnQgSUQgd2l0aCBpdHMgbG9jYXRpb24uIFdlIGRvbid0IGFjdHVhbGx5XG4gICAgLy8gZG8gYW55IHJlbmRlcmluZyBoZXJlLCBiZWNhdXNlIHRoZSBkaWZmIGZvciB0aGUgY2hpbGQgd2lsbCBhcHBlYXIgbGF0ZXIgaW4gdGhlIHJlbmRlciBiYXRjaC5cbiAgICBjb25zdCBjaGlsZENvbXBvbmVudElkID0gcmVuZGVyVHJlZUZyYW1lLmNvbXBvbmVudElkKGZyYW1lKTtcbiAgICB0aGlzLmF0dGFjaENvbXBvbmVudFRvRWxlbWVudChjaGlsZENvbXBvbmVudElkLCBjb250YWluZXJFbGVtZW50KTtcbiAgfVxuXG4gIGluc2VydFRleHQocGFyZW50OiBFbGVtZW50LCBjaGlsZEluZGV4OiBudW1iZXIsIHRleHRGcmFtZTogUmVuZGVyVHJlZUZyYW1lUG9pbnRlcikge1xuICAgIGNvbnN0IHRleHRDb250ZW50ID0gcmVuZGVyVHJlZUZyYW1lLnRleHRDb250ZW50KHRleHRGcmFtZSkhO1xuICAgIGNvbnN0IG5ld0RvbVRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dENvbnRlbnQpO1xuICAgIGluc2VydE5vZGVJbnRvRE9NKG5ld0RvbVRleHROb2RlLCBwYXJlbnQsIGNoaWxkSW5kZXgpO1xuICB9XG5cbiAgYXBwbHlBdHRyaWJ1dGUoY29tcG9uZW50SWQ6IG51bWJlciwgdG9Eb21FbGVtZW50OiBFbGVtZW50LCBhdHRyaWJ1dGVGcmFtZTogUmVuZGVyVHJlZUZyYW1lUG9pbnRlcikge1xuICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWUgPSByZW5kZXJUcmVlRnJhbWUuYXR0cmlidXRlTmFtZShhdHRyaWJ1dGVGcmFtZSkhO1xuICAgIGNvbnN0IGJyb3dzZXJSZW5kZXJlcklkID0gdGhpcy5icm93c2VyUmVuZGVyZXJJZDtcbiAgICBjb25zdCBldmVudEhhbmRsZXJJZCA9IHJlbmRlclRyZWVGcmFtZS5hdHRyaWJ1dGVFdmVudEhhbmRsZXJJZChhdHRyaWJ1dGVGcmFtZSk7XG5cbiAgICAvLyBUT0RPOiBJbnN0ZWFkIG9mIGFwcGx5aW5nIHNlcGFyYXRlIGV2ZW50IGxpc3RlbmVycyB0byBlYWNoIERPTSBlbGVtZW50LCB1c2UgZXZlbnQgZGVsZWdhdGlvblxuICAgIC8vIGFuZCByZW1vdmUgYWxsIHRoZSBfYmxhem9yKkxpc3RlbmVyIGhhY2tzXG4gICAgc3dpdGNoIChhdHRyaWJ1dGVOYW1lKSB7XG4gICAgICBjYXNlICdvbmNsaWNrJzoge1xuICAgICAgICB0b0RvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b0RvbUVsZW1lbnRbJ19ibGF6b3JDbGlja0xpc3RlbmVyJ10pO1xuICAgICAgICBjb25zdCBsaXN0ZW5lciA9ICgpID0+IHJhaXNlRXZlbnQoYnJvd3NlclJlbmRlcmVySWQsIGNvbXBvbmVudElkLCBldmVudEhhbmRsZXJJZCwgJ21vdXNlJywgeyBUeXBlOiAnY2xpY2snIH0pO1xuICAgICAgICB0b0RvbUVsZW1lbnRbJ19ibGF6b3JDbGlja0xpc3RlbmVyJ10gPSBsaXN0ZW5lcjtcbiAgICAgICAgdG9Eb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbGlzdGVuZXIpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ29ua2V5cHJlc3MnOiB7XG4gICAgICAgIHRvRG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIHRvRG9tRWxlbWVudFsnX2JsYXpvcktleXByZXNzTGlzdGVuZXInXSk7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gZXZ0ID0+IHtcbiAgICAgICAgICAvLyBUaGlzIGRvZXMgbm90IGFjY291bnQgZm9yIHNwZWNpYWwga2V5cyBub3IgY3Jvc3MtYnJvd3NlciBkaWZmZXJlbmNlcy4gU28gZmFyIGl0J3NcbiAgICAgICAgICAvLyBqdXN0IHRvIGVzdGFibGlzaCB0aGF0IHdlIGNhbiBwYXNzIHBhcmFtZXRlcnMgd2hlbiByYWlzaW5nIGV2ZW50cy5cbiAgICAgICAgICAvLyBXZSB1c2UgQyMtc3R5bGUgUGFzY2FsQ2FzZSBvbiB0aGUgZXZlbnRJbmZvIHRvIHNpbXBsaWZ5IGRlc2VyaWFsaXphdGlvbiwgYnV0IHRoaXMgY291bGRcbiAgICAgICAgICAvLyBjaGFuZ2UgaWYgd2UgaW50cm9kdWNlZCBhIHJpY2hlciBKU09OIGxpYnJhcnkgb24gdGhlIC5ORVQgc2lkZS5cbiAgICAgICAgICByYWlzZUV2ZW50KGJyb3dzZXJSZW5kZXJlcklkLCBjb21wb25lbnRJZCwgZXZlbnRIYW5kbGVySWQsICdrZXlib2FyZCcsIHsgVHlwZTogZXZ0LnR5cGUsIEtleTogKGV2dCBhcyBhbnkpLmtleSB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdG9Eb21FbGVtZW50WydfYmxhem9yS2V5cHJlc3NMaXN0ZW5lciddID0gbGlzdGVuZXI7XG4gICAgICAgIHRvRG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGxpc3RlbmVyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUcmVhdCBhcyBhIHJlZ3VsYXIgc3RyaW5nLXZhbHVlZCBhdHRyaWJ1dGVcbiAgICAgICAgdG9Eb21FbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBhdHRyaWJ1dGVOYW1lLFxuICAgICAgICAgIHJlbmRlclRyZWVGcmFtZS5hdHRyaWJ1dGVWYWx1ZShhdHRyaWJ1dGVGcmFtZSkhXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGluc2VydEZyYW1lUmFuZ2UoY29tcG9uZW50SWQ6IG51bWJlciwgcGFyZW50OiBFbGVtZW50LCBjaGlsZEluZGV4OiBudW1iZXIsIGZyYW1lczogU3lzdGVtX0FycmF5PFJlbmRlclRyZWVGcmFtZVBvaW50ZXI+LCBzdGFydEluZGV4OiBudW1iZXIsIGVuZEluZGV4RXhjbDogbnVtYmVyKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSBzdGFydEluZGV4OyBpbmRleCA8IGVuZEluZGV4RXhjbDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgZnJhbWUgPSBnZXRUcmVlRnJhbWVQdHIoZnJhbWVzLCBpbmRleCk7XG4gICAgICB0aGlzLmluc2VydEZyYW1lKGNvbXBvbmVudElkLCBwYXJlbnQsIGNoaWxkSW5kZXgsIGZyYW1lcywgZnJhbWUsIGluZGV4KTtcbiAgICAgIGNoaWxkSW5kZXgrKztcblxuICAgICAgLy8gU2tpcCBvdmVyIGFueSBkZXNjZW5kYW50cywgc2luY2UgdGhleSBhcmUgYWxyZWFkeSBkZWFsdCB3aXRoIHJlY3Vyc2l2ZWx5XG4gICAgICBjb25zdCBzdWJ0cmVlTGVuZ3RoID0gcmVuZGVyVHJlZUZyYW1lLnN1YnRyZWVMZW5ndGgoZnJhbWUpO1xuICAgICAgaWYgKHN1YnRyZWVMZW5ndGggPiAxKSB7XG4gICAgICAgIGluZGV4ICs9IHN1YnRyZWVMZW5ndGggLSAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbnNlcnROb2RlSW50b0RPTShub2RlOiBOb2RlLCBwYXJlbnQ6IEVsZW1lbnQsIGNoaWxkSW5kZXg6IG51bWJlcikge1xuICBpZiAoY2hpbGRJbmRleCA+PSBwYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgcGFyZW50Lmluc2VydEJlZm9yZShub2RlLCBwYXJlbnQuY2hpbGROb2Rlc1tjaGlsZEluZGV4XSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZUZyb21ET00ocGFyZW50OiBFbGVtZW50LCBjaGlsZEluZGV4OiBudW1iZXIpIHtcbiAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5jaGlsZE5vZGVzW2NoaWxkSW5kZXhdKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQXR0cmlidXRlRnJvbURPTShwYXJlbnQ6IEVsZW1lbnQsIGNoaWxkSW5kZXg6IG51bWJlciwgYXR0cmlidXRlTmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGVsZW1lbnQgPSBwYXJlbnQuY2hpbGROb2Rlc1tjaGlsZEluZGV4XSBhcyBFbGVtZW50O1xuICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcbn1cblxuZnVuY3Rpb24gcmFpc2VFdmVudChicm93c2VyUmVuZGVyZXJJZDogbnVtYmVyLCBjb21wb25lbnRJZDogbnVtYmVyLCBldmVudEhhbmRsZXJJZDogbnVtYmVyLCBldmVudEluZm9UeXBlOiBFdmVudEluZm9UeXBlLCBldmVudEluZm86IGFueSkge1xuICBpZiAoIXJhaXNlRXZlbnRNZXRob2QpIHtcbiAgICByYWlzZUV2ZW50TWV0aG9kID0gcGxhdGZvcm0uZmluZE1ldGhvZChcbiAgICAgICdNaWNyb3NvZnQuQXNwTmV0Q29yZS5CbGF6b3IuQnJvd3NlcicsICdNaWNyb3NvZnQuQXNwTmV0Q29yZS5CbGF6b3IuQnJvd3Nlci5SZW5kZXJpbmcnLCAnQnJvd3NlclJlbmRlcmVyRXZlbnREaXNwYXRjaGVyJywgJ0Rpc3BhdGNoRXZlbnQnXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGV2ZW50RGVzY3JpcHRvciA9IHtcbiAgICBCcm93c2VyUmVuZGVyZXJJZDogYnJvd3NlclJlbmRlcmVySWQsXG4gICAgQ29tcG9uZW50SWQ6IGNvbXBvbmVudElkLFxuICAgIEV2ZW50SGFuZGxlcklkOiBldmVudEhhbmRsZXJJZCxcbiAgICBFdmVudEFyZ3NUeXBlOiBldmVudEluZm9UeXBlXG4gIH07XG5cbiAgcGxhdGZvcm0uY2FsbE1ldGhvZChyYWlzZUV2ZW50TWV0aG9kLCBudWxsLCBbXG4gICAgcGxhdGZvcm0udG9Eb3ROZXRTdHJpbmcoSlNPTi5zdHJpbmdpZnkoZXZlbnREZXNjcmlwdG9yKSksXG4gICAgcGxhdGZvcm0udG9Eb3ROZXRTdHJpbmcoSlNPTi5zdHJpbmdpZnkoZXZlbnRJbmZvKSlcbiAgXSk7XG59XG5cbnR5cGUgRXZlbnRJbmZvVHlwZSA9ICdtb3VzZScgfCAna2V5Ym9hcmQnO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1JlbmRlcmluZy9Ccm93c2VyUmVuZGVyZXIudHMiLCJpbXBvcnQgeyBTeXN0ZW1fQXJyYXksIFBvaW50ZXIgfSBmcm9tICcuLi9QbGF0Zm9ybS9QbGF0Zm9ybSc7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gJy4uL0Vudmlyb25tZW50JztcbmNvbnN0IHJlbmRlclRyZWVFZGl0U3RydWN0TGVuZ3RoID0gMTY7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZW5kZXJUcmVlRWRpdFB0cihyZW5kZXJUcmVlRWRpdHM6IFN5c3RlbV9BcnJheTxSZW5kZXJUcmVlRWRpdFBvaW50ZXI+LCBpbmRleDogbnVtYmVyKSB7XG4gIHJldHVybiBwbGF0Zm9ybS5nZXRBcnJheUVudHJ5UHRyKHJlbmRlclRyZWVFZGl0cywgaW5kZXgsIHJlbmRlclRyZWVFZGl0U3RydWN0TGVuZ3RoKTtcbn1cblxuZXhwb3J0IGNvbnN0IHJlbmRlclRyZWVFZGl0ID0ge1xuICAvLyBUaGUgcHJvcGVydGllcyBhbmQgbWVtb3J5IGxheW91dCBtdXN0IGJlIGtlcHQgaW4gc3luYyB3aXRoIHRoZSAuTkVUIGVxdWl2YWxlbnQgaW4gUmVuZGVyVHJlZUVkaXQuY3NcbiAgdHlwZTogKGVkaXQ6IFJlbmRlclRyZWVFZGl0UG9pbnRlcikgPT4gcGxhdGZvcm0ucmVhZEludDMyRmllbGQoZWRpdCwgMCkgYXMgRWRpdFR5cGUsXG4gIHNpYmxpbmdJbmRleDogKGVkaXQ6IFJlbmRlclRyZWVFZGl0UG9pbnRlcikgPT4gcGxhdGZvcm0ucmVhZEludDMyRmllbGQoZWRpdCwgNCksXG4gIG5ld1RyZWVJbmRleDogKGVkaXQ6IFJlbmRlclRyZWVFZGl0UG9pbnRlcikgPT4gcGxhdGZvcm0ucmVhZEludDMyRmllbGQoZWRpdCwgOCksXG4gIHJlbW92ZWRBdHRyaWJ1dGVOYW1lOiAoZWRpdDogUmVuZGVyVHJlZUVkaXRQb2ludGVyKSA9PiBwbGF0Zm9ybS5yZWFkU3RyaW5nRmllbGQoZWRpdCwgMTIpLFxufTtcblxuZXhwb3J0IGVudW0gRWRpdFR5cGUge1xuICBwcmVwZW5kRnJhbWUgPSAxLFxuICByZW1vdmVGcmFtZSA9IDIsXG4gIHNldEF0dHJpYnV0ZSA9IDMsXG4gIHJlbW92ZUF0dHJpYnV0ZSA9IDQsXG4gIHVwZGF0ZVRleHQgPSA1LFxuICBzdGVwSW4gPSA2LFxuICBzdGVwT3V0ID0gNyxcbn1cblxuLy8gTm9taW5hbCB0eXBlIHRvIGVuc3VyZSBvbmx5IHZhbGlkIHBvaW50ZXJzIGFyZSBwYXNzZWQgdG8gdGhlIHJlbmRlclRyZWVFZGl0IGZ1bmN0aW9ucy5cbi8vIEF0IHJ1bnRpbWUgdGhlIHZhbHVlcyBhcmUganVzdCBudW1iZXJzLlxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJUcmVlRWRpdFBvaW50ZXIgZXh0ZW5kcyBQb2ludGVyIHsgUmVuZGVyVHJlZUVkaXRQb2ludGVyX19ET19OT1RfSU1QTEVNRU5UOiBhbnkgfVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1JlbmRlcmluZy9SZW5kZXJUcmVlRWRpdC50cyIsImltcG9ydCB7IFN5c3RlbV9TdHJpbmcsIFN5c3RlbV9BcnJheSwgUG9pbnRlciB9IGZyb20gJy4uL1BsYXRmb3JtL1BsYXRmb3JtJztcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSAnLi4vRW52aXJvbm1lbnQnO1xuY29uc3QgcmVuZGVyVHJlZUZyYW1lU3RydWN0TGVuZ3RoID0gMjg7XG5cbi8vIFRvIG1pbmltaXNlIEdDIHByZXNzdXJlLCBpbnN0ZWFkIG9mIGluc3RhbnRpYXRpbmcgYSBKUyBvYmplY3QgdG8gcmVwcmVzZW50IGVhY2ggdHJlZSBmcmFtZSxcbi8vIHdlIHdvcmsgaW4gdGVybXMgb2YgcG9pbnRlcnMgdG8gdGhlIHN0cnVjdHMgb24gdGhlIC5ORVQgaGVhcCwgYW5kIHVzZSBzdGF0aWMgZnVuY3Rpb25zIHRoYXRcbi8vIGtub3cgaG93IHRvIHJlYWQgcHJvcGVydHkgdmFsdWVzIGZyb20gdGhvc2Ugc3RydWN0cy5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyZWVGcmFtZVB0cihyZW5kZXJUcmVlRW50cmllczogU3lzdGVtX0FycmF5PFJlbmRlclRyZWVGcmFtZVBvaW50ZXI+LCBpbmRleDogbnVtYmVyKSB7XG4gIHJldHVybiBwbGF0Zm9ybS5nZXRBcnJheUVudHJ5UHRyKHJlbmRlclRyZWVFbnRyaWVzLCBpbmRleCwgcmVuZGVyVHJlZUZyYW1lU3RydWN0TGVuZ3RoKTtcbn1cblxuZXhwb3J0IGNvbnN0IHJlbmRlclRyZWVGcmFtZSA9IHtcbiAgLy8gVGhlIHByb3BlcnRpZXMgYW5kIG1lbW9yeSBsYXlvdXQgbXVzdCBiZSBrZXB0IGluIHN5bmMgd2l0aCB0aGUgLk5FVCBlcXVpdmFsZW50IGluIFJlbmRlclRyZWVGcmFtZS5jc1xuICBmcmFtZVR5cGU6IChmcmFtZTogUmVuZGVyVHJlZUZyYW1lUG9pbnRlcikgPT4gcGxhdGZvcm0ucmVhZEludDMyRmllbGQoZnJhbWUsIDQpIGFzIEZyYW1lVHlwZSxcbiAgc3VidHJlZUxlbmd0aDogKGZyYW1lOiBSZW5kZXJUcmVlRnJhbWVQb2ludGVyKSA9PiBwbGF0Zm9ybS5yZWFkSW50MzJGaWVsZChmcmFtZSwgOCkgYXMgRnJhbWVUeXBlLFxuICBjb21wb25lbnRJZDogKGZyYW1lOiBSZW5kZXJUcmVlRnJhbWVQb2ludGVyKSA9PiBwbGF0Zm9ybS5yZWFkSW50MzJGaWVsZChmcmFtZSwgMTIpLFxuICBlbGVtZW50TmFtZTogKGZyYW1lOiBSZW5kZXJUcmVlRnJhbWVQb2ludGVyKSA9PiBwbGF0Zm9ybS5yZWFkU3RyaW5nRmllbGQoZnJhbWUsIDE2KSxcbiAgdGV4dENvbnRlbnQ6IChmcmFtZTogUmVuZGVyVHJlZUZyYW1lUG9pbnRlcikgPT4gcGxhdGZvcm0ucmVhZFN0cmluZ0ZpZWxkKGZyYW1lLCAxNiksXG4gIGF0dHJpYnV0ZU5hbWU6IChmcmFtZTogUmVuZGVyVHJlZUZyYW1lUG9pbnRlcikgPT4gcGxhdGZvcm0ucmVhZFN0cmluZ0ZpZWxkKGZyYW1lLCAxNiksXG4gIGF0dHJpYnV0ZVZhbHVlOiAoZnJhbWU6IFJlbmRlclRyZWVGcmFtZVBvaW50ZXIpID0+IHBsYXRmb3JtLnJlYWRTdHJpbmdGaWVsZChmcmFtZSwgMjQpLFxuICBhdHRyaWJ1dGVFdmVudEhhbmRsZXJJZDogKGZyYW1lOiBSZW5kZXJUcmVlRnJhbWVQb2ludGVyKSA9PiBwbGF0Zm9ybS5yZWFkSW50MzJGaWVsZChmcmFtZSwgOCksXG59O1xuXG5leHBvcnQgZW51bSBGcmFtZVR5cGUge1xuICAvLyBUaGUgdmFsdWVzIG11c3QgYmUga2VwdCBpbiBzeW5jIHdpdGggdGhlIC5ORVQgZXF1aXZhbGVudCBpbiBSZW5kZXJUcmVlRnJhbWVUeXBlLmNzXG4gIGVsZW1lbnQgPSAxLFxuICB0ZXh0ID0gMixcbiAgYXR0cmlidXRlID0gMyxcbiAgY29tcG9uZW50ID0gNCxcbn1cblxuLy8gTm9taW5hbCB0eXBlIHRvIGVuc3VyZSBvbmx5IHZhbGlkIHBvaW50ZXJzIGFyZSBwYXNzZWQgdG8gdGhlIHJlbmRlclRyZWVGcmFtZSBmdW5jdGlvbnMuXG4vLyBBdCBydW50aW1lIHRoZSB2YWx1ZXMgYXJlIGp1c3QgbnVtYmVycy5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyVHJlZUZyYW1lUG9pbnRlciBleHRlbmRzIFBvaW50ZXIgeyBSZW5kZXJUcmVlRnJhbWVQb2ludGVyX19ET19OT1RfSU1QTEVNRU5UOiBhbnkgfVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1JlbmRlcmluZy9SZW5kZXJUcmVlRnJhbWUudHMiLCJpbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gJy4vRW52aXJvbm1lbnQnXG5pbXBvcnQgeyByZWdpc3RlckZ1bmN0aW9uIH0gZnJvbSAnLi9JbnRlcm9wL1JlZ2lzdGVyZWRGdW5jdGlvbic7XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAvLyBXaGVuIHRoZSBsaWJyYXJ5IGlzIGxvYWRlZCBpbiBhIGJyb3dzZXIgdmlhIGEgPHNjcmlwdD4gZWxlbWVudCwgbWFrZSB0aGVcbiAgLy8gZm9sbG93aW5nIEFQSXMgYXZhaWxhYmxlIGluIGdsb2JhbCBzY29wZSBmb3IgaW52b2NhdGlvbiBmcm9tIEpTXG4gIHdpbmRvd1snQmxhem9yJ10gPSB7XG4gICAgcGxhdGZvcm0sXG4gICAgcmVnaXN0ZXJGdW5jdGlvbixcbiAgfTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9HbG9iYWxFeHBvcnRzLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../universe-lib/dist/index.js
var require_dist = __commonJS({
  "../universe-lib/dist/index.js"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var __decorateClass = (decorators, target, key, kind) => {
      var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc2(target, key) : target;
      for (var i = decorators.length - 1, decorator; i >= 0; i--)
        if (decorator = decorators[i])
          result = (kind ? decorator(target, key, result) : decorator(result)) || result;
      if (kind && result) __defProp2(target, key, result);
      return result;
    };
    var index_exports = {};
    __export(index_exports, {
      Barrier: () => Barrier,
      BufferReader: () => BufferReader,
      BufferWriter: () => BufferWriter,
      BufferedEmitter: () => BufferedEmitter,
      CancellationError: () => CancellationError,
      ChannelClient: () => ChannelClient,
      ChannelServer: () => ChannelServer,
      ChunkStream: () => ChunkStream,
      Disposable: () => Disposable,
      DisposableStore: () => DisposableStore,
      EAccess: () => EAccess,
      Emitter: () => Emitter2,
      ErrorHandler: () => ErrorHandler,
      ErrorNoTelemetry: () => ErrorNoTelemetry,
      Event: () => Event,
      EventMultiplexer: () => EventMultiplexer,
      EventProfiling: () => EventProfiling,
      IInstantiationService: () => IInstantiationService,
      IPCClient: () => IPCClient,
      IPCLogger: () => IPCLogger,
      IPCServer: () => IPCServer,
      IdleValue: () => IdleValue,
      InstantiationService: () => InstantiationService,
      NetIPCClient: () => NetIPCClient,
      NodeIPCServer: () => NodeIPCServer,
      NodeSocket: () => NodeSocket,
      PauseableEmitter: () => PauseableEmitter,
      PersistentProtocol: () => PersistentProtocol,
      Protocol: () => Protocol,
      ProtocolConstants: () => ProtocolConstants,
      ProxyChannel: () => ProxyChannel3,
      Relay: () => Relay,
      RequestInitiator: () => RequestInitiator,
      ResolvablePromise: () => ResolvablePromise,
      ServiceCollection: () => ServiceCollection,
      SocketCloseEventType: () => SocketCloseEventType,
      SocketDiagnostics: () => SocketDiagnostics,
      SocketDiagnosticsEventType: () => SocketDiagnosticsEventType,
      StaticRouter: () => StaticRouter,
      SyncDescriptor: () => SyncDescriptor,
      Trace: () => Trace,
      URI: () => URI,
      VSBuffer: () => VSBuffer,
      WebSocketNodeSocket: () => WebSocketNodeSocket,
      XDG_RUNTIME_DIR: () => XDG_RUNTIME_DIR,
      _registry: () => _registry,
      _util: () => _util,
      addFieldToJsonPathString: () => addFieldToJsonPathString,
      addFieldsByJsonPath: () => addFieldsByJsonPath,
      applyDiff: () => applyDiff,
      areFunctions: () => areFunctions,
      assertAllDefined: () => assertAllDefined,
      assertIsDefined: () => assertIsDefined,
      assertType: () => assertType,
      basename: () => basename,
      binaryIndexOf: () => binaryIndexOf,
      bufferToReadable: () => bufferToReadable,
      bufferToStream: () => bufferToStream,
      bufferedStreamToBuffer: () => bufferedStreamToBuffer,
      combinedDisposable: () => combinedDisposable,
      commonPrefixLength: () => commonPrefixLength,
      commonSuffixLength: () => commonSuffixLength,
      compare: () => compare,
      compareIgnoreCase: () => compareIgnoreCase,
      compareSubstring: () => compareSubstring,
      compareSubstringIgnoreCase: () => compareSubstringIgnoreCase,
      computeCodePoint: () => computeCodePoint,
      connect: () => connect,
      createCancelablePromise: () => createCancelablePromise,
      createDecorator: () => createDecorator2,
      createDiff: () => createDiff,
      createEventDeliveryQueue: () => createEventDeliveryQueue,
      createRandomIPCHandle: () => createRandomIPCHandle,
      createStaticIPCHandle: () => createStaticIPCHandle,
      debounce: () => debounce,
      decodeBase64: () => decodeBase64,
      deepClone: () => deepClone,
      deepEquals: () => deepEquals,
      deleteFieldsByJsonPath: () => deleteFieldsByJsonPath,
      delimiter: () => delimiter,
      deserialize: () => deserialize,
      dirname: () => dirname,
      dispose: () => dispose,
      encodeBase64: () => encodeBase64,
      equalsIgnoreCase: () => equalsIgnoreCase,
      errorHandler: () => errorHandler,
      extname: () => extname,
      format: () => format,
      fuzzyContains: () => fuzzyContains,
      generateUuid: () => generateUuid,
      getDelayedChannel: () => getDelayedChannel,
      getNextTickChannel: () => getNextTickChannel,
      getObjectId: () => getObjectId,
      getSingletonServiceDescriptors: () => getSingletonServiceDescriptors,
      getValueByJsonPath: () => getValueByJsonPath,
      isAbsolute: () => isAbsolute,
      isArray: () => isArray,
      isAsciiDigit: () => isAsciiDigit,
      isBoolean: () => isBoolean,
      isCancellationError: () => isCancellationError,
      isDefined: () => isDefined,
      isEmptyObject: () => isEmptyObject,
      isFunction: () => isFunction,
      isHighSurrogate: () => isHighSurrogate,
      isIterable: () => isIterable,
      isLowSurrogate: () => isLowSurrogate,
      isLowerAsciiLetter: () => isLowerAsciiLetter,
      isNumber: () => isNumber,
      isObject: () => isObject,
      isString: () => isString,
      isStringArray: () => isStringArray,
      isThenable: () => isThenable,
      isTypedArray: () => isTypedArray,
      isUUID: () => isUUID,
      isUndefined: () => isUndefined,
      isUndefinedOrNull: () => isUndefinedOrNull,
      isUpperAsciiLetter: () => isUpperAsciiLetter,
      isUriComponents: () => isUriComponents,
      join: () => join,
      jsonPathToString: () => jsonPathToString,
      ltrim: () => ltrim,
      markAsDisposed: () => markAsDisposed,
      matchesGlob: () => matchesGlob,
      memoize: () => memoize,
      newWriteableBufferStream: () => newWriteableBufferStream,
      normalize: () => normalize,
      onUnexpectedError: () => onUnexpectedError,
      onUnexpectedExternalError: () => onUnexpectedExternalError,
      orderObject: () => orderObject,
      parse: () => parse,
      parseJsonSafe: () => parseJsonSafe,
      posix: () => posix,
      prefixedBufferReadable: () => prefixedBufferReadable,
      prefixedBufferStream: () => prefixedBufferStream,
      raceCancellablePromises: () => raceCancellablePromises,
      raceCancellation: () => raceCancellation,
      raceCancellationError: () => raceCancellationError,
      raceTimeout: () => raceTimeout,
      readUInt16LE: () => readUInt16LE,
      readUInt32BE: () => readUInt32BE,
      readUInt32LE: () => readUInt32LE,
      readUInt8: () => readUInt8,
      readableToBuffer: () => readableToBuffer,
      registerSingleton: () => registerSingleton,
      relative: () => relative,
      removeNullField: () => removeNullField,
      resolve: () => resolve,
      rtrim: () => rtrim,
      runWhenIdle: () => runWhenIdle,
      safe: () => safe,
      safeRun: () => safeRun,
      safeWrap: () => safeWrap,
      sep: () => sep,
      serialize: () => serialize,
      serve: () => serve2,
      setDisposableTracker: () => setDisposableTracker,
      setGlobalLeakWarningThreshold: () => setGlobalLeakWarningThreshold,
      setUnexpectedErrorHandler: () => setUnexpectedErrorHandler,
      setValueByJsonPath: () => setValueByJsonPath,
      stableStringify: () => stableStringify,
      startsWithIgnoreCase: () => startsWithIgnoreCase,
      streamToBuffer: () => streamToBuffer,
      streamToBufferReadableStream: () => streamToBufferReadableStream,
      stringToJsonPath: () => stringToJsonPath,
      stringify: () => stringify,
      throttle: () => throttle,
      timeout: () => timeout,
      toDisposable: () => toDisposable,
      toNamespacedPath: () => toNamespacedPath,
      trackDisposable: () => trackDisposable,
      trim: () => trim,
      uriToFsPath: () => uriToFsPath,
      validateConstraint: () => validateConstraint,
      validateConstraints: () => validateConstraints,
      wait: () => wait,
      waitCondition: () => waitCondition,
      win32: () => win32,
      writeUInt16LE: () => writeUInt16LE,
      writeUInt32BE: () => writeUInt32BE,
      writeUInt32LE: () => writeUInt32LE,
      writeUInt8: () => writeUInt8
    });
    module2.exports = __toCommonJS(index_exports);
    var LANGUAGE_DEFAULT = "en";
    var _isWindows = false;
    var _isMacintosh = false;
    var _isLinux = false;
    var _isLinuxSnap = false;
    var _isNative = false;
    var _isWeb = false;
    var _isElectron = false;
    var _isIOS = false;
    var _isCI = false;
    var _isMobile = false;
    var _locale = void 0;
    var _language = LANGUAGE_DEFAULT;
    var _platformLocale = LANGUAGE_DEFAULT;
    var _translationsConfigFile = void 0;
    var _userAgent = void 0;
    var globals = typeof self === "object" ? self : typeof global === "object" ? global : {};
    var nodeProcess = void 0;
    if (typeof globals.vscode !== "undefined" && typeof globals.vscode.process !== "undefined") {
      nodeProcess = globals.vscode.process;
    } else if (typeof process !== "undefined") {
      nodeProcess = process;
    }
    var isElectronProcess = typeof nodeProcess?.versions?.electron === "string";
    var isElectronRenderer = isElectronProcess && nodeProcess?.type === "renderer";
    if (typeof navigator === "object" && !isElectronRenderer) {
      _userAgent = navigator.userAgent;
      _isWindows = _userAgent.indexOf("Windows") >= 0;
      _isMacintosh = _userAgent.indexOf("Macintosh") >= 0;
      _isIOS = (_userAgent.indexOf("Macintosh") >= 0 || _userAgent.indexOf("iPad") >= 0 || _userAgent.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
      _isLinux = _userAgent.indexOf("Linux") >= 0;
      _isMobile = _userAgent?.indexOf("Mobi") >= 0;
      _isWeb = true;
      const configuredLocale = "_";
      _locale = configuredLocale || LANGUAGE_DEFAULT;
      _language = _locale;
      _platformLocale = navigator.language;
    } else if (typeof nodeProcess === "object") {
      _isWindows = nodeProcess.platform === "win32";
      _isMacintosh = nodeProcess.platform === "darwin";
      _isLinux = nodeProcess.platform === "linux";
      _isLinuxSnap = _isLinux && !!nodeProcess.env["SNAP"] && !!nodeProcess.env["SNAP_REVISION"];
      _isElectron = isElectronProcess;
      _isCI = !!nodeProcess.env["CI"] || !!nodeProcess.env["BUILD_ARTIFACTSTAGINGDIRECTORY"];
      _locale = LANGUAGE_DEFAULT;
      _language = LANGUAGE_DEFAULT;
      const rawNlsConfig = nodeProcess.env["VSCODE_NLS_CONFIG"];
      if (rawNlsConfig) {
        try {
          const nlsConfig = JSON.parse(rawNlsConfig);
          const resolved = nlsConfig.availableLanguages["*"];
          _locale = nlsConfig.locale;
          _platformLocale = nlsConfig.osLocale;
          _language = resolved ? resolved : LANGUAGE_DEFAULT;
          _translationsConfigFile = nlsConfig._translationsConfigFile;
        } catch (_e) {
        }
      }
      _isNative = true;
    } else {
      console.error("Unable to resolve platform.");
    }
    var _platform = 0;
    if (_isMacintosh) {
      _platform = 1;
    } else if (_isWindows) {
      _platform = 3;
    } else if (_isLinux) {
      _platform = 2;
    }
    var isWindows = _isWindows;
    var isMacintosh = _isMacintosh;
    var isWebWorker = _isWeb && typeof globals.importScripts === "function";
    var platform = _platform;
    var userAgent = _userAgent;
    var language = _language;
    var Language;
    ((Language2) => {
      function value() {
        return language;
      }
      Language2.value = value;
      function isDefaultVariant() {
        if (language.length === 2) {
          return language === "en";
        } else if (language.length >= 3) {
          return language[0] === "e" && language[1] === "n" && language[2] === "-";
        } else {
          return false;
        }
      }
      Language2.isDefaultVariant = isDefaultVariant;
      function isDefault() {
        return language === "en";
      }
      Language2.isDefault = isDefault;
    })(Language || (Language = {}));
    var setTimeout0IsFaster = typeof globals.postMessage === "function" && !globals.importScripts;
    var setTimeout0 = (() => {
      if (setTimeout0IsFaster) {
        const pending = [];
        globals.addEventListener("message", (e) => {
          if (e.data && e.data.vscodeScheduleAsyncWork) {
            for (let i = 0, len = pending.length; i < len; i++) {
              const candidate = pending[i];
              if (candidate.id === e.data.vscodeScheduleAsyncWork) {
                pending.splice(i, 1);
                candidate.callback();
                return;
              }
            }
          }
        });
        let lastId = 0;
        return (callback) => {
          const myId = ++lastId;
          pending.push({
            id: myId,
            callback
          });
          globals.postMessage({ vscodeScheduleAsyncWork: myId }, "*");
        };
      }
      return (callback) => setTimeout(callback);
    })();
    var isChrome = !!(userAgent && userAgent.indexOf("Chrome") >= 0);
    var isFirefox = !!(userAgent && userAgent.indexOf("Firefox") >= 0);
    var isSafari = !!(!isChrome && userAgent && userAgent.indexOf("Safari") >= 0);
    var isEdge = !!(userAgent && userAgent.indexOf("Edg/") >= 0);
    var isAndroid = !!(userAgent && userAgent.indexOf("Android") >= 0);
    var safeProcess;
    if (typeof globals.vscode !== "undefined" && typeof globals.vscode.process !== "undefined") {
      const sandboxProcess = globals.vscode.process;
      safeProcess = {
        get platform() {
          return sandboxProcess.platform;
        },
        get arch() {
          return sandboxProcess.arch;
        },
        get env() {
          return sandboxProcess.env;
        },
        cwd() {
          return sandboxProcess.cwd();
        }
      };
    } else if (typeof process !== "undefined") {
      safeProcess = {
        get platform() {
          return process.platform;
        },
        get arch() {
          return process.arch;
        },
        get env() {
          return process.env;
        },
        cwd() {
          return process.env["VSCODE_CWD"] || process.cwd();
        }
      };
    } else {
      safeProcess = {
        // Supported
        get platform() {
          return isWindows ? "win32" : isMacintosh ? "darwin" : "linux";
        },
        get arch() {
          return void 0;
        },
        // Unsupported
        get env() {
          return {};
        },
        cwd() {
          return "/";
        }
      };
    }
    var cwd = safeProcess.cwd;
    var env = safeProcess.env;
    var platform2 = safeProcess.platform;
    var arch = safeProcess.arch;
    var CHAR_UPPERCASE_A = 65;
    var CHAR_LOWERCASE_A = 97;
    var CHAR_UPPERCASE_Z = 90;
    var CHAR_LOWERCASE_Z = 122;
    var CHAR_DOT = 46;
    var CHAR_FORWARD_SLASH = 47;
    var CHAR_BACKWARD_SLASH = 92;
    var CHAR_COLON = 58;
    var CHAR_QUESTION_MARK = 63;
    var ErrorInvalidArgType = class extends Error {
      code;
      constructor(name, expected, actual) {
        let determiner;
        if (typeof expected === "string" && expected.indexOf("not ") === 0) {
          determiner = "must not be";
          expected = expected.replace(/^not /, "");
        } else {
          determiner = "must be";
        }
        const type = name.indexOf(".") !== -1 ? "property" : "argument";
        let msg = `The "${name}" ${type} ${determiner} of type ${expected}`;
        msg += `. Received type ${typeof actual}`;
        super(msg);
        this.code = "ERR_INVALID_ARG_TYPE";
      }
    };
    function validateObject(pathObject, name) {
      if (pathObject === null || typeof pathObject !== "object") {
        throw new ErrorInvalidArgType(name, "Object", pathObject);
      }
    }
    function validateString(value, name) {
      if (typeof value !== "string") {
        throw new ErrorInvalidArgType(name, "string", value);
      }
    }
    var platformIsWin32 = platform2 === "win32";
    function isPathSeparator(code) {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    }
    function isPosixPathSeparator(code) {
      return code === CHAR_FORWARD_SLASH;
    }
    function isWindowsDeviceRoot(code) {
      return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z || code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
    }
    function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
      let res = "";
      let lastSegmentLength = 0;
      let lastSlash = -1;
      let dots = 0;
      let code = 0;
      for (let i = 0; i <= path.length; ++i) {
        if (i < path.length) {
          code = path.charCodeAt(i);
        } else if (isPathSeparator2(code)) {
          break;
        } else {
          code = CHAR_FORWARD_SLASH;
        }
        if (isPathSeparator2(code)) {
          if (lastSlash === i - 1 || dots === 1) {
          } else if (dots === 2) {
            if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
              if (res.length > 2) {
                const lastSlashIndex = res.lastIndexOf(separator);
                if (lastSlashIndex === -1) {
                  res = "";
                  lastSegmentLength = 0;
                } else {
                  res = res.slice(0, lastSlashIndex);
                  lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                }
                lastSlash = i;
                dots = 0;
                continue;
              } else if (res.length !== 0) {
                res = "";
                lastSegmentLength = 0;
                lastSlash = i;
                dots = 0;
                continue;
              }
            }
            if (allowAboveRoot) {
              res += res.length > 0 ? `${separator}..` : "..";
              lastSegmentLength = 2;
            }
          } else {
            if (res.length > 0) {
              res += `${separator}${path.slice(lastSlash + 1, i)}`;
            } else {
              res = path.slice(lastSlash + 1, i);
            }
            lastSegmentLength = i - lastSlash - 1;
          }
          lastSlash = i;
          dots = 0;
        } else if (code === CHAR_DOT && dots !== -1) {
          ++dots;
        } else {
          dots = -1;
        }
      }
      return res;
    }
    function _format(sep2, pathObject) {
      validateObject(pathObject, "pathObject");
      const dir = pathObject.dir || pathObject.root;
      const base = pathObject.base || `${pathObject.name || ""}${pathObject.ext || ""}`;
      if (!dir) {
        return base;
      }
      return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep2}${base}`;
    }
    var win32 = {
      // path.resolve([from ...], to)
      resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1; i--) {
          let path;
          if (i >= 0) {
            path = pathSegments[i];
            validateString(path, "path");
            if (path.length === 0) {
              continue;
            }
          } else if (resolvedDevice.length === 0) {
            path = cwd();
          } else {
            path = env[`=${resolvedDevice}`] || cwd();
            if (path === void 0 || path.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() && path.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
              path = `${resolvedDevice}\\`;
            }
          }
          const len = path.length;
          let rootEnd = 0;
          let device = "";
          let isAbsolute2 = false;
          const code = path.charCodeAt(0);
          if (len === 1) {
            if (isPathSeparator(code)) {
              rootEnd = 1;
              isAbsolute2 = true;
            }
          } else if (isPathSeparator(code)) {
            isAbsolute2 = true;
            if (isPathSeparator(path.charCodeAt(1))) {
              let j = 2;
              let last = j;
              while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                const firstPart = path.slice(last, j);
                last = j;
                while (j < len && isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j < len && j !== last) {
                  last = j;
                  while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                    j++;
                  }
                  if (j === len || j !== last) {
                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                    rootEnd = j;
                  }
                }
              }
            } else {
              rootEnd = 1;
            }
          } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
            device = path.slice(0, 2);
            rootEnd = 2;
            if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
              isAbsolute2 = true;
              rootEnd = 3;
            }
          }
          if (device.length > 0) {
            if (resolvedDevice.length > 0) {
              if (device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                continue;
              }
            } else {
              resolvedDevice = device;
            }
          }
          if (resolvedAbsolute) {
            if (resolvedDevice.length > 0) {
              break;
            }
          } else {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute2;
            if (isAbsolute2 && resolvedDevice.length > 0) {
              break;
            }
          }
        }
        resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
        return resolvedAbsolute ? `${resolvedDevice}\\${resolvedTail}` : `${resolvedDevice}${resolvedTail}` || ".";
      },
      normalize(path) {
        validateString(path, "path");
        const len = path.length;
        if (len === 0) {
          return ".";
        }
        let rootEnd = 0;
        let device;
        let isAbsolute2 = false;
        const code = path.charCodeAt(0);
        if (len === 1) {
          return isPosixPathSeparator(code) ? "\\" : path;
        }
        if (isPathSeparator(code)) {
          isAbsolute2 = true;
          if (isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              const firstPart = path.slice(last, j);
              last = j;
              while (j < len && isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  return `\\\\${firstPart}\\${path.slice(last)}\\`;
                }
                if (j !== last) {
                  device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                  rootEnd = j;
                }
              }
            }
          } else {
            rootEnd = 1;
          }
        } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
            isAbsolute2 = true;
            rootEnd = 3;
          }
        }
        let tail = rootEnd < len ? normalizeString(path.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator) : "";
        if (tail.length === 0 && !isAbsolute2) {
          tail = ".";
        }
        if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
          tail += "\\";
        }
        if (device === void 0) {
          return isAbsolute2 ? `\\${tail}` : tail;
        }
        return isAbsolute2 ? `${device}\\${tail}` : `${device}${tail}`;
      },
      isAbsolute(path) {
        validateString(path, "path");
        const len = path.length;
        if (len === 0) {
          return false;
        }
        const code = path.charCodeAt(0);
        return isPathSeparator(code) || // Possible device root
        len > 2 && isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON && isPathSeparator(path.charCodeAt(2));
      },
      join(...paths) {
        if (paths.length === 0) {
          return ".";
        }
        let joined;
        let firstPart;
        for (let i = 0; i < paths.length; ++i) {
          const arg = paths[i];
          validateString(arg, "path");
          if (arg.length > 0) {
            if (joined === void 0) {
              joined = firstPart = arg;
            } else {
              joined += `\\${arg}`;
            }
          }
        }
        if (joined === void 0) {
          return ".";
        }
        let needsReplace = true;
        let slashCount = 0;
        if (typeof firstPart === "string" && isPathSeparator(firstPart.charCodeAt(0))) {
          ++slashCount;
          const firstLen = firstPart.length;
          if (firstLen > 1 && isPathSeparator(firstPart.charCodeAt(1))) {
            ++slashCount;
            if (firstLen > 2) {
              if (isPathSeparator(firstPart.charCodeAt(2))) {
                ++slashCount;
              } else {
                needsReplace = false;
              }
            }
          }
        }
        if (needsReplace) {
          while (slashCount < joined.length && isPathSeparator(joined.charCodeAt(slashCount))) {
            slashCount++;
          }
          if (slashCount >= 2) {
            joined = `\\${joined.slice(slashCount)}`;
          }
        }
        return win32.normalize(joined);
      },
      // It will solve the relative path from `from` to `to`, for instance:
      //  from = 'C:\\orandea\\test\\aaa'
      //  to = 'C:\\orandea\\impl\\bbb'
      // The output of the function should be: '..\\..\\impl\\bbb'
      relative(from, to) {
        validateString(from, "from");
        validateString(to, "to");
        if (from === to) {
          return "";
        }
        const fromOrig = win32.resolve(from);
        const toOrig = win32.resolve(to);
        if (fromOrig === toOrig) {
          return "";
        }
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to) {
          return "";
        }
        let fromStart = 0;
        while (fromStart < from.length && from.charCodeAt(fromStart) === CHAR_BACKWARD_SLASH) {
          fromStart++;
        }
        let fromEnd = from.length;
        while (fromEnd - 1 > fromStart && from.charCodeAt(fromEnd - 1) === CHAR_BACKWARD_SLASH) {
          fromEnd--;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 0;
        while (toStart < to.length && to.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
          toStart++;
        }
        let toEnd = to.length;
        while (toEnd - 1 > toStart && to.charCodeAt(toEnd - 1) === CHAR_BACKWARD_SLASH) {
          toEnd--;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i < length; i++) {
          const fromCode = from.charCodeAt(fromStart + i);
          if (fromCode !== to.charCodeAt(toStart + i)) {
            break;
          } else if (fromCode === CHAR_BACKWARD_SLASH) {
            lastCommonSep = i;
          }
        }
        if (i !== length) {
          if (lastCommonSep === -1) {
            return toOrig;
          }
        } else {
          if (toLen > length) {
            if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
              return toOrig.slice(toStart + i + 1);
            }
            if (i === 2) {
              return toOrig.slice(toStart + i);
            }
          }
          if (fromLen > length) {
            if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
              lastCommonSep = i;
            } else if (i === 2) {
              lastCommonSep = 3;
            }
          }
          if (lastCommonSep === -1) {
            lastCommonSep = 0;
          }
        }
        let out = "";
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
          if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
            out += out.length === 0 ? ".." : "\\..";
          }
        }
        toStart += lastCommonSep;
        if (out.length > 0) {
          return `${out}${toOrig.slice(toStart, toEnd)}`;
        }
        if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
          ++toStart;
        }
        return toOrig.slice(toStart, toEnd);
      },
      toNamespacedPath(path) {
        if (typeof path !== "string" || path.length === 0) {
          return path;
        }
        const resolvedPath = win32.resolve(path);
        if (resolvedPath.length <= 2) {
          return path;
        }
        if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
          if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
            const code = resolvedPath.charCodeAt(2);
            if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
              return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
            }
          }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0)) && resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
          return `\\\\?\\${resolvedPath}`;
        }
        return path;
      },
      dirname(path) {
        validateString(path, "path");
        const len = path.length;
        if (len === 0) {
          return ".";
        }
        let rootEnd = -1;
        let offset = 0;
        const code = path.charCodeAt(0);
        if (len === 1) {
          return isPathSeparator(code) ? path : ".";
        }
        if (isPathSeparator(code)) {
          rootEnd = offset = 1;
          if (isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  return path;
                }
                if (j !== last) {
                  rootEnd = offset = j + 1;
                }
              }
            }
          }
        } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
          rootEnd = len > 2 && isPathSeparator(path.charCodeAt(2)) ? 3 : 2;
          offset = rootEnd;
        }
        let end = -1;
        let matchedSlash = true;
        for (let i = len - 1; i >= offset; --i) {
          if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
              end = i;
              break;
            }
          } else {
            matchedSlash = false;
          }
        }
        if (end === -1) {
          if (rootEnd === -1) {
            return ".";
          }
          end = rootEnd;
        }
        return path.slice(0, end);
      },
      basename(path, ext) {
        if (ext !== void 0) {
          validateString(ext, "ext");
        }
        validateString(path, "path");
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (path.length >= 2 && isWindowsDeviceRoot(path.charCodeAt(0)) && path.charCodeAt(1) === CHAR_COLON) {
          start = 2;
        }
        if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
          if (ext === path) {
            return "";
          }
          let extIdx = ext.length - 1;
          let firstNonSlashEnd = -1;
          for (i = path.length - 1; i >= start; --i) {
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
              if (!matchedSlash) {
                start = i + 1;
                break;
              }
            } else {
              if (firstNonSlashEnd === -1) {
                matchedSlash = false;
                firstNonSlashEnd = i + 1;
              }
              if (extIdx >= 0) {
                if (code === ext.charCodeAt(extIdx)) {
                  if (--extIdx === -1) {
                    end = i;
                  }
                } else {
                  extIdx = -1;
                  end = firstNonSlashEnd;
                }
              }
            }
          }
          if (start === end) {
            end = firstNonSlashEnd;
          } else if (end === -1) {
            end = path.length;
          }
          return path.slice(start, end);
        }
        for (i = path.length - 1; i >= start; --i) {
          if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
        }
        if (end === -1) {
          return "";
        }
        return path.slice(start, end);
      },
      extname(path) {
        validateString(path, "path");
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        if (path.length >= 2 && path.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path.charCodeAt(0))) {
          start = startPart = 2;
        }
        for (let i = path.length - 1; i >= start; --i) {
          const code = path.charCodeAt(i);
          if (isPathSeparator(code)) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
        preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          return "";
        }
        return path.slice(startDot, end);
      },
      format: _format.bind(null, "\\"),
      parse(path) {
        validateString(path, "path");
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path.length === 0) {
          return ret;
        }
        const len = path.length;
        let rootEnd = 0;
        let code = path.charCodeAt(0);
        if (len === 1) {
          if (isPathSeparator(code)) {
            ret.root = ret.dir = path;
            return ret;
          }
          ret.base = ret.name = path;
          return ret;
        }
        if (isPathSeparator(code)) {
          rootEnd = 1;
          if (isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  rootEnd = j;
                } else if (j !== last) {
                  rootEnd = j + 1;
                }
              }
            }
          }
        } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
          if (len <= 2) {
            ret.root = ret.dir = path;
            return ret;
          }
          rootEnd = 2;
          if (isPathSeparator(path.charCodeAt(2))) {
            if (len === 3) {
              ret.root = ret.dir = path;
              return ret;
            }
            rootEnd = 3;
          }
        }
        if (rootEnd > 0) {
          ret.root = path.slice(0, rootEnd);
        }
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for (; i >= rootEnd; --i) {
          code = path.charCodeAt(i);
          if (isPathSeparator(code)) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (end !== -1) {
          if (startDot === -1 || // We saw a non-dot character immediately before the dot
          preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
          preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            ret.base = ret.name = path.slice(startPart, end);
          } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
            ret.ext = path.slice(startDot, end);
          }
        }
        if (startPart > 0 && startPart !== rootEnd) {
          ret.dir = path.slice(0, startPart - 1);
        } else {
          ret.dir = ret.root;
        }
        return ret;
      },
      sep: "\\",
      delimiter: ";",
      win32: null,
      posix: null
    };
    var posixCwd = (() => {
      if (platformIsWin32) {
        const regexp = /\\/g;
        return () => {
          const cwd2 = cwd().replace(regexp, "/");
          return cwd2.slice(cwd2.indexOf("/"));
        };
      }
      return () => cwd();
    })();
    var posix = {
      // path.resolve([from ...], to)
      resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          const path = i >= 0 ? pathSegments[i] : posixCwd();
          validateString(path, "path");
          if (path.length === 0) {
            continue;
          }
          resolvedPath = `${path}/${resolvedPath}`;
          resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        }
        resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
        if (resolvedAbsolute) {
          return `/${resolvedPath}`;
        }
        return resolvedPath.length > 0 ? resolvedPath : ".";
      },
      normalize(path) {
        validateString(path, "path");
        if (path.length === 0) {
          return ".";
        }
        const isAbsolute2 = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
        path = normalizeString(path, !isAbsolute2, "/", isPosixPathSeparator);
        if (path.length === 0) {
          if (isAbsolute2) {
            return "/";
          }
          return trailingSeparator ? "./" : ".";
        }
        if (trailingSeparator) {
          path += "/";
        }
        return isAbsolute2 ? `/${path}` : path;
      },
      isAbsolute(path) {
        validateString(path, "path");
        return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      },
      join(...paths) {
        if (paths.length === 0) {
          return ".";
        }
        let joined;
        for (let i = 0; i < paths.length; ++i) {
          const arg = paths[i];
          validateString(arg, "path");
          if (arg.length > 0) {
            if (joined === void 0) {
              joined = arg;
            } else {
              joined += `/${arg}`;
            }
          }
        }
        if (joined === void 0) {
          return ".";
        }
        return posix.normalize(joined);
      },
      relative(from, to) {
        validateString(from, "from");
        validateString(to, "to");
        if (from === to) {
          return "";
        }
        from = posix.resolve(from);
        to = posix.resolve(to);
        if (from === to) {
          return "";
        }
        const fromStart = 1;
        const fromEnd = from.length;
        const fromLen = fromEnd - fromStart;
        const toStart = 1;
        const toLen = to.length - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i < length; i++) {
          const fromCode = from.charCodeAt(fromStart + i);
          if (fromCode !== to.charCodeAt(toStart + i)) {
            break;
          } else if (fromCode === CHAR_FORWARD_SLASH) {
            lastCommonSep = i;
          }
        }
        if (i === length) {
          if (toLen > length) {
            if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
              return to.slice(toStart + i + 1);
            }
            if (i === 0) {
              return to.slice(toStart + i);
            }
          } else if (fromLen > length) {
            if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
              lastCommonSep = i;
            } else if (i === 0) {
              lastCommonSep = 0;
            }
          }
        }
        let out = "";
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
          if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            out += out.length === 0 ? ".." : "/..";
          }
        }
        return `${out}${to.slice(toStart + lastCommonSep)}`;
      },
      toNamespacedPath(path) {
        return path;
      },
      dirname(path) {
        validateString(path, "path");
        if (path.length === 0) {
          return ".";
        }
        const hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let end = -1;
        let matchedSlash = true;
        for (let i = path.length - 1; i >= 1; --i) {
          if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              end = i;
              break;
            }
          } else {
            matchedSlash = false;
          }
        }
        if (end === -1) {
          return hasRoot ? "/" : ".";
        }
        if (hasRoot && end === 1) {
          return "//";
        }
        return path.slice(0, end);
      },
      basename(path, ext) {
        if (ext !== void 0) {
          validateString(ext, "ext");
        }
        validateString(path, "path");
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
          if (ext === path) {
            return "";
          }
          let extIdx = ext.length - 1;
          let firstNonSlashEnd = -1;
          for (i = path.length - 1; i >= 0; --i) {
            const code = path.charCodeAt(i);
            if (code === CHAR_FORWARD_SLASH) {
              if (!matchedSlash) {
                start = i + 1;
                break;
              }
            } else {
              if (firstNonSlashEnd === -1) {
                matchedSlash = false;
                firstNonSlashEnd = i + 1;
              }
              if (extIdx >= 0) {
                if (code === ext.charCodeAt(extIdx)) {
                  if (--extIdx === -1) {
                    end = i;
                  }
                } else {
                  extIdx = -1;
                  end = firstNonSlashEnd;
                }
              }
            }
          }
          if (start === end) {
            end = firstNonSlashEnd;
          } else if (end === -1) {
            end = path.length;
          }
          return path.slice(start, end);
        }
        for (i = path.length - 1; i >= 0; --i) {
          if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
        }
        if (end === -1) {
          return "";
        }
        return path.slice(start, end);
      },
      extname(path) {
        validateString(path, "path");
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        for (let i = path.length - 1; i >= 0; --i) {
          const code = path.charCodeAt(i);
          if (code === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
        preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          return "";
        }
        return path.slice(startDot, end);
      },
      format: _format.bind(null, "/"),
      parse(path) {
        validateString(path, "path");
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path.length === 0) {
          return ret;
        }
        const isAbsolute2 = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let start;
        if (isAbsolute2) {
          ret.root = "/";
          start = 1;
        } else {
          start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for (; i >= start; --i) {
          const code = path.charCodeAt(i);
          if (code === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (end !== -1) {
          const start2 = startPart === 0 && isAbsolute2 ? 1 : startPart;
          if (startDot === -1 || // We saw a non-dot character immediately before the dot
          preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
          preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            ret.base = ret.name = path.slice(start2, end);
          } else {
            ret.name = path.slice(start2, startDot);
            ret.base = path.slice(start2, end);
            ret.ext = path.slice(startDot, end);
          }
        }
        if (startPart > 0) {
          ret.dir = path.slice(0, startPart - 1);
        } else if (isAbsolute2) {
          ret.dir = "/";
        }
        return ret;
      },
      sep: "/",
      delimiter: ":",
      win32: null,
      posix: null
    };
    posix.win32 = win32.win32 = win32;
    posix.posix = win32.posix = posix;
    var normalize = platformIsWin32 ? win32.normalize : posix.normalize;
    var isAbsolute = platformIsWin32 ? win32.isAbsolute : posix.isAbsolute;
    var join = platformIsWin32 ? win32.join : posix.join;
    var resolve = platformIsWin32 ? win32.resolve : posix.resolve;
    var relative = platformIsWin32 ? win32.relative : posix.relative;
    var dirname = platformIsWin32 ? win32.dirname : posix.dirname;
    var basename = platformIsWin32 ? win32.basename : posix.basename;
    var extname = platformIsWin32 ? win32.extname : posix.extname;
    var format = platformIsWin32 ? win32.format : posix.format;
    var parse = platformIsWin32 ? win32.parse : posix.parse;
    var toNamespacedPath = platformIsWin32 ? win32.toNamespacedPath : posix.toNamespacedPath;
    var sep = platformIsWin32 ? win32.sep : posix.sep;
    var delimiter = platformIsWin32 ? win32.delimiter : posix.delimiter;
    var _schemePattern = /^\w[\w\d+.-]*$/;
    var _singleSlashStart = /^\//;
    var _doubleSlashStart = /^\/\//;
    function _validateUri(ret, _strict) {
      if (!ret.scheme && _strict) {
        throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
      }
      if (ret.scheme && !_schemePattern.test(ret.scheme)) {
        throw new Error("[UriError]: Scheme contains illegal characters.");
      }
      if (ret.path) {
        if (ret.authority) {
          if (!_singleSlashStart.test(ret.path)) {
            throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
          }
        } else {
          if (_doubleSlashStart.test(ret.path)) {
            throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
          }
        }
      }
    }
    function _schemeFix(scheme, _strict) {
      if (!scheme && !_strict) {
        return "file";
      }
      return scheme;
    }
    function _referenceResolution(scheme, path) {
      switch (scheme) {
        case "https":
        case "http":
        case "file":
          if (!path) {
            path = _slash;
          } else if (path[0] !== _slash) {
            path = _slash + path;
          }
          break;
      }
      return path;
    }
    var _empty = "";
    var _slash = "/";
    var _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
    var URI = class _URI {
      static isUri(thing) {
        if (thing instanceof _URI) {
          return true;
        }
        if (!thing) {
          return false;
        }
        return typeof thing.authority === "string" && typeof thing.fragment === "string" && typeof thing.path === "string" && typeof thing.query === "string" && typeof thing.scheme === "string" && typeof thing.fsPath === "string" && typeof thing.with === "function" && typeof thing.toString === "function";
      }
      /**
       * scheme is the 'http' part of 'http://www.example.com/some/path?query#fragment'.
       * The part before the first colon.
       */
      scheme;
      /**
       * authority is the 'www.example.com' part of 'http://www.example.com/some/path?query#fragment'.
       * The part between the first double slashes and the next slash.
       */
      authority;
      /**
       * path is the '/some/path' part of 'http://www.example.com/some/path?query#fragment'.
       */
      path;
      /**
       * query is the 'query' part of 'http://www.example.com/some/path?query#fragment'.
       */
      query;
      /**
       * fragment is the 'fragment' part of 'http://www.example.com/some/path?query#fragment'.
       */
      fragment;
      /**
       * @internal
       */
      constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
        if (typeof schemeOrData === "object") {
          this.scheme = schemeOrData.scheme || _empty;
          this.authority = schemeOrData.authority || _empty;
          this.path = schemeOrData.path || _empty;
          this.query = schemeOrData.query || _empty;
          this.fragment = schemeOrData.fragment || _empty;
        } else {
          this.scheme = _schemeFix(schemeOrData, _strict);
          this.authority = authority || _empty;
          this.path = _referenceResolution(this.scheme, path || _empty);
          this.query = query || _empty;
          this.fragment = fragment || _empty;
          _validateUri(this, _strict);
        }
      }
      // ---- filesystem path -----------------------
      /**
       * Returns a string representing the corresponding file system path of this URI.
       * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
       * platform specific path separator.
       *
       * * Will *not* validate the path for invalid characters and semantics.
       * * Will *not* look at the scheme of this URI.
       * * The result shall *not* be used for display purposes but for accessing a file on disk.
       *
       *
       * The *difference* to `URI#path` is the use of the platform specific separator and the handling
       * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
       *
       * ```ts
      	const u = URI.parse('file://server/c$/folder/file.txt')
      	u.authority === 'server'
      	u.path === '/shares/c$/file.txt'
      	u.fsPath === '\\server\c$\folder\file.txt'
      ```
       *
       * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
       * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
       * with URIs that represent files on disk (`file` scheme).
       */
      get fsPath() {
        return uriToFsPath(this, false);
      }
      // ---- modify to new -------------------------
      with(change) {
        if (!change) {
          return this;
        }
        let { scheme, authority, path, query, fragment } = change;
        if (scheme === void 0) {
          scheme = this.scheme;
        } else if (scheme === null) {
          scheme = _empty;
        }
        if (authority === void 0) {
          authority = this.authority;
        } else if (authority === null) {
          authority = _empty;
        }
        if (path === void 0) {
          path = this.path;
        } else if (path === null) {
          path = _empty;
        }
        if (query === void 0) {
          query = this.query;
        } else if (query === null) {
          query = _empty;
        }
        if (fragment === void 0) {
          fragment = this.fragment;
        } else if (fragment === null) {
          fragment = _empty;
        }
        if (scheme === this.scheme && authority === this.authority && path === this.path && query === this.query && fragment === this.fragment) {
          return this;
        }
        return new Uri(scheme, authority, path, query, fragment);
      }
      // ---- parse & validate ------------------------
      /**
       * Creates a new URI from a string, e.g. `http://www.example.com/some/path`,
       * `file:///usr/home`, or `scheme:with/path`.
       *
       * @param value A string which represents an URI (see `URI#toString`).
       */
      static parse(value, _strict = false) {
        const match = _regexp.exec(value);
        if (!match) {
          return new Uri(_empty, _empty, _empty, _empty, _empty);
        }
        return new Uri(match[2] || _empty, percentDecode(match[4] || _empty), percentDecode(match[5] || _empty), percentDecode(match[7] || _empty), percentDecode(match[9] || _empty), _strict);
      }
      /**
       * Creates a new URI from a file system path, e.g. `c:\my\files`,
       * `/usr/home`, or `\\server\share\some\path`.
       *
       * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
       * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
       * `URI.parse('file://' + path)` because the path might contain characters that are
       * interpreted (# and ?). See the following sample:
       * ```ts
      const good = URI.file('/coding/c#/project1');
      good.scheme === 'file';
      good.path === '/coding/c#/project1';
      good.fragment === '';
      const bad = URI.parse('file://' + '/coding/c#/project1');
      bad.scheme === 'file';
      bad.path === '/coding/c'; // path is now broken
      bad.fragment === '/project1';
      ```
       *
       * @param path A file system path (see `URI#fsPath`)
       */
      static file(path) {
        let authority = _empty;
        if (isWindows) {
          path = path.replace(/\\/g, _slash);
        }
        if (path[0] === _slash && path[1] === _slash) {
          const idx = path.indexOf(_slash, 2);
          if (idx === -1) {
            authority = path.substring(2);
            path = _slash;
          } else {
            authority = path.substring(2, idx);
            path = path.substring(idx) || _slash;
          }
        }
        return new Uri("file", authority, path, _empty, _empty);
      }
      /**
       * Creates new URI from uri components.
       *
       * Unless `strict` is `true` the scheme is defaults to be `file`. This function performs
       * validation and should be used for untrusted uri components retrieved from storage,
       * user input, command arguments etc
       */
      static from(components, strict) {
        const result = new Uri(components.scheme, components.authority, components.path, components.query, components.fragment, strict);
        return result;
      }
      /**
       * Join a URI path with path fragments and normalizes the resulting path.
       *
       * @param uri The input URI.
       * @param pathFragment The path fragment to add to the URI path.
       * @returns The resulting URI.
       */
      static joinPath(uri, ...pathFragment) {
        if (!uri.path) {
          throw new Error(`[UriError]: cannot call joinPath on URI without path`);
        }
        let newPath;
        if (isWindows && uri.scheme === "file") {
          newPath = _URI.file(win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
        } else {
          newPath = posix.join(uri.path, ...pathFragment);
        }
        return uri.with({ path: newPath });
      }
      // ---- printing/externalize ---------------------------
      /**
       * Creates a string representation for this URI. It's guaranteed that calling
       * `URI.parse` with the result of this function creates an URI which is equal
       * to this URI.
       *
       * * The result shall *not* be used for display purposes but for externalization or transport.
       * * The result will be encoded using the percentage encoding and encoding happens mostly
       * ignore the scheme-specific encoding rules.
       *
       * @param skipEncoding Do not encode the result, default is `false`
       */
      toString(skipEncoding = false) {
        return _asFormatted(this, skipEncoding);
      }
      toJSON() {
        return this;
      }
      static revive(data) {
        if (!data) {
          return data;
        } else if (data instanceof _URI) {
          return data;
        } else {
          const result = new Uri(data);
          result._formatted = data.external ?? null;
          result._fsPath = data._sep === _pathSepMarker ? data.fsPath ?? null : null;
          return result;
        }
      }
    };
    function isUriComponents(thing) {
      if (!thing || typeof thing !== "object") {
        return false;
      }
      return typeof thing.scheme === "string" && (typeof thing.authority === "string" || typeof thing.authority === "undefined") && (typeof thing.path === "string" || typeof thing.path === "undefined") && (typeof thing.query === "string" || typeof thing.query === "undefined") && (typeof thing.fragment === "string" || typeof thing.fragment === "undefined");
    }
    var _pathSepMarker = isWindows ? 1 : void 0;
    var Uri = class extends URI {
      _formatted = null;
      _fsPath = null;
      get fsPath() {
        if (!this._fsPath) {
          this._fsPath = uriToFsPath(this, false);
        }
        return this._fsPath;
      }
      toString(skipEncoding = false) {
        if (!skipEncoding) {
          if (!this._formatted) {
            this._formatted = _asFormatted(this, false);
          }
          return this._formatted;
        } else {
          return _asFormatted(this, true);
        }
      }
      toJSON() {
        const res = {
          $mid: 1
          /* Uri */
        };
        if (this._fsPath) {
          res.fsPath = this._fsPath;
          res._sep = _pathSepMarker;
        }
        if (this._formatted) {
          res.external = this._formatted;
        }
        if (this.path) {
          res.path = this.path;
        }
        if (this.scheme) {
          res.scheme = this.scheme;
        }
        if (this.authority) {
          res.authority = this.authority;
        }
        if (this.query) {
          res.query = this.query;
        }
        if (this.fragment) {
          res.fragment = this.fragment;
        }
        return res;
      }
    };
    var encodeTable = {
      [
        58
        /* Colon */
      ]: "%3A",
      // gen-delims
      [
        47
        /* Slash */
      ]: "%2F",
      [
        63
        /* QuestionMark */
      ]: "%3F",
      [
        35
        /* Hash */
      ]: "%23",
      [
        91
        /* OpenSquareBracket */
      ]: "%5B",
      [
        93
        /* CloseSquareBracket */
      ]: "%5D",
      [
        64
        /* AtSign */
      ]: "%40",
      [
        33
        /* ExclamationMark */
      ]: "%21",
      // sub-delims
      [
        36
        /* DollarSign */
      ]: "%24",
      [
        38
        /* Ampersand */
      ]: "%26",
      [
        39
        /* SingleQuote */
      ]: "%27",
      [
        40
        /* OpenParen */
      ]: "%28",
      [
        41
        /* CloseParen */
      ]: "%29",
      [
        42
        /* Asterisk */
      ]: "%2A",
      [
        43
        /* Plus */
      ]: "%2B",
      [
        44
        /* Comma */
      ]: "%2C",
      [
        59
        /* Semicolon */
      ]: "%3B",
      [
        61
        /* Equals */
      ]: "%3D",
      [
        32
        /* Space */
      ]: "%20"
    };
    function encodeURIComponentFast(uriComponent, isPath, isAuthority) {
      let res = void 0;
      let nativeEncodePos = -1;
      for (let pos = 0; pos < uriComponent.length; pos++) {
        const code = uriComponent.charCodeAt(pos);
        if (code >= 97 && code <= 122 || code >= 65 && code <= 90 || code >= 48 && code <= 57 || code === 45 || code === 46 || code === 95 || code === 126 || isPath && code === 47 || isAuthority && code === 91 || isAuthority && code === 93 || isAuthority && code === 58) {
          if (nativeEncodePos !== -1) {
            res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
            nativeEncodePos = -1;
          }
          if (res !== void 0) {
            res += uriComponent.charAt(pos);
          }
        } else {
          if (res === void 0) {
            res = uriComponent.substr(0, pos);
          }
          const escaped = encodeTable[code];
          if (escaped !== void 0) {
            if (nativeEncodePos !== -1) {
              res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
              nativeEncodePos = -1;
            }
            res += escaped;
          } else if (nativeEncodePos === -1) {
            nativeEncodePos = pos;
          }
        }
      }
      if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
      }
      return res !== void 0 ? res : uriComponent;
    }
    function encodeURIComponentMinimal(path) {
      let res = void 0;
      for (let pos = 0; pos < path.length; pos++) {
        const code = path.charCodeAt(pos);
        if (code === 35 || code === 63) {
          if (res === void 0) {
            res = path.substr(0, pos);
          }
          res += encodeTable[code];
        } else {
          if (res !== void 0) {
            res += path[pos];
          }
        }
      }
      return res !== void 0 ? res : path;
    }
    function uriToFsPath(uri, keepDriveLetterCasing) {
      let value;
      if (uri.authority && uri.path.length > 1 && uri.scheme === "file") {
        value = `//${uri.authority}${uri.path}`;
      } else if (uri.path.charCodeAt(0) === 47 && (uri.path.charCodeAt(1) >= 65 && uri.path.charCodeAt(1) <= 90 || uri.path.charCodeAt(1) >= 97 && uri.path.charCodeAt(1) <= 122) && uri.path.charCodeAt(2) === 58) {
        if (!keepDriveLetterCasing) {
          value = uri.path[1].toLowerCase() + uri.path.substr(2);
        } else {
          value = uri.path.substr(1);
        }
      } else {
        value = uri.path;
      }
      if (isWindows) {
        value = value.replace(/\//g, "\\");
      }
      return value;
    }
    function _asFormatted(uri, skipEncoding) {
      const encoder = !skipEncoding ? encodeURIComponentFast : encodeURIComponentMinimal;
      let res = "";
      let { scheme, authority, path, query, fragment } = uri;
      if (scheme) {
        res += scheme;
        res += ":";
      }
      if (authority || scheme === "file") {
        res += _slash;
        res += _slash;
      }
      if (authority) {
        let idx = authority.indexOf("@");
        if (idx !== -1) {
          const userinfo = authority.substr(0, idx);
          authority = authority.substr(idx + 1);
          idx = userinfo.lastIndexOf(":");
          if (idx === -1) {
            res += encoder(userinfo, false, false);
          } else {
            res += encoder(userinfo.substr(0, idx), false, false);
            res += ":";
            res += encoder(userinfo.substr(idx + 1), false, true);
          }
          res += "@";
        }
        authority = authority.toLowerCase();
        idx = authority.lastIndexOf(":");
        if (idx === -1) {
          res += encoder(authority, false, true);
        } else {
          res += encoder(authority.substr(0, idx), false, true);
          res += authority.substr(idx);
        }
      }
      if (path) {
        if (path.length >= 3 && path.charCodeAt(0) === 47 && path.charCodeAt(2) === 58) {
          const code = path.charCodeAt(1);
          if (code >= 65 && code <= 90) {
            path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`;
          }
        } else if (path.length >= 2 && path.charCodeAt(1) === 58) {
          const code = path.charCodeAt(0);
          if (code >= 65 && code <= 90) {
            path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`;
          }
        }
        res += encoder(path, true, false);
      }
      if (query) {
        res += "?";
        res += encoder(query, false, false);
      }
      if (fragment) {
        res += "#";
        res += !skipEncoding ? encodeURIComponentFast(fragment, false, false) : fragment;
      }
      return res;
    }
    function decodeURIComponentGraceful(str) {
      try {
        return decodeURIComponent(str);
      } catch {
        if (str.length > 3) {
          return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
        } else {
          return str;
        }
      }
    }
    var _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
    function percentDecode(str) {
      if (!str.match(_rEncodedAsHex)) {
        return str;
      }
      return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
    }
    var _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function isUUID(value) {
      return _UUIDPattern.test(value);
    }
    var generateUuid = function() {
      if (typeof crypto === "object" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID.bind(crypto);
      }
      let getRandomValues;
      if (typeof crypto === "object" && typeof crypto.getRandomValues === "function") {
        getRandomValues = crypto.getRandomValues.bind(crypto);
      } else {
        getRandomValues = function(bucket) {
          for (let i = 0; i < bucket.length; i++) {
            bucket[i] = Math.floor(Math.random() * 256);
          }
          return bucket;
        };
      }
      const _data = new Uint8Array(16);
      const _hex = [];
      for (let i = 0; i < 256; i++) {
        _hex.push(i.toString(16).padStart(2, "0"));
      }
      return function generateUuid2() {
        getRandomValues(_data);
        _data[6] = _data[6] & 15 | 64;
        _data[8] = _data[8] & 63 | 128;
        let i = 0;
        let result = "";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        return result;
      };
    }();
    function isString(str) {
      return typeof str === "string";
    }
    function isStringArray(value) {
      return Array.isArray(value) && value.every((elem) => isString(elem));
    }
    function isArray(obj) {
      return Array.isArray(obj);
    }
    function isObject(obj) {
      return typeof obj === "object" && obj !== null && !Array.isArray(obj) && !(obj instanceof RegExp) && !(obj instanceof Date);
    }
    function isTypedArray(obj) {
      const TypedArray = Object.getPrototypeOf(Uint8Array);
      return typeof obj === "object" && obj instanceof TypedArray;
    }
    function isNumber(obj) {
      return typeof obj === "number" && !isNaN(obj);
    }
    function isIterable(obj) {
      return !!obj && typeof obj[Symbol.iterator] === "function";
    }
    function isBoolean(obj) {
      return obj === true || obj === false;
    }
    function isUndefined(obj) {
      return typeof obj === "undefined";
    }
    function isDefined(arg) {
      return !isUndefinedOrNull(arg);
    }
    function isUndefinedOrNull(obj) {
      return isUndefined(obj) || obj === null;
    }
    function assertType(condition, type) {
      if (!condition) {
        throw new Error(type ? `Unexpected type, expected '${type}'` : "Unexpected type");
      }
    }
    function assertIsDefined(arg) {
      if (isUndefinedOrNull(arg)) {
        throw new Error("Assertion Failed: argument is undefined or null");
      }
      return arg;
    }
    function assertAllDefined(...args) {
      const result = [];
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (isUndefinedOrNull(arg)) {
          throw new Error(`Assertion Failed: argument at index ${i} is undefined or null`);
        }
        result.push(arg);
      }
      return result;
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function isEmptyObject(obj) {
      if (!isObject(obj)) {
        return false;
      }
      for (const key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          return false;
        }
      }
      return true;
    }
    function isFunction(obj) {
      return typeof obj === "function";
    }
    function areFunctions(...objects) {
      return objects.length > 0 && objects.every(isFunction);
    }
    function validateConstraints(args, constraints) {
      const len = Math.min(args.length, constraints.length);
      for (let i = 0; i < len; i++) {
        validateConstraint(args[i], constraints[i]);
      }
    }
    function validateConstraint(arg, constraint) {
      if (isString(constraint)) {
        if (typeof arg !== constraint) {
          throw new Error(`argument does not match constraint: typeof ${constraint}`);
        }
      } else if (isFunction(constraint)) {
        try {
          if (arg instanceof constraint) {
            return;
          }
        } catch {
        }
        if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
          return;
        }
        if (constraint.length === 1 && constraint.call(void 0, arg) === true) {
          return;
        }
        throw new Error(`argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`);
      }
    }
    var EAccess = /* @__PURE__ */ ((EAccess2) => {
      EAccess2[EAccess2["Local"] = 0] = "Local";
      EAccess2[EAccess2["Internal"] = 1] = "Internal";
      EAccess2[EAccess2["Global"] = 2] = "Global";
      return EAccess2;
    })(EAccess || {});
    function getValueByJsonPath(obj, jsonPath) {
      let value = obj;
      for (const p of jsonPath) {
        value = value[p];
      }
      return value;
    }
    function setValueByJsonPath(obj, jsonPath, value) {
      if (jsonPath.length === 0) {
        Object.keys(obj).forEach((key) => delete obj[key]);
        Object.assign(obj, value);
        return;
      }
      let target = obj;
      for (let i = 0; i < jsonPath.length - 1; i++) {
        target = target[jsonPath[i]];
      }
      target[jsonPath[jsonPath.length - 1]] = value;
    }
    function deleteFieldsByJsonPath(obj, jsonPath, fields) {
      const target = getValueByJsonPath(obj, jsonPath);
      for (const field of fields) {
        delete target[field];
      }
    }
    function addFieldsByJsonPath(obj, jsonPath, field, value) {
      const target = getValueByJsonPath(obj, jsonPath);
      target[field] = value;
    }
    function jsonPathToString(jsonPath) {
      return jsonPath.join(".");
    }
    function stringToJsonPath(str) {
      return str.split(".");
    }
    function addFieldToJsonPathString(jsonPath, field) {
      if (!jsonPath) {
        return field;
      }
      return `${jsonPath}.${field}`;
    }
    function orderObject(obj, base) {
      if (typeof obj !== typeof base) {
        return obj;
      }
      if (isArray(obj)) {
        const firstElementInBase = base[0];
        if (!firstElementInBase) {
          return obj;
        }
        return obj.map((item) => {
          return orderObject(item, firstElementInBase);
        });
      } else if (typeof obj === "object" && obj !== null) {
        const ordered = {};
        for (const key of Object.keys(base)) {
          if (key in obj) {
            ordered[key] = orderObject(obj[key], base[key]);
          }
        }
        for (const key of Object.keys(obj)) {
          if (!(key in base)) {
            ordered[key] = orderObject(obj[key], {});
          }
        }
        return ordered;
      }
      return obj;
    }
    function stableStringify(obj, base) {
      return JSON.stringify(orderObject(obj, base));
    }
    var objectIds = /* @__PURE__ */ new WeakMap();
    var currentId = 0;
    function getObjectId(obj) {
      if (!objectIds.has(obj)) {
        objectIds.set(obj, currentId++);
      }
      return objectIds.get(obj);
    }
    function stringify(obj) {
      return JSON.stringify(obj, void 0, 2);
    }
    function parseJsonSafe(content) {
      try {
        return JSON.parse(content);
      } catch {
        return void 0;
      }
    }
    function removeNullField(data) {
      if (data === void 0) {
        return void 0;
      }
      if (data === null) {
        return void 0;
      }
      if (typeof data !== "object") {
        return data;
      }
      if (data instanceof Array) {
        const array = [];
        for (const d of data) {
          array.push(removeNullField(d));
        }
        return array;
      }
      const obj = {};
      for (const key in data) {
        const d = removeNullField(data[key]);
        if (d !== void 0) {
          obj[key] = d;
        }
      }
      return obj;
    }
    function applyDiff(data, base) {
      if (data === void 0) {
        return base;
      }
      if (data === null) {
        return void 0;
      }
      if (base === void 0) {
        return data;
      }
      if (base === null) {
        throw new Error("Base can not be null");
      }
      if (typeof data !== "object") {
        return data;
      }
      if (typeof base !== "object") {
        return data;
      }
      if (base instanceof Array) {
        return data;
      }
      const result = {};
      for (const key in data) {
        const baseValue = base[key];
        if (baseValue === void 0) {
          const dataValue = data[key];
          if (dataValue !== null) {
            result[key] = removeNullField(dataValue);
          }
        }
      }
      for (const key in base) {
        const vData = data[key];
        const vBase = base[key];
        if (vData === void 0) {
          result[key] = vBase;
        } else {
          if (vData !== null) {
            const typeData = typeof vData;
            const typeBase = typeof vBase;
            if (typeData !== typeBase) {
              result[key] = vData;
            } else {
              if (typeData === "object") {
                const diff = applyDiff(vData, vBase);
                if (diff !== void 0) {
                  result[key] = diff;
                }
              } else {
                result[key] = vData;
              }
            }
          }
        }
      }
      return result;
    }
    function deepEquals(x, y) {
      if (x === y) {
        return true;
      }
      const typeX = typeof x;
      const typeY = typeof y;
      if (typeX !== typeY) {
        return false;
      }
      if (typeX !== "object" || x === void 0 || y === void 0 || x === null || y === null) {
        return false;
      }
      if (x instanceof Array) {
        if (x.length !== y.length) {
          return false;
        }
        for (let i = 0; i < x.length; i++) {
          if (!deepEquals(x[i], y[i])) {
            return false;
          }
        }
      } else {
        for (const key in x) {
          if (!deepEquals(x[key], y[key])) {
            return false;
          }
        }
        for (const key in y) {
          if (x[key] === void 0 && y[key] !== void 0) {
            return false;
          }
        }
      }
      return true;
    }
    function deepClone(obj) {
      if (typeof obj !== "object" || obj === null) {
        return obj;
      }
      let result;
      if (obj instanceof Date) {
        result = new Date(obj);
      } else if (obj instanceof RegExp) {
        result = new RegExp(obj);
      } else if (Array.isArray(obj)) {
        result = [];
        obj.forEach((item, index) => {
          result[index] = deepClone(item);
        });
      } else {
        result = Object.create(Object.getPrototypeOf(obj));
        Object.keys(obj).forEach((key) => {
          result[key] = deepClone(obj[key]);
        });
      }
      return result;
    }
    function createDiff(origin, base) {
      if (base === void 0) {
        return origin;
      }
      if (origin === void 0) {
        return null;
      }
      if (typeof origin !== "object" || typeof base !== "object") {
        return origin;
      }
      if (base instanceof Array) {
        const oa = origin;
        if (base.length !== oa.length) {
          return origin;
        }
        return deepEquals(base, origin) ? void 0 : origin;
      }
      let differentFields = 0;
      const result = {};
      for (const key in origin) {
        if (base[key] === void 0) {
          const d = origin[key];
          result[key] = d;
          differentFields++;
        }
      }
      for (const key in base) {
        const vFrom = origin[key];
        const vTo = base[key];
        if (vFrom !== void 0) {
          const typeFrom = typeof vFrom;
          const typeTo = typeof vTo;
          if (typeFrom === typeTo && typeFrom === "object") {
            const data = createDiff(vFrom, vTo);
            if (data !== void 0) {
              result[key] = data;
              differentFields++;
            }
          } else {
            if (vFrom !== vTo) {
              result[key] = vFrom;
              differentFields++;
            }
          }
        } else {
          result[key] = null;
          differentFields++;
        }
      }
      if (differentFields === 0) {
        return void 0;
      }
      return result;
    }
    var canceledName = "Canceled";
    var CancellationError = class extends Error {
      constructor() {
        super(canceledName);
        this.name = this.message;
      }
    };
    function isCancellationError(error) {
      if (error instanceof CancellationError) {
        return true;
      }
      return error instanceof Error && error.name === canceledName && error.message === canceledName;
    }
    var ErrorNoTelemetry = class _ErrorNoTelemetry extends Error {
      name;
      constructor(msg) {
        super(msg);
        this.name = "CodeExpectedError";
      }
      static fromError(err) {
        if (err instanceof _ErrorNoTelemetry) {
          return err;
        }
        const result = new _ErrorNoTelemetry();
        result.message = err.message;
        result.stack = err.stack;
        return result;
      }
      static isErrorNoTelemetry(err) {
        return err.name === "CodeExpectedError";
      }
    };
    var ErrorHandler = class {
      unexpectedErrorHandler;
      listeners;
      constructor() {
        this.listeners = [];
        this.unexpectedErrorHandler = function(e) {
          setTimeout(() => {
            if (e.stack) {
              if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
                throw new ErrorNoTelemetry(e.message + "\n\n" + e.stack);
              }
              throw new Error(e.message + "\n\n" + e.stack);
            }
            throw e;
          }, 0);
        };
      }
      addListener(listener) {
        this.listeners.push(listener);
        return () => {
          this._removeListener(listener);
        };
      }
      emit(e) {
        this.listeners.forEach((listener) => {
          listener(e);
        });
      }
      _removeListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
      }
      setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        this.unexpectedErrorHandler = newUnexpectedErrorHandler;
      }
      getUnexpectedErrorHandler() {
        return this.unexpectedErrorHandler;
      }
      onUnexpectedError(e) {
        this.unexpectedErrorHandler(e);
        this.emit(e);
      }
      // For external errors, we don't want the listeners to be called
      onUnexpectedExternalError(e) {
        this.unexpectedErrorHandler(e);
      }
    };
    var errorHandler = new ErrorHandler();
    function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
      errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
    }
    function onUnexpectedError(e) {
      if (!isCancellationError(e)) {
        errorHandler.onUnexpectedError(e);
      }
      return void 0;
    }
    function onUnexpectedExternalError(e) {
      if (!isCancellationError(e)) {
        errorHandler.onUnexpectedExternalError(e);
      }
      return void 0;
    }
    function safeRun(fn, ...args) {
      try {
        const a = fn(...args);
        if (a instanceof Promise) {
          a.catch(onUnexpectedError);
          return a;
        }
      } catch (e) {
        onUnexpectedError(e);
      }
      return void 0;
    }
    function safeWrap(fn) {
      return function(...args) {
        return safeRun(fn, ...args);
      };
    }
    function safe(_target, _propertyKey, descriptor) {
      if (typeof descriptor.value !== "function") {
        throw new Error("@safe \u88C5\u9970\u5668\u53EA\u80FD\u7528\u4E8E\u7C7B\u7684\u65B9\u6CD5\u4E0A");
      }
      const originalMethod = descriptor.value;
      descriptor.value = function(...args) {
        return safeRun(originalMethod.bind(this), ...args);
      };
      return descriptor;
    }
    function once(fn) {
      let didCall = false;
      let result;
      return function wrap() {
        if (didCall) {
          return result;
        }
        didCall = true;
        result = fn();
        return result;
      };
    }
    var Iterable;
    ((Iterable2) => {
      function is(thing) {
        return thing && typeof thing === "object" && typeof thing[Symbol.iterator] === "function";
      }
      Iterable2.is = is;
    })(Iterable || (Iterable = {}));
    var TRACK_DISPOSABLES = false;
    var disposableTracker = null;
    if (TRACK_DISPOSABLES) {
      const __is_disposable_tracked__ = "__is_disposable_tracked__";
      setDisposableTracker(
        new class {
          trackDisposable(x) {
            const stack = new Error("Potentially leaked disposable").stack;
            setTimeout(() => {
              if (!x[__is_disposable_tracked__]) {
                console.log(stack);
              }
            }, 3e3);
          }
          setParent(child, _parent) {
            if (child && child !== Disposable.None) {
              try {
                child[__is_disposable_tracked__] = true;
              } catch {
              }
            }
          }
          markAsDisposed(disposable) {
            if (disposable && disposable !== Disposable.None) {
              try {
                disposable[__is_disposable_tracked__] = true;
              } catch {
              }
            }
          }
          markAsSingleton(_disposable) {
          }
        }()
      );
    }
    function setDisposableTracker(tracker) {
      disposableTracker = tracker;
    }
    function trackDisposable(x) {
      disposableTracker?.trackDisposable(x);
      return x;
    }
    function markAsDisposed(disposable) {
      disposableTracker?.markAsDisposed(disposable);
    }
    function dispose(arg) {
      if (Iterable.is(arg)) {
        const erros = [];
        for (const item of arg) {
          if (item) {
            try {
              item.dispose();
            } catch (e) {
              erros.push(e);
            }
          }
        }
        if (erros.length === 1) {
          throw erros[0];
        } else if (erros.length > 1) {
          throw new AggregateError(erros);
        }
        return Array.isArray(arg) ? [] : void 0;
      } else if (arg) {
        arg.dispose();
        return arg;
      }
      return void 0;
    }
    function setParentOfDisposable(child, parent) {
      disposableTracker?.setParent(child, parent);
    }
    function setParentOfDisposables(children, parent) {
      if (!disposableTracker) {
        return;
      }
      for (const child of children) {
        disposableTracker.setParent(child, parent);
      }
    }
    var DisposableStore = class _DisposableStore {
      static DISABLE_DISPOSED_WARNING = false;
      _toDispose = /* @__PURE__ */ new Set();
      _isDisposed = false;
      dispose() {
        if (this._isDisposed) {
          return;
        }
        markAsDisposed(this);
        this._isDisposed = true;
        this.clear();
      }
      get isDisposed() {
        return this._isDisposed;
      }
      clear() {
        if (this._toDispose.size === 0) {
          return;
        }
        try {
          dispose(this._toDispose);
        } finally {
          this._toDispose.clear();
        }
      }
      add(t) {
        if (!t) {
          return t;
        }
        if (t === this) {
          throw new Error("Cannot register a disposable on itself!");
        }
        setParentOfDisposable(t, this);
        if (this._isDisposed) {
          if (!_DisposableStore.DISABLE_DISPOSED_WARNING) {
            console.warn(new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!").stack);
          }
        } else {
          this._toDispose.add(t);
        }
        return t;
      }
    };
    function combinedDisposable(...disposables) {
      const parent = toDisposable(() => dispose(disposables));
      setParentOfDisposables(disposables, parent);
      return parent;
    }
    function toDisposable(fn) {
      return { dispose: once(fn) };
    }
    var Disposable = class {
      static None = Object.freeze({ dispose() {
      } });
      _store = new DisposableStore();
      constructor() {
        trackDisposable(this);
        setParentOfDisposables([this._store], this);
      }
      dispose() {
        markAsDisposed(this);
        this._store.dispose();
      }
      /**
       * Adds `o` to the collection of disposables managed by this object.
       */
      _register(o) {
        if (o === this) {
          throw new Error("Cannot register a disposable on itself!");
        }
        return this._store.add(o);
      }
    };
    var Node = class _Node {
      constructor(element, next = _Node.Undefined, prev = _Node.Undefined) {
        this.element = element;
        this.next = next;
        this.prev = prev;
      }
      element;
      next;
      prev;
      static Undefined = new _Node(void 0);
    };
    var LinkedList = class {
      _first = Node.Undefined;
      _last = Node.Undefined;
      _size = 0;
      get size() {
        return this._size;
      }
      isEmpty() {
        return this._first === Node.Undefined;
      }
      clear() {
        let node = this._first;
        while (node !== Node.Undefined) {
          const { next } = node;
          node.next = Node.Undefined;
          node.prev = Node.Undefined;
          node = next;
        }
        this._first = Node.Undefined;
        this._last = Node.Undefined;
        this._size = 0;
      }
      unshift(element) {
        return this._insert(element, false);
      }
      push(element) {
        return this._insert(element, true);
      }
      shift() {
        if (this._first === Node.Undefined) {
          return void 0;
        }
        const res = this._first.element;
        this._remove(this._first);
        return res;
      }
      pop() {
        if (this._last === Node.Undefined) {
          return void 0;
        }
        const res = this._last.element;
        this._remove(this._last);
        return res;
      }
      _insert(element, atTheEnd) {
        const newNode = new Node(element);
        if (this._first === Node.Undefined) {
          this._first = newNode;
          this._last = newNode;
        } else if (atTheEnd) {
          const oldLast = this._last;
          this._last = newNode;
          newNode.prev = oldLast;
          oldLast.next = newNode;
        } else {
          const oldFirst = this._first;
          this._first = newNode;
          newNode.next = oldFirst;
          oldFirst.prev = newNode;
        }
        this._size += 1;
        let didRemove = false;
        return () => {
          if (!didRemove) {
            didRemove = true;
            this._remove(newNode);
          }
        };
      }
      _remove(node) {
        if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
          const anchor = node.prev;
          anchor.next = node.next;
          node.next.prev = anchor;
        } else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
          this._first = Node.Undefined;
          this._last = Node.Undefined;
        } else if (node.next === Node.Undefined) {
          this._last = this._last.prev;
          this._last.next = Node.Undefined;
        } else if (node.prev === Node.Undefined) {
          this._first = this._first.next;
          this._first.prev = Node.Undefined;
        }
        this._size -= 1;
      }
      *[Symbol.iterator]() {
        let node = this._first;
        while (node !== Node.Undefined) {
          yield node.element;
          node = node.next;
        }
      }
    };
    var hasPerformanceNow = globalThis.performance && typeof globalThis.performance.now === "function";
    var StopWatch = class _StopWatch {
      _startTime;
      _stopTime;
      _now;
      static create(highResolution) {
        return new _StopWatch(highResolution);
      }
      constructor(highResolution) {
        this._now = hasPerformanceNow && highResolution === false ? Date.now : globalThis.performance.now.bind(globalThis.performance);
        this._startTime = this._now();
        this._stopTime = -1;
      }
      stop() {
        this._stopTime = this._now();
      }
      reset() {
        this._startTime = this._now();
        this._stopTime = -1;
      }
      elapsed() {
        if (this._stopTime !== -1) {
          return this._stopTime - this._startTime;
        }
        return this._now() - this._startTime;
      }
    };
    var _enableDisposeWithListenerWarning = false;
    var _enableSnapshotPotentialLeakWarning = false;
    var Event;
    ((Event3) => {
      Event3.None = () => Disposable.None;
      function _addLeakageTraceLogic(options) {
        if (_enableSnapshotPotentialLeakWarning) {
          const { onDidAddListener: origListenerDidAdd } = options;
          const stack = Stacktrace.create();
          let count = 0;
          options.onDidAddListener = () => {
            if (++count === 2) {
              console.warn("snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here");
              stack.print();
            }
            origListenerDidAdd?.();
          };
        }
      }
      function once2(event) {
        return (listener, thisArgs = null, disposables) => {
          let didFire = false;
          let result = void 0;
          result = event(
            (e) => {
              if (didFire) {
                return;
              } else if (result) {
                result.dispose();
              } else {
                didFire = true;
              }
              return listener.call(thisArgs, e);
            },
            null,
            disposables
          );
          if (didFire) {
            result.dispose();
          }
          return result;
        };
      }
      Event3.once = once2;
      function toPromise(event) {
        return new Promise((resolve2) => once2(event)(resolve2));
      }
      Event3.toPromise = toPromise;
      function snapshot(event, disposable) {
        let listener;
        const options = {
          onWillAddFirstListener() {
            listener = event(emitter.fire, emitter);
          },
          onDidRemoveLastListener() {
            listener?.dispose();
          }
        };
        if (!disposable) {
          _addLeakageTraceLogic(options);
        }
        const emitter = new Emitter2(options);
        disposable?.add(emitter);
        return emitter.event;
      }
      function filter(event, filter2, disposable) {
        return snapshot((listener, thisArgs = null, disposables) => event((e) => filter2(e) && listener.call(thisArgs, e), null, disposables), disposable);
      }
      Event3.filter = filter;
      function buffer(event, flushAfterTimeout = false, _buffer = []) {
        let buffer2 = _buffer.slice();
        let listener = event((e) => {
          if (buffer2) {
            buffer2.push(e);
          } else {
            emitter.fire(e);
          }
        });
        const flush = () => {
          buffer2?.forEach((e) => emitter.fire(e));
          buffer2 = null;
        };
        const emitter = new Emitter2({
          onWillAddFirstListener() {
            if (!listener) {
              listener = event((e) => emitter.fire(e));
            }
          },
          onDidAddFirstListener() {
            if (buffer2) {
              if (flushAfterTimeout) {
                setTimeout(flush);
              } else {
                flush();
              }
            }
          },
          onDidRemoveLastListener() {
            if (listener) {
              listener.dispose();
            }
            listener = null;
          }
        });
        return emitter.event;
      }
      Event3.buffer = buffer;
      function map(event, map2, disposable) {
        return snapshot((listener, thisArgs = null, disposables) => event((i) => listener.call(thisArgs, map2(i)), null, disposables), disposable);
      }
      Event3.map = map;
      function fromNodeEventEmitter(emitter, eventName, map2 = (id2) => id2) {
        const fn = (...args) => result.fire(map2(...args));
        const onFirstListenerAdd = () => emitter.on(eventName, fn);
        const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
        const result = new Emitter2({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
        return result.event;
      }
      Event3.fromNodeEventEmitter = fromNodeEventEmitter;
    })(Event || (Event = {}));
    var EventProfiling = class _EventProfiling {
      static all = /* @__PURE__ */ new Set();
      static _idPool = 0;
      name;
      listenerCount = 0;
      invocationCount = 0;
      elapsedOverall = 0;
      durations = [];
      _stopWatch;
      constructor(name) {
        this.name = `${name}_${_EventProfiling._idPool++}`;
        _EventProfiling.all.add(this);
      }
      start(listenerCount) {
        this._stopWatch = new StopWatch();
        this.listenerCount = listenerCount;
      }
      stop() {
        if (this._stopWatch) {
          const elapsed = this._stopWatch.elapsed();
          this.durations.push(elapsed);
          this.elapsedOverall += elapsed;
          this.invocationCount += 1;
          this._stopWatch = void 0;
        }
      }
    };
    var _globalLeakWarningThreshold = -1;
    function setGlobalLeakWarningThreshold(n) {
      const oldValue = _globalLeakWarningThreshold;
      _globalLeakWarningThreshold = n;
      return {
        dispose() {
          _globalLeakWarningThreshold = oldValue;
        }
      };
    }
    var LeakageMonitor = class {
      constructor(threshold, name = Math.random().toString(18).slice(2, 5)) {
        this.threshold = threshold;
        this.name = name;
      }
      threshold;
      name;
      _stacks;
      _warnCountdown = 0;
      dispose() {
        this._stacks?.clear();
      }
      check(stack, listenerCount) {
        const threshold = this.threshold;
        if (threshold <= 0 || listenerCount < threshold) {
          return void 0;
        }
        if (!this._stacks) {
          this._stacks = /* @__PURE__ */ new Map();
        }
        const count = this._stacks.get(stack.value) || 0;
        this._stacks.set(stack.value, count + 1);
        this._warnCountdown -= 1;
        if (this._warnCountdown <= 0) {
          this._warnCountdown = threshold * 0.5;
          let topStack;
          let topCount = 0;
          for (const [stack2, count2] of this._stacks) {
            if (!topStack || topCount < count2) {
              topStack = stack2;
              topCount = count2;
            }
          }
          console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
          console.warn(topStack);
        }
        return () => {
          const count2 = this._stacks.get(stack.value) || 0;
          this._stacks.set(stack.value, count2 - 1);
        };
      }
    };
    var Stacktrace = class _Stacktrace {
      constructor(value) {
        this.value = value;
      }
      value;
      static create() {
        return new _Stacktrace(new Error().stack);
      }
      print() {
        console.warn(this.value.split("\n").slice(2).join("\n"));
      }
    };
    var createEventDeliveryQueue = () => new EventDeliveryQueuePrivate();
    var EventDeliveryQueuePrivate = class {
      /**
       * Index in current's listener list.
       */
      i = -1;
      /**
       * The last index in the listener's list to deliver.
       */
      end = 0;
      /**
       * Emitter currently being dispatched on. Emitter._listeners is always an array.
       */
      current;
      /**
       * Currently emitting value. Defined whenever `current` is.
       */
      value;
      enqueue(emitter, value, end) {
        this.i = 0;
        this.end = end;
        this.current = emitter;
        this.value = value;
      }
      reset() {
        this.i = this.end;
        this.current = void 0;
        this.value = void 0;
      }
    };
    var id = 0;
    var UniqueContainer = class {
      constructor(value) {
        this.value = value;
      }
      value;
      stack;
      id = id++;
    };
    var compactionThreshold = 2;
    var forEachListener = (listeners, fn) => {
      if (listeners instanceof UniqueContainer) {
        fn(listeners);
      } else {
        for (let i = 0; i < listeners.length; i++) {
          const l = listeners[i];
          if (l) {
            fn(l);
          }
        }
      }
    };
    var Emitter2 = class {
      _options;
      _leakageMon;
      _perfMon;
      _disposed;
      _event;
      /**
       * A listener, or list of listeners. A single listener is the most common
       * for event emitters (#185789), so we optimize that special case to avoid
       * wrapping it in an array (just like Node.js itself.)
       *
       * A list of listeners never 'downgrades' back to a plain function if
       * listeners are removed, for two reasons:
       *
       *  1. That's complicated (especially with the deliveryQueue)
       *  2. A listener with >1 listener is likely to have >1 listener again at
       *     some point, and swapping between arrays and functions may[citation needed]
       *     introduce unnecessary work and garbage.
       *
       * The array listeners can be 'sparse', to avoid reallocating the array
       * whenever any listener is added or removed. If more than `1 / compactionThreshold`
       * of the array is empty, only then is it resized.
       */
      _listeners;
      /**
       * Always to be defined if _listeners is an array. It's no longer a true
       * queue, but holds the dispatching 'state'. If `fire()` is called on an
       * emitter, any work left in the _deliveryQueue is finished first.
       */
      _deliveryQueue;
      _size = 0;
      constructor(options) {
        this._options = options;
        this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold) : void 0;
        this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : void 0;
        this._deliveryQueue = this._options?.deliveryQueue;
      }
      dispose() {
        if (!this._disposed) {
          this._disposed = true;
          if (this._deliveryQueue?.current === this) {
            this._deliveryQueue.reset();
          }
          if (this._listeners) {
            if (_enableDisposeWithListenerWarning) {
              const listeners = this._listeners;
              queueMicrotask(() => {
                forEachListener(listeners, (l) => l.stack?.print());
              });
            }
            this._listeners = void 0;
            this._size = 0;
          }
          this._options?.onDidRemoveLastListener?.();
          this._leakageMon?.dispose();
        }
      }
      /**
       * For the public to allow to subscribe
       * to events from this Emitter
       */
      get event() {
        this._event ??= (callback, thisArgs, disposables) => {
          if (this._leakageMon && this._size > this._leakageMon.threshold * 3) {
            console.warn(`[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far`);
            return Disposable.None;
          }
          if (this._disposed) {
            return Disposable.None;
          }
          if (thisArgs) {
            callback = callback.bind(thisArgs);
          }
          const contained = new UniqueContainer(callback);
          let removeMonitor;
          let stack;
          if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) {
            contained.stack = Stacktrace.create();
            removeMonitor = this._leakageMon.check(contained.stack, this._size + 1);
          }
          if (_enableDisposeWithListenerWarning) {
            contained.stack = stack ?? Stacktrace.create();
          }
          if (!this._listeners) {
            this._options?.onWillAddFirstListener?.(this);
            this._listeners = contained;
            this._options?.onDidAddFirstListener?.(this);
          } else if (this._listeners instanceof UniqueContainer) {
            this._deliveryQueue ??= new EventDeliveryQueuePrivate();
            this._listeners = [this._listeners, contained];
          } else {
            this._listeners.push(contained);
          }
          this._size++;
          const result = toDisposable(() => {
            removeMonitor?.();
            this._removeListener(contained);
          });
          if (disposables instanceof DisposableStore) {
            disposables.add(result);
          } else if (Array.isArray(disposables)) {
            disposables.push(result);
          }
          return result;
        };
        return this._event;
      }
      _removeListener(listener) {
        this._options?.onWillRemoveListener?.(this);
        if (!this._listeners) {
          return;
        }
        if (this._size === 1) {
          this._listeners = void 0;
          this._options?.onDidRemoveLastListener?.(this);
          this._size = 0;
          return;
        }
        const listeners = this._listeners;
        const index = listeners.indexOf(listener);
        if (index === -1) {
          console.log("disposed?", this._disposed);
          console.log("size?", this._size);
          console.log("arr?", JSON.stringify(this._listeners));
          throw new Error("Attempted to dispose unknown listener");
        }
        this._size--;
        listeners[index] = void 0;
        const adjustDeliveryQueue = this._deliveryQueue.current === this;
        if (this._size * compactionThreshold <= listeners.length) {
          let n = 0;
          for (let i = 0; i < listeners.length; i++) {
            if (listeners[i]) {
              listeners[n++] = listeners[i];
            } else if (adjustDeliveryQueue) {
              this._deliveryQueue.end--;
              if (n < this._deliveryQueue.i) {
                this._deliveryQueue.i--;
              }
            }
          }
          listeners.length = n;
        }
      }
      _deliver(listener, value) {
        if (!listener) {
          return;
        }
        const errorHandler2 = this._options?.onListenerError || onUnexpectedError;
        if (!errorHandler2) {
          listener.value(value);
          return;
        }
        try {
          listener.value(value);
        } catch (e) {
          errorHandler2(e);
        }
      }
      /** Delivers items in the queue. Assumes the queue is ready to go. */
      _deliverQueue(dq) {
        const listeners = dq.current._listeners;
        while (dq.i < dq.end) {
          this._deliver(listeners[dq.i++], dq.value);
        }
        dq.reset();
      }
      /**
       * To be kept private to fire an event to
       * subscribers
       */
      fire(event) {
        if (this._deliveryQueue?.current) {
          this._deliverQueue(this._deliveryQueue);
          this._perfMon?.stop();
        }
        this._perfMon?.start(this._size);
        if (!this._listeners) {
        } else if (this._listeners instanceof UniqueContainer) {
          this._deliver(this._listeners, event);
        } else {
          const dq = this._deliveryQueue;
          dq.enqueue(this, event, this._listeners.length);
          this._deliverQueue(dq);
        }
        this._perfMon?.stop();
      }
      hasListeners() {
        return this._size > 0;
      }
    };
    var EventMultiplexer = class {
      emitter;
      hasListeners = false;
      events = [];
      constructor() {
        this.emitter = new Emitter2({
          onWillAddFirstListener: () => this.onFirstListenerAdd(),
          onDidRemoveLastListener: () => this.onLastListenerRemove()
        });
      }
      get event() {
        return this.emitter.event;
      }
      add(event) {
        const e = { event, listener: null };
        this.events.push(e);
        if (this.hasListeners) {
          this.hook(e);
        }
        const dispose2 = () => {
          if (this.hasListeners) {
            this.unhook(e);
          }
          const idx = this.events.indexOf(e);
          this.events.splice(idx, 1);
        };
        return toDisposable(once(dispose2));
      }
      onFirstListenerAdd() {
        this.hasListeners = true;
        this.events.forEach((e) => this.hook(e));
      }
      onLastListenerRemove() {
        this.hasListeners = false;
        this.events.forEach((e) => this.unhook(e));
      }
      hook(e) {
        e.listener = e.event((r) => this.emitter.fire(r));
      }
      unhook(e) {
        if (e.listener) {
          e.listener.dispose();
        }
        e.listener = null;
      }
      dispose() {
        this.emitter.dispose();
      }
    };
    var Relay = class {
      listening = false;
      inputEvent = Event.None;
      inputEventListener = Disposable.None;
      emitter = new Emitter2({
        onDidAddFirstListener: () => {
          this.listening = true;
          this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
        },
        onDidRemoveLastListener: () => {
          this.listening = false;
          this.inputEventListener.dispose();
        }
      });
      event = this.emitter.event;
      set input(event) {
        this.inputEvent = event;
        if (this.listening) {
          this.inputEventListener.dispose();
          this.inputEventListener = event(this.emitter.fire, this.emitter);
        }
      }
      dispose() {
        this.inputEventListener.dispose();
        this.emitter.dispose();
      }
    };
    var PauseableEmitter = class extends Emitter2 {
      _isPaused = 0;
      _eventQueue = new LinkedList();
      _mergeFn;
      get isPaused() {
        return this._isPaused !== 0;
      }
      constructor(options) {
        super(options);
        this._mergeFn = options?.merge;
      }
      pause() {
        this._isPaused++;
      }
      resume() {
        if (this._isPaused !== 0 && --this._isPaused === 0) {
          if (this._mergeFn) {
            if (this._eventQueue.size > 0) {
              const events = Array.from(this._eventQueue);
              this._eventQueue.clear();
              super.fire(this._mergeFn(events));
            }
          } else {
            while (!this._isPaused && this._eventQueue.size !== 0) {
              super.fire(this._eventQueue.shift());
            }
          }
        }
      }
      fire(event) {
        if (this._size) {
          if (this._isPaused !== 0) {
            this._eventQueue.push(event);
          } else {
            super.fire(event);
          }
        }
      }
    };
    var shortcutEvent = Object.freeze(function(callback, context) {
      const handle = setTimeout(callback.bind(context), 0);
      return {
        dispose() {
          clearTimeout(handle);
        }
      };
    });
    var CancellationToken;
    ((CancellationToken3) => {
      function isCancellationToken(thing) {
        if (thing === CancellationToken3.None || thing === CancellationToken3.Cancelled) {
          return true;
        }
        if (thing instanceof MutableToken) {
          return true;
        }
        if (!thing || typeof thing !== "object") {
          return false;
        }
        return typeof thing.isCancellationRequested === "boolean" && typeof thing.onCancellationRequested === "function";
      }
      CancellationToken3.isCancellationToken = isCancellationToken;
      CancellationToken3.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: Event.None
      });
      CancellationToken3.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: shortcutEvent
      });
    })(CancellationToken || (CancellationToken = {}));
    var MutableToken = class {
      _isCancelled = false;
      _emitter = null;
      cancel() {
        if (!this._isCancelled) {
          this._isCancelled = true;
          if (this._emitter) {
            this._emitter.fire(void 0);
            this.dispose();
          }
        }
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        if (this._isCancelled) {
          return shortcutEvent;
        }
        if (!this._emitter) {
          this._emitter = new Emitter2();
        }
        return this._emitter.event;
      }
      dispose() {
        if (this._emitter) {
          this._emitter.dispose();
          this._emitter = null;
        }
      }
    };
    var CancellationTokenSource = class {
      _token = void 0;
      _parentListener = void 0;
      constructor(parent) {
        this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
      }
      get token() {
        if (!this._token) {
          this._token = new MutableToken();
        }
        return this._token;
      }
      cancel() {
        if (!this._token) {
          this._token = CancellationToken.Cancelled;
        } else if (this._token instanceof MutableToken) {
          this._token.cancel();
        }
      }
      dispose(cancel = false) {
        if (cancel) {
          this.cancel();
        }
        this._parentListener?.dispose();
        if (!this._token) {
          this._token = CancellationToken.None;
        } else if (this._token instanceof MutableToken) {
          this._token.dispose();
        }
      }
    };
    function isThenable(obj) {
      return !!obj && typeof obj.then === "function";
    }
    function createCancelablePromise(callback) {
      const source = new CancellationTokenSource();
      const thenable = callback(source.token);
      const promise = new Promise((resolve2, reject) => {
        const subscription = source.token.onCancellationRequested(() => {
          subscription.dispose();
          source.dispose();
          reject(new CancellationError());
        });
        Promise.resolve(thenable).then(
          (value) => {
            subscription.dispose();
            source.dispose();
            resolve2(value);
          },
          (err) => {
            subscription.dispose();
            source.dispose();
            reject(err);
          }
        );
      });
      return new class {
        cancel() {
          source.cancel();
        }
        then(resolve2, reject) {
          return promise.then(resolve2, reject);
        }
        catch(reject) {
          return this.then(void 0, reject);
        }
        finally(onfinally) {
          return promise.finally(onfinally);
        }
      }();
    }
    function raceCancellation(promise, token, defaultValue) {
      return new Promise((resolve2, reject) => {
        const ref = token.onCancellationRequested(() => {
          ref.dispose();
          resolve2(defaultValue);
        });
        promise.then(resolve2, reject).finally(() => ref.dispose());
      });
    }
    function raceCancellationError(promise, token) {
      return new Promise((resolve2, reject) => {
        const ref = token.onCancellationRequested(() => {
          ref.dispose();
          reject(new CancellationError());
        });
        promise.then(resolve2, reject).finally(() => ref.dispose());
      });
    }
    async function raceCancellablePromises(cancellablePromises) {
      let resolvedPromiseIndex = -1;
      const promises = cancellablePromises.map(
        (promise, index) => promise.then((result) => {
          resolvedPromiseIndex = index;
          return result;
        })
      );
      try {
        const result = await Promise.race(promises);
        return result;
      } finally {
        cancellablePromises.forEach((cancellablePromise, index) => {
          if (index !== resolvedPromiseIndex) {
            cancellablePromise.cancel();
          }
        });
      }
    }
    function raceTimeout(promise, timeout2, onTimeout) {
      let promiseResolve = void 0;
      const timer = setTimeout(() => {
        promiseResolve?.(void 0);
        onTimeout?.();
      }, timeout2);
      return Promise.race([promise.finally(() => clearTimeout(timer)), new Promise((resolve2) => promiseResolve = resolve2)]);
    }
    var ResolvablePromise = class {
      _resolve;
      _reject;
      _promise;
      _isFinished = false;
      constructor() {
        this._promise = new Promise((resolve2, reject) => {
          this._resolve = resolve2;
          this._reject = reject;
        });
      }
      get promise() {
        return this._promise;
      }
      get isFinished() {
        return this._isFinished;
      }
      resolve(value) {
        if (this._isFinished) {
          throw new Error("Already finished");
        }
        this._isFinished = true;
        this._resolve(value);
      }
      reject(err) {
        if (this._isFinished) {
          throw new Error("Already finished");
        }
        this._isFinished = true;
        this._reject(err);
      }
    };
    var Barrier = class {
      _isOpen;
      _promise;
      _completePromise;
      constructor() {
        this._isOpen = false;
        this._promise = new Promise((c, _e) => {
          this._completePromise = c;
        });
      }
      isOpen() {
        return this._isOpen;
      }
      open() {
        this._isOpen = true;
        this._completePromise(true);
      }
      wait() {
        return this._promise;
      }
    };
    function runWhenIdle(runner, _timeout) {
      let disposed = false;
      setTimeout(() => {
        if (disposed) {
          return;
        }
        const end = Date.now() + 15;
        runner(
          Object.freeze({
            didTimeout: true,
            timeRemaining() {
              return Math.max(0, end - Date.now());
            }
          })
        );
      }, 0);
      return {
        dispose() {
          if (disposed) {
            return;
          }
          disposed = true;
        }
      };
    }
    var IdleValue = class {
      _executor;
      _handle;
      _didRun = false;
      _value;
      _error;
      constructor(executor) {
        this._executor = () => {
          try {
            this._value = executor();
          } catch (err) {
            this._error = err;
          } finally {
            this._didRun = true;
          }
        };
        this._handle = runWhenIdle(() => this._executor());
      }
      dispose() {
        this._handle.dispose();
      }
      get value() {
        if (!this._didRun) {
          this._handle.dispose();
          this._executor();
        }
        if (this._error) {
          throw this._error;
        }
        return this._value;
      }
      get isInitialized() {
        return this._didRun;
      }
    };
    async function wait(timeout2) {
      return new Promise((resolve2) => {
        setTimeout(resolve2, timeout2);
      });
    }
    function timeout(millis, token) {
      if (!token) {
        return createCancelablePromise((token2) => timeout(millis, token2));
      }
      return new Promise((resolve2, reject) => {
        const handle = setTimeout(() => {
          disposable.dispose();
          resolve2();
        }, millis);
        const disposable = token.onCancellationRequested(() => {
          clearTimeout(handle);
          disposable.dispose();
          reject(new CancellationError());
        });
      });
    }
    function waitCondition(condition, interval = 1) {
      return new Promise((resolve2) => {
        const handle = setInterval(() => {
          if (condition()) {
            clearInterval(handle);
            resolve2();
          }
        }, interval);
      });
    }
    function compareSubstring(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
      for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
        const codeA = a.charCodeAt(aStart);
        const codeB = b.charCodeAt(bStart);
        if (codeA < codeB) {
          return -1;
        } else if (codeA > codeB) {
          return 1;
        }
      }
      const aLen = aEnd - aStart;
      const bLen = bEnd - bStart;
      if (aLen < bLen) {
        return -1;
      } else if (aLen > bLen) {
        return 1;
      }
      return 0;
    }
    function compareIgnoreCase(a, b) {
      return compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
    }
    function compareSubstringIgnoreCase(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
      for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
        let codeA = a.charCodeAt(aStart);
        let codeB = b.charCodeAt(bStart);
        if (codeA === codeB) {
          continue;
        }
        if (codeA >= 128 || codeB >= 128) {
          return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
        }
        if (isLowerAsciiLetter(codeA)) {
          codeA -= 32;
        }
        if (isLowerAsciiLetter(codeB)) {
          codeB -= 32;
        }
        const diff = codeA - codeB;
        if (diff === 0) {
          continue;
        }
        return diff;
      }
      const aLen = aEnd - aStart;
      const bLen = bEnd - bStart;
      if (aLen < bLen) {
        return -1;
      } else if (aLen > bLen) {
        return 1;
      }
      return 0;
    }
    function isAsciiDigit(code) {
      return code >= 48 && code <= 57;
    }
    function isLowerAsciiLetter(code) {
      return code >= 97 && code <= 122;
    }
    function isUpperAsciiLetter(code) {
      return code >= 65 && code <= 90;
    }
    function equalsIgnoreCase(a, b) {
      return a.length === b.length && compareSubstringIgnoreCase(a, b) === 0;
    }
    function startsWithIgnoreCase(str, candidate) {
      const candidateLength = candidate.length;
      if (candidate.length > str.length) {
        return false;
      }
      return compareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0;
    }
    function commonPrefixLength(a, b) {
      const len = Math.min(a.length, b.length);
      let i;
      for (i = 0; i < len; i++) {
        if (a.charCodeAt(i) !== b.charCodeAt(i)) {
          return i;
        }
      }
      return len;
    }
    function commonSuffixLength(a, b) {
      const len = Math.min(a.length, b.length);
      let i;
      const aLastIndex = a.length - 1;
      const bLastIndex = b.length - 1;
      for (i = 0; i < len; i++) {
        if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
          return i;
        }
      }
      return len;
    }
    function trim(haystack, needle = " ") {
      const trimmed = ltrim(haystack, needle);
      return rtrim(trimmed, needle);
    }
    function ltrim(haystack, needle) {
      if (!haystack || !needle) {
        return haystack;
      }
      const needleLen = needle.length;
      if (needleLen === 0 || haystack.length === 0) {
        return haystack;
      }
      let offset = 0;
      while (haystack.indexOf(needle, offset) === offset) {
        offset = offset + needleLen;
      }
      return haystack.substring(offset);
    }
    function rtrim(haystack, needle) {
      if (!haystack || !needle) {
        return haystack;
      }
      const needleLen = needle.length, haystackLen = haystack.length;
      if (needleLen === 0 || haystackLen === 0) {
        return haystack;
      }
      let offset = haystackLen, idx = -1;
      while (true) {
        idx = haystack.lastIndexOf(needle, offset - 1);
        if (idx === -1 || idx + needleLen !== offset) {
          break;
        }
        if (idx === 0) {
          return "";
        }
        offset = idx;
      }
      return haystack.substring(0, offset);
    }
    function isHighSurrogate(charCode) {
      return 55296 <= charCode && charCode <= 56319;
    }
    function isLowSurrogate(charCode) {
      return 56320 <= charCode && charCode <= 57343;
    }
    function computeCodePoint(highSurrogate, lowSurrogate) {
      return (highSurrogate - 55296 << 10) + (lowSurrogate - 56320) + 65536;
    }
    function compare(a, b) {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    }
    var regexCache = /* @__PURE__ */ new Map();
    function matchesGlob(str, glob) {
      let regex = regexCache.get(glob);
      if (!regex) {
        const regexPattern = globToRegex(glob);
        regex = new RegExp(regexPattern);
        regexCache.set(glob, regex);
      }
      return regex.test(str);
    }
    function globToRegex(glob) {
      let regex = "^";
      let i = 0;
      while (i < glob.length) {
        const c = glob[i];
        if (c === "\\") {
          i++;
          if (i < glob.length) {
            const nextChar = glob[i];
            regex += "\\" + nextChar;
          } else {
            regex += "\\\\";
          }
        } else if (c === "*") {
          if (glob[i + 1] === "*") {
            regex += ".*";
            i++;
          } else {
            regex += "[^/]*";
          }
        } else if (c === "?") {
          regex += "[^/]";
        } else if (c === "[") {
          let j = i + 1;
          let charClass = "";
          if (j < glob.length && (glob[j] === "!" || glob[j] === "^")) {
            charClass += "^";
            j++;
          }
          while (j < glob.length && glob[j] !== "]") {
            let cc = glob[j];
            if (cc === "\\" && j + 1 < glob.length) {
              j++;
              cc = glob[j];
              charClass += "\\" + cc;
            } else {
              if ("\\^$.|?*+(){}".includes(cc)) {
                charClass += "\\" + cc;
              } else {
                charClass += cc;
              }
            }
            j++;
          }
          if (j >= glob.length || glob[j] !== "]") {
            regex += "\\[";
            i = j - 1;
          } else {
            regex += "[" + charClass + "]";
            i = j;
          }
        } else if (c === "{") {
          let j = i + 1;
          let group = "";
          while (j < glob.length && glob[j] !== "}") {
            const currentChar = glob[j];
            if (currentChar === "\\" && j + 1 < glob.length) {
              j++;
              group += "\\" + glob[j];
            } else {
              group += currentChar;
            }
            j++;
          }
          if (j >= glob.length || glob[j] !== "}") {
            regex += "\\{";
            i = j - 1;
          } else {
            const options = group.split(",").map((option) => {
              return globToRegex(option).slice(1, -1);
            });
            regex += "(" + options.join("|") + ")";
            i = j;
          }
        } else {
          if ("\\^$.|+(){}".includes(c)) {
            regex += "\\" + c;
          } else {
            regex += c;
          }
        }
        i++;
      }
      regex += "$";
      return regex;
    }
    function fuzzyContains(target, query) {
      if (!target) {
        return false;
      }
      if (!query) {
        return true;
      }
      if (target.length < query.length) {
        return false;
      }
      const queryLen = query.length;
      const targetLower = target.toLowerCase();
      let index = 0;
      let lastIndexOf = -1;
      while (index < queryLen) {
        const indexOf = targetLower.indexOf(query[index], lastIndexOf + 1);
        if (indexOf < 0) {
          return false;
        }
        lastIndexOf = indexOf;
        index++;
      }
      return true;
    }
    var Lazy = class {
      constructor(executor) {
        this.executor = executor;
      }
      executor;
      _didRun = false;
      _value;
      _error;
      /**
       * True if the lazy value has been resolved.
       */
      get hasValue() {
        return this._didRun;
      }
      /**
       * Get the wrapped value.
       *
       * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
       * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
       */
      get value() {
        if (!this._didRun) {
          try {
            this._value = this.executor();
          } catch (err) {
            this._error = err;
          } finally {
            this._didRun = true;
          }
        }
        if (this._error) {
          throw this._error;
        }
        return this._value;
      }
      /**
       * Get the wrapped value without forcing evaluation.
       */
      get rawValue() {
        return this._value;
      }
    };
    function newWriteableStream(reducer, options) {
      return new WriteableStreamImpl(reducer, options);
    }
    var WriteableStreamImpl = class {
      constructor(reducer, options) {
        this.reducer = reducer;
        this.options = options;
      }
      reducer;
      options;
      state = {
        flowing: false,
        ended: false,
        destroyed: false
      };
      buffer = {
        data: [],
        error: []
      };
      listeners = {
        data: [],
        error: [],
        end: []
      };
      pendingWritePromises = [];
      pause() {
        if (this.state.destroyed) {
          return;
        }
        this.state.flowing = false;
      }
      resume() {
        if (this.state.destroyed) {
          return;
        }
        if (!this.state.flowing) {
          this.state.flowing = true;
          this.flowData();
          this.flowErrors();
          this.flowEnd();
        }
      }
      write(data) {
        if (this.state.destroyed) {
          return;
        }
        if (this.state.flowing) {
          this.emitData(data);
        } else {
          this.buffer.data.push(data);
          if (typeof this.options?.highWaterMark === "number" && this.buffer.data.length > this.options.highWaterMark) {
            return new Promise((resolve2) => this.pendingWritePromises.push(resolve2));
          }
        }
      }
      error(error) {
        if (this.state.destroyed) {
          return;
        }
        if (this.state.flowing) {
          this.emitError(error);
        } else {
          this.buffer.error.push(error);
        }
      }
      end(result) {
        if (this.state.destroyed) {
          return;
        }
        if (typeof result !== "undefined") {
          this.write(result);
        }
        if (this.state.flowing) {
          this.emitEnd();
          this.destroy();
        } else {
          this.state.ended = true;
        }
      }
      emitData(data) {
        this.listeners.data.slice(0).forEach((listener) => listener(data));
      }
      emitError(error) {
        if (this.listeners.error.length === 0) {
          onUnexpectedError(error);
        } else {
          this.listeners.error.slice(0).forEach((listener) => listener(error));
        }
      }
      emitEnd() {
        this.listeners.end.slice(0).forEach((listener) => listener());
      }
      on(event, callback) {
        if (this.state.destroyed) {
          return;
        }
        switch (event) {
          case "data":
            this.listeners.data.push(callback);
            this.resume();
            break;
          case "end":
            this.listeners.end.push(callback);
            if (this.state.flowing && this.flowEnd()) {
              this.destroy();
            }
            break;
          case "error":
            this.listeners.error.push(callback);
            if (this.state.flowing) {
              this.flowErrors();
            }
            break;
        }
      }
      removeListener(event, callback) {
        if (this.state.destroyed) {
          return;
        }
        let listeners = void 0;
        switch (event) {
          case "data":
            listeners = this.listeners.data;
            break;
          case "end":
            listeners = this.listeners.end;
            break;
          case "error":
            listeners = this.listeners.error;
            break;
        }
        if (listeners) {
          const index = listeners.indexOf(callback);
          if (index >= 0) {
            listeners.splice(index, 1);
          }
        }
      }
      flowData() {
        if (this.buffer.data.length > 0) {
          const fullDataBuffer = this.reducer(this.buffer.data);
          this.emitData(fullDataBuffer);
          this.buffer.data.length = 0;
          const pendingWritePromises = [...this.pendingWritePromises];
          this.pendingWritePromises.length = 0;
          pendingWritePromises.forEach((pendingWritePromise) => pendingWritePromise());
        }
      }
      flowErrors() {
        if (this.listeners.error.length > 0) {
          for (const error of this.buffer.error) {
            this.emitError(error);
          }
          this.buffer.error.length = 0;
        }
      }
      flowEnd() {
        if (this.state.ended) {
          this.emitEnd();
          return this.listeners.end.length > 0;
        }
        return false;
      }
      destroy() {
        if (!this.state.destroyed) {
          this.state.destroyed = true;
          this.state.ended = true;
          this.buffer.data.length = 0;
          this.buffer.error.length = 0;
          this.listeners.data.length = 0;
          this.listeners.error.length = 0;
          this.listeners.end.length = 0;
          this.pendingWritePromises.length = 0;
        }
      }
    };
    function consumeReadable(readable, reducer) {
      const chunks = [];
      let chunk;
      while ((chunk = readable.read()) !== null) {
        chunks.push(chunk);
      }
      return reducer(chunks);
    }
    function consumeStream(stream, reducer) {
      return new Promise((resolve2, reject) => {
        const chunks = [];
        listenStream(stream, {
          onData: (chunk) => {
            if (reducer) {
              chunks.push(chunk);
            }
          },
          onError: (error) => {
            if (reducer) {
              reject(error);
            } else {
              resolve2(void 0);
            }
          },
          onEnd: () => {
            if (reducer) {
              resolve2(reducer(chunks));
            } else {
              resolve2(void 0);
            }
          }
        });
      });
    }
    function listenStream(stream, listener, token) {
      stream.on("error", (error) => {
        if (!token?.isCancellationRequested) {
          listener.onError(error);
        }
      });
      stream.on("end", () => {
        if (!token?.isCancellationRequested) {
          listener.onEnd();
        }
      });
      stream.on("data", (data) => {
        if (!token?.isCancellationRequested) {
          listener.onData(data);
        }
      });
    }
    function toStream(t, reducer) {
      const stream = newWriteableStream(reducer);
      stream.end(t);
      return stream;
    }
    function toReadable(t) {
      let consumed = false;
      return {
        read: () => {
          if (consumed) {
            return null;
          }
          consumed = true;
          return t;
        }
      };
    }
    function transform(stream, transformer, reducer) {
      const target = newWriteableStream(reducer);
      listenStream(stream, {
        onData: (data) => target.write(transformer.data(data)),
        onError: (error) => target.error(transformer.error ? transformer.error(error) : error),
        onEnd: () => target.end()
      });
      return target;
    }
    function prefixedReadable(prefix, readable, reducer) {
      let prefixHandled = false;
      return {
        read: () => {
          const chunk = readable.read();
          if (!prefixHandled) {
            prefixHandled = true;
            if (chunk !== null) {
              return reducer([prefix, chunk]);
            }
            return prefix;
          }
          return chunk;
        }
      };
    }
    function prefixedStream(prefix, stream, reducer) {
      let prefixHandled = false;
      const target = newWriteableStream(reducer);
      listenStream(stream, {
        onData: (data) => {
          if (!prefixHandled) {
            prefixHandled = true;
            return target.write(reducer([prefix, data]));
          }
          return target.write(data);
        },
        onError: (error) => target.error(error),
        onEnd: () => {
          if (!prefixHandled) {
            prefixHandled = true;
            target.write(prefix);
          }
          target.end();
        }
      });
      return target;
    }
    var hasBuffer = typeof Buffer !== "undefined";
    var indexOfTable = new Lazy(() => new Uint8Array(256));
    var textEncoder;
    var textDecoder;
    var VSBuffer = class _VSBuffer {
      /**
       * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
       * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
       */
      static alloc(byteLength) {
        if (hasBuffer) {
          return new _VSBuffer(Buffer.allocUnsafe(byteLength));
        } else {
          return new _VSBuffer(new Uint8Array(byteLength));
        }
      }
      /**
       * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
       * the returned `VSBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
       * which is not transferrable.
       */
      static wrap(actual) {
        if (hasBuffer && !Buffer.isBuffer(actual)) {
          actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
        }
        return new _VSBuffer(actual);
      }
      /**
       * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
       * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
       */
      static fromString(source, options) {
        const dontUseNodeBuffer = options?.dontUseNodeBuffer || false;
        if (!dontUseNodeBuffer && hasBuffer) {
          return new _VSBuffer(Buffer.from(source));
        } else {
          if (!textEncoder) {
            textEncoder = new TextEncoder();
          }
          return new _VSBuffer(textEncoder.encode(source));
        }
      }
      /**
       * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
       * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
       */
      static fromByteArray(source) {
        const result = _VSBuffer.alloc(source.length);
        for (let i = 0, len = source.length; i < len; i++) {
          result.buffer[i] = source[i];
        }
        return result;
      }
      /**
       * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
       * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
       */
      static concat(buffers, totalLength) {
        if (typeof totalLength === "undefined") {
          totalLength = 0;
          for (let i = 0, len = buffers.length; i < len; i++) {
            totalLength += buffers[i].byteLength;
          }
        }
        const ret = _VSBuffer.alloc(totalLength);
        let offset = 0;
        for (let i = 0, len = buffers.length; i < len; i++) {
          const element = buffers[i];
          ret.set(element, offset);
          offset += element.byteLength;
        }
        return ret;
      }
      buffer;
      byteLength;
      constructor(buffer) {
        this.buffer = buffer;
        this.byteLength = this.buffer.byteLength;
      }
      /**
       * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
       * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
       */
      clone() {
        const result = _VSBuffer.alloc(this.byteLength);
        result.set(this);
        return result;
      }
      toString() {
        if (hasBuffer) {
          return this.buffer.toString();
        } else {
          if (!textDecoder) {
            textDecoder = new TextDecoder();
          }
          return textDecoder.decode(this.buffer);
        }
      }
      slice(start, end) {
        return new _VSBuffer(this.buffer.subarray(start, end));
      }
      set(array, offset) {
        if (array instanceof _VSBuffer) {
          this.buffer.set(array.buffer, offset);
        } else if (array instanceof Uint8Array) {
          this.buffer.set(array, offset);
        } else if (array instanceof ArrayBuffer) {
          this.buffer.set(new Uint8Array(array), offset);
        } else if (ArrayBuffer.isView(array)) {
          this.buffer.set(new Uint8Array(array.buffer, array.byteOffset, array.byteLength), offset);
        } else {
          throw new Error(`Unknown argument 'array'`);
        }
      }
      readUInt32BE(offset) {
        return readUInt32BE(this.buffer, offset);
      }
      writeUInt32BE(value, offset) {
        writeUInt32BE(this.buffer, value, offset);
      }
      readUInt32LE(offset) {
        return readUInt32LE(this.buffer, offset);
      }
      writeUInt32LE(value, offset) {
        writeUInt32LE(this.buffer, value, offset);
      }
      readUInt8(offset) {
        return readUInt8(this.buffer, offset);
      }
      writeUInt8(value, offset) {
        writeUInt8(this.buffer, value, offset);
      }
      indexOf(subarray, offset = 0) {
        return binaryIndexOf(this.buffer, subarray instanceof _VSBuffer ? subarray.buffer : subarray, offset);
      }
    };
    function binaryIndexOf(haystack, needle, offset = 0) {
      const needleLen = needle.byteLength;
      const haystackLen = haystack.byteLength;
      if (needleLen === 0) {
        return 0;
      }
      if (needleLen === 1) {
        return haystack.indexOf(needle[0]);
      }
      if (needleLen > haystackLen - offset) {
        return -1;
      }
      const table = indexOfTable.value;
      table.fill(needle.length);
      for (let i2 = 0; i2 < needle.length; i2++) {
        table[needle[i2]] = needle.length - i2 - 1;
      }
      let i = offset + needle.length - 1;
      let j = i;
      let result = -1;
      while (i < haystackLen) {
        if (haystack[i] === needle[j]) {
          if (j === 0) {
            result = i;
            break;
          }
          i--;
          j--;
        } else {
          i += Math.max(needle.length - j, table[haystack[i]]);
          j = needle.length - 1;
        }
      }
      return result;
    }
    function readUInt16LE(source, offset) {
      return source[offset + 0] << 0 >>> 0 | source[offset + 1] << 8 >>> 0;
    }
    function writeUInt16LE(destination, value, offset) {
      destination[offset + 0] = value & 255;
      value = value >>> 8;
      destination[offset + 1] = value & 255;
    }
    function readUInt32BE(source, offset) {
      return source[offset] * 2 ** 24 + source[offset + 1] * 2 ** 16 + source[offset + 2] * 2 ** 8 + source[offset + 3];
    }
    function writeUInt32BE(destination, value, offset) {
      destination[offset + 3] = value;
      value = value >>> 8;
      destination[offset + 2] = value;
      value = value >>> 8;
      destination[offset + 1] = value;
      value = value >>> 8;
      destination[offset] = value;
    }
    function readUInt32LE(source, offset) {
      return source[offset + 0] << 0 >>> 0 | source[offset + 1] << 8 >>> 0 | source[offset + 2] << 16 >>> 0 | source[offset + 3] << 24 >>> 0;
    }
    function writeUInt32LE(destination, value, offset) {
      destination[offset + 0] = value & 255;
      value = value >>> 8;
      destination[offset + 1] = value & 255;
      value = value >>> 8;
      destination[offset + 2] = value & 255;
      value = value >>> 8;
      destination[offset + 3] = value & 255;
    }
    function readUInt8(source, offset) {
      return source[offset];
    }
    function writeUInt8(destination, value, offset) {
      destination[offset] = value;
    }
    function readableToBuffer(readable) {
      return consumeReadable(readable, (chunks) => VSBuffer.concat(chunks));
    }
    function bufferToReadable(buffer) {
      return toReadable(buffer);
    }
    function streamToBuffer(stream) {
      return consumeStream(stream, (chunks) => VSBuffer.concat(chunks));
    }
    async function bufferedStreamToBuffer(bufferedStream) {
      if (bufferedStream.ended) {
        return VSBuffer.concat(bufferedStream.buffer);
      }
      return VSBuffer.concat([
        // Include already read chunks...
        ...bufferedStream.buffer,
        // ...and all additional chunks
        await streamToBuffer(bufferedStream.stream)
      ]);
    }
    function bufferToStream(buffer) {
      return toStream(buffer, (chunks) => VSBuffer.concat(chunks));
    }
    function streamToBufferReadableStream(stream) {
      return transform(stream, { data: (data) => typeof data === "string" ? VSBuffer.fromString(data) : VSBuffer.wrap(data) }, (chunks) => VSBuffer.concat(chunks));
    }
    function newWriteableBufferStream(options) {
      return newWriteableStream((chunks) => VSBuffer.concat(chunks), options);
    }
    function prefixedBufferReadable(prefix, readable) {
      return prefixedReadable(prefix, readable, (chunks) => VSBuffer.concat(chunks));
    }
    function prefixedBufferStream(prefix, stream) {
      return prefixedStream(prefix, stream, (chunks) => VSBuffer.concat(chunks));
    }
    function decodeBase64(encoded) {
      let building = 0;
      let remainder = 0;
      let bufi = 0;
      const buffer = new Uint8Array(Math.floor(encoded.length / 4 * 3));
      const append = (value) => {
        switch (remainder) {
          case 3:
            buffer[bufi++] = building | value;
            remainder = 0;
            break;
          case 2:
            buffer[bufi++] = building | value >>> 2;
            building = value << 6;
            remainder = 3;
            break;
          case 1:
            buffer[bufi++] = building | value >>> 4;
            building = value << 4;
            remainder = 2;
            break;
          default:
            building = value << 2;
            remainder = 1;
        }
      };
      for (let i = 0; i < encoded.length; i++) {
        const code = encoded.charCodeAt(i);
        if (code >= 65 && code <= 90) {
          append(code - 65);
        } else if (code >= 97 && code <= 122) {
          append(code - 97 + 26);
        } else if (code >= 48 && code <= 57) {
          append(code - 48 + 52);
        } else if (code === 43 || code === 45) {
          append(62);
        } else if (code === 47 || code === 95) {
          append(63);
        } else if (code === 61) {
          break;
        } else {
          throw new SyntaxError(`Unexpected base64 character ${encoded[i]}`);
        }
      }
      const unpadded = bufi;
      while (remainder > 0) {
        append(0);
      }
      return VSBuffer.wrap(buffer).slice(0, unpadded);
    }
    var base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64UrlSafeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    function encodeBase64({ buffer }, padded = true, urlSafe = false) {
      const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
      let output = "";
      const remainder = buffer.byteLength % 3;
      let i = 0;
      for (; i < buffer.byteLength - remainder; i += 3) {
        const a = buffer[i + 0];
        const b = buffer[i + 1];
        const c = buffer[i + 2];
        output += dictionary[a >>> 2];
        output += dictionary[(a << 4 | b >>> 4) & 63];
        output += dictionary[(b << 2 | c >>> 6) & 63];
        output += dictionary[c & 63];
      }
      if (remainder === 1) {
        const a = buffer[i + 0];
        output += dictionary[a >>> 2];
        output += dictionary[a << 4 & 63];
        if (padded) {
          output += "==";
        }
      } else if (remainder === 2) {
        const a = buffer[i + 0];
        const b = buffer[i + 1];
        output += dictionary[a >>> 2];
        output += dictionary[(a << 4 | b >>> 4) & 63];
        output += dictionary[b << 2 & 63];
        if (padded) {
          output += "=";
        }
      }
      return output;
    }
    function createDecorator(mapFn) {
      return (_target, key, descriptor) => {
        let fnKey = null;
        let fn = null;
        if (typeof descriptor.value === "function") {
          fnKey = "value";
          fn = descriptor.value;
        } else if (typeof descriptor.get === "function") {
          fnKey = "get";
          fn = descriptor.get;
        }
        if (!fn) {
          throw new Error("not supported");
        }
        descriptor[fnKey] = mapFn(fn, key);
      };
    }
    function memoize(_target, key, descriptor) {
      let fnKey = null;
      let fn = null;
      if (typeof descriptor.value === "function") {
        fnKey = "value";
        fn = descriptor.value;
        if (fn.length !== 0) {
          console.warn("Memoize should only be used in functions with zero parameters");
        }
      } else if (typeof descriptor.get === "function") {
        fnKey = "get";
        fn = descriptor.get;
      }
      if (!fn) {
        throw new Error("not supported");
      }
      const memoizeKey = `$memoize$${key}`;
      descriptor[fnKey] = function(...args) {
        if (!this.hasOwnProperty(memoizeKey)) {
          Object.defineProperty(this, memoizeKey, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: fn.apply(this, args)
          });
        }
        return this[memoizeKey];
      };
    }
    function debounce(delay, reducer, initialValueProvider) {
      return createDecorator((fn, key) => {
        const timerKey = `$debounce$${key}`;
        const resultKey = `$debounce$result$${key}`;
        return function(...args) {
          if (!this[resultKey]) {
            this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
          }
          clearTimeout(this[timerKey]);
          if (reducer) {
            this[resultKey] = reducer(this[resultKey], ...args);
            args = [this[resultKey]];
          }
          this[timerKey] = setTimeout(() => {
            fn.apply(this, args);
            this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
          }, delay);
        };
      });
    }
    function throttle(delay, reducer, initialValueProvider) {
      return createDecorator((fn, key) => {
        const timerKey = `$throttle$timer$${key}`;
        const resultKey = `$throttle$result$${key}`;
        const lastRunKey = `$throttle$lastRun$${key}`;
        const pendingKey = `$throttle$pending$${key}`;
        return function(...args) {
          if (!this[resultKey]) {
            this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
          }
          if (this[lastRunKey] === null || this[lastRunKey] === void 0) {
            this[lastRunKey] = -Number.MAX_VALUE;
          }
          if (reducer) {
            this[resultKey] = reducer(this[resultKey], ...args);
          }
          if (this[pendingKey]) {
            return;
          }
          const nextTime = this[lastRunKey] + delay;
          if (nextTime <= Date.now()) {
            this[lastRunKey] = Date.now();
            fn.apply(this, [this[resultKey]]);
            this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
          } else {
            this[pendingKey] = true;
            this[timerKey] = setTimeout(() => {
              this[pendingKey] = false;
              this[lastRunKey] = Date.now();
              fn.apply(this, [this[resultKey]]);
              this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
            }, nextTime - Date.now());
          }
        };
      });
    }
    function getRandomElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    var CompareResult;
    ((CompareResult2) => {
      function isLessThan(result) {
        return result < 0;
      }
      CompareResult2.isLessThan = isLessThan;
      function isLessThanOrEqual(result) {
        return result <= 0;
      }
      CompareResult2.isLessThanOrEqual = isLessThanOrEqual;
      function isGreaterThan(result) {
        return result > 0;
      }
      CompareResult2.isGreaterThan = isGreaterThan;
      function isNeitherLessOrGreaterThan(result) {
        return result === 0;
      }
      CompareResult2.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
      CompareResult2.greaterThan = 1;
      CompareResult2.lessThan = -1;
      CompareResult2.neitherLessOrGreaterThan = 0;
    })(CompareResult || (CompareResult = {}));
    function revive(obj, depth = 0) {
      if (!obj || depth > 200) {
        return obj;
      }
      if (typeof obj === "object") {
        switch (obj.$mid) {
          case 1:
            return URI.revive(obj);
          case 2:
            return new RegExp(obj.source, obj.flags);
          case 16:
            return new Date(obj.source);
        }
        if (obj instanceof VSBuffer || obj instanceof Uint8Array) {
          return obj;
        }
        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; ++i) {
            obj[i] = revive(obj[i], depth + 1);
          }
        } else {
          for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
              obj[key] = revive(obj[key], depth + 1);
            }
          }
        }
      }
      return obj;
    }
    function requestTypeToStr(type) {
      switch (type) {
        case 100:
          return "req";
        case 101:
          return "cancel";
        case 102:
          return "subscribe";
        case 103:
          return "unsubscribe";
      }
    }
    function responseTypeToStr(type) {
      switch (type) {
        case 200:
          return `init`;
        case 201:
          return `reply:`;
        case 202:
        case 203:
          return `replyErr:`;
        case 204:
          return `event:`;
      }
    }
    function readIntVQL(reader) {
      let value = 0;
      for (let n = 0; ; n += 7) {
        const next = reader.read(1);
        value |= (next.buffer[0] & 127) << n;
        if (!(next.buffer[0] & 128)) {
          return value;
        }
      }
    }
    var vqlZero = createOneByteBuffer(0);
    function writeInt32VQL(writer, value) {
      if (value === 0) {
        writer.write(vqlZero);
        return;
      }
      let len = 0;
      for (let v2 = value; v2 !== 0; v2 = v2 >>> 7) {
        len++;
      }
      const scratch = VSBuffer.alloc(len);
      for (let i = 0; value !== 0; i++) {
        scratch.buffer[i] = value & 127;
        value = value >>> 7;
        if (value > 0) {
          scratch.buffer[i] |= 128;
        }
      }
      writer.write(scratch);
    }
    var BufferReader = class {
      constructor(buffer) {
        this.buffer = buffer;
      }
      buffer;
      pos = 0;
      read(bytes) {
        const result = this.buffer.slice(this.pos, this.pos + bytes);
        this.pos += result.byteLength;
        return result;
      }
    };
    var BufferWriter = class {
      buffers = [];
      get buffer() {
        return VSBuffer.concat(this.buffers);
      }
      write(buffer) {
        this.buffers.push(buffer);
      }
    };
    function createOneByteBuffer(value) {
      const result = VSBuffer.alloc(1);
      result.writeUInt8(value, 0);
      return result;
    }
    var BufferPresets = {
      Undefined: createOneByteBuffer(
        0
        /* Undefined */
      ),
      String: createOneByteBuffer(
        1
        /* String */
      ),
      Buffer: createOneByteBuffer(
        2
        /* Buffer */
      ),
      VSBuffer: createOneByteBuffer(
        3
        /* VSBuffer */
      ),
      Array: createOneByteBuffer(
        4
        /* Array */
      ),
      Object: createOneByteBuffer(
        5
        /* Object */
      ),
      Uint: createOneByteBuffer(
        6
        /* Int */
      )
    };
    var hasBuffer2 = typeof Buffer !== "undefined";
    function serialize(writer, data) {
      if (typeof data === "undefined") {
        writer.write(BufferPresets.Undefined);
      } else if (typeof data === "string") {
        const buffer = VSBuffer.fromString(data);
        writer.write(BufferPresets.String);
        writeInt32VQL(writer, buffer.byteLength);
        writer.write(buffer);
      } else if (hasBuffer2 && Buffer.isBuffer(data)) {
        const buffer = VSBuffer.wrap(data);
        writer.write(BufferPresets.Buffer);
        writeInt32VQL(writer, buffer.byteLength);
        writer.write(buffer);
      } else if (data instanceof VSBuffer) {
        writer.write(BufferPresets.VSBuffer);
        writeInt32VQL(writer, data.byteLength);
        writer.write(data);
      } else if (Array.isArray(data)) {
        writer.write(BufferPresets.Array);
        writeInt32VQL(writer, data.length);
        for (const el of data) {
          serialize(writer, el);
        }
      } else if (typeof data === "number" && (data | 0) === data) {
        writer.write(BufferPresets.Uint);
        writeInt32VQL(writer, data);
      } else {
        const buffer = VSBuffer.fromString(JSON.stringify(data));
        writer.write(BufferPresets.Object);
        writeInt32VQL(writer, buffer.byteLength);
        writer.write(buffer);
      }
    }
    function deserialize(reader) {
      const type = reader.read(1).readUInt8(0);
      switch (type) {
        case 0:
          return void 0;
        case 1:
          return reader.read(readIntVQL(reader)).toString();
        case 2:
          return reader.read(readIntVQL(reader)).buffer;
        case 3:
          return reader.read(readIntVQL(reader));
        case 4: {
          const length = readIntVQL(reader);
          const result = [];
          for (let i = 0; i < length; i++) {
            result.push(deserialize(reader));
          }
          return result;
        }
        case 5:
          return JSON.parse(reader.read(readIntVQL(reader)).toString());
        case 6:
          return readIntVQL(reader);
      }
    }
    var ChannelServer = class {
      constructor(protocol, ctx, logger = null, timeoutDelay = 1e3) {
        this.protocol = protocol;
        this.ctx = ctx;
        this.logger = logger;
        this.timeoutDelay = timeoutDelay;
        this.protocolListener = this.protocol.onMessage((msg) => this.onRawMessage(msg));
        this.sendResponse({
          type: 200
          /* Initialize */
        });
      }
      protocol;
      ctx;
      logger;
      timeoutDelay;
      channels = /* @__PURE__ */ new Map();
      activeRequests = /* @__PURE__ */ new Map();
      protocolListener;
      // Requests might come in for channels which are not yet registered.
      // They will timeout after `timeoutDelay`.
      pendingRequests = /* @__PURE__ */ new Map();
      registerChannel(channelName, channel) {
        this.channels.set(channelName, channel);
        setTimeout(() => this.flushPendingRequests(channelName), 0);
      }
      sendResponse(response) {
        switch (response.type) {
          case 200: {
            const msgLength = this.send([response.type]);
            this.logger?.logOutgoing(msgLength, 0, 1, responseTypeToStr(response.type));
            return;
          }
          case 201:
          case 202:
          case 204:
          case 203: {
            const msgLength = this.send([response.type, response.id], response.data);
            this.logger?.logOutgoing(msgLength, response.id, 1, responseTypeToStr(response.type), response.data);
            return;
          }
        }
      }
      send(header, body = void 0) {
        const writer = new BufferWriter();
        serialize(writer, header);
        serialize(writer, body);
        return this.sendBuffer(writer.buffer);
      }
      sendBuffer(message) {
        try {
          this.protocol.send(message);
          return message.byteLength;
        } catch (_err) {
          return 0;
        }
      }
      onRawMessage(message) {
        const reader = new BufferReader(message);
        const header = deserialize(reader);
        const body = deserialize(reader);
        const type = header[0];
        switch (type) {
          case 100:
            this.logger?.logIncoming(message.byteLength, header[1], 1, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
            return this.onPromise({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
          case 102:
            this.logger?.logIncoming(message.byteLength, header[1], 1, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
            return this.onEventListen({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
          case 101:
            this.logger?.logIncoming(message.byteLength, header[1], 1, `${requestTypeToStr(type)}`);
            return this.disposeActiveRequest({ type, id: header[1] });
          case 103:
            this.logger?.logIncoming(message.byteLength, header[1], 1, `${requestTypeToStr(type)}`);
            return this.disposeActiveRequest({ type, id: header[1] });
        }
      }
      onPromise(request) {
        const channel = this.channels.get(request.channelName);
        if (!channel) {
          this.collectPendingRequest(request);
          return;
        }
        const cancellationTokenSource = new CancellationTokenSource();
        let promise;
        try {
          promise = channel.call(this.ctx, request.name, request.arg, cancellationTokenSource.token);
        } catch (err) {
          promise = Promise.reject(err);
        }
        const id2 = request.id;
        promise.then(
          (data) => {
            this.sendResponse({
              id: id2,
              data,
              type: 201
              /* PromiseSuccess */
            });
            this.activeRequests.delete(request.id);
          },
          (err) => {
            if (err instanceof Error) {
              this.sendResponse({
                id: id2,
                data: {
                  message: err.message,
                  name: err.name,
                  stack: err.stack ? err.stack.split ? err.stack.split("\n") : err.stack : void 0
                },
                type: 202
                /* PromiseError */
              });
            } else {
              this.sendResponse({
                id: id2,
                data: err,
                type: 203
                /* PromiseErrorObj */
              });
            }
            this.activeRequests.delete(request.id);
          }
        );
        const disposable = toDisposable(() => cancellationTokenSource.cancel());
        this.activeRequests.set(request.id, disposable);
      }
      onEventListen(request) {
        const channel = this.channels.get(request.channelName);
        if (!channel) {
          this.collectPendingRequest(request);
          return;
        }
        const id2 = request.id;
        const event = channel.listen(this.ctx, request.name, request.arg);
        const disposable = event((data) => this.sendResponse({
          id: id2,
          data,
          type: 204
          /* EventFire */
        }));
        this.activeRequests.set(request.id, disposable);
      }
      disposeActiveRequest(request) {
        const disposable = this.activeRequests.get(request.id);
        if (disposable) {
          disposable.dispose();
          this.activeRequests.delete(request.id);
        }
      }
      collectPendingRequest(request) {
        let pendingRequests = this.pendingRequests.get(request.channelName);
        if (!pendingRequests) {
          pendingRequests = [];
          this.pendingRequests.set(request.channelName, pendingRequests);
        }
        const timer = setTimeout(() => {
          console.error(`Unknown channel: ${request.channelName}`);
          if (request.type === 100) {
            this.sendResponse({
              id: request.id,
              data: { name: "Unknown channel", message: `Channel name '${request.channelName}' timed out after ${this.timeoutDelay}ms`, stack: void 0 },
              type: 202
              /* PromiseError */
            });
          }
        }, this.timeoutDelay);
        pendingRequests.push({ request, timeoutTimer: timer });
      }
      flushPendingRequests(channelName) {
        const requests = this.pendingRequests.get(channelName);
        if (requests) {
          for (const request of requests) {
            clearTimeout(request.timeoutTimer);
            switch (request.request.type) {
              case 100:
                this.onPromise(request.request);
                break;
              case 102:
                this.onEventListen(request.request);
                break;
            }
          }
          this.pendingRequests.delete(channelName);
        }
      }
      dispose() {
        if (this.protocolListener) {
          this.protocolListener.dispose();
          this.protocolListener = null;
        }
        dispose(this.activeRequests.values());
        this.activeRequests.clear();
      }
    };
    var RequestInitiator = /* @__PURE__ */ ((RequestInitiator2) => {
      RequestInitiator2[RequestInitiator2["LocalSide"] = 0] = "LocalSide";
      RequestInitiator2[RequestInitiator2["OtherSide"] = 1] = "OtherSide";
      return RequestInitiator2;
    })(RequestInitiator || {});
    var ChannelClient = class {
      constructor(protocol, logger = null) {
        this.protocol = protocol;
        this.protocolListener = this.protocol.onMessage((msg) => this.onBuffer(msg));
        this.logger = logger;
      }
      protocol;
      isDisposed = false;
      state = 0;
      activeRequests = /* @__PURE__ */ new Set();
      handlers = /* @__PURE__ */ new Map();
      lastRequestId = 0;
      protocolListener;
      logger;
      _onDidInitialize = new Emitter2();
      onDidInitialize = this._onDidInitialize.event;
      getChannel(channelName) {
        const that = this;
        return {
          call(command, arg, cancellationToken) {
            if (that.isDisposed) {
              return Promise.reject(new CancellationError());
            }
            return that.requestPromise(channelName, command, arg, cancellationToken);
          },
          listen(event, arg) {
            if (that.isDisposed) {
              return Event.None;
            }
            return that.requestEvent(channelName, event, arg);
          }
        };
      }
      requestPromise(channelName, name, arg, cancellationToken = CancellationToken.None) {
        const id2 = this.lastRequestId++;
        const type = 100;
        const request = { id: id2, type, channelName, name, arg };
        if (cancellationToken.isCancellationRequested) {
          return Promise.reject(new CancellationError());
        }
        let disposable;
        const result = new Promise((c, e) => {
          if (cancellationToken.isCancellationRequested) {
            return e(new CancellationError());
          }
          const doRequest = () => {
            const handler = (response) => {
              switch (response.type) {
                case 201:
                  this.handlers.delete(id2);
                  c(response.data);
                  break;
                case 202: {
                  this.handlers.delete(id2);
                  const error = new Error(response.data.message);
                  error.stack = Array.isArray(response.data.stack) ? response.data.stack.join("\n") : response.data.stack;
                  error.name = response.data.name;
                  e(error);
                  break;
                }
                case 203:
                  this.handlers.delete(id2);
                  e(response.data);
                  break;
              }
            };
            this.handlers.set(id2, handler);
            this.sendRequest(request);
          };
          let uninitializedPromise = null;
          if (this.state === 1) {
            doRequest();
          } else {
            uninitializedPromise = createCancelablePromise((_) => this.whenInitialized());
            uninitializedPromise.then(() => {
              uninitializedPromise = null;
              doRequest();
            });
          }
          const cancel = () => {
            if (uninitializedPromise) {
              uninitializedPromise.cancel();
              uninitializedPromise = null;
            } else {
              this.sendRequest({
                id: id2,
                type: 101
                /* PromiseCancel */
              });
            }
            e(new CancellationError());
          };
          const cancellationTokenListener = cancellationToken.onCancellationRequested(cancel);
          disposable = combinedDisposable(toDisposable(cancel), cancellationTokenListener);
          this.activeRequests.add(disposable);
        });
        return result.finally(() => {
          this.activeRequests.delete(disposable);
        });
      }
      requestEvent(channelName, name, arg) {
        const id2 = this.lastRequestId++;
        const type = 102;
        const request = { id: id2, type, channelName, name, arg };
        let uninitializedPromise = null;
        const emitter = new Emitter2({
          onWillAddFirstListener: () => {
            uninitializedPromise = createCancelablePromise((_) => this.whenInitialized());
            uninitializedPromise.then(() => {
              uninitializedPromise = null;
              this.activeRequests.add(emitter);
              this.sendRequest(request);
            });
          },
          onDidRemoveLastListener: () => {
            if (uninitializedPromise) {
              uninitializedPromise.cancel();
              uninitializedPromise = null;
            } else {
              this.activeRequests.delete(emitter);
              this.sendRequest({
                id: id2,
                type: 103
                /* EventDispose */
              });
            }
          }
        });
        const handler = (res) => emitter.fire(res.data);
        this.handlers.set(id2, handler);
        return emitter.event;
      }
      sendRequest(request) {
        switch (request.type) {
          case 100:
          case 102: {
            const msgLength = this.send([request.type, request.id, request.channelName, request.name], request.arg);
            this.logger?.logOutgoing(msgLength, request.id, 0, `${requestTypeToStr(request.type)}: ${request.channelName}.${request.name}`, request.arg);
            return;
          }
          case 101:
          case 103: {
            const msgLength = this.send([request.type, request.id]);
            this.logger?.logOutgoing(msgLength, request.id, 0, requestTypeToStr(request.type));
            return;
          }
        }
      }
      send(header, body = void 0) {
        const writer = new BufferWriter();
        serialize(writer, header);
        serialize(writer, body);
        return this.sendBuffer(writer.buffer);
      }
      sendBuffer(message) {
        try {
          this.protocol.send(message);
          return message.byteLength;
        } catch (_err) {
          return 0;
        }
      }
      onBuffer(message) {
        const reader = new BufferReader(message);
        const header = deserialize(reader);
        const body = deserialize(reader);
        const type = header[0];
        switch (type) {
          case 200:
            this.logger?.logIncoming(message.byteLength, 0, 0, responseTypeToStr(type));
            return this.onResponse({ type: header[0] });
          case 201:
          case 202:
          case 204:
          case 203:
            this.logger?.logIncoming(message.byteLength, header[1], 0, responseTypeToStr(type), body);
            return this.onResponse({ type: header[0], id: header[1], data: body });
        }
      }
      onResponse(response) {
        if (response.type === 200) {
          this.state = 1;
          this._onDidInitialize.fire();
          return;
        }
        const handler = this.handlers.get(response.id);
        handler?.(response);
      }
      get onDidInitializePromise() {
        return Event.toPromise(this.onDidInitialize);
      }
      whenInitialized() {
        if (this.state === 1) {
          return Promise.resolve();
        } else {
          return this.onDidInitializePromise;
        }
      }
      dispose() {
        this.isDisposed = true;
        if (this.protocolListener) {
          this.protocolListener.dispose();
          this.protocolListener = null;
        }
        dispose(this.activeRequests.values());
        this.activeRequests.clear();
      }
    };
    __decorateClass([
      memoize
    ], ChannelClient.prototype, "onDidInitializePromise", 1);
    var IPCServer = class {
      channels = /* @__PURE__ */ new Map();
      _connections = /* @__PURE__ */ new Set();
      _onDidAddConnection = new Emitter2();
      onDidAddConnection = this._onDidAddConnection.event;
      _onDidRemoveConnection = new Emitter2();
      onDidRemoveConnection = this._onDidRemoveConnection.event;
      get connections() {
        const result = [];
        this._connections.forEach((ctx) => result.push(ctx));
        return result;
      }
      constructor(onDidClientConnect) {
        onDidClientConnect((connectionEvent) => {
          const { protocol, onDidClientDisconnect } = connectionEvent;
          const onFirstMessage = Event.once(protocol.onMessage);
          onFirstMessage((msg) => {
            const reader = new BufferReader(msg);
            const ctx = deserialize(reader);
            const channelServer = new ChannelServer(protocol, ctx);
            const channelClient = new ChannelClient(protocol);
            this.channels.forEach((channel, name) => channelServer.registerChannel(name, channel));
            const connection = { connectionEvent, channelServer, channelClient, ctx };
            this._connections.add(connection);
            this._onDidAddConnection.fire(connection);
            onDidClientDisconnect(() => {
              channelServer.dispose();
              channelClient.dispose();
              this._connections.delete(connection);
              this._onDidRemoveConnection.fire(connection);
            });
          });
        });
      }
      getChannel(channelName, routerOrClientFilter) {
        const that = this;
        return {
          call(command, arg, cancellationToken) {
            let connectionPromise;
            if (isFunction(routerOrClientFilter)) {
              const connection = getRandomElement(that.connections.filter(routerOrClientFilter));
              connectionPromise = connection ? (
                // if we found a client, let's call on it
                Promise.resolve(connection)
              ) : (
                // else, let's wait for a client to come along
                Event.toPromise(Event.filter(that.onDidAddConnection, routerOrClientFilter))
              );
            } else {
              connectionPromise = routerOrClientFilter.routeCall(that, command, arg);
            }
            const channelPromise = connectionPromise.then((connection) => connection.channelClient.getChannel(channelName));
            return getDelayedChannel(channelPromise).call(command, arg, cancellationToken);
          },
          listen(event, arg) {
            if (isFunction(routerOrClientFilter)) {
              return that.getMulticastEvent(channelName, routerOrClientFilter, event, arg);
            }
            const channelPromise = routerOrClientFilter.routeEvent(that, event, arg).then((connection) => connection.channelClient.getChannel(channelName));
            return getDelayedChannel(channelPromise).listen(event, arg);
          }
        };
      }
      getMulticastEvent(channelName, clientFilter, eventName, arg) {
        const that = this;
        let disposables = new DisposableStore();
        const emitter = new Emitter2({
          onWillAddFirstListener: () => {
            disposables = new DisposableStore();
            const eventMultiplexer = new EventMultiplexer();
            const map = /* @__PURE__ */ new Map();
            const onDidAddConnection = (connection) => {
              const channel = connection.channelClient.getChannel(channelName);
              const event = channel.listen(eventName, arg);
              const disposable = eventMultiplexer.add(event);
              map.set(connection, disposable);
            };
            const onDidRemoveConnection = (connection) => {
              const disposable = map.get(connection);
              if (!disposable) {
                return;
              }
              disposable.dispose();
              map.delete(connection);
            };
            that.connections.filter(clientFilter).forEach(onDidAddConnection);
            Event.filter(that.onDidAddConnection, clientFilter)(onDidAddConnection, void 0, disposables);
            that.onDidRemoveConnection(onDidRemoveConnection, void 0, disposables);
            eventMultiplexer.event(emitter.fire, emitter, disposables);
            disposables.add(eventMultiplexer);
          },
          onDidRemoveLastListener: () => {
            disposables.dispose();
          }
        });
        return emitter.event;
      }
      registerChannel(channelName, channel) {
        this.channels.set(channelName, channel);
        this._connections.forEach((connection) => {
          connection.channelServer.registerChannel(channelName, channel);
        });
      }
      dispose() {
        this.channels.clear();
        this._connections.clear();
        this._onDidAddConnection.dispose();
        this._onDidRemoveConnection.dispose();
      }
    };
    var IPCClient = class {
      channelClient;
      channelServer;
      constructor(protocol, ctx, ipcLogger = null) {
        const writer = new BufferWriter();
        serialize(writer, ctx);
        protocol.send(writer.buffer);
        this.channelClient = new ChannelClient(protocol, ipcLogger);
        this.channelServer = new ChannelServer(protocol, ctx, ipcLogger);
      }
      getChannel(channelName) {
        return this.channelClient.getChannel(channelName);
      }
      registerChannel(channelName, channel) {
        this.channelServer.registerChannel(channelName, channel);
      }
      dispose() {
        this.channelClient.dispose();
        this.channelServer.dispose();
      }
    };
    function getDelayedChannel(promise) {
      return {
        call(command, arg, cancellationToken) {
          return promise.then((c) => c.call(command, arg, cancellationToken));
        },
        listen(event, arg) {
          const relay = new Relay();
          promise.then((c) => relay.input = c.listen(event, arg));
          return relay.event;
        }
      };
    }
    function getNextTickChannel(channel) {
      let didTick = false;
      return {
        call(command, arg, cancellationToken) {
          if (didTick) {
            return channel.call(command, arg, cancellationToken);
          }
          return timeout(0).then(() => didTick = true).then(() => channel.call(command, arg, cancellationToken));
        },
        listen(event, arg) {
          if (didTick) {
            return channel.listen(event, arg);
          }
          const relay = new Relay();
          timeout(0).then(() => didTick = true).then(() => relay.input = channel.listen(event, arg));
          return relay.event;
        }
      };
    }
    var StaticRouter = class {
      constructor(fn) {
        this.fn = fn;
      }
      fn;
      routeCall(hub) {
        return this.route(hub);
      }
      routeEvent(hub) {
        return this.route(hub);
      }
      async route(hub) {
        for (const connection of hub.connections) {
          if (await Promise.resolve(this.fn(connection.ctx))) {
            return Promise.resolve(connection);
          }
        }
        await Event.toPromise(hub.onDidAddConnection);
        return await this.route(hub);
      }
    };
    function propertyIsEvent(name) {
      return name[0] === "o" && name[1] === "n" && isUpperAsciiLetter(name.charCodeAt(2));
    }
    function propertyIsDynamicEvent(name) {
      return /^onDynamic/.test(name) && isUpperAsciiLetter(name.charCodeAt(9));
    }
    var ProxyChannel3;
    ((ProxyChannel22) => {
      function fromService(service, options) {
        const handler = service;
        const disableMarshalling = options && options.disableMarshalling;
        const isProxyService = options && options.isProxyService;
        const mapEventNameToEvent = /* @__PURE__ */ new Map();
        for (const key in handler) {
          if (propertyIsEvent(key)) {
            mapEventNameToEvent.set(key, Event.buffer(handler[key], true));
          }
        }
        return new class {
          listen(_, event, arg) {
            const eventImpl = mapEventNameToEvent.get(event);
            if (eventImpl) {
              return eventImpl;
            }
            if (propertyIsDynamicEvent(event)) {
              const target = handler[event];
              if (typeof target === "function") {
                return target.call(handler, arg);
              }
            }
            if (isProxyService) {
              handler[event] = mapEventNameToEvent.set(event, Event.buffer(handler[event], true));
              return handler[event];
            }
            throw new ErrorNoTelemetry(`Event not found: ${event}`);
          }
          call(_, command, args) {
            const target = handler[command];
            if (typeof target === "function") {
              if (!disableMarshalling && Array.isArray(args)) {
                for (let i = 0; i < args.length; i++) {
                  args[i] = revive(args[i]);
                }
              }
              return target.apply(handler, args);
            }
            throw new ErrorNoTelemetry(`Method not found: ${command}`);
          }
        }();
      }
      ProxyChannel22.fromService = fromService;
      function toService(channel, options) {
        const disableMarshalling = options && options.disableMarshalling;
        return new Proxy(
          {},
          {
            get(_target, propKey) {
              if (typeof propKey === "string") {
                if (options?.properties?.has(propKey)) {
                  return options.properties.get(propKey);
                }
                if (propertyIsDynamicEvent(propKey)) {
                  return function(arg) {
                    return channel.listen(propKey, arg);
                  };
                }
                if (propertyIsEvent(propKey)) {
                  return channel.listen(propKey);
                }
                return async function(...args) {
                  let methodArgs;
                  if (options && !isUndefinedOrNull(options.context)) {
                    methodArgs = [options.context, ...args];
                  } else {
                    methodArgs = args;
                  }
                  const result = await channel.call(propKey, methodArgs);
                  if (!disableMarshalling) {
                    return revive(result);
                  }
                  return result;
                };
              }
              throw new ErrorNoTelemetry(`Property not found: ${String(propKey)}`);
            }
          }
        );
      }
      ProxyChannel22.toService = toService;
    })(ProxyChannel3 || (ProxyChannel3 = {}));
    var colorTables = [
      ["#2977B1", "#FC802D", "#34A13A", "#D3282F", "#9366BA"],
      ["#8B564C", "#E177C0", "#7F7F7F", "#BBBE3D", "#2EBECD"]
    ];
    function prettyWithoutArrays(data) {
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === "object" && typeof data.toString === "function") {
        const result = data.toString();
        if (result !== "[object Object]") {
          return result;
        }
      }
      return data;
    }
    function pretty(data) {
      if (Array.isArray(data)) {
        return data.map(prettyWithoutArrays);
      }
      return prettyWithoutArrays(data);
    }
    function logWithColors(direction, totalLength, msgLength, req, initiator, str, data) {
      data = pretty(data);
      const colorTable = colorTables[initiator];
      const color = colorTable[req % colorTable.length];
      let args = [`%c[${direction}]%c[${String(totalLength).padStart(7, " ")}]%c[len: ${String(msgLength).padStart(5, " ")}]%c${String(req).padStart(5, " ")} - ${str}`, "color: darkgreen", "color: grey", "color: grey", `color: ${color}`];
      if (/\($/.test(str)) {
        args = args.concat(data);
        args.push(")");
      } else {
        args.push(data);
      }
      console.log(...args);
    }
    var IPCLogger = class {
      constructor(_outgoingPrefix, _incomingPrefix) {
        this._outgoingPrefix = _outgoingPrefix;
        this._incomingPrefix = _incomingPrefix;
      }
      _outgoingPrefix;
      _incomingPrefix;
      _totalIncoming = 0;
      _totalOutgoing = 0;
      logOutgoing(msgLength, requestId, initiator, str, data) {
        this._totalOutgoing += msgLength;
        logWithColors(this._outgoingPrefix, this._totalOutgoing, msgLength, requestId, initiator, str, data);
      }
      logIncoming(msgLength, requestId, initiator, str, data) {
        this._totalIncoming += msgLength;
        logWithColors(this._incomingPrefix, this._totalIncoming, msgLength, requestId, initiator, str, data);
      }
    };
    var SocketDiagnosticsEventType = /* @__PURE__ */ ((SocketDiagnosticsEventType2) => {
      SocketDiagnosticsEventType2["Created"] = "created";
      SocketDiagnosticsEventType2["Read"] = "read";
      SocketDiagnosticsEventType2["Write"] = "write";
      SocketDiagnosticsEventType2["Open"] = "open";
      SocketDiagnosticsEventType2["Error"] = "error";
      SocketDiagnosticsEventType2["Close"] = "close";
      SocketDiagnosticsEventType2["BrowserWebSocketBlobReceived"] = "browserWebSocketBlobReceived";
      SocketDiagnosticsEventType2["NodeEndReceived"] = "nodeEndReceived";
      SocketDiagnosticsEventType2["NodeEndSent"] = "nodeEndSent";
      SocketDiagnosticsEventType2["NodeDrainBegin"] = "nodeDrainBegin";
      SocketDiagnosticsEventType2["NodeDrainEnd"] = "nodeDrainEnd";
      SocketDiagnosticsEventType2["zlibInflateError"] = "zlibInflateError";
      SocketDiagnosticsEventType2["zlibInflateData"] = "zlibInflateData";
      SocketDiagnosticsEventType2["zlibInflateInitialWrite"] = "zlibInflateInitialWrite";
      SocketDiagnosticsEventType2["zlibInflateInitialFlushFired"] = "zlibInflateInitialFlushFired";
      SocketDiagnosticsEventType2["zlibInflateWrite"] = "zlibInflateWrite";
      SocketDiagnosticsEventType2["zlibInflateFlushFired"] = "zlibInflateFlushFired";
      SocketDiagnosticsEventType2["zlibDeflateError"] = "zlibDeflateError";
      SocketDiagnosticsEventType2["zlibDeflateData"] = "zlibDeflateData";
      SocketDiagnosticsEventType2["zlibDeflateWrite"] = "zlibDeflateWrite";
      SocketDiagnosticsEventType2["zlibDeflateFlushFired"] = "zlibDeflateFlushFired";
      SocketDiagnosticsEventType2["WebSocketNodeSocketWrite"] = "webSocketNodeSocketWrite";
      SocketDiagnosticsEventType2["WebSocketNodeSocketPeekedHeader"] = "webSocketNodeSocketPeekedHeader";
      SocketDiagnosticsEventType2["WebSocketNodeSocketReadHeader"] = "webSocketNodeSocketReadHeader";
      SocketDiagnosticsEventType2["WebSocketNodeSocketReadData"] = "webSocketNodeSocketReadData";
      SocketDiagnosticsEventType2["WebSocketNodeSocketUnmaskedData"] = "webSocketNodeSocketUnmaskedData";
      SocketDiagnosticsEventType2["WebSocketNodeSocketDrainBegin"] = "webSocketNodeSocketDrainBegin";
      SocketDiagnosticsEventType2["WebSocketNodeSocketDrainEnd"] = "webSocketNodeSocketDrainEnd";
      SocketDiagnosticsEventType2["ProtocolHeaderRead"] = "protocolHeaderRead";
      SocketDiagnosticsEventType2["ProtocolMessageRead"] = "protocolMessageRead";
      SocketDiagnosticsEventType2["ProtocolHeaderWrite"] = "protocolHeaderWrite";
      SocketDiagnosticsEventType2["ProtocolMessageWrite"] = "protocolMessageWrite";
      SocketDiagnosticsEventType2["ProtocolWrite"] = "protocolWrite";
      return SocketDiagnosticsEventType2;
    })(SocketDiagnosticsEventType || {});
    var SocketDiagnostics;
    ((SocketDiagnostics2) => {
      SocketDiagnostics2.enableDiagnostics = false;
      SocketDiagnostics2.records = [];
      const socketIds = /* @__PURE__ */ new WeakMap();
      let lastUsedSocketId = 0;
      function getSocketId(nativeObject, _label) {
        if (!socketIds.has(nativeObject)) {
          const id2 = String(++lastUsedSocketId);
          socketIds.set(nativeObject, id2);
        }
        return socketIds.get(nativeObject);
      }
      function traceSocketEvent(nativeObject, socketDebugLabel, type, data) {
        if (!SocketDiagnostics2.enableDiagnostics) {
          return;
        }
        const id2 = getSocketId(nativeObject, socketDebugLabel);
        if (data instanceof VSBuffer || data instanceof Uint8Array || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
          const copiedData = VSBuffer.alloc(data.byteLength);
          copiedData.set(data);
          SocketDiagnostics2.records.push({ timestamp: Date.now(), id: id2, label: socketDebugLabel, type, buff: copiedData });
        } else {
          SocketDiagnostics2.records.push({ timestamp: Date.now(), id: id2, label: socketDebugLabel, type, data });
        }
      }
      SocketDiagnostics2.traceSocketEvent = traceSocketEvent;
    })(SocketDiagnostics || (SocketDiagnostics = {}));
    var SocketCloseEventType = /* @__PURE__ */ ((SocketCloseEventType2) => {
      SocketCloseEventType2[SocketCloseEventType2["NodeSocketCloseEvent"] = 0] = "NodeSocketCloseEvent";
      SocketCloseEventType2[SocketCloseEventType2["WebSocketCloseEvent"] = 1] = "WebSocketCloseEvent";
      return SocketCloseEventType2;
    })(SocketCloseEventType || {});
    var emptyBuffer = null;
    function getEmptyBuffer() {
      if (!emptyBuffer) {
        emptyBuffer = VSBuffer.alloc(0);
      }
      return emptyBuffer;
    }
    var ChunkStream = class {
      _chunks;
      _totalLength;
      get byteLength() {
        return this._totalLength;
      }
      constructor() {
        this._chunks = [];
        this._totalLength = 0;
      }
      acceptChunk(buff) {
        this._chunks.push(buff);
        this._totalLength += buff.byteLength;
      }
      read(byteCount) {
        return this._read(byteCount, true);
      }
      peek(byteCount) {
        return this._read(byteCount, false);
      }
      _read(byteCount, advance) {
        if (byteCount === 0) {
          return getEmptyBuffer();
        }
        if (byteCount > this._totalLength) {
          throw new Error(`Cannot read so many bytes!`);
        }
        if (this._chunks[0].byteLength === byteCount) {
          const result2 = this._chunks[0];
          if (advance) {
            this._chunks.shift();
            this._totalLength -= byteCount;
          }
          return result2;
        }
        if (this._chunks[0].byteLength > byteCount) {
          const result2 = this._chunks[0].slice(0, byteCount);
          if (advance) {
            this._chunks[0] = this._chunks[0].slice(byteCount);
            this._totalLength -= byteCount;
          }
          return result2;
        }
        const result = VSBuffer.alloc(byteCount);
        let resultOffset = 0;
        let chunkIndex = 0;
        while (byteCount > 0) {
          const chunk = this._chunks[chunkIndex];
          if (chunk.byteLength > byteCount) {
            const chunkPart = chunk.slice(0, byteCount);
            result.set(chunkPart, resultOffset);
            resultOffset += byteCount;
            if (advance) {
              this._chunks[chunkIndex] = chunk.slice(byteCount);
              this._totalLength -= byteCount;
            }
            byteCount -= byteCount;
          } else {
            result.set(chunk, resultOffset);
            resultOffset += chunk.byteLength;
            if (advance) {
              this._chunks.shift();
              this._totalLength -= chunk.byteLength;
            } else {
              chunkIndex++;
            }
            byteCount -= chunk.byteLength;
          }
        }
        return result;
      }
    };
    function protocolMessageTypeToString(messageType) {
      switch (messageType) {
        case 0:
          return "None";
        case 1:
          return "Regular";
        case 2:
          return "Control";
        case 3:
          return "Ack";
        case 5:
          return "Disconnect";
        case 6:
          return "ReplayRequest";
        case 7:
          return "PauseWriting";
        case 8:
          return "ResumeWriting";
        case 9:
          return "KeepAlive";
      }
    }
    var ProtocolConstants = /* @__PURE__ */ ((ProtocolConstants2) => {
      ProtocolConstants2[ProtocolConstants2["HeaderLength"] = 13] = "HeaderLength";
      ProtocolConstants2[ProtocolConstants2["AcknowledgeTime"] = 2e3] = "AcknowledgeTime";
      ProtocolConstants2[ProtocolConstants2["TimeoutTime"] = 2e4] = "TimeoutTime";
      ProtocolConstants2[ProtocolConstants2["ReconnectionGraceTime"] = 108e5] = "ReconnectionGraceTime";
      ProtocolConstants2[ProtocolConstants2["ReconnectionShortGraceTime"] = 3e5] = "ReconnectionShortGraceTime";
      ProtocolConstants2[ProtocolConstants2["KeepAliveSendTime"] = 5e3] = "KeepAliveSendTime";
      return ProtocolConstants2;
    })(ProtocolConstants || {});
    var ProtocolMessage = class {
      constructor(type, id2, ack, data) {
        this.type = type;
        this.id = id2;
        this.ack = ack;
        this.data = data;
        this.writtenTime = 0;
      }
      type;
      id;
      ack;
      data;
      writtenTime;
      get size() {
        return this.data.byteLength;
      }
    };
    var ProtocolReader = class extends Disposable {
      _socket;
      _isDisposed;
      _incomingData;
      lastReadTime;
      _onMessage = this._register(new Emitter2());
      onMessage = this._onMessage.event;
      _state = {
        readHead: true,
        readLen: 13,
        messageType: 0,
        id: 0,
        ack: 0
      };
      constructor(socket) {
        super();
        this._socket = socket;
        this._isDisposed = false;
        this._incomingData = new ChunkStream();
        this._register(this._socket.onData((data) => this.acceptChunk(data)));
        this.lastReadTime = Date.now();
      }
      acceptChunk(data) {
        if (!data || data.byteLength === 0) {
          return;
        }
        this.lastReadTime = Date.now();
        this._incomingData.acceptChunk(data);
        while (this._incomingData.byteLength >= this._state.readLen) {
          const buff = this._incomingData.read(this._state.readLen);
          if (this._state.readHead) {
            this._state.readHead = false;
            this._state.readLen = buff.readUInt32BE(9);
            this._state.messageType = buff.readUInt8(0);
            this._state.id = buff.readUInt32BE(1);
            this._state.ack = buff.readUInt32BE(5);
            this._socket.traceSocketEvent("protocolHeaderRead", { messageType: protocolMessageTypeToString(this._state.messageType), id: this._state.id, ack: this._state.ack, messageSize: this._state.readLen });
          } else {
            const messageType = this._state.messageType;
            const id2 = this._state.id;
            const ack = this._state.ack;
            this._state.readHead = true;
            this._state.readLen = 13;
            this._state.messageType = 0;
            this._state.id = 0;
            this._state.ack = 0;
            this._socket.traceSocketEvent("protocolMessageRead", buff);
            this._onMessage.fire(new ProtocolMessage(messageType, id2, ack, buff));
            if (this._isDisposed) {
              break;
            }
          }
        }
      }
      readEntireBuffer() {
        return this._incomingData.read(this._incomingData.byteLength);
      }
      dispose() {
        this._isDisposed = true;
        super.dispose();
      }
    };
    var ProtocolWriter = class {
      _isDisposed;
      _isPaused;
      _socket;
      _data;
      _totalLength;
      lastWriteTime;
      constructor(socket) {
        this._isDisposed = false;
        this._isPaused = false;
        this._socket = socket;
        this._data = [];
        this._totalLength = 0;
        this.lastWriteTime = 0;
      }
      dispose() {
        try {
          this.flush();
        } catch (_err) {
        }
        this._isDisposed = true;
      }
      drain() {
        this.flush();
        return this._socket.drain();
      }
      flush() {
        this._writeNow();
      }
      pause() {
        this._isPaused = true;
      }
      resume() {
        this._isPaused = false;
        this._scheduleWriting();
      }
      write(msg) {
        if (this._isDisposed) {
          return;
        }
        msg.writtenTime = Date.now();
        this.lastWriteTime = Date.now();
        const header = VSBuffer.alloc(
          13
          /* HeaderLength */
        );
        header.writeUInt8(msg.type, 0);
        header.writeUInt32BE(msg.id, 1);
        header.writeUInt32BE(msg.ack, 5);
        header.writeUInt32BE(msg.data.byteLength, 9);
        this._socket.traceSocketEvent("protocolHeaderWrite", { messageType: protocolMessageTypeToString(msg.type), id: msg.id, ack: msg.ack, messageSize: msg.data.byteLength });
        this._socket.traceSocketEvent("protocolMessageWrite", msg.data);
        this._writeSoon(header, msg.data);
      }
      _bufferAdd(head, body) {
        const wasEmpty = this._totalLength === 0;
        this._data.push(head, body);
        this._totalLength += head.byteLength + body.byteLength;
        return wasEmpty;
      }
      _bufferTake() {
        const ret = VSBuffer.concat(this._data, this._totalLength);
        this._data.length = 0;
        this._totalLength = 0;
        return ret;
      }
      _writeSoon(header, data) {
        if (this._bufferAdd(header, data)) {
          this._scheduleWriting();
        }
      }
      _writeNowTimeout = null;
      _scheduleWriting() {
        if (this._writeNowTimeout) {
          return;
        }
        this._writeNowTimeout = setTimeout(() => {
          this._writeNowTimeout = null;
          this._writeNow();
        });
      }
      _writeNow() {
        if (this._totalLength === 0) {
          return;
        }
        if (this._isPaused) {
          return;
        }
        const data = this._bufferTake();
        this._socket.traceSocketEvent("protocolWrite", { byteLength: data.byteLength });
        this._socket.write(data);
      }
    };
    var Protocol = class extends Disposable {
      _socket;
      _socketWriter;
      _socketReader;
      _onMessage = new Emitter2();
      onMessage = this._onMessage.event;
      _onDidDispose = new Emitter2();
      onDidDispose = this._onDidDispose.event;
      constructor(socket) {
        super();
        this._socket = socket;
        this._socketWriter = this._register(new ProtocolWriter(this._socket));
        this._socketReader = this._register(new ProtocolReader(this._socket));
        this._register(
          this._socketReader.onMessage((msg) => {
            if (msg.type === 1) {
              this._onMessage.fire(msg.data);
            }
          })
        );
        this._register(this._socket.onClose(() => this._onDidDispose.fire()));
      }
      drain() {
        return this._socketWriter.drain();
      }
      getSocket() {
        return this._socket;
      }
      sendDisconnect() {
      }
      send(buffer) {
        this._socketWriter.write(new ProtocolMessage(1, 0, 0, buffer));
      }
    };
    var NetIPCClient = class _NetIPCClient extends IPCClient {
      constructor(protocol, id2, ipcLogger = null) {
        super(protocol, id2, ipcLogger);
        this.protocol = protocol;
      }
      protocol;
      static fromSocket(socket, id2) {
        return new _NetIPCClient(new Protocol(socket), id2);
      }
      get onDidDispose() {
        return this.protocol.onDidDispose;
      }
      dispose() {
        super.dispose();
        const socket = this.protocol.getSocket();
        this.protocol.sendDisconnect();
        this.protocol.dispose();
        socket.end();
      }
    };
    var BufferedEmitter = class {
      _emitter;
      event;
      _hasListeners = false;
      _isDeliveringMessages = false;
      _bufferedMessages = [];
      constructor() {
        this._emitter = new Emitter2({
          onWillAddFirstListener: () => {
            this._hasListeners = true;
            queueMicrotask(() => this._deliverMessages());
          },
          onDidRemoveLastListener: () => {
            this._hasListeners = false;
          }
        });
        this.event = this._emitter.event;
      }
      _deliverMessages() {
        if (this._isDeliveringMessages) {
          return;
        }
        this._isDeliveringMessages = true;
        while (this._hasListeners && this._bufferedMessages.length > 0) {
          this._emitter.fire(this._bufferedMessages.shift());
        }
        this._isDeliveringMessages = false;
      }
      fire(event) {
        if (this._hasListeners) {
          if (this._bufferedMessages.length > 0) {
            this._bufferedMessages.push(event);
          } else {
            this._emitter.fire(event);
          }
        } else {
          this._bufferedMessages.push(event);
        }
      }
      flushBuffer() {
        this._bufferedMessages = [];
      }
    };
    var QueueElement = class {
      data;
      next;
      constructor(data) {
        this.data = data;
        this.next = null;
      }
    };
    var Queue = class {
      _first;
      _last;
      constructor() {
        this._first = null;
        this._last = null;
      }
      length() {
        let result = 0;
        let current = this._first;
        while (current) {
          current = current.next;
          result++;
        }
        return result;
      }
      peek() {
        if (!this._first) {
          return null;
        }
        return this._first.data;
      }
      toArray() {
        const result = [];
        let resultLen = 0;
        let it = this._first;
        while (it) {
          result[resultLen++] = it.data;
          it = it.next;
        }
        return result;
      }
      pop() {
        if (!this._first) {
          return;
        }
        if (this._first === this._last) {
          this._first = null;
          this._last = null;
          return;
        }
        this._first = this._first.next;
      }
      push(item) {
        const element = new QueueElement(item);
        if (!this._first) {
          this._first = element;
          this._last = element;
          return;
        }
        this._last.next = element;
        this._last = element;
      }
    };
    var LoadEstimator = class _LoadEstimator {
      static _HISTORY_LENGTH = 10;
      static _INSTANCE = null;
      static getInstance() {
        if (!_LoadEstimator._INSTANCE) {
          _LoadEstimator._INSTANCE = new _LoadEstimator();
        }
        return _LoadEstimator._INSTANCE;
      }
      lastRuns;
      constructor() {
        this.lastRuns = [];
        const now = Date.now();
        for (let i = 0; i < _LoadEstimator._HISTORY_LENGTH; i++) {
          this.lastRuns[i] = now - 1e3 * i;
        }
        setInterval(() => {
          for (let i = _LoadEstimator._HISTORY_LENGTH; i >= 1; i--) {
            this.lastRuns[i] = this.lastRuns[i - 1];
          }
          this.lastRuns[0] = Date.now();
        }, 1e3);
      }
      /**
       * returns an estimative number, from 0 (low load) to 1 (high load)
       */
      load() {
        const now = Date.now();
        const historyLimit = (1 + _LoadEstimator._HISTORY_LENGTH) * 1e3;
        let score = 0;
        for (let i = 0; i < _LoadEstimator._HISTORY_LENGTH; i++) {
          if (now - this.lastRuns[i] <= historyLimit) {
            score++;
          }
        }
        return 1 - score / _LoadEstimator._HISTORY_LENGTH;
      }
      hasHighLoad() {
        return this.load() >= 0.5;
      }
    };
    var PersistentProtocol = class {
      _isReconnecting;
      _outgoingUnackMsg;
      _outgoingMsgId;
      _outgoingAckId;
      _outgoingAckTimeout;
      _incomingMsgId;
      _incomingAckId;
      _incomingMsgLastTime;
      _incomingAckTimeout;
      _keepAliveInterval;
      _lastReplayRequestTime;
      _lastSocketTimeoutTime;
      _socket;
      _socketWriter;
      _socketReader;
      _socketDisposables;
      _loadEstimator;
      _shouldSendKeepAlive;
      _onControlMessage = new BufferedEmitter();
      onControlMessage = this._onControlMessage.event;
      _onMessage = new BufferedEmitter();
      onMessage = this._onMessage.event;
      _onDidDispose = new BufferedEmitter();
      onDidDispose = this._onDidDispose.event;
      _onSocketClose = new BufferedEmitter();
      onSocketClose = this._onSocketClose.event;
      _onSocketTimeout = new BufferedEmitter();
      onSocketTimeout = this._onSocketTimeout.event;
      get unacknowledgedCount() {
        return this._outgoingMsgId - this._outgoingAckId;
      }
      constructor(opts) {
        this._loadEstimator = opts.loadEstimator ?? LoadEstimator.getInstance();
        this._shouldSendKeepAlive = opts.sendKeepAlive ?? true;
        this._isReconnecting = false;
        this._outgoingUnackMsg = new Queue();
        this._outgoingMsgId = 0;
        this._outgoingAckId = 0;
        this._outgoingAckTimeout = null;
        this._incomingMsgId = 0;
        this._incomingAckId = 0;
        this._incomingMsgLastTime = 0;
        this._incomingAckTimeout = null;
        this._lastReplayRequestTime = 0;
        this._lastSocketTimeoutTime = Date.now();
        this._socketDisposables = new DisposableStore();
        this._socket = opts.socket;
        this._socketWriter = this._socketDisposables.add(new ProtocolWriter(this._socket));
        this._socketReader = this._socketDisposables.add(new ProtocolReader(this._socket));
        this._socketDisposables.add(this._socketReader.onMessage((msg) => this._receiveMessage(msg)));
        this._socketDisposables.add(this._socket.onClose((e) => this._onSocketClose.fire(e)));
        if (opts.initialChunk) {
          this._socketReader.acceptChunk(opts.initialChunk);
        }
        if (this._shouldSendKeepAlive) {
          this._keepAliveInterval = setInterval(
            () => {
              this._sendKeepAlive();
            },
            5e3
            /* KeepAliveSendTime */
          );
        } else {
          this._keepAliveInterval = null;
        }
      }
      dispose() {
        if (this._outgoingAckTimeout) {
          clearTimeout(this._outgoingAckTimeout);
          this._outgoingAckTimeout = null;
        }
        if (this._incomingAckTimeout) {
          clearTimeout(this._incomingAckTimeout);
          this._incomingAckTimeout = null;
        }
        if (this._keepAliveInterval) {
          clearInterval(this._keepAliveInterval);
          this._keepAliveInterval = null;
        }
        this._socketDisposables.dispose();
      }
      drain() {
        return this._socketWriter.drain();
      }
      sendDisconnect() {
        const msg = new ProtocolMessage(5, 0, 0, getEmptyBuffer());
        this._socketWriter.write(msg);
        this._socketWriter.flush();
      }
      sendPause() {
        const msg = new ProtocolMessage(7, 0, 0, getEmptyBuffer());
        this._socketWriter.write(msg);
      }
      sendResume() {
        const msg = new ProtocolMessage(8, 0, 0, getEmptyBuffer());
        this._socketWriter.write(msg);
      }
      pauseSocketWriting() {
        this._socketWriter.pause();
      }
      getSocket() {
        return this._socket;
      }
      getMillisSinceLastIncomingData() {
        return Date.now() - this._socketReader.lastReadTime;
      }
      beginAcceptReconnection(socket, initialDataChunk) {
        this._isReconnecting = true;
        this._socketDisposables.dispose();
        this._socketDisposables = new DisposableStore();
        this._onControlMessage.flushBuffer();
        this._onSocketClose.flushBuffer();
        this._onSocketTimeout.flushBuffer();
        this._socket.dispose();
        this._lastReplayRequestTime = 0;
        this._lastSocketTimeoutTime = Date.now();
        this._socket = socket;
        this._socketWriter = this._socketDisposables.add(new ProtocolWriter(this._socket));
        this._socketReader = this._socketDisposables.add(new ProtocolReader(this._socket));
        this._socketDisposables.add(this._socketReader.onMessage((msg) => this._receiveMessage(msg)));
        this._socketDisposables.add(this._socket.onClose((e) => this._onSocketClose.fire(e)));
        this._socketReader.acceptChunk(initialDataChunk);
      }
      endAcceptReconnection() {
        this._isReconnecting = false;
        this._incomingAckId = this._incomingMsgId;
        const msg = new ProtocolMessage(3, 0, this._incomingAckId, getEmptyBuffer());
        this._socketWriter.write(msg);
        const toSend = this._outgoingUnackMsg.toArray();
        for (let i = 0, len = toSend.length; i < len; i++) {
          this._socketWriter.write(toSend[i]);
        }
        this._recvAckCheck();
      }
      acceptDisconnect() {
        this._onDidDispose.fire();
      }
      _receiveMessage(msg) {
        if (msg.ack > this._outgoingAckId) {
          this._outgoingAckId = msg.ack;
          do {
            const first = this._outgoingUnackMsg.peek();
            if (first && first.id <= msg.ack) {
              this._outgoingUnackMsg.pop();
            } else {
              break;
            }
          } while (true);
        }
        switch (msg.type) {
          case 0: {
            break;
          }
          case 1: {
            if (msg.id > this._incomingMsgId) {
              if (msg.id !== this._incomingMsgId + 1) {
                const now = Date.now();
                if (now - this._lastReplayRequestTime > 1e4) {
                  this._lastReplayRequestTime = now;
                  this._socketWriter.write(new ProtocolMessage(6, 0, 0, getEmptyBuffer()));
                }
              } else {
                this._incomingMsgId = msg.id;
                this._incomingMsgLastTime = Date.now();
                this._sendAckCheck();
                this._onMessage.fire(msg.data);
              }
            }
            break;
          }
          case 2: {
            this._onControlMessage.fire(msg.data);
            break;
          }
          case 3: {
            break;
          }
          case 5: {
            this._onDidDispose.fire();
            break;
          }
          case 6: {
            const toSend = this._outgoingUnackMsg.toArray();
            for (let i = 0, len = toSend.length; i < len; i++) {
              this._socketWriter.write(toSend[i]);
            }
            this._recvAckCheck();
            break;
          }
          case 7: {
            this._socketWriter.pause();
            break;
          }
          case 8: {
            this._socketWriter.resume();
            break;
          }
          case 9: {
            break;
          }
        }
      }
      readEntireBuffer() {
        return this._socketReader.readEntireBuffer();
      }
      flush() {
        this._socketWriter.flush();
      }
      send(buffer) {
        const myId = ++this._outgoingMsgId;
        this._incomingAckId = this._incomingMsgId;
        const msg = new ProtocolMessage(1, myId, this._incomingAckId, buffer);
        this._outgoingUnackMsg.push(msg);
        if (!this._isReconnecting) {
          this._socketWriter.write(msg);
          this._recvAckCheck();
        }
      }
      /**
       * Send a message which will not be part of the regular acknowledge flow.
       * Use this for early control messages which are repeated in case of reconnection.
       */
      sendControl(buffer) {
        const msg = new ProtocolMessage(2, 0, 0, buffer);
        this._socketWriter.write(msg);
      }
      _sendAckCheck() {
        if (this._incomingMsgId <= this._incomingAckId) {
          return;
        }
        if (this._incomingAckTimeout) {
          return;
        }
        const timeSinceLastIncomingMsg = Date.now() - this._incomingMsgLastTime;
        if (timeSinceLastIncomingMsg >= 2e3) {
          this._sendAck();
          return;
        }
        this._incomingAckTimeout = setTimeout(
          () => {
            this._incomingAckTimeout = null;
            this._sendAckCheck();
          },
          2e3 - timeSinceLastIncomingMsg + 5
        );
      }
      _recvAckCheck() {
        if (this._outgoingMsgId <= this._outgoingAckId) {
          return;
        }
        if (this._outgoingAckTimeout) {
          return;
        }
        if (this._isReconnecting) {
          return;
        }
        const oldestUnacknowledgedMsg = this._outgoingUnackMsg.peek();
        const timeSinceOldestUnacknowledgedMsg = Date.now() - oldestUnacknowledgedMsg.writtenTime;
        const timeSinceLastReceivedSomeData = Date.now() - this._socketReader.lastReadTime;
        const timeSinceLastTimeout = Date.now() - this._lastSocketTimeoutTime;
        if (timeSinceOldestUnacknowledgedMsg >= 2e4 && timeSinceLastReceivedSomeData >= 2e4 && timeSinceLastTimeout >= 2e4) {
          if (!this._loadEstimator.hasHighLoad()) {
            this._lastSocketTimeoutTime = Date.now();
            this._onSocketTimeout.fire({
              unacknowledgedMsgCount: this._outgoingUnackMsg.length(),
              timeSinceOldestUnacknowledgedMsg,
              timeSinceLastReceivedSomeData
            });
            return;
          }
        }
        const minimumTimeUntilTimeout = Math.max(2e4 - timeSinceOldestUnacknowledgedMsg, 2e4 - timeSinceLastReceivedSomeData, 2e4 - timeSinceLastTimeout, 500);
        this._outgoingAckTimeout = setTimeout(() => {
          this._outgoingAckTimeout = null;
          this._recvAckCheck();
        }, minimumTimeUntilTimeout);
      }
      _sendAck() {
        if (this._incomingMsgId <= this._incomingAckId) {
          return;
        }
        this._incomingAckId = this._incomingMsgId;
        const msg = new ProtocolMessage(3, 0, this._incomingAckId, getEmptyBuffer());
        this._socketWriter.write(msg);
      }
      _sendKeepAlive() {
        this._incomingAckId = this._incomingMsgId;
        const msg = new ProtocolMessage(9, 0, this._incomingAckId, getEmptyBuffer());
        this._socketWriter.write(msg);
      }
    };
    var import_crypto = require("crypto");
    var import_net = require("net");
    var import_os = require("os");
    var import_zlib = require("zlib");
    var NodeSocket = class {
      debugLabel;
      socket;
      _errorListener;
      _closeListener;
      _endListener;
      _canWrite = true;
      traceSocketEvent(type, data) {
        SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
      }
      constructor(socket, debugLabel = "") {
        this.debugLabel = debugLabel;
        this.socket = socket;
        this.traceSocketEvent("created", { type: "NodeSocket" });
        this._errorListener = (err) => {
          this.traceSocketEvent("error", { code: err?.code, message: err?.message });
          if (err) {
            if (err.code === "EPIPE") {
              return;
            }
            onUnexpectedError(err);
          }
        };
        this.socket.on("error", this._errorListener);
        this._closeListener = (hadError) => {
          this.traceSocketEvent("close", { hadError });
          this._canWrite = false;
        };
        this.socket.on("close", this._closeListener);
        this._endListener = () => {
          this.traceSocketEvent(
            "nodeEndReceived"
            /* NodeEndReceived */
          );
          this._canWrite = false;
        };
        this.socket.on("end", this._endListener);
      }
      dispose() {
        this.socket.off("error", this._errorListener);
        this.socket.off("close", this._closeListener);
        this.socket.off("end", this._endListener);
        this.socket.destroy();
      }
      onData(_listener) {
        const listener = (buff) => {
          this.traceSocketEvent("read", buff);
          _listener(VSBuffer.wrap(buff));
        };
        this.socket.on("data", listener);
        return {
          dispose: () => this.socket.off("data", listener)
        };
      }
      onClose(listener) {
        const adapter = (hadError) => {
          listener({
            type: 0,
            hadError,
            error: void 0
          });
        };
        this.socket.on("close", adapter);
        return {
          dispose: () => this.socket.off("close", adapter)
        };
      }
      onEnd(listener) {
        const adapter = () => {
          listener();
        };
        this.socket.on("end", adapter);
        return {
          dispose: () => this.socket.off("end", adapter)
        };
      }
      write(buffer) {
        if (this.socket.destroyed || !this._canWrite) {
          return;
        }
        try {
          this.traceSocketEvent("write", buffer);
          this.socket.write(buffer.buffer, (err) => {
            if (err) {
              if (err.code === "EPIPE") {
                return;
              }
              onUnexpectedError(err);
            }
          });
        } catch (err) {
          if (err.code === "EPIPE") {
            return;
          }
          onUnexpectedError(err);
        }
      }
      end() {
        this.traceSocketEvent(
          "nodeEndSent"
          /* NodeEndSent */
        );
        this.socket.end();
      }
      drain() {
        this.traceSocketEvent(
          "nodeDrainBegin"
          /* NodeDrainBegin */
        );
        return new Promise((resolve2, _reject) => {
          if (this.socket.bufferSize === 0) {
            this.traceSocketEvent(
              "nodeDrainEnd"
              /* NodeDrainEnd */
            );
            resolve2();
            return;
          }
          const finished = () => {
            this.socket.off("close", finished);
            this.socket.off("end", finished);
            this.socket.off("error", finished);
            this.socket.off("timeout", finished);
            this.socket.off("drain", finished);
            this.traceSocketEvent(
              "nodeDrainEnd"
              /* NodeDrainEnd */
            );
            resolve2();
          };
          this.socket.on("close", finished);
          this.socket.on("end", finished);
          this.socket.on("error", finished);
          this.socket.on("timeout", finished);
          this.socket.on("drain", finished);
        });
      }
    };
    var WebSocketNodeSocket = class extends Disposable {
      socket;
      _flowManager;
      _incomingData;
      _onData = this._register(new Emitter2());
      _onClose = this._register(new Emitter2());
      _isEnded = false;
      _state = {
        state: 1,
        readLen: 2,
        fin: 0,
        compressed: false,
        firstFrameOfMessage: true,
        mask: 0
      };
      get permessageDeflate() {
        return this._flowManager.permessageDeflate;
      }
      get recordedInflateBytes() {
        return this._flowManager.recordedInflateBytes;
      }
      traceSocketEvent(type, data) {
        this.socket.traceSocketEvent(type, data);
      }
      /**
       * Create a socket which can communicate using WebSocket frames.
       *
       * **NOTE**: When using the permessage-deflate WebSocket extension, if parts of inflating was done
       *  in a different zlib instance, we need to pass all those bytes into zlib, otherwise the inflate
       *  might hit an inflated portion referencing a distance too far back.
       *
       * @param socket The underlying socket
       * @param permessageDeflate Use the permessage-deflate WebSocket extension
       * @param inflateBytes "Seed" zlib inflate with these bytes.
       * @param recordInflateBytes Record all bytes sent to inflate
       */
      constructor(socket, permessageDeflate, inflateBytes, recordInflateBytes) {
        super();
        this.socket = socket;
        this.traceSocketEvent("created", { type: "WebSocketNodeSocket", permessageDeflate, inflateBytesLength: inflateBytes?.byteLength || 0, recordInflateBytes });
        this._flowManager = this._register(new WebSocketFlowManager(this, permessageDeflate, inflateBytes, recordInflateBytes, this._onData, (data, compressed) => this._write(data, compressed)));
        this._register(
          this._flowManager.onError((err) => {
            console.error(err);
            onUnexpectedError(err);
            this._onClose.fire({
              type: 0,
              hadError: true,
              error: err
            });
          })
        );
        this._incomingData = new ChunkStream();
        this._register(this.socket.onData((data) => this._acceptChunk(data)));
        this._register(
          this.socket.onClose(async (e) => {
            if (this._flowManager.isProcessingReadQueue()) {
              await Event.toPromise(this._flowManager.onDidFinishProcessingReadQueue);
            }
            this._onClose.fire(e);
          })
        );
      }
      dispose() {
        if (this._flowManager.isProcessingWriteQueue()) {
          this._register(
            this._flowManager.onDidFinishProcessingWriteQueue(() => {
              this.dispose();
            })
          );
        } else {
          this.socket.dispose();
          super.dispose();
        }
      }
      onData(listener) {
        return this._onData.event(listener);
      }
      onClose(listener) {
        return this._onClose.event(listener);
      }
      onEnd(listener) {
        return this.socket.onEnd(listener);
      }
      write(buffer) {
        let start = 0;
        while (start < buffer.byteLength) {
          this._flowManager.writeMessage(buffer.slice(start, Math.min(start + 262144, buffer.byteLength)));
          start += 262144;
        }
      }
      _write(buffer, compressed) {
        if (this._isEnded) {
          return;
        }
        this.traceSocketEvent("webSocketNodeSocketWrite", buffer);
        let headerLen = 2;
        if (buffer.byteLength < 126) {
          headerLen += 0;
        } else if (buffer.byteLength < 2 ** 16) {
          headerLen += 2;
        } else {
          headerLen += 8;
        }
        const header = VSBuffer.alloc(headerLen);
        if (compressed) {
          header.writeUInt8(194, 0);
        } else {
          header.writeUInt8(130, 0);
        }
        if (buffer.byteLength < 126) {
          header.writeUInt8(buffer.byteLength, 1);
        } else if (buffer.byteLength < 2 ** 16) {
          header.writeUInt8(126, 1);
          let offset = 1;
          header.writeUInt8(buffer.byteLength >>> 8 & 255, ++offset);
          header.writeUInt8(buffer.byteLength >>> 0 & 255, ++offset);
        } else {
          header.writeUInt8(127, 1);
          let offset = 1;
          header.writeUInt8(0, ++offset);
          header.writeUInt8(0, ++offset);
          header.writeUInt8(0, ++offset);
          header.writeUInt8(0, ++offset);
          header.writeUInt8(buffer.byteLength >>> 24 & 255, ++offset);
          header.writeUInt8(buffer.byteLength >>> 16 & 255, ++offset);
          header.writeUInt8(buffer.byteLength >>> 8 & 255, ++offset);
          header.writeUInt8(buffer.byteLength >>> 0 & 255, ++offset);
        }
        this.socket.write(VSBuffer.concat([header, buffer]));
      }
      end() {
        this._isEnded = true;
        this.socket.end();
      }
      _acceptChunk(data) {
        if (data.byteLength === 0) {
          return;
        }
        this._incomingData.acceptChunk(data);
        while (this._incomingData.byteLength >= this._state.readLen) {
          if (this._state.state === 1) {
            const peekHeader = this._incomingData.peek(this._state.readLen);
            const firstByte = peekHeader.readUInt8(0);
            const finBit = (firstByte & 128) >>> 7;
            const rsv1Bit = (firstByte & 64) >>> 6;
            const secondByte = peekHeader.readUInt8(1);
            const hasMask = (secondByte & 128) >>> 7;
            const len = secondByte & 127;
            this._state.state = 2;
            this._state.readLen = 2 + (hasMask ? 4 : 0) + (len === 126 ? 2 : 0) + (len === 127 ? 8 : 0);
            this._state.fin = finBit;
            if (this._state.firstFrameOfMessage) {
              this._state.compressed = Boolean(rsv1Bit);
            }
            this._state.firstFrameOfMessage = Boolean(finBit);
            this._state.mask = 0;
            this.traceSocketEvent("webSocketNodeSocketPeekedHeader", { headerSize: this._state.readLen, compressed: this._state.compressed, fin: this._state.fin });
          } else if (this._state.state === 2) {
            const header = this._incomingData.read(this._state.readLen);
            const secondByte = header.readUInt8(1);
            const hasMask = (secondByte & 128) >>> 7;
            let len = secondByte & 127;
            let offset = 1;
            if (len === 126) {
              len = header.readUInt8(++offset) * 2 ** 8 + header.readUInt8(++offset);
            } else if (len === 127) {
              len = header.readUInt8(++offset) * 0 + header.readUInt8(++offset) * 0 + header.readUInt8(++offset) * 0 + header.readUInt8(++offset) * 0 + header.readUInt8(++offset) * 2 ** 24 + header.readUInt8(++offset) * 2 ** 16 + header.readUInt8(++offset) * 2 ** 8 + header.readUInt8(++offset);
            }
            let mask = 0;
            if (hasMask) {
              mask = header.readUInt8(++offset) * 2 ** 24 + header.readUInt8(++offset) * 2 ** 16 + header.readUInt8(++offset) * 2 ** 8 + header.readUInt8(++offset);
            }
            this._state.state = 3;
            this._state.readLen = len;
            this._state.mask = mask;
            this.traceSocketEvent("webSocketNodeSocketPeekedHeader", { bodySize: this._state.readLen, compressed: this._state.compressed, fin: this._state.fin, mask: this._state.mask });
          } else if (this._state.state === 3) {
            const body = this._incomingData.read(this._state.readLen);
            this.traceSocketEvent("webSocketNodeSocketReadData", body);
            unmask(body, this._state.mask);
            this.traceSocketEvent("webSocketNodeSocketUnmaskedData", body);
            this._state.state = 1;
            this._state.readLen = 2;
            this._state.mask = 0;
            this._flowManager.acceptFrame(body, this._state.compressed, !!this._state.fin);
          }
        }
      }
      async drain() {
        this.traceSocketEvent(
          "webSocketNodeSocketDrainBegin"
          /* WebSocketNodeSocketDrainBegin */
        );
        if (this._flowManager.isProcessingWriteQueue()) {
          await Event.toPromise(this._flowManager.onDidFinishProcessingWriteQueue);
        }
        await this.socket.drain();
        this.traceSocketEvent(
          "webSocketNodeSocketDrainEnd"
          /* WebSocketNodeSocketDrainEnd */
        );
      }
    };
    var WebSocketFlowManager = class extends Disposable {
      constructor(_tracer, permessageDeflate, inflateBytes, recordInflateBytes, _onData, _writeFn) {
        super();
        this._tracer = _tracer;
        this._onData = _onData;
        this._writeFn = _writeFn;
        if (permessageDeflate) {
          this._zlibInflateStream = this._register(new ZlibInflateStream(this._tracer, recordInflateBytes, inflateBytes, { windowBits: 15 }));
          this._zlibDeflateStream = this._register(new ZlibDeflateStream(this._tracer, { windowBits: 15 }));
          this._register(this._zlibInflateStream.onError((err) => this._onError.fire(err)));
          this._register(this._zlibDeflateStream.onError((err) => this._onError.fire(err)));
        } else {
          this._zlibInflateStream = null;
          this._zlibDeflateStream = null;
        }
      }
      _tracer;
      _onData;
      _writeFn;
      _onError = this._register(new Emitter2());
      onError = this._onError.event;
      _zlibInflateStream;
      _zlibDeflateStream;
      _writeQueue = [];
      _readQueue = [];
      _onDidFinishProcessingReadQueue = this._register(new Emitter2());
      onDidFinishProcessingReadQueue = this._onDidFinishProcessingReadQueue.event;
      _onDidFinishProcessingWriteQueue = this._register(new Emitter2());
      onDidFinishProcessingWriteQueue = this._onDidFinishProcessingWriteQueue.event;
      get permessageDeflate() {
        return Boolean(this._zlibInflateStream && this._zlibDeflateStream);
      }
      get recordedInflateBytes() {
        if (this._zlibInflateStream) {
          return this._zlibInflateStream.recordedInflateBytes;
        }
        return VSBuffer.alloc(0);
      }
      writeMessage(message) {
        this._writeQueue.push(message);
        this._processWriteQueue();
      }
      _isProcessingWriteQueue = false;
      async _processWriteQueue() {
        if (this._isProcessingWriteQueue) {
          return;
        }
        this._isProcessingWriteQueue = true;
        while (this._writeQueue.length > 0) {
          const message = this._writeQueue.shift();
          if (this._zlibDeflateStream) {
            const data = await this._deflateMessage(this._zlibDeflateStream, message);
            this._writeFn(data, true);
          } else {
            this._writeFn(message, false);
          }
        }
        this._isProcessingWriteQueue = false;
        this._onDidFinishProcessingWriteQueue.fire();
      }
      isProcessingWriteQueue() {
        return this._isProcessingWriteQueue;
      }
      /**
       * Subsequent calls should wait for the previous `_deflateBuffer` call to complete.
       */
      _deflateMessage(zlibDeflateStream, buffer) {
        return new Promise((resolve2, _reject) => {
          zlibDeflateStream.write(buffer);
          zlibDeflateStream.flush((data) => resolve2(data));
        });
      }
      acceptFrame(data, isCompressed, isLastFrameOfMessage) {
        this._readQueue.push({ data, isCompressed, isLastFrameOfMessage });
        this._processReadQueue();
      }
      _isProcessingReadQueue = false;
      async _processReadQueue() {
        if (this._isProcessingReadQueue) {
          return;
        }
        this._isProcessingReadQueue = true;
        while (this._readQueue.length > 0) {
          const frameInfo = this._readQueue.shift();
          if (this._zlibInflateStream && frameInfo.isCompressed) {
            const data = await this._inflateFrame(this._zlibInflateStream, frameInfo.data, frameInfo.isLastFrameOfMessage);
            this._onData.fire(data);
          } else {
            this._onData.fire(frameInfo.data);
          }
        }
        this._isProcessingReadQueue = false;
        this._onDidFinishProcessingReadQueue.fire();
      }
      isProcessingReadQueue() {
        return this._isProcessingReadQueue;
      }
      /**
       * Subsequent calls should wait for the previous `transformRead` call to complete.
       */
      _inflateFrame(zlibInflateStream, buffer, isLastFrameOfMessage) {
        return new Promise((resolve2, _reject) => {
          zlibInflateStream.write(buffer);
          if (isLastFrameOfMessage) {
            zlibInflateStream.write(VSBuffer.fromByteArray([0, 0, 255, 255]));
          }
          zlibInflateStream.flush((data) => resolve2(data));
        });
      }
    };
    var ZlibInflateStream = class extends Disposable {
      constructor(_tracer, _recordInflateBytes, inflateBytes, options) {
        super();
        this._tracer = _tracer;
        this._recordInflateBytes = _recordInflateBytes;
        this._zlibInflate = (0, import_zlib.createInflateRaw)(options);
        this._zlibInflate.on("error", (err) => {
          this._tracer.traceSocketEvent("zlibInflateError", { message: err?.message, code: err?.code });
          this._onError.fire(err);
        });
        this._zlibInflate.on("data", (data) => {
          this._tracer.traceSocketEvent("zlibInflateData", data);
          this._pendingInflateData.push(VSBuffer.wrap(data));
        });
        if (inflateBytes) {
          this._tracer.traceSocketEvent("zlibInflateInitialWrite", inflateBytes.buffer);
          this._zlibInflate.write(inflateBytes.buffer);
          this._zlibInflate.flush(() => {
            this._tracer.traceSocketEvent(
              "zlibInflateInitialFlushFired"
              /* zlibInflateInitialFlushFired */
            );
            this._pendingInflateData.length = 0;
          });
        }
      }
      _tracer;
      _recordInflateBytes;
      _onError = this._register(new Emitter2());
      onError = this._onError.event;
      _zlibInflate;
      _recordedInflateBytes = [];
      _pendingInflateData = [];
      get recordedInflateBytes() {
        if (this._recordInflateBytes) {
          return VSBuffer.concat(this._recordedInflateBytes);
        }
        return VSBuffer.alloc(0);
      }
      write(buffer) {
        if (this._recordInflateBytes) {
          this._recordedInflateBytes.push(buffer.clone());
        }
        this._tracer.traceSocketEvent("zlibInflateWrite", buffer);
        this._zlibInflate.write(buffer.buffer);
      }
      flush(callback) {
        this._zlibInflate.flush(() => {
          this._tracer.traceSocketEvent(
            "zlibInflateFlushFired"
            /* zlibInflateFlushFired */
          );
          const data = VSBuffer.concat(this._pendingInflateData);
          this._pendingInflateData.length = 0;
          callback(data);
        });
      }
    };
    var ZlibDeflateStream = class extends Disposable {
      constructor(_tracer, _options) {
        super();
        this._tracer = _tracer;
        this._zlibDeflate = (0, import_zlib.createDeflateRaw)({
          windowBits: 15
        });
        this._zlibDeflate.on("error", (err) => {
          this._tracer.traceSocketEvent("zlibDeflateError", { message: err?.message, code: err?.code });
          this._onError.fire(err);
        });
        this._zlibDeflate.on("data", (data) => {
          this._tracer.traceSocketEvent("zlibDeflateData", data);
          this._pendingDeflateData.push(VSBuffer.wrap(data));
        });
      }
      _tracer;
      _onError = this._register(new Emitter2());
      onError = this._onError.event;
      _zlibDeflate;
      _pendingDeflateData = [];
      write(buffer) {
        this._tracer.traceSocketEvent("zlibDeflateWrite", buffer.buffer);
        this._zlibDeflate.write(buffer.buffer);
      }
      flush(callback) {
        this._zlibDeflate.flush(
          /*Z_SYNC_FLUSH*/
          2,
          () => {
            this._tracer.traceSocketEvent(
              "zlibDeflateFlushFired"
              /* zlibDeflateFlushFired */
            );
            let data = VSBuffer.concat(this._pendingDeflateData);
            this._pendingDeflateData.length = 0;
            data = data.slice(0, data.byteLength - 4);
            callback(data);
          }
        );
      }
    };
    function unmask(buffer, mask) {
      if (mask === 0) {
        return;
      }
      const cnt = buffer.byteLength >>> 2;
      for (let i = 0; i < cnt; i++) {
        const v = buffer.readUInt32BE(i * 4);
        buffer.writeUInt32BE(v ^ mask, i * 4);
      }
      const offset = cnt * 4;
      const bytesLeft = buffer.byteLength - offset;
      const m3 = mask >>> 24 & 255;
      const m2 = mask >>> 16 & 255;
      const m1 = mask >>> 8 & 255;
      if (bytesLeft >= 1) {
        buffer.writeUInt8(buffer.readUInt8(offset) ^ m3, offset);
      }
      if (bytesLeft >= 2) {
        buffer.writeUInt8(buffer.readUInt8(offset + 1) ^ m2, offset + 1);
      }
      if (bytesLeft >= 3) {
        buffer.writeUInt8(buffer.readUInt8(offset + 2) ^ m1, offset + 2);
      }
    }
    var XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
    var safeIpcPathLengths = {
      [
        2
        /* Linux */
      ]: 107,
      [
        1
        /* Mac */
      ]: 103
    };
    function createRandomIPCHandle() {
      const randomSuffix = generateUuid();
      if (process.platform === "win32") {
        return `\\\\.\\pipe\\vsplay-ipc-${randomSuffix}-sock`;
      }
      const basePath = process.platform !== "darwin" && XDG_RUNTIME_DIR ? XDG_RUNTIME_DIR : (0, import_os.tmpdir)();
      const result = join(basePath, `vsplay-ipc-${randomSuffix}.sock`);
      validateIPCHandleLength(result);
      return result;
    }
    function createStaticIPCHandle(directoryPath, type, version) {
      const scope = (0, import_crypto.createHash)("md5").update(directoryPath).digest("hex");
      if (process.platform === "win32") {
        return `\\\\.\\pipe\\${scope}-${version}-${type}-sock`;
      }
      const versionForSocket = version.substr(0, 4);
      const typeForSocket = type.substr(0, 6);
      const scopeForSocket = scope.substr(0, 8);
      let result;
      if (process.platform !== "darwin" && XDG_RUNTIME_DIR && !process.env["VSCODE_PORTABLE"]) {
        result = join(XDG_RUNTIME_DIR, `vscode-${scopeForSocket}-${versionForSocket}-${typeForSocket}.sock`);
      } else {
        result = join(directoryPath, `${versionForSocket}-${typeForSocket}.sock`);
      }
      validateIPCHandleLength(result);
      return result;
    }
    function validateIPCHandleLength(handle) {
      const limit = safeIpcPathLengths[platform];
      if (typeof limit === "number" && handle.length >= limit) {
        console.warn(`WARNING: IPC handle "${handle}" is longer than ${limit} chars, try a shorter --user-data-dir`);
      }
    }
    var NodeIPCServer = class _NodeIPCServer extends IPCServer {
      static toClientConnectionEvent(server) {
        const onConnection = Event.fromNodeEventEmitter(server, "connection");
        return Event.map(onConnection, (socket) => ({
          protocol: new Protocol(new NodeSocket(socket, "ipc-server-connection")),
          onDidClientDisconnect: Event.once(Event.fromNodeEventEmitter(socket, "close"))
        }));
      }
      server;
      constructor(server) {
        super(_NodeIPCServer.toClientConnectionEvent(server));
        this.server = server;
      }
      dispose() {
        super.dispose();
        if (this.server) {
          this.server.close();
          this.server = null;
        }
      }
    };
    function serve2(hook) {
      return new Promise((c, e) => {
        const server = (0, import_net.createServer)();
        server.on("error", e);
        server.listen(hook, () => {
          server.removeListener("error", e);
          c(new NodeIPCServer(server));
        });
      });
    }
    function connect(hook, clientId) {
      return new Promise((c, e) => {
        const socket = (0, import_net.createConnection)(hook, () => {
          socket.removeListener("error", e);
          c(NetIPCClient.fromSocket(new NodeSocket(socket, `ipc-client${clientId}`), clientId));
        });
        socket.once("error", e);
      });
    }
    var _util;
    ((_util2) => {
      _util2.serviceIds = /* @__PURE__ */ new Map();
      _util2.DI_TARGET = "DI_TARGET";
      _util2.DI_DEPENDENCIES = "DI_DEPENDENCIES";
      function getServiceDependencies(ctor) {
        return ctor[_util2.DI_DEPENDENCIES] || [];
      }
      _util2.getServiceDependencies = getServiceDependencies;
    })(_util || (_util = {}));
    var IInstantiationService = createDecorator2("instantiationService");
    function storeServiceDependency(id2, target, index) {
      if (target[_util.DI_TARGET] === target) {
        target[_util.DI_DEPENDENCIES].push({ id: id2, index });
      } else {
        target[_util.DI_DEPENDENCIES] = [{ id: id2, index }];
        target[_util.DI_TARGET] = target;
      }
    }
    function createDecorator2(serviceId) {
      if (_util.serviceIds.has(serviceId)) {
        return _util.serviceIds.get(serviceId);
      }
      const id2 = function id3(target, _key, index) {
        if (arguments.length !== 3) {
          throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
        }
        storeServiceDependency(id3, target, index);
      };
      id2.toString = () => serviceId;
      _util.serviceIds.set(serviceId, id2);
      return id2;
    }
    var SyncDescriptor = class {
      constructor(ctor, staticArguments, supportsDelayedInstantiation) {
        this.ctor = ctor;
        this.staticArguments = staticArguments;
        this.supportsDelayedInstantiation = supportsDelayedInstantiation;
      }
      ctor;
      staticArguments;
      supportsDelayedInstantiation;
    };
    var _registry = [];
    function registerSingleton(id2, ctor, supportsDelayedInstantiation) {
      _registry.push([id2, new SyncDescriptor(ctor, [], supportsDelayedInstantiation)]);
    }
    function getSingletonServiceDescriptors() {
      return _registry;
    }
    var Node2 = class {
      constructor(key, data) {
        this.key = key;
        this.data = data;
      }
      key;
      data;
      incoming = /* @__PURE__ */ new Map();
      outgoing = /* @__PURE__ */ new Map();
    };
    var Graph = class {
      constructor(_hashFn) {
        this._hashFn = _hashFn;
      }
      _hashFn;
      _nodes = /* @__PURE__ */ new Map();
      roots() {
        const ret = [];
        this._nodes.forEach((node) => {
          if (node.incoming.size === 0) {
            ret.push(node);
          }
        });
        return ret;
      }
      leaves() {
        const ret = [];
        this._nodes.forEach((node) => {
          if (node.outgoing.size === 0) {
            ret.push(node);
          }
        });
        return ret;
      }
      insertEdge(from, to) {
        const fromNode = this.lookupOrInsertNode(from);
        const toNode = this.lookupOrInsertNode(to);
        fromNode.outgoing.set(this._hashFn(to), toNode);
        toNode.incoming.set(this._hashFn(from), fromNode);
      }
      removeNode(data) {
        const key = this._hashFn(data);
        this._nodes.delete(key);
        this._nodes.forEach((node) => {
          node.outgoing.delete(key);
          node.incoming.delete(key);
        });
      }
      lookupOrInsertNode(data) {
        const key = this._hashFn(data);
        let node = this._nodes.get(key);
        if (!node) {
          node = new Node2(key, data);
          this._nodes.set(key, node);
        }
        return node;
      }
      lookup(data) {
        return this._nodes.get(this._hashFn(data));
      }
      isEmpty() {
        return this._nodes.size === 0;
      }
      toString() {
        const data = [];
        this._nodes.forEach((value, key) => {
          data.push(`${key}
	(-> incoming)[${[...value.incoming.keys()].join(", ")}]
	(outgoing ->)[${[...value.outgoing.keys()].join(",")}]
`);
        });
        return data.join("\n");
      }
      /**
       * 找到一个环
       */
      findCycleSlow() {
        const ret = [];
        const visited = /* @__PURE__ */ new Set();
        const doFindCycle = (node) => {
          if (visited.has(node.key)) {
            return false;
          }
          visited.add(node.key);
          ret.push(node.data);
          for (const outgoing of node.outgoing.values()) {
            if (visited.has(outgoing.key) || doFindCycle(outgoing)) {
              return true;
            }
          }
          ret.pop();
          return false;
        };
        for (const node of this._nodes.values()) {
          if (doFindCycle(node)) {
            return ret;
          }
        }
        return void 0;
      }
    };
    var ServiceCollection = class {
      _entries = /* @__PURE__ */ new Map();
      constructor(...entries) {
        for (const [id2, service] of entries) {
          this._entries.set(id2, service);
        }
      }
      set(id2, instanceOrDescriptor) {
        const result = this._entries.get(id2);
        this._entries.set(id2, instanceOrDescriptor);
        return result;
      }
      has(id2) {
        return this._entries.has(id2);
      }
      get(id2) {
        return this._entries.get(id2);
      }
    };
    var _enableAllTracing = true;
    var CyclicDependencyError = class extends Error {
      constructor(graph) {
        super("cyclic dependency between services");
        this.message = graph.findCycleSlow() ? `UNABLE to detect cycle, dumping graph: 
${graph.toString()}` : "";
      }
    };
    var InstantiationService = class _InstantiationService {
      constructor(_services = new ServiceCollection(), _parent, _enableTracing = _enableAllTracing) {
        this._services = _services;
        this._parent = _parent;
        this._enableTracing = _enableTracing;
        this._services.set(IInstantiationService, this);
        this._globalGraph = _parent ? _parent._globalGraph : new Graph((e) => e);
      }
      _services;
      _parent;
      _enableTracing;
      _globalGraph;
      _globalGraphImplicitDependency;
      createChild(services) {
        return new _InstantiationService(services, this, this._enableTracing);
      }
      createInstance(ctorOrDescriptor, ...rest) {
        let _trace;
        let result;
        if (ctorOrDescriptor instanceof SyncDescriptor) {
          _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor.ctor);
          result = this._createInstance(ctorOrDescriptor.ctor, ctorOrDescriptor.staticArguments.concat(rest), _trace);
        } else {
          _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor);
          result = this._createInstance(ctorOrDescriptor, rest, _trace);
        }
        _trace.stop();
        return result;
      }
      _createInstance(ctor, args, _trace) {
        const serviceDependencies = _util.getServiceDependencies(ctor).sort((a, b) => a.index - b.index);
        const serviceArgs = [];
        for (const dependency of serviceDependencies) {
          const service = this._getOrCreateServiceInstance(dependency.id, _trace);
          if (!service) {
            throw new Error(`[createInstance] ${ctor.name} depends on UNKNOWN service ${dependency.id}.`);
          }
          serviceArgs.push(service);
        }
        const firstServiceArgPos = serviceDependencies.length > 0 ? serviceDependencies[0].index : args.length;
        if (args.length !== firstServiceArgPos) {
          console.trace(`[createInstance] First service dependency of ${ctor.name} at position ${firstServiceArgPos + 1} conflicts with ${args.length} static arguments`);
          const delta = firstServiceArgPos - args.length;
          if (delta > 0) {
            args = args.concat(new Array(delta));
          } else {
            args = args.slice(0, firstServiceArgPos);
          }
        }
        return Reflect.construct(ctor, args.concat(serviceArgs));
      }
      _setServiceInstance(id2, instance) {
        if (this._services.get(id2) instanceof SyncDescriptor) {
          this._services.set(id2, instance);
        } else if (this._parent) {
          this._parent._setServiceInstance(id2, instance);
        } else {
          throw new Error(`illegalState - setting UNKNOWN service instance ${id2}`);
        }
      }
      _getServiceInstanceOrDescriptor(id2) {
        const instanceOrDesc = this._services.get(id2);
        if (!instanceOrDesc && this._parent) {
          return this._parent._getServiceInstanceOrDescriptor(id2);
        }
        return instanceOrDesc;
      }
      _getOrCreateServiceInstance(id2, _trace) {
        if (this._globalGraph && this._globalGraphImplicitDependency) {
          this._globalGraph.insertEdge(this._globalGraphImplicitDependency, String(id2));
        }
        const thing = this._getServiceInstanceOrDescriptor(id2);
        if (thing instanceof SyncDescriptor) {
          return this._safeCreateAndCacheServiceInstance(id2, thing, _trace.branch(id2, true));
        }
        _trace.branch(id2, false);
        return thing;
      }
      _activeInstantiations = /* @__PURE__ */ new Set();
      _safeCreateAndCacheServiceInstance(id2, desc, _trace) {
        if (this._activeInstantiations.has(id2)) {
          throw new Error(`illegalState - cyclic dependency between services: ${id2}`);
        }
        this._activeInstantiations.add(id2);
        try {
          return this._createAndCacheServiceInstance(id2, desc, _trace);
        } finally {
          this._activeInstantiations.delete(id2);
        }
      }
      _createAndCacheServiceInstance(id2, desc, _trace) {
        const graph = new Graph((e) => e.id.toString());
        let cycleCount = 0;
        const stack = [{ id: id2, desc, _trace }];
        while (stack.length) {
          const item = stack.pop();
          graph.lookupOrInsertNode(item);
          if (cycleCount++ > 1e3) {
            throw new CyclicDependencyError(graph);
          }
          for (const dependency of _util.getServiceDependencies(item.desc.ctor)) {
            const instanceOrDesc = this._getServiceInstanceOrDescriptor(dependency.id);
            if (!instanceOrDesc) {
              throw new Error(`unresolved dependency '${dependency.id}'`);
            }
            this._globalGraph?.insertEdge(String(item.id), String(dependency.id));
            if (instanceOrDesc instanceof SyncDescriptor) {
              const d = { id: dependency.id, desc: instanceOrDesc, _trace: item._trace.branch(dependency.id, true) };
              graph.insertEdge(item, d);
              stack.push(d);
            }
          }
        }
        while (true) {
          const leafs = graph.leaves();
          if (leafs.length === 0) {
            if (!graph.isEmpty()) {
              throw new CyclicDependencyError(graph);
            }
            break;
          }
          for (const { data } of leafs) {
            const instanceOrDesc = this._getServiceInstanceOrDescriptor(data.id);
            if (instanceOrDesc instanceof SyncDescriptor) {
              const instance = this._createServiceInstanceWithOwner(data.id, data.desc.ctor, data.desc.staticArguments, data.desc.supportsDelayedInstantiation, data._trace);
              this._setServiceInstance(data.id, instance);
            }
            graph.removeNode(data);
          }
        }
        return this._getServiceInstanceOrDescriptor(id2);
      }
      _createServiceInstanceWithOwner(id2, ctor, args, supportsDelayedInstantiation, _trace) {
        if (this._services.get(id2) instanceof SyncDescriptor) {
          return this._createServiceInstance(id2, ctor, args, supportsDelayedInstantiation, _trace);
        }
        if (this._parent) {
          return this._parent._createServiceInstanceWithOwner(id2, ctor, args, supportsDelayedInstantiation, _trace);
        }
        throw new Error(`illegalState - creating UNKNOWN service ${ctor.name}`);
      }
      _createServiceInstance(_id, ctor, args, supportsDelayedInstantiation, _trace) {
        if (!supportsDelayedInstantiation) {
          return this._createInstance(ctor, args, _trace);
        }
        const child = new _InstantiationService(void 0, this, this._enableTracing);
        const earlyListenners = /* @__PURE__ */ new Map();
        const idle = new IdleValue(() => {
          const result = child._createInstance(ctor, args, _trace);
          for (const [key, values] of earlyListenners) {
            const candidate = result[key];
            if (typeof candidate === "function") {
              for (const listener of values) {
                candidate.apply(result, listener);
              }
            }
          }
          earlyListenners.clear();
          return result;
        });
        return new Proxy(/* @__PURE__ */ Object.create(null), {
          get(target, key) {
            if (!idle.isInitialized) {
              if (typeof key === "string" && (key.startsWith("onDid") || key.startsWith("onWill"))) {
                let list = earlyListenners.get(key);
                if (!list) {
                  list = new LinkedList();
                  earlyListenners.set(key, list);
                }
                const event = (callback, thisArg, disposables) => {
                  const rm = list.push([callback, thisArg, disposables]);
                  return toDisposable(rm);
                };
                return event;
              }
            }
            if (key in target) {
              return target[key];
            }
            const obj = idle.value;
            let prop = obj[key];
            if (typeof prop !== "function") {
              return prop;
            }
            prop = prop.bind(obj);
            target[key] = prop;
            return prop;
          },
          set(_target, p, value) {
            idle.value[p] = value;
            return true;
          },
          getPrototypeOf(_taregt) {
            return ctor.prototype;
          }
        });
      }
      invokeFunction(fn, ...args) {
        const _trace = Trace.traceInvocation(this._enableTracing, fn);
        let _done = false;
        try {
          const accessor = {
            get: (id2) => {
              if (_done) {
                throw new Error("service accessor is only valid during the invocation of its target method");
              }
              const result = this._getOrCreateServiceInstance(id2, _trace);
              if (!result) {
                throw new Error(`[invokeFunction] unknown service '${id2}'`);
              }
              return result;
            }
          };
          return fn(accessor, ...args);
        } finally {
          _done = true;
          _trace.stop();
        }
      }
    };
    var Trace = class _Trace {
      constructor(type, name) {
        this.type = type;
        this.name = name;
      }
      type;
      name;
      static all = /* @__PURE__ */ new Set();
      static _None = new class extends _Trace {
        constructor() {
          super(0, null);
        }
        stop() {
        }
        branch() {
          return this;
        }
      }();
      static traceInvocation(_enableTracing, ctor) {
        return !_enableTracing ? _Trace._None : new _Trace(2, ctor.name || new Error().stack.split("\n").slice(3, 4).join("\n"));
      }
      static traceCreation(_enableTracing, ctor) {
        return !_enableTracing ? _Trace._None : new _Trace(1, ctor.name);
      }
      static _totals = 0;
      _start = Date.now();
      _dep = [];
      branch(id2, first) {
        const child = new _Trace(3, id2.toString());
        this._dep.push([id2, first, child]);
        return child;
      }
      stop() {
        const dur = Date.now() - this._start;
        _Trace._totals += dur;
        let causedCreation = false;
        function printChild(n, trace) {
          const res = [];
          const prefix = new Array(n + 1).join("	");
          for (const [id2, first, child] of trace._dep) {
            if (first && child) {
              causedCreation = true;
              res.push(`${prefix}CREATES -> ${id2}`);
              const nested = printChild(n + 1, child);
              if (nested) {
                res.push(nested);
              }
            } else {
              res.push(`${prefix}uses -> ${id2}`);
            }
          }
          return res.join("\n");
        }
        const lines = [`${this.type === 1 ? "CREATE" : "CALL"} ${this.name}`, `${printChild(1, this)}`, `DONE, took ${dur.toFixed(2)}ms (grand total ${_Trace._totals.toFixed(2)}ms)`];
        if (dur > 2 || causedCreation) {
          _Trace.all.add(lines.join("\n"));
        }
      }
    };
  }
});

// src/standalone/nodeServer.ts
var import_lib2 = __toESM(require_dist());

// src/standalone/shared.ts
var PIPE_NAME = "\\\\.\\pipe\\puerts-rpc-test";
var CHANNEL_NAME = "calculator";

// src/ipc/testService.ts
var import_lib = __toESM(require_dist());
var CalculatorService = class {
  _onNotification = new import_lib.Emitter();
  onNotification = this._onNotification.event;
  async add(a, b) {
    return a + b;
  }
  async multiply(a, b) {
    return a * b;
  }
  async echo(msg) {
    return `[echo] ${msg}`;
  }
  notify(msg) {
    this._onNotification.fire(msg);
  }
  dispose() {
    this._onNotification.dispose();
  }
};

// src/standalone/nodeServer.ts
async function main() {
  console.log(`[nodeServer] \u542F\u52A8 RPC Server on ${PIPE_NAME}`);
  const server = await (0, import_lib2.serve)(PIPE_NAME);
  const service = new CalculatorService();
  server.registerChannel(CHANNEL_NAME, import_lib2.ProxyChannel.fromService(service));
  console.log("[nodeServer] SERVER_READY");
  const timeout = setTimeout(() => {
    console.log("[nodeServer] \u8D85\u65F6\uFF0C\u5173\u95ED\u670D\u52A1\u5668");
    cleanup();
  }, 3e4);
  server.onDidRemoveConnection(() => {
    console.log("[nodeServer] \u5BA2\u6237\u7AEF\u65AD\u5F00\uFF0C\u5173\u95ED\u670D\u52A1\u5668");
    clearTimeout(timeout);
    setTimeout(() => cleanup(), 500);
  });
  function cleanup() {
    service.dispose();
    server.dispose();
    console.log("[nodeServer] \u5DF2\u5173\u95ED");
    process.exit(0);
  }
}
main().catch((err) => {
  console.error("[nodeServer] \u9519\u8BEF:", err);
  process.exit(1);
});
//# sourceMappingURL=nodeServer.js.map

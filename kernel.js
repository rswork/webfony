(function(module){
  module.ucfirst = String.prototype.ucfirst = function (str) {
    str += '';
    var f = str.charAt(0).toUpperCase();
    return f+str.substr(1);
  };

  module.isNode = function (o) {
    return !!(
        (typeof Node === "object" || typeof Node === "function") ? o instanceof Node :
        o && typeof o === "object" && o !== null && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
  };

  module.isElement = function (o) {
    return !!(
        (typeof HTMLElement === "object" || typeof HTMLElement === "function") ? o instanceof HTMLElement :
        o && typeof o === "object" && o !== null && typeof o.nodeType === 1 && typeof o.nodeName === "string"
    );
  };

  var rswork = {};

  function App(name) {
    this.name = name;
  }

  App.prototype = {
    constructor: App,
    name: 'Base App',
    init: function () {
      console.log('init', this);
    },
    boot: function () {
      console.log('boot', this);
    }
  };

  function Request() {
    console.log('request created');
  }

  Request.fn = Request.prototype = {
    constructor: Request,
    createFromGlobal: function () {
      return new Request();
    }
  };

  function Response() {
    console.log('response created');
  }

  Response.fn = Response.prototype = {
    constructor: Response,
    send: function () {
      console.log('responsed');
    }
  };

  function NotFoundResponse() {
    this.send = function() {
      console.log('404 responsed');
    };
  }

  NotFoundResponse.prototype = new Response();
  NotFoundResponse.prototype.constructor = NotFoundResponse;

  function Kernel(id, rootElement, env, debug) {
    if (!module.isElement(rootElement)) {
      throw "rootElement is not a DOM element";
    }

    var readonlyProperties = {
      module: module,
      id: id,
      rootElement: rootElement,
      env: env,
      debug: debug
    };

    // readonly property
    for (prop in readonlyProperties) {
      Object.defineProperty(this, prop, {
        writeable: false,
        configurable: false,
        enumberable: true,
        value: readonlyProperties[prop]
      });
    }

    this.name =  module.ucfirst(id) + ' Kernel';
  }

  Kernel.prototype = {
    constructor: Kernel,
    rootElement: null,
    id: null,
    name: 'Base App Kernel',
    env: 'dev',
    debug: true, 
    handle: function(request) {
      if (!(request instanceof Request)) {
        return new NotFoundResponse();
      }

      return new Response();
    }
  };

  module.kernels = [];

  module.rswork = {
    http: {
      Request: Request,
      Response: Response,
      NotFoundResponse: NotFoundResponse
    },
    Kernel: Kernel
  };
})(window);

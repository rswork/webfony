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

  module.inheritPrototype = function (subType, superType) {
    var prototype = Object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
  };

  var rswork = {};

  function Request() {
    console.log('request created'); 
  }

  Request.fn = Request.prototype = {
    constructor: Request,
    kernel: null,
    createFromGlobal: function () {
      return new Request();
    },
    copy: function() {
      return new Request();
    },
    setKernel: function(kernel) {
      if (kernel instanceof Kernel) {
        this.kernel = kernel;
      }

      return this;
    }
  };

  function Response() {
    console.log('response created');
  }

  Response.fn = Response.prototype = {
    constructor: Response,
    kernel: null,
    sended: false,
    send: function () {
      console.log('send' + this.kernel.id, this.sended);
      this.sended = true;

      var info = document.createElement('p');
      info.innerHTML = this.kernel.name + ' responsed';

      this.kernel.rootElement.appendChild(info);

      console.log(this.kernel.id + 'responsed');
    },
    setKernel: function(kernel) {
      if (kernel instanceof Kernel) {
        this.kernel = kernel;
      }

      return this;
    }
  };

  function NotFoundResponse() {
    Response.call(this);

    this.send = function() {
      console.log('404 responsed');

      this.prototype.send.call(this);
    };
  }

  module.inheritPrototype(NotFoundResponse, Response);

  function childrenKernel() {
    var children = {};

    this.get = function (id) {
      if (children[id] instanceof Kernel) {
        return children[id];
      }

      return undefined;
    };

    this.append = function (kernel) {
      if (!(kernel instanceof Kernel)) {
        throw "not a kernel object";
      }

      children[kernel.id] = kernel;

      return this;
    }

    this.remove = function (id) {
      if (children[id] instanceof Kernel) {
        return children[id];
      }

      return undefined;
    }

    this.all = function () {
      var tmpChildren = {};

      for (id in children) {
        tmpChildren[id] = children[id];
      }

      return tmpChildren;
    }
  }

  function Kernel(id, rootElement, env, debug) {
    if (!module.isElement(rootElement)) {
      throw "rootElement is not a DOM element";
    }

    var readonlyProperties = {
      module: module,
      id: id,
      rootElement: rootElement,
      env: env,
      debug: debug,
      children: new childrenKernel()
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
    this.appendChild = function(childKernel) {
      this.children.append(childKernel);

      return this;
    }

    console.log(this.name+' created');
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
        var response = new NotFoundResponse();
      } else {
        request.setKernel(this);
        var response = new Response();
      }

      response.setKernel(this);

      return response;
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

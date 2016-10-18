'use strict';

/**
 * [ReactiveHbs 'update UI changes on the data change, variable on change blocks and binds helpers and functions']
 * @param {object} options {
 *     container {string} 'id or class of container to mount the template on',
 *     template {string} 'Handlebars template script id or class',
 *     data {object} 'data context to pass to the template'
 * }
 */

function ReactiveHbs(options) {
   this.setOptions(options);
};

ReactiveHbs.prototype.setOptions = function(options) {
   if ( typeof options === 'undefined' ) throw new Error('options params is not provided');
   if ( typeof options.container === 'undefined' ) throw new Error('to initialise an ReactiveHbs a container to mount template on is necessary ');
   if ( typeof options.template === 'undefined' ) throw new Error('to initialise an ReactiveHbs a template is necessary ');
   this.options = options;
   this.options.template = Handlebars.compile( $(this.options.template).html() );
   this.containerSelector = this.options.container;
   this.options.container = $( this.options.container );
   this.options.helpers = null;
   
   // subscribed data attributes to react on change
   this.reactive = {};
   this.renderCallback = null;
   
   // template promises
   this.tplPromises = {};
};

ReactiveHbs.prototype.helpers = function(helpers) {
   if ( typeof helpers !== 'object' ) return console.error(' helper function should be initialised with object ');
   this.options.helpers = $.extend({}, Handlebars.helpers, helpers);
};

ReactiveHbs.prototype.events = function(events) {
   if ( typeof events !== 'object' ) return console.error(' events function should be initialised with object ');
   var self = this;
   _.each(events, function(cb, eventKey) {
      var event = eventKey.substr(0, eventKey.indexOf(' ')),
            selector = eventKey.substr(eventKey.indexOf(' ') + 1);
      $(self.containerSelector).on(event, selector, function(e) {
         cb && cb(e, this, self);
      });
   });
};

ReactiveHbs.prototype.render = function(cb) {
   var context = this.options.data || null,
         helpers = this.options.helpers || null;
   this.options.container.empty();
   this.options.container.html( this.options.template(context, { helpers: helpers }) );
   if ( this.renderCallback ) this.renderCallback(this);
   cb && cb();
};

// on rendered callback to run when the template is compiled adn in the DOM
ReactiveHbs.prototype.onRendered = function(cb) {
   if ( typeof cb !== 'function') throw new Error('provide a callback function to on Rendered');
   this.renderCallback = cb;
};

ReactiveHbs.prototype.get = function(attr) {
   if ( typeof attr !== 'string' ) return console.error('parameter to get should be a string ');
   return _.get(this.options.data, attr);
};

ReactiveHbs.prototype.push = function(attr, value, cb) {
   if ( typeof attr !== 'string' ) return console.error('parameter to push value in should be a string ');
   if ( typeof value === 'undefined' ) return console.error('value should be there to push ');
   var arr = _.get(this.options.data, attr);
   if ( !_.isArray(arr) ) return console.error('values can only be pushed in array');
   arr.push(value);
   this.render();
   cb && cb();
};

ReactiveHbs.prototype.pop = function(attr, value, cb) {
   if ( typeof attr !== 'string' ) return console.error('parameter to push value in should be a string ');
   if ( typeof value === 'undefined' ) return console.error('value should be there to pop ');
   var arr = _.get(this.options.data, attr);
   if ( !_.isArray(arr) ) return console.error('values can only be poped in array');
   if ( !_.includes(arr, value) ) return;
   _.pull(arr, value);
   this.render();
   cb && cb();
};

ReactiveHbs.prototype.set = function(attr, value, cb) {
   if ( typeof attr !== 'string' ) return console.error('parameter to set should be a string ');
   _.set(this.options.data, attr, value);
   this.runSubscribedFunctions(attr);
   this.render();
   cb && cb();
};

// to set more than one key to the templates's data
ReactiveHbs.prototype.setData = function(obj, cb) {
   if ( typeof obj !== 'object' ) throw new Error('to set data type shuld be an object');
   _.assign(this.options.data, obj);
   this.render();
   cb && cb();
};

// run observers on change if the observer is bind to some data key
ReactiveHbs.prototype.runSubscribedFunctions = function(attr, options) {
   if ( !_.get(this.reactive, attr) ) return;
   var self = this;
   _.each( _.get(this.reactive, attr), function(react) {
      react(self);
   });
};

ReactiveHbs.prototype.promises = function(obj) {
   if ( typeof obj !== 'object' ) return console.error('expected paramter is an object !');
   this.tplPromises = obj;
};

ReactiveHbs.prototype.executePromise = function(promise, cb) {
   if ( typeof promise !== 'string' ) return console.error('expected a string as a first parameter ');
   if ( typeof cb !== 'function' ) return console.error('expected second parameter as a callback function ');
   var thisPromise = _.get(this.tplPromises, promise);
   if ( typeof thisPromise !== 'function' ) return console.error('the promise you specified doesnot exist');
   var promiseReturn = thisPromise();
   if ( !promiseReturn || !promiseReturn.then || !promiseReturn.catch ) return console.error('function should return a promise ');
   var self = this;
   promiseReturn
   .then(function(data) {
      cb(null, data, self);
   })
   .catch(function(err) {
      cb(err);
   });
};

// subscribe the reactive callbacks
ReactiveHbs.prototype.reactOnChange = function(attr, options, cb) {
   if ( typeof attr !== 'string' ) return console.error('attribute to run react on change should be a string type ');
   if ( typeof options !== 'object' ) return console.error('expected second paramter an object ');
   if ( typeof cb !== 'function' ) return console.error('expected third parameter a function ');
   var fn = cb;
   if ( options && options.debounce ) fn = _.debounce(cb, options.debounce);
   if ( options && options.throttle ) fn = _.throttle(cb, options.throttle);
   if ( !_.get(this.options.data, attr) ) return console.error('to bind observer key should be in template data object ');
   if ( _.get(this.reactive, attr) ) {
      _.get(this.reactive, attr).push(fn);
   } else {
      _.set(this.reactive, attr, [fn]);
   }
};

// unsubscirbe reactive observer on a key
ReactiveHbs.prototype.removeReactOnChange = function(attr) {
   if ( typeof attr !== 'string' ) return console.error('attribute to remove react on change should be a string type ');
   if ( !_.get(this.options.data, attr) ) return console.error('to remove observer key should be in template data object ');
   _.unset(this.reactive, attr);
};














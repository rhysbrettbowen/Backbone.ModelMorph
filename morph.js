// v1.0.0

// ==========================================
// Copyright 2013 Dataminr
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

define([
  'backbone',
  'underscore'
], function(Backbone, _) {

  var proto = {
    // override the get function
    get: function(attr) {
      // if there isn't a get in the schema pass it along to the original model
      if (!this._schema[attr] || !this._schema[attr].get) {
        return this._model.get(attr);
      // else we have to get the value from our functions
      } else {
        // if it requires other values to work out, get them
        var vals = _.map(this._schema[attr].require ||
        [attr], function(key) {
            if (key == attr)
              return this._model.get(key);
            return this.get(key);
          }, this);
        // run the schema get with the needed values
        return this._schema[attr].get.apply(this, vals);
      }
    },
    // override the set function
    set: function(key, value, options) {
      options = options || {};
      // if no set on schema then run on original model
      if (!this._schema[key] || !this._schema[key].set) {
        return this._model.set(key, value, options);
      // else we need to run the schema set
      } else {
        // if no require then the return value should set the matching model key
        if (!this._schema[key].require)
          return this._model.set(key, this._schema[key].set(value), options);
        // else we expect back an array of values to set each require
        var vals = this._schema[key].set(value);
        if (_.isArray(vals)) {
            _.each(vals, function(val, ind) {
              this._model.set(this._schema[key].require[ind], val, options);
            }, this);
        } else { // require only have one input, so one to one mapping
            this._model.set(this._schema[key].require[0], vals, options);
        }
      }
    },
    toJSON: function() {
      var obj = this._model.toJSON();
      _.each(this._schema, function(val, key) {
        if (val.get)
          obj[key] = this.get('key');
      }, this);
      return obj;
    },
    // recursive function to get the original model's keys we need
    _getRequire: function(key) {
      if (!this._schema[key] || !this._schema[key].require)
        return [key];
      return _.uniq(_.flatten(_.map(this._schema[key].require, this._getRequire, this)));
    },
    // need to trigger changes on computed values
    _onModelChange: function(type, model, options) {
      // if a attribute changes store it
      if (type.indexOf('change:') === 0) {
        this._storedChanges.push(type.substring(7));
      }
      // when a change finishes we need to fire off computed attribute changes
      if (type == 'change') {
        _.each(this._schema, function(val, key) {
          if (!val.require)
            return;
          if (_.intersection(this._getRequire(key), this._storedChanges).length)
            this.trigger('change:' + key, this, this.get(key), options);
        }, this);
      }
      // fire off the original event with the model pointing at this
      var args = _.toArray(arguments);
      args[1] = this;
      this.trigger.apply(this, args);
    },
    _storedChanges: []
  };

  Backbone.Morph = function (model, schema) {
    var old_extend = function (obj) {
      _.each(_.toArray(arguments).slice(1), function(source) {
        if (source) {
          for (var prop in source) {
            obj[prop] = source[prop];
          }
        }
      });
      return obj;
    }

    // create a new Morph model that uses the original model as a prototype
    var Morph = function() {};
    old_extend(Morph.prototype, model, proto);
    var morph = new Morph();
    morph._schema = schema;
    morph._model = model;
    model.on('all', morph._onModelChange, morph);
    return morph;
  };

});

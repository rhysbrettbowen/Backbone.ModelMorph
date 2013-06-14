#Model Morph

Allows the definition of a schema that will create a new model with computed properties to be created from another model. Useful for things like rivets where we want to provide computed properties that are dynamic and will change dependant on the original model.

```javascript

var orig = new Backbone.Model({
	firstName: 'fred',
	lastName: 'smith',
	title: 'Mr'
});

var morph = new Backbone.Morph(orig, {
	fullName: {
		get: function(first, last) {
			return first + ' ' + last;
		},
		set: function(name) {
			// return array matches require array to set
			return name.split(' ');
		},
		require: ['firstName', 'lastName']
	},
	titledName: {
		get: function(title, name) {
			return title + ' ' + name;
		},
		set: function(name) {
			return [name.substring(0,2), name.substring(3)];
		},
		// can use computed properties to compute more properties
		require: ['title', 'fullName']
	}
});

// can get from schema
morph.get('fullName'); // 'fred smith'

// or original values
morh.get('firstName'); // 'fred'

// can listen to changes on computed values
morph.on('change:fullName', function(model, name, options) {
	alert(name);
});

orig.set('firstName', 'bert'); // alert 'bert smith'

// can even set back through computed values
morph.set('edward pumpernickel'); // alert 'edward pumpernickel'

// and changes are made back to original model
orig.get('firstName'); // edward

```

#Changelog

##v1.0.0

-initial versioning
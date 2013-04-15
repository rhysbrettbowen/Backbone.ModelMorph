define(['chai', 'backbone', 'Backbone.Morph'], function(chai) {


	chai.should();

	describe('Backbone.Morph', function() {
		var model = new Backbone.Model({
			a: 2,
			b: 3
		});
		it('return the model values for empty schema', function() {
			var morph = new Backbone.Morph(model, {});
			morph.get('a').should.equal(2);
			morph.get('b').should.equal(3);
		});
		it('return the values given a simple get function', function() {
			var morph = new Backbone.Morph(model, {
				a: {
					get: function(a) {
						return a + 1;
					}
				}
			});
			morph.get('a').should.equal(3);
			morph.get('b').should.equal(3);
		});
		it('return the values given a require get', function() {
			var morph = new Backbone.Morph(model, {
				c: {
					get: function(a, b) {
						return a + b;
					},
					require: ['a', 'b']
				}
			});
			morph.get('a').should.equal(2);
			morph.get('b').should.equal(3);
			morph.get('c').should.equal(5);
		});
	});

});
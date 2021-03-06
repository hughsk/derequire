var should = require('chai').should();
var derequire = require('../');
var fs = require("fs");
var crypto = require('crypto');
function hash(data){
  return crypto.createHash('sha512').update(data).digest('base64');
}
var compare = hash(fs.readFileSync('./test/pouchdb.dereq.js', {encoding: 'utf8'}));
var compareCjsSmartass = fs.readFileSync('./test/cjs-smartass.dereq.js', {encoding: 'utf8'});
var compareCjslazy = fs.readFileSync('./test/cjs-lazy.js', {encoding: 'utf8'});
describe('derequire', function(){
  it('should work', function(){
    var exampleText = "var x=function(require,module,exports){var process=require(\"__browserify_process\");var requireText = \"require\";}";
    derequire(exampleText).should.equal("var x=function(_dereq_,module,exports){var process=_dereq_(\"__browserify_process\");var requireText = \"require\";}");
  });
  it('should only replace arguments and calls',function(){
    var exampleText = "function x(require,module,exports){var process=require(\"__browserify_process\");var requireText = {}; requireText.require = \"require\";(function(){var require = 'blah';}())}";
    derequire(exampleText).should.equal("function x(_dereq_,module,exports){var process=_dereq_(\"__browserify_process\");var requireText = {}; requireText.require = \"require\";(function(){var require = 'blah';}())}");
  });
  it('should handle top level return statments', function(){
    var exampleText = 'return (function(require){return require();}(function(){return "sentinel";}));';
    derequire(exampleText).should.equal('return (function(_dereq_){return _dereq_();}(function(){return "sentinel";}));');
  });
  it('should work with a comment on the end', function(){
    var exampleText = 'var x=function(require,module,exports){var process=require("__browserify_process");var requireText = "require";}//lala';
    derequire(exampleText).should.equal('var x=function(_dereq_,module,exports){var process=_dereq_("__browserify_process");var requireText = "require";}//lala');
  });
  it('should work with whitespace inside require statement', function(){
    var exampleText = 'var x=function(require,module,exports){var process=require(  "__browserify_process"   )}';
    derequire(exampleText).should.equal('var x=function(_dereq_,module,exports){var process=_dereq_(  "__browserify_process"   )}');
  });
  it('should work with single quoted requires', function(){
    var exampleText = 'var x=function(require,module,exports){var process=require(\'__browserify_process\')}';
    derequire(exampleText).should.equal('var x=function(_dereq_,module,exports){var process=_dereq_(\'__browserify_process\')}');
  });
  it('should throw an error if you try to change things of different sizes', function(){
    should.throw(function(){
      derequire('require("x")', 'lalalalla', 'la');
    });
  });
  it("should return notthe code back if it can't parse it", function(){
    derequire("/*").should.equal("/*");
  });
  it("should return the code back if it can't parse it and it has a require", function(){
    derequire("/*require('").should.equal("/*require('");
  });
  it('should work on something big', function(done){
    fs.readFile('./test/pouchdb.js', {encoding:'utf8'}, function(err, data){
      if(err){
        return done(err);
      }
      var transformed = derequire(data);
      hash(transformed).should.equal(compare);
      done();
    });
  });
  it('should not fail on attribute lookups', function(){
    var txt = 'var x=function(require,module,exports){'
        + 'var W=require("stream").Writable;'
        + '}'
    ;
    var expected = 'var x=function(_dereq_,module,exports){'
        + 'var W=_dereq_("stream").Writable;'
        + '}'
    ;
    derequire(txt).should.equal(expected);
  });
  it('should fix cjs-smartassery', function (done){
    fs.readFile('./test/cjs-smartass.js', {encoding:'utf8'}, function(err, data){
      if(err){
        return done(err);
      }
      var transformed = derequire(data);
      transformed.should.equal(compareCjsSmartass);
      done();
    });

  });
  it('should fix not fix cjs-lazy', function (){
    derequire(compareCjslazy).should.equal(compareCjslazy);
  });

});

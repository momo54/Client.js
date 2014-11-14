/*! @license ©2014 Ruben Verborgh - Multimedia Lab / iMinds / Ghent University */
var CompositeExtractor = require('../../lib/extractors/CompositeExtractor');

var Iterator = require('../../lib/iterators/Iterator');

describe('CompositeExtractor', function () {
  describe('The CompositeExtractor module', function () {
    it('should be a function', function () {
      CompositeExtractor.should.be.a('function');
    });

    it('should make CompositeExtractor objects', function () {
      CompositeExtractor().should.be.an.instanceof(CompositeExtractor);
    });

    it('should be an CompositeExtractor constructor', function () {
      new CompositeExtractor().should.be.an.instanceof(CompositeExtractor);
    });
  });

  describe('A CompositeExtractor instance without extractors', function () {
    var extractor = new CompositeExtractor();

    describe('extracting from an empty stream', function () {
      var metadata;
      before(function (done) {
        extractor.extract({ fragmentUrl: 'http://example.org/fragment' }, Iterator.empty(),
                          function (error, m) { metadata = m; done(error); });
      });

      it('should emit an empty metadata object', function () {
        metadata.should.deep.equal({});
      });
    });
  });

  describe('A CompositeExtractor instance with three extractors', function () {
    var extractorA = extractorWithValue({ a: 1 });
    var extractorB = extractorWithValue({ b: 2 });
    var extractorC = extractorWithValue({ c: 3 });
    var composite = new CompositeExtractor({
      "metadata": [extractorA, extractorB],
      "controls": [extractorC],
    });
    var callback, metadata, tripleStream;

    describe('extracting from an empty stream', function () {
      var metadata;
      before(function (done) {
        var pending = 2;
        composite.extract(metadata = { fragmentUrl: 'http://example.org/fragment' },
                          tripleStream = Iterator.empty(),
                          callback = sinon.spy(function () { if (!--pending) done(); }));
      });

      it('should call the first extractor', function () {
        extractorA.extract.should.have.been.calledOnce;
        extractorA.extract.getCall(0).args[0].should.equal(metadata);
        extractorA.extract.getCall(0).args[1].should.equal(tripleStream);
        extractorA.extract.getCall(0).args[2].should.be.a('function');
      });

      it('should call the second extractor', function () {
        extractorB.extract.should.have.been.calledOnce;
        extractorB.extract.getCall(0).args[0].should.equal(metadata);
        extractorB.extract.getCall(0).args[1].should.equal(tripleStream);
        extractorB.extract.getCall(0).args[2].should.be.a('function');
      });

      it('should call the third extractor', function () {
        extractorC.extract.should.have.been.calledOnce;
        extractorC.extract.getCall(0).args[0].should.equal(metadata);
        extractorC.extract.getCall(0).args[1].should.equal(tripleStream);
        extractorC.extract.getCall(0).args[2].should.be.a('function');
      });

      it('should invoke the callback twice', function () {
        callback.should.have.been.calledTwice;
      });

      describe('the first invocation of the callback', function () {
        it('should not emit an error', function () {
          expect(callback.getCall(0).args[0]).to.be.null;
        });

        it('should emit the combined metadata of the "metadata" extractors', function () {
          callback.getCall(0).args[1].should.deep.equal({ metadata: { a: 1, b: 2 } });
        });
      });

      describe('the second invocation of the callback', function () {
        it('should not emit an error', function () {
          expect(callback.getCall(1).args[0]).to.be.null;
        });

        it('should emit the combined metadata of the "controls" extractors', function () {
          callback.getCall(1).args[1].should.deep.equal({ controls: { c: 3 } });
        });
      });
    });
  });
});

function extractorWithValue(value) {
  return {
    extract: sinon.spy(function (metadata, tripleStream, callback) {
      setImmediate(function () { callback(null, value); });
    }),
  };
}

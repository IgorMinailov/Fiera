var assert = require('assert');
let  {getJSONFromEncodedUrl, isPermutation,runAsycnTasksInParallel}  = require("./../index.js");
const  { MockRequest }  = require("./../MockRequest");
const  { RequestLimiter }  = require("./../service");


describe('URL-encoded String', function() {
    describe('To JSON', function() {
        it('should Parse URL and Return JSON', function() {
            let result = getJSONFromEncodedUrl("a=1&b=2&a=hello&apple=9&apple=digital");
            assert.deepEqual(result, {a: ['1', 'hello'], b: "2", apple: ['9', 'digital']});
        });
    });
});

describe("Compare two string ", function () {
    describe("To check permutation", function () {
        it("Should return true if they are Permutation to each other", function () {
            assert.equal(isPermutation("debit card", "bad credit"), true);
            });
    });

    describe("To check NOT permutation", function () {
        it("Should return false if they are Permutation to each other", function () {
            assert.equal(isPermutation("debit card", "bald  edit"), false);
        });
    });

});

describe('Run Async Tasks', function() {
    describe('In Parallel Concurrent', function() {
        it('Should Run Async Call Back On Each Element With Concurrency 2', async function() {
            let result = await runAsycnTasksInParallel([1, 2, 3], async val => val + 1, { concurrency: 2 });
            assert.deepEqual(result, [2,3,4]);
        });
    });

    describe('In Parallel All', function() {
        it('Should Run Async Call Back On Each Element in Parallel', async function() {
            let result = await runAsycnTasksInParallel([1, 2, 3], async val => val + 1, { concurrency: 2 });
            assert.deepEqual(result, [2,3,4]);
        });
    });
});

describe('Request Limiter', function() {
    it('Set the request handler', function() {
        const limiter = new RequestLimiter();
        limiter.setRequestHandler(new MockRequest());
    });

    it('Return response', async function() {
        const limiter = new RequestLimiter();
        limiter.setRequestHandler(new MockRequest());

        const response = await limiter.request({});
        assert.deepStrictEqual(response, { status: 'good' });
    });

    it('handle one request', async function() {
        const limiter = new RequestLimiter();
        limiter.setRequestHandler(new MockRequest());

        await limiter.request({});
    });

    it('handle one request that fails', async function () {
        const limiter = new RequestLimiter();
        limiter.setRequestHandler(new MockRequest());

        await limiter.request({ action: 'fail' }).catch((err) => {
            assert(err);
            assert.equal(err.message, 'Fail!')
        });
    });
    it('idle promise', async() => {
        const limiter = new RequestLimiter();
        limiter.setRequestHandler(new MockRequest());
        let idleCalled = false;

        await limiter.request({});
        limiter.idle().then(() => idleCalled = true);

        await limiter.request({});
        assert.equal(idleCalled, true);
    });
});

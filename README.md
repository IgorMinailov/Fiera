# Instructions

Please write your solutions in JavaScript (or in any language you see fit). Although the  mock functions and the test cases are written in JavaScript, you may choose not to use them.

Please use only standard features of language (no external dependencies) in your implementation and write tests for your code. For the sample tests, I've used mocha.

##### Question 1 - Question 3
Your goal is a to complete the functions in index.js to make all the tests defined in test.js pass
##### Question 4
Write a separate file for your solution. Write comments to explain how the solution is working.

### Question 1

Please write a function that transforms a URL-encoded string into a ç. If there are two parameters with the same name, the values should be stacked as an array.

* input: `"a=1&b=2&a=hello&apple=9&apple=digital"`
* output: `{ "a": ["1","hello"], "b": "2", "apple": ["9","digital"] }`


### Question 2

Please write a function which receives two strings and returns true if one is a permutation of the other. Optimize for run time over everything else (modularity, space, memory, etc).

* input: `("debit card", "bad credit")`
* output: `true`


### Question 3

Please write an async function that takes 3 arguments
	1. An array of values to iterate over
	2. An async callback that should be called with each item in the array
	3. Optional max concurrency of callbacks that should be resolved at a time  

* input: `map([1, 2, 3], async val => val + 1, { concurrency: 2 })`
* output: [2, 3, 4]

If the concurrency is 2 that means we want 2 promises going in parallel at a time (do not wait for the full batch of 2 to finish before starting the next batch).


### Question 4

You have to interface with an API that has a rate limit of 500 requests / second. Please build a class that will abstract the management of requests to the API so that you don't need to think about the rate limit while making requests. You can design the class however you'd like.
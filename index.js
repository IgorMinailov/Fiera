//Question 1
const getJSONFromEncodedUrl = function(inputUrl) {
  const searchParams = new URLSearchParams(inputUrl);
  const resultObj = {};

  for (let params of searchParams) {
    const [key, value] = params;
    resultObj[key] = resultObj[key] ? [...resultObj[key], value] : value;
  }

  return resultObj;
};

//Question 2
const isPermutation = function(textOne, textTwo) {
  if (textOne.length !== textTwo.length) {
    return false;
  }
  const transformStr = str =>
    str
      .split("")
      .sort()
      .join();

  return transformStr(textOne) === transformStr(textTwo);
};

//Question 3
const runAsycnTasksInParallel = async function(
  collection,
  asyncCallback,
  { concurrency }
) {
  const promises = collection.map(job => asyncCallback(job));
  const requestArr = concurrency ? chunk(promises, concurrency) : promises;
  let arr = [];

  if (!concurrency) {
    return await Promise.all(requestArr);
  }

  for (let request of requestArr) {
    let results = await Promise.all(request);
    arr = [...arr, ...results];
  }

  return arr;
};

//Helper function for Question 3
function chunk(arr, len) {
  let chunks = [],
    i = 0,
    n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
}

exports.getJSONFromEncodedUrl = getJSONFromEncodedUrl;
exports.isPermutation = isPermutation;
exports.runAsycnTasksInParallel = runAsycnTasksInParallel;

// all

const promises = [
  Promise.resolve('a'),
  Promise.resolve('b'),
  Promise.resolve('c'),
];
Promise.all(promises)
  .then((arr) => assert.deepEqual(
    arr, ['a', 'b', 'c']
));

// reject

const promises = [
  Promise.resolve('a'),
  Promise.resolve('b'),
  Promise.reject('ERROR'),
];
Promise.all(promises)
  .catch((err) => assert.equal(
    err, 'ERROR'
));

// map all
function timesTwoAsync(x) {
  return new Promise(resolve => resolve(x * 2));
}
const arr = [1, 2, 3];
const promiseArr = arr.map(timesTwoAsync);
Promise.all(promiseArr)
  .then(result => {
    assert.deepEqual(result, [2, 4, 6]);
});

// map 例子

function downloadText(url) {
  return fetch(url)
    .then((response) => { // (A)
      if (!response.ok) { // (B)
        throw new Error(response.statusText);
      }
      return response.text(); // (C)
    });
}


//在下面的示例中，咱们 下载了两个文件

const urls = [
  'http://example.com/first.txt',
  'http://example.com/second.txt',
];

const promises = urls.map(
  url => downloadText(url));

Promise.all(promises)
  .then(
    (arr) => assert.deepEqual(
      arr, ['First!', 'Second!']
));
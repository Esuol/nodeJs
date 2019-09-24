# node.js 测试用例：supertest

fibonacci 函数的定义为 int fibonacci(int n)，调用函数的路径是 '/fib?n=10'，然后这个接口会返回 '55'。函数的行为定义如下：

1. 当 n === 0 时，返回 0；n === 1时，返回 1;

2. n > 1 时，返回 fibonacci(n) === fibonacci(n-1) + fibonacci(n-2)，如 fibonacci(10) === 55;

3. n 不可大于10，否则抛错，http status 500，因为 Node.js 的计算性能没那么强。

4. n 也不可小于 0，否则抛错，500，因为没意义。

5. n 不为数字时，抛错，500。

test/main.test.js: 对 app 的接口进行测试，覆盖以上所有情况。
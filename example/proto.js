function F () {};
let fm = new F();
console.log(fm.__proto__ === F.prototype);
console.log(F.prototype.constructor === F);
console.log(F.prototype.__proto__ === Object.prototype);
console.log(Object.prototype.__proto__ === null)
console.log(F.__proto__ === Function.prototype)
console.log(Function.prototype.__proto__ === Object.prototype)
console.log(Function.prototype === Function.__proto__)
console.log('----------------------------------')
let obj = new Object()
console.log(obj.__proto__ === Object.prototype)
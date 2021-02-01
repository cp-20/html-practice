if (!String.prototype.replaceAt) String.prototype.replaceAt = function (begin, end, to) { return this.slice(0, begin) + to + this.slice(end + 1) }

console.log('0123456789'.replaceAt(3, 5, 'あいうえお'))
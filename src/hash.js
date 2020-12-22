// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript

function hashJoaat (b) {
    for (var a = 0, c = b.length; c--;)
        a += b.charCodeAt(c), a += a << 10, a ^= a >> 6;

    a += a << 3;
    a ^= a >> 11;
    return ((a + (a << 15) & 4294967295) >>> 0).toString(16)
}

module.exports = {
    hashJoaat
}

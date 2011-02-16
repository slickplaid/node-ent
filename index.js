var fs = require('fs');
var entities = JSON.parse(
    fs.readFileSync(__dirname + '/entities.json', 'utf8')
);

var revEntities = {};
Object.keys(entities).forEach(function (key) {
    var e = entities[key];
    var s = typeof e === 'number' ? String.fromCharCode(e) : e;
    revEntities[s] = key;
});

exports.encode = function (str) {
    if (typeof str === 'string') {
        return str.split('').map(function (c) {
            var e = revEntities[c];
            return (e && (e.match(/;$/) ? e : e + ';')) || c;
        }).join('');
    }
    else if (Buffer.isBuffer(str)) {
        var buf = new Buffer(str.length);
        for (var i = 0; i < str.length; i++) {
            var c = str[i];
            var e = revEntities[c];
            buf[i] = (e && (e.match(/;$/) ? e : e + ';')) || c;
        }
        return buf;
    }
    else {
        throw new TypeError('Expected a Buffer or String');
    }
};

exports.decode = function (str) {
    if (typeof str === 'string') {
        str
            .replace(/&#(\d+);?/, function (_, code) {
                return String.fromCharCode(code);
            })
            .replace(/&([^;\W]+;?)/g, function (m, e) {
                var ee = e.replace(/;$/, '');
                var target = entities[e]
                    || (e.match(/;$/) && entities[ee])
                ;
                
                if (typeof target === 'number') {
                    return String.fromCharCode(target);
                }
                else if (typeof target === 'string') {
                    return target;
                }
                else {
                    return m;
                }
            })
        ;
    }
    else {
        throw new TypeError('Expected a String');
    }
};

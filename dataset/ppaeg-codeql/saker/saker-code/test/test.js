/**
 * Created by Sky on 2016/11/8.
 */
'use strict';
var assert = require('assert'),
    saker = require('../');
saker.config({
    debug: true
});
describe('【saker测试用例。saker test cases.】', function () {
    describe('简单情况。Simple cases.', function () {
        it('空字符串。Empty string.', function (done) {
            var expected = '';
            saker.compile('').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('只存在HTML标签。Exists only html.', function (done) {
            var expected = '<div></div>';
            saker.compile('<div></div>').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('只存在纯文本。Exists only plain text.', function (done) {
            var expected = 'hello\r\nworld!';
            saker.compile('hello\r\nworld!').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('只存在脚本代码。Exists only scripts.', function (done) {
            var expected = 'Sky';
            saker.compile('@name').call({
                layout: null
            },{
                name: 'Sky'
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('text标签的处理。Process text tag.', function (done) {
            var expected = 'hello world!';
            saker.compile('<text>hello world!</text>').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });
    });

    describe('作为标签属性。As property reference.', function () {
        it('不包含在引号内。Not included in quotation marks.', function (done) {
            var expected = '<div class=active></div>';
            saker.compile('<div class=@clsName></div>').call({
                layout: null
            }, {
                clsName: 'active'
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('包含在引号内。Included in quotation marks.', function (done) {
            var expected = '<div class="active"></div>';
            saker.compile('<div class="@clsName"></div>').call({
                layout: null
            }, {
                clsName: 'active'
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('包含点号。Included dot.', function (done) {
            var expected = '<div class="active red"></div>';
            saker.compile('<div class="@obj.name red"></div>').call({
                layout: null
            }, {
                obj: {name: 'active'}
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('包含小括号。Included brackets.', function (done) {
            var expected = '<div class="active,blue"></div>';
            saker.compile('<div class="@arr.toString()"></div>').call({
                layout: null
            }, {
                arr: ['active', 'blue']
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('包含方括号。Included square brackets.', function (done) {
            var expected = '<div class="active"></div>';
            saker.compile('<div class="@arr[0]"></div>').call({
                layout: null
            }, {
                arr: ['active', 'blue']
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('包含有空格。Included whitespace.', function (done) {
            var expected = '<div class="active blue red"></div>';
            saker.compile('<div class="@arr.join(\" \") red"></div>').call({
                layout: null
            }, {
                arr: ['active', 'blue']
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('包含有短横。Included "-".', function (done) {
            var expected = '<div class="a,b,c"></div>';
            saker.compile('<div class="@str.split(\'-\')"></div>').call({
                layout: null
            }, {
                str: 'a-b-c'
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('后面跟空格。Followed by whitespace', function (done) {
            var expected = '<div class="active red"></div>';
            saker.compile('<div class="@clsName red"></div>').call({
                layout: null
            }, {
                clsName: 'active'
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('后面跟反斜杠。Followed by \\', function (done) {
            var expected = '<div class="active\\a"></div>';
            saker.compile('<div class="@clsName\\a"></div>').call({
                layout: null
            }, {
                clsName: 'active'
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('后面跟斜杠。Followed by /', function (done) {
            var expected = '<a href="example.com/test.html"></a>';
            saker.compile('<a href="@baseUrl/test.html"></a>').call({
                layout: null
            }, {
                baseUrl: 'example.com'
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('小括号后面为空格。After brackets is whitespace.', function (done) {
            var expected = '<div class="active,blue red"></div>';
            saker.compile('<div class="@arr.toString() red"></div>').call({
                layout: null
            }, {
                arr: ['active', 'blue']
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('小括号后面为普通字符。After brackets is word character.', function (done) {
            var expected = '<div class="active,bluered"></div>';
            saker.compile('<div class="@arr.toString()red"></div>').call({
                layout: null
            }, {
                arr: ['active', 'blue']
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('小括号后面为脚本字符。After brackets is script character.', function (done) {
            var expected = '<div class="Sky"></div>';
            saker.compile('<div class="@names.split(\',\')[0]"></div>').call({
                layout: null
            }, {
                names: 'Sky,Kathy'
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });
    });

    describe('代码块处理。Code block process.', function () {
        it('后端单行注释。Server side line comment.', function (done) {
            var expected = 'other\ntext';
            saker.compile('other@//This is a line comment.\ntext').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('后端块状注释。Server side block comment.', function (done) {
            var expected = 'othertext';
            saker.compile('other@*\nThis is a block comment.\n*@text').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"@{}"块状代码。"@{}" block code.', function (done) {
            var expected = '<div>hello</div><div>saker</div>saker!';
            saker.compile('<div>hello</div>@{var name = "saker";<div>@name</div>}saker!').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"@{}"块状代码，在标签内部。"@{}" block code, within tags.', function (done) {
            var expected = '<div>hello</div><div><div>saker</div></div>saker!';
            saker.compile('<div>hello</div><div>@{var name = "saker";<div>@name</div>}</div>saker!').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"@{}"块状代码，在标签内部，后跟HTML。"@{}" block code, within tags, followed by HTML.', function (done) {
            var expected = '<div>hello</div><div><div>saker</div>abc</div>saker!';
            saker.compile('<div>hello</div><div>@{var name = "saker";<div>@name</div>}abc</div>saker!').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('嵌套的"@{}"块状代码。Nested "@{}" block code.', function (done) {
            var expected = '<div>abc</div>';
            saker.compile('@{<div>@{}abc</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"@if"代码块。"@if" block code.', function (done) {
            var expected = '<div>saker</div>';
            saker.compile('@if(true){<div>saker</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"else if"代码块。"else if" block code.', function (done) {
            var expected = '<div>other</div>';
            saker.compile('@if(false){<div>some</div>}else if(true){<div>other</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"else"代码块。"else" block code.', function (done) {
            var expected = '<div>other</div>';
            saker.compile('@if(false){<div>some</div>}else{<div>other</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"for"代码块。"for" block code.', function (done) {
            var expected = '<div>0</div><div>1</div>';
            saker.compile('@for(var i=0;i<=1;i++){<div>@i</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"while"代码块。"while" block code.', function (done) {
            var expected = '<div>1</div><div>0</div>';
            saker.compile('@{var i = 1;}@while(i>=0){<div>@i</div>i--;}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"do"代码块。"do" block code.', function (done) {
            var expected = '<div>1</div><div>0</div>';
            saker.compile('@{var i = 1;}@do{<div>@i</div>i--;}while(i>=0)').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"switch"代码块。"switch" block code.', function (done) {
            var expected = '<div>1</div>';
            saker.compile('@{var flag=1;}@switch(flag){case 0:<div>0</div>case 1:<div>1</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"try catch"代码块。"try catch" block code.', function (done) {
            var expected = '<div>err</div>';
            saker.compile('@try{JSON.parse();}catch(e){<div>err</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('"finally"代码块。"finally" block code.', function (done) {
            var expected = '<div>err</div><div>end</div>';
            saker.compile('@try{JSON.parse();}catch(e){<div>err</div>}finally{<div>end</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });
    });

    describe('特殊情况。Special cases.', function () {
        it('HTML中包含特殊字符。Exists special characters in HTML.', function (done) {
            var expected = '1 > 0 and 0 < 1 is a fact!';
            saker.compile('1 > 0 and 0 < 1 is a fact!').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('脚本字符串中包含特殊字符。Exists special characters in script string.', function (done) {
            var expected = '<div class="a&lt;b"></div>';
            saker.compile('@{var a = "a<b";}<div class="@a"></div>').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('普通闭合标签包含"\\"。Exists "\\" in common closed tag.', function (done) {
            var expected = '<script>document.write("<div>aaa<\\/div>");</script>';
            saker.compile('<script>document.write("<div>aaa<\\/div>");</script>').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('自闭合标签包含"\\"。Exists "\\" in self closed tag.', function (done) {
            var expected = '<script>document.write("<img \\/>");</script>';
            saker.compile('<script>document.write("<img \\/>");</script>').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('输出@符号。Output @.', function (done) {
            var expected = 'eshengsky@163.com';
            saker.compile('eshengsky@@163.com').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });

        it('代码块模式中的HTML空格处理。HTML Whitespace handle in block code.', function (done) {
            var expected = '<div>aaa</div>\n<div>bbb</div>';
            saker.compile('@if(true){<div>aaa</div>\n<div>bbb</div>}').call({
                layout: null
            }, function (err, actual) {
                if (err) return done(err);
                assert.equal(actual, expected);
                done();
            });
        });
    });
});
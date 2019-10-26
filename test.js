// var therooms = 'kitchen,Bedroom,Toilet,Bathroom'.split(',');
/* 
var o = therooms.toString().replace(/,/g, ', ').replace(', ' + therooms[therooms.length - 1], ', and ' + therooms[therooms.length - 1]);
console.log('it', therooms, o) */

// kitchen, Bedroom, and Toilet

// var r = 'kitchen,Bedroom,Toilet,Bathroom'.replace(/,/g, ', ').split(',').reverse().toString().replace(',', ', and').split(',').reverse().toString();

// var r = 'Kitchen,Bedroom,Toilet,Bathroom'.replace('', 'and ').split(',').reverse().toString().replace(/,/g, ', '); //.split(',').reverse().toString();
// console.log('it', r)
var s = '1572032750373Bathroom.png';
// var j = s.substring(s.lastIndexOf('.'), s.length);
var l = s.includes('chuks')
console.log( s.slice(parseInt(s).toString().length, s.lastIndexOf('.')) )

var io = '$1,105.79';
var p = "$3,445.84".replace(/[$,]+/g,"")
console.log(p, 'y')
var i = parseFloat(p)
console.log(i > 890)
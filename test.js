var therooms = 'kitchen,Bedroom,Toilet,Bathroom'.split(',');
/* 
var o = therooms.toString().replace(/,/g, ', ').replace(', ' + therooms[therooms.length - 1], ', and ' + therooms[therooms.length - 1]);
console.log('it', therooms, o) */

// kitchen, Bedroom, and Toilet

// var r = 'kitchen,Bedroom,Toilet,Bathroom'.replace(/,/g, ', ').split(',').reverse().toString().replace(',', ', and').split(',').reverse().toString();

var r = 'Kitchen,Bedroom,Toilet,Bathroom'.replace('', 'and ').split(',').reverse().toString().replace(/,/g, ', '); //.split(',').reverse().toString();
console.log('it', r)

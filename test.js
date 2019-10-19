var therooms = 'kitchen,Bedroom,Toilet,Bathroom'.split(',');

var o = therooms.toString().replace(/,/g, ', ').replace(', ' + therooms[therooms.length - 1], ', and ' + therooms[therooms.length - 1]);
console.log('it', therooms, o)


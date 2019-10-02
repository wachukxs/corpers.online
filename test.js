const arr = [1, 2, 43, 43543, 453342, 4, 4223, 76, 30, 4];

function compare(a, b){
    return a - b;
}

arr.sort(compare);
console.log(arr)
function doStuff(someNumbers) {
    var sum = 0;
    for (var i = 0; i < someNumbers.length; i++) {
        sum += someNumbers[i];
    }
    return sum;
}

var addTheseUp = [ 1, 2, 3, 4, 5 ];

total = doStuff(addTheseUp);
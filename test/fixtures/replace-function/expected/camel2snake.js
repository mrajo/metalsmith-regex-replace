function do_stuff(some_numbers) {
    var sum = 0;
    for (var i = 0; i < some_numbers.length; i++) {
        sum += some_numbers[i];
    }
    return sum;
}

var add_these_up = [ 1, 2, 3, 4, 5 ];

total = do_stuff(add_these_up);
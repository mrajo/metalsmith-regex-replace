package main
import "fmt"

func main() {
	var lower_bound, upper_bound, xor, max_xor int

	fmt.Scanf("%v %v", &lower_bound, &upper_bound)
	max_xor = 0

	for i := lower_bound; i <= upper_bound; i++ {
		for j := lower_bound; j <= upper_bound; j++ {
			xor = i ^ j
			if xor > max_xor {
				max_xor = xor
			}
		}
	}

	fmt.Println(max_xor)
}
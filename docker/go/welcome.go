package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Println("Welcome to your Go DevPod workspace!")
	fmt.Printf("Go version: %s\n", runtime.Version())
	fmt.Printf("OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
	fmt.Println()
	fmt.Println("Quick start:")
	fmt.Println("  go run welcome.go")
	fmt.Println("  go mod init myproject")
}

package main

import (
	"log"
	"net/http"

	"gopkg.in/igm/sockjs-go.v2/sockjs"
)

func main() {
	handler := sockjs.NewHandler("/echo", sockjs.DefaultOptions, echoHandler)
	log.Fatal(http.ListenAndServe(":8081", handler))
}

func echoHandler(session sockjs.Session) {
	for {
		if msg, err := session.Recv(); err == nil {
			session.Send(msg)
			continue
		}
		break
	}
}

package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/igm/pubsub"
	"gopkg.in/igm/sockjs-go.v2/sockjs"
)

func main() {
	fmt.Println("hi")
	handler := sockjs.NewHandler("/echo", sockjs.DefaultOptions, echoHandler)
	// go http.ListenAndServe(":8081")

	r := mux.NewRouter()
	// r.HandleFunc("/question/{searchTerm}", Search)
	// r.HandleFunc("/load/{dataId}", Load)

	r.PathPrefix("/ws/").Handler(Middleware(handler))
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("www")))
	http.Handle("/", r)
	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(":8001", nil))
}

func Middleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// temporary
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8001")
		// w.Header().Set("Access-Control-Allow-Credentials", "true")

		h.ServeHTTP(w, r)
	})
}

var chat pubsub.Publisher

func echoHandler(session sockjs.Session) {
	log.Println("new sockjs session established")
	var closedSession = make(chan struct{})
	chat.Publish("[info] new participant joined chat")
	defer chat.Publish("[info] participant left chat")
	go func() {
		reader, _ := chat.SubChannel(nil)
		for {
			select {
			case <-closedSession:
				return
			case msg := <-reader:
				if err := session.Send(msg.(string)); err != nil {
					return
				}
			}

		}
	}()
	for {
		if msg, err := session.Recv(); err == nil {
			chat.Publish(msg)
			continue
		}
		break
	}
	close(closedSession)
	log.Println("sockjs session closed")
}

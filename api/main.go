package main

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gorilla/mux"
)

type Chat struct {
	CreatedAt int64     `json:"created_at"`
	Question  string    `json:"question"`
	Color     string    `json:"color"`
	Messages  []Message `json:"messages"`
}

type ChatMeta struct {
	CreatedAt    int64  `json:"created_at"`
	Question     string `json:"question"`
	Color        string `json:"color"`
	MessageCount int    `json:"message_count"`
	Key          string `json:"key"`
}

type Message struct {
	Body      string `json:"body"`
	CreatedAt int64  `json:"created_at"`
	Color     string `json:"color"`
}

type Listener struct {
	ListeningTo string
	Channel     chan Message
}

var (
	GColors    []string
	GChatData  map[string]Chat
	GListeners map[int64]Listener
)

func GetMilliTime(time time.Time) int64 {
	return time.UnixNano() / 1000000
}

func main() {
	err := LoadDataFromFile()
	if err != nil {
		fmt.Println("error loading from file: %s", err)
		return
	}
	GListeners = make(map[int64]Listener)
	fmt.Println("Data loaded from file")

	// GChatData = map[string]Chat{
	// 	"hi": Chat{
	// 		time.Now(), "this is a question", []Message{
	// 			Message{
	// 				"hi", time.Now(), "Navy",
	// 			},
	// 		},
	// 	},
	// }	// go http.ListenAndServe(":8081")

	r := mux.NewRouter()
	r.HandleFunc("/chats/", GetChats).Methods("GET")
	r.HandleFunc("/chats/", CreateChat).Methods("POST")
	r.HandleFunc("/chat/{key}/", GetChat).Methods("GET")
	r.HandleFunc("/chat/{key}/", CreateMessage).Methods("POST")
	r.HandleFunc("/listen/{key}/", ChatListen)

	http.Handle("/", Middleware(r))
	fmt.Println("Serving on port 8001")

	go http.ListenAndServe(":8001", nil)

	handleInterrupt()
	// capture interrupt
}

func handleInterrupt() {
	ch := make(chan os.Signal)
	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL)
	log.Println(<-ch)
	err := WriteDataToFile()
	if err != nil {
		fmt.Println(err)
		fmt.Println("how do we handle this?")
	} else {
		fmt.Println("Data successfully saved to file")
	}
}

func LoadDataFromFile() error {
	data, err := ioutil.ReadFile("data.json")
	if err != nil {
		return err
	}
	err = json.Unmarshal(data, &GChatData)
	if err != nil {
		return err
	}
	return nil
}

func WriteDataToFile() error {
	jsonBytes, err := json.Marshal(GChatData)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile("data.json", jsonBytes, 0644)
	return err
}

func Middleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// temporary
		fmt.Println(r.URL.String())
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// w.Header().Set("Access-Control-Allow-Credentials", "true")

		h.ServeHTTP(w, r)
	})
}

func CreateChat(w http.ResponseWriter, req *http.Request) {
	question := req.FormValue("question")
	color := req.FormValue("color")

	if question == "" {
		w.WriteHeader(400)
		w.Write([]byte("params not present"))
		return
	}
	hash := sha1.New()
	io.WriteString(hash, question)
	key := hex.EncodeToString(hash.Sum(nil))[:7]
	createdAt := time.Now()

	chat := Chat{
		CreatedAt: GetMilliTime(createdAt),
		Question:  question,
		Color:     color,
	}

	if _, present := GChatData[key]; !present {
		GChatData[key] = chat
	}

	w.Write([]byte(key))
	return
}

func GetChat(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	key := vars["key"]
	chat := GChatData[key]
	if key == "" {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 not found"))
		return
	}
	jsonByte, err := json.Marshal(&chat)
	if err != nil {
		fmt.Println(err)
	}
	w.Write(jsonByte)
	return
}

func GetChats(w http.ResponseWriter, req *http.Request) {
	output := []ChatMeta{}
	for key, chat := range GChatData {
		noMessageChat := ChatMeta{
			Question:     chat.Question,
			CreatedAt:    chat.CreatedAt,
			MessageCount: len(chat.Messages),
			Key:          key,
		}
		output = append(output, noMessageChat)
	}
	jsonBytes, err := json.Marshal(&output)
	if err != nil {
		fmt.Println(err)
	}
	w.Write(jsonBytes)
}

func CreateMessage(w http.ResponseWriter, req *http.Request) {

	vars := mux.Vars(req)
	key := vars["key"]

	if key == "" {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 not found"))
		return
	}

	messageContent := req.FormValue("message")
	color := req.FormValue("color")

	// TODO validate color and content

	message := Message{
		Body:      messageContent,
		Color:     color,
		CreatedAt: GetMilliTime(time.Now()),
	}

	// ####### OFF TO THE RACE CONDITIONS #######
	data := GChatData[key]
	data.Messages = append(data.Messages, message)
	GChatData[key] = data
	// ##########################################

	for _, listener := range GListeners {
		if listener.ListeningTo == key {
			listener.Channel <- message
		}
	}

	w.Write([]byte("OK"))
	return
}

func ChatListen(w http.ResponseWriter, req *http.Request) {

	vars := mux.Vars(req)
	key := vars["key"]
	chat := GChatData[key]

	if chat.CreatedAt == 0 {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 not found"))
		return
	}

	latestString := req.FormValue("latest")
	latest, _ := strconv.ParseInt(latestString, 10, 64)

	if latest == 0 {
		latest = GetMilliTime(time.Now())
	}

	// TODO validate all the things

	var messages []Message

	fmt.Println(messages)

	// check if there are any messages this user needs
	for _, message := range GChatData[key].Messages {
		if message.CreatedAt > latest {
			messages = append(messages, message)
		}
	}
	if len(messages) == 0 {
		// no messages? wait for some
		channel := make(chan Message)
		timeNano := time.Now().UnixNano()

		GListeners[timeNano] = Listener{
			ListeningTo: key,
			Channel:     channel,
		}
		// wait for a new message
		newMessage := <-channel
		messages = append(messages, newMessage)

		delete(GListeners, timeNano)
	}

	messagesBytes, err := json.Marshal(messages)
	if err != nil {
		log.Fatal(err)
	}
	w.Write(messagesBytes)

}

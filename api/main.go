package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/igm/pubsub"
	"gopkg.in/igm/sockjs-go.v2/sockjs"
)

type Chat struct {
	CreatedAt time.Time
	Question  string
	Messages  []Message
}

type ChatMeta struct {
	CreatedAt    time.Time
	Question     string
	MessageCount int
}

type Message struct {
	Body      string
	CreatedAt time.Time
	Color     string
}

var (
	colors   []string
	chatData map[string]Chat
)

func init() {
	// colors = []string("Black", "Navy", "DarkBlue", "MediumBlue", "Blue", "DarkGreen", "Green", "Teal", "DarkCyan", "DeepSkyBlue", "DarkTurquoise", "MediumSpringGreen", "Lime", "SpringGreen", "Aqua", "Cyan", "MidnightBlue", "DodgerBlue", "LightSeaGreen", "ForestGreen", "SeaGreen", "DarkSlateGray", "LimeGreen", "MediumSeaGreen", "Turquoise", "RoyalBlue", "SteelBlue", "DarkSlateBlue", "MediumTurquoise", "Indigo", "DarkOliveGreen", "CadetBlue", "CornflowerBlue", "RebeccaPurple", "MediumAquaMarine", "DimGray", "SlateBlue", "OliveDrab", "SlateGray", "LightSlateGray", "MediumSlateBlue", "LawnGreen", "Chartreuse", "Aquamarine", "Maroon", "Purple", "Olive", "Gray", "SkyBlue", "LightSkyBlue", "BlueViolet", "DarkRed", "DarkMagenta", "SaddleBrown", "DarkSeaGreen", "LightGreen", "MediumPurple", "DarkViolet", "PaleGreen", "DarkOrchid", "YellowGreen", "Sienna", "Brown", "DarkGray", "LightBlue", "GreenYellow", "PaleTurquoise", "LightSteelBlue", "PowderBlue", "FireBrick", "DarkGoldenRod", "MediumOrchid", "RosyBrown", "DarkKhaki", "Silver", "MediumVioletRed", "IndianRed", "Peru", "Chocolate", "Tan", "LightGray", "Thistle", "Orchid", "GoldenRod", "PaleVioletRed", "Crimson", "Gainsboro", "Plum", "BurlyWood", "LightCyan", "Lavender", "DarkSalmon", "Violet", "PaleGoldenRod", "LightCoral", "Khaki", "AliceBlue", "HoneyDew", "Azure", "SandyBrown", "Wheat", "Beige", "WhiteSmoke", "MintCream", "GhostWhite", "Salmon", "AntiqueWhite", "Linen", "LightGoldenRodYellow", "OldLace", "Red", "Fuchsia", "Magenta", "DeepPink", "OrangeRed", "Tomato", "HotPink", "Coral", "DarkOrange", "LightSalmon", "Orange", "LightPink", "Pink", "Gold", "PeachPuff", "NavajoWhite", "Moccasin", "Bisque", "MistyRose", "BlanchedAlmond", "PapayaWhip", "LavenderBlush", "SeaShell", "Cornsilk", "LemonChiffon", "FloralWhite", "Snow", "Yellow", "LightYellow", "Ivory", "White")
}

func main() {
	err := LoadDataFromFile()
	if err != nil {
		fmt.Println("error loading from file: %s", err)
		return
	}
	fmt.Println("Data loaded from file")

	// chatData = map[string]Chat{
	// 	"hi": Chat{
	// 		time.Now(), "this is a question", []Message{
	// 			Message{
	// 				"hi", time.Now(), 1,
	// 			},
	// 		},
	// 	},
	// }
	handler := sockjs.NewHandler("/echo", sockjs.DefaultOptions, echoHandler)
	// go http.ListenAndServe(":8081")

	r := mux.NewRouter()
	r.HandleFunc("/chat/", GetChats).Methods("GET")
	r.HandleFunc("/chat/", CreateChat).Methods("POST")
	r.HandleFunc("/chat/{key}", GetChat).Methods("GET")

	r.PathPrefix("/ws/").Handler(Middleware(handler))
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("www")))
	http.Handle("/", r)
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
		fmt.Println("how do we handle this?")
	}
}

func LoadDataFromFile() error {
	data, err := ioutil.ReadFile("data.json")
	if err != nil {
		return err
	}
	err = json.Unmarshal(data, &chatData)
	if err != nil {
		return err
	}
	return nil
}

func WriteDataToFile() error {
	jsonBytes, err := json.Marshal(chatData)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile("data.json", jsonBytes, 0644)
	return err
}

func Middleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// temporary
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8001")
		// w.Header().Set("Access-Control-Allow-Credentials", "true")

		h.ServeHTTP(w, r)
	})
}

func CreateChat(w http.ResponseWriter, req *http.Request) {
	key := req.FormValue("key")
	question := req.FormValue("question")
	if key == "" || question == "" {
		w.WriteHeader(400)
		w.Write([]byte("params not present"))
		return
	}
	createdAt := time.Now()

	chat := Chat{
		CreatedAt: createdAt,
		Question:  question,
	}
	chatData[key] = chat

	// don't overwrite?
	w.Write([]byte("ok"))
	return
}

func GetChat(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	key := vars["key"]
	chat := chatData[key]
	if chat.Question == "" || key == "" {
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
	for _, chat := range chatData {
		noMessageChat := ChatMeta{
			Question:     chat.Question,
			CreatedAt:    chat.CreatedAt,
			MessageCount: len(chat.Messages),
		}
		output = append(output, noMessageChat)
	}
	jsonBytes, err := json.Marshal(&output)
	if err != nil {
		fmt.Println(err)
	}
	w.Write(jsonBytes)
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

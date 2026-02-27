from llm_client import ask_model

print("Welcome Ask me ! Type 'exit' to quit.")

# chat_history = []  # Initialize chat history list

while True:
    user_input = input("You: ")
    chat_history.append(user_input)
    
    if user_input.lower() in ["exit", "quit"]:
        print("Goodbye!")
        break

    response = ask_model(user_input)
    chat_history.append(response)  # response is already a string
    print("Bot:", response)
    print(chat_history)



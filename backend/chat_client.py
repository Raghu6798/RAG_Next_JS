import requests

while True:
    query = input("Enter your query: ")
    if query.lower() in ["quit", "bye", "exit"]:
        print("Exiting the chat...")
        break

    response = requests.get(f"http://127.0.0.1:8000/chat/{query}")

    # Check if the response is valid and print the status code
    if response.status_code == 200:
        try:
            # Try to parse JSON response
            data = response.json()
            print(f"Response: {data['response']}")
        except requests.exceptions.JSONDecodeError:
            # If not valid JSON, print the raw response text
            print("Failed to decode JSON response:")
            print(response.text)
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
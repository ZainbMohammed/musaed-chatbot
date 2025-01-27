
# Whatsapp ChatBot Builder

customer service chatbot application that integrates with WhatsApp and uses OpenAI's GPT-3.5-turbo model to provide automated responses to customer inquiries. The application also uses MongoDB for storing and retrieving data, and Express.js for the web server.

## Demo
You can try the demo of this website here:
<a href="https://musaed-chatbot.netlify.app/" target="_blank">Demo Link</a>

## Features

- Integrates with WhatsApp to handle customer messages
- Uses OpenAI's GPT-3.5-turbo model for generating responses
- Stores and retrieves data from MongoDB
- Provides a web interface for QR code generation and interaction

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine
- MongoDB instance running and accessible
- OpenAI API key
- WhatsApp Web client

## Installation

1. Clone the repository

   ```bash
   [git clone https://github.com/musaed2024/MusaedChatBot.git
   cd whatschatBot
   ```

2. Install the dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory by delete `Example` from `.envExample` and thain add your values:

   ```env
   MONGO_URI=your_mongo_uri
   MONGO_DB_NAME=your_db_name
   OPEN_AI_KEY=your_openai_api_key
   PORT=your_port_number
   ```

4. Run the application

   ```bash
   npm start
   ```

## Usage

1. Open your browser and go to `http://localhost:your_port_number`.
2. You will see a QR code that you need to scan with your WhatsApp app to authenticate.
3. Once authenticated, the chatbot will start listening for messages.

## Project Structure

- `index.html`: The main HTML file for the web interface.
- `server.js`: The main server file that sets up Express.js, WhatsApp Web client, and OpenAI integration.
- `src/`: Directory containing the source code for MongoDB operations and other utilities.


## License

This project is licensed under the MIT License.

---

Feel free to replace the placeholder values (e.g., `your_mongo_uri`, `your_db_name`, `your_openai_api_key`, `your_port_number`, `your-username`, etc.) with the actual values for your project.

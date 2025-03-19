# Nobot - Your AI Assistant

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Generative AI](https://img.shields.io/badge/Google%20Generative%20AI-blue?style=for-the-badge&logo=google-cloud)](https://ai.google.dev/)

## Introduction

Nobot is a web-based AI assistant powered by Google's Gemini-2.0-flash model through the Generative AI API. Built with React 19 and Vite, Nobot provides an interactive chatbot interface designed to help you with various tasks, from answering questions to generating creative content.

## Features

-   **Interactive Chatbot Interface:** Engage in natural conversations with the AI assistant.
-   **Typing Animation:** Enjoy a realistic typing effect for AI responses.
-   **Dark/Light Theme Toggle:** Customize the appearance to your preference.
-   **Message History Tracking:** Review past conversations.
-   **Expandable/Collapsible Sidebar Navigation:** Easily manage settings and features.
-   **Copy Response Functionality:** Quickly copy AI-generated text.
-   **Mobile-Responsive Design:** Access Nobot from any device.

## Demo

Try Nobot live: [https://nobot.vercel.app/](https://nobot.vercel.app/)

## Screenshots

**(Add screenshots of the Nobot interface here, showcasing the chat, theme toggle, and sidebar.)**

## Technologies Used

-   React 19
-   Vite
-   Google Generative AI API (Gemini-2.0-flash)

## Installation and Setup

1.  Clone the repository:

    ```bash
    git clone [https://github.com/niloydiu/Nobot.git](https://github.com/niloydiu/Nobot.git)
    cd Nobot
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env.local` file in the root directory and add your Google Generative AI API key (see Environment Variables section).

4.  Run the development server:

    ```bash
    npm run dev
    ```

## Environment Variables

You need a Google Generative AI API key to use Nobot.

-   `VITE_GOOGLE_API_KEY`: Your Google Generative AI API key.

Add this to your `.env.local` file:

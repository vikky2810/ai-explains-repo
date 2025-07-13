# 🧠 AI Explains This Repo

Hey! 👋  
This is a Next.js app that explains any GitHub repo for you, in plain English.  
Just paste a GitHub repo link, hit the button, and boom — you get a summary that even your grandma could understand.

## 🚀 How It Works

- **Frontend:**  
  Built with Next.js (using the App Router), Tailwind CSS for styling, and React for all the UI stuff.
- **Backend:**  
  There's a simple API route that grabs the README from the GitHub repo you give it.
- **AI Magic:**  
  The backend sends the README to Google's Gemini AI model, which spits out a short, easy-to-read explanation.


# Project Structure 

```
ai-explains-repo/
├── app/
│   ├── api/
│   │   └── explain/
│   │       └── route.ts      # API route for explaining repos
│   └── page.tsx              # Main frontend page
├── .env                      # Gemini API key (not committed)
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.js
├── tsconfig.json
├── README.md

```

## 🛠️ How To Use

1. Clone this repo:
   ```sh
   git clone https://github.com/vikky2810/ai-explains-repo.git
   cd ai-explains-this-repo
   ```
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Get a [Gemini API key](https://ai.google.dev/) and add it to your `.env` file:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```
4. Run the app:
   ```sh
   pnpm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) and paste any GitHub repo URL.  
   Wait a sec, and you'll get a summary!

## 💡 Why?

Honestly, reading through random repos can be a pain, especially if the README is super long or confusing.  
This app just makes it easier to get the gist without wasting time.

## 🤖 Tech Stack

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini API](https://ai.google.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## 🙋‍♂️ Who Made This?

Made by an engineering student who got tired of reading boring READMEs.  
Feel free to fork, star, or open issues if you wanna help out or have ideas!

## 📸 Screenshot

![Screenshot](preview.png) <!-- Add your screenshot here if you want -->

---

*Built for fun and learning. Hope it
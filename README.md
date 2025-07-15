# Megumi - A Modern Conversational AI Chat Application

Megumi is a fully functional, responsive, and visually appealing frontend for a Gemini-style conversational AI chat application. It's built with Next.js, Tailwind CSS, and Genkit, featuring a sleek neumorphic design with fluid animations. The application simulates a complete user experience from authentication to real-time chat with an AI.

**Live Demo URL:** https://megumi-lake.vercel.app/

## 📸 Screenshots

## ✨ Features

- **Simulated OTP Authentication:** Secure login flow with country code selection from an external API.
- **Chatroom Management:** Create, delete, and search chatrooms with instant feedback.
- **Dynamic Chat Interface:**
    - Real-time messaging with a simulated AI.
    - Support for **image uploads** with previews.
    - AI **typing indicator** with a modern shimmer effect.
    - Human-readable timestamps (e.g., "5 minutes ago").
    - **Copy-to-clipboard** functionality on message hover.
- **Efficient Scrolling:**
    - Auto-scroll to the latest message.
    - **Reverse infinite scroll** to efficiently load older messages on demand.
- **Modern UX/UI:**
    - Fully **responsive design** for seamless use on desktop and mobile.
    - A stunning **neumorphic design** with smooth animations and transitions.
    - A beautiful animated gradient for headings.
    - **Dark mode** toggle for user comfort.
    - **Debounced search** for instant chatroom filtering.
- **Client-Side Persistence:** Chat history and user authentication state are saved in `localStorage`.
- **User Feedback:** Toast notifications for important actions like login, chat creation, and errors.


## 🛠️ Tech Stack

- **Framework:** **Next.js 15** (with App Router)
- **Generative AI:** **Google AI & Genkit**
- **Styling:** **Tailwind CSS** with `tailwindcss-animate`
- **UI Components:** **ShadCN UI**
- **Form Management:** **React Hook Form** & **Zod** for robust validation
- **Icons:** **Lucide React**
- **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) & `localStorage` API


## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
   
3. **Set up Environment Variables:**
   Create a `.env` file in the root of the project and add your Google AI API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:9002`.

## 📁 Project Structure
The project follows a standard Next.js App Router structure, with a clear separation of concerns.
The project follows a standard Next.js App Router structure, with a clear separation of concerns.

```
.
├── src
│   ├── app
│   │   ├── chat
│   │   │   ├── [id]
│   │   │   │   └── page.tsx      # Individual chatroom UI
│   │   │   ├── layout.tsx        # Sidebar and main chat layout
│   │   │   └── page.tsx          # Welcome screen for the chat dashboard
│   │   ├── globals.css           # Global styles, Tailwind directives, and neumorphic theme
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Login page
│   ├── ai
│   │   ├── flows
│   │   │   └── chat.ts           # Genkit AI flow for handling chat logic
│   │   └── genkit.ts             # Genkit configuration
│   ├── components
│   │   ├── ui                    # Reusable UI components from ShadCN
│   │   ├── theme-provider.tsx    # Handles theme switching (light/dark)
│   │   └── theme-toggle.tsx      # The actual theme toggle button
│   ├── hooks
│   │   └── use-toast.ts          # Custom hook for managing toast notifications
│   └── lib
│       ├── types.ts              # TypeScript interfaces for data models (Message, Chatroom)
│       └── utils.ts              # Utility functions (e.g., cn for Tailwind classes)
├── public/                     # Static assets
└── tailwind.config.ts          # Tailwind CSS configuration
```

## 🧠 Core Feature Implementation

### Form Validation (Login Page)

- **React Hook Form** is used for managing form state, submission, and validation.
- **Zod** defines the validation schemas (`phoneSchema` and `otpSchema`) to ensure data integrity (e.g., required fields, minimum length).
- The `zodResolver` connects Zod schemas with React Hook Form, providing seamless validation.

### AI Message Throttling & Typing Indicator

- In `src/app/chat/[id]/page.tsx`, when a user sends a message, the `isTyping` state is set to `true`.
- This state triggers the rendering of a "typing" component, which uses **Skeleton** elements with a **CSS shimmer animation** to create a dynamic loading effect.
- A `setTimeout` with a randomized delay is used in `handleSendMessage` to simulate the AI's "thinking" time before a response is fetched from the Genkit flow. This creates a more natural, less robotic conversational pace.

### Reverse Infinite Scroll & Pagination

- The chat view (`src/app/chat/[id]/page.tsx`) only displays a subset of messages initially (`MESSAGES_PER_PAGE = 20`).
- The `onScroll` handler on the `ScrollArea` component detects when the user scrolls to the very top.
- When the top is reached and more messages are available (`hasMoreMessages`), the `page` state is incremented.
- This triggers a re-calculation of the `displayedMessages` array, slicing a larger portion from the `allMessages` array, effectively "loading" the previous page of messages.
- The scroll position is then adjusted to prevent it from jumping to the top, creating a smooth, seamless infinite scroll experience.

### Neumorphic Design & Animations

- The core styling is defined in `src/app/globals.css`. It uses CSS variables for colors, shadows, and border-radius to create the neumorphic effect.
- Custom shadow variables (`--shadow-light`, `--shadow-dark`, `--shadow-inset-light`, etc.) are defined for both light and dark themes.
- Utility classes like `.neumorphic-out` and `.neumorphic-in` apply these styles to components.
- CSS keyframe animations (`float`, `fade-in-up`, `gradient-text`, `shimmer`) are defined and applied via utility classes to add life to UI elements like icons, cards, and headings.
```
# **App Name**: Kuvaka Chat

## Core Features:

- OTP Authentication: Simulate OTP-based login/signup using country codes fetched from restcountries.com with React Hook Form + Zod validation and setTimeout simulation for OTP send and validation.
- Chatroom Management: Display a dashboard with a list of user's chatrooms and features to create/delete chatrooms, with toast notifications for confirmation.
- Chat Interface: Implement a chat UI with user and simulated AI messages, timestamps, typing indicator, auto-scroll, reverse infinite scroll (using dummy data with client-side pagination), and support for image upload.
- Simulated AI Responses: Simulate AI message responses after a delay, employing setTimeout to throttle Gemini responses.
- Copy to Clipboard: Enable users to copy messages to the clipboard on hover.
- Global UX Enhancements: Implement a debounced search bar to filter chatrooms by title and incorporate a dark mode toggle.
- Data Persistence & Loading States: Persist authentication and chat data using localStorage and provide loading skeletons for chat messages.

## Style Guidelines:

- Primary color: Deep violet (#673AB7) to evoke a sense of trust and sophistication.
- Background color: Light gray (#F5F5F5) to ensure readability and a clean aesthetic.
- Accent color: Electric purple (#D020FF) for highlighting interactive elements.
- Body and headline font: 'Inter' (sans-serif) for a modern and neutral feel, suitable for both headlines and body text.
- Use minimalist icons from a library like Remix Icon to maintain a clean and modern look.
- Mobile-first responsive design implemented with Tailwind CSS grid and flexbox for adaptable layouts on all devices.
- Subtle CSS transitions for interactive elements and loading skeletons for content placeholders, creating a smooth user experience.
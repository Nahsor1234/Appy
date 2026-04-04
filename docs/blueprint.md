# **App Name**: VibeSync

## Core Features:

- AI-Powered Mood-to-Songlist Generator: Utilize the Google Generative AI SDK (Gemini) as a tool to convert a user's text mood (e.g., 'Chill evening in Motihari') into a structured JSON list of 10 songs (Title + Artist).
- Google OAuth2 User Authentication: Implement the Google OAuth2 login flow to securely authenticate users, enabling access to YouTube API functionalities.
- YouTube Video Search and Matching: Functionality to search for relevant YouTube Video IDs based on the titles and artists from the Gemini-generated song list.
- Private YouTube Playlist Management: Create a new private YouTube playlist for the authenticated user and batch-add all found YouTube videos using the YouTube Data API v3.
- Central Mood Input UI: A prominent, central mood input field designed with ultra-rounded corners and a glowing focus state for intuitive user interaction.
- Dynamic Song List Display: Display the AI-generated song list to the user, with each item featuring smooth, staggered entrance animations using 'framer-motion'.
- Progress and Loading Feedback: Show a 'Crafting your Vibe...' overlay with a custom progress bar during AI processing and API calls, along with a loading spinner on the 'Export to YouTube' Floating Action Button (FAB).

## Style Guidelines:

- Color Palette based on 'Material You' adaptability and dynamic 'VibeSync' concept: A light scheme is chosen to allow vibrant accents to stand out against a clean background. Primary color: A rich, muted purple (#6600CC) chosen for its tranquil yet subtly energetic quality, allowing it to adapt to varying 'moods' or 'vibes'. Background color: A very light, desaturated lavender (#ECE6F2), visibly of the same hue as the primary but bright and understated. Accent color: A vibrant, clear blue-purple (#5C5CF5), analogous to the primary but designed for high contrast and to emphasize interactive elements and 'glowing' states.
- Headline and Body text font: 'Inter' (sans-serif), for a modern, objective, and neutral aesthetic that complements the 'Material You' design principles and maintains excellent readability.
- Use modern, minimalist, and action-oriented icons, utilizing the included 'lucide-react' library, particularly for actions like 'Export to YouTube'.
- Aesthetic follows 'Material You' with a Glassmorphism effect. All interactive UI components like cards and buttons will feature ultra-rounded corners (32px). The 'Mood Input' will be centrally located, and a Floating Action Button (FAB) will be used for key actions like 'Export to YouTube'.
- Dynamic, animated gradient background that subtly shifts colors to reflect the 'mood'. Use 'framer-motion' for smooth entrance animations, specifically a staggered effect for song list items. Implement a glowing focus state for the central 'Mood Input'. Visual feedback during loading will include a 'Crafting your Vibe...' overlay with a custom progress bar and a loading spinner integrated into the FAB.
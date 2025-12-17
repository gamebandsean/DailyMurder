# 🔪 Daily Murder

A daily mystery puzzle game built with React Native and Expo. Play as a detective solving a new murder case every day!

## 🎮 How to Play

1. **Examine the Crime Scene** - A victim lies dead, and four suspects are at the scene
2. **Interrogate Suspects** - Tap any suspect to question them about the crime, their alibis, relationships, and more
3. **Gather Clues** - Pay attention to alibis, motives, and items each suspect carries
4. **Make an Arrest** - When you're confident, arrest the killer. Choose wisely - you only get one chance!

## 🔍 Game Mechanics

- **Daily Cases**: Each day generates a unique murder mystery based on the date
- **Dynamic Relationships**: Suspects have complex relationships with each other and the victim
- **Alibis Matter**: At least two suspects have solid alibis; the killer has none
- **The Murder Weapon**: All suspects carry items that could be weapons, but only the killer has THE murder weapon
- **Honest Answers**: Suspects cannot lie about facts—except when asked if they committed the murder

## 📱 Screenshots

*Coming soon*

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on your phone

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/DailyMurder.git

# Navigate to the project
cd DailyMurder

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal  
- **Physical Device**: Scan the QR code with Expo Go app

## 🖼️ Adding Character Assets

Place your character images in `/assets/characters/`:

- `suspect1.png` - First suspect
- `suspect2.png` - Second suspect
- `suspect3.png` - Third suspect
- `suspect4.png` - Fourth suspect
- `suspect5.png` - Fifth suspect
- `victim.png` - The victim

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tooling
- **TypeScript** - Type safety
- **Context API** - State management

## 📁 Project Structure

```
DailyMurder/
├── App.tsx                 # Main app component with navigation
├── src/
│   ├── components/         # Reusable UI components
│   │   └── InterrogationModal.tsx
│   ├── context/            # React Context for state management
│   │   └── GameContext.tsx
│   ├── data/               # Game data (suspects)
│   │   └── suspects.ts
│   ├── screens/            # App screens
│   │   ├── GameScreen.tsx
│   │   ├── AccusationScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── utils/              # Utility functions
│       ├── storyGenerator.ts
│       └── characterResponses.ts
└── assets/
    └── characters/         # Character images
```

## 🎨 Design

The game features a classy noir aesthetic with:
- Deep brown color palette
- Warm gold accents
- Elegant typography
- Atmospheric UI elements

## 📄 License

MIT License - feel free to use this project for learning or build upon it!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

---

*Made with ☕ and curiosity*


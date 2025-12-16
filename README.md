# Let's Decide Together | みんなで決めよう

A multilingual voting and discussion platform where users can share decisions they're struggling with and receive feedback through votes and comments from the community.

## 🌟 Features

- **Multilingual Support**: Switch between English and Japanese seamlessly
- **Anonymous Voting**: No registration required - participate freely
- **Discussion System**: Comment on posts and support specific options
- **Results & Summary**: View voting results with automatic discussion summaries grouped by option
- **Poll Management**: Authors can close polls when a decision is made
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Dark Mode**: Automatic dark mode support based on system preferences

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Storage**: JSON file system
- **i18n**: Built-in Next.js internationalization

## 📁 Project Structure

```
├── app/
│   ├── [locale]/              # Localized pages
│   │   ├── page.tsx          # Home page
│   │   ├── create/           # Create post page
│   │   ├── post/[id]/        # Post detail page
│   │   └── layout.tsx        # Locale layout
│   ├── api/                  # API routes
│   │   ├── posts/            # Post CRUD
│   │   ├── vote/             # Voting endpoint
│   │   └── comments/         # Comments endpoint
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── LanguageSwitcher.tsx
│   ├── TabNavigation.tsx
│   ├── ResultsSection.tsx
│   ├── VotingSection.tsx
│   ├── CommentSection.tsx
│   └── PostCard.tsx
├── lib/                      # Utility functions
│   ├── data.ts              # Data operations
│   ├── i18n.ts              # Internationalization helpers
│   └── results.ts           # Results calculation
├── locales/                 # Translation files
│   ├── en.json
│   └── ja.json
├── types/                   # TypeScript types
│   └── index.ts
├── data/                    # Data storage
│   └── posts.json
├── middleware.ts            # i18n middleware
└── i18n.config.ts          # i18n configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

The app will automatically detect your browser's language and redirect you to either `/en` or `/ja`.

## 📖 Usage

### Creating a Post

1. Click the "Create Post" button
2. Enter a title for your decision
3. Describe your situation in detail
4. Add 2-10 options to choose from
5. Submit the post

You'll receive an author token (stored in localStorage) that allows you to close the poll later.

### Voting

1. Browse posts on the home page
2. Click on a post to view details
3. Click on your preferred option to vote
4. Your vote is recorded (one vote per browser)

### Commenting

1. On a post detail page, go to the "Vote & Discussion" tab
2. Write your comment
3. Optionally select which option you support
4. Submit the comment

### Viewing Results

1. Click the "Results & Summary" tab on any post
2. See voting percentages with visual progress bars
3. View discussion summary grouped by supported options
4. See which option has the most votes

### Closing a Poll

If you're the post author:
1. Open your post
2. Click the "Close Poll" button
3. Confirm the action
4. The poll will be marked as closed and voting will stop

## 🌍 Language Switching

Click the language switcher in the header to toggle between:
- 🇯🇵 Japanese (日本語)
- 🇬🇧 English

The language preference is reflected in the URL (`/ja/...` or `/en/...`).

## 💾 Data Storage

Posts are stored in `data/posts.json`. The file is automatically created if it doesn't exist.

**Important**: For production use, consider implementing:
- A proper database (PostgreSQL, MongoDB, etc.)
- File locking mechanisms for concurrent writes
- Data backup strategies

## 🎨 Customization

### Tailwind Configuration

Edit `tailwind.config.ts` to customize colors, fonts, and other design tokens.

### Translations

Add or modify translations in:
- `locales/en.json` for English
- `locales/ja.json` for Japanese

### Add More Languages

1. Add a new locale file (e.g., `locales/fr.json`)
2. Update `i18n.config.ts` to include the new locale
3. Update the language switcher component

## 🔒 Security Considerations

- **Author Tokens**: Stored in localStorage, not cryptographically secure
- **Vote Prevention**: Basic localStorage check, can be circumvented
- **Rate Limiting**: Not implemented - add for production
- **Input Validation**: Basic validation in place, enhance for production

## 📝 License

This project is open source and available for modification and use.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📧 Support

For questions or issues, please open an issue in the repository.

---

Built with ❤️ using Next.js and Tailwind CSS


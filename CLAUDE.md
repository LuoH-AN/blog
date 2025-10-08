# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3-based personal blog called "落憾" (Luoh Blog). It's a Chinese-language blog that supports traditional posts, moments (short updates), and various content types including poetry and music scores.

## Key Development Commands

### Development
- `pnpm dev` - Start development server without QR code
- `pnpm build` - Build for production (suppresses deprecation warnings)
- `pnpm generate` - Generate static site
- `pnpm preview` - Preview production build

### Content Management
- `pnpm new` - Create new blog post using script at `scripts/new-blog.ts`
- `pnpm check:feed` - Check RSS feed using script at `scripts/framework/get-feed.ts`
- `pnpm check:feed/all` - Check all feeds using script at `scripts/framework/check-all-feeds.ts`
- `pnpm init-moment` - Initialize moments using script at `scripts/init-moment.js`

### Code Quality
- `pnpm lint` - Lint Vue and SCSS files
- `pnpm lint:fix` - Fix linting issues automatically

### Maintenance
- `pnpm clean` - Clean cache and .data directory
- `pnpm prepare` - Clean and rebuild packages

## Architecture

### Core Structure
- **Framework**: Nuxt 3 with TypeScript
- **Content**: Uses @nuxt/content with SQLite for content management
- **Styling**: SCSS with global variables in `/assets/css/_variable.scss`
- **Package Manager**: pnpm (v10.17.1)

### Key Directories
- `app/` - Main application code
  - `components/` - Vue components organized by function
    - `content/` - Content-related components (Prose, Card, etc.)
    - `partial/` - Reusable UI components (prefixed with 'Z')
    - `popover/` - Popover/dropdown components
    - `post/` - Blog post specific components
    - `widget/` - Sidebar and widget components
  - `pages/` - File-based routing (pages without .vue prefix)
  - `types/` - TypeScript type definitions
- `content/` - Blog content in Markdown format
  - `posts/` - Blog posts organized by year
- `server/` - Server-side API routes and utilities
  - `api/` - API endpoints (login, moments, stats)
  - `utils/` - Server utilities (R2 storage, etc.)
  - `routes/` - Custom routes for XML feeds

### Configuration Files
- `blog.config.ts` - Main blog configuration (title, author, features)
- `nuxt.config.ts` - Nuxt configuration with modules and routing rules
- `redirects.json` - URL redirect mappings

### Content Features
- **Posts**: Traditional blog posts with frontmatter
- **Moments**: Short updates (Twitter-like posts)
- **Feeds**: RSS/Atom feed generation
- **Comments**: Twikoo integration
- **Search**: MiniSearch integration
- **Analytics**: Custom Umami and Cloudflare Insights

### Custom Components

#### Layout Components (Z-prefixed, globally registered)
- **ZPanel** (`ZPanel.vue`) - Main layout panel with sidebar/aside controls and keyboard shortcuts
- **ZWidget** (`ZWidget.vue`) - Widget container component
- **ZSidebar** (`ZSidebar.vue`) - Sidebar layout component
- **ZAside** (`ZAside.vue`) - Aside layout component
- **ZFooter** (`ZFooter.vue`) - Footer component
- **ZPopover** (`ZPopover.vue`) - Popover/dropdown wrapper component

#### Post Components
- **PostHeader** (`post/PostHeader.vue`) - Blog post header with metadata, categories, and sharing
- **PostFooter** (`post/PostFooter.vue`) - Blog post footer with navigation and tags
- **PostSurround** (`post/PostSurround.vue`) - Previous/next post navigation
- **Comment** (`post/Comment.vue`) - Comment integration component (Twikoo)
- **Excerpt** (`post/Excerpt.vue`) - Post excerpt/card for list views
- **Slide** (`post/Slide.vue`) - Post slide/carousel component

#### Partial Components (Reusable UI)
- **SearchItem** (`partial/SearchItem.vue`) - Search result item display
- **Archive** (`partial/Archive.vue`) - Archive listing component
- **Expand** (`partial/Expand.vue`) - Expandable content wrapper
- **IconNavList** (`partial/IconNavList.vue`) - Icon-based navigation list
- **RawImg** (`partial/RawImg.vue`) - Raw image component with optimization
- **OrderToggle** (`partial/OrderToggle.vue`) - Order toggle control
- **Pagination** (`partial/Pagination.vue`) - Pagination navigation
- **Error** (`partial/Error.vue`) - Error page/notice component
- **Article** (`partial/Article.vue`) - Article wrapper component
- **Button** (`partial/Button.vue`) - Custom button component
- **RawLink** (`partial/RawLink.vue`) - Raw link component
- **Dropdown** (`partial/Dropdown.vue`) - Dropdown menu component
- **DlGroup** (`partial/DlGroup.vue`) - Definition list group component

#### Widget Components
- **Toc** (`widget/Toc.vue`) - Table of contents widget
- **GithubCard** (`widget/GithubCard.vue`) - GitHub stats/activity card
- **BlogTech** (`widget/BlogTech.vue`) - Blog tech stack display
- **Poetry** (`widget/Poetry.vue`) - Poetry display widget
- **BlogStats** (`widget/BlogStats.vue`) - Blog statistics widget
- **Empty** (`widget/Empty.vue`) - Empty state component
- **BlogLog** (`widget/BlogLog.vue`) - Blog changelog/activity log

#### Content Components (Markdown enhancements)
- **Pic** (`content/Pic.vue`) - Enhanced image component with captions
- **Badge** (`content/Badge.vue`) - Badge/label component
- **Tab** (`content/Tab.vue`) - Tab container component
- **ProseA** (`content/ProseA.vue`) - Custom prose link styling
- **MdTitle** (`content/MdTitle.vue`) - Markdown title component
- **Alert** (`content/Alert.vue`) - Alert/notification component
- **MusicScore** (`content/MusicScore.vue`) - Music score rendering with ABCJS
- **LinkBanner** (`content/LinkBanner.vue`) - Link banner component
- **Chat** (`content/Chat.vue`) - Chat/message component
- **Timeline** (`content/Timeline.vue`) - Timeline display component
- **ProsePre** (`content/ProsePre.vue`) - Custom code block styling
- **Key** (`content/Key.vue`) - Keyboard key component
- **VideoEmbed** (`content/VideoEmbed.vue`) - Video embedding component
- **Copy** (`content/Copy.vue`) - Copy to clipboard functionality
- **Poetry** (`content/Poetry.vue`) - Poetry formatting component
- **Tip** (`content/Tip.vue`) - Tip/callout component
- **Folding** (`content/Folding.vue`) - Collapsible content component
- **EmojiClock** (`content/EmojiClock.vue`) - Emoji clock component
- **Blur** (`content/Blur.vue`) - Blur effect component
- **CardList** (`content/CardList.vue`) - Card list display
- **FeedGroup** (`content/FeedGroup.vue`) - Feed grouping component
- **ProseTable** (`content/ProseTable.vue`) - Custom table styling
- **LinkCard** (`content/LinkCard.vue`) - Link card component
- **Quote** (`content/Quote.vue`) - Quote component
- **FeedCard** (`content/FeedCard.vue`) - Feed card display
- **ProseCode** (`content/ProseCode.vue`) - Inline code styling

#### Popover Components
- **Search** (`popover/Search.vue`) - Search popover interface
- **Lightbox** (`popover/Lightbox.vue`) - Image lightbox viewer

#### Other Components
- **ThemeToggle** (`ThemeToggle.vue`) - Theme switching (dark/light mode)
- **SkipToContent** (`SkipToContent.vue`) - Accessibility skip link
- **ZhiluHeader** (`zhilu/ZhiluHeader.vue`) - Zhilu-specific header component

### Module Integrations
- **@nuxt/content**: Content management with SQLite
- **@nuxtjs/seo**: SEO optimization
- **@nuxt/icon**: Icon management with custom collections
- **@pinia/nuxt**: State management
- **@vueuse/nuxt**: Vue composables

## Development Notes

### Content Creation
- Use `pnpm new` to create new blog posts (generates proper frontmatter)
- Blog posts are stored in `content/posts/YYYY/` directories
- Supports custom permalinks and abbrevlinks
- Frontmatter includes categories, tags, dates, and metadata

### Component Prefixes
- `Z` prefix for partial components (globally registered)
- `Zhilu` prefix for zhilu-specific components (globally registered)
- Regular components are auto-imported

### Custom Features
- Music score rendering with ABCJS
- Poetry support with special formatting
- Math support with KaTeX
- Code highlighting with Shiki
- Image optimization with multiple formats
- Custom font loading (Inter, JetBrains Mono, Noto fonts, MiSans)

### Dark Mode Implementation
- **CSS Variables System**: Uses CSS custom properties defined in `/assets/css/color.scss`
- **Theme Switching**: Dark mode is activated by adding `.dark` class to the root element
- **Automatic Adaptation**: Components automatically adapt to dark mode by using CSS variables instead of hardcoded colors
- **Key Variables**:
  - Text colors: `--c-text`, `--c-text-1`, `--c-text-2`, `--c-text-3`
  - Background colors: `--c-bg`, `--c-bg-1`, `--c-bg-2`, `--c-bg-3`
  - Border color: `--c-border`
  - Primary color: `--c-primary`
  - Soft background: `--c-bg-soft`, `--c-primary-soft`
- **Implementation Rules**:
  1. Always use CSS variables instead of hardcoded colors
  2. Do NOT use `.dark &` nested selectors - the variables automatically change when `.dark` class is added
  3. Replace hardcoded colors with corresponding variables:
     - `#fff`, `white` → `var(--c-bg)`
     - `#000`, `black` → `var(--c-text)`
     - `lightgray`, `#ccc` → `var(--c-border)`
     - Blue colors (`#409EFF`, `#007BFF`) → `var(--c-primary)`
     - Light backgrounds (`#f5f5f5`, `#E3E3E3`) → `var(--c-bg-1)`, `var(--c-bg-2)`
     - Text grays (`#555`, `#666`) → `var(--c-text-1)`, `var(--c-text-2)`
  4. For gradients, use variables like: `linear-gradient(to right, var(--c-text-3) / 30%, var(--c-text-3) / 30%)`
  5. Test both light and dark themes when styling components

### Route Rules
- Custom redirects defined in `redirects.json`
- Static generation for RSS feeds and API endpoints
- Hidden `/posts` prefix in URLs (configurable via `hidePostPrefix`)

### Environment Specifics
- Supports deployment on various platforms (references to EdgeOne, Tencent Cloud)
- R2 storage integration for media files
- Build-time environment variables for analytics and services

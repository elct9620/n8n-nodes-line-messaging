# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package for LINE Messaging API integration. It consists of three main nodes:

- **LineMessaging** (`nodes/LineMessaging/`): Main node for sending messages and getting user profiles
- **LineMessagingData** (`nodes/LineMessagingData/`): Node for retrieving content (images, videos, audio, files) from messages
- **LineMessagingTrigger** (`nodes/LineMessaging/LineMessagingTrigger.node.ts`): Webhook trigger for receiving LINE events

## Development Commands

```bash
# Build the project (compile TypeScript and copy icons)
pnpm build

# Development mode with TypeScript watch
pnpm dev

# Code formatting
pnpm format

# Linting
pnpm lint
pnpm lintfix

# Pre-publish (build + lint with stricter rules)
pnpm prepublish
```

## Architecture

### Node Structure

Each node follows n8n's standard structure:

- `*.node.ts`: Main node implementation with INodeType interface
- `*.node.json`: Node metadata (currently unused but follows convention)
- `actions/`: Individual operations broken into separate files
- `GenericFunctions.ts`: Shared API utility functions

### Key Files

- `credentials/LineMessagingApi.credentials.ts`: Credential type definition requiring Channel Access Token and Channel Secret
- `gulpfile.js`: Handles copying SVG icons to dist folder during build
- Build output goes to `dist/` directory which is the published package

### Operation Pattern

Operations are structured as separate modules in `actions/` folders:

- Each operation exports a `description` array (INodeProperties) for UI configuration
- Each operation exports an `execute` function that handles the API logic
- Main node files import and reference these operations

### API Integration

- Uses LINE Messaging API (https://api.line.me/v2/bot)
- Authentication via Bearer token (Channel Access Token)
- No external dependencies - built using only n8n-workflow types and Node.js built-ins
- API calls implemented in GenericFunctions.ts modules

## Linting Rules

The project uses strict n8n-specific ESLint rules via `eslint-plugin-n8n-nodes-base` with separate configurations for:

- Package.json validation
- Credential type validation
- Node implementation validation

Key rule categories:

- Node parameter naming and description conventions
- Credential field requirements
- File naming conventions
- TypeScript type assertions for n8n interfaces

## TypeScript Configuration

- Target: ES2021
- Strict mode enabled with comprehensive type checking
- Includes n8n-workflow types
- Outputs to `dist/` with declarations and source maps
- Covers credentials, nodes, and package.json files

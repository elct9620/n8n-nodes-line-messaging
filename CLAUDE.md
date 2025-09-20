# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package for LINE Messaging API integration. It consists of three main nodes:

- **LineMessaging** (`nodes/LineMessaging/`): Main node for messaging (reply/send/multicast) and user profiles
- **LineMessagingData** (`nodes/LineMessaging/LineMessagingData.node.ts`): Node for retrieving content (images, videos, audio, files) from messages
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
pnpm prepublishOnly
```

## Code Quality Workflow

**IMPORTANT**: Always verify code quality before committing changes:

1. **Format code**: Run `pnpm format` to ensure Prettier formatting
2. **Lint code**: Run `pnpm lint` to verify ESLint rules compliance
3. **Build verification**: Run `pnpm build` to confirm TypeScript compilation
4. **Fix issues**: Address any formatting or linting errors before committing

This ensures all contributions maintain project standards and follow n8n community node conventions.

## Release Management

### Manual Version Bumping

To manually trigger a specific version release with release-please:

```bash
# Create a commit with the desired version
git commit --allow-empty -m "chore: release X.Y.Z

Release-As: X.Y.Z"
```

**Example:**
```bash
git commit --allow-empty -m "chore: release 0.6.1

Release-As: 0.6.1"
```

This pattern tells release-please to create a release with the specified version number, overriding its automatic version calculation based on conventional commits.

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

- **Main API**: `https://api.line.me/v2/bot` - messaging operations
- **Data API**: `https://api-data.line.me/v2/bot` - content retrieval
- **Authentication**: Uses n8n's `httpRequestWithAuthentication` with Bearer token
- **Signature Verification**: HMAC-SHA256 validation for webhooks in `GenericFunctions.ts`
- **No external dependencies** - built using only n8n-workflow types and Node.js built-ins

### Available Operations

**LineMessaging Node:**
- **Reply**: Respond to user messages using reply tokens (POST /message/reply)
- **Send**: Proactively send messages to users using User IDs (POST /message/push)
- **Multicast**: Send messages to multiple users simultaneously (POST /message/multicast, max 500 recipients)
- **Get Profile**: Retrieve user profile information (GET /profile/{userId})

- **Get Content**: Retrieve message content like images, videos, audio files (now located in LineMessaging directory)

**LineMessagingTrigger Node:**
- **Webhook**: Receive and process LINE webhook events

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

## Message Factory Pattern

The `MessageFactory` class (`nodes/LineMessaging/shared/MessageFactory.ts`) handles message creation:

- **TextV2 messages**: Supports quote tokens and quick replies
- **Quick Reply actions**: Postback and message action types
- **Extensible design**: Easy to add new message types
- Converts n8n UI parameters to LINE API format

## Error Handling Pattern

- Use `NodeOperationError` for all operation failures
- Support `continueOnFail()` mode for error tolerance
- Proper item pairing in execute functions for workflow consistency
- Return descriptive error messages with context

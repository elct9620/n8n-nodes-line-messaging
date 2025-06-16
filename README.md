# n8n-nodes-line-messaging

This is an n8n community node. It lets you use LINE Messaging API in your n8n workflows.

LINE Messaging API enables developers to build chatbots and integrate messaging features into their services with the LINE platform, which is especially popular in Japan, Thailand, Taiwan, and other parts of Asia.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm install @aotoki/n8n-nodes-line-messaging
```

## Operations

This node provides the following operations:

### Line Messaging Node
- **Reply**: Reply to a user's message using the replyToken

### Line Messaging Data Node
- **Get Content**: Retrieve content (images, videos, audio, files) from message IDs

### Line Messaging Trigger Node
- **Webhook**: Receive events from LINE Messaging API

## Credentials

You need to set up a LINE Bot channel in the [LINE Developers Console](https://developers.line.biz/console/) before using this node.

1. Create a new provider and channel in the LINE Developers Console
2. Enable the Messaging API option
3. Get your Channel Secret and Channel Access Token from the Basic Settings and Messaging API tabs
4. Use these credentials when setting up the node in n8n

## Compatibility

- Requires n8n version 1.0.0 or later
- Built without external dependencies to comply with n8n verified node requirements

## Usage

### Setting up a LINE Bot Webhook

1. Create a workflow with the LINE Messaging Trigger node
2. Configure the node to listen for the events you're interested in
3. Copy the webhook URL from the trigger node
4. Set this URL as your webhook URL in the LINE Developers Console
5. Add a verification step in your workflow to validate the signature using the Channel Secret

### Responding to Messages

1. When a message is received, your workflow will be triggered
2. You can access the `replyToken` from the trigger output
3. Use the LINE Messaging node with the "Reply" operation to send a response
4. Set the reply token and add the messages you want to send

### Retrieving Media Content

1. When a media message (image, video, audio, file) is received, you get a message ID
2. Use the LINE Messaging Data node with the "Get Content" operation
3. Provide the message ID to download the content as binary data
4. The content can then be processed, saved, or sent to other services

### Example: Simple Echo Bot

This example workflow receives messages and echoes them back to the user:

1. Add a LINE Messaging Trigger node and configure it to listen for "message" events
2. Add a LINE Messaging node configured to "Reply"
3. Set the "Reply Token" field to use the replyToken from the trigger output: `{{$json.replyToken}}`
4. Add a text message with the content: `You said: {{$json.message.text}}`

## Limitations

- Currently, only simple text messages are supported for sending due to n8n's UI limitations with complex JSON schemas
- Media content retrieval is fully supported for images, videos, audio files, and other content types
- This node is written without external dependencies to meet n8n verified node requirements

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [LINE Messaging API documentation](https://developers.line.biz/en/docs/messaging-api/)
* [LINE Bot Designer](https://developers.line.biz/en/services/bot-designer/)

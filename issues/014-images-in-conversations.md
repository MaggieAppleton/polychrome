# Images in conversations

Status: idea

Images need to work both ways in a conversation:

- **From me:** paste an image into the composer, or attach one.
- **From agents:** show images inline in their messages: mock-ups, screenshots, design references they found, images I generated elsewhere.

Remote image URLs in agent Markdown stay blocked. A prompt-injected agent could use them to leak the thread (slice-1 security review). That's fine, as long as images travel as attachments instead.

Fractal already has the pieces: `message.send` takes `attachments` (uploaded blobs), the send grant includes `attachment_upload` under `control.messages`, and timeline messages carry `attachments`. fractal-web's `attachmentPort.ts` shows the upload flow.

Open questions: how an agent attaches an image it found on the web (download it, then send it as an attachment?), and size limits.

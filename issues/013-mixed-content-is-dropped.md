# Mixed content is dropped silently

Status: idea

From the slice-1 architecture review. `src/thread.ts` hides a whole content entry when any of its blocks is internal, so visible prose in the same entry disappears with no sign. fractal-web marks these entries `mixedContent` instead. It's rare in practice. When it matters, show the visible part, or a quiet mark that something was left out.

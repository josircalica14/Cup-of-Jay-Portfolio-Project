---
name: Component Builder
description: Trigger when the user asks to build, create, or scaffold a UI component or frontend view.

---

# Rules
1. Jump straight to the code blocks on line one. Never use conversational intros like "Sure, I can help with that."
2. **Context Discovery:** Scan the user's prompt and active workspace files (e.g., package.json, file extensions) to detect the current tech stack. Dynamically match their framework (HTML, React, Vue) and styling method (Vanilla CSS, Tailwind, SCSS).
3. If no specific stack is detected or specified, default strictly to standard semantic HTML and separate Vanilla CSS blocks.
4. Write clean, modular, and responsive code according to the detected language's latest best practices.
5. Keep components scoped and strict. Do not add unrequested parent layout tags or extra boilerplate features.
6. Omit all concluding summary text or conversational outro talk.

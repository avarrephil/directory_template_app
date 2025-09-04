# AI-Updated V1 Spec

Your goal is to build a SaaS web app that helps users repurpose content from one social media platform to another.

- Use Next.js, TypeScript, Tailwind CSS, and App Router.
- Use Next.js app router when creating new screens.
- Do not use 'src' directory.
- ALWAYS show the proposed directory structure including all new files that must be created.
- ALWAYS show directory structure first.
- For each step in your plan, specify the filename and path to the file.
- For next.js components that require client side state, use 'use client'
- Tailwind config is specified in 'tailwind.config.ts'
- Use a modern color palette, ensuring that any user-facing text is readable and visible. Force the text colors everywhere to ensure only light mode is supported.

The UI screen consists of the follow sections:

Build just the UI portion, leaving TODOS in place of logic and user interactions.

Use the attached mockup as a guideline.

When the user opens the home page, CreateScreen should be shown.

Build the screens and functionality below, referring to the attached mockup.

## Navigation
- Create a persistent left sidebar with navigation options:
  - Create
  - Queue
  - Dashboard
  - Brand
  - Settings (added)
- Implement a top bar displaying the current screen name
- Ensure responsive design for mobile devices

## Create Screen
- Develop the main content creation interface:
  - Multi-line text input for original content
  - Platform selection via checkboxes (LinkedIn, Twitter, Facebook)
  - "Generate Content" button to trigger AI repurposing
- Implement error handling and input validation

## AI Content Generation
- Integrate OpenAI API for content repurposing
- When user clicks the "Generate Content" button, the app makes an API call to OpenAI ChatGPT to repurpose the text input into a Facebook social media post. The ChatGPT prompt should force the output to be in JSON format.
- There will be a different prompt for each social media platform.
- Implement a retry mechanism for API failures

## Content Display and Editing
- Show AI-generated content for each selected platform. In the right side, the app displays the results returned from ChatGPT:
  - facebook post
- Provide inline editing capabilities for generated content
- Implement character count and platform-specific limitations

## Advanced Prompt Editing
- Each result should have 2 buttons at the top: "Edit Prompt" and "Publish".
  - When user clicks "Edit Prompt", user sees a modal where they can edit the ChatGPT prompt and regenerate an output with the updated prompt.
  - When user clicks "Publish", user sees a modal asking to confirm publishing the content to that social media platform.

## Rules for AI
First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
- Confirm, then write code!
- Don't apologize for errors, fix them.
- Finish one file before the next.
- If you can't finish code, add TODO: comments.
- If needed, interrupt yourself and ask to continue.
- Return completely edited file.
- Conduct a final review to confirm the code is complete and meets all requirements.
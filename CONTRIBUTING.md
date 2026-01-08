# Contributing to Linear Standup

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your API keys
4. Run in development mode: `npm run dev`

## Project Structure

```
src/
├── index.ts          # CLI entry point
├── linear-client.ts  # Linear API integration
└── llm-client.ts     # OpenAI integration
```

## Making Changes

1. Make your changes in the `src/` directory
2. Build the project: `npm run build`
3. Test your changes: `npm run dev`
4. Ensure the code compiles without errors

## Code Style

- Use TypeScript
- Follow the existing code structure
- Add types for all functions and variables
- Keep functions focused and single-purpose

## Adding Features

Some ideas for future enhancements:
- Support for other LLM providers (Anthropic, local models)
- Different output formats (markdown, HTML, JSON)
- Custom prompt templates
- Task filtering by labels or projects
- Integration with other project management tools
- Scheduled runs (e.g., automatically post to Slack)

## Testing

Currently, the tool requires manual testing with real API keys. To test:

1. Set up your `.env` file with valid keys
2. Run `npm run dev`
3. Verify the output matches your Linear tasks
4. Check that the generated text is natural and readable

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with a clear description

## Questions?

Open an issue on GitHub if you have questions or suggestions!

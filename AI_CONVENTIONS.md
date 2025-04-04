## Goal
- Generate Model Context Protocol (MCP) server for Claude Desktop connecting to Google Calender using Google Calendar API
- Research documentation how can it be implemented
- Generate README.md file with instructions how to run server in prod and development/testing modes
- Typescript based with ES2022 target
- Structure code according to best practices
- Provide examples in README.md how useful server can be

## Code Style Guidelines
- **TypeScript**: Use strong typing, avoid `any`
- **Imports**: External dependencies first, then internal packages, then local imports
- **Classes**: Max 300 lines of code
- **Functions**: Max 35 lines of code
- **Naming**: PascalCase for classes/interfaces, camelCase for variables/functions
- **Composition**: Prefer small, composable functions and classes
- **Comments**: Avoid generic comments, only explain non-obvious solutions
- **APIs**: Use service classes with consistent error handling patterns
- **DRY**: Avoid duplication, extract common code into functions or classes
- **Structure**: Separate models, services, configuration
- **EditorConfig**: Follow .editorconfig rules

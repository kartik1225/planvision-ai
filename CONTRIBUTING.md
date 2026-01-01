# Contributing to PlanVision

Thank you for your interest in contributing to PlanVision! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment (see README.md)
4. Create a new branch for your feature or fix

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Commit Messages

Write clear, concise commit messages:

```
type: short description

Longer description if needed.
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Requests

1. Ensure your code follows the project's coding standards
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request with a clear description

## Code Style

### Backend (TypeScript/NestJS)

- Use TypeScript strict mode
- Follow NestJS conventions (modules, services, controllers)
- Use DTOs with class-validator decorators
- Document endpoints with Swagger decorators

### iOS (Swift/SwiftUI)

- Follow Swift naming conventions
- Use MVVM pattern for views
- Keep views small and focused
- Use @StateObject/@EnvironmentObject appropriately

### General

- Write self-documenting code
- Keep functions small and focused
- Add comments only when necessary to explain "why"

## Testing

### Backend

```bash
cd plan_vision_backend
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
```

### iOS

Run tests in Xcode with Cmd+U.

## Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, Xcode version, etc.)
- Screenshots if applicable

## Feature Requests

Feature requests are welcome! Please:

- Check existing issues first
- Describe the use case
- Explain why this feature would be useful
- Consider if it aligns with the project's goals

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

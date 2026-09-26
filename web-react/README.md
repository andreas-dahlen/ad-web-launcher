# Web React

The main web application for [ADWebLauncher](../README.md).

A React and TypeScript application developed as a standalone web application and compiled into a single HTML file for use inside the Android WebView.

## Contents

* [Overview](#overview)
* [Project Structure](#project-structure)
* [Application](#application)
* [Interaction System](#interaction-system)
* [Development Tooling](#development-tooling)
* [Testing](#testing)
* [Build](#build)

## Overview

`web-react` contains the main application as well as the development environment used to build, test, and maintain it.

The project has a strong focus on developer experience, code quality, and maintainability. Development tooling is kept alongside the application so that the environment can evolve together with the codebase.

## Project Structure

```text
web-react/
├── src/        # Application source
├── packages/   # Local packages
├── tools/      # Development tooling
├── scripts/    # Project scripts
├── docs/       # Documentation
└── analysis/   # Development and analysis material
```

## Application

The application is built with React and TypeScript.

UI components are responsible for rendering the interface, while application behaviour and user interactions are handled separately. This keeps interaction logic out of individual components and allows different elements to provide different behaviours.

## Interaction System

User interactions are handled through a shared pipeline:

```text
Input
  ↓
Intent
  ↓
Reaction
  ↓
Solver
  ↓
Dispatcher
  ↓
DOM
```

The intent phase determines what the user is doing.

The reaction phase determines what happens as a result.

This separation allows interaction behaviour to be shared across different UI elements while keeping the resolution of each interaction type independent.

The system currently supports interactions such as:

* Press
* Swipe
* Carousel
* Slider
* Drag

## Development Tooling

Development tooling is maintained as part of the project rather than being treated as a separate environment.

### Cascade

Cascade is the project's CSS tooling system.

It manages CSS variables and their priorities using token definitions and CSS analysis. It can generate CSS variables, metadata, and other files consumed by the application and development tools.

Cascade can be used through its CLI, Vite plugin, or Visual Studio Code extension.

### VS Code Extensions

The project contains custom Visual Studio Code extensions that provide development-time tooling and editor integrations.

### Linting

The project uses dedicated linting and code-quality tooling for the application and supporting packages.

## Testing

Tests are written with Vitest.

The repository contains separate test configurations for the application and supporting development tooling.

## Build

The application uses Vite and is configured to produce a single-file build for the Android WebView.

```text
React + TypeScript
        ↓
       Vite
        ↓
 Single HTML file
        ↓
 Android WebView
```

## Development

Common development tasks are defined in the `Justfile`.

Run `just --list` or `just --help` to see the available commands.

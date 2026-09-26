# ADWebLauncher

A WebView-based Android launcher with a React/TypeScript frontend.

The project is structured as a monorepo, separating the Android host application from the web application and its development tooling.

The main focus of the project is **developer experience, code quality, maintainability, and a flexible user interface**.

## Contents

* [Overview](#overview)
* [Repository](#repository)
* [Web Application](#web-application)
* [Interaction System](#interaction-system)
* [Development Tooling](#development-tooling)
* [Android Application](#android-application)
* [Build](#build)

## Overview

ADWebLauncher runs a web-based launcher interface inside an Android WebView.

The web application is developed with React and TypeScript and is compiled into a single file before being included in the Android application.

```text
                    ADWebLauncher
                         │
             ┌───────────┴───────────┐
             │                       │
        Android host             Web application
             │                       │
          WebView              React + TypeScript
                                     │
                                  Vite build
                                     │
                               Single HTML file
```

## Repository

```text
ad-web-launcher/
├── android/       # Android host application
├── web-react/     # Main web application
├── .github/       # CI and GitHub configuration
└── ...
```

### `android/`

The Android application provides the native environment for the launcher.

The compiled web application is packaged as an Android asset and loaded by the WebView.

### `web-react/`

The main application and development environment.

This contains the React/TypeScript application together with its build configuration, tests, documentation, and custom development tooling.

## Interaction System

The web application handles user interaction independently from the UI components that render it.

Interactions are interpreted according to the element being interacted with, allowing different elements to provide different behaviours.

The system currently supports interaction patterns such as:

* Buttons
* Carousels
* Sliders
* Drag interactions
* Scroll

## Development Tooling

`web-react/tools/` contains custom tooling developed alongside the application.

### Cascade

Cascade is a CSS tooling system for dynamically managing CSS variables and their priorities.

It uses PostCSS and JSON-based token definitions to analyse CSS and generate variables and supporting metadata.

Cascade can be used through:

* CLI
* Vite plugin
* Visual Studio Code extension

### VS Code Extensions

The project contains custom Visual Studio Code extensions that provide development-time tooling for the application and its CSS system.

### Linting and Code Quality

The project uses dedicated TypeScript, JavaScript, CSS, and build tooling to keep the application and supporting tools consistent and maintainable.

## Android Application

The Android project provides the native launcher environment.

The web application is built separately and packaged into the Android application as a single file:

```text
React / TypeScript
       │
       ▼
     Vite
       │
       ▼
 Single HTML file
       │
       ▼
 android/assets
       │
       ▼
     WebView
```

## Build

The main development workflow takes place inside `web-react`.

The frontend can be developed and tested independently, then compiled into the single-file application consumed by the Android project.

the main command structure is located in `web-react/Justfile` and uses scripts located in `web-react/scripts/` in order to provide a single entry point for all development and build tasks.

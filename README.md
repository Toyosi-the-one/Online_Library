# OnlineLibrary

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0 and also the CoverLibraryAPI.

## Development server

To start a local development server, run:

```bash
ng serve
```

DISCLAIMER EXTREMELY IMPORTANT TO ACTUALLY RUN IT AND HAVE IT WORK PROPERLY, DO:

```bash
ng serve --proxy.conf.json
```
This is to start the local development server setup with the proxy file created to bypass CORS restrictions. It was setup this way to avoid the use of a separate bsckend API to search for things like Book name,Book Title,Book Imsge etc.


Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

<!--## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources-->

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

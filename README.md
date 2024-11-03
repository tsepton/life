# Life

A naive web implementation of Conway's game of life. 

## Developing

Install dependencies with `npm install` (or `pnpm`, `yarn`, or whatever), and start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production ready built:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying

Branch master is automatically deployed on each new commit. Everything is set up within [a github action](./.github/workflows/main.yml) and is accessible at [tsepton.be/life](https://tsepton.be/life).


## Other

Built with Typescript and Svelte.
[MIT Licensed](./LICENSE). 
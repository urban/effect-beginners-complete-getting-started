import { Effect } from "effect";
import { PokeApi } from "./PokeApi";

/** Implementation from service**/
const program = Effect.gen(function* () {
  const pokeApi = yield* PokeApi;
  return yield* pokeApi.getPokemon;
});

/** Running effect **/
const runnable = program.pipe(Effect.provideService(PokeApi, PokeApiLive));

/** Error handling **/
const main = runnable.pipe(
  Effect.catchTags({
    FetchError: () => Effect.succeed("Fetch error"),
    JsonError: () => Effect.succeed("Json error"),
    ParseError: () => Effect.succeed("Parse error"),
  })
);

Effect.runPromise(main).then(console.log);

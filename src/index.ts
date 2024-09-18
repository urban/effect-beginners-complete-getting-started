import { Effect, Layer } from "effect";
import { BuildPokeApiUrl } from "./BuildPokeApiUrl";
import { PokeApi } from "./PokeApi";
import { PokeApiUrl } from "./PokeApiUrl";
import { PokemonCollection } from "./PokemonCollection";

/** Dependencies for program **/
const MainLayer = Layer.mergeAll(PokeApi.Live);

/** Implementation from service**/
const program = Effect.gen(function* () {
  const pokeApi = yield* PokeApi;
  return yield* pokeApi.getPokemon;
});

/** Running effect **/
const runnable = program.pipe(Effect.provide(MainLayer));

/** Error handling **/
const main = runnable.pipe(
  Effect.catchTags({
    FetchError: () => Effect.succeed("Fetch error"),
    JsonError: () => Effect.succeed("Json error"),
    ParseError: () => Effect.succeed("Parse error"),
  })
);

Effect.runPromise(main).then(console.log);

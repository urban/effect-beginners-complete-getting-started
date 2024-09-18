import { Context, Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import { FetchError, JsonError } from "./errors";
import { Pokemon } from "./schemas";
import { PokemonCollection } from "./PokemonCollection";
import { BuildPokeApiUrl } from "./BuildPokeApiUrl";

const make = Effect.gen(function* () {
  
  const pokemonCollection = yield* PokemonCollection; // 👈 Create dependency
  const buildPokeApiUrl = yield* BuildPokeApiUrl; // 👈 Create dependency

  return {
    getPokemon: Effect.gen(function* () {

      const requestUrl = buildPokeApiUrl({
        name: pokemonCollection[0],
      });

      const response = yield* Effect.tryPromise({
        try: () => fetch(requestUrl),
        catch: () => new FetchError(),
      });

      if (!response.ok) {
        return yield* new FetchError();
      }

      const json = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: () => new JsonError(),
      });

      return yield* Schema.decodeUnknown(Pokemon)(json);
    }),
  }
});
// Best practice is to use Content.Tag so you have both the value and the
// type in a single import.
export class PokeApi extends Context.Tag("PokeApi")<PokeApi, Effect.Effect.Success<typeof make>>() {
  // This is a recommended pattern allows for multiple implementations
  // (Live, Test, Mock) within a single import.
  static readonly Live = Layer.effect(this, make).pipe(
    // `provide` dependencies directly inside `Live`
    // 👇 `PokemonCollection` and `BuildPokeApiUrl` are provided from `PokeApi`
    Layer.provide(Layer.mergeAll(PokemonCollection.Live, BuildPokeApiUrl.Live)) 
  );

  static readonly Mock = Layer.succeed(
    this,
    PokeApi.of({
      getPokemon: Effect.succeed({
        id: 1,
        height: 10,
        weight: 10,
        name: "my-name",
        order: 1,
      }),
    })
  );
}

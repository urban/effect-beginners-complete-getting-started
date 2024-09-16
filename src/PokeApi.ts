import { Config, Context, Effect } from 'effect'
import { Schema } from '@effect/schema'
import type { ParseResult } from '@effect/schema'
import type { ConfigError } from 'effect/ConfigError'
import { FetchError, JsonError } from './errors'
import { Pokemon } from './schemas'

interface PokeApiImpl {
  readonly getPokemon: Effect.Effect<
    Pokemon,
    FetchError | JsonError | ParseResult.ParseError | ConfigError
  >;
}

// Best practice is to use Content.Tag so you have both the value and the 
// type in a single import.
export class PokeApi extends Context.Tag("PokeApi")<PokeApi, PokeApiImpl>() {
  // This is a recommended pattern allows for multiple implementations 
  // (Live, Test, Mock) within a single import.
  static readonly Live = PokeApi.of({
    getPokemon: Effect.gen(function* () {
      const baseUrl = yield* Config.string("BASE_URL");

      const response = yield* Effect.tryPromise({
        try: () => fetch(`${baseUrl}/api/v2/pokemon/garchomp/`),
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
  });
}

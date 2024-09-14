import { Schema } from "@effect/schema";
import { Data, Effect } from "effect";

/** Schema definition **/
class Pokemon extends Schema.Class<Pokemon>("Pokemon")({
  id: Schema.Number,
  order: Schema.Number,
  name: Schema.String,
  height: Schema.Number,
  weight: Schema.Number,
}) {}


/** Errors **/
class FetchError extends Data.TaggedError("FetchError")<{}> {}
class JsonError extends Data.TaggedError("JsonError")<{}> {}


/** Implementation **/
const fetchRequest = Effect.tryPromise({
  try: () => fetch("https://pokeapi.co/api/v2/pokemon/garchomp/"),
  catch: () => new FetchError(),
});

const jsonResponse = (response: Response) =>
  Effect.tryPromise({
    try: () => response.json(),
    catch: () => new JsonError(),
  });

const decodePokemon = Schema.decodeUnknown(Pokemon);

const program = Effect.gen(function* () {
  const response = yield* fetchRequest;
  if (!response.ok) {
    return yield* new FetchError();
  }

  const json = yield* jsonResponse(response);

  return yield* decodePokemon(json);
});


/** Error handling **/
const main = program.pipe(
  Effect.catchTags({
    FetchError: () => Effect.succeed("Fetch error"),
    JsonError: () => Effect.succeed("Json error"),
    ParseError: () => Effect.succeed("Parse error"),
  })
);


/** Running effect **/
Effect.runPromise(main).then(console.log);

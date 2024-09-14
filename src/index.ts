import { Effect, Data } from "effect";

class FetchError extends Data.TaggedClass("FetchError")<{}> {}
class JsonError extends Data.TaggedClass("JsonError")<{}> {}

const fetchRequest = Effect.tryPromise({
  try: () => fetch("https://pokeapi.co/api/v2/pokemon/garchomp/"),
  catch: () => new FetchError(),
});

const jsonResponse = (response: Response) =>
  Effect.tryPromise({
    try: () => response.json(),
    catch: (): JsonError => new JsonError(),
  });

const main = fetchRequest.pipe(
  Effect.filterOrFail(
    (response) => response.ok,
    () => new FetchError()
  ),
  Effect.flatMap(jsonResponse),
  Effect.catchTags({
    FetchError: () => Effect.succeed("Fetch error"),
    JsonError: () => Effect.succeed("Json error"),
  })
);

Effect.runPromise(main).then(console.log);

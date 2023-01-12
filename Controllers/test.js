import { runRawQuery } from "gtfs"

export async function test(req, res) {
  console.log("test")

  try {
    var result = await runRawQuery("PRAGMA table_info(stop_times);")
    console.log(result)

    console.log("test done")

    res.json({
      test: result,
    })
  } catch (e) {
    console.log(e)
  }
}

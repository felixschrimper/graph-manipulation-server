import { getAgencies } from "gtfs"

export async function agencies(req, res) {
  console.log("agencies")
  try {
    var result = await getAgencies()

    console.log("agencies done")

    res.json({
      agencies: result,
    })
  } catch (e) {
    console.log(e)
  }
}

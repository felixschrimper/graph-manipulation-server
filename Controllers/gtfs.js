import { exportGtfs, importGtfs } from "gtfs"
import { readFile } from "fs/promises"

const config = JSON.parse(
  await readFile(new URL("../Configs/gtfs-config.json", import.meta.url)),
)

export async function fetchgtfs(req, res) {
  console.log("fetchgtfs")

  let { url } = req.body
  config.agencies[0].url = url

  try {
    await importGtfs(config)

    console.log("fetchgtfs done")

    res.json({
      success: true,
    })
  } catch (e) {
    console.log(e)
    res.json({ success: false })
  }
}

export async function exportgtfs(req, res) {
  console.log("exportgtfs done")
  try {
    await exportGtfs(config)

    console.log("exportgtfs done")

    res.json({
      success: true,
    })
  } catch (e) {
    console.log(e)
    res.json({ success: false })
  }
}

import express from "express"
import { openDb } from "gtfs"
import { readFile } from "fs/promises"
import router from "./routes.js"
import cors from "cors"
import path from "path"
import bodyParser from "body-parser"

const app = express()
const port = 5001
app.listen(port, () => {
  console.log(`Now listening on port ${port}`)
})

const config = JSON.parse(
  await readFile(new URL("./Configs/gtfs-config.json", import.meta.url)),
)
const db = await openDb(config)

import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use("/", router)
app.use(
  "/gtfs-export",
  express.static(path.join(__dirname, "/gtfs-export/mvg_munchen")),
)

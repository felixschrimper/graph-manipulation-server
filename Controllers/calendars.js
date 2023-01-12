import { getCalendars, execRawQuery } from "gtfs"

export async function calendars(req, res) {
  console.log("calendars")
  const { serviceId } = req.query
  var sqlQuery = {}
  if (serviceId) {
    sqlQuery = { service_id: serviceId }
  }

  try {
    var result = await getCalendars(sqlQuery, [], [])

    console.log("calendars done")

    res.json({
      calendars: result,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

export async function editCalendar(req, res) {
  console.log("editCalendar")
  console.log(req.body)

  let { service_id } = req.body
  try {
    await updateCalendar(service_id, req.body)
    var result = await getCalendars({ service_id: service_id }, [], [])

    console.log("editCalendar done")
    res.json({
      calendars: result,
    })
  } catch (e) {
    console.log(e)
  }
}

export async function insertCalendar(serviceId, calendar) {
  console.log("insertCalendar")
  let {
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    start_date,
    end_date,
  } = calendar

  await execRawQuery(`
  INSERT INTO calendar 
      (service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, start_date, end_date) 
      VALUES ('${serviceId}', ${monday}, ${tuesday}, ${wednesday}, ${thursday}, ${friday}, ${saturday}, ${sunday}, ${start_date}, ${end_date});`)
}

export async function updateCalendar(serviceId, calendar) {
  console.log("updateCalendar")
  let {
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    start_date,
    end_date,
  } = calendar

  await execRawQuery(`
    UPDATE calendar 
    SET monday = ${monday}, tuesday = ${tuesday}, wednesday = ${wednesday}, thursday = ${thursday}, friday = ${friday}, 
    saturday = ${saturday}, sunday = ${sunday},
    start_date = ${start_date}, end_date = ${end_date}
    WHERE service_id = '${serviceId}';`)
}

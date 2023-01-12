import { getCalendarDates, execRawQuery } from "gtfs"

export async function calendarDates(req, res) {
  console.log("calendarDates")
  const { serviceId } = req.query
  var sqlQuery = {}
  if (serviceId) {
    sqlQuery = { service_id: serviceId }
  }

  try {
    var result = await getCalendarDates(sqlQuery, [], [])

    console.log("calendarDates done")

    res.json({
      calendarDates: result,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

export async function editCalendarDates(req, res) {
  console.log("editCalendarDates")
  console.log(req.body)

  let { serviceId, newCalendarDates } = req.body
  try {
    await deleteCalendarDates(serviceId)
    await insertCalendarDates(serviceId, newCalendarDates)
    var result = await getCalendarDates({ service_id: serviceId }, [], [])

    console.log("editCalendarDates done")

    console.log(result)
    res.json({
      calendarDates: result,
    })
  } catch (e) {
    console.log(e)
  }
}

export async function insertCalendarDates(serviceId, calendar_dates) {
  console.log("insertCalendarDates")
  if (calendar_dates.length > 0) {
    await execRawQuery(
      `INSERT INTO calendar_dates
        (service_id, date, exception_type)
        VALUES ` +
        calendar_dates.map((cD) => {
          return `('${serviceId}', ${cD.date}, ${cD.exception_type})`
        }) +
        `;`,
    )
  }
}

export async function deleteCalendarDates(serviceId) {
  console.log("deleteCalendarDates")
  await execRawQuery(
    `DELETE FROM calendar_dates WHERE service_id = '${serviceId}'`,
  )
}

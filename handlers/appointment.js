import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const appointment = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const { insuredId, scheduleId, countryISO } = body;

    // Validaciones básicas
    if (!insuredId || !scheduleId || !countryISO) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Solo PE o CL permitidos
    if (!["PE", "CL"].includes(countryISO)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid countryISO value" }),
      };
    }

    const appointmentId = uuidv4();

    const item = {
      appointmentId,
      insuredId,
      scheduleId,
      countryISO,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: process.env.APPOINTMENTS_TABLE,
        Item: item,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Appointment created", appointmentId }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
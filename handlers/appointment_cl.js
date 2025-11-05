import AWS from 'aws-sdk';
const eventbridge = new AWS.EventBridge();

export const handler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    console.log('Procesando cita CL:', message);

    // Aquí iría la lógica para guardar en MySQL RDS

    // Enviar confirmación al EventBridge
    await eventbridge.putEvents({
      Entries: [
        {
          Source: 'appointment.cl',
          EventBusName: process.env.EVENT_BUS_NAME,
          DetailType: 'AppointmentCompleted',
          Detail: JSON.stringify({
            appointmentId: message.appointmentId,
            insuredId: message.insuredId,
            countryISO: message.countryISO,
            status: 'completed',
          }),
        },
      ],
    }).promise();

    console.log('Evento enviado a EventBridge');
  }

  return { statusCode: 200 };
};
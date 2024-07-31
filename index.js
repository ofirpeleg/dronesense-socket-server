const WebSocket = require("ws");

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("A new client connected");
});

const generateRandomData = () => {
  // Generate random temperature between 20 and 25
  const temp = (Math.random() * 5 + 20).toFixed(2);
  // Generate random humidity between 60 and 70
  const humidity = (Math.random() * 10 + 60).toFixed(2);
  // Generate random accelerometer data between -1 and 1
  const accelX = (Math.random() * 2 - 1).toFixed(2);  
  const accelY = (Math.random() * 2 - 1).toFixed(2); 
  const accelZ = (Math.random() * 2 - 1).toFixed(2); 
  // Generate GPS data
  const gpsStart = [32.09078593263337, 34.803569407555365];
  const gpsPoints = [
    gpsStart,
    [32.090264, 34.803634],
    [32.090385, 34.803572],
    [32.090553, 34.803457],
    [32.090919, 34.803202],
    [32.090926, 34.802743],
    [32.090760, 34.802538],
    [32.090504, 34.802337],
    [32.089846, 34.802157],
    [32.089645, 34.802510],
    [32.089451, 34.803080]
  ];
  const gpsIndex = Math.floor(Math.random() * gpsPoints.length);
  const [latitude, longitude] = gpsPoints[gpsIndex];

  return {
    temp,
    humidity,
    accelX,
    accelY,
    accelZ,
    latitude,
    longitude,
  };
};

const sendDataToClients = (topic, data) => {
  const toSend = { topic };

  if (topic === "dronesense/temp-humidity") {
    toSend.temp = data.temp;
    toSend.humidity = data.humidity;
  } else if (topic === "dronesense/accelerometer") {
    toSend.x = data.accelX;
    toSend.y = data.accelY;
    toSend.z = data.accelZ;
  } else if (topic === "dronesense/gps") {
    toSend.lat = data.latitude;
    toSend.lon = data.longitude;
  }

  const message = JSON.stringify(toSend);
  console.log("Sending to frontend:", message);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const topics = ["dronesense/temp-humidity", "dronesense/accelerometer", "dronesense/gps"];
const data = generateRandomData();
let currentTopicIndex = 0;

const sendNextData = () => {
  sendDataToClients(topics[currentTopicIndex], data);
  currentTopicIndex = (currentTopicIndex + 1) % topics.length;
};

// Send random data for each topic to all connected clients every 10 seconds
setInterval(sendNextData, 10000);

console.log("WebSocket server running on ws://localhost:8080");

import connectDb from './db/connectToMongoDb.js';
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import studentRoutes from './routes/student.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import jobRoutes from './routes/job.routes.js';
import jobApplicationRoutes from './routes/jobApplication.routes.js';

const app = express();
const port = 3000;

dotenv.config({ path: './.env' });

connectDb().then(() => {
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true, limit: "16kb" }));

  app.use("/api/students", studentRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/organizations", organizationRoutes);
  app.use('/api/job',jobRoutes);
  app.use('/api/job',jobApplicationRoutes);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Failed to start the server due to database connection error:', error);
});
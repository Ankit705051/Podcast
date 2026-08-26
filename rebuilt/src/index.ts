
import express from "express";
import { globalrateLimiter } from "./middleware/rateLimiter.js";
import { securityMiddleare } from "./middleware/security.js";
import requestIdMiddleware from "./middleware/request-id.middeware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();

app.use(requestIdMiddleware);
securityMiddleare(app);
app.use(globalrateLimiter);





app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});
app.get("/ankit",(req,res)=>{
   res.json({message:"hello ankit "});
});


// routes 
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
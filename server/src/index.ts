import express from "express";
import cors from "cors";
import router from "./routers/router.js";

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Project Pickool Backend");
});

app.use("/api", router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
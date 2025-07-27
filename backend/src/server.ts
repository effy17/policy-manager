import app from "./app";
import dotenv from "dotenv";
import {sequelize} from "./utils/db";
dotenv.config();
const PORT = process.env.PORT || 4000;
sequelize.sync().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
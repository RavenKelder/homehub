import 'module-alias/register';
import express from "express";
import router from "./routes";

const port = process.env.PORT || "8080";

const app = express();

app.use(router);

app.listen(port, () => {
  console.log("Listening on port " + port.toString());
});

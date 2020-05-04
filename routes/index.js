const usersRoutes = require("./users");
const housesRoutes = require("./houses");
const commentsRoutes = require("./comments");

const constructorMethod = app => {
  app.use("/users", usersRoutes);
  app.use("/houses", housesRoutes);
  app.use("/comments", commentsRoutes);

  app.use("*", (req, res) => {
    res.redirect("/houses");
  });
};

module.exports = constructorMethod;

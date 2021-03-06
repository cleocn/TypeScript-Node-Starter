/**
 * Module dependencies.
 */
import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo";
import * as flash from "express-flash";
import * as path from "path";
import * as mongoose from "mongoose";
import * as passport from "passport";
import expressValidator = require("express-validator");
// 微信小程序 图片上传
const multer  = require("multer");
const upload = multer({ dest: path.join(__dirname, "./public/uploads/") });
const Raven = require("raven");
const git = require("git-rev-sync");
const MongoStore = mongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
const envPath = path.join(__dirname, "../config/.env" );
console.log("dotenv.config :", envPath);
dotenv.config({ path: envPath });

// Must configure Raven before doing anything else with it
console.log("SENTRY_DSN", process.env.SENTRY_DSN);
// Raven.config(process.env.SENTRY_DSN).install();
Raven.config(process.env.SENTRY_DSN,
{
  release: git.long()
}).install(function (err: any, initialErr: any, eventId: any) {
  console.log(err);
  // process.exit(1);
});

/**
 * Controllers (route handlers).
 */
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/api";
import * as contactController from "./controllers/contact";

import * as RecommendedController from "./controllers/recommended";
import * as WechatController from "./controllers/wechat";


/**
 * API keys and Passport configuration.
 */
import * as passportConfig from "./config/passport";
import { Request } from "_@types_express-serve-static-core@4.0.57@@types/express-serve-static-core";
import { Response } from "_@types_superagent@3.5.6@@types/superagent";

/**
 * Create Express server.
 */
const app = express();

// The request handler must be the first middleware on the app
// app.use(Raven.requestHandler());

/**
 * Connect to MongoDB.
 */
(<any>mongoose).Promise = global.Promise;
// (<any>mongoose).Promise = require("bluebird");  // promiseLibrary: require("bluebird")
const mongoUri = process.env.DOCKER_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGOLAB_URI ;
console.log("MONGODB:", mongoUri);
(<any>mongoose).connect(mongoUri, {useMongoClient: true});

mongoose.connection.on("error", () => {
  console.log("MongoDB connection error. Please make sure MongoDB is running.");
  process.exit();
});

/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: mongoUri, // process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== "/login" &&
      req.path !== "/signup" &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));


/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

app.get("/recommended", RecommendedController.getMyRecommendeds);
app.post("/recommended", RecommendedController.postRecommended);
app.get("/onLogin", userController.getonLogin);
app.post("/upload", upload.single("file"), RecommendedController.postUpload);
app.post("/getwxacodeunlimit", WechatController.getwxacodeunlimit);
app.get("/recommended/:id", RecommendedController.getRecommendedById);
app.delete("/recommended/:id", RecommendedController.delRecommendedById);

app.post("/wx/sendtemplatemsg", WechatController.postSendTemplateMsg);

/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  res.redirect(req.session.returnTo || "/");
});


/**
 * Error Handler. Provides full stack - remove for production
 */
// app.use(errorHandler(Raven.requestHandler));

// Optional fallthrough error handler
// app.use(function onError(err: any, req: Request, res: any, next: any) {
//   // The error id is attached to `res.sentry` to be returned
//   // and optionally displayed to the user for support.

//   Raven.captureException(err);
//   console.log("sentry ID:", res.sentry + "\n");
//   res.statusCode = 500;
//   // res.end(res.sentry + "\n");
//   res.end(JSON.stringify(err));
// });


/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
  console.log("  Press CTRL-C to stop\n");
});

module.exports = app;
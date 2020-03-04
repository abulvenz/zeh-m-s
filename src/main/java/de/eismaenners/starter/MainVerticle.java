package de.eismaenners.starter;

import static de.eismaenners.starter.JsonUtils.json;

import java.util.Arrays;
import java.util.function.Consumer;

import de.eismaenners.starter.auth.AuthRouter;
import de.eismaenners.starter.auth.CustomAuthHandler;
import de.eismaenners.starter.auth.UserService;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.mongo.MongoAuth;
import io.vertx.ext.bridge.PermittedOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.SessionHandler;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.sstore.LocalSessionStore;

public class MainVerticle extends AbstractVerticle {

  private MongoClient mongoClient;

  @Override
  public void start(Promise<Void> startPromise) throws Exception {

    Router router = Router.router(vertx);

    router.route().handler(BodyHandler.create());
    router.route().handler(BodyHandler.create());
    router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)));

    JsonObject config = new JsonObject();
    config.put("db_name", "360gradjava");
    this.mongoClient = MongoClient.create(vertx, config);

    JsonObject authProperties = json();
    MongoAuth authProvider = MongoAuth.create(mongoClient, authProperties) //
        .setUsernameCredentialField("email") //
        .setPasswordCredentialField("password") //
        .setCollectionName("users");

    createDefaultAdmin(authProvider);

    router.get("/").handler(context -> {
      context.reroute("/static/index.html");
    });

    router.route("/protected/*").handler(CustomAuthHandler.create(authProvider));
    BridgeOptions options = new BridgeOptions().addOutboundPermitted(new PermittedOptions().setAddress("news-feed"));

    SockJSHandler create = SockJSHandler.create(vertx);
    create.bridge(options, sock -> {

    });

    router.route("/protected/eventbus/*").handler(create);

    router.get("/protected/secret").handler(ctx -> {
      ctx.response().end(json().put("text", "This is secret").encode());
    });

    UserService userService = UserService.create(mongoClient);

    router.mountSubRouter("/auth", AuthRouter.create(vertx, userService, authProvider));

    router.route("/static/*").handler(StaticHandler.create("webroot").setCachingEnabled(false));

    vertx.createHttpServer().requestHandler(router).listen(8888, http -> {
      if (http.succeeded()) {
        startPromise.complete();
        System.out.println("HTTP server started on port 8888");
      } else {
        startPromise.fail(http.cause());
      }
    });
  }

  private void createDefaultAdmin(MongoAuth authProvider) {
    mongoClient.findOne("users", json().put("username", "admin"), json(), findUser -> {
      if (findUser.succeeded() && findUser.result() == null) {
        authProvider.insertUser("admin", "admin", Arrays.asList("admin"), Arrays.asList("defaultrole"), saveUser -> {
          if (saveUser.succeeded()) {
            System.out.println("User saved.");
          } else {
            System.err.println("User not saved.");
          }
        });
      }
    });
  }

  <T> Handler<AsyncResult<JsonObject>> mongoResult(Class<T> resultClass, Consumer<T> whenResult,
      Runnable whenNoResult) {

    return operation -> {
      if (operation.succeeded()) {
        try {
          T object = operation.result().mapTo(resultClass);
          whenResult.accept(object);
        } catch (Exception e) {
          whenNoResult.run();
        }
      } else {
        whenNoResult.run();
      }
    };
  }

}

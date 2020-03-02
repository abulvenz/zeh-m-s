package de.eismaenners.starter;

import static de.eismaenners.starter.JsonUtils.json;

import java.util.function.Consumer;

import de.eismaenners.starter.auth.AuthRouter;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.KeyStoreOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTAuthOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.JWTAuthHandler;
import io.vertx.ext.web.handler.StaticHandler;

public class MainVerticle extends AbstractVerticle {

  private JWTAuth authProvider;
  private MongoClient mongoClient;

  @Override
  public void start(Promise<Void> startPromise) throws Exception {

    Router router = Router.router(vertx);

    router.route().handler(BodyHandler.create());

    JWTAuthOptions authConfig = new JWTAuthOptions().setKeyStore(
        new KeyStoreOptions().setType("jceks").setPath("keystore.jceks").setPassword("U8JmZfBjuH7xGc3jdkpCBLBpwQ"));

    this.authProvider = JWTAuth.create(vertx, authConfig);

    JsonObject config = new JsonObject();
    config.put("db_name", "360gradjava");
    this.mongoClient = MongoClient.create(vertx, config);

    router.get("/").handler(context -> {
      context.reroute("/static/index.html");
    });

    router.route("/protected/*").handler(JWTAuthHandler.create(authProvider));

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
